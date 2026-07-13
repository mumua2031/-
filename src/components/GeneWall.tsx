import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PatternGene } from '../types';
import { getCategoryLabel, getPatternClassification } from '../lib/classification';
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
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const timings = useMemo(
    () => new Map(patterns.map((pattern) => [pattern.id, getStableTiming(pattern.id)])),
    [patterns],
  );

  return (
    <div className="w-full mx-auto" style={{ maxWidth: '1600px' }}>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-10 gap-y-16 items-end justify-items-center">
        {patterns.map((pattern) => {
          const timing = timings.get(pattern.id) || getStableTiming(pattern.id);
          const name = getLocalizedPatternName(pattern, currentLang);
          const isActive = activePatternId === pattern.id;
          const isDimmed = Boolean(activePatternId && !isActive);
          const classification = getPatternClassification(pattern);
          const categoryLabel = classification.patternCategory ? getCategoryLabel('pattern', classification.patternCategory, categoryLanguage) : '';
          const metaLabel = getMetaLabel?.(pattern) || categoryLabel || getLocalizedText(pattern.symbolism, currentLang, '');

          return (
            <motion.div
              key={pattern.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isDimmed ? 0.34 : 1, y: 0 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="relative"
            >
              <Link
                to={`/pattern/${pattern.heCode}`}
                className="relative flex flex-col items-center group no-underline outline-none"
                onMouseEnter={() => setActivePatternId(pattern.id)}
                onMouseLeave={() => setActivePatternId(null)}
                onFocus={() => setActivePatternId(pattern.id)}
                onBlur={() => setActivePatternId(null)}
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
                    src={pattern.imageUrl}
                    alt={name}
                    className="gene-wall-orb-image"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => fallbackToOriginalImage(event, pattern.originalImageUrl)}
                  />
                </motion.div>
                {showHoverInfo && isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="pointer-events-none absolute left-1/2 top-[86px] z-20 w-44 -translate-x-1/2 border border-fuchsia-200/20 bg-black/72 px-3 py-2 text-center shadow-[0_14px_34px_rgba(0,0,0,0.42)] backdrop-blur-md"
                  >
                    <div className="truncate text-xs text-white/88">{name}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-fuchsia-200/78">{pattern.heCode}</div>
                    <div className="mt-1 truncate text-[10px] text-white/48">{metaLabel}</div>
                    {showHoverActions && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-fuchsia-100/80">
                        <span>{isEnglish ? 'View Record' : '\u67e5\u770b\u6863\u6848'}</span>
                        <span className="text-white/25">/</span>
                        <span>{isEnglish ? 'View Analysis' : '\u67e5\u770b\u89e3\u6790'}</span>
                      </div>
                    )}
                  </motion.div>
                )}
                {showLabels && (
                  <div className="text-center">
                    <div className="font-mono text-[10px] tracking-wider text-white/30 mb-1 uppercase">
                      {pattern.heCode}
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
