import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Scan } from 'lucide-react';
import { GeneWall } from '../components/GeneWall';
import { mockPatterns } from '../data';
import {
  buildHECode,
  getCategoryLabel,
  getPatternClassification,
  meaningCategories,
} from '../lib/classification';
import { getLocalizedPatternName } from '../lib/multilingual';
import type { PatternGene } from '../types';

type TopFilterKey = 'all' | 'N' | 'H' | 'G' | 'meaning' | 'color';
type SubFilter = { label: string; en: string; code: string };

const topFilters: Array<{ key: TopFilterKey; label: string; en: string }> = [
  { key: 'all', label: '\u5168\u90e8', en: 'All' },
  { key: 'N', label: '\u81ea\u7136\u5927\u7c7b', en: 'Nature' },
  { key: 'H', label: '\u4eba\u6587\u5927\u7c7b', en: 'Humanities' },
  { key: 'G', label: '\u51e0\u4f55\u5927\u7c7b', en: 'Geometry' },
  { key: 'meaning', label: '\u5bd3\u610f\u5927\u7c7b', en: 'Meaning' },
  { key: 'color', label: '\u8272\u5f69\u5927\u7c7b', en: 'Color' },
];

const meaningSubFilters: SubFilter[] = meaningCategories.map((category) => ({
  label: category.zh,
  en: category.en,
  code: category.code,
}));

const colorSubFilters: SubFilter[] = [
  { label: '\u7ea2\u8272\u7cfb', en: 'Red', code: 'R' },
  { label: '\u84dd\u8272\u7cfb', en: 'Blue', code: 'B' },
  { label: '\u7eff\u8272\u7cfb', en: 'Green', code: 'G' },
  { label: '\u91d1\u94f6\u8272\u7cfb', en: 'Gold and Silver', code: 'A' },
  { label: '\u591a\u8272\u7cfb', en: 'Multicolor', code: 'M' },
];

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function getCanonicalHECode(pattern: PatternGene) {
  const classification = getPatternClassification(pattern);
  return buildHECode({
    patternCategory: classification.patternCategory,
    meaningCategory: classification.meaningCategory,
    colorCategory: classification.colorCategory,
    sequence: classification.sequence,
  });
}

function getMultilingualValues(field: PatternGene['name']) {
  return Object.values(field).filter(Boolean).join(' ');
}

