import fs from 'node:fs';
import { execSync } from 'node:child_process';

const dataPath = 'src/data.ts';
const source = fs.readFileSync(dataPath, 'utf8');
const dataPattern = /export const mockPatterns: PatternGene\[] = (\[.*\]);\s*$/s;
const match = source.match(dataPattern);
if (!match) throw new Error('Cannot locate mockPatterns array');

const patterns = JSON.parse(match[1]);
let baselinePatterns = patterns;

try {
  const baselineSource = execSync(`git show HEAD:${dataPath}`, { encoding: 'utf8' });
  const baselineMatch = baselineSource.match(dataPattern);
  if (baselineMatch) baselinePatterns = JSON.parse(baselineMatch[1]);
} catch {
  baselinePatterns = patterns;
}

const baselineSymbolismByCode = new Map(
  baselinePatterns.map((pattern) => [pattern.heCode, pattern.symbolism?.['zh-CN'] || '']),
);

const repairs = {
  'HE-N-B-M01': '狮子与绣球组合常用于表达纳福、喜庆与圆满。',
  'HE-H-S-M12': '鸳鸯与荷花组合常用于表达和合、美满。',
  'HE-N-L-R02': '荷花取清雅、高洁意象，归生活志趣类花卉小品。',
  'HE-N-B-M03': '金凤、和平鸽、牡丹与麦穗组合，表达祥瑞、安宁与丰收祝愿。',
  'HE-N-B-B04': '金龙戏珠与旭日、祥云组合，寓意祥瑞、兴盛与护佑。',
  'HE-H-L-M10': '楚凤、楚鹿与卷草云纹组合，体现荆楚审美与复古清赏。',
  'HE-N-B-M07': '荷塘花鸟与儿童围兜形制结合，表达平安、护佑与自然生趣。',
  'HE-N-B-R04': '松鼠与葡萄藤蔓组合，寓意丰收、多子与延绵。',
  'HE-H-S-R08': '黄鹤楼、双凤与楚纹组合，承载江城文脉与荆楚文化象征。',
  'HE-N-S-B04': '金凤与牡丹组合，承载祥瑞、富贵与非遗展陈意味。',
  'HE-N-B-M08': '锦鲤与银杏组合，寓意顺遂、富足与长久安康。',
  'HE-N-L-M08': '翠竹与绶带鸟组合，体现清雅、自然生趣。',
  'HE-N-B-B02': '绣球、蝴蝶与花叶组合，寓意圆满、美好。',
  'HE-H-L-M11': '青铜花觚与博古纹样组合，体现仿古清赏与生活志趣。',
  'HE-H-B-M01': '麒麟送子题材表达添丁、子嗣贤德与吉祥祝愿。',
};

for (const pattern of patterns) {
  const next = repairs[pattern.heCode];
  if (!next) continue;
  const before = pattern.symbolism?.['zh-CN'] || '';
  if (before !== next) {
    pattern.symbolism = {
      'zh-CN': next,
      en: next,
    };
  }
}

const changes = patterns
  .filter((pattern) => (baselineSymbolismByCode.get(pattern.heCode) || '') !== (pattern.symbolism?.['zh-CN'] || ''))
  .map((pattern) => ({
    heCode: pattern.heCode,
    name: pattern.name?.['zh-CN'] || pattern.heCode,
    before: baselineSymbolismByCode.get(pattern.heCode) || '',
    after: pattern.symbolism?.['zh-CN'] || '',
  }));

const output = "import { PatternGene } from './types';\n\n"
  + 'export const mockPatterns: PatternGene[] = '
  + JSON.stringify(patterns, null, 2)
  + ';\n';

fs.writeFileSync(dataPath, output, 'utf8');
fs.mkdirSync('import-manifests', { recursive: true });
fs.writeFileSync('import-manifests/symbolism-repair-audit.json', JSON.stringify({ changes }, null, 2), 'utf8');

console.log(JSON.stringify({ repaired: changes.length }));
