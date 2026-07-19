import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mockPatterns } from '../src/data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalPattern = /^HE-([NHG])-([BSL])-([RGBAM])(\d{2,})$/;
const compactPattern = /^HE-([NHG])([BSL])-([RGBAM])(\d{2,})$/;
const existingReportPath = path.join(root, 'import-manifests', 'he-code-normalization.json');

const isAlreadyNormalized = mockPatterns.every((pattern) => {
  const match = pattern.heCode.match(canonicalPattern);
  return Boolean(
    match &&
    match[1] === pattern.patternCategory &&
    match[2] === pattern.meaningCategory &&
    match[3] === pattern.colorCategory &&
    Number(match[4]) === Number(pattern.sequence),
  );
});

if (isAlreadyNormalized && fs.existsSync(existingReportPath)) {
  console.log(JSON.stringify({
    patternCount: mockPatterns.length,
    status: 'already-normalized',
    reportPreserved: path.relative(root, existingReportPath),
  }, null, 2));
  process.exit(0);
}

function buildCode(patternCategory, meaningCategory, colorCategory, sequence) {
  return `HE-${patternCategory}-${meaningCategory}-${colorCategory}${String(sequence).padStart(2, '0')}`;
}

function parseStoredCode(code) {
  const match = code.match(compactPattern) || code.match(canonicalPattern);
  if (!match) return null;
  return {
    patternCategory: match[1],
    meaningCategory: match[2],
    colorCategory: match[3],
    sequence: Number(match[4]),
  };
}

const unchanged = [];
const reclassified = [];

for (const pattern of mockPatterns) {
  const stored = parseStoredCode(pattern.heCode);
  if (!stored) throw new Error(`无法解析纹样编号：${pattern.heCode}`);

  const item = {
    oldCode: pattern.heCode,
    name: pattern.name?.['zh-CN'] || pattern.heCode,
    patternCategory: pattern.patternCategory,
    meaningCategory: pattern.meaningCategory,
    colorCategory: pattern.colorCategory,
    oldSequence: Number(pattern.sequence),
  };

  const classificationChanged =
    stored.patternCategory !== item.patternCategory ||
    stored.meaningCategory !== item.meaningCategory ||
    stored.colorCategory !== item.colorCategory ||
    stored.sequence !== item.oldSequence;

  (classificationChanged ? reclassified : unchanged).push(item);
}

const occupiedCodes = new Set(
  unchanged.map((item) =>
    buildCode(item.patternCategory, item.meaningCategory, item.colorCategory, item.oldSequence),
  ),
);

for (const item of reclassified) {
  let nextSequence = item.oldSequence;
  let nextCode = buildCode(item.patternCategory, item.meaningCategory, item.colorCategory, nextSequence);

  if (occupiedCodes.has(nextCode)) {
    const prefix = `HE-${item.patternCategory}-${item.meaningCategory}-${item.colorCategory}`;
    const groupSequences = [...occupiedCodes]
      .filter((code) => code.startsWith(prefix))
      .map((code) => Number(code.match(/(\d+)$/)?.[1] || 0));
    nextSequence = Math.max(0, ...groupSequences) + 1;
    nextCode = buildCode(item.patternCategory, item.meaningCategory, item.colorCategory, nextSequence);
  }

  occupiedCodes.add(nextCode);
  item.nextSequence = nextSequence;
  item.nextCode = nextCode;
}

const mappings = [
  ...unchanged.map((item) => ({
    ...item,
    nextSequence: item.oldSequence,
    nextCode: buildCode(item.patternCategory, item.meaningCategory, item.colorCategory, item.oldSequence),
  })),
  ...reclassified,
];

function updatePatternDataFile(relativePath) {
  const filePath = path.join(root, relativePath);
  let source = fs.readFileSync(filePath, 'utf8');

  for (const item of mappings.filter((mapping) => mapping.nextSequence !== mapping.oldSequence)) {
    const recordStart = source.indexOf(`"id": "${item.oldCode}"`);
    if (recordStart < 0) throw new Error(`${relativePath} 未找到 ${item.oldCode}`);
    const recordEnd = source.indexOf('\n  },', recordStart);
    if (recordEnd < 0) throw new Error(`${relativePath} 中 ${item.oldCode} 记录不完整`);
    const record = source
      .slice(recordStart, recordEnd)
      .replace(`"sequence": ${item.oldSequence}`, `"sequence": ${item.nextSequence}`);
    source = source.slice(0, recordStart) + record + source.slice(recordEnd);
  }

  for (const item of mappings) source = source.replaceAll(item.oldCode, item.nextCode);
  fs.writeFileSync(filePath, source, 'utf8');
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

updatePatternDataFile('src/data.ts');
updatePatternDataFile('src/data.js');

const excludedRuntimeFiles = new Set([
  path.join(root, 'src/lib/classification.ts'),
  path.join(root, 'src/lib/classification.js'),
  path.join(root, 'src/data.ts'),
  path.join(root, 'src/data.js'),
]);

for (const filePath of walk(path.join(root, 'src'))) {
  if (excludedRuntimeFiles.has(filePath) || !/\.(?:ts|tsx|js|jsx)$/.test(filePath)) continue;
  const source = fs.readFileSync(filePath, 'utf8');
  let updated = source;
  for (const item of mappings) updated = updated.replaceAll(item.oldCode, item.nextCode);
  if (updated !== source) fs.writeFileSync(filePath, updated, 'utf8');
}

const duplicateCodes = mappings
  .map((item) => item.nextCode)
  .filter((code, index, codes) => codes.indexOf(code) !== index);
if (duplicateCodes.length > 0) throw new Error(`规范化后仍有重复编号：${[...new Set(duplicateCodes)].join('、')}`);

const report = {
  generatedAt: new Date().toISOString(),
  patternCount: mappings.length,
  reclassifiedCount: reclassified.length,
  collisionsResolved: mappings
    .filter((item) => item.nextSequence !== item.oldSequence)
    .map((item) => ({
      oldCode: item.oldCode,
      nextCode: item.nextCode,
      oldSequence: item.oldSequence,
      nextSequence: item.nextSequence,
      name: item.name,
    })),
  mappings: mappings.map((item) => ({
    oldCode: item.oldCode,
    nextCode: item.nextCode,
    name: item.name,
  })),
};

const reportPath = path.join(root, 'import-manifests/he-code-normalization.json');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