function getSearchCorpus(pattern: PatternGene) {
  const canonicalCode = getCanonicalHECode(pattern);
  return [
    pattern.heCode,
    canonicalCode,
    pattern.heCode.replaceAll('-', ''),
    canonicalCode.replaceAll('-', ''),
    getMultilingualValues(pattern.name),
    pattern.era,
    pattern.carrier,
    pattern.region,
    getMultilingualValues(pattern.craft),
    getMultilingualValues(pattern.symbolism),
    getMultilingualValues(pattern.origin),
    getMultilingualValues(pattern.scenario),
    getMultilingualValues(pattern.literature),
    getMultilingualValues(pattern.inheritor),
    pattern.copyrightOwner,
    pattern.categoryLabels.map((label) => getMultilingualValues(label)).join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

function getTopFilterFromParams(searchParams: URLSearchParams): TopFilterKey {
  const pattern = searchParams.get('pattern') || searchParams.get('patternCategory');
  const meaning = searchParams.get('meaning') || searchParams.get('meaningCategory');
  const color = searchParams.get('color') || searchParams.get('colorCategory');
  const top = searchParams.get('top');

  if (pattern === 'N' || pattern === 'H' || pattern === 'G') return pattern;
  if (top === 'meaning' || top === 'color') return top;
  if (meaning) return 'meaning';
  if (color) return 'color';
  return 'all';
}

function getPatternName(pattern: PatternGene, language: keyof PatternGene['name']) {
  return getLocalizedPatternName(pattern, language);
}

function updateParam(nextParams: URLSearchParams, key: string, value: string) {
  if (value) {
    nextParams.set(key, value);
    return;
  }
  nextParams.delete(key);
}

export function Explore() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isScanning, setIsScanning] = useState(false);

  const currentLang = i18n.language as keyof PatternGene['name'];
  const isEnglish = i18n.language === 'en';
  const categoryLanguage = isEnglish ? 'en' : 'zh';
  const keyword = searchParams.get('keyword') || '';
  const activeTopFilter = getTopFilterFromParams(searchParams);
  const activeMeaning = searchParams.get('meaning') || searchParams.get('meaningCategory') || '';
  const activeColor = searchParams.get('color') || searchParams.get('colorCategory') || '';
  const activeTechnique = searchParams.get('technique') || '';
  const childFilters = activeTopFilter === 'meaning' ? meaningSubFilters : activeTopFilter === 'color' ? colorSubFilters : [];

  const filteredPatterns = useMemo(() => {
    const normalizedKeyword = normalizeSearchText(keyword);

    return mockPatterns.filter((pattern) => {
      const classification = getPatternClassification(pattern);

      if (activeTopFilter === 'N' || activeTopFilter === 'H' || activeTopFilter === 'G') {
        if (classification.patternCategory !== activeTopFilter) return false;
      }

      if (activeMeaning && classification.meaningCategory !== activeMeaning) return false;
      if (activeColor && classification.colorCategory !== activeColor) return false;

      if (activeTechnique) {
        const techniqueText = getMultilingualValues(pattern.craft).toLowerCase();
        if (!techniqueText.includes(activeTechnique.toLowerCase())) return false;
      }

      if (!normalizedKeyword) return true;

      const corpus = getSearchCorpus(pattern);
      const compactCorpus = corpus.replace(/[-\s]/g, '');
      return corpus.includes(normalizedKeyword) || compactCorpus.includes(normalizedKeyword.replace(/[-\s]/g, ''));
    });
  }, [activeColor, activeMeaning, activeTechnique, activeTopFilter, keyword]);

  const setKeyword = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    updateParam(nextParams, 'keyword', value.trim());
    setSearchParams(nextParams, { replace: true });
  };

  const selectTopFilter = (key: TopFilterKey) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('pattern');
    nextParams.delete('patternCategory');
    nextParams.delete('meaning');
    nextParams.delete('meaningCategory');
    nextParams.delete('color');
    nextParams.delete('colorCategory');
    nextParams.delete('technique');
    nextParams.delete('top');

    if (key === 'N' || key === 'H' || key === 'G') nextParams.set('pattern', key);
    if (key === 'meaning' || key === 'color') nextParams.set('top', key);
    setSearchParams(nextParams, { replace: true });
  };

  const selectSubFilter = (type: 'meaning' | 'color', code: string) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set('top', type);

    if (type === 'meaning') {
      nextParams.delete('meaningCategory');
      updateParam(nextParams, 'meaning', code);
    } else {
      nextParams.delete('colorCategory');
      updateParam(nextParams, 'color', code);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const analyzeImage = async (file: File) => {
    setIsScanning(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String, mimeType: file.type }),
        });
        const data = await response.json();

        if (data.success) {
          setKeyword(typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
        } else {
          alert('Failed to analyze image.');
        }

        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
    }
  };

  const getMetaLabel = (pattern: PatternGene) => {
    const classification = getPatternClassification(pattern);
    return [
      classification.patternCategory ? getCategoryLabel('pattern', classification.patternCategory, categoryLanguage) : '',
      classification.meaningCategory ? getCategoryLabel('meaning', classification.meaningCategory, categoryLanguage) : '',
      classification.colorCategory ? getCategoryLabel('color', classification.colorCategory, categoryLanguage) : '',
    ]
      .filter(Boolean)
      .join(' / ');
  };

  return (
    <div className="hanxiu-main-surface pt-24 min-h-screen">
      <div className="px-10 max-w-[1600px] mx-auto mb-10">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm mb-5">
              <ArrowLeft className="w-4 h-4" />
              {t('nav.back')}
            </button>
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'Pattern Gene Archive' : '\u7eb9\u6837\u57fa\u56e0\u5e93'}</p>
            <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'Pattern Gene Archive' : '\u7eb9\u6837\u57fa\u56e0\u5e93'}</h1>
            <p className="mt-4 text-base leading-8 text-white/64">{isEnglish ? 'Browse, search and study the digital archive of Han embroidery patterns.' : '\u6d4f\u89c8\u3001\u68c0\u7d22\u4e0e\u7814\u7a76\u6c49\u7ee3\u7eb9\u6837\u6570\u5b57\u6863\u6848\u3002'}</p>
          </div>
        </div>

        <div className="hanxiu-filter-module flex flex-col xl:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap gap-4">
              {topFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => selectTopFilter(filter.key)}
                  className={`relative px-7 py-2 border transition-colors group ${
                    activeTopFilter === filter.key
                      ? 'border-fuchsia-600 bg-fuchsia-900/20 text-fuchsia-500'
                      : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <div className={`absolute inset-[3px] border ${activeTopFilter === filter.key ? 'border-fuchsia-600/30' : 'border-white/10 group-hover:border-white/30 transition-colors'}`}></div>
                  <span className="text-sm font-medium tracking-widest relative z-10 flex items-center justify-center gap-3">
                    <span className="text-[10px] opacity-50">✦</span>
                    {isEnglish ? filter.en : filter.label}
                    <span className="text-[10px] opacity-50">✦</span>
                  </span>
                </button>
              ))}
            </div>

            <div className={`grid transition-all duration-300 ease-out ${childFilters.length > 0 ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                {childFilters.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {childFilters.map((filter) => {
                      const isActive = activeTopFilter === 'meaning' ? activeMeaning === filter.code : activeColor === filter.code;
                      return (
                        <button
                          key={filter.code}
                          onClick={() => selectSubFilter(activeTopFilter === 'meaning' ? 'meaning' : 'color', filter.code)}
                          className={`px-5 py-2 border text-xs tracking-widest transition-colors ${
                            isActive ? 'border-fuchsia-500 text-fuchsia-300 bg-fuchsia-950/30' : 'border-white/10 text-white/45 bg-white/5 hover:text-white'
                          }`}
                        >
                          {isEnglish ? filter.en : filter.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative w-full xl:w-72 flex items-center bg-white/5 border border-white/20 rounded-full overflow-hidden focus-within:border-fuchsia-500 focus-within:bg-white/10 transition-all">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full bg-transparent px-5 py-2.5 text-sm text-white focus:outline-none placeholder-white/30"
            />
            <div className="flex items-center pr-3 gap-2">
              <label className="cursor-pointer hover:text-white text-white/40 transition-colors" title={isEnglish ? 'AI pattern analysis' : '\u0041\u0049 \u7eb9\u6837\u5206\u6790'}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) analyzeImage(file);
                  }}
                />
                <Scan className={`w-4 h-4 ${isScanning ? 'animate-pulse text-fuchsia-500' : ''}`} />
              </label>
              <svg className="w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="hanxiu-gene-results-module mx-auto max-w-[1660px] px-4 pb-20">
        {filteredPatterns.length > 0 ? (
          <GeneWall patterns={filteredPatterns} showHoverInfo getMetaLabel={getMetaLabel} />
        ) : (
          <div className="min-h-[360px] flex flex-col items-center justify-center gap-3 text-center text-white/45">
            <p className="text-lg text-white/62">{isEnglish ? 'No matching patterns found' : '\u6ca1\u6709\u627e\u5230\u5339\u914d\u7684\u7eb9\u6837'}</p>
            <p className="text-sm">{isEnglish ? 'Try another category, HE code, pattern name, period or carrier.' : '\u8bf7\u5c1d\u8bd5\u8c03\u6574\u5206\u7c7b\uff0c\u6216\u4f7f\u7528 HE \u7f16\u7801\u3001\u7eb9\u6837\u540d\u79f0\u3001\u5e74\u4ee3\u3001\u8f7d\u4f53\u7ee7\u7eed\u68c0\u7d22\u3002'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
