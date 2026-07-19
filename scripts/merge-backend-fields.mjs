import fs from 'node:fs';
import path from 'node:path';

if (process.env.ALLOW_LEGACY_ARCHIVE_REWRITE !== '1') {
  throw new Error('该脚本读取旧提取档案，已禁止直接重写主数据。请以 final-import-patterns.json 和 src/data.ts 为当前权威档案。');
}

const root = process.cwd();
const dataPath = path.join(root, 'src', 'data.ts');
const wordPath = path.join(root, 'import-manifests', 'word-records.json');
const extraPath = path.join(root, 'import-manifests', 'extra-word-records.json');
const parsedPath = path.join(root, 'import-manifests', 'parsed-doc-records-v2.json');
const fallbackPath = path.join(root, 'import-manifests', 'name-fallback-update-report.json');
const finalImportPath = path.join(root, 'import-manifests', 'final-import-patterns.json');
const auditJsonPath = path.join(root, 'import-manifests', 'backend-field-audit.json');
const auditCsvPath = path.join(root, 'import-manifests', 'backend-field-audit.csv');

const placeholder = '暂无资料';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function extractPatterns(source) {
  const start = source.indexOf('export const mockPatterns');
  const equals = source.indexOf('=', start);
  const arrayStart = source.indexOf('[', equals);
  const arrayEnd = source.lastIndexOf('];');
  if (start === -1 || equals === -1 || arrayStart === -1 || arrayEnd === -1) {
    throw new Error('Unable to locate mockPatterns array in src/data.ts');
  }
  return JSON.parse(source.slice(arrayStart, arrayEnd + 1));
}

