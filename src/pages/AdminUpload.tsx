import { useMemo, useRef, useState } from 'react';
import { CheckSquare, ImagePlus, Loader2, Sparkles, Square, Trash2, X } from 'lucide-react';
import { buildHECode, getPatternClassification } from '../lib/classification';
import { usePatternData } from '../lib/patternData';

type QueuedImage = {
  id: string;
  file: File;
  previewUrl: string;
  selected: boolean;
};

const fileNameWithoutExtension = (file: File) => file.name.replace(/\.[^.]+$/, '');

export function AdminUpload() {
  const { patterns, refresh } = usePatternData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ name: '', category: 'N', symbolism: 'B', color: 'R', era: '', region: '' });
  const [images, setImages] = useState<QueuedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('hanxiu:admin-token') || '');
  const [imageDirectory, setImageDirectory] = useState('/patterns/');
  const [submitMessage, setSubmitMessage] = useState('');

  const nextSequence = useMemo(() => {
    const existingSequences = patterns
      .map(getPatternClassification)
      .filter((item) => item.patternCategory === formData.category && item.meaningCategory === formData.symbolism && item.colorCategory === formData.color && item.sequence !== null)
      .map((item) => item.sequence || 0);
    return Math.max(0, ...existingSequences) + 1;
  }, [patterns, formData.category, formData.symbolism, formData.color]);

  const generatedCodes = useMemo(() => {
    const count = Math.max(images.length, 1);
    return Array.from({ length: count }, (_, index) => buildHECode({
      patternCategory: formData.category,
      meaningCategory: formData.symbolism,
      colorCategory: formData.color,
      sequence: nextSequence + index,
    }));
  }, [formData.category, formData.symbolism, formData.color, images.length, nextSequence]);

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    setShowAnalysis(false);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl.split(',')[1], mimeType: file.type }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.result) throw new Error(data.error || '图片识别失败');
      setFormData((current) => ({
        ...current,
        category: data.result.category || 'N',
        symbolism: data.result.symbolism || 'B',
        color: data.result.color || 'R',
      }));
      setAiDescription(data.result.description || '已完成纹样特征识别与分类。');
      setShowAnalysis(true);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : '图片识别失败，请手动选择分类。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const queued = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${file.size}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      selected: false,
    }));
    setImages((current) => [...current, ...queued]);
    if (!formData.name && files.length === 1) setFormData((current) => ({ ...current, name: fileNameWithoutExtension(files[0]) }));
    setSubmitMessage('');
    void analyzeImage(files[0]);
    event.target.value = '';
  };

  const removeImages = (ids: Set<string>) => {
    setImages((current) => {
      current.filter((image) => ids.has(image.id)).forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return current.filter((image) => !ids.has(image.id));
    });
  };

  const selectedCount = images.filter((image) => image.selected).length;
  const allSelected = images.length > 0 && selectedCount === images.length;

  const submitPatterns = async () => {
    if (!images.length || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitMessage('');
    localStorage.setItem('hanxiu:admin-token', adminToken);
    try {
      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const code = generatedCodes[index];
        const name = images.length === 1 && formData.name.trim() ? formData.name.trim() : fileNameWithoutExtension(image.file);
        const normalizedDirectory = imageDirectory.trim().replace(/\\/g, '/').replace(/\/+$/, '');
        if (!normalizedDirectory.startsWith('/')) throw new Error('图片目录必须以 / 开头，例如 /patterns。');
        const imageUrl = `${normalizedDirectory}/${encodeURIComponent(image.file.name)}`;
        const payload = {
          id: code, heCode: code, patternCategory: formData.category, meaningCategory: formData.symbolism,
          colorCategory: formData.color, sequence: nextSequence + index, name: { 'zh-CN': name, en: name },
          imageUrl, categoryLabels: [], era: formData.era || '具体年代待考', carrier: '', region: formData.region,
          copyrightOwner: '权属待确认，仅供非商业研究', format: image.file.type, resolution: '',
          craft: { 'zh-CN': '', en: '' }, symbolism: { 'zh-CN': aiDescription, en: aiDescription },
          origin: { 'zh-CN': '民间采集，出处待考', en: 'Folk collection, source pending verification.' },
          scenario: { 'zh-CN': '', en: '' }, literature: { 'zh-CN': '', en: '' },
          inheritor: { 'zh-CN': '具体传承人不详。', en: 'Specific inheritor unknown.' }, createdAt: new Date().toISOString(), views: 0,
        };
        const response = await fetch('/api/admin/patterns', {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(`“${name}”提交失败：${data.error || response.status}`);
      }
      setSubmitMessage(`已成功提交 ${images.length} 个纹样，编号已自动分配。`);
      removeImages(new Set(images.map((image) => image.id)));
      await refresh();
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : '提交失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-6 text-xl font-medium text-white/90">录入纹样</h2>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div><label className="mb-2 block text-sm text-white/60">纹样名称</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="单张录入时填写；批量录入默认使用文件名" className="w-full rounded border border-white/20 bg-white/5 px-4 py-2 text-white outline-none focus:border-fuchsia-500" /></div>
            <div><label className="mb-2 block text-sm text-white/60">导入图片（PNG/JPG，可多选）</label><input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" /><button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-fuchsia-400/50 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 hover:bg-fuchsia-500/20"><ImagePlus className="h-4 w-4" />选择图片或批量导入</button></div>
          </div>

          <div className="rounded border border-amber-300/25 bg-amber-950/15 p-4 text-sm text-amber-100/85">
            <label className="block font-medium">免费模式图片目录</label>
            <input value={imageDirectory} onChange={(event) => setImageDirectory(event.target.value)} className="mt-2 w-full rounded border border-white/20 bg-black/20 px-3 py-2 font-mono text-white outline-none focus:border-fuchsia-500" />
            <p className="mt-2 leading-6">请先把所选图片复制到网站源码的 public 目录中，例如 D:\xiuyijing\public\patterns；提交后系统只保存图片路径，不会把电脑图片上传到 Firebase。推送并部署网站后，图片才会在图库中显示。</p>
          </div>

          {images.length > 0 && <div className="rounded border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="text-sm text-white/70">已导入 {images.length} 张，已选择 {selectedCount} 张</div><div className="flex gap-2"><button onClick={() => setImages((current) => current.map((image) => ({ ...image, selected: !allSelected })))} className="flex items-center gap-2 rounded border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white">{allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}{allSelected ? '取消全选' : '全选'}</button><button disabled={!selectedCount} onClick={() => removeImages(new Set(images.filter((image) => image.selected).map((image) => image.id)))} className="flex items-center gap-2 rounded border border-red-400/30 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"><Trash2 className="h-4 w-4" />批量删除</button><button onClick={() => removeImages(new Set(images.map((image) => image.id)))} className="rounded border border-white/15 px-3 py-1.5 text-xs text-white/60">清空</button></div></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{images.map((image, index) => <div key={image.id} onClick={() => setImages((current) => current.map((item) => item.id === image.id ? { ...item, selected: !item.selected } : item))} className={`group relative cursor-pointer overflow-hidden rounded border ${image.selected ? 'border-fuchsia-400 ring-2 ring-fuchsia-500/30' : 'border-white/10'}`}><img src={image.previewUrl} alt={image.file.name} className="h-28 w-full object-cover" /><div className="bg-black/80 p-2"><div className="truncate text-xs text-white/80">{image.file.name}</div><div className="mt-1 font-mono text-[11px] text-fuchsia-300">{generatedCodes[index]}</div></div><button aria-label="删除图片" onClick={(e) => { e.stopPropagation(); removeImages(new Set([image.id])); }} className="absolute right-1 top-1 rounded bg-black/75 p-1 text-white/70 hover:text-white"><X className="h-4 w-4" /></button><div className="absolute left-1 top-1 rounded bg-black/75 p-1">{image.selected ? <CheckSquare className="h-4 w-4 text-fuchsia-300" /> : <Square className="h-4 w-4 text-white/70" />}</div></div>)}</div>
          </div>}

          {isAnalyzing && <div className="flex items-center gap-3 rounded border border-blue-500/30 bg-blue-900/20 p-4 text-sm text-blue-300"><Loader2 className="h-4 w-4 animate-spin" />正在自动识别首张图片的分类特征……</div>}
          {showAnalysis && <div className="rounded border border-green-500/30 bg-green-900/20 p-4 text-sm"><div className="mb-2 flex items-center gap-2 text-green-300"><Sparkles className="h-4 w-4" />自动识别完成</div><p className="text-white/70">{aiDescription}</p></div>}

          <div className="grid gap-6 md:grid-cols-3">
            <label className="text-sm text-white/60">纹样大类<select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-2 w-full rounded border border-white/20 bg-[#121417] px-4 py-2 text-white"><option value="N">N（自然纹样）</option><option value="H">H（人文/民俗纹样）</option><option value="G">G（几何/抽象纹样）</option></select></label>
            <label className="text-sm text-white/60">寓意大类<select value={formData.symbolism} onChange={(e) => setFormData({ ...formData, symbolism: e.target.value })} className="mt-2 w-full rounded border border-white/20 bg-[#121417] px-4 py-2 text-white"><option value="B">B（吉祥祈福类）</option><option value="S">S（精神信仰类）</option><option value="L">L（生活志趣类）</option></select></label>
            <label className="text-sm text-white/60">色彩大类<select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="mt-2 w-full rounded border border-white/20 bg-[#121417] px-4 py-2 text-white"><option value="R">R（红色系）</option><option value="G">G（绿色系）</option><option value="B">B（蓝色系）</option><option value="A">A（金银色系）</option><option value="M">M（多色系）</option></select></label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6"><div><div className="text-xs text-white/50">自动分配编号</div><div className="mt-1 font-mono text-fuchsia-300">{images.length > 1 ? `${generatedCodes[0]} 至 ${generatedCodes.at(-1)}` : generatedCodes[0]}</div></div><button onClick={submitPatterns} disabled={!images.length || isSubmitting} className="rounded bg-fuchsia-600 px-8 py-2 text-sm text-white hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? '正在提交……' : images.length > 1 ? `批量提交 ${images.length} 个纹样` : '提交到数据库'}</button></div>

          <div className="grid gap-3 border-t border-white/10 pt-6"><label className="text-sm text-white/60">管理员接口令牌</label><input type="password" value={adminToken} onChange={(e) => setAdminToken(e.target.value)} placeholder="ADMIN_API_TOKEN" className="w-full rounded border border-white/20 bg-white/5 px-4 py-2 text-white outline-none focus:border-fuchsia-500" /><p className="text-xs leading-6 text-white/40">启用数据库写入前，请确保此令牌与部署环境中的 ADMIN_API_TOKEN 一致。</p>{submitMessage && <p className="text-sm text-fuchsia-200/80">{submitMessage}</p>}</div>
        </div>
      </div>
    </div>
  );
}
