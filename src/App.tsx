/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Link, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Navigation } from './components/Navigation';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { PatternDataProvider } from './lib/patternData';
import { auth } from './lib/firebase';
import { recordUserPageView } from './lib/userAccount';
import { clearAdminToken, readStoredAdminToken, storeAdminToken, verifyAdminToken } from './lib/adminToken';
import './lib/i18n'; // Initialize i18n

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const AboutProject = lazy(() => import('./pages/AboutProject').then((module) => ({ default: module.AboutProject })));
const Explore = lazy(() => import('./pages/Explore').then((module) => ({ default: module.Explore })));
const GeneDeconstruct = lazy(() => import('./pages/GeneDeconstruct').then((module) => ({ default: module.GeneDeconstruct })));
const PatternDetail = lazy(() => import('./pages/PatternDetail').then((module) => ({ default: module.PatternDetail })));
const AdminLayout = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminDashboard })));
const AdminTaxonomy = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminTaxonomy })));
const AdminPermissions = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminPermissions })));
const AdminApiStatus = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminApiStatus })));
const AdminSystemSettings = lazy(() => import('./pages/Admin').then((module) => ({ default: module.AdminSystemSettings })));
const AdminUpload = lazy(() => import('./pages/AdminUpload').then((module) => ({ default: module.AdminUpload })));
const AdminPatterns = lazy(() => import('./pages/AdminPatterns').then((module) => ({ default: module.AdminPatterns })));
const AdminAudit = lazy(() => import('./pages/AdminAudit').then((module) => ({ default: module.AdminAudit })));
const AdminGuide = lazy(() => import('./pages/AdminGuide').then((module) => ({ default: module.AdminGuide })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsChecking(false);
    });
    return unsubscribe;
  }, []);

  if (isChecking) return <div className="min-h-screen bg-black" />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}

function AdminGate({ children }: { children: ReactNode }) {
  const [adminToken, setAdminToken] = useState(() => readStoredAdminToken());
  const [rememberToken, setRememberToken] = useState(() => Boolean(typeof window !== 'undefined' && localStorage.getItem('hanxiu:admin-token')));
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(Boolean(adminToken));
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [adminError, setAdminError] = useState('');

  const checkAdminToken = async (token = adminToken) => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setAdminError('请输入管理员接口令牌。');
      setIsAdminVerified(false);
      return;
    }

    setIsCheckingAdmin(true);
    setAdminError('');
    try {
      await verifyAdminToken(cleanToken);
      storeAdminToken(cleanToken, rememberToken);
      setIsAdminVerified(true);
    } catch (error) {
      clearAdminToken();
      setIsAdminVerified(false);
      setAdminError(error instanceof Error ? error.message : '管理员身份校验失败。');
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  useEffect(() => {
    if (adminToken.trim()) void checkAdminToken(adminToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAdminVerified) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08090a] px-4 text-white">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-200/55">Admin Check</p>
        <h1 className="mt-3 text-2xl font-semibold">管理员身份校验</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          当前邮箱账号已登录。继续进入后台前，请输入与 Vercel 环境变量 ADMIN_API_TOKEN 一致的管理员令牌。
        </p>
        <label className="mt-6 block text-sm text-white/70">
          管理员接口令牌
          <input
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void checkAdminToken();
            }}
            className="mt-2 w-full rounded border border-white/15 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-fuchsia-300/70"
            placeholder="ADMIN_API_TOKEN"
          />
        </label>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-white/52">
          <input
            type="checkbox"
            checked={rememberToken}
            onChange={(event) => setRememberToken(event.target.checked)}
            className="h-4 w-4 accent-fuchsia-500"
          />
          在本机记住管理员令牌；公共电脑请勿勾选。
        </label>
        {adminError && <p className="mt-4 rounded border border-amber-300/20 bg-amber-950/20 p-3 text-sm leading-6 text-amber-100/85">{adminError}</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/" className="rounded border border-white/15 px-4 py-3 text-center text-sm text-white/65 transition-colors hover:border-white/35 hover:text-white">
            返回首页
          </Link>
          <button
            type="button"
            disabled={isCheckingAdmin}
            onClick={() => void checkAdminToken()}
            className="rounded bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 px-4 py-3 text-sm text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isCheckingAdmin ? '校验中…' : '进入管理后台'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserActivityTracker() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const patternMatch = location.pathname.match(/^\/pattern\/([^/]+)/);
    void recordUserPageView(user, `${location.pathname}${location.search}`, patternMatch?.[1]);
  }, [location.pathname, location.search, user]);

  return null;
}

export default function App() {
  return (
    <PatternDataProvider>
      <BrowserRouter>
        <ScrollToTop />
        <UserActivityTracker />
        <Suspense fallback={<div className="min-h-screen bg-black" />}><Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <>
            <Navigation />
            <Home />
            <FloatingActions />
            <Footer />
          </>
        } />
        <Route path="/explore" element={
          <>
            <Navigation />
            <Explore />
            <FloatingActions />
            <Footer />
          </>
        } />
        <Route path="/about" element={
          <>
            <Navigation />
            <AboutProject />
            <Footer />
          </>
        } />
        <Route path="/deconstruct" element={
          <>
            <Navigation />
            <GeneDeconstruct />
            <FloatingActions />
            <Footer />
          </>
        } />
        <Route path="/pattern/:heCode" element={
          <>
            <Navigation />
            <PatternDetail />
            <FloatingActions />
            <Footer />
          </>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<RequireAuth><AdminGate><AdminLayout /></AdminGate></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="patterns" element={<AdminPatterns />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="taxonomy" element={<AdminTaxonomy />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="api" element={<AdminApiStatus />} />
          <Route path="system" element={<AdminSystemSettings />} />
          <Route path="guide" element={<AdminGuide />} />
          <Route path="*" element={<div className="p-4 text-slate-500">该功能正在建设中</div>} />
        </Route>
        </Routes></Suspense>
      </BrowserRouter>
    </PatternDataProvider>
  );
}
