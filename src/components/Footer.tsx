import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mockPatterns } from '../data';
import { getPatternClassification } from '../lib/classification';
import type { PatternGene } from '../types';

const zh = {
  about: '\u5173\u4e8e\u7ee3\u827a\u5883',
  researchMethod: '\u7814\u7a76\u65b9\u6cd5',
  dataSources: '\u6570\u636e\u6765\u6e90',
  codingStandards: '\u7f16\u7801\u89c4\u8303',
  copyright: '\u7248\u6743\u4e0e\u4f7f\u7528',
  contactZoey: '\u8054\u7cfb Zoey',
  brand: '\u7ee3\u827a\u5883',
  aboutText: '\u7ee3\u827a\u5883\u4ee5\u6c49\u7ee3\u7eb9\u6837\u7684\u6570\u5b57\u5316\u91c7\u96c6\u3001\u5206\u7c7b\u7f16\u7801\u3001\u6587\u5316\u89e3\u8bfb\u4e0e\u89c6\u89c9\u89e3\u6790\u4e3a\u6838\u5fc3\uff0c\u901a\u8fc7\u6570\u5b57\u6280\u672f\u5448\u73b0\u6c49\u7ee3\u7eb9\u6837\u7684\u7ed3\u6784\u3001\u5de5\u827a\u4e0e\u6587\u5316\u5185\u6db5\uff0c\u4e3a\u975e\u9057\u4fdd\u62a4\u3001\u5b66\u672f\u7814\u7a76\u3001\u6587\u5316\u5c55\u793a\u4e0e\u516c\u5171\u6559\u80b2\u63d0\u4f9b\u53c2\u8003\u3002',
  footerText: '\u5177\u6709\u6c89\u6d78\u5f0f\u89c6\u89c9\u4f53\u9a8c\u7684\u975e\u9057\u6c49\u7ee3\u7eb9\u6837\u6570\u5b57\u57fa\u56e0\u5e93\u3002',
  learnMore: '\u4e86\u89e3\u9879\u76ee',
  archivedPatterns: '\u5df2\u6536\u5f55\u7eb9\u6837',
  patternCategories: '\u7eb9\u6837\u5927\u7c7b',
  meaningCategories: '\u5bd3\u610f\u5206\u7c7b',
  colorCategories: '\u8272\u5f69\u5206\u7c7b',
  stitchTypes: '\u9488\u6cd5\u7c7b\u578b',
  completedAnalyses: '\u5df2\u5b8c\u6210\u89e3\u6790',
  continuing: '\u6301\u7eed\u6536\u5f55',
  organizing: '\u6301\u7eed\u6574\u7406',
  updating: '\u6301\u7eed\u66f4\u65b0',
  close: '\u5173\u95ed',
  closeCopyright: '\u5173\u95ed\u7248\u6743\u8bf4\u660e',
  copyrightText: '\u672c\u7f51\u7ad9\u7684\u89c6\u89c9\u8bbe\u8ba1\u3001\u754c\u9762\u8bbe\u8ba1\u3001\u4ea4\u4e92\u8bbe\u8ba1\u3001\u7814\u7a76\u5185\u5bb9\u53ca\u6570\u5b57\u8d44\u6e90\u7248\u6743\u5f52\u90b9\u7267\u5e0c\u4e2a\u4eba\u6240\u6709\u3002\u672a\u7ecf\u6388\u6743\uff0c\u4e0d\u5f97\u590d\u5236\u3001\u8f6c\u8f7d\u3001\u4fee\u6539\u6216\u7528\u4e8e\u5546\u4e1a\u7528\u9014\u3002',
  copyrightLine: '\u00a9 2026 \u90b9\u7267\u5e0c Zoey. All Rights Reserved.',
};

const footerLinks = [
  { zh: zh.about, en: 'About XIUYIJING', to: '/about' },
  { zh: zh.researchMethod, en: 'Research Method', to: '/deconstruct' },
  { zh: zh.dataSources, en: 'Data Sources', to: '/explore' },
  { zh: zh.codingStandards, en: 'Coding Standards', to: '/explore' },
  { zh: zh.copyright, en: 'Copyright', action: 'copyright' },
  { zh: zh.contactZoey, en: 'Contact Zoey', href: 'mailto:mumua2031@gmail.com' },
] as const;

