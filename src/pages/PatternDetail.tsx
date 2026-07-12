import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Share2, Star } from 'lucide-react';
import { GeneWall } from '../components/GeneWall';
import { mockPatterns } from '../data';
import { patternVisualAnalysis } from '../generated/pattern-visual-analysis';
import { findStitchesInText } from '../lib/stitches';
import type { MultilingualString, PatternGene } from '../types';
import { buildHECode, getCategoryLabel, getPatternClassification, parseHECode } from '../lib/classification';

const favoriteStorageKey = 'hanxiu:favorites';

type DetailTab = 'basic' | 'meaning' | 'craft' | 'analysis' | 'copyright';
type ImageMode = 'pattern' | 'carrier' | 'outline';

const detailTabs: DetailTab[] = ['basic', 'meaning', 'craft', 'analysis', 'copyright'];
const imageModes: ImageMode[] = ['pattern'];

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]') as string[];
  } catch {
    return [];
  }
}

function getMLStr(field: MultilingualString | undefined, language: keyof MultilingualString, fallback = '暂无资料') {
  if (!field) return fallback;
  return field[language] || field['zh-CN'] || field.en || fallback;
}

function getName(pattern: PatternGene, language: keyof MultilingualString) {
  return getMLStr(pattern.name, language, pattern.heCode);
}

function getEnglishName(pattern: PatternGene) {
  return pattern.name.en || pattern.name['zh-CN'] || pattern.heCode;
}

function getDisplayValue(value: string | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}

function getCanonicalCode(pattern: PatternGene) {
  const classification = getPatternClassification(pattern);
  return buildHECode({
    patternCategory: classification.patternCategory,
    meaningCategory: classification.meaningCategory,
    colorCategory: classification.colorCategory,
    sequence: classification.sequence,
  });
}

function getCategoryDisplay(pattern: PatternGene, type: 'pattern' | 'meaning' | 'color', language: 'zh' | 'en') {
  const classification = getPatternClassification(pattern);
  const code = type === 'pattern'
    ? classification.patternCategory
    : type === 'meaning'
      ? classification.meaningCategory
      : classification.colorCategory;
  const label = code ? getCategoryLabel(type, code, language) : '';
  return code && label ? `${code} · ${label}` : language === 'en' ? 'No data' : '暂无资料';
}

