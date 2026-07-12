import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Flower2, Layers3, LayoutGrid, Palette, Shapes, Sparkles } from 'lucide-react';
import CircularGallery from '../components/CircularGallery';
import { mockPatterns } from '../data';
import { stitchTechniques } from '../lib/stitches';
import type { MultilingualString, PatternGene } from '../types';
import {
  buildHECode,
  getPatternClassification,
} from '../lib/classification';

type ShowcaseCard = {
  titleZh: string;
  titleEn: string;
  labelZh: string;
  labelEn: string;
  textZh: string;
  textEn: string;
  imageUrl: string;
  icon: typeof Flower2;
};

const symbolShowcaseCards: ShowcaseCard[] = [
  { titleZh: '\u82b1\u9e1f\u7eb9', titleEn: 'Floral and Bird Motifs', labelZh: '\u81ea\u7136\u751f\u606f', labelEn: 'Nature Motifs', textZh: '\u4ee5\u7261\u4e39\u3001\u83b2\u82b1\u3001\u8776\u9e1f\u6784\u6210\u795d\u9882\u79e9\u5e8f\uff0c\u8bb0\u5f55\u6c49\u7ee3\u4ece\u6c11\u95f4\u5ba1\u7f8e\u5230\u793c\u4fd7\u8868\u8fbe\u7684\u7eb9\u6837\u57fa\u56e0\u3002', textEn: 'Peonies, lotus, butterflies and birds form auspicious visual orders in Han embroidery.', imageUrl: mockPatterns[0]?.imageUrl || '', icon: Flower2 },
  { titleZh: '\u795e\u517d\u7eb9', titleEn: 'Auspicious Beast Motifs', labelZh: '\u745e\u610f\u62a4\u4f51', labelEn: 'Auspicious Protection', textZh: '\u51e4\u3001\u9f99\u3001\u745e\u517d\u7b49\u5f62\u8c61\u627f\u8f7d\u7948\u798f\u4e0e\u5b88\u62a4\uff0c\u5728\u7ebf\u811a\u5bc6\u5ea6\u548c\u8272\u5f69\u5c42\u6b21\u4e2d\u5f62\u6210\u7cbe\u795e\u8c61\u5f81\u3002', textEn: 'Phoenix, dragon and auspicious animals carry blessings through dense stitches and layered color.', imageUrl: mockPatterns[1]?.imageUrl || '', icon: Sparkles },
  { titleZh: '\u51e0\u4f55\u7eb9', titleEn: 'Geometric Motifs', labelZh: '\u79e9\u5e8f\u9aa8\u67b6', labelEn: 'Structural Order', textZh: '\u4e07\u5b57\u3001\u56de\u7eb9\u3001\u8fde\u73e0\u4e0e\u4e91\u96f7\u7eb9\u6784\u6210\u53ef\u590d\u7528\u7684\u7ed3\u6784\u9aa8\u67b6\uff0c\u4f7f\u4f20\u7edf\u7eb9\u6837\u80fd\u88ab\u7f16\u7801\u4e0e\u68c0\u7d22\u3002', textEn: 'Wan, fret and cloud-thunder motifs form reusable structures for coding and retrieval.', imageUrl: mockPatterns[2]?.imageUrl || '', icon: Shapes },
  { titleZh: '\u6587\u5b57\u7eb9', titleEn: 'Character Motifs', labelZh: '\u5409\u8bed\u7b26\u53f7', labelEn: 'Auspicious Characters', textZh: '\u798f\u3001\u5bff\u3001\u559c\u7b49\u6587\u5b57\u4e0e\u88c5\u9970\u7ebf\u811a\u7ec4\u5408\uff0c\u5c06\u795d\u613f\u76f4\u63a5\u8f6c\u5316\u4e3a\u53ef\u8bc6\u522b\u7684\u7eb9\u6837\u7b26\u53f7\u3002', textEn: 'Fu, Shou and Xi characters combine with ornamental stitches as readable symbolic motifs.', imageUrl: mockPatterns[6]?.imageUrl || mockPatterns[0]?.imageUrl || '', icon: LayoutGrid },
  { titleZh: '\u5668\u7269\u7eb9', titleEn: 'Object Motifs', labelZh: '\u5668\u7528\u610f\u8c61', labelEn: 'Object Imagery', textZh: '\u4ee5\u74f6\u3001\u76d8\u3001\u5982\u610f\u7b49\u5668\u7269\u4e3a\u7eb9\u6837\u7ebf\u7d22\uff0c\u627f\u8f7d\u5e73\u5b89\u3001\u5706\u6ee1\u4e0e\u793c\u4fd7\u79e9\u5e8f\u3002', textEn: 'Vases, plates and ritual objects carry meanings of peace, completeness and ceremony.', imageUrl: mockPatterns[7]?.imageUrl || mockPatterns[1]?.imageUrl || '', icon: Shapes },
  { titleZh: '\u590d\u5408\u7eb9', titleEn: 'Composite Motifs', labelZh: '\u591a\u5143\u5171\u751f', labelEn: 'Composite Order', textZh: '\u82b1\u9e1f\u3001\u6587\u5b57\u3001\u51e0\u4f55\u4e0e\u745e\u517d\u5143\u7d20\u5171\u6784\uff0c\u5f62\u6210\u591a\u5c42\u7ea7\u7684\u6c49\u7ee3\u7eb9\u6837\u53d9\u4e8b\u3002', textEn: 'Floral, character, geometric and auspicious elements form layered Han embroidery narratives.', imageUrl: mockPatterns[8]?.imageUrl || mockPatterns[2]?.imageUrl || '', icon: Sparkles },
];