function splitTechniqueNames(pattern: PatternGene) {
  const craft = pattern.craft['zh-CN'] || pattern.craft.en || '';
  return craft
    .split(/[\u3001\uff0c,|]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

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
  const values = new Set<string>();
  mockPatterns.forEach((pattern) => {
    splitTechniqueNames(pattern).forEach((technique) => values.add(technique));
  });
  return values.size;
}

function formatOverviewValue(value: number | null, zhFallback: string, enFallback: string, isEnglish: boolean) {
  if (value && value > 0) return String(value);
  return isEnglish ? enFallback : zhFallback;
}

function getOverviewItems(isEnglish: boolean) {
  return [
    { zh: zh.archivedPatterns, en: 'Archived Patterns', value: formatOverviewValue(mockPatterns.length, zh.continuing, 'Continuing', isEnglish) },
    { zh: zh.patternCategories, en: 'Pattern Categories', value: formatOverviewValue(countUniqueClassifications('pattern'), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.meaningCategories, en: 'Meaning Categories', value: formatOverviewValue(countUniqueClassifications('meaning'), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.colorCategories, en: 'Color Categories', value: formatOverviewValue(countUniqueClassifications('color'), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.stitchTypes, en: 'Stitch Types', value: formatOverviewValue(countTechniqueTypes(), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.completedAnalyses, en: 'Completed Analyses', value: isEnglish ? 'Updating' : zh.updating },
  ];
}

export function Footer() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(false);
  const overviewItems = getOverviewItems(isEnglish);

  return (
    <>
      <section id="about-xiuyijing" className="border-t border-white/10 bg-[radial-gradient(circle_at_12%_12%,rgba(217,70,239,0.12),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(236,72,153,0.09),transparent_34%),#050506] px-5 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'About XIUYIJING' : zh.about}</p>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'About XIUYIJING' : zh.about}</h2>
              <p className="mt-6 max-w-4xl text-base leading-8 text-white/66">
                {isEnglish
                  ? 'XIUYIJING focuses on the digital collection, classification, coding and visual analysis of Han embroidery patterns, supporting heritage preservation, academic research, cultural display and public education.'
                  : zh.aboutText}
              </p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                to="/about"
                className="w-max rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)] transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
              >
                {isEnglish ? 'Learn More' : zh.learnMore}
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {overviewItems.map((item, index) => (
              <div
                key={item.en}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-6 opacity-0 animate-[gene-origin-card-in_420ms_ease_both] transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/10"
                style={{ animationDelay: String(index * 70) + 'ms' }}
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/45 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="font-mono text-4xl text-white tabular-nums md:text-5xl">{item.value}</div>
                <div className="mt-5 text-sm text-white/78">{isEnglish ? item.en : item.zh}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="hanxiu-site-footer" className="border-t border-white/10 bg-[radial-gradient(circle_at_8%_18%,rgba(217,70,239,0.1),transparent_28%),radial-gradient(circle_at_92%_20%,rgba(236,72,153,0.1),transparent_30%),#000] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.35fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'XIUYIJING' : zh.brand}</p>
            <h2 className="mt-3 text-2xl font-semibold">{isEnglish ? 'XIUYIJING' : zh.brand}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
              {isEnglish
                ? 'An immersive digital gene archive for Han embroidery patterns.'
                : zh.footerText}
            </p>
          </div>

          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Footer navigation">
            {footerLinks.map((link) => {
              const className = 'group rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-left transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/10';
              const content = <span className="block text-sm text-white/78 group-hover:text-white">{isEnglish ? link.en : link.zh}</span>;

              if ('action' in link) {
                return (
                  <button key={link.en} type="button" className={className} onClick={() => setIsCopyrightOpen(true)}>
                    {content}
                  </button>
                );
              }

              if ('href' in link) {
                return (
                  <a key={link.en} className={className} href={link.href}>
                    {content}
                  </a>
                );
              }

              return (
                <Link key={link.en} className={className} to={link.to}>
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
          <p>{zh.copyrightLine}</p>
          <a className="transition-colors hover:text-fuchsia-200" href="mailto:mumua2031@gmail.com">
            mumua2031@gmail.com
          </a>
        </div>
      </footer>

      {isCopyrightOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
          <button
            type="button"
            className="absolute inset-0 bg-black/72 backdrop-blur-sm"
            onClick={() => setIsCopyrightOpen(false)}
            aria-label={isEnglish ? 'Close copyright notice' : zh.closeCopyright}
          />
          <section className="relative z-10 w-full max-w-2xl rounded-lg border border-fuchsia-200/18 bg-[#08090a] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-fuchsia-200/55">{isEnglish ? 'Copyright' : zh.copyright}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{isEnglish ? 'Copyright' : zh.copyright}</h3>
            <p className="mt-5 text-sm leading-8 text-white/68">
              {isEnglish
                ? 'The visual design, interface design, interaction design, research content and digital assets of this website are personally created and owned by Zoey. Unauthorized reproduction, modification, distribution or commercial use is prohibited.'
                : zh.copyrightText}
            </p>
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                className="rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
                onClick={() => setIsCopyrightOpen(false)}
              >
                {isEnglish ? 'Close' : zh.close}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
