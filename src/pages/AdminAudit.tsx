import { useMemo, useState } from 'react';
import { CheckSquare, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { readApiPayload } from '../lib/apiResponse';
import { buildHECode, formatHECodeForDisplay, getCategoryLabel, getPatternClassification } from '../lib/classification';
import { usePatternData } from '../lib/patternData';
import type { MultilingualString, PatternGene } from '../types';

type CategoryCode = 'N' | 'H' | 'G' | 'B' | 'S' | 'L' | 'R' | 'A' | 'M';

type CategorySuggestion = {
  id: string;
  heCode: string;
  title: string;
  current: [CategoryCode, CategoryCode, CategoryCode];
  target: [CategoryCode, CategoryCode, CategoryCode];
  reason: string;
};

type EraSuggestion = {
  id: string;
  heCode: string;
  title: string;
  current: string;
  target: string;
};

const eraSuggestions: EraSuggestion[] = [
  ['HE-NB-B03', '丹凤牡丹圆框汉绣', '当代复原', '当代'],
  ['HE-HS-M12', '鸳鸯荷花繁花汉绣', '当代复原', '当代'],
  ['HE-NB-B09', '黑底五福捧寿圆团花绣', '当代复原（参考清代）', '当代（参考清代）'],
  ['HE-NB-R03', '凤栖牡丹橙底汉绣', '当代复原', '当代'],
  ['HE-NS-M01', '凤鸣楚天群凤横向壁挂汉绣', '当代复原（参考战国）', '当代（参考战国）'],
  ['HE-NL-R02', '半开粉荷白底汉绣', '当代复原', '当代'],
  ['HE-NB-R01', '双狮戏绣球圆框汉绣', '当代复原', '当代'],
  ['HE-NB-B01', '双龙捧寿银线汉绣', '当代复原（参考明清）', '当代（参考明清）'],
  ['HE-NB-M05', '松鹤延年圆形框装汉绣', '当代复原', '当代'],
  ['HE-HL-M10', '楚式对称凤鹿复古白地汉绣', '当代复原（参考战国）', '当代（参考战国）'],
  ['HE-NB-G14', '橄榄绿底双鹤朝日圆台屏绣芯', '当代复原', '当代'],
  ['HE-NB-G13', '湖绿底国色天香牡丹蝴蝶方形绣片', '当代复原', '当代'],
  ['HE-HB-M02', '湘莲闹三棒鼓舞民俗人物汉绣', '当代复原', '当代'],
  ['HE-NB-M06', '浅灰底牡丹八宝吉祥纹衣饰汉绣', '当代复原（参考民国）', '当代（参考民国）'],
  ['HE-NL-R01', '白地粉荷蜜蜂小品汉绣', '当代复原', '当代'],
  ['HE-NB-M02', '紫花对条浅白底戏服汉绣', '当代复原', '当代'],
  ['HE-HB-R09', '红底金线青绿五爪龙圆团绣片', '当代复原', '当代'],
  ['HE-NL-M01', '荷塘双鹤汉绣', '当代复原', '当代'],
  ['HE-NS-B04', '蓝底金凤牡丹展陈汉绣', '当代复原', '当代'],
  ['HE-NB-M13', '蓝白牡丹对称黑底绣片', '当代复原', '当代'],
  ['HE-HB-R03', '红底蝶仙游鱼神话装饰汉绣', '当代复原', '当代'],
  ['HE-HS-R01', '红底西十七座降龙尊者人物汉绣', '当代复原', '当代'],
  ['HE-NB-R06', '银杏双喜鹊粉底黑檀圆台屏', '当代复原', '当代'],
  ['HE-NB-R05', '锦鸡牡丹红底汉剧服饰绣片', '当代复原', '当代'],
  ['HE-NB-B02', '青蓝蝶恋花绣球汉绣', '当代复原', '当代'],
  ['HE-NB-M04', '浅白底鸳鸯荷花繁花方形绣片', '当代复原', '当代'],
  ['HE-HB-M01', '麒麟送子圆补汉绣', '当代复原（参考明清）', '当代（参考明清）'],
  ['HE-HB-R02', '红底麻姑献寿人物祝寿汉绣', '当代复原', '当代'],
  ['HE-HS-B15', '黑底满铺楚凤云水横向大型壁挂汉绣', '当代复原（参考战国）', '当代（参考战国）'],
  ['HE-GB-A02', '戏曲戏服万字锦兽面装饰汉绣', '近现代戏曲戏衣专用绣片', '近现代'],
  ['HE-GB-A03', '戏曲戏服芦席格花卉几何汉绣', '近现代戏曲戏衣绣片', '近现代'],
  ['HE-GB-M01', '戏曲《立水江崖》几何海水江崖汉绣局部', '近现代戏曲戏衣汉绣', '近现代'],
  ['HE-HB-M15', '民间母子多子图人物汉绣纹样', '清代民间婚嫁绣片', '清代'],
  ['HE-HB-R16', '《福禄图》禄星开脸人物汉绣局部', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-A02', '盘金彩绣凤凰纹汉绣', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-B05', '青蓝单色菊花汉绣纹样', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-G01', '绿彩青蛙水草汉绣纹样', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-M10', '蓝底佛手石榴三多纹汉绣', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-M11', '紫底多色秋菊汉绣纹样', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-M12', '紫彩蝴蝶牵牛花汉绣纹样', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-R07', '汉绣红底双凤戏珠戏曲女靠局部绣品', '近现代戏曲戏衣专用汉绣', '近现代'],
  ['HE-NB-R09', '红梅花枝汉绣纹样', '当代采集，具体年代待考', '具体年代待考'],
  ['HE-NB-R10', '红彩成对金鱼汉绣纹样', '当代采集，具体年代待考', '具体年代待考'],
].map(([heCode, title, current, target]) => ({ id: `era:${heCode}`, heCode, title, current, target }));

const categorySuggestions: CategorySuggestion[] = [
  {
    id: 'cat:HE-HS-M12',
    heCode: 'HE-HS-M12',
    title: '鸳鸯荷花繁花汉绣',
    current: ['H', 'S', 'M'],
    target: ['N', 'B', 'M'],
    reason: '主体为鸳鸯+荷花，属自然动植物；整体语境为婚嫁和合、美满，宜归吉祥祈福。',
  },
  {
    id: 'cat:HE-NS-M04',
    heCode: 'HE-NS-M04',
    title: '古黄鹤楼彩凤群鹤竖幅装饰汉绣',
    current: ['N', 'S', 'M'],
    target: ['H', 'S', 'M'],
    reason: '黄鹤楼是武汉人文地标；若楼阁占主体，按综合场景应归人文/民俗。',
  },
  {
    id: 'cat:HE-NL-A13',
    heCode: 'HE-NL-A13',
    title: '盘金凤凰羽翼局部绣',
    current: ['N', 'L', 'A'],
    target: ['N', 'B', 'A'],
    reason: '主体为凤凰瑞鸟羽翼；若作为纹样档案而非单纯针法标本，寓意应按祥瑞祈福。',
  },
  {
    id: 'cat:HE-HB-R09',
    heCode: 'HE-HB-R09',
    title: '红底金线青绿五爪龙圆团绣片',
    current: ['H', 'B', 'R'],
    target: ['N', 'B', 'R'],
    reason: '龙虽有礼制/身份语境，但主体形象占比为瑞兽龙；按主体占比规则归自然瑞兽。',
  },
  {
    id: 'cat:HE-NL-M01',
    heCode: 'HE-NL-M01',
    title: '荷塘双鹤汉绣',
    current: ['N', 'L', 'M'],
    target: ['N', 'B', 'M'],
    reason: '鹤为长寿意象，虽有荷塘清雅，但整体双鹤更偏祝寿吉祥。',
  },
  {
    id: 'cat:HE-NS-B04',
    heCode: 'HE-NS-B04',
    title: '蓝底金凤牡丹展陈汉绣',
    current: ['N', 'S', 'B'],
    target: ['N', 'B', 'B'],
    reason: '凤凰+牡丹是瑞鸟/花卉吉祥主题；展陈只是使用场景。',
  },
  {
    id: 'cat:HE-HB-M01',
    heCode: 'HE-HB-M01',
    title: '麒麟送子圆补汉绣',
    current: ['H', 'B', 'M'],
    target: ['N', 'B', 'M'],
    reason: '麒麟为瑞兽且是主体；送子是寓意语境，纹样大类应归自然瑞兽。',
  },
  {
    id: 'cat:HE-HB-A12',
    heCode: 'HE-HB-A12',
    title: '黑底金线正龙海水江崖绣片',
    current: ['H', 'B', 'A'],
    target: ['N', 'B', 'A'],
    reason: '主体形象为正龙瑞兽，海水江崖是辅助背景。',
  },
  {
    id: 'cat:HE-GB-M02',
    heCode: 'HE-GB-M02',
    title: '黄圣辉制钉金平绣太极阴阳几何汉绣',
    current: ['G', 'B', 'M'],
    target: ['G', 'S', 'M'],
    reason: '主体为太极阴阳几何，但语义为道家/阴阳观念，寓意应归精神信仰。',
  },
  {
    id: 'cat:HE-HB-R19',
    heCode: 'HE-HB-R19',
    title: '任本荣《达摩渡江》竖幅宗教汉绣',
    current: ['H', 'B', 'R'],
    target: ['H', 'S', 'R'],
    reason: '达摩为禅宗人物，整体语境是宗教/禅意。',
  },
  {
    id: 'cat:HE-HB-R20',
    heCode: 'HE-HB-R20',
    title: '叶依子制红底罗汉汉绣',
    current: ['H', 'B', 'R'],
    target: ['H', 'S', 'R'],
    reason: '罗汉为佛教人物，整体语境是宗教祈福。',
  },
  {
    id: 'cat:HE-HS-M02',
    heCode: 'HE-HS-M02',
    title: '战国楚蟠螭龙凤锁绣丝绣',
    current: ['H', 'S', 'M'],
    target: ['N', 'S', 'M'],
    reason: '主体为龙凤/蟠螭等瑞兽神兽；战国楚地巫祀图腾语境保留精神信仰。',
  },
  {
    id: 'cat:HE-HS-M04',
    heCode: 'HE-HS-M04',
    title: '古典戏曲《红娘》圆形构图汉绣',
    current: ['H', 'S', 'M'],
    target: ['H', 'L', 'M'],
    reason: '主体为戏曲文学人物与庭院圆窗，整体是生活审美/文艺志趣，不是宗教信仰。',
  },
  {
    id: 'cat:HE-NB-G01',
    heCode: 'HE-NB-G01',
    title: '绿彩青蛙水草汉绣纹样',
    current: ['N', 'B', 'G'],
    target: ['N', 'L', 'G'],
    reason: '青蛙是普通动物，不是瑞兽；文本也写未见确定民俗释义，宜归自然生态/生活生趣。',
  },
  {
    id: 'cat:HE-NB-M12',
    heCode: 'HE-NB-M12',
    title: '紫彩蝴蝶牵牛花汉绣纹样',
    current: ['N', 'B', 'M'],
    target: ['N', 'L', 'M'],
    reason: '蝴蝶+牵牛花为普通动植物，牵牛寓意待考；整体更像自然花卉生活小品，不宜强归吉祥。',
  },
];

function makeCategoryLabels(patternCategory: string, meaningCategory: string, colorCategory: string): MultilingualString[] {
  return [
    { 'zh-CN': `${getCategoryLabel('pattern', patternCategory, 'zh')} (${patternCategory})`, en: `${getCategoryLabel('pattern', patternCategory, 'en')} (${patternCategory})` },
    { 'zh-CN': `${getCategoryLabel('meaning', meaningCategory, 'zh')} (${meaningCategory})`, en: `${getCategoryLabel('meaning', meaningCategory, 'en')} (${meaningCategory})` },
    { 'zh-CN': `${getCategoryLabel('color', colorCategory, 'zh')} (${colorCategory})`, en: `${getCategoryLabel('color', colorCategory, 'en')} (${colorCategory})` },
  ];
}

function formatCategoryTriplet([patternCategory, meaningCategory, colorCategory]: readonly string[]) {
  return [
    `${patternCategory} · ${getCategoryLabel('pattern', patternCategory, 'zh')}`,
    `${meaningCategory} · ${getCategoryLabel('meaning', meaningCategory, 'zh')}`,
    `${colorCategory} · ${getCategoryLabel('color', colorCategory, 'zh')}`,
  ].join(' / ');
}

function findPattern(patterns: PatternGene[], heCode: string) {
  return patterns.find((pattern) => pattern.heCode === heCode || pattern.id === heCode);
}

function toggleSet(setter: (next: Set<string>) => void, current: Set<string>, id: string) {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  setter(next);
}

export function AdminAudit() {
  const { patterns, source, error, isLoading, refresh } = usePatternData();
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('hanxiu:admin-token') || '');
  const [selectedEraIds, setSelectedEraIds] = useState<Set<string>>(() => new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const visibleEraSuggestions = useMemo(
    () => eraSuggestions.filter((suggestion) => {
      const pattern = findPattern(patterns, suggestion.heCode);
      return !pattern || pattern.era === suggestion.current;
    }),
    [patterns],
  );

  const visibleCategorySuggestions = useMemo(
    () => categorySuggestions.filter((suggestion) => {
      const pattern = findPattern(patterns, suggestion.heCode);
      if (!pattern) return true;
      const classification = getPatternClassification(pattern);
      return `${classification.patternCategory}/${classification.meaningCategory}/${classification.colorCategory}` === suggestion.current.join('/');
    }),
    [patterns],
  );

  const selectedCount = selectedEraIds.size + selectedCategoryIds.size;
  const canApply = source === 'api' && selectedCount > 0 && Boolean(adminToken.trim()) && !isApplying;

  const setAllEra = (checked: boolean) => {
    setSelectedEraIds(checked ? new Set(visibleEraSuggestions.map((suggestion) => suggestion.id)) : new Set());
  };

  const setAllCategory = (checked: boolean) => {
    setSelectedCategoryIds(checked ? new Set(visibleCategorySuggestions.map((suggestion) => suggestion.id)) : new Set());
  };

  const applySelected = async () => {
    if (!canApply) return;
    setIsApplying(true);
    setMessage('');
    const patches = new Map<string, { patch: Record<string, unknown>; selectedIds: string[] }>();

    const addPatch = (heCode: string, selectedId: string, patch: Record<string, unknown>) => {
      const current = patches.get(heCode);
      patches.set(heCode, {
        patch: { ...(current?.patch || {}), ...patch },
        selectedIds: [...(current?.selectedIds || []), selectedId],
      });
    };

    selectedEraIds.forEach((id) => {
      const suggestion = eraSuggestions.find((item) => item.id === id);
      if (!suggestion) return;
      addPatch(suggestion.heCode, id, { era: suggestion.target });
    });

    selectedCategoryIds.forEach((id) => {
      const suggestion = categorySuggestions.find((item) => item.id === id);
      const pattern = suggestion ? findPattern(patterns, suggestion.heCode) : null;
      if (!suggestion || !pattern) return;
      const [patternCategory, meaningCategory, colorCategory] = suggestion.target;
      const sequence = getPatternClassification(pattern).sequence ?? pattern.sequence;
      const nextHeCode = buildHECode({ patternCategory, meaningCategory, colorCategory, sequence }) || pattern.heCode;
      addPatch(suggestion.heCode, id, {
        heCode: nextHeCode,
        id: nextHeCode,
        previousHeCode: suggestion.heCode,
        patternCategory,
        meaningCategory,
        colorCategory,
        sequence,
        categoryLabels: makeCategoryLabels(patternCategory, meaningCategory, colorCategory),
      });
    });

    const successfulIds = new Set<string>();
    const failures: string[] = [];

    try {
      for (const [heCode, entry] of patches) {
        const response = await fetch(`/api/admin/patterns/${encodeURIComponent(heCode)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify(entry.patch),
        });
        try {
          await readApiPayload(response, `应用 ${heCode} 审核修改`);
          entry.selectedIds.forEach((id) => successfulIds.add(id));
        } catch (nextError) {
          failures.push(`${heCode}：${nextError instanceof Error ? nextError.message : '应用失败'}`);
        }
      }
      setMessage([
        `已尝试 ${patches.size} 条纹样审核修改。`,
        `成功 ${successfulIds.size} 个勾选项，失败 ${failures.length} 条纹样。`,
        failures.length ? `失败清单：\n${failures.map((failure) => `- ${failure}`).join('\n')}` : '全部勾选项已应用。',
      ].join('\n'));
      setSelectedEraIds(new Set([...selectedEraIds].filter((id) => !successfulIds.has(id))));
      setSelectedCategoryIds(new Set([...selectedCategoryIds].filter((id) => !successfulIds.has(id))));
      if (successfulIds.size > 0) await refresh();
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : '应用审核修改失败。');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-fuchsia-300">资料审核 · 点选确认</p>
            <h2 className="mt-2 text-2xl font-medium text-white/90">纹样文本与编码审核</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              这里列出可确认的年代规范项和需要人工批准的分类建议。勾选后点击应用，系统只修改你勾选的条目。
            </p>
          </div>
          <button onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-sm text-white/70 hover:text-white">
            <RefreshCw className="h-4 w-4" />
            刷新数据
          </button>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="rounded border border-white/10 bg-black/20 p-4 text-sm text-white/60">
            当前数据来源：<span className={source === 'api' ? 'text-green-300' : 'text-amber-300'}>{source === 'api' ? '在线 Firestore' : '本地档案降级'}</span>
            {source !== 'api' && <span className="ml-2 text-amber-200/80">需要接口正常后才能应用修改。</span>}
          </div>
          <input
            type="password"
            value={adminToken}
            onChange={(event) => {
              setAdminToken(event.target.value);
              localStorage.setItem('hanxiu:admin-token', event.target.value);
            }}
            placeholder="管理员接口令牌"
            className="rounded border border-white/20 bg-black/20 px-4 py-2 text-sm text-white outline-none focus:border-fuchsia-500"
          />
        </div>

        {error && <p className="mb-4 rounded border border-amber-300/20 bg-amber-950/20 p-3 text-sm text-amber-100/80">{error}</p>}
        {isLoading && <p className="mb-4 text-sm text-white/45">正在读取纹样数据……</p>}

        <section className="mb-6 rounded border border-white/10 bg-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <h3 className="text-base font-medium text-white/90">年代规范</h3>
              <p className="mt-1 text-xs text-white/45">按你确认的规则：保留“当代（参考××）”，不再混写“复原/采集”。</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fuchsia-100">
              <input type="checkbox" checked={visibleEraSuggestions.length > 0 && selectedEraIds.size === visibleEraSuggestions.length} onChange={(event) => setAllEra(event.target.checked)} className="h-4 w-4 accent-fuchsia-500" />
              全选年代项
            </label>
          </div>
          <div className="divide-y divide-white/10">
            {visibleEraSuggestions.map((suggestion) => (
              <label key={suggestion.id} className="grid cursor-pointer gap-3 px-4 py-3 text-sm hover:bg-white/[0.03] md:grid-cols-[auto_1fr]">
                <input
                  type="checkbox"
                  checked={selectedEraIds.has(suggestion.id)}
                  onChange={() => toggleSet(setSelectedEraIds, selectedEraIds, suggestion.id)}
                  className="mt-1 h-4 w-4 accent-fuchsia-500"
                />
                <div>
                  <div className="font-mono text-xs text-fuchsia-200">{formatHECodeForDisplay(suggestion.heCode)}</div>
                  <div className="mt-1 text-white/85">{suggestion.title}</div>
                  <div className="mt-1 text-white/45">
                    {suggestion.current} <span className="mx-2 text-white/30">→</span> <span className="text-green-200">{suggestion.target}</span>
                  </div>
                </div>
              </label>
            ))}
            {!visibleEraSuggestions.length && <div className="px-4 py-6 text-sm text-white/45">当前没有待处理的年代规范项。</div>}
          </div>
        </section>

        <section className="rounded border border-white/10 bg-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <h3 className="text-base font-medium text-white/90">分类建议</h3>
              <p className="mt-1 text-xs text-white/45">按主体形象占比 + 综合使用场景/文化语境判断；动物区分瑞兽与普通动物。</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fuchsia-100">
              <input type="checkbox" checked={visibleCategorySuggestions.length > 0 && selectedCategoryIds.size === visibleCategorySuggestions.length} onChange={(event) => setAllCategory(event.target.checked)} className="h-4 w-4 accent-fuchsia-500" />
              全选分类项
            </label>
          </div>
          <div className="divide-y divide-white/10">
            {visibleCategorySuggestions.map((suggestion) => (
              <label key={suggestion.id} className="grid cursor-pointer gap-3 px-4 py-4 text-sm hover:bg-white/[0.03] md:grid-cols-[auto_1fr]">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.has(suggestion.id)}
                  onChange={() => toggleSet(setSelectedCategoryIds, selectedCategoryIds, suggestion.id)}
                  className="mt-1 h-4 w-4 accent-fuchsia-500"
                />
                <div>
                  <div className="font-mono text-xs text-fuchsia-200">{formatHECodeForDisplay(suggestion.heCode)}</div>
                  <div className="mt-1 text-white/90">{suggestion.title}</div>
                  <div className="mt-2 font-mono text-xs text-white/50">
                    {formatCategoryTriplet(suggestion.current)} <span className="mx-2 text-white/30">→</span> <span className="text-green-200">{formatCategoryTriplet(suggestion.target)}</span>
                  </div>
                  <p className="mt-2 leading-6 text-white/55">{suggestion.reason}</p>
                </div>
              </label>
            ))}
            {!visibleCategorySuggestions.length && <div className="px-4 py-6 text-sm text-white/45">当前没有待批准的分类建议。</div>}
          </div>
        </section>

        <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded border border-fuchsia-300/20 bg-[#150918]/95 p-4 shadow-2xl backdrop-blur">
          <div className="text-sm text-white/65">已选择 <span className="text-fuchsia-200">{selectedCount}</span> 项</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedEraIds(new Set());
                setSelectedCategoryIds(new Set());
              }}
              className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              清空选择
            </button>
            <button
              type="button"
              disabled={!canApply}
              onClick={() => void applySelected()}
              className="inline-flex items-center gap-2 rounded bg-fuchsia-600 px-5 py-2 text-sm text-white hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
              应用勾选修改
            </button>
          </div>
        </div>

        {message && <p className="mt-4 whitespace-pre-wrap rounded border border-white/10 bg-black/20 p-3 text-sm text-fuchsia-100">{message}</p>}
      </div>
    </div>
  );
}
