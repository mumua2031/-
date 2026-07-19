import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scan, Search, User } from 'lucide-react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { readApiPayload } from '../lib/apiResponse';
import { auth } from '../lib/firebase';
import { openFavoritesEvent } from '../lib/userAccount';

export function Navigation() {
  const { t, i18n } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return unsubscribe;
  }, []);

  const languages = [
    { code: 'zh-CN', label: 'CN' },
    { code: 'en', label: 'EN' },
  ];

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
        const data = await readApiPayload<{ result?: unknown }>(response, i18n.language === 'en' ? 'Analyze image' : '识别图片');
        alert(data.result ? `Analysis Result: ${JSON.stringify(data.result)}` : (i18n.language === 'en' ? 'No analysis result.' : '没有识别结果。'));
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : (i18n.language === 'en' ? 'Failed to analyze image.' : '图片识别失败。'));
      setIsScanning(false);
    }
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-white border-b border-fuchsia-500 pb-1' : 'hover:text-white transition-colors';

  return (
    <header className="hanxiu-navigation fixed top-0 w-full z-50 glass-panel border-b border-white/10">
      <div className="hanxiu-navigation-inner max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="hanxiu-navigation-main flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-widest text-fuchsia-500">
            {t('brand')}
          </Link>
          <div className="h-4 w-px bg-white/20 hidden md:block"></div>
          <nav className="hanxiu-navigation-links flex items-center gap-6 text-sm font-medium tracking-tight text-white/50">
            <NavLink to="/" className={linkClassName} end>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/explore" className={linkClassName}>
              {t('nav.explore')}
            </NavLink>
            <NavLink to="/deconstruct" className={linkClassName}>
              {t('nav.deconstruct')}
            </NavLink>
          </nav>
        </div>

        <div className="hanxiu-navigation-tools flex items-center gap-8">
          <div className="hanxiu-search-shell relative hidden md:flex items-center px-4 py-1.5 rounded-full transition-all">
            <Search className="w-4 h-4 text-white/40 mr-2" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className="bg-transparent border-none text-xs text-white/80 w-56 focus:outline-none focus:ring-0 placeholder-white/30"
            />
            <label className="cursor-pointer ml-2 hover:text-white text-white/40 transition-colors" title={i18n.language === 'en' ? 'Pattern analysis' : '纹样分析'}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) analyzeImage(file);
                }}
              />
              <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-pulse text-fuchsia-500' : ''}`} />
            </label>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => i18n.changeLanguage(language.code)}
                className={`hover:text-white transition-colors ${
                  i18n.language === language.code ? 'text-fuchsia-500 underline underline-offset-4' : 'text-white/40'
                }`}
              >
                {language.label}
              </button>
            ))}
          </div>

          <div className="relative">
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsAccountOpen((current) => !current)}
                className="text-white/40 transition-colors hover:text-white"
                aria-label={i18n.language === 'en' ? 'Account' : '账户'}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-fuchsia-500 via-pink-600 to-purple-800">
                  <User className="h-4 w-4 text-white/80" />
                </div>
              </button>
            ) : (
              <Link to="/login" className="text-white/40 transition-colors hover:text-white" aria-label={t('nav.login')}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-fuchsia-500 via-pink-600 to-purple-800">
                  <User className="h-4 w-4 text-white/80" />
                </div>
              </Link>
            )}
            {currentUser && isAccountOpen && (
              <div className="hanxiu-modal-card absolute right-0 top-12 w-64 p-4 text-left text-white">
                <p className="text-xs text-white/40">{i18n.language === 'en' ? 'Signed in' : '当前登录'}</p>
                <p className="mt-1 truncate text-sm text-white/85">{currentUser.email || currentUser.displayName || '邮箱账号'}</p>
                <p className="mt-3 text-xs leading-5 text-white/42">
                  {i18n.language === 'en'
                    ? 'Saved patterns and basic visits are kept under this account only.'
                    : '收藏与基础访问记录仅保存在当前账号下。'}
                </p>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent(openFavoritesEvent));
                      setIsAccountOpen(false);
                    }}
                    className="rounded border border-white/12 px-3 py-2 text-sm text-white/70 transition-colors hover:border-fuchsia-300/45 hover:text-white"
                  >
                    {i18n.language === 'en' ? 'My saved patterns' : '我的收藏'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut(auth).catch(() => undefined);
                      setIsAccountOpen(false);
                    }}
                    className="rounded border border-white/12 px-3 py-2 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {i18n.language === 'en' ? 'Sign out' : '退出登录'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
