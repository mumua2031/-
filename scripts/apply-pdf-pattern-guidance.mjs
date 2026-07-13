import fs from 'node:fs';
import { execSync } from 'node:child_process';

const dataPath = 'src/data.ts';
const visualPath = 'src/generated/pattern-visual-analysis.ts';
const notesPath = 'import-manifests/hanxiu-pattern-pdf-notes.json';
const auditPath = 'import-manifests/pdf-pattern-guidance-audit.json';

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

const beforeByCode = new Map(
  baselinePatterns.map((pattern) => [
    pattern.heCode,
    {
      symbolism: pattern.symbolism?.['zh-CN'] || '',
      literature: pattern.literature?.['zh-CN'] || '',
    },
  ]),
);

const pdfNotes = [
  {
    page: 1,
    topic: '植物与花卉',
    notes: [
      '牡丹在汉绣纹样中使用频繁，象征富贵。',
      '梅花有寒梅报春与梅开五福之意，五福包括快乐、幸福、长寿、顺利、和平。',
      '兰花为花中四君子之一，象征高贵；与竹、松等组合可寓友情长久。',
      '菊花常用来比喻长寿。',
    ],
  },
  {
    page: 2,
    topic: '植物、动物与动植物组合',
    notes: [
      '莲花象征纯洁高雅；莲与童子、官帽、并蒂莲等组合可表达不同吉祥含义。',
      '桃子是长寿的象征。',
      '龙在传统图案中为神物，也可表示身份、喜庆丰收；龙凤组合象征婚姻幸福美满、阴阳调和。',
      '鱼类图案寓意吉祥富贵，鲤鱼有跃龙门之意，金鱼象征多金多财。',
      '蝴蝶可作为爱情、婚姻幸福、美满的象征。',
      '喜鹊在传统图案中被视为吉祥小鸟，有喜事上门之意。',
    ],
  },
  {
    page: 3,
    topic: '瑞兽与福禄寿意象',
    notes: [
      '麒麟是古代神兽，被认为有瑞祥之气，也有驱邪祈福、镇宅之意。',
      '虎、鹿、松等可组成福禄寿意象，鹿谐音禄，松象征寿。',
      '鹤是长寿事物的象征，可与松、龟等组成祝寿题材。',
      '凤用于象征祥瑞，凤凰与牡丹组合寓意荣华富贵。',
      '蝙蝠因蝠与福谐音，常作为吉祥物；蝙蝠与流云可成流云百福，与寿桃可成福寿双全。',
      '大象因象与祥谐音，寓意吉祥。',
      '九头鸟又称九凤，是战国时期楚国先祖崇拜的神鸟。',
    ],
  },
  {
    page: 4,
    topic: '人物故事及佛教图案、物体',
    notes: [
      '人物图案来源包括神话人物、历史典故、戏曲故事和日常生活。',
      '麻姑献寿取长寿仙女题材。',
      '送子观音是佛教观音菩萨题材，百子迎福表达多子多孙、人丁兴旺。',
      '物体图案多表现民俗，瓶、三戟、书箱、石榴、桃子、佛手等可组成谐音或祝愿图案。',
    ],
  },
  {
    page: 5,
    topic: '轿子、船、博古图与绣字',
    notes: [
      '轿子四面常设吉祥图案，莲花与莲蓬可代表连生贵子，蝙蝠谐音福来，桃子表示长寿。',
      '船寓意一帆风顺、同舟共济、传宗接代。',
      '博古图寓意文采高雅、通晓古今、趋吉避凶、富贵吉祥。',
      '福字寓意幸福和福气；五福为长寿、富贵、康宁、好德、善终。',
    ],
  },
  {
    page: 6,
    topic: '汉绣基本针法',
    notes: [
      '齐针是最简单、最基本、使用率最频繁的汉绣针法，完成后达到齐、平、顺的效果。',
      '锁针绣由绣线环圈锁套连接而成，可大面积使用，也可作装饰轮廓线。',
      '辫子绣可作为整个图案使用，也可用作图案勾边。',
    ],
  },
  {
    page: 7,
    topic: '汉绣基本针法',
    notes: [
      '打籽针常用于表现花瓣花蕊，形成小疙瘩状的立体效果。',
      '套针绣多用于海浪、龙纹和须发，线条交叉重叠且不露底。',
      '掺针绣多用于花瓣和叶子，可通过深浅色线过渡形成调和效果。',
      '盘金绣使用金线，将两根金线并置后以细线钉补在面料表面。',
    ],
  },
  {
    page: 8,
    topic: '汉绣图案构图',
    notes: [
      '汉绣构图与产品相关，常见产品包括服饰、生活日用品和佛教民俗用品。',
      '挂幅、屏风、佛像等欣赏性物品的构图与绘画构图类似，可分为规整构图和自由表现构图。',
    ],
  },
  {
    page: 9,
    topic: '全景构图',
    notes: [
      '全景构图将刺绣对象放入固定形状内，图案铺满、内容丰富，常以花卉纹样为主。',
    ],
  },
  {
    page: 10,
    topic: '字形与几何构图',
    notes: [
      '“十”字形构图可按直十字或斜十字组织物体对象。',
      '垂直构图可由单个或多个垂直形态组成。',
      '三角形构图使画面稳定，并有向上延伸趋势。',
    ],
  },
];

