import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Tags, Shield, Activity, Settings, LogOut, BookOpen } from 'lucide-react';
import { usePatternData } from '../lib/patternData';

export function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08090a] flex text-white/90">
      {/* Sidebar */}
      <div className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10 text-white font-medium">
          绣艺境管理后台
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white bg-white/10">
            <LayoutDashboard className="w-4 h-4" /> 仪表盘
          </Link>
          <Link to="/admin/upload" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <ImageIcon className="w-4 h-4" /> 录入纹样
          </Link>
          <Link to="/admin/patterns" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <ImageIcon className="w-4 h-4" /> 纹样管理
          </Link>
          <Link to="/admin/taxonomy" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Tags className="w-4 h-4" /> 分类与编号
          </Link>
          <Link to="/admin/permissions" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Shield className="w-4 h-4" /> 权限管理
          </Link>
          <Link to="/admin/api" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Activity className="w-4 h-4" /> 接口管理
          </Link>
          <Link to="/admin/system" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <Settings className="w-4 h-4" /> 系统设置
          </Link>
          <Link to="/admin/guide" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 hover:text-white transition-colors text-white/70">
            <BookOpen className="w-4 h-4" /> 操作指南
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-white/40 hover:text-white w-full px-2 py-2">
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 bg-black/20 border-b border-white/10 flex items-center justify-between px-8">
          <h2 className="text-lg font-medium text-white/90">系统仪表盘</h2>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>管理员</span>
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
          <div className="text-white/50 text-sm mb-2">纹样总数</div>
          <div className="text-3xl font-light text-white/90">{patterns.length}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">数据来源</div>
          <div className="text-3xl font-light text-fuchsia-500">{source === 'api' ? '在线接口' : '本地档案'}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">接口状态</div>
          <div className="text-3xl font-light text-blue-400">{isLoading ? '检查中' : error ? '已降级' : '正常'}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <div className="text-white/50 text-sm mb-2">更新模式</div>
          <div className="text-3xl font-light text-fuchsia-400">{source === 'api' ? '在线' : '本地'}</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-base font-medium text-white/90">后端连接</h3>
          <button onClick={() => void refresh()} className="rounded border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-fuchsia-300/50 hover:text-white">
            刷新
          </button>
        </div>
        <div className="text-sm text-white/50 space-y-3">
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>公共纹样接口</span>
            <span className={error ? 'text-amber-300/80' : 'text-green-300/80'}>{error ? '正在使用本地数据' : '已连接'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>持久化数据库</span>
            <span className="text-white/40">{source === 'api' ? '已配置或已代理' : '浏览器端尚未确认'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span>降级策略</span>
            <span className="text-white/40">本地档案保持可用</span>
          </div>
          {error && <p className="pt-2 text-xs leading-6 text-amber-200/70">{error}</p>}
        </div>
      </div>
    </div>
  );
}
