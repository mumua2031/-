import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Tags, Globe, Shield, Activity, Settings, LogOut } from 'lucide-react';

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
              <option value="zh-CN">简中</option>
              <option value="en">English</option>
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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">Total Patterns</div>
          <div className="text-3xl font-light text-white/90">12,450</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">Pending AI Review</div>
          <div className="text-3xl font-light text-fuchsia-500">84</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">API Calls (Today)</div>
          <div className="text-3xl font-light text-blue-400">45.2K</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">Missing Translations</div>
          <div className="text-3xl font-light text-fuchsia-400">12</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <h3 className="text-base font-medium mb-4 text-white/90">Recent Workflow Actions</h3>
        <div className="text-sm text-white/50 space-y-3">
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>AI Auto-tagged 50 imported images</span>
            <span className="text-white/40">10 mins ago</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>Admin approved HE-N-B-R05 to public</span>
            <span className="text-white/40">1 hour ago</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>System backup completed successfully</span>
            <span className="text-white/40">3 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
