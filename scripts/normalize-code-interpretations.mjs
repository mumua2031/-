import fs from 'node:fs';
import { execSync } from 'node:child_process';

const dataPath = 'src/data.ts';
const visualPath = 'src/generated/pattern-visual-analysis.ts';

const dataSource = fs.readFileSync(dataPath, 'utf8');
const dataMatch = dataSource.match(/export const mockPatterns: PatternGene\[] = (\[.*\]);\s*$/s);
if (!dataMatch) throw new Error('Cannot locate mockPatterns array');

const visualSource = fs.readFileSync(visualPath, 'utf8');
const visualMatch = visualSource.match(/export const patternVisualAnalysis: Record<string, PatternVisualAnalysis> = (\{.*\});\s*$/s);
if (!visualMatch) throw new Error('Cannot locate patternVisualAnalysis map');

const patterns = JSON.parse(dataMatch[1]);
const visualAnalysis = JSON.parse(visualMatch[1]);
let baselinePatterns = patterns;

try {
  const baselineSource = execSync(`git show HEAD:${dataPath}`, { encoding: 'utf8' });
  const baselineMatch = baselineSource.match(/export const mockPatterns: PatternGene\[] = (\[.*\]);\s*$/s);
  if (baselineMatch) baselinePatterns = JSON.parse(baselineMatch[1]);
} catch {
  baselinePatterns = patterns;
}

const baselineLiteratureByCode = new Map(
  baselinePatterns.map((pattern) => [pattern.heCode, pattern.literature?.['zh-CN'] || '']),
);

const patternCategoryLabels = {
  N: '自然纹样',
  H: '人文 / 民俗纹样',
  G: '几何 / 抽象纹样',
};

const meaningCategoryLabels = {
  B: '吉祥祈福类',
  S: '精神信仰类',
  L: '生活志趣类',
};

const colorCategoryLabels = {
  R: '红色系',
  G: '绿色系',
  B: '蓝色系',
  A: '金银色系',
  M: '多色系',
};

