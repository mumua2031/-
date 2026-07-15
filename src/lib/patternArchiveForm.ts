import type { MultilingualString, PatternGene } from '../types';

export type PatternArchiveFormData = {
  name: string;
  category: string;
  symbolism: string;
  color: string;
  era: string;
  carrier: string;
  region: string;
  copyrightOwner: string;
  format: string;
  resolution: string;
  craft: string;
  symbolismText: string;
  origin: string;
  scenario: string;
  literature: string;
  inheritor: string;
};

export type PatternArchiveField = keyof PatternArchiveFormData;

export type PatternArchiveFieldConfig = {
  key: PatternArchiveField;
  label: string;
  placeholder: string;
};

export const createEmptyPatternArchiveForm = (): PatternArchiveFormData => ({
  name: '',
  category: 'N',
  symbolism: 'B',
  color: 'R',
  era: '',
  carrier: '',
  region: '',
  copyrightOwner: '',
  format: '',
  resolution: '',
  craft: '',
  symbolismText: '',
  origin: '',
  scenario: '',
  literature: '',
  inheritor: '',
});

export const archiveBasicFields: PatternArchiveFieldConfig[] = [
  { key: 'era', label: '年代 / 时期', placeholder: '如：清代、民国、当代；不确定可写“待考”' },
  { key: 'carrier', label: '载体 / 材质', placeholder: '如：真丝软缎、圆补、服饰、帐幔、镜框装饰等' },
  { key: 'region', label: '地域 / 采集地', placeholder: '如：湖北武汉汉口绣花街、江汉平原等' },
  { key: 'format', label: '图片格式', placeholder: '如：PNG、JPG；不填则自动识别' },
  { key: 'resolution', label: '分辨率 / 档案规格', placeholder: '如：高清数字档案、300dpi、2048×2048' },
  { key: 'copyrightOwner', label: '版权 / 权属说明', placeholder: '如：传承人授权、机构收藏、权属待确认，仅供研究展示' },
];

export const archiveTextFields: PatternArchiveFieldConfig[] = [
  { key: 'craft', label: '工艺说明', placeholder: '填写针法、盘金、铺绣、破色针、配线、制作特征等。' },
  { key: 'symbolismText', label: '象征寓意', placeholder: '填写凤凰、牡丹、圆补、色彩和构图所表达的吉祥寓意。' },
  { key: 'origin', label: '来源出处', placeholder: '填写采集来源、馆藏来源、民间来源、图片出处或待考说明。' },
  { key: 'scenario', label: '应用场景', placeholder: '如：礼服补子、婚庆服饰、厅堂装饰、仪式用品、现代文创转译等。' },
  { key: 'literature', label: '文献 / 备注', placeholder: '填写参考文献、访谈记录、图片页码、备注说明等。' },
  { key: 'inheritor', label: '传承人 / 收藏者', placeholder: '填写传承人、收藏者、采集者或“具体传承人不详”。' },
];

export const archivePasteExample = [
  '纹样名称：黑底盘金凤凰牡丹圆补汉绣',
  '年代：当代',
  '载体：真丝软缎圆补',
  '地域：湖北武汉汉口绣花街汉绣传承区',
  '工艺：盘金绣、铺绣、破色针、配线。',
  '寓意：凤凰与牡丹象征富贵吉祥、圆满团圆。',
  '来源：民间采集，出处待考。',
  '应用场景：礼服补子、厅堂装饰、现代文创转译。',
  '文献：访谈记录或图片页码。',
  '传承人：具体传承人不详。',
].join('\n');

export const makeMultilingual = (value: string, fallback = ''): MultilingualString => {
  const text = value.trim() || fallback;
  return { 'zh-CN': text, en: text };
};

export function getMultilingualText(value?: MultilingualString | string) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value['zh-CN'] || value.en || value['zh-TW'] || '';
}

export function normalizeEraForArchive(value?: unknown) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  const compact = text.replace(/\s+/g, '');

  if (/当代/.test(compact)) return '当代';
  if (/清末.*民国|民国.*清末/.test(compact)) return '清末民国';
  if (/清代.*近现代|近现代.*清代/.test(compact)) return '清代至近现代';
  if (/近代.*民国|民国.*近代/.test(compact)) return '近代民国';
  if (/20世纪50|1950|五十年代|50年代/.test(compact)) return '1950年代';
  if (/战国/.test(compact)) return '战国';
  if (/秦汉/.test(compact)) return '秦汉';
  if (/唐宋/.test(compact)) return '唐宋';
  if (/宋元/.test(compact)) return '宋元';
  if (/元明/.test(compact)) return '元明';
  if (/明清/.test(compact)) return '明清';
  if (/清代|清朝|清/.test(compact)) return '清代';
  if (/明代|明朝|明/.test(compact)) return '明代';
  if (/民国/.test(compact)) return '民国';
  if (/近现代/.test(compact)) return '近现代';
  if (/近代/.test(compact)) return '近代';
  if (/现代/.test(compact)) return '现代';
  if (/传统/.test(compact)) return '传统';
  if (/待考|不详|未知/.test(compact)) return '待考';

  return text.split(/[，,。.；;：:（(]/)[0].trim();
}