const pdfMotifRules = [
  {
    key: '龙凤',
    terms: ['龙凤'],
    pattern: '龙凤',
    meaning: '象征婚姻幸福美满、阴阳调和',
    sourcePages: [2],
  },
  {
    key: '双龙',
    terms: ['双龙'],
    pattern: '双龙、祥云',
    meaning: '以龙的祥瑞意象配合祝寿主题',
    sourcePages: [2],
  },
  {
    key: '龙',
    terms: ['龙', '祥龙', '金龙', '团龙', '正龙'],
    pattern: '龙、祥云或火焰纹',
    meaning: '象征祥瑞、喜庆丰收与身份秩序',
    sourcePages: [2],
  },
  {
    key: '九头鸟',
    terms: ['九头', '九首'],
    pattern: '九头鸟或九凤',
    meaning: '承载楚地神鸟与祥瑞意象',
    sourcePages: [3],
  },
  {
    key: '凤凰',
    terms: ['凤凰', '彩凤', '丹凤', '金凤', '楚凤', '凤'],
    pattern: '凤凰、花草或云纹',
    meaning: '象征祥瑞、和谐与荣华富贵',
    sourcePages: [3],
  },
  {
    key: '黄鹤楼',
    terms: ['黄鹤楼'],
    pattern: '黄鹤楼、云鹤或山水',
    meaning: '承载武汉地域文化记忆',
    sourcePages: [8, 9, 10],
  },
  {
    key: '鹤',
    terms: ['仙鹤', '双鹤', '群鹤', '八鹤', '云鹤', '鹤'],
    pattern: '鹤、松或云纹',
    meaning: '象征长寿、尊敬与福寿祝愿',
    sourcePages: [3],
  },
  {
    key: '麒麟',
    terms: ['麒麟'],
    pattern: '麒麟、人物或花草',
    meaning: '象征瑞祥、驱邪祈福与镇宅',
    sourcePages: [3],
  },
  {
    key: '牡丹',
    terms: ['牡丹', '国色天香'],
    pattern: '牡丹、花叶',
    meaning: '象征富贵',
    sourcePages: [1],
  },
  {
    key: '莲花',
    terms: ['荷花', '粉荷', '荷塘', '莲', '湘莲'],
    pattern: '莲花、莲叶或水禽',
    meaning: '象征纯洁高雅',
    sourcePages: [2],
  },
  {
    key: '桃',
    terms: ['寿桃', '桃子'],
    pattern: '桃子或寿桃',
    meaning: '象征长寿',
    sourcePages: [2, 5],
  },
  {
    key: '蝙蝠',
    terms: ['蝙蝠', '五福'],
    pattern: '蝙蝠、福字或寿字',
    meaning: '谐音福，寓意纳福与福寿',
    sourcePages: [3, 5],
  },
  {
    key: '福',
    terms: ['福字', '福'],
    pattern: '福字、花卉或蝙蝠',
    meaning: '寓意幸福和福气',
    sourcePages: [5],
  },
  {
    key: '寿',
    terms: ['寿', '献寿', '捧寿'],
    pattern: '寿字、花果或人物故事',
    meaning: '寓意长寿、安康与福寿双全',
    sourcePages: [1, 2, 3, 4, 5],
  },
  {
    key: '鱼',
    terms: ['锦鲤', '游鱼', '鱼'],
    pattern: '鱼类、花叶或水纹',
    meaning: '寓意吉祥富贵',
    sourcePages: [2],
  },
  {
    key: '蝴蝶',
    terms: ['蝴蝶', '彩蝶', '蝶恋花', '蝶'],
    pattern: '蝴蝶、花叶',
    meaning: '象征爱情、婚姻幸福与美满',
    sourcePages: [2],
  },
  {
    key: '喜鹊',
    terms: ['喜鹊'],
    pattern: '喜鹊、花叶',
    meaning: '寓意喜事上门',
    sourcePages: [2, 5],
  },
  {
    key: '松',
    terms: ['松鹤', '松树'],
    pattern: '松、鹤或兰竹',
    meaning: '松象征长寿，松兰竹组合可寓坚韧与友情长久',
    sourcePages: [3],
  },
  {
    key: '竹',
    terms: ['翠竹', '竹'],
    pattern: '竹、鸟或花草',
    meaning: '可与松兰组成坚韧和友情长久的植物意象',
    sourcePages: [3],
  },
  {
    key: '博古',
    terms: ['博古', '花觚', '青铜'],
    pattern: '器物、花卉或水果',
    meaning: '寓意文采高雅、通晓古今、趋吉避凶与富贵吉祥',
    sourcePages: [5],
  },
  {
    key: '人物',
    terms: ['人物', '罗汉', '尊者', '麻姑', '观音', '百子', '牛郎织女'],
    pattern: '人物、宗教或民俗故事元素',
    meaning: '承载神话人物、历史典故、戏曲故事或日常生活叙事',
    sourcePages: [4],
  },
  {
    key: '盘金',
    terms: ['盘金', '金线'],
    pattern: '盘金线迹或金线轮廓',
    meaning: '以金线并置固定，表现外轮廓或金色块面质感',
    sourcePages: [7],
  },
  {
    key: '狮子',
    terms: ['双狮', '狮'],
    pattern: '狮子、绣球',
    meaning: '',
    sourcePages: [],
  },
  {
    key: '城市纪念',
    terms: ['军运', '江城地标'],
    pattern: '城市地标、吉祥物或民俗图景',
    meaning: '',
    sourcePages: [],
  },
  {
    key: '对条花卉',
    terms: ['紫花对条'],
    pattern: '对称花卉纹样',
    meaning: '',
    sourcePages: [],
  },
  {
    key: '松鼠葡萄',
    terms: ['松鼠', '葡萄'],
    pattern: '松鼠、葡萄藤蔓',
    meaning: '',
    sourcePages: [],
  },
  {
    key: '白虎',
    terms: ['白虎'],
    pattern: '虎、楚式装饰或盘金线迹',
    meaning: '',
    sourcePages: [],
  },
];

