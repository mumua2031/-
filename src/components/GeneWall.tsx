import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PatternGene } from '../types';
import { getCanonicalHECode, getCategoryLabel, getPatternClassification } from '../lib/classification';
import { getPatternThumbnailUrl } from '../lib/imageUrls';
import { getLocalizedPatternName, getLocalizedText } from '../lib/multilingual';
import { motion, useReducedMotion } from 'motion/react';
import { useMemo, useState, type SyntheticEvent } from 'react';

type GeneWallProps = {
  patterns: PatternGene[];
  showLabels?: boolean;
  showHoverInfo?: boolean;
  getMetaLabel?: (pattern: PatternGene) => string;
  showHoverActions?: boolean;
};

function normalizeIdentityPart(value?: string) {
  return (value || '').trim().replace(/\\/g, '/').replace(/\?.*$/, '').toLowerCase();
}

function getPatternIdentityKeys(pattern: PatternGene) {
  const canonicalCode = getCanonicalHECode(pattern);
  const imageUrl = normalizeIdentityPart(pattern.imageUrl);
  const originalImageUrl = normalizeIdentityPart(pattern.originalImageUrl);
  const thumbnailUrl = normalizeIdentityPart(getPatternThumbnailUrl(pattern.imageUrl));

  return [
    canonicalCode ? `code:${canonicalCode}` : '',
    imageUrl ? `image:${imageUrl}` : '',
    originalImageUrl ? `image:${originalImageUrl}` : '',
    thumbnailUrl ? `image:${thumbnailUrl}` : '',
  ].filter(Boolean);
}

function getStablePatternKey(pattern: PatternGene) {
  return getPatternIdentityKeys(pattern)[0] || `id:${pattern.id}`;
}

function getUniquePatterns(patterns: PatternGene[]) {
  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    const keys = getPatternIdentityKeys(pattern);
    const hasDuplicate = keys.some((key) => seen.has(key));
    if (hasDuplicate) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

function getStableTiming(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 997;
  }

  return {
    duration: 3.4 + (hash % 28) / 10,
    delay: -((hash % 50) / 10),
  };
}

function fallbackToOriginalImage(event: SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) {
  const image = event.currentTarget;
  if (fallbackUrl && image.dataset.fallbackApplied !== 'true') {
    image.dataset.fallbackApplied = 'true';
    image.src = fallbackUrl;
    return;
  }
  image.style.visibility = 'hidden';
}

export function GeneWall({ patterns, showLabels = true, showHoverInfo = false, getMetaLabel, showHoverActions = true }: GeneWallProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as keyof PatternGene['name'];
  const isEnglish = i18n.language === 'en';
  const categoryLanguage = isEnglish ? 'en' : 'zh';
  const prefersReducedMotion = useReducedMotion();
  const [activePatternKey, setActivePatternKey] = useState<string | null>(null);
  const visiblePatterns = useMemo(() => getUniquePatterns(patterns), [patterns]);
  const timings = useMemo(
    () => new Map(visiblePatterns.map((pattern) => [getStablePatternKey(pattern), getStableTiming(getStablePatternKey(pattern))])),
    [visiblePatterns],
  );

  return (
    <div className="w-full mx-auto" style={{ maxWidth: '1600px' }}>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-10 gap-y-16 items-end justify-items-center">
        {visiblePatterns.map((pattern, index) => {
          const patternKey = getStablePatternKey(pattern);
          const timing = timings.get(patternKey) || getStableTiming(patternKey);
          const name = getLocalizedPatternName(pattern, currentLang);
          const isActive = activePatternKey === patternKey;
          const isDimmed = Boolean(activePatternKey && !isActive);
          const classification = getPatternClassification(pattern);
          const categoryLabel = classification.patternCategory ? getCategoryLabel('pattern', classification.patternCategory, categoryLanguage) : '';
          const metaLabel = getMetaLabel?.(pattern) || categoryLabel || getLocalizedText(pattern.symbolism, currentLang, '');
          const canonicalCode = getCanonicalHECode(pattern);
          const shouldPrioritizeImage = index < 8;

          return (
            <motion.div
              key={patternKey}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isDimmed ? 0.34 : 1, y: 0 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="gene-wall-item relative z-0 hover:z-[80] focus-within:z-[80]"
            >
              <Link
                to={`/pattern/${canonicalCode}`}
                className="relative flex min-h-[154px] w-full flex-col items-center group no-underline outline-none"
                onMouseEnter={() => setActivePatternKey(patternKey)}
                onMouseLeave={() => setActivePatternKey(null)}
                onFocus={() => setActivePatternKey(patternKey)}
                onBlur={() => setActivePatternKey(null)}
              >
                <motion.div
                  className="gene-wall-orb mb-4"
                  animate={
                    isActive
                      ? { opacity: 1, scale: 1.11, filter: 'brightness(1.16) drop-shadow(0 0 16px rgba(244,114,182,0.34))' }
                      : {
                          opacity: prefersReducedMotion ? [0.82, 1, 0.82] : [0.7, 1, 0.7],
                          scale: prefersReducedMotion ? [0.995, 1.006, 0.995] : [0.98, 1.02, 0.98],
                          filter: prefersReducedMotion
                            ? ['brightness(0.94)', 'brightness(1.04)', 'brightness(0.94)']
                            : ['brightness(0.9)', 'brightness(1.1)', 'brightness(0.9)'],
                        }
                  }
                  transition={{
                    duration: isActive ? 0.18 : timing.duration,
                    delay: isActive ? 0 : timing.delay,
                    repeat: isActive ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <img
                    src={getPatternThumbnailUrl(pattern.imageUrl)}
                    alt={name}
                    className="gene-wall-orb-image"
                    loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={shouldPrioritizeImage ? 'high' : 'low'}
                    onError={(event) => fallbackToOriginalImage(event, pattern.imageUrl || pattern.originalImageUrl)}
                  />
                </motion.div>
                {showHoverInfo && isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="hanxiu-modal-card gene-wall-info-card pointer-events-none left-1/2 z-50 w-40 -translate-x-1/2 px-2.5 py-1.5 text-center"
                  >
                    <div className="truncate text-[11px] leading-4 text-white/88">{name}</div>
                    <div className="mt-0.5 font-mono text-[9px] uppercase leading-3 tracking-wider text-fuchsia-200/78">{canonicalCode}</div>
                    <div className="mt-0.5 truncate text-[9px] leading-3 text-white/48">{metaLabel}</div>
                    {showHoverActions && (
                      <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[9px] leading-3 text-fuchsia-100/80">
                        <span>{isEnglish ? 'View Record' : '\u67e5\u770b\u6863\u6848'}</span>
                        <span className="text-white/25">/</span>
                        <span>{isEnglish ? 'View Analysis' : '\u67e5\u770b\u89e3\u6790'}</span>
                      </div>
                    )}
                  </motion.div>
                )}
                {showLabels && (
                  <div className={`gene-wall-label text-center transition-opacity duration-150 ${showHoverInfo && isActive ? 'opacity-0' : 'opacity-100'}`} aria-hidden={showHoverInfo && isActive}>
                    <div className="font-mono text-[10px] tracking-wider text-white/30 mb-1 uppercase">
                      {canonicalCode}
                    </div>
                    <div className="text-xs font-light text-white/70 group-hover:text-white transition-colors">
                      {name}
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
