/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { FloatingActions } from './components/FloatingActions';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { GeneDeconstruct } from './pages/GeneDeconstruct';
import { PatternDetail } from './pages/PatternDetail';
import { AdminLayout, AdminDashboard } from './pages/Admin';
import { AdminUpload } from './pages/AdminUpload';
import { Login } from './pages/Login';
import './lib/i18n'; // Initialize i18n

export default function App() {
  return (
    <BrowserRouter basename="/hanxiu">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <>
            <Navigation />
            <Home />
            <FloatingActions />
          </>
        } />
        <Route path="/explore" element={
          <>
            <Navigation />
            <Explore />
            <FloatingActions />
          </>
        } />
        <Route path="/deconstruct" element={
          <>
            <Navigation />
            <GeneDeconstruct />
            <FloatingActions />
          </>
        } />
        <Route path="/pattern/:heCode" element={
          <>
            <Navigation />
            <PatternDetail />
            <FloatingActions />
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