const techniqueIcons = [Layers3, Palette, LayoutGrid, Sparkles];

const techniqueShowcaseCards: ShowcaseCard[] = stitchTechniques.map((stitch, index) => ({
  titleZh: stitch.name,
  titleEn: stitch.enName,
  labelZh: stitch.name,
  labelEn: stitch.enName,
  textZh: stitch.summary['zh-CN'],
  textEn: stitch.summary.en || stitch.summary['zh-CN'],
  imageUrl: stitch.imageUrl,
  icon: techniqueIcons[index % techniqueIcons.length],
}));

type ComparisonDimension = 'pattern' | 'meaning' | 'color' | 'technique' | 'carrier';

type ComparisonCard = {
  pattern: PatternGene;
  reason: string;
  differences: string[];
};

const comparisonDimensions: Array<{ key: ComparisonDimension; zh: string; en: string }> = [
  { key: 'pattern', zh: '\u540c\u7eb9\u6837\u5927\u7c7b', en: 'Same Pattern Type' },
  { key: 'meaning', zh: '\u540c\u5bd3\u610f', en: 'Same Meaning' },
  { key: 'color', zh: '\u540c\u8272\u7cfb', en: 'Same Color Group' },
  { key: 'technique', zh: '\u540c\u9488\u6cd5', en: 'Same Technique' },
];

function normalizeField(value: string | undefined) {
  return (value || '').trim().toLowerCase();
}

function getComparisonLabel(dimension: ComparisonDimension, isEnglish: boolean) {
  const option = comparisonDimensions.find((item) => item.key === dimension);
  return option ? (isEnglish ? option.en : option.zh) : '';
}

function hasTechniqueOverlap(current: PatternGene, candidate: PatternGene, language: keyof MultilingualString) {
  const currentTechniques = new Set(splitTechniques(current, language).map(normalizeField));
  const candidateTechniques = splitTechniques(candidate, language).map(normalizeField);
  return currentTechniques.size > 0 && candidateTechniques.some((technique) => currentTechniques.has(technique));
}