const motifRules = [
  { key: '龙凤', terms: ['龙凤'], pattern: '龙凤', meaning: '寓意祥瑞圆满' },
  { key: '双龙', terms: ['双龙'], pattern: '双龙、祥云', meaning: '寓意护佑、福寿与圆满' },
  { key: '龙', terms: ['龙', '祥龙', '金龙', '团龙', '正龙'], pattern: '龙、祥云', meaning: '寓意祥瑞、护佑与兴盛' },
  { key: '凤凰', terms: ['凤凰', '彩凤', '丹凤', '金凤', '凤鸟', '楚凤', '凤'], pattern: '凤凰、花草或云纹', meaning: '寓意祥瑞、美好与兴盛' },
  { key: '黄鹤楼', terms: ['黄鹤楼', '楼'], pattern: '黄鹤楼、云鹤或山水', meaning: '承载武汉地域文化记忆' },
  { key: '鹤', terms: ['仙鹤', '双鹤', '群鹤', '八鹤', '鹤'], pattern: '仙鹤、云纹或日月意象', meaning: '寓意长寿、清雅与安康' },
  { key: '狮', terms: ['双狮', '狮'], pattern: '狮子、绣球', meaning: '寓意纳福、喜庆与护佑' },
  { key: '麒麟', terms: ['麒麟'], pattern: '麒麟、人物或花草', meaning: '寓意添丁、仁德与吉祥' },
  { key: '牡丹', terms: ['牡丹', '国色天香'], pattern: '牡丹、花叶', meaning: '寓意富贵、繁荣与圆满' },
  { key: '荷花', terms: ['荷花', '粉荷', '荷塘', '莲', '湘莲'], pattern: '荷花、莲叶或水禽', meaning: '寓意和美、清雅与生生不息' },
  { key: '鸳鸯', terms: ['鸳鸯'], pattern: '鸳鸯、荷花', meaning: '寓意夫妻和合、婚姻美满' },
  { key: '蝙蝠', terms: ['蝙蝠', '五福'], pattern: '蝙蝠、寿字或花果', meaning: '寓意福寿、纳福与安康' },
  { key: '寿', terms: ['寿', '福寿', '捧寿', '献寿'], pattern: '寿字、花果或祥瑞纹样', meaning: '寓意长寿、安康与福寿双全' },
  { key: '福', terms: ['福字', '福'], pattern: '福字、花卉或蝙蝠', meaning: '寓意纳福、喜庆与平安' },
  { key: '绣球', terms: ['绣球'], pattern: '绣球、花叶', meaning: '寓意圆满与喜庆' },
  { key: '蝴蝶', terms: ['蝴蝶', '彩蝶', '蝶恋花', '蝶'], pattern: '蝴蝶、花叶', meaning: '寓意美好与自然生趣' },
  { key: '喜鹊', terms: ['喜鹊'], pattern: '喜鹊、银杏或花叶', meaning: '寓意喜事、吉庆与顺遂' },
  { key: '锦鲤', terms: ['锦鲤'], pattern: '锦鲤、花叶', meaning: '寓意顺遂、富足与吉庆' },
  { key: '松鼠葡萄', terms: ['松鼠', '葡萄'], pattern: '松鼠、葡萄藤蔓', meaning: '寓意多子、丰收与延绵' },
  { key: '绶带鸟', terms: ['绶带鸟'], pattern: '绶带鸟、竹', meaning: '寓意清雅与自然生趣' },
  { key: '竹', terms: ['翠竹', '竹'], pattern: '竹、鸟', meaning: '寓意清雅、坚贞与生活志趣' },
  { key: '人物', terms: ['人物', '罗汉', '尊者', '麻姑'], pattern: '人物、宗教或民俗故事元素', meaning: '承载人物故事、信仰或民俗叙事' },
  { key: '白虎', terms: ['白虎', '虎'], pattern: '虎、云纹或楚式装饰', meaning: '承载楚文化图腾与守护意味' },
  { key: '花鸟', terms: ['花鸟', '蝶恋花', '百花', '繁花', '花卉', '蝴蝶', '锦鸡'], pattern: '花鸟、蝶或草木', meaning: '寓意美好、富贵与自然生趣' },
  { key: '器物', terms: ['花觚', '青铜'], pattern: '器物、回纹或博古纹样', meaning: '承载博古清赏与生活志趣' },
  { key: '几何', terms: ['回纹', '几何'], pattern: '几何或抽象装饰纹样', meaning: '用于组织秩序和装饰节奏' },
];

function compactText(pattern) {
  return pattern.name?.['zh-CN'] || '';
}

function findMotifRules(pattern) {
  const text = compactText(pattern);
  let matches = [];
  for (const rule of motifRules) {
    if (rule.terms.some((term) => text.includes(term))) matches.push(rule);
  }
  const keys = new Set(matches.map((rule) => rule.key));
  matches = matches.filter((rule) => {
    if (rule.key === '龙' && (keys.has('双龙') || keys.has('龙凤'))) return false;
    if (rule.key === '凤凰' && keys.has('龙凤')) return false;
    if (rule.key === '竹' && keys.has('绶带鸟')) return false;
    return true;
  });
  const seen = new Set();
  return matches.filter((rule) => {
    if (seen.has(rule.key)) return false;
    seen.add(rule.key);
    return true;
  });
}

function joinUnique(values, max = 3) {
  const output = [];
  for (const value of values) {
    if (value && !output.includes(value)) output.push(value);
    if (output.length >= max) break;
  }
  return output.join('、');
}

function joinMotifPatterns(rules) {
  const specificKeys = new Set(rules.map((rule) => rule.key));
  const components = [];
  for (const rule of rules) {
    if (rule.key === '龙' && (specificKeys.has('双龙') || specificKeys.has('龙凤'))) continue;
    if (rule.key === '凤凰' && specificKeys.has('龙凤')) continue;
    for (const component of rule.pattern.split('、')) {
      const clean = component.trim();
      if (clean && !components.includes(clean)) components.push(clean);
      if (components.length >= 4) break;
    }
    if (components.length >= 4) break;
  }
  return components.join('、');
}

