import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { mockPatterns } from '../src/data.js';
import { normalizePatternClassificationText } from '../src/lib/classification.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const multilingualFields = ['craft', 'symbolism', 'origin', 'scenario', 'literature'];
const previousCodeByCanonicalCode = {
  'HE-N-B-G14': 'HE-NB-B14',
  'HE-N-B-G13': 'HE-NB-B13',
  'HE-N-L-R01': 'HE-NL-B01',
  'HE-N-B-M12': 'HE-HS-M12',
  'HE-H-S-M04': 'HE-NS-M04',
  'HE-N-B-A13': 'HE-NL-A13',
  'HE-N-B-R21': 'HE-HB-R09',
  'HE-N-B-M22': 'HE-NL-M01',
  'HE-N-B-B12': 'HE-NS-B04',
  'HE-N-B-A14': 'HE-HL-A14',
  'HE-N-B-A12': 'HE-HB-A12',
  'HE-G-S-M02': 'HE-GB-M02',
  'HE-H-S-R19': 'HE-HB-R19',
  'HE-H-S-R20': 'HE-HB-R20',
  'HE-N-S-M02': 'HE-HS-M02',
  'HE-H-L-M04': 'HE-HS-M04',
  'HE-N-L-G01': 'HE-NB-G01',
  'HE-N-L-M12': 'HE-NB-M12',
};

function readBaselinePatterns() {
  try {
    const source = execFileSync('git', ['show', 'HEAD:src/data.js'], {
      cwd: root,
      encoding: 'utf8',
    });
    const match = source.match(/const mockPatterns = (\[.*\]);\s*export \{/s);
    return match ? JSON.parse(match[1]) : [];
  } catch {
    return [];
  }
}

function compactCode(code) {
  return String(code || '').replace(/^HE-([NHG])-([BSL])-/, 'HE-$1$2-');
}

function stringBody(value, escapeUnicode) {
  const jsonBody = JSON.stringify(value).slice(1, -1);
  if (!escapeUnicode) return jsonBody;
  return jsonBody.replace(/[^\x20-\x7e]/g, (character) =>
    [...character]
      .map((unit) => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase()}`)
      .join(''),
  );
}

function updateDataFile(relativePath, escapeUnicode) {
  const filePath = path.join(root, relativePath);
  let source = fs.readFileSync(filePath, 'utf8');
  const changes = [];

  for (const pattern of mockPatterns) {
    const normalized = normalizePatternClassificationText(pattern);
    const recordStart = source.indexOf(`"id": "${pattern.heCode}"`);
    if (recordStart < 0) throw new Error(`${relativePath} 未找到 ${pattern.heCode}`);
    let recordEnd = source.indexOf('\n  },', recordStart);
    if (recordEnd < 0) recordEnd = source.lastIndexOf('\n  }');
    if (recordEnd < 0) throw new Error(`${relativePath} 中 ${pattern.heCode} 记录不完整`);
    let record = source.slice(recordStart, recordEnd);

    const previousHeCode = previousCodeByCanonicalCode[pattern.heCode];
    if (previousHeCode && !record.includes('"previousHeCode"')) {
      record = record.replace(
        `"heCode": "${pattern.heCode}",`,
        `"heCode": "${pattern.heCode}",\n    "previousHeCode": "${previousHeCode}",`,
      );
    }

    for (const field of multilingualFields) {
      for (const language of Object.keys(pattern[field] || {})) {
        const before = pattern[field]?.[language] || '';
        const after = normalized[field]?.[language] || '';
        if (before === after) continue;

        const encodedBefore = stringBody(before, escapeUnicode);
        const encodedAfter = stringBody(after, escapeUnicode);
        if (!record.includes(encodedBefore)) {
          throw new Error(`${relativePath} 中 ${pattern.heCode}.${field}.${language} 未找到旧文本`);
        }
        record = record.replace(encodedBefore, encodedAfter);
        changes.push({ heCode: pattern.heCode, field, language, before, after });
      }
    }

    source = source.slice(0, recordStart) + record + source.slice(recordEnd);
  }

  fs.writeFileSync(filePath, source, 'utf8');
  return changes;
}

const tsChanges = updateDataFile('src/data.ts', false);
const jsChanges = updateDataFile('src/data.js', true);
if (tsChanges.length !== jsChanges.length) {
  throw new Error(`TypeScript 与 JavaScript 档案修改数量不一致：${tsChanges.length}/${jsChanges.length}`);
}

const baselinePatterns = readBaselinePatterns();
const baselineTextChanges = [];
for (const current of mockPatterns) {
  const previousCode = current.previousHeCode || compactCode(current.heCode);
  const baseline = baselinePatterns.find((pattern) =>
    pattern.heCode === previousCode || pattern.heCode === current.heCode,
  );
  if (!baseline) continue;
  for (const field of multilingualFields) {
    for (const language of Object.keys(current[field] || {})) {
      const before = baseline[field]?.[language] || '';
      const after = current[field]?.[language] || '';
      if (before !== after) baselineTextChanges.push({
        heCode: current.heCode,
        previousHeCode: baseline.heCode,
        field,
        language,
        before,
        after,
      });
    }
  }
}

const reportPath = path.join(root, 'import-manifests/classification-text-normalization.json');
let existingReport = null;
try {
  existingReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch {
  // The first run has no report to preserve.
}
const effectiveChanges = baselineTextChanges.length > 0
  ? baselineTextChanges
  : Array.isArray(existingReport?.changes)
    ? existingReport.changes
    : [];
const report = {
  generatedAt: existingReport?.generatedAt || new Date().toISOString(),
  refreshedAt: new Date().toISOString(),
  patternCount: mockPatterns.length,
  changedTextCountFromBaseline: effectiveChanges.length,
  changedTextCountThisRun: tsChanges.length,
  previousCodeAliasCount: Object.keys(previousCodeByCanonicalCode).length,
  changes: effectiveChanges,
};
fs.writeFileSync(
  reportPath,
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

console.log(JSON.stringify({
  patternCount: report.patternCount,
  changedTextCountFromBaseline: report.changedTextCountFromBaseline,
  changedTextCountThisRun: report.changedTextCountThisRun,
  previousCodeAliasCount: report.previousCodeAliasCount,
}, null, 2));