function matchesComparisonDimension(current: PatternGene, candidate: PatternGene, dimension: ComparisonDimension, language: keyof MultilingualString) {
  const currentClassification = getPatternClassification(current);
  const candidateClassification = getPatternClassification(candidate);

  if (dimension === 'pattern') return Boolean(currentClassification.patternCategory && currentClassification.patternCategory === candidateClassification.patternCategory);
  if (dimension === 'meaning') return Boolean(currentClassification.meaningCategory && currentClassification.meaningCategory === candidateClassification.meaningCategory);
  if (dimension === 'color') return Boolean(currentClassification.colorCategory && currentClassification.colorCategory === candidateClassification.colorCategory);
  if (dimension === 'technique') return hasTechniqueOverlap(current, candidate, language);
  return Boolean(normalizeField(current.carrier) && normalizeField(current.carrier) === normalizeField(candidate.carrier));
}

function getDifferenceTags(current: PatternGene, candidate: PatternGene, language: keyof MultilingualString, isEnglish: boolean) {
  const currentClassification = getPatternClassification(current);
  const candidateClassification = getPatternClassification(candidate);
  const tags: string[] = [];
  const add = (zh: string, en: string) => tags.push(isEnglish ? en : zh);

  if (currentClassification.patternCategory && candidateClassification.patternCategory && currentClassification.patternCategory !== candidateClassification.patternCategory) add('\u4e0d\u540c\u7eb9\u6837\u5927\u7c7b', 'Different pattern type');
  if (currentClassification.meaningCategory && candidateClassification.meaningCategory && currentClassification.meaningCategory !== candidateClassification.meaningCategory) add('\u4e0d\u540c\u5bd3\u610f', 'Different meaning');
  if (currentClassification.colorCategory && candidateClassification.colorCategory && currentClassification.colorCategory !== candidateClassification.colorCategory) add('\u4e0d\u540c\u8272\u7cfb', 'Different color group');
  if (splitTechniques(current, language).length > 0 && splitTechniques(candidate, language).length > 0 && !hasTechniqueOverlap(current, candidate, language)) add('\u4e0d\u540c\u9488\u6cd5', 'Different technique');
  if (normalizeField(current.carrier) && normalizeField(candidate.carrier) && normalizeField(current.carrier) !== normalizeField(candidate.carrier)) add('\u4e0d\u540c\u8f7d\u4f53', 'Different carrier');
  if (normalizeField(current.era) && normalizeField(candidate.era) && normalizeField(current.era) !== normalizeField(candidate.era)) add('\u4e0d\u540c\u5e74\u4ee3', 'Different period');

  return tags.slice(0, 3);
}

function getRelatedComparisonCards(current: PatternGene, dimension: ComparisonDimension, language: keyof MultilingualString, isEnglish: boolean): ComparisonCard[] {
  return mockPatterns
    .filter((candidate) => candidate.id !== current.id && matchesComparisonDimension(current, candidate, dimension, language))
    .map((pattern) => ({
      pattern,
      reason: getComparisonLabel(dimension, isEnglish),
      differences: getDifferenceTags(current, pattern, language, isEnglish),
    }))
    .slice(0, 4);
}

function getMLStr(field: MultilingualString | undefined, language: keyof MultilingualString, fallback: string) {
  if (!field) return fallback;
  return field[language] || field['zh-CN'] || field.en || fallback;
}

function getPatternName(pattern: PatternGene, language: keyof MultilingualString) {
  return getMLStr(pattern.name, language, pattern.heCode);
}

function getCanonicalCode(pattern: PatternGene) {
  const classification = getPatternClassification(pattern);
  return buildHECode({
    patternCategory: classification.patternCategory,
    meaningCategory: classification.meaningCategory,
    colorCategory: classification.colorCategory,
    sequence: classification.sequence,
  }) || pattern.heCode;
}

