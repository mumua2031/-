import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mockPatterns } from '../data';
import { PatternGene, MultilingualString } from '../types';
import { Download, History, ArrowLeft, Share2, Star } from 'lucide-react';
import { useState } from 'react';

const favoriteStorageKey = 'hanxiu:favorites';

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]') as string[];
  } catch {
    return [];
  }
}

export function PatternDetail() {
  const { heCode } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as keyof MultilingualString;
  const [isZoomed, setIsZoomed] = useState(false);
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(() => readFavorites());

  const pattern = mockPatterns.find(p => p.heCode === heCode);

  if (!pattern) {
    return <div className="pt-32 text-center text-white">Pattern Not Found</div>;
  }

  const name = pattern.name[currentLang] || pattern.name['zh-CN'];
  const isFavorite = favoriteCodes.includes(pattern.heCode);

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

  const getMLStr = (field: MultilingualString | undefined) => {
    if (!field) return '';
    return field[currentLang] || field['zh-CN'] || '';
  };

  return (
    <div className="pt-16 min-h-screen flex flex-col md:flex-row">
      {/* Left Area: High-Res Image (65-70%) */}
      <div className="w-full md:w-[65%] min-h-[50vh] md:min-h-screen flex items-center justify-center p-8 relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm z-10">
          <ArrowLeft className="w-4 h-4" />
          {t('nav.back')}
        </button>
        <img 
          src={pattern.imageUrl} 
          alt={name}
          onClick={() => setIsZoomed(!isZoomed)}
          className={`object-contain transition-transform duration-500 cursor-zoom-in ${isZoomed ? 'scale-150' : 'scale-100 max-h-[80vh]'}`}
        />
      </div>

      {/* Right Area: Metadata Panel (30-35%) */}
      <div className="w-full md:w-[35%] bg-black/20 backdrop-blur-xl border-l border-white/10 p-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-medium tracking-wide mb-2 text-white/90">{name}</h1>
          <div className="font-mono text-sm tracking-widest text-fuchsia-500 mb-8 uppercase bg-white/5 border border-white/10 inline-block px-3 py-1 rounded">
            {pattern.heCode}
          </div>

          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-3 gap-4 pb-6 border-b border-white/10">
              <div className="col-span-1 text-white/40 font-light">{t('pattern.era')}</div>
              <div className="col-span-2 text-white/80">{pattern.era}</div>
              
              <div className="col-span-1 text-white/40 font-light">{t('pattern.carrier')}</div>
              <div className="col-span-2 text-white/80">{pattern.carrier}</div>

              <div className="col-span-1 text-white/40 font-light">{t('pattern.region')}</div>
              <div className="col-span-2 text-white/80">{pattern.region}</div>

              <div className="col-span-1 text-white/40 font-light">{t('pattern.format')}</div>
              <div className="col-span-2 text-white/80 font-mono text-xs">{pattern.format}</div>
            </div>

            <div className="flex flex-col gap-3 pb-6 border-b border-white/10">
              <button className="w-full bg-fuchsia-600/80 text-white py-3 px-4 rounded-none flex items-center justify-center gap-2 hover:bg-fuchsia-600 transition-colors font-light tracking-wide">
                <Download className="w-4 h-4" />
                {t('pattern.download')}
              </button>
              <button className="w-full bg-white/5 border border-white/20 text-white/70 py-3 px-4 rounded-none flex items-center justify-center gap-2 hover:bg-white/10 transition-colors font-light tracking-wide">
                <History className="w-4 h-4" />
                纹样历史溯源
              </button>
            </div>

            <div className="py-4">
              <h3 className="text-base font-medium mb-4 text-white/80">{t('pattern.gene_interpretation')}</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-white/40 block text-xs mb-1 font-light">{t('pattern.craft')}</span>
                  <span className="text-white/70">{getMLStr(pattern.craft)}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-xs mb-1 font-light">{t('pattern.symbolism')}</span>
                  <span className="text-white/70">{getMLStr(pattern.symbolism)}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-xs mb-1 font-light">{t('pattern.scenario')}</span>
                  <span className="text-white/70">{getMLStr(pattern.scenario)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-white/50">
              <div className="flex gap-4">
                <button
                  onClick={toggleFavorite}
                  className={`border px-3 py-2 transition-colors flex items-center gap-1 ${
                    isFavorite
                      ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-950/20'
                      : 'border-white/20 text-white/70 hover:text-white hover:border-white/40'
                  }`}
                >
                  <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  <span className="text-xs">{t('pattern.save')}</span>
                </button>
                <button className="border border-white/20 px-3 py-2 text-white/70 hover:text-white hover:border-white/40 transition-colors flex items-center gap-1"><Share2 className="w-4 h-4" /> <span className="text-xs">{t('pattern.share')}</span></button>
              </div>
              <div className="text-xs font-light">
                © {pattern.copyrightOwner}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