const symbolismByCode = {
  'HE-NB-M12': '九头鸟又称九凤，是战国时期楚国先祖崇拜的神鸟；本件以九首凤鸟表现楚地神鸟与祥瑞意象。',
  'HE-NB-M01': '狮子与绣球组合构成喜庆祈福题材，归吉祥祈福类。',
  'HE-NB-B10': '牡丹在汉绣纹样中使用频繁，象征富贵；本件以三色牡丹构成富贵主题。',
  'HE-NB-B03': '凤凰象征祥瑞与和谐，牡丹象征富贵；二者组合寓意荣华富贵。',
  'HE-HS-M12': '莲花象征纯洁高雅；鸳鸯与荷花组合构成和合、美满主题。',
  'HE-NB-B09': '蝙蝠因蝠与福谐音，常作为吉祥物；五福为长寿、富贵、康宁、好德、善终，寿字共同构成福寿主题。',
  'HE-HS-B08': '以武汉城市地标、江豚吉祥物与民俗图景构成当代城市纪念题材，归人文民俗纹样。',
  'HE-NB-R03': '凤凰象征祥瑞与和谐，牡丹象征富贵；凤栖牡丹题材寓意荣华富贵。',
  'HE-NS-M01': '凤凰是中国传统文化中的祥瑞元素；楚凤题材承载荆楚地域文化记忆。',
  'HE-NL-R02': '莲花象征纯洁高雅；本件以半开粉荷表现清雅花卉小品。',
  'HE-NB-R01': '狮子与绣球组合构成喜庆祈福题材，归吉祥祈福类。',
  'HE-NB-B01': '龙在传统纹样中为神物，可用于祥瑞喜庆语境；双龙、祥云与寿字组合表达福寿吉祥。',
  'HE-NS-M04': '鹤象征长寿，凤凰象征祥瑞；古黄鹤楼题材承载武汉地域文化记忆。',
  'HE-HS-R02': '鹤象征长寿；古黄鹤楼与群鹤组合承载武汉地域文化记忆与福寿祝愿。',
  'HE-NB-M03': '凤凰象征祥瑞，牡丹象征富贵；鸽子、麦穗在画面中补充安宁与丰收主题。',
  'HE-HS-A02': '黄鹤楼与山水构成武汉地域文化题材；金线表现与盘金绣的金色轮廓质感相近。',
  'HE-NB-M14': '凤凰象征祥瑞与和谐；本件以凤鸟羽翼和花纹表现吉祥主题。',
  'HE-NB-B04': '龙在传统纹样中为神物，常与祥瑞、喜庆丰收相连；本件以金龙、旭日与祥云构成祥瑞主题。',
  'HE-NB-M05': '松树象征长寿，鹤也是长寿事物的象征；松鹤组合对应祝寿祈福主题。',
  'HE-NS-A01': '凤凰是中国传统文化中的祥瑞元素；楚凤江城题材承载荆楚地域文化记忆。',
  'HE-HL-M10': '凤凰象征祥瑞，鹿与禄谐音；凤、鹿与卷草云纹共同构成荆楚复古清赏题材。',
  'HE-NB-G14': '鹤是长寿事物的象征；双鹤与朝日、海水江崖共同构成祝寿祈福主题。',
  'HE-NB-M07': '莲花象征纯洁高雅；荷塘花鸟与儿童围兜形制共同构成平安护佑和自然生趣主题。',
  'HE-NB-G13': '牡丹象征富贵，蝴蝶象征爱情、婚姻幸福与美满；二者组合表达富贵与美满。',
  'HE-NB-B11': '牡丹在汉绣纹样中使用频繁，象征富贵；本件以描金牡丹表现富贵主题。',
  'HE-HB-M02': '人物图案常取材于历史典故、戏曲故事和日常生活；本件记录湖北民间三棒鼓表演与莲荷场景。',
  'HE-NB-M06': '牡丹象征富贵；与佛教八宝纹样组合，构成富贵吉祥主题。',
  'HE-NL-A13': '凤凰象征祥瑞与和谐；盘金绣使用金线并置固定，用于表现外轮廓和金色块面质感。',
  'HE-NB-R02': '福字寓意幸福和福气；蝙蝠因蝠与福谐音，与花卉共同构成纳福主题。',
  'HE-NB-B05': '桃子象征长寿，蝙蝠取福气，蝴蝶象征美满；组合表达福寿与美好。',
  'HE-NL-R01': '莲花象征纯洁高雅；蜜蜂作为自然生趣点缀，归生活志趣类。',
  'HE-NB-M02': '对称花卉纹样作为服饰装饰，表达花卉吉祥与规整秩序。',
  'HE-NB-B08': '龙在传统纹样中为神物，常与祥瑞、喜庆丰收相连；本件以龙与珠构成祥瑞主题。',
  'HE-NB-R04': '松鼠与葡萄藤蔓组合表达丰收、多子与延绵，归吉祥祈福类。',
  'HE-HB-R09': '龙在传统纹样中可表示身份与祥瑞；五爪团龙配合红底和卷草，构成庄重吉祥主题。',
  'HE-HS-R08': '凤凰象征祥瑞；黄鹤楼与楚纹承载武汉地域文化记忆和荆楚文化象征。',
  'HE-NB-B07': '鹤是长寿事物的象征；八鹤祥云组合构成祝寿祈福主题。',
  'HE-NL-M08': '竹可与松兰组成坚韧、友情长久的植物意象；本件以翠竹和绶带鸟表现清雅生趣。',
  'HE-NB-R07': '牡丹象征富贵，蝴蝶象征爱情、婚姻幸福与美满；二者组合表达富贵与美满。',
  'HE-NL-M01': '鹤象征长寿，莲花象征纯洁高雅；本件兼具荷塘清雅与祝寿意象。',
  'HE-NS-B04': '凤凰象征祥瑞，牡丹象征富贵；金凤牡丹组合构成祥瑞富贵主题。',
  'HE-NB-M13': '牡丹象征富贵；左右对称构图强化成双与规整的装饰秩序。',
  'HE-NB-B06': '蝴蝶象征爱情、婚姻幸福与美满；百花与蝴蝶共同构成美好花卉主题。',
  'HE-HB-R03': '蝴蝶象征爱情、婚姻幸福与美满；鱼类纹样寓意吉祥富贵，本件归人文民俗叙事。',
  'HE-NB-M09': '牡丹象征富贵，蝴蝶象征爱情、婚姻幸福与美满；二者组合表达富贵与美满。',
  'HE-HS-R01': '佛教人物是汉绣人物图案的重要题材；龙为传统神物，本件以降龙尊者承载宗教人物叙事。',
  'HE-HS-A03': '鹤象征长寿；黄鹤楼与云鹤组合承载武汉地域文化记忆与福寿祝愿，金线表现突出盘金质感。',
  'HE-NB-R06': '喜鹊在传统图案中寓意喜事上门；本件与银杏花叶组合构成吉庆主题。',
  'HE-NB-M08': '鱼类纹样寓意吉祥富贵，鲤鱼还有跃龙门之意；本件以锦鲤和银杏构成富足吉祥主题。',
  'HE-NB-R05': '牡丹象征富贵；花鸟题材常用于服饰装饰，本件以锦鸡和牡丹表现富贵主题。',
  'HE-NB-M15': '凤凰象征祥瑞，鹿与禄谐音；凤、鹿与卷草云纹共同构成荆楚复古清赏题材。',
  'HE-NB-B02': '蝴蝶象征爱情、婚姻幸福与美满；绣球与花叶共同构成圆满美好主题。',
  'HE-HL-M11': '博古图寓意文采高雅、通晓古今、趋吉避凶与富贵吉祥；本件以青铜花觚构成仿古清赏题材。',
  'HE-NB-M04': '莲花象征纯洁高雅；鸳鸯与荷花组合构成夫妻和合、婚姻美满主题。',
  'HE-HB-M01': '麒麟是古代神兽，被认为有瑞祥之气，并有驱邪祈福、镇宅之意；本件题名为麒麟送子，归吉祥祈福类。',
  'HE-HB-R02': '麻姑是古代长寿仙女；麻姑献寿题材表达长寿祝愿。',
  'HE-HS-B15': '凤凰是中国传统文化中的祥瑞元素；楚凤云水题材承载荆楚地域文化记忆。',
  'HE-HL-A14': '虎、鹿、松等可组成福禄寿意象；本件以楚式白虎图腾和盘金工艺表现守护主题。',
  'HE-HB-A12': '龙在传统纹样中可表示身份与祥瑞；正龙配海水江崖构成庄重吉祥主题。',
  'HE-NB-R08': '龙凤组合象征婚姻幸福美满、阴阳调和；宝珠补充圆满吉祥意象。',
};

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

