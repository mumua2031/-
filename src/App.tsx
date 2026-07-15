/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { PatternDataProvider } from './lib/patternData';
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
const AdminGuide = lazy(() => import('./pages/AdminGuide').then((module) => ({ default: module.AdminGuide })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <PatternDataProvider>
      <BrowserRouter>
        <ScrollToTop />
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
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="patterns" element={<AdminPatterns />} />
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
