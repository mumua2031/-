import { writeFileSync } from 'node:fs';
import { mockPatterns } from '../src/data';

const pendingSourceZh = '民间采集，出处待考';
const pendingSourceEn = 'Folk collection; source pending verification.';
const pendingCopyrightZh = '权属待确认，仅供非商用研究，风险自负';
const pendingInheritor = { 'zh-CN': '具体传承人不详', en: 'Specific inheritor unknown.' };

const common = {
  era: '当代采集，具体年代待考',
  region: '湖北武汉汉绣流布地区，具体采集地点待考',
};

const updates: Record<string, {
  era: string;
  region: string;
  carrier: string;
  craft: string;
  symbolism: string;
  literature: string;
}> = {
  'HE-HB-R16': {
    ...common,
    carrier: '人物题材绣品局部，具体载体待考',
    craft: '可见人物开脸与服饰局部刺绣特征；具体针法、用线和原件结构待实物或高清资料进一步核验。',
    symbolism: '禄星属于传统福禄寿人物题材，常与仕禄、福寿祝愿相关；本件仅据题名归入吉祥祈福类，具体故事出处待考。',
    literature: '纹样判定：《福禄图》禄星开脸人物局部，属于人文 / 民俗纹样；寓意判定：禄星题材通常关联福禄寿祝愿，按HE寓意分类归吉祥祈福类；色彩判定：画面以红色系为主，归红色系。',
  },
  'HE-NB-A02': {
    ...common,
    carrier: '盘金彩绣绣片，具体载体待考',
    craft: '题名显示含盘金和彩绣特征；可按金银线装饰与彩色丝线绣制方向记录，具体针法待实物核验。',
    symbolism: '凤凰为传统瑞鸟题材，常用于祥瑞、和美与富贵祝愿；本件按题名和HE编码归入吉祥祈福类。',
    literature: '纹样判定：凤凰纹，属于自然瑞兽纹样；寓意判定：凤凰题材常承载祥瑞、和美与富贵祝愿，归吉祥祈福类；色彩判定：题名含盘金，视觉归金银色系。',
  },
  'HE-NB-B05': {
    ...common,
    carrier: '青蓝底织物绣片，具体载体待考',
    craft: '可见单色花卉刺绣特征；具体针法待实物或高清资料进一步核验。',
    symbolism: '菊花为传统花卉题材，文献中常见高洁、长寿寓意；本件按题名和HE编码归入吉祥祈福类。',
    literature: '纹样判定：菊花，属于自然花卉纹样；寓意判定：菊花常见高洁、长寿寓意，归吉祥祈福类；色彩判定：青蓝单色为主，归蓝色系。',
  },
  'HE-NB-G01': {
    ...common,
    carrier: '绿色系织物绣片，具体载体待考',
    craft: '可见青蛙、水草等自然物象的彩色刺绣表现；具体针法待实物或高清资料进一步核验。',
    symbolism: '青蛙与水草构成自然生态题材；未见可确认的具体民俗释义，按项目HE编码暂归吉祥祈福类。',
    literature: '纹样判定：青蛙、水草，属于自然纹样；寓意判定：具体民俗释义待考，按HE寓意分类归吉祥祈福类；色彩判定：绿色占主视觉，归绿色系。',
  },
  'HE-NB-M10': {
    ...common,
    carrier: '蓝底多色织物绣片，具体载体待考',
    craft: '可见佛手、石榴等果实纹样的多色刺绣表现；具体针法待实物或高清资料进一步核验。',
    symbolism: '佛手、石榴属传统吉祥果实题材，可与多福、多子等祝愿相关；本件按题名归入吉祥祈福类。',
    literature: '纹样判定：佛手、石榴等三多题材，属于自然果实纹样；寓意判定：佛手、石榴常关联多福、多子等吉祥祝愿，归吉祥祈福类；色彩判定：蓝底配多色果实，归多色系。',
  },
  'HE-NB-M11': {
    ...common,
    carrier: '紫底多色织物绣片，具体载体待考',
    craft: '可见多色花卉刺绣特征；具体针法待实物或高清资料进一步核验。',
    symbolism: '菊花为传统花卉题材，文献中常见高洁、长寿寓意；本件按题名和HE编码归入吉祥祈福类。',
    literature: '纹样判定：秋菊，属于自然花卉纹样；寓意判定：菊花常见高洁、长寿寓意，归吉祥祈福类；色彩判定：紫底配多色花卉，归多色系。',
  },
  'HE-NB-M12': {
    ...common,
    carrier: '多色织物绣片，具体载体待考',
    craft: '可见蝴蝶、牵牛花等动植物纹样的多色刺绣表现；具体针法待实物或高清资料进一步核验。',
    symbolism: '蝴蝶在传统纹样中可作爱情、婚姻幸福、美满等象征；牵牛花具体寓意待考，本件按项目HE编码归入吉祥祈福类。',
    literature: '纹样判定：蝴蝶、牵牛花，属于自然动植物纹样；寓意判定：蝴蝶常关联美满、婚姻幸福等含义，牵牛花具体释义待考，按HE寓意分类归吉祥祈福类；色彩判定：紫彩与多色组合，归多色系。',
  },
  'HE-NB-R09': {
    ...common,
    carrier: '红色系织物绣片，具体载体待考',
    craft: '可见梅花枝干与花朵刺绣特征；具体针法待实物或高清资料进一步核验。',
    symbolism: '梅花有寒梅报春、梅开五福等传统寓意；本件按题名归入吉祥祈福类。',
    literature: '纹样判定：梅花枝，属于自然花卉纹样；寓意判定：梅花可寓寒梅报春、梅开五福，归吉祥祈福类；色彩判定：红色花枝为主视觉，归红色系。',
  },
  'HE-NB-R10': {
    ...common,
    carrier: '红色系织物绣片，具体载体待考',
    craft: '可见成对金鱼纹样的彩色刺绣表现；具体针法待实物或高清资料进一步核验。',
    symbolism: '金鱼因谐音常与金玉满堂、富足有余等吉祥寓意相关；成对金鱼也可表达和合、美满。',
    literature: '纹样判定：成对金鱼，属于自然动物纹样；寓意判定：金鱼常关联金玉满堂、富足有余等吉祥含义，归吉祥祈福类；色彩判定：红彩为主视觉，归红色系。',
  },
};

