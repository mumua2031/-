import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  BookOpen,
  Database,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  Tags,
} from 'lucide-react';
import { colorCategories, meaningCategories, patternCategories } from '../lib/classification';
import { readApiPayload } from '../lib/apiResponse';
import { usePatternData } from '../lib/patternData';

const navItems = [
  { to: '/admin', label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: '/admin/upload', label: '录入纹样', icon: ImageIcon },
  { to: '/admin/patterns', label: '纹样管理', icon: ImageIcon },
  { to: '/admin/taxonomy', label: '分类与编号', icon: Tags },
  { to: '/admin/permissions', label: '权限管理', icon: Shield },
  { to: '/admin/api', label: '接口管理', icon: Activity },
  { to: '/admin/system', label: '系统设置', icon: Settings },
  { to: '/admin/guide', label: '操作指南', icon: BookOpen },
];

function cardClassName(isActive: boolean) {
  return [
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
  ].join(' ');
}

function AdminPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-white/90">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white/90">
      <aside className="flex w-64 flex-col border-r border-white/10 bg-black/40">
        <div className="flex h-16 items-center border-b border-white/10 px-6 font-medium text-white">
          绣艺境管理后台
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cardClassName(isActive)}>
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button onClick={() => navigate('/')} className="flex w-full items-center gap-2 px-2 py-2 text-sm text-white/40 hover:text-white">
            <LogOut className="h-4 w-4" />
            返回网站首页
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/20 px-8">
          <h1 className="text-lg font-medium text-white/90">系统仪表盘</h1>
          <span className="text-sm text-white/50">管理员</span>
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
  const duplicateCount = new Set(patterns.map((pattern) => pattern.heCode)).size !== patterns.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="mb-2 text-sm text-white/50">纹样总数</div>
          <div className="text-3xl font-light text-white/90">{patterns.length}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="mb-2 text-sm text-white/50">数据来源</div>
          <div className="text-2xl font-light text-fuchsia-300">{source === 'api' ? '在线接口' : '本地档案'}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="mb-2 text-sm text-white/50">接口状态</div>
          <div className={`text-2xl font-light ${error ? 'text-amber-300' : 'text-green-300'}`}>{isLoading ? '检查中' : error ? '已降级' : '正常'}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="mb-2 text-sm text-white/50">编号状态</div>
          <div className={`text-2xl font-light ${duplicateCount ? 'text-amber-300' : 'text-blue-300'}`}>{duplicateCount ? '需检查' : '无重复'}</div>
        </div>
      </div>

      <AdminPanel title="后端连接" description="这里显示前台与后台共同使用的纹样数据接口状态。">
        <div className="space-y-3 text-sm text-white/55">
          <div className="flex justify-between border-b border-white/10 py-2">
            <span>公共纹样接口</span>
            <span className={error ? 'text-amber-300/80' : 'text-green-300/80'}>{error ? '正在使用本地数据' : '已连接'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 py-2">
            <span>免费图片发布</span>
            <span className="text-white/45">GitHub public/patterns</span>
          </div>
          {error && <p className="pt-2 text-xs leading-6 text-amber-200/80">{error}</p>}
        </div>
        <button onClick={() => void refresh()} className="mt-5 inline-flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-xs text-white/70 hover:border-fuchsia-300/50 hover:text-white">
          <RefreshCw className="h-4 w-4" />
          刷新数据
        </button>
      </AdminPanel>
    </div>
  );
}

