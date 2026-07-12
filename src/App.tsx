/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { AboutProject } from './pages/AboutProject';
import { Explore } from './pages/Explore';
import { GeneDeconstruct } from './pages/GeneDeconstruct';
import { PatternDetail } from './pages/PatternDetail';
import { AdminLayout, AdminDashboard } from './pages/Admin';
import { AdminUpload } from './pages/AdminUpload';
import { Login } from './pages/Login';
import './lib/i18n'; // Initialize i18n

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter basename="/hanxiu">
      <ScrollToTop />
      <Routes>
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
          <Route path="*" element={<div className="p-4 text-slate-500">Module under construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
