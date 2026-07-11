import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PatternGene } from '../types';
import { motion } from 'motion/react';

type GeneWallProps = {
  patterns: PatternGene[];
  showLabels?: boolean;
};

export function GeneWall({ patterns, showLabels = true }: GeneWallProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as keyof PatternGene['name'];

  return (
    <div className="w-full mx-auto" style={{ maxWidth: '1600px' }}>
      <div className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-9 gap-x-12 gap-y-16 items-end justify-items-center">
        {patterns.map((pattern) => {
          // Calculate random duration and delay for breathing effect
          const duration = Math.random() * 3 + 3; // 3 to 6 seconds
          const delay = Math.random() * -5; // Random negative delay to desync immediately
          return (
            <Link key={pattern.id} to={`/pattern/${pattern.heCode}`} className="flex flex-col items-center group no-underline">
                <motion.img
                  src={pattern.imageUrl}
                  alt={pattern.name[currentLang] || pattern.name['zh-CN']}
                  className="w-24 h-24 object-contain mb-4 select-none"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    scale: [0.98, 1.02, 0.98],
                    filter: ['brightness(0.9)', 'brightness(1.1)', 'brightness(0.9)'],
                  }}
                  transition={{
                    duration,
                    delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {showLabels && (
                  <div className="text-center">
                    <div className="font-mono text-[10px] tracking-wider text-white/30 mb-1 uppercase">
                      {pattern.heCode}
                    </div>
                    <div className="text-xs font-light text-white/70 group-hover:text-white transition-colors">
                      {pattern.name[currentLang] || pattern.name['zh-CN']}
                    </div>
                  </div>
                )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
