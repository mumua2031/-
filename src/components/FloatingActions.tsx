import { useEffect, useState, type SyntheticEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ArrowUp, Star, X } from 'lucide-react';
import { getCanonicalHECode } from '../lib/classification';
import { auth } from '../lib/firebase';
import { getPatternThumbnailUrl } from '../lib/imageUrls';
import { getLocalizedPatternName } from '../lib/multilingual';
import { usePatternData } from '../lib/patternData';
import { favoritesUpdatedEvent, loadUserFavorites, openFavoritesEvent, readLocalFavorites } from '../lib/userAccount';
import type { MultilingualString } from '../types';

const iconClassName = 'w-5 h-5 drop-shadow-[0_0_8px_rgba(236,72,153,0.65)]';

function fallbackToOriginalImage(event: SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) {
  const image = event.currentTarget;
  if (fallbackUrl && image.dataset.fallbackApplied !== 'true') {
    image.dataset.fallbackApplied = 'true';
    image.src = fallbackUrl;
    return;
  }
  image.style.visibility = 'hidden';
}

export function FloatingActions() {
  const { i18n } = useTranslation();
  const { patterns } = usePatternData();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = i18n.language as keyof MultilingualString;
  const isEnglish = i18n.language === 'en';
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setCurrentUser(nextUser);
      setFavorites(readLocalFavorites(nextUser));
      void loadUserFavorites(nextUser).then(setFavorites);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setFavorites(readLocalFavorites(currentUser));

    const syncFavorites = () => setFavorites(readLocalFavorites(currentUser));
    window.addEventListener('storage', syncFavorites);
    window.addEventListener(favoritesUpdatedEvent, syncFavorites);
    const openFavoritesPanel = () => {
      if (currentUser) setIsFavoritesOpen(true);
      else navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
    };
    window.addEventListener(openFavoritesEvent, openFavoritesPanel);

    return () => {
      window.removeEventListener('storage', syncFavorites);
      window.removeEventListener(favoritesUpdatedEvent, syncFavorites);
      window.removeEventListener(openFavoritesEvent, openFavoritesPanel);
    };
  }, [currentUser, location.pathname, navigate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const favoritePatterns = favorites
    .map((heCode) => patterns.find((pattern) => getCanonicalHECode(pattern) === heCode || pattern.heCode === heCode || pattern.previousHeCode === heCode))
    .filter(Boolean);

  const openFavorites = () => {
    if (!currentUser) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setIsFavoritesOpen((current) => !current);
  };

  return (
    <div className="fixed right-6 bottom-12 z-50 flex flex-col gap-4">
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
        onClick={openFavorites}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-fuchsia-300/25 bg-black/55 shadow-[0_0_20px_rgba(236,72,153,0.18)] backdrop-blur-sm transition-all hover:scale-110 hover:border-fuchsia-200/60 hover:bg-black/75"
        title={currentUser ? (isEnglish ? 'Saved patterns' : '收藏纹样') : (isEnglish ? 'Sign in to save patterns' : '登录后收藏纹样')}
        aria-label={currentUser ? (isEnglish ? 'Saved patterns' : '收藏纹样') : (isEnglish ? 'Sign in to save patterns' : '登录后收藏纹样')}
        aria-expanded={isFavoritesOpen}
      >
        <Star className={iconClassName} stroke="url(#hanxiu-floating-icon-gradient)" fill={isFavoritesOpen ? 'url(#hanxiu-floating-icon-gradient)' : 'none'} />
      </button>
      {isFavoritesOpen && (
        <div className="hanxiu-modal-card absolute right-0 bottom-28 w-72 p-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-sm font-medium">{isEnglish ? 'Saved Patterns' : '收藏纹样'}</strong>
            <span className="flex items-center gap-2"><span className="text-xs text-white/42">{favoritePatterns.length} {isEnglish ? 'items' : '项'}</span><button type="button" onClick={() => setIsFavoritesOpen(false)} aria-label={isEnglish ? 'Collapse saved patterns' : '收起收藏纹样'} className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"><X className="h-3.5 w-3.5" /></button></span>
          </div>
          {favoritePatterns.length > 0 ? (
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {favoritePatterns.map((pattern) => (
                pattern && (
                  <Link
                    key={pattern.id}
                    to={`/pattern/${getCanonicalHECode(pattern)}`}
                    className="flex items-center gap-3 rounded-md border border-white/8 bg-white/5 p-2 transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/20"
                    onClick={() => setIsFavoritesOpen(false)}
                  >
                    <img
                      src={getPatternThumbnailUrl(pattern.imageUrl)}
                      alt={getLocalizedPatternName(pattern, currentLang)}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      onError={(event) => fallbackToOriginalImage(event, pattern.imageUrl || pattern.originalImageUrl)}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-white/78">{getLocalizedPatternName(pattern, currentLang)}</span>
                      <span className="block font-mono text-[10px] text-white/35">{getCanonicalHECode(pattern)}</span>
                    </span>
                  </Link>
                )
              ))}
            </div>
          ) : (
            <p className="text-xs leading-6 text-white/45">
              {isEnglish ? 'No saved patterns yet. Use the star button on a pattern record to save it.' : '还没有收藏纹样，可在纹样详情页点击星标加入。'}
            </p>
          )}
        </div>
      )}
      <button
        onClick={scrollToTop}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-fuchsia-300/25 bg-black/55 shadow-[0_0_20px_rgba(236,72,153,0.18)] backdrop-blur-sm transition-all hover:scale-110 hover:border-fuchsia-200/60 hover:bg-black/75"
        title={isEnglish ? 'Back to top' : '回到顶部'}
        aria-label={isEnglish ? 'Back to top' : '回到顶部'}
      >
        <ArrowUp className={iconClassName} stroke="url(#hanxiu-floating-icon-gradient)" />
      </button>
    </div>
  );
}