const sourcePendingPattern = /(出处待考|source pending|无法确认|待确认|暂不可考|不详|暂无资料|Folk collection)/i;
const copyrightPendingPattern = /(权属待确认|risk|pending verification|暂不明确|不授予商用授权|自行承担)/i;

let updatedDetailRecords = 0;
let normalizedSources = 0;
let normalizedCopyrights = 0;
let normalizedInheritors = 0;

for (const pattern of mockPatterns) {
  const patch = updates[pattern.heCode];
  if (patch) {
    pattern.era = patch.era;
    pattern.region = patch.region;
    pattern.carrier = patch.carrier;
    pattern.craft = { 'zh-CN': patch.craft, en: patch.craft };
    pattern.symbolism = { 'zh-CN': patch.symbolism, en: patch.symbolism };
    pattern.literature = { 'zh-CN': patch.literature, en: patch.literature };
    updatedDetailRecords += 1;
  }

  const originText = Object.values(pattern.origin || {}).join(' ');
  if (!originText.trim() || sourcePendingPattern.test(originText)) {
    if (pattern.origin?.['zh-CN'] !== pendingSourceZh || pattern.origin?.en !== pendingSourceEn) {
      pattern.origin = { 'zh-CN': pendingSourceZh, en: pendingSourceEn };
      normalizedSources += 1;
    }
  }

  const copyrightText = String(pattern.copyrightOwner || '');
  if (!copyrightText.trim() || copyrightPendingPattern.test(copyrightText)) {
    if (pattern.copyrightOwner !== pendingCopyrightZh) {
      pattern.copyrightOwner = pendingCopyrightZh;
      normalizedCopyrights += 1;
    }
  }

  const inheritorText = Object.values(pattern.inheritor || {}).join(' ');
  if (!inheritorText.trim() || /暂无|无|未详|none|unknown/i.test(inheritorText)) {
    pattern.inheritor = { ...pendingInheritor };
    normalizedInheritors += 1;
  }
}

const next = `import { PatternGene } from './types';\n\nexport const mockPatterns: PatternGene[] = ${JSON.stringify(mockPatterns, null, 2)};\n`;
writeFileSync('src/data.ts', next, 'utf8');

console.log(JSON.stringify({
  updatedDetailRecords,
  normalizedSources,
  normalizedCopyrights,
  normalizedInheritors,
}, null, 2));
