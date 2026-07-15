import { useMemo, useState } from 'react';
import { Loader2, Pencil, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';
import { readApiPayload } from '../lib/apiResponse';
import { usePatternData } from '../lib/patternData';

export function AdminPatterns() {
  const { patterns, isLoading, source, error, refresh } = usePatternData();
  const [keyword, setKeyword] = useState('');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('hanxiu:admin-token') || '');
  const [deletingCode, setDeletingCode] = useState('');
  const [editingCode, setEditingCode] = useState('');
  const [editForm, setEditForm] = useState({ heCode: '', name: '', era: '', region: '', copyrightOwner: '' });
  const [message, setMessage] = useState('');
  const filteredPatterns = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return patterns;
    return patterns.filter((pattern) => `${pattern.heCode} ${pattern.name?.['zh-CN'] || ''}`.toLowerCase().includes(query));
  }, [keyword, patterns]);

  const deletePattern = async (heCode: string, name: string) => {
    if (!window.confirm(`确认删除“${name}”（${heCode}）吗？此操作会同时删除数据库记录和已上传图片，且无法恢复。`)) return;
    setDeletingCode(heCode);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/patterns/${encodeURIComponent(heCode)}`, {
        method: 'DELETE',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
      });
      await readApiPayload(response, '删除纹样');
      setMessage(`已删除 ${heCode}。`);
      await refresh();
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : '删除失败。');
    } finally {
      setDeletingCode('');
    }
  };

  const beginEdit = (pattern: typeof patterns[number]) => {
    setEditForm({ heCode: pattern.heCode, name: pattern.name?.['zh-CN'] || '', era: pattern.era || '', region: pattern.region || '', copyrightOwner: pattern.copyrightOwner || '' });
    setMessage('');
  };

  const saveEdit = async () => {
    if (!editForm.heCode || !editForm.name.trim()) return;
    setEditingCode(editForm.heCode);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/patterns/${encodeURIComponent(editForm.heCode)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify({ name: { 'zh-CN': editForm.name.trim(), en: editForm.name.trim() }, era: editForm.era.trim(), region: editForm.region.trim(), copyrightOwner: editForm.copyrightOwner.trim() }),
      });
      await readApiPayload(response, '更新纹样');
      setMessage(`已更新 ${editForm.heCode} 的基础资料。`);
      setEditForm({ heCode: '', name: '', era: '', region: '', copyrightOwner: '' });
      await refresh();
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : '更新失败。');
    } finally {
      setEditingCode('');
    }
  };

  return <div className="mx-auto max-w-6xl p-4 md:p-8">
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-medium text-white/90">纹样数据管理</h2><p className="mt-2 text-sm text-white/50">配置 Firestore 与免费 GitHub 图片发布后，可编辑或删除已入库数据。</p></div><button onClick={() => void refresh()} className="flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-sm text-white/70 hover:text-white"><RefreshCw className="h-4 w-4" />刷新数据</button></div>
      <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto]"><label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="按编号或纹样名称检索" className="w-full rounded border border-white/20 bg-black/20 py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-fuchsia-500" /></label><input type="password" value={adminToken} onChange={(event) => { setAdminToken(event.target.value); localStorage.setItem('hanxiu:admin-token', event.target.value); }} placeholder="管理员接口令牌" className="rounded border border-white/20 bg-black/20 px-4 py-2 text-sm text-white outline-none focus:border-fuchsia-500" /></div>
      <div className="mb-4 text-xs text-white/45">当前来源：{source === 'api' ? '在线数据接口' : '本地演示档案'} · 共 {filteredPatterns.length} 条</div>
      {error && <p className="mb-4 text-sm text-amber-200">接口异常：{error}</p>}
      <div className="overflow-x-auto rounded border border-white/10"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-black/25 text-white/50"><tr><th className="p-3 font-medium">预览</th><th className="p-3 font-medium">编号</th><th className="p-3 font-medium">名称</th><th className="p-3 font-medium">分类</th><th className="p-3 font-medium">操作</th></tr></thead><tbody>{filteredPatterns.map((pattern) => <tr key={pattern.id} className="border-t border-white/10"><td className="p-3"><img src={pattern.imageUrl} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" /></td><td className="p-3 font-mono text-fuchsia-200">{pattern.heCode}</td><td className="p-3 text-white/85">{pattern.name?.['zh-CN'] || '未命名纹样'}</td><td className="p-3 text-white/55">{pattern.patternCategory || '-'} / {pattern.meaningCategory || '-'} / {pattern.colorCategory || '-'}</td><td className="p-3"><div className="flex gap-1"><button disabled={source !== 'api'} onClick={() => beginEdit(pattern)} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-fuchsia-200 hover:bg-fuchsia-500/10 disabled:cursor-not-allowed disabled:opacity-30"><Pencil className="h-3.5 w-3.5" />编辑</button><button disabled={source !== 'api' || deletingCode === pattern.heCode} onClick={() => void deletePattern(pattern.heCode, pattern.name?.['zh-CN'] || '未命名纹样')} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30">{deletingCode === pattern.heCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}删除</button></div></td></tr>)}</tbody></table></div>
      {isLoading && <div className="flex justify-center p-6 text-sm text-white/50"><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在读取数据……</div>}
      {message && <p className="mt-4 text-sm text-fuchsia-200">{message}</p>}
      {editForm.heCode && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="w-full max-w-lg rounded-lg border border-white/15 bg-[#121417] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-medium">编辑基础资料</h3><p className="mt-1 font-mono text-xs text-fuchsia-200">{editForm.heCode}</p></div><button onClick={() => setEditForm({ heCode: '', name: '', era: '', region: '', copyrightOwner: '' })} className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button></div><div className="grid gap-4"><label className="text-sm text-white/60">纹样名称<input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} className="mt-1 w-full rounded border border-white/20 bg-black/20 px-3 py-2 text-white" /></label><label className="text-sm text-white/60">年代<input value={editForm.era} onChange={(event) => setEditForm({ ...editForm, era: event.target.value })} className="mt-1 w-full rounded border border-white/20 bg-black/20 px-3 py-2 text-white" /></label><label className="text-sm text-white/60">地区<input value={editForm.region} onChange={(event) => setEditForm({ ...editForm, region: event.target.value })} className="mt-1 w-full rounded border border-white/20 bg-black/20 px-3 py-2 text-white" /></label><label className="text-sm text-white/60">权属说明<input value={editForm.copyrightOwner} onChange={(event) => setEditForm({ ...editForm, copyrightOwner: event.target.value })} className="mt-1 w-full rounded border border-white/20 bg-black/20 px-3 py-2 text-white" /></label></div><button disabled={editingCode === editForm.heCode || !editForm.name.trim()} onClick={() => void saveEdit()} className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-fuchsia-600 px-4 py-2 text-sm text-white disabled:opacity-40">{editingCode === editForm.heCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}保存更新</button></div></div>}
    </div>
  </div>;
}