function normalize(value) {
  return String(value || '')
    .replace(/[：:]+$/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function clean(value) {
  return String(value || '')
    .replace(/\*\*/g, '')
    .replace(/\s+\d+[.。]$/g, '')
    .replace(/[：:]+$/g, '')
    .trim();
}

function pick(fields, names) {
  for (const name of names) {
    if (fields[name]) return clean(fields[name]);
  }
  return '';
}

function pickStartsWith(fields, prefixes) {
  for (const prefix of prefixes) {
    const key = Object.keys(fields).find((candidate) => candidate.startsWith(prefix));
    if (key && fields[key]) return clean(fields[key]);
  }
  return '';
}

function ml(value) {
  const text = clean(value) || placeholder;
  return { 'zh-CN': text, en: text };
}

function parseFieldsFromBlock(block) {
  const fields = {};
  const rawBlock = String(block || '');
  const markdownPattern = /(?:^|\s)(?:\d+\.\s*)?\*\*([^*]+)\*\*[：:]?\s*([\s\S]*?)(?=\s+\d+\.\s*\*\*|$)/g;
  for (const match of rawBlock.matchAll(markdownPattern)) {
    const key = clean(match[1]);
    const value = clean(match[2]).replace(/\s+/g, ' ');
    if (key && value) fields[key] = value;
  }

  const normalizedBlock = rawBlock
    .replace(/\r/g, '\n')
    .replace(/##/g, '\n')
    .replace(/###/g, '\n')
    .replace(/\s+(\d+\.\s*\*\*)/g, '\n$1')
    .replace(/\s+([^\s：:]{2,12}[：:])/g, '\n$1');

  for (const rawLine of normalizedBlock.split('\n')) {
    const line = rawLine
      .replace(/^\s*\d+\.\s*/, '')
      .replace(/\*\*/g, '')
      .trim();
    const match = line.match(/^([^：:]{1,18})[：:]\s*(.+)$/);
    if (match) fields[clean(match[1])] = clean(match[2]);
  }
  return fields;
}

function similarity(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  const rightChars = new Set([...right]);
  const common = [...new Set([...left])].filter((char) => rightChars.has(char)).length;
  return common / Math.max(new Set([...left]).size, rightChars.size);
}

function findOriginalImageUrl(heCode) {
  const candidates = [
    path.join(root, 'public', 'patterns', `${heCode}.png`),
    path.join(root, 'public', 'patterns', `${heCode}.jpg`),
    path.join(root, 'public', 'patterns', `${heCode}.jpeg`),
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) return `/patterns-transparent/${heCode}.png`;
  return `/patterns/${path.basename(found)}`;
}

function buildLiterature(fields) {
  const patternBasis = pickStartsWith(fields, ['纹样大类 ']);
  const meaningBasis = pickStartsWith(fields, ['寓意大类 ']);
  const colorBasis = pickStartsWith(fields, ['色彩大类 ', '色系 ']);
  const parts = [
    patternBasis ? `纹样判定：${patternBasis}` : '',
    meaningBasis ? `寓意判定：${meaningBasis}` : '',
    colorBasis ? `色彩判定：${colorBasis}` : '',
  ].filter(Boolean);
  return parts.join('；') || placeholder;
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const source = fs.readFileSync(dataPath, 'utf8');
const patterns = extractPatterns(source);
const wordRecords = readJson(wordPath);
const extraRecords = readJson(extraPath);
const parsedRecords = readJson(parsedPath);
const fallbackReport = readJson(fallbackPath);
const finalImportRecords = readJson(finalImportPath);
const fallbackByCode = new Map((fallbackReport.patched || []).map((item) => [item.heCode, item]));
const finalImportByCode = new Map(finalImportRecords.map((item) => [item.heCode, item]));

const parsedCandidatesByCode = new Map();
for (const record of parsedRecords) {
  if (!record.code) continue;
  const fields = { ...record.fields, ...parseFieldsFromBlock(record.block) };
  if (!Object.keys(fields).length) continue;
  const candidates = parsedCandidatesByCode.get(record.code) || [];
  candidates.push({ ...record, fields });
  parsedCandidatesByCode.set(record.code, candidates);
}

function getRequiredCompleteness(fields) {
  return [
    pick(fields, ['作品标准名称', '标准名称', '标准名']),
    pick(fields, ['年代']),
    pick(fields, ['地域', '地区']),
    pick(fields, ['载体']),
    pick(fields, ['工艺']),
    pick(fields, ['来源']),
    pick(fields, ['版权状态', '版权', '版权说明']),
    pick(fields, ['文化解读']) || pickStartsWith(fields, ['寓意大类 ', '寓意 ', 'B', 'L', 'S']),
  ].filter(Boolean).length;
}

function getCandidateName(candidate) {
  return pick(candidate.fields || {}, ['作品标准名称', '标准名称', '标准名']) || candidate.title || '';
}

function getCandidateNameScore(candidate, targetName) {
  return Math.max(
    similarity(getCandidateName(candidate), targetName),
    similarity(candidate.title || '', targetName),
  );
}

function chooseBestCandidate(candidates, targetName) {
  if (!candidates.length) return null;
  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: getCandidateNameScore(candidate, targetName) * 1000 + getRequiredCompleteness(candidate.fields || {}),
      nameScore: getCandidateNameScore(candidate, targetName),
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0].nameScore >= 0.3 ? ranked[0].candidate : null;
}

function getAllCandidates(code) {
  const candidates = [];
  for (const record of wordRecords.filter((item) => item.rawHeCode === code)) {
    candidates.push({
      sourceType: 'word',
      backendCode: record.rawHeCode,
      title: record.title,
      fields: record.fields || {},
    });
  }
  for (const record of parsedCandidatesByCode.get(code) || []) {
    candidates.push({
      sourceType: 'parsed-doc',
      backendCode: record.code,
      title: record.title,
      fields: record.fields || {},
    });
  }
  return candidates;
}

function findWordRecord(pattern) {
  const finalImport = finalImportByCode.get(pattern.heCode);
  const targetName = finalImport?.name?.['zh-CN'] || pattern.name?.['zh-CN'] || pattern.heCode;
  return chooseBestCandidate(getAllCandidates(pattern.heCode), targetName);
}

function findDerivedWordRecord(pattern) {
  const fallback = fallbackByCode.get(pattern.heCode);
  if (!fallback) return null;
  const finalImport = finalImportByCode.get(pattern.heCode);
  const targetName = finalImport?.name?.['zh-CN'] || pattern.name?.['zh-CN'] || pattern.heCode;
  const matched = chooseBestCandidate(getAllCandidates(fallback.sourceCode), targetName);
  return matched ? { ...matched, derivedFrom: fallback.sourceCode } : null;
}

function resolveBackendRecord(pattern) {
  if (extraRecords[pattern.heCode]) {
    return {
      sourceType: 'extra-word',
      backendCode: pattern.heCode,
      title: extraRecords[pattern.heCode].title,
      fields: extraRecords[pattern.heCode].fields || {},
    };
  }

  const exactWord = findWordRecord(pattern);
  if (exactWord) {
    return {
      sourceType: exactWord.sourceType,
      backendCode: exactWord.backendCode,
      title: exactWord.title,
      fields: exactWord.fields || {},
    };
  }

  const derived = findDerivedWordRecord(pattern);
  if (derived) {
    return {
      sourceType: 'derived-word',
      backendCode: derived.backendCode,
      title: derived.title,
      fields: derived.fields || {},
      derivedFrom: derived.derivedFrom,
    };
  }

  return null;
}

const auditRows = [];

const patchedPatterns = patterns.map((pattern) => {
  const backend = resolveBackendRecord(pattern);
  const fields = backend?.fields || {};
  const finalImport = finalImportByCode.get(pattern.heCode);
  const standardName = pick(fields, ['作品标准名称', '标准名称', '标准名']) || finalImport?.name?.['zh-CN'] || pattern.name?.['zh-CN'] || pattern.heCode;
  const copyright = pick(fields, ['版权状态', '版权', '版权说明']);
  const inheritor = pick(fields, ['传承人资料', '传承人']);
  const culture = pick(fields, ['文化解读']);
  const meaningBasis = pickStartsWith(fields, ['寓意大类 ']) || pick(fields, ['寓意大类']);
  const patternCategory = pick(fields, ['纹样大类']);
  const meaningCategory = pick(fields, ['寓意大类']);
  const colorCategory = pick(fields, ['色彩大类']);

  const sourceValue = pick(fields, ['来源']) || `后台导入档案：${backend?.title || standardName}`;
  const copyrightValue = copyright || '版权信息待后台复核';
  const usedSourceFallback = !pick(fields, ['来源']);
  const usedCopyrightFallback = !copyright;

  const next = {
    ...pattern,
    name: {
      ...pattern.name,
      'zh-CN': standardName,
      en: standardName,
    },
    originalImageUrl: findOriginalImageUrl(pattern.heCode),
    categoryLabels: [patternCategory, meaningCategory, colorCategory].filter(Boolean).map(ml),
    era: pick(fields, ['年代']) || placeholder,
    carrier: pick(fields, ['载体']) || placeholder,
    region: pick(fields, ['地域', '地区']) || placeholder,
    copyrightOwner: copyrightValue,
    resolution: pattern.resolution && pattern.resolution !== placeholder ? pattern.resolution : '高清数字归档',
    craft: ml(pick(fields, ['工艺'])),
    symbolism: ml(culture || meaningBasis || pick(fields, ['寓意大类'])),
    origin: ml(sourceValue),
    scenario: ml(meaningBasis || culture),
    literature: ml(buildLiterature(fields)),
    inheritor: ml(inheritor || '暂无'),
  };

  const requiredFields = [
    ['name', next.name['zh-CN']],
    ['era', next.era],
    ['region', next.region],
    ['carrier', next.carrier],
    ['craft', next.craft['zh-CN']],
    ['origin', next.origin['zh-CN']],
    ['copyright', next.copyrightOwner],
    ['symbolism', next.symbolism['zh-CN']],
  ];
  const missingFields = requiredFields
    .filter(([, value]) => !value || value === placeholder)
    .map(([key]) => key);

  auditRows.push({
    heCode: pattern.heCode,
    frontendNameBefore: pattern.name?.['zh-CN'] || '',
    frontendNameAfter: next.name['zh-CN'],
    backendSource: backend?.sourceType || 'missing',
    backendCode: backend?.backendCode || '',
    backendTitle: backend?.title || '',
    derivedFrom: backend?.derivedFrom || '',
    imageUrl: next.imageUrl,
    imageExists: fs.existsSync(path.join(root, 'public', next.imageUrl.replace(/^\//, ''))),
    originalImageUrl: next.originalImageUrl,
    originalImageExists: fs.existsSync(path.join(root, 'public', next.originalImageUrl.replace(/^\//, ''))),
    missingFields: missingFields.join('|'),
    status: !backend
      ? 'MISSING_BACKEND_RECORD'
      : missingFields.length
        ? 'PARTIAL_FIELDS'
        : usedSourceFallback || usedCopyrightFallback
          ? 'REVIEW_SOURCE_OR_COPYRIGHT'
        : backend.sourceType === 'derived-word'
          ? 'REVIEW_DERIVED_CODE'
          : 'OK',
  });

  return next;
});

const output = `import { PatternGene } from './types';\n\nexport const mockPatterns: PatternGene[] = ${JSON.stringify(patchedPatterns, null, 2)};\n`;
fs.writeFileSync(dataPath, output, 'utf8');
fs.writeFileSync(auditJsonPath, JSON.stringify(auditRows, null, 2), 'utf8');

const csvHeaders = Object.keys(auditRows[0] || {});
const csv = [
  csvHeaders.join(','),
  ...auditRows.map((row) => csvHeaders.map((key) => csvEscape(row[key])).join(',')),
].join('\n');
fs.writeFileSync(auditCsvPath, `${csv}\n`, 'utf8');

const summary = auditRows.reduce(
  (acc, row) => {
    acc.total += 1;
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  },
  { total: 0 },
);

console.log(JSON.stringify(summary, null, 2));
