import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Crown, Flower2, Layers3, Shapes, Sparkles, Wand2 } from 'lucide-react';
import { GeneWall } from '../components/GeneWall';
import { InteractiveBackground } from '../components/InteractiveBackground';
import { mockPatterns } from '../data';
import { archiveTopFilters, getCategoryLabel, getPatternClassification, matchesArchiveTopFilter } from '../lib/classification';
import { getLocalizedPatternName, getLocalizedText } from '../lib/multilingual';
import { stitchTechniques } from '../lib/stitches';
import type { PatternGene } from '../types';

type ClassificationCard = {
  title: string;
  enTitle: string;
  code: string;
  text: string;
  enText?: string;
  count: number;
  href: string;
  imageUrl: string;
  icon: typeof Flower2;
};

const symbolCategoryMeta = [
  {
    title: '自然纹样',
    enTitle: 'Nature Pattern',
    code: 'N',
    text: '来源于花卉、动物与自然物象的汉绣纹样。',
    enText: 'Han embroidery motifs derived from flowers, animals and natural forms.',
    icon: Flower2,
  },
  {
    title: '人文 / 民俗纹样',
    enTitle: 'Humanities Pattern',
    code: 'H',
    text: '记录礼俗、人物与日常生活意象的汉绣纹样。',
    enText: 'Han embroidery motifs recording ritual customs, figures and everyday-life imagery.',
    icon: Crown,
  },
  {
    title: '几何 / 抽象纹样',
    enTitle: 'Geometry Pattern',
    code: 'G',
    text: '以连续纹、回纹与抽象结构形成秩序骨架。',
    enText: 'Ordered structures formed by continuous patterns, fret motifs and abstract geometry.',
    icon: Shapes,
  },
] as const;

function getPatternName(pattern: PatternGene) {
  return getLocalizedPatternName(pattern, 'zh-CN');
}

function getPatternCategoryCards(): ClassificationCard[] {
  return symbolCategoryMeta.map((category) => {
    const relatedPatterns = mockPatterns.filter((pattern) => getPatternClassification(pattern).patternCategory === category.code);
    const representativePattern = relatedPatterns[0] || mockPatterns[0];

    return {
      ...category,
      count: relatedPatterns.length,
      href: `/explore?patternCategory=${category.code}`,
      imageUrl: representativePattern?.imageUrl || '',
    };
  });
}

