import { useMemo, useState } from 'react';
import { Loader2, Pencil, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';
import { readApiPayload } from '../lib/apiResponse';
import {
  archiveBasicFields,
  archivePasteExample,
  archiveTextFields,
  createEmptyPatternArchiveForm,
  getMultilingualText,
  makeMultilingual,
  normalizeEraForArchive,
  parsePatternArchiveText,
  type PatternArchiveField,
  type PatternArchiveFormData,
} from '../lib/patternArchiveForm';
import { usePatternData } from '../lib/patternData';
import type { PatternGene } from '../types';

type EditPatternForm = PatternArchiveFormData & {
  heCode: string;
};

const createEmptyEditForm = (): EditPatternForm => ({
  heCode: '',
  ...createEmptyPatternArchiveForm(),
});

function createEditFormFromPattern(pattern: PatternGene): EditPatternForm {
  return {
    heCode: pattern.heCode,
    name: pattern.name?.['zh-CN'] || '',
    category: pattern.patternCategory || 'N',
    symbolism: pattern.meaningCategory || 'B',
    color: pattern.colorCategory || 'R',
    era: normalizeEraForArchive(pattern.era) || pattern.era || '',
    carrier: pattern.carrier || '',
    region: pattern.region || '',
    copyrightOwner: pattern.copyrightOwner || '',
    format: pattern.format || '',
    resolution: pattern.resolution || '',
    craft: getMultilingualText(pattern.craft),
    symbolismText: getMultilingualText(pattern.symbolism),
    origin: getMultilingualText(pattern.origin),
    scenario: getMultilingualText(pattern.scenario),
    literature: getMultilingualText(pattern.literature),
    inheritor: getMultilingualText(pattern.inheritor),
  };
}

function buildEditPayload(editForm: EditPatternForm) {
  const name = editForm.name.trim();
  return {
    name: { 'zh-CN': name, en: name },
    era: normalizeEraForArchive(editForm.era) || '具体年代待考',
    carrier: editForm.carrier.trim(),
    region: editForm.region.trim(),
    copyrightOwner: editForm.copyrightOwner.trim(),
    format: editForm.format.trim(),
    resolution: editForm.resolution.trim(),
    craft: makeMultilingual(editForm.craft),
    symbolism: makeMultilingual(editForm.symbolismText),
    origin: makeMultilingual(editForm.origin),
    scenario: makeMultilingual(editForm.scenario),
    literature: makeMultilingual(editForm.literature),
    inheritor: makeMultilingual(editForm.inheritor),
  };
}

export function AdminPatterns() {
  const { patterns, isLoading, source, error, refresh } = usePatternData();
  const [keyword, setKeyword] = useState('');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('hanxiu:admin-token') || '');
  const [deletingCode, setDeletingCode] = useState('');
  const [editingCode, setEditingCode] = useState('');
  const [editForm, setEditForm] = useState<EditPatternForm>(() => createEmptyEditForm());
  const [editPasteText, setEditPasteText] = useState('');
  const [message, setMessage] = useState('');

  const filteredPatterns = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return patterns;
    return patterns.filter((pattern) => `${pattern.heCode} ${pattern.name?.['zh-CN'] || ''}`.toLowerCase().includes(query));
  }, [keyword, patterns]);

  const updateEditField = (field: PatternArchiveField, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const closeEdit = () => {
    setEditForm(createEmptyEditForm());
    setEditPasteText('');
  };

  const applyEditArchiveText = (text: string) => {
    const patch = parsePatternArchiveText(text);
    delete patch.category;
    delete patch.symbolism;
    delete patch.color;
    const filledCount = Object.keys(patch).length;
    if (!filledCount) {
      setMessage('没有识别到可填入的资料。请使用“字段名：内容”的格式，例如“工艺：盘金绣”。');
      return;
    }
    setEditForm((current) => ({ ...current, ...patch }));
    setMessage(`已自动填入 ${filledCount} 项详细资料，分类编号已锁定不会被粘贴内容改动。`);
  };

  const pasteEditTextFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEditPasteText(text);
      applyEditArchiveText(text);
    } catch {
      setMessage('浏览器未允许读取剪贴板。请手动粘贴到文本框，再点击“解析并填入”。');
    }
  };

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

  const beginEdit = (pattern: PatternGene) => {
    setEditForm(createEditFormFromPattern(pattern));
    setEditPasteText('');
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
        body: JSON.stringify(buildEditPayload(editForm)),
      });
      await readApiPayload(response, '更新纹样');
      setMessage(`已更新 ${editForm.heCode} 的完整资料。`);
      closeEdit();
      await refresh();
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : '更新失败。');
    } finally {
      setEditingCode('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-white/90">纹样数据管理</h2>
            <p className="mt-2 text-sm text-white/50">配置 Firestore 与免费 GitHub 图片发布后，可编辑或删除已入库数据。</p>
          </div>
          <button onClick={() => void refresh()} className="flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-sm text-white/70 hover:text-white"><RefreshCw className="h-4 w-4" />刷新数据</button>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="按编号或纹样名称检索" className="w-full rounded border border-white/20 bg-black/20 py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-fuchsia-500" />
          </label>
          <input type="password" value={adminToken} onChange={(event) => { setAdminToken(event.target.value); localStorage.setItem('hanxiu:admin-token', event.target.value); }} placeholder="管理员接口令牌" className="rounded border border-white/20 bg-black/20 px-4 py-2 text-sm text-white outline-none focus:border-fuchsia-500" />
        </div>

        <div className="mb-4 text-xs text-white/45">当前来源：{source === 'api' ? '在线数据接口' : '本地演示档案'} · 共 {filteredPatterns.length} 条</div>
        {error && <p className="mb-4 text-sm text-amber-200">接口异常：{error}</p>}

        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-black/25 text-white/50">
              <tr><th className="p-3 font-medium">预览</th><th className="p-3 font-medium">编号</th><th className="p-3 font-medium">名称</th><th className="p-3 font-medium">分类</th><th className="p-3 font-medium">操作</th></tr>
            </thead>
            <tbody>
              {filteredPatterns.map((pattern) => (
                <tr key={pattern.id} className="border-t border-white/10">
                  <td className="p-3"><img src={pattern.imageUrl} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" /></td>
                  <td className="p-3 font-mono text-fuchsia-200">{pattern.heCode}</td>
                  <td className="p-3 text-white/85">{pattern.name?.['zh-CN'] || '未命名纹样'}</td>
                  <td className="p-3 text-white/55">{pattern.patternCategory || '-'} / {pattern.meaningCategory || '-'} / {pattern.colorCategory || '-'}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button disabled={source !== 'api'} onClick={() => beginEdit(pattern)} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-fuchsia-200 hover:bg-fuchsia-500/10 disabled:cursor-not-allowed disabled:opacity-30"><Pencil className="h-3.5 w-3.5" />编辑</button>
                      <button disabled={source !== 'api' || deletingCode === pattern.heCode} onClick={() => void deletePattern(pattern.heCode, pattern.name?.['zh-CN'] || '未命名纹样')} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30">{deletingCode === pattern.heCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && <div className="flex justify-center p-6 text-sm text-white/50"><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在读取数据……</div>}
        {message && <p className="mt-4 whitespace-pre-wrap text-sm text-fuchsia-200">{message}</p>}

        {editForm.heCode && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-white/15 bg-[#121417] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">编辑完整资料</h3>
                  <p className="mt-1 font-mono text-xs text-fuchsia-200">{editForm.heCode}</p>
                </div>
                <button onClick={closeEdit} className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-white/60 md:col-span-2">纹样名称<input value={editForm.name} onChange={(event) => updateEditField('name', event.target.value)} className="mt-1 w-full rounded border border-white/20 bg-black/20 px-3 py-2 text-white" /></label>
                <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/60">
                  <div className="text-xs text-white/40">纹样大类</div>
                  <div className="mt-1 text-white/80">{editForm.category || '-'}（随 HE 编号锁定）</div>
                </div>
                <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/60">
                  <div className="text-xs text-white/40">寓意大类</div>
                  <div className="mt-1 text-white/80">{editForm.symbolism || '-'}（随 HE 编号锁定）</div>
                </div>
                <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/60">
                  <div className="text-xs text-white/40">色彩大类</div>
                  <div className="mt-1 text-white/80">{editForm.color || '-'}（随 HE 编号锁定）</div>
                </div>
              </div>

              <section className="mt-5 rounded border border-fuchsia-300/20 bg-fuchsia-950/10 p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-white/90">粘贴资料自动覆盖字段</h4>
                    <p className="mt-1 text-xs text-white/45">适合把新整理的文字资料一次性粘贴进来，再保存更新。</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void pasteEditTextFromClipboard()} className="rounded border border-fuchsia-300/30 px-3 py-1.5 text-xs text-fuchsia-100 hover:bg-fuchsia-500/10">从剪贴板粘贴并填入</button>
                    <button type="button" onClick={() => applyEditArchiveText(editPasteText)} className="rounded bg-fuchsia-600 px-3 py-1.5 text-xs text-white hover:bg-fuchsia-700">解析并填入</button>
                  </div>
                </div>
                <textarea value={editPasteText} onChange={(event) => setEditPasteText(event.target.value)} placeholder={archivePasteExample} rows={5} className="w-full resize-y rounded border border-white/15 bg-black/25 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-fuchsia-500" />
              </section>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {archiveBasicFields.map((field) => (
                  <label key={field.key} className="text-sm text-white/60">
                    {field.label}
                    <input value={editForm[field.key]} onChange={(event) => updateEditField(field.key, event.target.value)} placeholder={field.placeholder} className="mt-1 w-full rounded border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-white/25" />
                  </label>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {archiveTextFields.map((field) => (
                  <label key={field.key} className="text-sm text-white/60">
                    {field.label}
                    <textarea value={editForm[field.key]} onChange={(event) => updateEditField(field.key, event.target.value)} placeholder={field.placeholder} rows={3} className="mt-1 w-full resize-y rounded border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-white/25" />
                  </label>
                ))}
              </div>

              <button disabled={editingCode === editForm.heCode || !editForm.name.trim()} onClick={() => void saveEdit()} className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-fuchsia-600 px-4 py-2 text-sm text-white disabled:opacity-40">
                {editingCode === editForm.heCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}保存完整资料
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