export function AdminTaxonomy() {
  const groups = [
    { title: '纹样大类', data: patternCategories },
    { title: '寓意大类', data: meaningCategories },
    { title: '色彩大类', data: colorCategories },
  ];

  return (
    <AdminPanel title="分类与编号" description="当前采用 HE-纹样大类-寓意大类-色彩大类序号 的编号规则，例如 HE-N-B-A07。">
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((group) => (
          <div key={group.title} className="rounded border border-white/10 bg-black/20 p-4">
            <h3 className="mb-3 text-sm font-medium text-white/80">{group.title}</h3>
            <div className="space-y-2 text-sm">
              {group.data.map((item) => (
                <div key={item.code} className="flex justify-between border-b border-white/10 pb-2 last:border-0">
                  <span className="font-mono text-fuchsia-200">{item.code}</span>
                  <span className="text-white/65">{item.zh}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link to="/admin/upload" className="mt-5 inline-block rounded bg-fuchsia-600 px-4 py-2 text-sm text-white hover:bg-fuchsia-700">
        去录入页自动生成编号
      </Link>
    </AdminPanel>
  );
}

export function AdminPermissions() {
  return (
    <AdminPanel title="权限管理" description="后台写入依靠 ADMIN_API_TOKEN 验证，图片发布依靠 GitHub fine-grained token。">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-white/10 bg-black/20 p-4">
          <KeyRound className="mb-3 h-5 w-5 text-fuchsia-300" />
          <h3 className="text-sm font-medium text-white/80">管理员接口令牌</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">在 Vercel 环境变量中设置 ADMIN_API_TOKEN；录入和管理页面输入同一个值后才能写入、编辑和删除。</p>
        </div>
        <div className="rounded border border-white/10 bg-black/20 p-4">
          <Shield className="mb-3 h-5 w-5 text-blue-300" />
          <h3 className="text-sm font-medium text-white/80">GitHub 图片权限</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">GITHUB_UPLOAD_TOKEN 只需要给当前仓库 Contents 读写权限，用于免费上传图片到 public/patterns。</p>
        </div>
      </div>
    </AdminPanel>
  );
}

export function AdminApiStatus() {
  const { source, error, refresh } = usePatternData();
  const endpoints = ['/api/health', '/api/patterns', '/api/admin/images', '/api/admin/patterns'];
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [healthError, setHealthError] = useState('');
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    setHealthError('');
    try {
      const response = await fetch('/api/health', { headers: { Accept: 'application/json' } });
      const payload = await readApiPayload<Record<string, unknown>>(response, '检测接口健康状态');
      setHealth(payload);
    } catch (nextError) {
      setHealth(null);
      setHealthError(nextError instanceof Error ? nextError.message : '检测接口健康状态失败。');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    void checkHealth();
  }, []);

  const configItems = [
    { label: '管理员令牌 ADMIN_API_TOKEN', value: Boolean(health?.adminTokenConfigured), required: true },
    { label: 'Firestore 项目 FIREBASE_PROJECT_ID', value: Boolean(health?.firebaseProjectConfigured), required: true },
    { label: 'Firestore 服务账号', value: Boolean(health?.firebaseServiceAccountConfigured), required: true },
    { label: 'GitHub 图片发布配置', value: Boolean(health?.githubUploadConfigured), required: true },
    { label: `GitHub 分支 ${health?.githubBranch || 'main'}`, value: true, required: false },
  ];

  return (
    <AdminPanel title="接口管理" description="这些接口支撑前台图库、后台录入、编辑和删除。">
      <div className="mb-5 flex items-center justify-between rounded border border-white/10 bg-black/20 p-4 text-sm">
        <span className="text-white/60">当前数据状态：{source === 'api' ? '在线接口' : '本地档案降级'}</span>
        <button onClick={() => { void refresh(); void checkHealth(); }} className="inline-flex items-center gap-2 rounded border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white">
          <RefreshCw className="h-4 w-4" />
          {isCheckingHealth ? '检测中' : '重新检测'}
        </button>
      </div>
      {error && <p className="mb-4 rounded border border-amber-300/20 bg-amber-950/20 p-3 text-sm text-amber-100/80">{error}</p>}
      {healthError && <p className="mb-4 rounded border border-red-300/20 bg-red-950/20 p-3 text-sm text-red-100/80">{healthError}</p>}
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        {configItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded border border-white/10 bg-black/20 px-4 py-3 text-sm">
            <span className="text-white/65">{item.label}</span>
            <span className={item.value ? 'text-green-300/80' : item.required ? 'text-amber-300/80' : 'text-white/45'}>
              {item.value ? '已配置' : item.required ? '待配置' : '可选'}
            </span>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded border border-white/10">
        {endpoints.map((endpoint) => (
          <div key={endpoint} className="flex justify-between border-b border-white/10 px-4 py-3 text-sm last:border-0">
            <span className="font-mono text-fuchsia-100">{endpoint}</span>
            <span className="text-white/45">{endpoint.includes('/admin/') ? '需要管理员令牌' : '公开读取'}</span>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

export function AdminSystemSettings() {
  return (
    <AdminPanel title="系统设置" description="免费自动上传流程所需的生产环境配置。">
      <div className="grid gap-3 text-sm text-white/60">
        {['ADMIN_API_TOKEN', 'FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT_JSON', 'GITHUB_UPLOAD_TOKEN', 'GITHUB_REPOSITORY', 'GITHUB_BRANCH'].map((key) => (
          <div key={key} className="flex items-center justify-between rounded border border-white/10 bg-black/20 px-4 py-3">
            <span className="font-mono text-white/80">{key}</span>
            <span>{key.startsWith('GITHUB') ? '免费图片发布' : key.startsWith('FIREBASE') ? 'Firestore 数据' : '后台权限'}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-white/45">修改 Vercel 环境变量后，需要重新 Redeploy，生产站点才会读取新配置。</p>
    </AdminPanel>
  );
}