function splitTechniques(pattern: PatternGene, language: keyof MultilingualString) {
  return getMLStr(pattern.craft, language, '')
    .split(/[、,，/|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSimilarPatterns(pattern: PatternGene, language: keyof MultilingualString) {
  const current = getPatternClassification(pattern);
  const techniques = new Set(splitTechniques(pattern, language));

  return mockPatterns
    .filter((candidate) => candidate.id !== pattern.id)
    .map((candidate) => {
      const other = getPatternClassification(candidate);
      const otherTechniques = splitTechniques(candidate, language);
      let score = 0;
      if (current.patternCategory && current.patternCategory === other.patternCategory) score += 3;
      if (current.meaningCategory && current.meaningCategory === other.meaningCategory) score += 2;
      if (current.colorCategory && current.colorCategory === other.colorCategory) score += 2;
      if (otherTechniques.some((technique) => techniques.has(technique))) score += 2;
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.candidate);
}

function downloadRecord(pattern: PatternGene) {
  const record = {
    id: pattern.id,
    heCode: getCanonicalCode(pattern) || pattern.heCode,
    name: pattern.name,
    era: pattern.era,
    region: pattern.region,
    carrier: pattern.carrier,
    craft: pattern.craft,
    symbolism: pattern.symbolism,
    copyrightOwner: pattern.copyrightOwner,
  };
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${record.heCode || pattern.id}-record.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function PatternDetail() {
  const { heCode } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as keyof MultilingualString;
  const isEnglish = i18n.language === 'en';
  const categoryLanguage = isEnglish ? 'en' : 'zh';
  const fallback = isEnglish ? 'No data' : '暂无资料';
  const [activeImageMode, setActiveImageMode] = useState<ImageMode>('pattern');
  const [activeTab, setActiveTab] = useState<DetailTab>('basic');
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(() => readFavorites());
  const [shareFeedback, setShareFeedback] = useState(false);

  const pattern = mockPatterns.find((item) => item.heCode === heCode || getCanonicalCode(item) === heCode);

  const similarPatterns = useMemo(() => (pattern ? getSimilarPatterns(pattern, currentLang) : []), [currentLang, pattern]);
  const matchedStitches = useMemo(
    () => (pattern ? findStitchesInText(getMLStr(pattern.craft, currentLang, '')) : []),
    [currentLang, pattern],
  );

  useEffect(() => {
    setActiveTab('basic');
    setActiveImageMode('pattern');
    setIsZoomed(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [heCode]);

  if (!pattern) {
    return <div className="pt-32 text-center text-white">{isEnglish ? 'Pattern not found' : '未找到纹样'}</div>;
  }

  const canonicalCode = getCanonicalCode(pattern) || pattern.heCode;
  const parsedCode = parseHECode(canonicalCode);
  const name = getName(pattern, currentLang);
  const isFavorite = favoriteCodes.includes(pattern.heCode);
  const copyrightText = getDisplayValue(pattern.copyrightOwner, fallback);
  const sourceText = getMLStr(pattern.origin, currentLang, fallback);
  const visualAnalysis = pattern.visualAnalysis || patternVisualAnalysis[pattern.heCode] || patternVisualAnalysis[canonicalCode];
  const imageLabel = {
    pattern: isEnglish ? 'Pattern' : '高清纹样图',
    carrier: isEnglish ? 'Carrier' : '实物载体图',
    outline: isEnglish ? 'Outline' : '轮廓图',
  } satisfies Record<ImageMode, string>;

  const toggleFavorite = () => {
    setFavoriteCodes((current) => {
      const next = current.includes(pattern.heCode)
        ? current.filter((code) => code !== pattern.heCode)
        : [...current, pattern.heCode];
      localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('hanxiu:favorites-updated'));
      return next;
    });
  };

  const sharePattern = async () => {
    const text = `${name} ${canonicalCode}`;
    if (navigator.share) {
      await navigator.share({ title: name, text });
    } else {
      await navigator.clipboard?.writeText(text);
    }
    setShareFeedback(true);
    window.setTimeout(() => setShareFeedback(false), 1200);
  };

  const fields = [
    [t('pattern.category'), getCategoryDisplay(pattern, 'pattern', categoryLanguage)],
    [t('pattern.meaning_category'), getCategoryDisplay(pattern, 'meaning', categoryLanguage)],
    [t('pattern.color_category'), getCategoryDisplay(pattern, 'color', categoryLanguage)],
    [t('pattern.era'), getDisplayValue(pattern.era, fallback)],
    [t('pattern.region'), getDisplayValue(pattern.region, fallback)],
    [t('pattern.carrier'), getDisplayValue(pattern.carrier, fallback)],
    [t('pattern.craft'), getMLStr(pattern.craft, currentLang, fallback)],
    [t('pattern.source'), sourceText],
    [t('pattern.copyright'), copyrightText],
  ];

  const analysisItems = visualAnalysis ? [
    [isEnglish ? 'Original Pattern' : '原始纹样', getMLStr(visualAnalysis.originalPattern, currentLang, fallback)],
    [isEnglish ? 'Outline Extraction' : '轮廓提取', getMLStr(visualAnalysis.outlineExtraction, currentLang, fallback)],
    [isEnglish ? 'Main Color Ratio' : '主色比例', getMLStr(visualAnalysis.mainColorRatio, currentLang, fallback)],
    [isEnglish ? 'Pattern Unit' : '单元纹样', getMLStr(visualAnalysis.patternUnit, currentLang, fallback)],
    [isEnglish ? 'Symmetry' : '对称关系', getMLStr(visualAnalysis.symmetry, currentLang, fallback)],
    [isEnglish ? 'Repetition' : '重复规律', getMLStr(visualAnalysis.repetition, currentLang, fallback)],
    [isEnglish ? 'Composition Center' : '构图中心', getMLStr(visualAnalysis.compositionCenter, currentLang, fallback)],
    [isEnglish ? 'Structure Description' : '结构说明', getMLStr(visualAnalysis.structureDescription, currentLang, fallback)],
  ] : [];

  return (
    <div className="min-h-screen bg-[#08090a] pt-16 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 overflow-hidden px-5 lg:h-[calc(100vh-4rem)] lg:grid-cols-2">
        <div className="flex min-h-[58vh] flex-col justify-center overflow-hidden py-6 pr-0 lg:h-full lg:min-h-0 lg:py-8 lg:pr-8">
          <button onClick={() => navigate(-1)} className="mb-4 flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-sm text-white/45 transition-colors hover:border-fuchsia-300/35 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {t('nav.back')}
          </button>

          <div
            className="relative h-[calc(100vh-12rem)] max-h-[680px] w-full overflow-hidden border border-white/10 bg-black/20"
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setTransformOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`);
            }}
          >
            {activeImageMode === 'outline' ? (
              <svg className="h-full w-full" viewBox="0 0 640 640" aria-label={imageLabel.outline}>
                <path d="M82 402 C154 146, 284 168, 324 312 S490 498, 558 232" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="3" />
                <path d="M152 438 C232 348, 298 398, 374 298 C430 226, 502 236, 574 164" fill="none" stroke="rgba(232,121,249,.72)" strokeWidth="2" />
                <circle cx="326" cy="320" r="94" fill="none" stroke="rgba(255,255,255,.32)" />
              </svg>
            ) : (
              <img
                src={activeImageMode === 'carrier' ? pattern.originalImageUrl || pattern.imageUrl : pattern.imageUrl}
                alt={name}
                onClick={() => setIsZoomed((current) => !current)}
                className={`h-full w-full cursor-zoom-in object-contain transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                style={{ transformOrigin }}
              />
            )}
          </div>
        </div>

        <aside className="flex h-full items-center bg-black/24 py-6 pl-0 backdrop-blur-xl lg:border-l lg:border-white/10 lg:py-8 lg:pl-8 lg:overflow-hidden">
          <div className="mx-auto flex w-full max-w-xl flex-col justify-center">
            <p className="text-sm text-fuchsia-200/60">{getEnglishName(pattern)}</p>
            <h1 className="mt-2 text-3xl font-medium tracking-wide text-white/92">{name}</h1>
            <div className="mt-4 inline-flex rounded border border-white/10 bg-white/5 px-3 py-1 font-mono text-sm uppercase tracking-widest text-fuchsia-400">
              {canonicalCode}
            </div>
            {!parsedCode.isValid && <div className="mt-2 text-xs text-amber-300/80">{t('pattern.code_pending')}</div>}

            <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-2 border-y border-white/10 py-4 text-sm">
              {fields.map(([label, value]) => (
                <div key={label} className="contents">
                  <div className="col-span-1 text-white/40">{label}</div>
                  <div className="col-span-2 text-white/78">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <button onClick={toggleFavorite} className={`border px-3 py-3 text-sm transition-colors ${isFavorite ? 'border-fuchsia-500 bg-fuchsia-950/20 text-fuchsia-300' : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'}`}>
                <Star className="mx-auto mb-1 h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                {t('common.save')}
              </button>
              <button onClick={sharePattern} className="border border-white/20 px-3 py-3 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white">
                <Share2 className="mx-auto mb-1 h-4 w-4" />
                {shareFeedback ? (isEnglish ? 'Copied' : '已复制') : t('common.share')}
              </button>
              <button onClick={() => downloadRecord(pattern)} className="border border-fuchsia-400/40 bg-fuchsia-950/20 px-3 py-3 text-sm text-fuchsia-100 transition-colors hover:border-fuchsia-300/80">
                <Download className="mx-auto mb-1 h-4 w-4" />
                {t('common.download_record')}
              </button>
            </div>
          </div>
        </aside>
      </section>

      <section id="basic-record" className="mx-auto max-w-7xl px-5 py-16 scroll-mt-24">
        <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
          {detailTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${activeTab === tab ? 'border-fuchsia-400/70 bg-fuchsia-950/30 text-white' : 'border-white/10 text-white/46 hover:text-white'}`}>
              {t(`pattern.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.025] p-6 text-sm leading-8 text-white/70">
          {activeTab === 'basic' && (
            <div className="grid gap-3 md:grid-cols-2">
              {[...fields, [t('pattern.literature'), getMLStr(pattern.literature, currentLang, fallback)]].map(([label, value]) => (
                <div key={label} className="border-b border-white/5 pb-3">
                  <span className="block text-white/36">{label}</span>
                  <strong className="font-normal text-white/76">{value}</strong>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'meaning' && <p>{getMLStr(pattern.symbolism, currentLang, fallback)}</p>}
          {activeTab === 'craft' && (
            <div className="space-y-6">
              <p>{getMLStr(pattern.craft, currentLang, fallback)}</p>
              {matchedStitches.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {matchedStitches.map((stitch) => (
                    <article key={stitch.name} className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                      <div className="aspect-[4/3] bg-white">
                        <img src={stitch.imageUrl} alt={stitch.name} className="h-full w-full object-contain" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-medium text-white">{stitch.name}</h3>
                        <p className="mt-2 text-xs leading-6 text-white/58">{getMLStr(stitch.summary, currentLang, stitch.summary['zh-CN'])}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'analysis' && (
            <div className="grid gap-4 md:grid-cols-2">
              {analysisItems.map(([label, value]) => (
                <div key={label} className="rounded border border-white/8 bg-black/20 p-4">
                  <span className="block text-white/42">{label}</span>
                  <strong className="mt-2 block font-normal leading-7 text-white/76">{value}</strong>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'copyright' && (
            <div className="space-y-3">
              <p>{t('pattern.source')}: {sourceText}</p>
              <p>{isEnglish ? 'Image Source' : '图片来源'}: {copyrightText}</p>
              <p>{isEnglish ? 'Research Note' : '研究整理说明'}: {getMLStr(pattern.origin, currentLang, fallback)}</p>
              <p>{isEnglish ? 'Usage Scope' : '使用范围'}: {isEnglish ? 'Research display only. Commercial use requires authorization.' : '仅供研究展示，商业使用需授权。'}</p>
              <p>{t('pattern.copyright_notice')}: {copyrightText}</p>
            </div>
          )}
        </div>
      </section>

      {similarPatterns.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <h2 className="mb-8 text-2xl font-semibold text-white">{t('pattern.similar')}</h2>
          <GeneWall patterns={similarPatterns} showHoverInfo getMetaLabel={(item) => getCategoryDisplay(item, 'pattern', categoryLanguage)} />
        </section>
      )}
    </div>
  );
}