function splitTechniqueNames(pattern: PatternGene) {
  const craft = pattern.craft['zh-CN'] || pattern.craft.en || '';
  return craft
    .split(/[、,，/|]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function getTechniqueCards(): ClassificationCard[] {
  const techniqueMap = new Map<string, { count: number; imageUrl: string; sampleName: string }>();

  mockPatterns.forEach((pattern) => {
    splitTechniqueNames(pattern).forEach((technique) => {
      const current = techniqueMap.get(technique);
      if (current) {
        current.count += 1;
        return;
      }

      techniqueMap.set(technique, {
        count: 1,
        imageUrl: pattern.imageUrl,
        sampleName: getPatternName(pattern),
      });
    });
  });

  return [...techniqueMap.entries()].slice(0, 3).map(([technique, data], index) => ({
    title: technique,
    enTitle: 'Stitch Technique',
    code: `T${String(index + 1).padStart(2, '0')}`,
    text: `来自档案工艺字段，可查看与“${technique}”相关的纹样记录。`,
    enText: 'A stitch group extracted from archive craft fields for related pattern retrieval.',
    count: data.count,
    href: `/explore?technique=${encodeURIComponent(technique)}`,
    imageUrl: data.imageUrl,
    icon: [Layers3, Wand2, Sparkles][index] || Sparkles,
  }));
}

const cardGroups = [getPatternCategoryCards(), getTechniqueCards()];

type HanxiuBookCard = {
  zh: string;
  en: string;
  textZh: string;
  textEn: string;
  span: string;
  imageUrl: string;
  tone: string;
};

const hanxiuBookCards: HanxiuBookCard[] = [
  {
    zh: '汉绣图案',
    en: 'Han Embroidery Patterns',
    textZh: '余戟平、洪叶、陈沐雨著，作为汉绣纹样图像、题材整理与视觉归档的核心参考。',
    textEn: 'A focused reference for Han embroidery pattern images, subjects and visual archiving.',
    span: 'md:col-span-1 md:row-span-2',
    imageUrl: '/books/hanxiu-tu-an.jpg',
    tone: 'from-fuchsia-500/28 via-black/72 to-black',
  },
  {
    zh: '荆楚汉绣',
    en: 'Jingchu Han Embroidery',
    textZh: '冯泽民著，聚焦荆楚传统服饰文化与汉绣技艺，是地域工艺语境的重要参照。',
    textEn: 'A bilingual reference on Jingchu dress culture and Han embroidery craft context.',
    span: 'md:col-span-2 md:row-span-1',
    imageUrl: '/books/jingchu-hanxiu.jpg',
    tone: 'from-sky-500/24 via-black/70 to-black',
  },
  {
    zh: '中国纹样三千年',
    en: 'Three Thousand Years of Chinese Patterns',
    textZh: '沈鹏石图、洛樱笙文，梳理中国纹样演变线索，为纹样年代与造型比较提供参考。',
    textEn: 'A visual guide to Chinese pattern history for period clues and motif comparison.',
    span: 'md:col-span-2 md:row-span-1',
    imageUrl: '/books/zhongguo-wenyang-3000.jpg',
    tone: 'from-amber-500/24 via-black/70 to-black',
  },
  {
    zh: '世界经典纹样大全',
    en: 'The V&A Sourcebook of Pattern & Ornament',
    textZh: 'V&A 纹样与装饰资料汇编，提供跨文化图案、花卉与装饰结构的比较参照。',
    textEn: 'A V&A sourcebook for cross-cultural ornament, floral pattern and decorative structure references.',
    span: 'md:col-span-2 md:row-span-1',
    imageUrl: '/books/va-pattern-ornament.png',
    tone: 'from-emerald-500/22 via-black/72 to-black',
  },
  {
    zh: '世界经典纹样大全',
    en: 'V&A Pattern Plates',
    textZh: '以植物、鸟兽、边饰和装饰图版作为色彩搭配与纹样构成的辅助参考。',
    textEn: 'Plate references for color pairing, birds, plants, borders and ornamental composition.',
    span: 'md:col-span-1 md:row-span-1',
    imageUrl: '/books/va-pattern-plates.jpg',
    tone: 'from-rose-500/22 via-black/72 to-black',
  },
  {
    zh: '秦汉纹样',
    en: 'Qin and Han Patterns',
    textZh: '传统拓片纹样图集，收录秦汉时期图案造型，为早期纹样结构与符号比较提供参考。',
    textEn: 'A rubbing-pattern collection for comparing early Chinese motif structures and symbols.',
    span: 'md:col-span-1 md:row-span-1',
    imageUrl: '/books/qinhan-wenyang.jpg',
    tone: 'from-blue-500/24 via-black/72 to-black',
  },
];

function countUniqueClassifications(type: 'pattern' | 'meaning' | 'color') {
  const values = new Set<string>();
  mockPatterns.forEach((pattern) => {
    const classification = getPatternClassification(pattern);
    const code = type === 'pattern'
      ? classification.patternCategory
      : type === 'meaning'
        ? classification.meaningCategory
        : classification.colorCategory;
    if (code) values.add(code);
  });
  return values.size;
}

function countTechniqueTypes() {
  return stitchTechniques.length;
}

function formatOverviewValue(value: number | null, fallback: string) {
  return value && value > 0 ? String(value) : fallback;
}

const projectOverviewItems = [
  { zh: '已收录纹样', en: 'Archived Patterns', value: formatOverviewValue(mockPatterns.length, '持续收录') },
  { zh: '纹样大类', en: 'Pattern Categories', value: formatOverviewValue(countUniqueClassifications('pattern'), '持续整理') },
  { zh: '寓意分类', en: 'Meaning Categories', value: formatOverviewValue(countUniqueClassifications('meaning'), '持续整理') },
  { zh: '色彩分类', en: 'Color Categories', value: formatOverviewValue(countUniqueClassifications('color'), '持续整理') },
  { zh: '针法类型', en: 'Stitch Types', value: formatOverviewValue(countTechniqueTypes(), '持续整理') },
  { zh: '已完成解析', en: 'Completed Analyses', value: '持续更新' },
];
function getArchiveMetaLabel(pattern: PatternGene, language: 'zh' | 'en') {
  const classification = getPatternClassification(pattern);
  const patternLabel = classification.patternCategory
    ? getCategoryLabel('pattern', classification.patternCategory, language)
    : '';
  const meaningLabel = classification.meaningCategory
    ? getCategoryLabel('meaning', classification.meaningCategory, language)
    : '';

  return patternLabel || meaningLabel || getLocalizedText(pattern.symbolism, language === 'en' ? 'en' : 'zh-CN', pattern.heCode);
}

export function Home() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const categoryLanguage = isEnglish ? 'en' : 'zh';
  const [activeArchiveCategory, setActiveArchiveCategory] = useState('all');
  const [activeCard, setActiveCard] = useState(1);
  const currentCards = cardGroups[0];
  const archivePatterns = useMemo(() => mockPatterns.filter((pattern) => matchesArchiveTopFilter(pattern, activeArchiveCategory)), [activeArchiveCategory]);

  return (
    <main className="hanxiu-home min-h-screen bg-black">
      <section className="hanxiu-panel hanxiu-hero-stage relative overflow-hidden bg-black" aria-label={isEnglish ? 'XIUYIJING Han embroidery pattern background' : '绣艺境汉绣纹样抽丝烟雾动画'}>
        <InteractiveBackground />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9),rgba(0,0,0,0.56)_34%,rgba(0,0,0,0.16)_62%,rgba(0,0,0,0.48))]" />
        <div className="hanxiu-hero-content relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-8 pt-16">
          <div className="hanxiu-hero-copy max-w-3xl">
            <h1 className="hanxiu-hero-title text-6xl font-semibold leading-none text-white md:text-8xl">
              {isEnglish ? 'XIUYIJING' : '绣艺境'}
            </h1>
            <p className="hanxiu-hero-subtitle mt-8 text-2xl font-light tracking-[0.55em] text-white/82 md:text-4xl">
              {isEnglish ? 'Han Embroidery Pattern Gene Archive' : '非遗汉绣纹样基因库'}
            </p>
          </div>

          <button
            className="hanxiu-scroll-cue absolute bottom-10 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-fuchsia-200/30 bg-black/35 text-fuchsia-100 shadow-[0_0_28px_rgba(236,72,153,0.24)] backdrop-blur-sm"
            onClick={() => document.getElementById('hanxiu-origin')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label={isEnglish ? 'Scroll down' : '向下浏览'}
          >
            <ChevronDown className="h-7 w-7" />
          </button>
        </div>
      </section>

      <section id="hanxiu-origin" className="hanxiu-panel bg-[#08090a] px-4 py-24">
        <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-8 px-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'Pattern Gene Archive' : '纹样基因库'}</p>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'Pattern Gene Archive' : '纹样基因库'}</h2>
            <p className="mt-4 text-base leading-8 text-white/64">{isEnglish ? 'A digital archive of Han embroidery patterns organized by subject, meaning, technique, period, color and carrier.' : '汇集汉绣纹样数字档案，从题材、寓意、工艺、年代、色彩与载体等维度进行整理。'}</p>
          </div>
          <Link
            to="/explore"
            className="w-max rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)] transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
          >
            {isEnglish ? 'Explore Pattern Gene' : '\u8fdb\u5165\u7eb9\u6837\u57fa\u56e0'}

          </Link>
        </div>

        <div className="mx-auto mb-12 flex max-w-7xl flex-wrap gap-3 px-4">
          {archiveTopFilters.map((category) => {
            const isActive = activeArchiveCategory === category.key;
            return (
              <button
                key={category.key}
                onClick={() => setActiveArchiveCategory(category.key)}
                className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                  isActive
                    ? 'border-fuchsia-300/70 bg-fuchsia-500/14 text-white shadow-[0_0_18px_rgba(217,70,239,0.16)]'
                    : 'border-white/12 bg-white/[0.03] text-white/50 hover:border-fuchsia-200/35 hover:text-white/80'
                }`}
              >
                {isEnglish ? category.en : category.zh}
              </button>
            );
          })}
        </div>

        <div className="hanxiu-home-gene-wall mx-auto max-w-7xl px-4">
          <GeneWall
            patterns={archivePatterns}
            showLabels={false}
            showHoverInfo
            getMetaLabel={(pattern) => getArchiveMetaLabel(pattern, categoryLanguage)}
          />
        </div>
      </section>

      <section className="hanxiu-panel bg-[#050506] px-5 py-24">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
          <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'Gene Analysis' : '基因解析'}</p>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'Gene Analysis' : '基因解析'}</h2>
              <p className="mt-4 text-base leading-8 text-white/64">{isEnglish ? 'Explore Han embroidery through pattern origins and traditional stitching techniques.' : '从纹样造型来源与传统刺绣工艺两个维度，认识汉绣纹样的分类关系。'}</p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                to="/deconstruct"
                className="w-max rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)] transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
              >
                {isEnglish ? 'Enter Gene Analysis' : '\u8fdb\u5165\u57fa\u56e0\u89e3\u6790'}
              </Link>
            </div>
          </div>

          <div className="hanxiu-symbol-carousel">
            {currentCards.map((card, index) => {
              const offset = index - activeCard;

              return (
                <Link
                  key={card.title}
                  to={card.href}
                  className="hanxiu-symbol-card group relative overflow-hidden no-underline"
                  style={{ '--offset': offset, '--lift': Math.abs(offset) } as CSSProperties}
                  onMouseEnter={() => setActiveCard(index)}
                  onFocus={() => setActiveCard(index)}
                  aria-label={isEnglish ? card.enTitle : card.title}
                >
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain p-10 opacity-[0.18] transition-[opacity,transform] group-hover:opacity-[0.28] duration-500 group-hover:scale-110"
                    />
                  )}
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.78))]" />
                  <span className="relative z-10 flex w-full items-center justify-between gap-4">
                    <strong className="text-3xl font-semibold text-white">{isEnglish ? card.enTitle : card.title}</strong>
                  </span>
                  <span className="relative z-10 line-clamp-3 min-h-[4.5rem] text-left text-base leading-6 text-white/64">{isEnglish ? card.enText || 'Archive category for related pattern records.' : card.text}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="hanxiu-panel bg-black px-5 py-24">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
          <div className="mb-12 max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'Han Embroidery Books' : '\u6c49\u7ee3\u4e66\u7c4d\u6587\u732e'}</p>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'Han Embroidery Bookshelf' : '\u6c49\u7ee3\u4e66\u67b6'}</h2>
            <p className="mt-4 text-base leading-8 text-white/64">
              {isEnglish
                ? 'A reading map for Han embroidery studies, including pattern albums, craft research, regional culture and digital preservation references.'
                : '\u56f4\u7ed5\u6c49\u7ee3\u7814\u7a76\u7684\u9605\u8bfb\u7ebf\u7d22\uff0c\u6574\u7406\u7eb9\u6837\u56fe\u5f55\u3001\u5de5\u827a\u7814\u7a76\u3001\u5730\u57df\u6587\u5316\u4e0e\u6570\u5b57\u4fdd\u62a4\u7b49\u6587\u732e\u65b9\u5411\u3002'}
            </p>
          </div>

          <div className="grid auto-rows-[220px] gap-5 md:grid-cols-[1.05fr_1fr_1fr_1fr_1fr] md:auto-rows-[180px] xl:auto-rows-[205px]">
            {hanxiuBookCards.map((book, index) => (
              <article
                key={book.zh}
                className={'group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] opacity-0 animate-[gene-origin-card-in_420ms_ease_both] transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-300/45 hover:shadow-[0_18px_70px_rgba(217,70,239,0.16)] ' + book.span}
                style={{ animationDelay: String(index * 80) + 'ms' }}
              >
                <img
                  src={book.imageUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.52] transition-transform duration-500 group-hover:scale-105"
                />
                <span className={'pointer-events-none absolute inset-0 bg-gradient-to-br ' + book.tone} />
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.62)_58%,rgba(0,0,0,0.92))]" />
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/55 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex h-full flex-col justify-between p-7 md:p-8">
                  <div>
                    <h3 className="max-w-[22rem] text-3xl font-semibold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:text-2xl xl:text-4xl">{isEnglish ? book.en : book.zh}</h3>
                  </div>
                  <p className="line-clamp-3 max-w-2xl text-sm font-medium leading-7 text-white/72 md:text-sm xl:text-base">{isEnglish ? book.textEn : book.textZh}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


    </main>
  );
}