function findRules(pattern) {
  const text = pattern.name?.['zh-CN'] || '';
  const matches = [];
  for (const rule of pdfMotifRules) {
    if (rule.terms.some((term) => text.includes(term))) matches.push(rule);
  }
  const keys = new Set(matches.map((rule) => rule.key));
  return matches.filter((rule, index) => {
    if (matches.findIndex((item) => item.key === rule.key) !== index) return false;
    if (rule.key === '龙' && (keys.has('双龙') || keys.has('龙凤'))) return false;
    if (rule.key === '凤凰' && (keys.has('龙凤') || keys.has('九头鸟'))) return false;
    if (rule.key === '福' && keys.has('蝙蝠')) return false;
    if (rule.key === '鱼' && text.includes('江豚')) return false;
    return true;
  });
}

function uniqueParts(values, max = 4) {
  const output = [];
  for (const value of values) {
    for (const part of value.split('、')) {
      const clean = part.trim();
      if (clean && !output.includes(clean)) output.push(clean);
      if (output.length >= max) return output;
    }
  }
  return output;
}

function buildLiterature(pattern, rules) {
  const patternCategory = patternCategoryLabels[pattern.patternCategory] || '未分类纹样';
  const meaningCategory = meaningCategoryLabels[pattern.meaningCategory] || '未分类寓意';
  const colorCategory = colorCategoryLabels[pattern.colorCategory] || '未分类色系';
  const patternRules = rules.filter((rule) => rule.key !== '盘金');
  let meaningRules = rules.filter((rule) => rule.key !== '盘金');
  if (meaningRules.length > 1 && pattern.meaningCategory === 'B') {
    meaningRules = meaningRules.filter((rule) => rule.key !== '人物');
  }
  if (meaningRules.length === 0) meaningRules = rules.filter((rule) => rule.key !== '盘金');

  const motifs = uniqueParts(patternRules.map((rule) => rule.pattern)).join('、');
  const meanings = [...new Set(meaningRules.map((rule) => rule.meaning).filter(Boolean))].slice(0, 2).join('、');
  const ratio = visualAnalysis[pattern.heCode]?.mainColorRatio?.['zh-CN'] || '';

  const patternText = motifs
    ? `纹样判定：${motifs}，属于${patternCategory}`
    : `纹样判定：按HE分类归为${patternCategory}`;
  const meaningText = meanings
    ? `寓意判定：${meanings}，属于${meaningCategory}`
    : `寓意判定：按HE寓意分类归为${meaningCategory}`;
  const colorText = ratio && !ratio.includes('待')
    ? `色彩判定：主色比例为${ratio}，归${colorCategory}`
    : `色彩判定：按HE色彩分类归${colorCategory}`;

  return `${patternText}；${meaningText}；${colorText}`;
}

