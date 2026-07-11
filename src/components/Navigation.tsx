import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scan, Search, User } from 'lucide-react';

export function Navigation() {
  const { t, i18n } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);

  const languages = [
    { code: 'zh-CN', label: '简' },
    { code: 'zh-TW', label: '繁' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: '日' },
    { code: 'ko', label: '韩' },
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
        const data = await response.json();
        alert(data.success ? `Analysis Result: ${JSON.stringify(data.result)}` : 'Failed to analyze image.');
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
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
              基因解构
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
            <label className="cursor-pointer ml-2 hover:text-white text-white/40 transition-colors" title="AI 纹样分析">
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

          <Link to="/login" className="text-white/40 hover:text-white transition-colors" aria-label={t('nav.login')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-600 to-purple-800 border border-white/20 flex items-center justify-center">
              <User className="w-4 h-4 text-white/80" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