function patternJudgement(pattern, rules) {
  const category = patternCategoryLabels[pattern.patternCategory] || '';
  const motifs = joinMotifPatterns(rules);
  if (motifs) return `纹样判定：${motifs}，属于${category}`;
  return `纹样判定：按HE分类归为${category}`;
}

function meaningJudgement(pattern, rules) {
  const category = meaningCategoryLabels[pattern.meaningCategory] || '';
  const alignedRules = rules.filter((rule) => {
    if (pattern.meaningCategory === 'B') return !['黄鹤楼', '人物', '白虎', '器物', '竹', '几何'].includes(rule.key);
    if (pattern.meaningCategory === 'S') return ['黄鹤楼', '人物', '白虎'].includes(rule.key);
    if (pattern.meaningCategory === 'L') return ['器物', '竹', '花鸟'].includes(rule.key);
    return false;
  });
  const meanings = joinUnique(alignedRules.map((rule) => rule.meaning), 2);
  if (meanings) return `寓意判定：${meanings}，属于${category}`;
  return `寓意判定：按HE寓意分类归为${category}`;
}

function colorJudgement(pattern) {
  const category = colorCategoryLabels[pattern.colorCategory] || '';
  const ratio = visualAnalysis[pattern.heCode]?.mainColorRatio?.['zh-CN'] || '';
  if (ratio && !ratio.includes('待')) return `色彩判定：主色比例为${ratio}，归${category}`;
  return `色彩判定：按HE色彩分类归${category}`;
}

const changes = [];
const suspectedSymbolismMismatches = [];

for (const pattern of patterns) {
  const rules = findMotifRules(pattern);
  const after = `${patternJudgement(pattern, rules)}；${meaningJudgement(pattern, rules)}；${colorJudgement(pattern)}`;

  pattern.literature = {
    'zh-CN': after,
    en: after,
  };

  const name = pattern.name?.['zh-CN'] || '';
  const symbolism = pattern.symbolism?.['zh-CN'] || '';
  const nameRules = motifRules.filter((rule) => rule.terms.some((term) => name.includes(term)));
  const symbolismHasNameMotif = nameRules.length === 0 || nameRules.some((rule) => rule.terms.some((term) => symbolism.includes(term)));
  if (!symbolismHasNameMotif) {
    suspectedSymbolismMismatches.push({
      heCode: pattern.heCode,
      name,
      symbolism,
    });
  }
}

for (const pattern of patterns) {
  const before = baselineLiteratureByCode.get(pattern.heCode) || '';
  const after = pattern.literature?.['zh-CN'] || '';
  if (before !== after) {
    changes.push({
      heCode: pattern.heCode,
      name: pattern.name?.['zh-CN'] || pattern.heCode,
      before,
      after,
    });
  }
}

const output = "import { PatternGene } from './types';\n\n"
  + 'export const mockPatterns: PatternGene[] = '
  + JSON.stringify(patterns, null, 2)
  + ';\n';

fs.writeFileSync(dataPath, output, 'utf8');

fs.mkdirSync('import-manifests', { recursive: true });
const audit = {
  changes,
  suspectedSymbolismMismatches,
  sourceNotes: [
    '公开资料显示：汉绣为国家级非物质文化遗产代表性项目，编号Ⅶ—75，申报地区为湖北省武汉市江汉区。',
    '公开资料显示：汉绣常见针法包括铺、平、织、间、压、缆、掺、盘、套、垫、锁、扣等，工艺审美强调色彩浓艳、层次分明。',
    '传统纹样寓意仅采用龙凤、仙鹤、牡丹、荷花、蝙蝠、寿字、鸳鸯等常见符号的保守解释；未核实到作品专属资料时，不写专属作者、年代或来源判断。',
  ],
};
fs.writeFileSync('import-manifests/code-interpretation-audit.json', JSON.stringify(audit, null, 2), 'utf8');
fs.writeFileSync(
  'import-manifests/code-interpretation-audit.csv',
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
  suspectedSymbolismMismatches: suspectedSymbolismMismatches.length,
}));