const changes = [];

for (const pattern of patterns) {
  const rules = findRules(pattern);
  const nextSymbolism = symbolismByCode[pattern.heCode] || pattern.symbolism?.['zh-CN'] || '';
  const nextLiterature = buildLiterature(pattern, rules);

  pattern.symbolism = { 'zh-CN': nextSymbolism, en: nextSymbolism };
  pattern.literature = { 'zh-CN': nextLiterature, en: nextLiterature };

  const before = beforeByCode.get(pattern.heCode);
  if (before.symbolism !== nextSymbolism || before.literature !== nextLiterature) {
    changes.push({
      heCode: pattern.heCode,
      name: pattern.name?.['zh-CN'] || pattern.heCode,
      sourcePages: [...new Set(rules.flatMap((rule) => rule.sourcePages))],
      before,
      after: {
        symbolism: nextSymbolism,
        literature: nextLiterature,
      },
    });
  }
}

const output = "import { PatternGene } from './types';\n\n"
  + 'export const mockPatterns: PatternGene[] = '
  + JSON.stringify(patterns, null, 2)
  + ';\n';

fs.writeFileSync(dataPath, output, 'utf8');
fs.writeFileSync(notesPath, JSON.stringify({ source: '汉绣图案.pdf', notes: pdfNotes }, null, 2), 'utf8');
fs.writeFileSync(auditPath, JSON.stringify({ source: '汉绣图案.pdf', changes }, null, 2), 'utf8');

console.log(JSON.stringify({ updated: changes.length }, null, 2));
