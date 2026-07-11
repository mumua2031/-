import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Star } from 'lucide-react';
import { mockPatterns } from '../data';

const iconClassName = 'w-5 h-5 drop-shadow-[0_0_8px_rgba(236,72,153,0.65)]';
const favoriteStorageKey = 'hanxiu:favorites';

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]') as string[];
  } catch {
    return [];
  }
}

export function FloatingActions() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());

    const syncFavorites = () => setFavorites(readFavorites());
    window.addEventListener('storage', syncFavorites);
    window.addEventListener('hanxiu:favorites-updated', syncFavorites);

    return () => {
      window.removeEventListener('storage', syncFavorites);
      window.removeEventListener('hanxiu:favorites-updated', syncFavorites);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const favoritePatterns = favorites
    .map((heCode) => mockPatterns.find((pattern) => pattern.heCode === heCode))
    .filter(Boolean);

  return (
    <div className="fixed right-6 bottom-12 flex flex-col gap-4 z-50">
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="hanxiu-floating-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="45%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a21caf" />
          </linearGradient>
        </defs>
      </svg>

      <button
        onClick={() => setIsFavoritesOpen((current) => !current)}
        className="w-10 h-10 rounded-full bg-black/55 border border-fuchsia-300/25 flex items-center justify-center hover:border-fuchsia-200/60 hover:bg-black/75 hover:scale-110 transition-all shadow-[0_0_20px_rgba(236,72,153,0.18)] backdrop-blur-sm"
        title="收藏纹样"
        aria-label="收藏纹样"
      >
        <Star className={iconClassName} stroke="url(#hanxiu-floating-icon-gradient)" />
      </button>
      {isFavoritesOpen && (
        <div className="absolute bottom-28 right-0 w-72 rounded-lg border border-fuchsia-300/20 bg-black/86 p-4 text-white shadow-[0_0_38px_rgba(217,70,239,0.22)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-sm font-medium">收藏纹样</strong>
            <span className="text-xs text-white/42">{favoritePatterns.length} 项</span>
          </div>
          {favoritePatterns.length > 0 ? (
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {favoritePatterns.map((pattern) => (
                pattern && (
                  <Link
                    key={pattern.id}
                    to={`/pattern/${pattern.heCode}`}
                    className="flex items-center gap-3 rounded-md border border-white/8 bg-white/5 p-2 transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/20"
                    onClick={() => setIsFavoritesOpen(false)}
                  >
                    <img src={pattern.imageUrl} alt={pattern.name['zh-CN']} className="h-10 w-10 object-contain" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-white/78">{pattern.name['zh-CN']}</span>
                      <span className="block font-mono text-[10px] text-white/35">{pattern.heCode}</span>
                    </span>
                  </Link>
                )
              ))}
            </div>
          ) : (
            <p className="text-xs leading-6 text-white/45">还没有收藏纹样，可在纹样基因页点击星标加入。</p>
          )}
        </div>
      )}
      <button
        onClick={scrollToTop}
        className="w-10 h-10 rounded-full bg-black/55 border border-fuchsia-300/25 flex items-center justify-center hover:border-fuchsia-200/60 hover:bg-black/75 hover:scale-110 transition-all shadow-[0_0_20px_rgba(236,72,153,0.18)] backdrop-blur-sm"
        title="回到顶部"
        aria-label="回到顶部"
      >
        <ArrowUp className={iconClassName} stroke="url(#hanxiu-floating-icon-gradient)" />
      </button>
    </div>
  );
}
