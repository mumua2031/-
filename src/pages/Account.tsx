import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, History, LogOut, RefreshCw, Star, UserRound } from 'lucide-react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getCanonicalHECode } from '../lib/classification';
import { getLocalizedPatternName } from '../lib/multilingual';
import { usePatternData } from '../lib/patternData';
import { loadUserProfile, type UserActivityEntry, type UserProfile } from '../lib/userAccount';
import type { MultilingualString, PatternGene } from '../types';

type ActivityItem = { path: string; patternCode: string; recordedAt: string };

function normalizeHistory(value: unknown) {
  if (!Array.isArray(value)) return [] as ActivityItem[];
  return value
    .filter((item): item is UserActivityEntry => Boolean(item) && typeof item === 'object')
    .map((item) => ({ path: typeof item.path === 'string' ? item.path : '', patternCode: typeof item.patternCode === 'string' ? item.patternCode : '', recordedAt: typeof item.recordedAt === 'string' ? item.recordedAt : '' }))
    .filter((item) => item.path || item.patternCode);
}

function formatTime(value: string) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleString('zh-CN', { hour12: false }) : '记录时间待同步';
}

function resolvePattern(patterns: PatternGene[], code: string) {
  return patterns.find((pattern) => getCanonicalHECode(pattern) === code || pattern.heCode === code || pattern.previousHeCode === code);
}

function PatternRows({ items, patterns, emptyText, currentLang }: { items: ActivityItem[]; patterns: PatternGene[]; emptyText: string; currentLang: keyof MultilingualString }) {
  if (!items.length) return <p className="rounded border border-white/10 bg-black/20 px-4 py-7 text-sm text-white/45">{emptyText}</p>;
  return <div className="divide-y divide-white/10 rounded border border-white/10 bg-black/20">{items.map((item, index) => {
    const pattern = resolvePattern(patterns, item.patternCode);
    const title = pattern ? getLocalizedPatternName(pattern, currentLang) : item.patternCode || item.path || '站点页面';
    const to = pattern ? `/pattern/${getCanonicalHECode(pattern)}` : item.path || '/';
    return <Link key={`${item.patternCode}-${item.path}-${item.recordedAt}-${index}`} to={to} className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-fuchsia-950/20"><span className="min-w-0"><strong className="block truncate text-sm font-medium text-white/86">{title}</strong><span className="mt-1 block font-mono text-xs text-fuchsia-200/60">{item.patternCode || item.path}</span></span><time className="shrink-0 text-right text-xs text-white/42">{formatTime(item.recordedAt)}</time></Link>;
  })}</div>;
}

export function Account() {
  const { patterns } = usePatternData();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const refreshProfile = async (user = currentUser) => {
    if (!user) return;
    setIsLoading(true); setError('');
    try { setProfile(await loadUserProfile(user)); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : '读取个人档案失败。'); } finally { setIsLoading(false); }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => { setCurrentUser(user); if (user) void refreshProfile(user); else setIsLoading(false); });
    return unsubscribe;
  }, []);
  const favorites = useMemo(() => (Array.isArray(profile.favoriteCodes) ? profile.favoriteCodes.filter((code): code is string => typeof code === 'string') : []).map((code) => resolvePattern(patterns, code)).filter((pattern): pattern is PatternGene => Boolean(pattern)), [patterns, profile.favoriteCodes]);
  const views = useMemo(() => normalizeHistory(profile.viewHistory), [profile.viewHistory]);
  const downloads = useMemo(() => normalizeHistory(profile.downloadHistory), [profile.downloadHistory]);
  const currentLang: keyof MultilingualString = 'zh-CN';
  return <main className="hanxiu-main-surface min-h-screen px-5 pb-20 pt-28 text-white"><section className="mx-auto max-w-6xl"><div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-7"><div><p className="text-xs tracking-[0.28em] text-fuchsia-200/60">个人账户</p><h1 className="mt-3 text-3xl font-medium text-white">我的档案</h1><p className="mt-3 text-sm text-white/55">收藏、浏览和下载记录仅属于当前邮箱账号；退出登录后仍会保留。</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => void refreshProfile()} disabled={isLoading} className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-fuchsia-300/50 hover:text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />刷新记录</button><button type="button" onClick={async () => { await signOut(auth).catch(() => undefined); navigate('/'); }} className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm text-white/55 transition-colors hover:border-white/35 hover:text-white"><LogOut className="h-4 w-4" />退出登录</button></div></div><div className="mt-7 rounded-lg border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-fuchsia-200" /><span className="text-sm text-white/50">当前账号</span></div><p className="mt-3 truncate text-lg text-white/88">{currentUser?.email || '邮箱账号'}</p><p className="mt-2 text-xs text-white/42">该账户数据与其他用户完全隔离，管理员仅可在后台查看站点维护所需的汇总与访问记录。</p></div>{error && <p className="mt-6 rounded border border-amber-300/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">{error}</p>}<div className="mt-8 grid gap-7 lg:grid-cols-3"><section className="lg:col-span-3"><div className="mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-fuchsia-300" /><h2 className="text-lg font-medium">我的收藏</h2><span className="text-xs text-white/40">{favorites.length} 项</span></div>{favorites.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{favorites.map((pattern) => <Link key={pattern.id} to={`/pattern/${getCanonicalHECode(pattern)}`} className="rounded border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-fuchsia-300/45 hover:bg-fuchsia-950/15"><strong className="block truncate text-sm text-white/85">{getLocalizedPatternName(pattern, currentLang)}</strong><span className="mt-2 block font-mono text-xs text-fuchsia-200/60">{getCanonicalHECode(pattern)}</span></Link>)}</div> : <p className="rounded border border-white/10 bg-black/20 px-4 py-7 text-sm text-white/45">尚未收藏纹样；可在纹样详情页点击星标收藏。</p>}</section><section className="lg:col-span-2"><div className="mb-3 flex items-center gap-2"><History className="h-4 w-4 text-fuchsia-300" /><h2 className="text-lg font-medium">浏览记录</h2><span className="text-xs text-white/40">最近 {views.length} 条</span></div><PatternRows items={views} patterns={patterns} emptyText="尚无浏览记录。" currentLang={currentLang} /></section><section><div className="mb-3 flex items-center gap-2"><Download className="h-4 w-4 text-fuchsia-300" /><h2 className="text-lg font-medium">下载档案</h2><span className="text-xs text-white/40">最近 {downloads.length} 条</span></div><PatternRows items={downloads} patterns={patterns} emptyText="尚无下载档案记录。" currentLang={currentLang} /></section></div></section></main>;
}
