import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Tags, Globe, Shield, Activity, Settings, LogOut } from 'lucide-react';
import { usePatternData } from '../lib/patternData';

export function AdminLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08090a] flex text-white/90">
      {/* Sidebar */}
      <div className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10 text-white font-medium">
          {t('brand')} Admin
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white bg-white/10">
            <LayoutDashboard className="w-4 h-4" /> {t('admin.dashboard', 'Dashboard')}
          </Link>
          <Link to="/admin/upload" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <ImageIcon className="w-4 h-4" /> {t('admin.upload', 'Upload Pattern')}
          </Link>
          <Link to="/admin/patterns" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <ImageIcon className="w-4 h-4" /> {t('admin.patterns', 'Pattern Lifecycle')}
          </Link>
          <Link to="/admin/taxonomy" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Tags className="w-4 h-4" /> {t('admin.taxonomy', 'Taxonomy & Coding')}
          </Link>
          <Link to="/admin/i18n" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Globe className="w-4 h-4" /> {t('admin.i18n', 'Internationalization')}
          </Link>
          <Link to="/admin/permissions" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Shield className="w-4 h-4" /> {t('admin.permissions', 'Permissions & Rights')}
          </Link>
          <Link to="/admin/api" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Activity className="w-4 h-4" /> {t('admin.api', 'API & Interfaces')}
          </Link>
          <Link to="/admin/system" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Settings className="w-4 h-4" /> {t('admin.system', 'System Config')}
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-white/40 hover:text-white w-full px-2 py-2">
            <LogOut className="w-4 h-4" /> {t('admin.logout', 'Logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 bg-black/20 border-b border-white/10 flex items-center justify-between px-8">
          <h2 className="text-lg font-medium text-white/90">{t('admin.system_dashboard', 'System Dashboard')}</h2>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>Admin User</span>
            <select 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-white/90 bg-[#121417]"
            >
              <option value="zh-CN">CN</option>
              <option value="en">EN</option>
            </select>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { patterns, source, isLoading, error, refresh } = usePatternData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">Total Patterns</div>
          <div className="text-3xl font-light text-white/90">{patterns.length}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">Data Source</div>
          <div className="text-3xl font-light text-fuchsia-500 uppercase">{source}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">API Status</div>
          <div className="text-3xl font-light text-blue-400">{isLoading ? 'Checking' : error ? 'Fallback' : 'OK'}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">Update Mode</div>
          <div className="text-3xl font-light text-fuchsia-400">{source === 'api' ? 'Online' : 'Local'}</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-base font-medium text-white/90">Backend Connection</h3>
          <button onClick={() => void refresh()} className="rounded border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-fuchsia-300/50 hover:text-white">
            Refresh
          </button>
        </div>
        <div className="text-sm text-white/50 space-y-3">
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>Public pattern API</span>
            <span className={error ? 'text-amber-300/80' : 'text-green-300/80'}>{error ? 'Using local fallback' : 'Connected'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>Persistent database</span>
            <span className="text-white/40">{source === 'api' ? 'Configured or proxied' : 'Not confirmed in browser'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>Fallback behavior</span>
            <span className="text-white/40">Local archive remains available</span>
          </div>
          {error && <p className="pt-2 text-xs leading-6 text-amber-200/70">{error}</p>}
        </div>
      </div>
    </div>
  );
}
