import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scan } from 'lucide-react';
import { GeneWall } from '../components/GeneWall';
import { mockPatterns } from '../data';
import type { PatternGene } from '../types';

type FilterOption = {
  label: string;
  match: (pattern: PatternGene) => boolean;
};

const topFilters: FilterOption[] = [
  { label: '全部', match: () => true },
  { label: '自然大类', match: (pattern) => pattern.heCode.startsWith('HE-N-') },
  { label: '人文大类', match: (pattern) => pattern.heCode.startsWith('HE-H-') },
  { label: '几何大类', match: (pattern) => pattern.heCode.startsWith('HE-G-') },
  { label: '寓意大类', match: (pattern) => /-B-|-S-|-L-/.test(pattern.heCode) },
  { label: '色彩大类', match: (pattern) => /-R|-G|-B|-A|-M/.test(pattern.heCode) },
];

const subFilters: Record<string, FilterOption[]> = {
  寓意大类: [
    { label: '吉祥祈福类', match: (pattern) => pattern.heCode.includes('-B-') },
    { label: '精神信仰类', match: (pattern) => pattern.heCode.includes('-S-') },
    { label: '生活志趣类', match: (pattern) => pattern.heCode.includes('-L-') },
  ],
  色彩大类: [
    { label: '红色系', match: (pattern) => pattern.heCode.endsWith('R01') || /-R\d/.test(pattern.heCode) },
    { label: '绿色系', match: (pattern) => /-G\d/.test(pattern.heCode) },
    { label: '蓝色系', match: (pattern) => /-B\d/.test(pattern.heCode) },
    { label: '金色系', match: (pattern) => /-A\d/.test(pattern.heCode) },
    { label: '多色系', match: (pattern) => /-M\d/.test(pattern.heCode) },
  ],
};

export function Explore() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTopFilter, setActiveTopFilter] = useState('全部');
  const [activeSubFilter, setActiveSubFilter] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const currentLang = i18n.language as keyof PatternGene['name'];
  const activeTopOption = topFilters.find((filter) => filter.label === activeTopFilter) || topFilters[0];
  const childFilters = subFilters[activeTopFilter] || [];
  const activeSubOption = childFilters.find((filter) => filter.label === activeSubFilter);

  const filteredPatterns = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return mockPatterns.filter((pattern) => {
      const matchesTop = activeTopOption.match(pattern);
      const matchesSub = activeSubOption ? activeSubOption.match(pattern) : true;
      if (!matchesTop || !matchesSub) return false;
      if (!keyword) return true;

      const name = pattern.name[currentLang] || pattern.name['zh-CN'] || pattern.name.en || '';
      return `${pattern.heCode} ${name}`.toLowerCase().includes(keyword);
    });
  }, [activeSubOption, activeTopOption, currentLang, searchTerm]);

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
          setSearchTerm(typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
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

  const selectTopFilter = (label: string) => {
    setActiveTopFilter(label);
    setActiveSubFilter('');
  };

  return (
    <div className="pt-24 min-h-screen bg-[#08090a]">
      <div className="px-10 max-w-[1600px] mx-auto mb-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            {t('nav.back')}
          </button>
          <h1 className="text-3xl font-medium text-white">{t('nav.explore')}</h1>
        </div>

        <div className="hanxiu-filter-module flex flex-col xl:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap gap-4">
              {topFilters.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => selectTopFilter(filter.label)}
                  className={`relative px-7 py-2 border transition-colors group ${
                    activeTopFilter === filter.label
                      ? 'border-fuchsia-600 bg-fuchsia-900/20 text-fuchsia-500'
                      : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <div className={`absolute inset-[3px] border ${activeTopFilter === filter.label ? 'border-fuchsia-600/30' : 'border-white/10 group-hover:border-white/30 transition-colors'}`}></div>
                  <span className="text-sm font-medium tracking-widest relative z-10 flex items-center justify-center gap-3">
                    <span className="text-[10px] opacity-50">✦</span>
                    {filter.label}
                    <span className="text-[10px] opacity-50">✦</span>
                  </span>
                </button>
              ))}
            </div>

            {childFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveSubFilter('')}
                  className={`px-5 py-2 border text-xs tracking-widest transition-colors ${
                    !activeSubFilter ? 'border-fuchsia-500 text-fuchsia-300 bg-fuchsia-950/30' : 'border-white/10 text-white/45 bg-white/5 hover:text-white'
                  }`}
                >
                  全部{activeTopFilter.replace('大类', '')}
                </button>
                {childFilters.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setActiveSubFilter(filter.label)}
                    className={`px-5 py-2 border text-xs tracking-widest transition-colors ${
                      activeSubFilter === filter.label ? 'border-fuchsia-500 text-fuchsia-300 bg-fuchsia-950/30' : 'border-white/10 text-white/45 bg-white/5 hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full xl:w-72 flex items-center bg-white/5 border border-white/20 rounded-full overflow-hidden focus-within:border-fuchsia-500 focus-within:bg-white/10 transition-all">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent px-5 py-2.5 text-sm text-white focus:outline-none placeholder-white/30"
            />
            <div className="flex items-center pr-3 gap-2">
              <label className="cursor-pointer hover:text-white text-white/40 transition-colors" title="AI 纹样分析">
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
          <GeneWall patterns={filteredPatterns} />
        ) : (
          <div className="min-h-[360px] flex items-center justify-center text-white/45">
            没有找到匹配的纹样
          </div>
        )}
      </div>
    </div>
  );
}
