import fs from 'node:fs';
import { execSync } from 'node:child_process';

const dataPath = 'src/data.ts';
const source = fs.readFileSync(dataPath, 'utf8');
const dataPattern = /export const mockPatterns: PatternGene\[] = (\[.*\]);\s*$/s;
const match = source.match(dataPattern);

if (!match) {
  throw new Error('Cannot locate mockPatterns array in src/data.ts');
}

const patterns = JSON.parse(match[1]);
let baselinePatterns = patterns;

try {
  const baselineSource = execSync(`git show HEAD:${dataPath}`, { encoding: 'utf8' });
  const baselineMatch = baselineSource.match(dataPattern);
  if (baselineMatch) {
    baselinePatterns = JSON.parse(baselineMatch[1]);
  }
} catch {
  baselinePatterns = patterns;
}

const baselineEraByCode = new Map(baselinePatterns.map((pattern) => [pattern.heCode, pattern.era]));
const baselinePatternByCode = new Map(baselinePatterns.map((pattern) => [pattern.heCode, pattern]));

function textOf(pattern) {
  return [
    pattern.name?.['zh-CN'],
    pattern.era,
    pattern.carrier,
    pattern.origin?.['zh-CN'],
    pattern.symbolism?.['zh-CN'],
    pattern.copyrightOwner,
  ].filter(Boolean).join(' ');
}

function normalizedEra(pattern) {
  const text = textOf(pattern);

  if (text.includes('二十大')) return '当代（2022年）';
  if (text.includes('第七届世界军人运动会') || text.includes('军运会')) return '当代（2019年）';
  if (text.includes('姜成国') || text.includes('黄春萍') || text.includes('王子怡') || text.includes('任本荣')) {
    return '当代';
  }
  if (text.includes('民国')) return '当代复原（参考民国）';
  if (text.includes('战国') || text.includes('楚墓') || text.includes('楚式') || text.includes('楚白虎')) {
    return '当代复原（参考战国）';
  }
  if (text.includes('先秦')) return '当代复原（参考先秦）';
  if (text.includes('明清')) return '当代复原（参考明清）';
  if (text.includes('清代')) return '当代复原（参考清代）';
  if (text.includes('汉剧') || text.includes('戏服') || text.includes('戏曲')) return '当代复原';
  if (text.includes('传统')) return '当代复原';
  if (text.includes('现代')) return '现代';
  return '当代';
}

const unrelatedEraTerms = [
  '高端',
  '礼品',
  '摆件',
  '绣片',
  '绣芯',
  '文创',
  '软装',
  '壁挂',
  '装饰',
  '台屏',
  '商务',
  '长辈',
  '书房',
  '茶室',
  '馈赠',
  '城市',
  '主题',
  '题材',
  '小品',
  '圆绣',
  '竖幅',
  '横向',
];

const changes = [];

for (const pattern of patterns) {
  const before = pattern.era;
  const after = normalizedEra(baselinePatternByCode.get(pattern.heCode) || pattern);
  if (before !== after) {
    pattern.era = after;
  }
}

for (const pattern of patterns) {
  const baselineEra = baselineEraByCode.get(pattern.heCode);
  if (baselineEra !== pattern.era) {
    changes.push({
      heCode: pattern.heCode,
      name: pattern.name?.['zh-CN'] || pattern.heCode,
      before: baselineEra || '',
      after: pattern.era,
    });
  }
}

const remainingIssues = patterns
  .filter((pattern) => unrelatedEraTerms.some((term) => String(pattern.era || '').includes(term)))
  .map((pattern) => ({
    heCode: pattern.heCode,
    name: pattern.name?.['zh-CN'] || pattern.heCode,
    era: pattern.era,
  }));

const duplicateHECodes = [];
const seenCodes = new Map();
for (const pattern of patterns) {
  if (seenCodes.has(pattern.heCode)) {
    duplicateHECodes.push([pattern.heCode, seenCodes.get(pattern.heCode), pattern.id]);
  } else {
    seenCodes.set(pattern.heCode, pattern.id);
  }
}

const missingRequired = [];
for (const pattern of patterns) {
  for (const field of ['heCode', 'name', 'imageUrl', 'era', 'carrier', 'region', 'craft', 'symbolism', 'origin']) {
    const value = pattern[field];
    const missing = typeof value === 'string'
      ? !value.trim()
      : !value || (typeof value === 'object' && !String(value['zh-CN'] || value.en || '').trim());
    if (missing) {
      missingRequired.push({ heCode: pattern.heCode, field });
    }
  }
}

const output = "import { PatternGene } from './types';\n\n"
  + 'export const mockPatterns: PatternGene[] = '
  + JSON.stringify(patterns, null, 2)
  + ';\n';

fs.writeFileSync(dataPath, output, 'utf8');

fs.mkdirSync('import-manifests', { recursive: true });
fs.writeFileSync(
  'import-manifests/era-normalization-audit.json',
  JSON.stringify({ changes, remainingIssues, duplicateHECodes, missingRequired }, null, 2),
  'utf8',
);
fs.writeFileSync(
  'import-manifests/era-normalization-audit.csv',
  [
    'heCode,name,before,after',
    ...changes.map((change) => [change.heCode, change.name, change.before, change.after]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(',')),
  ].join('\n') + '\n',
  'utf8',
);

console.log(JSON.stringify({
  updated: changes.length,
  remainingIssues: remainingIssues.length,
  duplicateHECodes: duplicateHECodes.length,
  missingRequired: missingRequired.length,
}));