const fieldAliases: Record<PatternArchiveField, string[]> = {
  name: ['纹样名称', '名称', '题名', '标题', 'pattern name', 'name'],
  category: ['纹样大类', '纹样分类', '大类', 'category'],
  symbolism: ['寓意大类', '寓意分类', 'meaning category'],
  color: ['色彩大类', '色彩分类', '色系', 'color category'],
  era: ['年代', '时期', '时代', '年代时期', 'era'],
  carrier: ['载体', '材质', '载体材质', 'carrier'],
  region: ['地域', '地区', '采集地', '地域采集地', 'region'],
  copyrightOwner: ['版权', '权属', '权属说明', '版权归属', '版权权属说明', 'copyright'],
  format: ['格式', '图片格式', 'format'],
  resolution: ['分辨率', '档案规格', '分辨率档案规格', 'resolution'],
  craft: ['工艺', '工艺说明', '针法', 'craft'],
  symbolismText: ['寓意', '象征寓意', '文化寓意', 'symbolism'],
  origin: ['来源', '出处', '来源出处', 'origin'],
  scenario: ['应用场景', '用途', '使用场景', 'scenario'],
  literature: ['文献', '备注', '文献备注', '参考文献', 'literature'],
  inheritor: ['传承人', '收藏者', '传承人收藏者', '采集者', 'inheritor'],
};

function normalizeLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[【】\[\]（）()《》<>/\s_-]/g, '')
    .replace(/[:：]/g, '');
}

function findFieldByLabel(label: string): PatternArchiveField | null {
  const normalized = normalizeLabel(label);
  const entry = Object.entries(fieldAliases).find(([, aliases]) => aliases.some((alias) => normalizeLabel(alias) === normalized));
  return entry?.[0] as PatternArchiveField | undefined || null;
}

function normalizeCategoryValue(field: PatternArchiveField, value: string, allowed: string[]) {
  const text = value.trim();
  if (field === 'category') {
    if (/自然/.test(text)) return 'N';
    if (/人文|民俗|人物|器物/.test(text)) return 'H';
    if (/几何|抽象/.test(text)) return 'G';
  }
  if (field === 'symbolism') {
    if (/吉祥|祈福|祝福|福/.test(text)) return 'B';
    if (/精神|信仰|祭祀|礼制/.test(text)) return 'S';
    if (/生活|志趣|日用|民生/.test(text)) return 'L';
  }
  if (field === 'color') {
    if (/金|银/.test(text)) return 'A';
    if (/多色|五彩|复色|综合色/.test(text)) return 'M';
    if (/红/.test(text)) return 'R';
    if (/绿/.test(text)) return 'G';
    if (/蓝/.test(text)) return 'B';
  }

  const upper = text.toUpperCase();
  const firstLetter = upper.match(/[A-Z]/)?.[0];
  return firstLetter && allowed.includes(firstLetter) ? firstLetter : '';
}

function mapParsedValue(field: PatternArchiveField, value: string) {
  if (field === 'category') return normalizeCategoryValue(field, value, ['N', 'H', 'G']);
  if (field === 'symbolism') return normalizeCategoryValue(field, value, ['B', 'S', 'L']);
  if (field === 'color') return normalizeCategoryValue(field, value, ['R', 'G', 'B', 'A', 'M']);
  if (field === 'era') return normalizeEraForArchive(value);
  return value.trim();
}

export function parsePatternArchiveText(text: string) {
  const patch: Partial<PatternArchiveFormData> = {};
  const raw = text.trim();
  if (!raw) return patch;

  try {
    const parsed = JSON.parse(raw) as Partial<PatternGene> & Record<string, unknown>;
    if (parsed && typeof parsed === 'object') {
      if (parsed.name) patch.name = getMultilingualText(parsed.name as MultilingualString);
      if (parsed.patternCategory) patch.category = String(parsed.patternCategory);
      if (parsed.meaningCategory) patch.symbolism = String(parsed.meaningCategory);
      if (parsed.colorCategory) patch.color = String(parsed.colorCategory);
      if (parsed.era) patch.era = normalizeEraForArchive(parsed.era);
      if (parsed.carrier) patch.carrier = String(parsed.carrier);
      if (parsed.region) patch.region = String(parsed.region);
      if (parsed.copyrightOwner) patch.copyrightOwner = String(parsed.copyrightOwner);
      if (parsed.format) patch.format = String(parsed.format);
      if (parsed.resolution) patch.resolution = String(parsed.resolution);
      if (parsed.craft) patch.craft = getMultilingualText(parsed.craft as MultilingualString);
      if (parsed.symbolism) patch.symbolismText = getMultilingualText(parsed.symbolism as MultilingualString);
      if (parsed.origin) patch.origin = getMultilingualText(parsed.origin as MultilingualString);
      if (parsed.scenario) patch.scenario = getMultilingualText(parsed.scenario as MultilingualString);
      if (parsed.literature) patch.literature = getMultilingualText(parsed.literature as MultilingualString);
      if (parsed.inheritor) patch.inheritor = getMultilingualText(parsed.inheritor as MultilingualString);
      if (Object.keys(patch).length) return patch;
    }
  } catch {
    // Plain pasted notes are the common path.
  }

  let currentField: PatternArchiveField | null = null;
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^(.{1,20}?)[：:]\s*(.*)$/);
    if (match) {
      const field = findFieldByLabel(match[1]);
      if (field) {
        const value = mapParsedValue(field, match[2]);
        if (value) patch[field] = value;
        currentField = field;
        return;
      }
    }
    if (currentField && !patch[currentField]?.includes(trimmed)) {
      patch[currentField] = [patch[currentField], trimmed].filter(Boolean).join('\n');
    }
  });

  return patch;
}
