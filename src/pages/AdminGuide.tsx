import { CheckCircle2, Database, FileImage, KeyRound, ShieldCheck, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { icon: KeyRound, title: '配置管理员令牌', body: '在 Vercel 环境变量中设置 ADMIN_API_TOKEN；进入录入页后，在页面底部填写相同令牌。不要把令牌写入公开代码。' },
  { icon: Database, title: '确认免费数据服务', body: '免费模式只需配置 Firestore 服务账号和项目 ID。图片不上传到 Firebase Storage，而是和网站代码一起发布。' },
  { icon: FileImage, title: '放置图片文件', body: '把 JPG 或 PNG 图片复制到网站源码 D:/xiuyijing/public/patterns 目录。建议使用唯一且易识别的文件名，例如 HE-N-B-R01.jpg。' },
  { icon: Upload, title: '部署图片文件', body: '提交并推送图片文件到网站仓库，等待 Vercel 完成部署。部署后图片地址为 /patterns/文件名，例如 /patterns/HE-N-B-R01.jpg。' },
  { icon: CheckCircle2, title: '录入纹样资料', body: '进入“录入纹样”，选择同一张电脑图片用于预览和分类；确认免费模式目录为 /patterns/ 后提交。系统只把资料和图片路径写入 Firestore。' },
  { icon: ShieldCheck, title: '维护资料', body: '进入“纹样数据管理”编辑名称、年代、地区和权属说明。删除操作不可恢复；删除前请先备份 Firestore 数据。' },
];

export function AdminGuide() {
  return <div className="min-h-full bg-[#0b0c0a] text-white"><div className="mx-auto max-w-5xl px-5 py-12 md:px-10"><div className="border-b border-white/15 pb-8"><p className="font-mono text-xs tracking-[0.2em] text-fuchsia-300">绣艺境 · 免费数据管理说明</p><h1 className="mt-3 text-3xl font-semibold md:text-5xl">纹样上传与数据管理操作指南</h1><p className="mt-4 max-w-3xl leading-7 text-white/65">本页面面向网站运营人员与数据管理员。免费模式使用 Firestore 保存档案资料，使用网站静态目录保存图片，不需要启用 Firebase Storage。</p></div><ol className="mt-10 space-y-0 border-l border-fuchsia-400/45">{steps.map((step, index) => { const Icon = step.icon; return <li key={step.title} className="relative ml-6 border-b border-white/10 py-7 last:border-0"><span className="absolute -left-[2.1rem] top-7 flex h-8 w-8 items-center justify-center rounded-full border border-fuchsia-400/60 bg-[#0b0c0a] text-fuchsia-200"><Icon className="h-4 w-4" /></span><div className="font-mono text-xs text-fuchsia-300">步骤 {String(index + 1).padStart(2, '0')}</div><h2 className="mt-2 text-xl font-medium">{step.title}</h2><p className="mt-2 max-w-3xl leading-7 text-white/65">{step.body}</p></li>; })}</ol><div className="mt-10 flex flex-wrap gap-3"><Link to="/admin/upload" className="rounded bg-fuchsia-600 px-5 py-2 text-sm text-white hover:bg-fuchsia-700">开始录入纹样</Link><Link to="/admin/patterns" className="rounded border border-white/20 px-5 py-2 text-sm text-white/80 hover:text-white">进入数据管理</Link></div></div></div>;
}
