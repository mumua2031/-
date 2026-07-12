import fs from 'node:fs';

const dataPath = 'src/data.ts';
const source = fs.readFileSync(dataPath, 'utf8');
const match = source.match(/export const mockPatterns: PatternGene\[] = (\[.*\]);\s*$/s);

if (!match) {
  throw new Error('Cannot locate mockPatterns array in src/data.ts');
}

const patterns = JSON.parse(match[1]);

const patternLabels = {
  N: ['自然纹样 (N)', 'Nature Pattern (N)'],
  H: ['人文 / 民俗纹样 (H)', 'Humanities Pattern (H)'],
  G: ['几何 / 抽象纹样 (G)', 'Geometry Pattern (G)'],
};

const meaningLabels = {
  B: ['吉祥祈福类 (B)', 'Blessing (B)'],
  S: ['精神信仰类 (S)', 'Spiritual Belief (S)'],
  L: ['生活志趣类 (L)', 'Lifestyle (L)'],
};

const colorLabels = {
  R: ['红色系 (R)', 'Red (R)'],
  G: ['蓝绿色系 (G)', 'Blue-Green (G)'],
  B: ['蓝绿色系 (B)', 'Blue-Green (B)'],
  A: ['金色系 (A)', 'Gold (A)'],
  M: ['多色系 (M)', 'Multicolor (M)'],
};

function buildLabel(code, map) {
  const label = map[code];
  return label ? { 'zh-CN': label[0], en: label[1] } : null;
}

let updated = 0;

for (const pattern of patterns) {
  const nextLabels = [
    buildLabel(pattern.patternCategory, patternLabels),
    buildLabel(pattern.meaningCategory, meaningLabels),
    buildLabel(pattern.colorCategory, colorLabels),
  ].filter(Boolean);

  if (JSON.stringify(pattern.categoryLabels) !== JSON.stringify(nextLabels)) {
    pattern.categoryLabels = nextLabels;
    updated += 1;
  }
}

const output = "import { PatternGene } from './types';\n\n"
  + 'export const mockPatterns: PatternGene[] = '
  + JSON.stringify(patterns, null, 2)
  + ';\n';

fs.writeFileSync(dataPath, output, 'utf8');
console.log(JSON.stringify({ updated }));