function splitTechniques(pattern: PatternGene, language: keyof MultilingualString) {
  return getMLStr(pattern.craft, language, '')
    .split(/[、,，/|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getVisibleShowcaseCards(cards: ShowcaseCard[], startIndex: number) {
  const visibleCount = Math.min(3, cards.length);
  return Array.from({ length: visibleCount }, (_, index) => cards[(startIndex + index) % cards.length]);
}

export function GeneDeconstruct() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language as keyof MultilingualString;
  const isEnglish = i18n.language === 'en';
  const categoryLanguage = isEnglish ? 'en' : 'zh';
  const fallback = isEnglish ? 'No data available' : '暂无资料';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [symbolShowcaseIndex, setSymbolShowcaseIndex] = useState(0);
  const [techniqueShowcaseIndex, setTechniqueShowcaseIndex] = useState(0);
  const [expandedShowcaseCard, setExpandedShowcaseCard] = useState<ShowcaseCard | null>(null);
  const [comparisonIndex, setComparisonIndex] = useState(0);
  const [activeComparisonDimension, setActiveComparisonDimension] = useState<ComparisonDimension>('pattern');
  const [hoveredRelatedId, setHoveredRelatedId] = useState<string | null>(null);

  const selected = mockPatterns[selectedIndex] || mockPatterns[0];
  const galleryItems = useMemo(
    () =>
      mockPatterns.slice(0, 10).map((pattern) => ({
        image: pattern.imageUrl,
        text: getPatternName(pattern, currentLang),
      })),
    [currentLang],
  );
  const visibleSymbolShowcaseCards = useMemo(() => getVisibleShowcaseCards(symbolShowcaseCards, symbolShowcaseIndex), [symbolShowcaseIndex]);
  const visibleTechniqueShowcaseCards = useMemo(() => getVisibleShowcaseCards(techniqueShowcaseCards, techniqueShowcaseIndex), [techniqueShowcaseIndex]);
  const comparisonPattern = mockPatterns[comparisonIndex] || selected;
  const comparisonCode = getCanonicalCode(comparisonPattern);
  const comparisonCards = useMemo(() => getRelatedComparisonCards(comparisonPattern, activeComparisonDimension, currentLang, isEnglish), [activeComparisonDimension, comparisonPattern, currentLang, isEnglish]);

  const handleGalleryIndexChange = useCallback((index: number) => {
    const nextIndex = index % Math.min(10, mockPatterns.length);
    setSelectedIndex(nextIndex);
    setComparisonIndex(nextIndex);
  }, []);

  return (
    <main className="gene-deconstruct-page bg-black text-white">
      <section className="hanxiu-panel px-5 pb-10 pt-24">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center gap-8">
          <div className="max-w-3xl">
            <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              {isEnglish ? 'Back' : '\u8fd4\u56de\u4e0a\u4e00\u9875'}
            </button>
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'Pattern Analysis' : '\u7eb9\u6837\u89e3\u6790'}</p>
            <h1 className="mt-4 text-4xl font-semibold text-white md:text-6xl">{isEnglish ? 'Pattern Analysis' : '\u7eb9\u6837\u89e3\u6790'}</h1>
            <p className="mt-5 text-base leading-8 text-white/60">{isEnglish ? 'Select a pattern to view archive data, symbolic analysis and technique breakdown in sync.' : '\u9009\u4e2d\u7eb9\u6837\uff0c\u540c\u6b65\u5c55\u793a\u6863\u6848\u3001\u7b26\u53f7\u5206\u6790\u4e0e\u6280\u827a\u62c6\u89e3\u3002'}</p>
          </div>

          <div className="gene-circular-gallery-shell gene-circular-gallery-shell-full">
            <CircularGallery
              items={galleryItems}
              bend={2.35}
              textColor="#f7d8ff"
              borderRadius={0.06}
              scrollSpeed={1.8}
              scrollEase={0.045}
              font="600 28px Noto Sans SC"
              onActiveIndexChange={handleGalleryIndexChange}
            />
          </div>
        </div>
      </section>

      <section className="hanxiu-panel bg-black px-5 py-24">
        <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'Pattern Classification' : '\u7b26\u53f7\u5206\u7c7b'}</h2>
            <p className="mt-5 text-base leading-8 text-white/60">{isEnglish ? 'Select a symbol to view symbolic analysis in sync.' : '\u9009\u4e2d\u7b26\u53f7\uff0c\u540c\u6b65\u5c55\u793a\u7b26\u53f7\u5206\u6790\u3002'}</p>
          </div>

          <div className="group/showcase relative mx-auto w-full max-w-full md:max-w-[calc(100%-8rem)]">
            <button
              type="button"
              onClick={() => setSymbolShowcaseIndex((index) => (index - 1 + symbolShowcaseCards.length) % symbolShowcaseCards.length)}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fuchsia-300/35 bg-black/72 text-fuchsia-100 opacity-40 shadow-[0_0_24px_rgba(236,72,153,0.24)] backdrop-blur transition-all hover:border-fuchsia-200 hover:bg-fuchsia-950/70 hover:opacity-100 group-hover/showcase:opacity-100 md:-left-16"
              aria-label={isEnglish ? 'Previous pattern cards' : '\u5411\u5de6\u7ffb\u9605\u7b26\u53f7\u5206\u7c7b\u5361\u7247'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="grid gap-6 md:grid-cols-3">
              {visibleSymbolShowcaseCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <button key={card.titleZh} type="button" onClick={() => setExpandedShowcaseCard(card)} className="group relative min-h-[410px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-8 text-left opacity-0 transition-all duration-300 animate-[gene-origin-card-in_420ms_ease_both] hover:-translate-y-1 hover:border-fuchsia-300/45" style={{ animationDelay: String(index * 90) + 'ms' }}>
                    <img src={card.imageUrl} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-contain p-12 opacity-[0.28] transition-transform duration-500 group-hover:scale-110" />
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(236,72,153,0.22),rgba(0,0,0,0.46)_42%,rgba(0,0,0,0.9))]" />
                    <div className="relative z-10 flex h-full flex-col justify-end gap-5">
                      <span className="hanxiu-symbol-icon"><Icon className="h-8 w-8" /></span>
                      <span className="text-sm text-fuchsia-200/70">{isEnglish ? card.labelEn : card.labelZh}</span>
                      <strong className="text-4xl font-semibold text-white">{isEnglish ? card.titleEn : card.titleZh}</strong>
                      <span className="line-clamp-3 text-base leading-8 text-white/70">{isEnglish ? card.textEn : card.textZh}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSymbolShowcaseIndex((index) => (index + 1) % symbolShowcaseCards.length)}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fuchsia-300/35 bg-black/72 text-fuchsia-100 opacity-40 shadow-[0_0_24px_rgba(236,72,153,0.24)] backdrop-blur transition-all hover:border-fuchsia-200 hover:bg-fuchsia-950/70 hover:opacity-100 group-hover/showcase:opacity-100 md:-right-16"
              aria-label={isEnglish ? 'Next pattern cards' : '\u5411\u53f3\u7ffb\u9605\u7b26\u53f7\u5206\u7c7b\u5361\u7247'}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="hanxiu-panel bg-[#09090b] px-5 py-24">
        <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'Technique Classification' : '\u6280\u827a\u5206\u7c7b'}</h2>
            <p className="mt-5 text-base leading-8 text-white/60">{isEnglish ? 'Select a technique to view technique breakdown in sync.' : '\u9009\u4e2d\u6280\u827a\uff0c\u540c\u6b65\u5c55\u793a\u6280\u827a\u62c6\u89e3\u3002'}</p>
          </div>

          <div className="group/showcase relative mx-auto w-full max-w-full md:max-w-[calc(100%-8rem)]">
            <button
              type="button"
              onClick={() => setTechniqueShowcaseIndex((index) => (index - 1 + techniqueShowcaseCards.length) % techniqueShowcaseCards.length)}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fuchsia-300/35 bg-black/72 text-fuchsia-100 opacity-40 shadow-[0_0_24px_rgba(236,72,153,0.24)] backdrop-blur transition-all hover:border-fuchsia-200 hover:bg-fuchsia-950/70 hover:opacity-100 group-hover/showcase:opacity-100 md:-left-16"
              aria-label={isEnglish ? 'Previous technique cards' : '\u5411\u5de6\u7ffb\u9605\u6280\u827a\u5206\u7c7b\u5361\u7247'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="grid gap-6 md:grid-cols-3">
              {visibleTechniqueShowcaseCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <button key={card.titleZh} type="button" onClick={() => setExpandedShowcaseCard(card)} className="group relative min-h-[410px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-8 text-left opacity-0 transition-all duration-300 animate-[gene-origin-card-in_420ms_ease_both] hover:-translate-y-1 hover:border-fuchsia-300/45" style={{ animationDelay: String(index * 90) + 'ms' }}>
                    <img src={card.imageUrl} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-contain p-12 opacity-[0.28] transition-transform duration-500 group-hover:scale-110" />
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(236,72,153,0.22),rgba(0,0,0,0.46)_42%,rgba(0,0,0,0.9))]" />
                    <div className="relative z-10 flex h-full flex-col justify-end gap-5">
                      <span className="hanxiu-symbol-icon"><Icon className="h-8 w-8" /></span>
                      <span className="text-sm text-fuchsia-200/70">{isEnglish ? card.labelEn : card.labelZh}</span>
                      <strong className="text-4xl font-semibold text-white">{isEnglish ? card.titleEn : card.titleZh}</strong>
                      <span className="line-clamp-3 text-base leading-8 text-white/70">{isEnglish ? card.textEn : card.textZh}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setTechniqueShowcaseIndex((index) => (index + 1) % techniqueShowcaseCards.length)}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fuchsia-300/35 bg-black/72 text-fuchsia-100 opacity-40 shadow-[0_0_24px_rgba(236,72,153,0.24)] backdrop-blur transition-all hover:border-fuchsia-200 hover:bg-fuchsia-950/70 hover:opacity-100 group-hover/showcase:opacity-100 md:-right-16"
              aria-label={isEnglish ? 'Next technique cards' : '\u5411\u53f3\u7ffb\u9605\u6280\u827a\u5206\u7c7b\u5361\u7247'}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="gene-deconstruct-workspace px-5 py-20">
        <div className="gene-shell mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'Related Patterns' : '\u5173\u8054\u7eb9\u6837'}</p>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'Related Patterns' : '\u5173\u8054\u7eb9\u6837'}</h2>
              <p className="mt-4 text-sm leading-7 text-white/54">
                {isEnglish
                  ? 'Browse patterns related to the selected archive entry.'
                  : '\u67e5\u770b\u4e0e\u5f53\u524d\u7eb9\u6837\u76f8\u5173\u7684\u7eb9\u6837\u6863\u6848\u3002'}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {comparisonDimensions.map((dimension) => (
                  <button
                    key={dimension.key}
                    onClick={() => setActiveComparisonDimension(dimension.key)}
                    className={'shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ' + (activeComparisonDimension === dimension.key ? 'border-fuchsia-400 bg-fuchsia-950/30 text-white shadow-[0_0_18px_rgba(217,70,239,0.16)]' : 'border-white/12 bg-white/[0.03] text-white/48 hover:border-fuchsia-200/35 hover:text-white')}
                  >
                    {isEnglish ? dimension.en : dimension.zh}
                  </button>
                ))}
              </div>
              <div className="gene-related-meta flex items-center gap-3 text-xs text-white/30">
                <span>{getComparisonLabel(activeComparisonDimension, isEnglish)}</span>
                <span>{isEnglish ? comparisonCards.length + ' related' : '\u5173\u8054 ' + comparisonCards.length + ' \u6761'}</span>
              </div>
            </div>
          </div>

          <div className="gene-related-layout grid min-h-0 flex-1 gap-8 lg:grid-cols-[0.88fr_1.42fr]">
            <section className="gene-related-primary min-h-0">
              <div className="gene-related-hero-card">
                <img src={comparisonPattern.imageUrl} alt={getPatternName(comparisonPattern, currentLang)} />
                <div className="gene-related-hero-info">
                  <strong className="min-w-0 truncate text-2xl text-white">{getPatternName(comparisonPattern, currentLang)}</strong>
                  <Link
                    to={'/pattern/' + comparisonCode + '#basic-record'}
                    className="gene-related-record-button inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 text-fuchsia-100 transition-all hover:border-fuchsia-200/70"
                    aria-label={isEnglish ? 'View Full Record' : '\u67e5\u770b\u5b8c\u6574\u6863\u6848'}
                    title={isEnglish ? 'View Full Record' : '\u67e5\u770b\u5b8c\u6574\u6863\u6848'}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>

            <section className="gene-related-secondary min-h-0">
              {comparisonCards.length > 0 ? (
                <div className="gene-related-grid grid h-full min-h-0 gap-6 md:grid-cols-2">
                  {comparisonCards.map((card, index) => {
                    const isDimmed = Boolean(hoveredRelatedId && hoveredRelatedId !== card.pattern.id);
                    const nextIndex = mockPatterns.findIndex((pattern) => pattern.id === card.pattern.id);
                    return (
                      <button
                        key={card.pattern.id}
                        type="button"
                        onClick={() => {
                          if (nextIndex >= 0) setComparisonIndex(nextIndex);
                        }}
                        onMouseEnter={() => setHoveredRelatedId(card.pattern.id)}
                        onMouseLeave={() => setHoveredRelatedId(null)}
                        onFocus={() => setHoveredRelatedId(card.pattern.id)}
                        onBlur={() => setHoveredRelatedId(null)}
                        className={'group gene-related-tile animate-[gene-origin-card-in_360ms_ease_both] ' + (isDimmed ? 'opacity-35' : 'opacity-100')}
                        style={{ animationDelay: String(index * 70) + 'ms' }}
                      >
                        <img src={card.pattern.imageUrl} alt={getPatternName(card.pattern, currentLang)} />
                        <span className="gene-related-tile-shade" />
                        <span className="gene-related-tile-info">
                          <strong>{getPatternName(card.pattern, currentLang)}</strong>
                          <span>{getCanonicalCode(card.pattern)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-center text-sm text-white/46">
                  {isEnglish ? 'No related patterns found for this dimension.' : '\u5f53\u524d\u7ef4\u5ea6\u6682\u65e0\u5173\u8054\u7eb9\u6837\u3002'}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
      {expandedShowcaseCard && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/78 px-5 backdrop-blur-md" onClick={() => setExpandedShowcaseCard(null)}>
          <div className="grid w-full max-w-6xl overflow-hidden rounded-lg border border-white/12 bg-[#050506] shadow-[0_24px_120px_rgba(0,0,0,0.7)] md:grid-cols-[1.08fr_0.92fr]" onClick={(event) => event.stopPropagation()}>
            <div className="min-h-[420px] bg-white/[0.02] p-8"><img src={expandedShowcaseCard.imageUrl} alt="" className="h-full max-h-[640px] w-full object-contain" /></div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="text-sm tracking-[0.28em] text-fuchsia-300/78">{isEnglish ? expandedShowcaseCard.labelEn : expandedShowcaseCard.labelZh}</span>
              <h3 className="mt-7 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? expandedShowcaseCard.titleEn : expandedShowcaseCard.titleZh}</h3>
              <p className="mt-8 max-w-xl text-base leading-9 text-white/68">{isEnglish ? expandedShowcaseCard.textEn : expandedShowcaseCard.textZh}</p>
              <button type="button" onClick={() => setExpandedShowcaseCard(null)} className="mt-8 w-max rounded-full border border-white/14 px-5 py-2 text-sm text-white/70 transition-colors hover:border-fuchsia-300/50 hover:text-white">{isEnglish ? 'Close' : '\u5173\u95ed'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
