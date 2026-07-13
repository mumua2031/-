import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Share2, Star } from 'lucide-react';
import { GeneWall } from '../components/GeneWall';
import { mockPatterns } from '../data';
import { patternVisualAnalysis } from '../generated/pattern-visual-analysis';
import { findStitchesInText } from '../lib/stitches';
import { getLocalizedPatternName, getLocalizedPlainText, getLocalizedText } from '../lib/multilingual';
import type { MultilingualString, PatternGene } from '../types';
import { buildHECode, getCategoryLabel, getPatternClassification, parseHECode } from '../lib/classification';

const favoriteStorageKey = 'hanxiu:favorites';

type DetailTab = 'basic' | 'meaning' | 'craft' | 'analysis' | 'copyright';
type ImageMode = 'pattern';

const detailTabs: DetailTab[] = ['basic', 'meaning', 'craft', 'analysis', 'copyright'];

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]') as string[];
  } catch {
    return [];
  }
}

function fallbackToOriginalImage(event: SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) {
  const image = event.currentTarget;
  if (fallbackUrl && image.dataset.fallbackApplied !== 'true') {
    image.dataset.fallbackApplied = 'true';
    image.src = fallbackUrl;
    return;
  }
  image.style.visibility = 'hidden';
}

function getCanonicalCode(pattern: PatternGene) {
  const classification = getPatternClassification(pattern);
  return buildHECode({
    patternCategory: classification.patternCategory,
    meaningCategory: classification.meaningCategory,
    colorCategory: classification.colorCategory,
    sequence: classification.sequence,
  });
}

function getCategoryDisplay(pattern: PatternGene, type: 'pattern' | 'meaning' | 'color', language: 'zh' | 'en') {
  const classification = getPatternClassification(pattern);
  const code = type === 'pattern'
    ? classification.patternCategory
    : type === 'meaning'
      ? classification.meaningCategory
      : classification.colorCategory;
  const label = code ? getCategoryLabel(type, code, language) : '';
  if (!code || !label) return language === 'en' ? 'No data' : '暂无资料';
  return `${code} ${language === 'en' ? '-' : '·'} ${label}`;
}

function splitTechniques(pattern: PatternGene, language: keyof MultilingualString) {
  return getLocalizedText(pattern.craft, language, '')
    .split(/[、，,;；|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSimilarPatterns(pattern: PatternGene, language: keyof MultilingualString) {
  const current = getPatternClassification(pattern);
  const techniques = new Set(splitTechniques(pattern, language));

  return mockPatterns
    .filter((candidate) => candidate.id !== pattern.id)
    .map((candidate) => {
      const other = getPatternClassification(candidate);
      const otherTechniques = splitTechniques(candidate, language);
      let score = 0;
      if (current.patternCategory && current.patternCategory === other.patternCategory) score += 3;
      if (current.meaningCategory && current.meaningCategory === other.meaningCategory) score += 2;
      if (current.colorCategory && current.colorCategory === other.colorCategory) score += 2;
      if (otherTechniques.some((technique) => techniques.has(technique))) score += 2;
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.candidate);
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(0, 120);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to render PNG.'));
    }, 'image/png');
  });
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = width / height;
  const drawWidth = imageRatio > boxRatio ? width : height * imageRatio;
  const drawHeight = imageRatio > boxRatio ? width / imageRatio : height;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawWatermark(context: CanvasRenderingContext2D, width: number, height: number, text: string) {
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 6);
  context.font = `${Math.max(24, Math.floor(width / 34))}px "Microsoft YaHei", sans-serif`;
  context.fillStyle = 'rgba(255, 255, 255, 0.22)';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const stepX = Math.max(360, width * 0.46);
  const stepY = Math.max(150, height * 0.16);
  for (let x = -width; x <= width; x += stepX) {
    for (let y = -height; y <= height; y += stepY) {
      context.fillText(text, x, y);
    }
  }
  context.restore();
}

async function createWatermarkedPreview(imageUrl: string, code: string) {
  const image = await loadImageElement(imageUrl);
  const maxEdge = 1500;
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available.');
  context.fillStyle = '#08090a';
  context.fillRect(0, 0, width, height);
  drawContainedImage(context, image, 0, 0, width, height);
  drawWatermark(context, width, height, `绣艺境数字档案・仅限非商用研究・${code}`);
  return canvasToPngBlob(canvas);
}

async function createShareCard(options: {
  imageUrl: string;
  code: string;
  name: string;
  categoryLine: string;
  siteUrl: string;
}) {
  const image = await loadImageElement(options.imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1600;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available.');

  context.fillStyle = '#08090a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#111014';
  context.fillRect(56, 56, 968, 980);
  drawContainedImage(context, image, 76, 76, 928, 940);
  context.save();
  context.beginPath();
  context.rect(56, 56, 968, 980);
  context.clip();
  drawWatermark(context, canvas.width, 1040, `绣艺境档案・非商用仅限研究・${options.code}`);
  context.restore();

  context.fillStyle = '#f8f4ff';
  context.font = '48px "Microsoft YaHei", sans-serif';
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillText(options.code, 72, 1106);

  context.font = '54px "Microsoft YaHei", sans-serif';
  const title = options.name.length > 18 ? `${options.name.slice(0, 18)}…` : options.name;
  context.fillText(title, 72, 1178);

  context.fillStyle = 'rgba(255, 255, 255, 0.68)';
  context.font = '30px "Microsoft YaHei", sans-serif';
  context.fillText(options.categoryLine, 72, 1272);

  context.fillStyle = 'rgba(232, 190, 255, 0.95)';
  context.font = '32px "Microsoft YaHei", sans-serif';
  context.fillText('绣艺境数字档案・仅限非商用研究・商用风险自负', 72, 1400);

  context.fillStyle = 'rgba(255, 255, 255, 0.52)';
  context.font = '26px Arial, "Microsoft YaHei", sans-serif';
  context.fillText('绣艺境・汉绣纹样数字基因库', 72, 1480);
  context.fillText(options.siteUrl, 72, 1522);

  return canvasToPngBlob(canvas);
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let j = 0; j < 8; j += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

async function createZip(files: Array<{ name: string; content: Blob | string }>) {
  const encoder = new TextEncoder();
  const localParts: BlobPart[] = [];
  const centralParts: BlobPart[] = [];
  let offset = 0;
  let centralSize = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = typeof file.content === 'string'
      ? encoder.encode(file.content)
      : new Uint8Array(await file.content.arrayBuffer());
    const checksum = crc32(contentBytes);
    const localHeader = new ArrayBuffer(30);
    const localView = new DataView(localHeader);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, 0);
    writeUint16(localView, 12, 0);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, contentBytes.byteLength);
    writeUint32(localView, 22, contentBytes.byteLength);
    writeUint16(localView, 26, nameBytes.byteLength);
    writeUint16(localView, 28, 0);
    localParts.push(localHeader, nameBytes, contentBytes);

    const centralHeader = new ArrayBuffer(46);
    const centralView = new DataView(centralHeader);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, 0);
    writeUint16(centralView, 14, 0);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, contentBytes.byteLength);
    writeUint32(centralView, 24, contentBytes.byteLength);
    writeUint16(centralView, 28, nameBytes.byteLength);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    centralParts.push(centralHeader, nameBytes);
    centralSize += centralHeader.byteLength + nameBytes.byteLength;

    offset += localHeader.byteLength + nameBytes.byteLength + contentBytes.byteLength;
  }

  const endHeader = new ArrayBuffer(22);
  const endView = new DataView(endHeader);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  return new Blob([...localParts, ...centralParts, endHeader], { type: 'application/zip' });
}

function updateMetaTag(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function PatternDetail() {
  const { heCode } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as keyof MultilingualString;
  const isEnglish = i18n.language === 'en';
  const categoryLanguage = isEnglish ? 'en' : 'zh';
  const fallback = isEnglish ? 'Information unavailable.' : '暂无资料';
  const plainFallback = fallback;
  const [activeImageMode] = useState<ImageMode>('pattern');
  const [activeTab, setActiveTab] = useState<DetailTab>('basic');
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(() => readFavorites());
  const [shareFeedback, setShareFeedback] = useState(false);
  const [isDownloadNoticeOpen, setIsDownloadNoticeOpen] = useState(false);
  const [downloadConfirmed, setDownloadConfirmed] = useState(false);
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState(false);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [shareCopy, setShareCopy] = useState('');

  const pattern = mockPatterns.find((item) => item.heCode === heCode || getCanonicalCode(item) === heCode);

  const similarPatterns = useMemo(() => (pattern ? getSimilarPatterns(pattern, currentLang) : []), [currentLang, pattern]);
  const matchedStitches = useMemo(
    () => (pattern ? findStitchesInText(getLocalizedText(pattern.craft, 'zh-CN', '')) : []),
    [pattern],
  );

  useEffect(() => {
    setActiveTab('basic');
    setIsZoomed(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [heCode]);

  useEffect(() => {
    if (!pattern) return;
    const code = getCanonicalCode(pattern) || pattern.heCode;
    const patternName = getLocalizedPatternName(pattern, currentLang);
    const title = isEnglish
      ? `${code} ${patternName} - XIUYIJING Han Embroidery Gene Archive`
      : `${code} ${patternName}・绣艺境汉绣基因库`;
    const description = isEnglish
      ? 'Traditional motifs are public cultural symbols. Archive records are provided for heritage research and learning only; commercial use requires independent rights verification.'
      : '传统纹样属公共文化符号，整件作品权属待确认，仅供非遗学术研究阅览，商用请自行核查授权。';
    document.title = title;
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[name="description"]', 'name', 'description', description);
  }, [currentLang, isEnglish, pattern]);

  useEffect(() => () => {
    if (shareCardUrl) URL.revokeObjectURL(shareCardUrl);
  }, [shareCardUrl]);

  if (!pattern) {
    return <div className="pt-32 text-center text-white">{isEnglish ? 'Pattern not found' : '未找到纹样'}</div>;
  }

  const canonicalCode = getCanonicalCode(pattern) || pattern.heCode;
  const parsedCode = parseHECode(canonicalCode);
  const name = getLocalizedPatternName(pattern, currentLang);
  const englishName = getLocalizedText(pattern.name, 'en', canonicalCode);
  const isFavorite = favoriteCodes.includes(pattern.heCode);
  const copyrightText = getLocalizedPlainText(pattern.copyrightOwner, currentLang, plainFallback);
  const sourceText = getLocalizedText(pattern.origin, currentLang, fallback);
  const visualAnalysis = pattern.visualAnalysis || patternVisualAnalysis[pattern.heCode] || patternVisualAnalysis[canonicalCode];

  const toggleFavorite = () => {
    setFavoriteCodes((current) => {
      const next = current.includes(pattern.heCode)
        ? current.filter((code) => code !== pattern.heCode)
        : [...current, pattern.heCode];
      localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('hanxiu:favorites-updated'));
      return next;
    });
  };

  const classification = getPatternClassification(pattern);
  const patternCategoryLabel = getCategoryLabel('pattern', classification.patternCategory, categoryLanguage);
  const meaningCategoryLabel = getCategoryLabel('meaning', classification.meaningCategory, categoryLanguage);
  const colorCategoryLabel = getCategoryLabel('color', classification.colorCategory, categoryLanguage);
  const categoryLine = [patternCategoryLabel, meaningCategoryLabel, colorCategoryLabel].filter(Boolean).join('・');
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const buildMetadataMarkdown = () => [
    `# ${canonicalCode} ${name}`,
    '',
    `- HE 编码：${canonicalCode}`,
    `- 名称：${name}`,
    `- 纹样分类：${getCategoryDisplay(pattern, 'pattern', categoryLanguage)}`,
    `- 寓意分类：${getCategoryDisplay(pattern, 'meaning', categoryLanguage)}`,
    `- 色彩分类：${getCategoryDisplay(pattern, 'color', categoryLanguage)}`,
    `- 年代：${getLocalizedPlainText(pattern.era, currentLang, plainFallback)}`,
    `- 地域：${getLocalizedPlainText(pattern.region, currentLang, plainFallback)}`,
    `- 载体：${getLocalizedPlainText(pattern.carrier, currentLang, plainFallback)}`,
    `- 工艺 / 针法：${getLocalizedText(pattern.craft, currentLang, fallback)}`,
    `- 寓意说明：${getLocalizedText(pattern.symbolism, currentLang, fallback)}`,
    `- 数据来源：${sourceText}`,
    `- 版权状态：${copyrightText}`,
    `- 页面链接：${pageUrl}`,
    '',
    '## 使用提示',
    '本档案包仅导出带水印预览图、结构化元数据与版权使用须知，不包含无水印原图、高清商用素材、第三方摄影原片或矢量源文件。',
  ].join('\n');

  const buildCopyrightNotice = () => [
    '绣艺境数字档案版权使用须知',
    '',
    '1. 本档案包仅限非遗研究、个人学习、公共教育与资料核对使用。',
    '2. 未经相应权利人事先书面授权，不得用于商业宣传、产品包装、文创售卖、付费课程、商业数据库、素材训练库或其他直接、间接营利用途。',
    '3. 档案中的带水印预览图仅用于研究参考，不代表获得复制、传播、改编、商用或去除水印使用许可。',
    '4. 传统纹样可能属于公共文化符号，但整件绣品、摄影作品、扫描件、书籍页面或馆藏图文仍可能存在独立权利。',
    '5. 商业使用前应自行核查权属并取得原作者、收藏机构、出版机构或其他权利人的有效许可，相关风险由使用者自行承担。',
    '6. 权利人如需补充署名、更正来源、限制展示或通知下架，可通过站点页脚公布的维权投稿通道联系。',
  ].join('\n');

  const handleDownloadArchive = async () => {
    if (!downloadConfirmed || isPreparingDownload) return;
    setIsPreparingDownload(true);
    try {
      const preview = await createWatermarkedPreview(pattern.imageUrl, canonicalCode);
      const safeBaseName = sanitizeFileName(`${canonicalCode}_${name}_研究档案`);
      const zip = await createZip([
        { name: `${canonicalCode}_带水印预览图.png`, content: preview },
        { name: `${canonicalCode}_纹样元数据.md`, content: buildMetadataMarkdown() },
        { name: `${canonicalCode}_版权使用须知.txt`, content: buildCopyrightNotice() },
      ]);
      downloadBlob(zip, `${safeBaseName}.zip`);
      setIsDownloadNoticeOpen(false);
      setDownloadConfirmed(false);
      setDownloadFeedback(true);
      window.setTimeout(() => setDownloadFeedback(false), 1400);
    } finally {
      setIsPreparingDownload(false);
    }
  };

  const sharePattern = async () => {
    if (isPreparingShare) return;
    const text = `【绣艺境汉绣基因库】${canonicalCode} ${name}
传统纹样属公共文化符号，档案仅供非遗研究/个人学习参考，商用请自行核查权属。
查看详情：${pageUrl}`;
    setIsPreparingShare(true);
    try {
      try {
        await navigator.clipboard?.writeText(text);
      } catch {
        // Some browsers block clipboard writes outside secure contexts; the panel still shows copy text.
      }
      const card = await createShareCard({
        imageUrl: pattern.imageUrl,
        code: canonicalCode,
        name,
        categoryLine,
        siteUrl: window.location.origin,
      });
      const nextUrl = URL.createObjectURL(card);
      setShareCardUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextUrl;
      });
      setShareCopy(text);
      setIsSharePanelOpen(true);
      setShareFeedback(true);
      window.setTimeout(() => setShareFeedback(false), 1200);
    } finally {
      setIsPreparingShare(false);
    }
  };

  const fields = [
    [t('pattern.category'), getCategoryDisplay(pattern, 'pattern', categoryLanguage)],
    [t('pattern.meaning_category'), getCategoryDisplay(pattern, 'meaning', categoryLanguage)],
    [t('pattern.color_category'), getCategoryDisplay(pattern, 'color', categoryLanguage)],
    [t('pattern.era'), getLocalizedPlainText(pattern.era, currentLang, plainFallback)],
    [t('pattern.region'), getLocalizedPlainText(pattern.region, currentLang, plainFallback)],
    [t('pattern.carrier'), getLocalizedPlainText(pattern.carrier, currentLang, plainFallback)],
    [t('pattern.craft'), getLocalizedText(pattern.craft, currentLang, fallback)],
    [t('pattern.source'), sourceText],
    [t('pattern.copyright'), copyrightText],
  ];

  const analysisItems = visualAnalysis ? [
    [isEnglish ? 'Original Pattern' : '原始纹样', getLocalizedText(visualAnalysis.originalPattern, currentLang, fallback)],
    [isEnglish ? 'Outline Extraction' : '轮廓提取', getLocalizedText(visualAnalysis.outlineExtraction, currentLang, fallback)],
    [isEnglish ? 'Main Color Ratio' : '主色比例', getLocalizedText(visualAnalysis.mainColorRatio, currentLang, fallback)],
    [isEnglish ? 'Pattern Unit' : '单元纹样', getLocalizedText(visualAnalysis.patternUnit, currentLang, fallback)],
    [isEnglish ? 'Symmetry' : '对称关系', getLocalizedText(visualAnalysis.symmetry, currentLang, fallback)],
    [isEnglish ? 'Repetition' : '重复规律', getLocalizedText(visualAnalysis.repetition, currentLang, fallback)],
    [isEnglish ? 'Composition Center' : '构图中心', getLocalizedText(visualAnalysis.compositionCenter, currentLang, fallback)],
    [isEnglish ? 'Structure Description' : '结构说明', getLocalizedText(visualAnalysis.structureDescription, currentLang, fallback)],
  ] : [];

  return (
    <div className="hanxiu-main-surface min-h-screen pt-16 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 overflow-hidden px-5 lg:h-[calc(100vh-4rem)] lg:grid-cols-2">
        <div className="flex min-h-[58vh] flex-col justify-center overflow-hidden py-6 pr-0 lg:h-full lg:min-h-0 lg:py-8 lg:pr-8">
          <button onClick={() => navigate(-1)} className="mb-4 flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-sm text-white/45 transition-colors hover:border-fuchsia-300/35 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {t('nav.back')}
          </button>

          <div
            className="relative h-[calc(100vh-12rem)] max-h-[680px] w-full overflow-hidden border border-white/10 bg-black/20"
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setTransformOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`);
            }}
          >
            <img
              src={activeImageMode === 'pattern' ? pattern.imageUrl : pattern.imageUrl}
              alt={name}
              onClick={() => setIsZoomed((current) => !current)}
              onError={(event) => fallbackToOriginalImage(event, pattern.originalImageUrl)}
              className={`h-full w-full cursor-zoom-in object-contain transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100'}`}
              style={{ transformOrigin }}
            />
          </div>
        </div>

        <aside className="flex h-full items-center bg-black/24 py-6 pl-0 backdrop-blur-xl lg:border-l lg:border-white/10 lg:overflow-hidden lg:py-8 lg:pl-8">
          <div className="mx-auto flex w-full max-w-xl flex-col justify-center">
            <p className="text-sm text-fuchsia-200/60">{englishName}</p>
            <h1 className="mt-2 text-3xl font-medium tracking-wide text-white/92">{name}</h1>
            <div className="mt-4 inline-flex rounded border border-white/10 bg-white/5 px-3 py-1 font-mono text-sm uppercase tracking-widest text-fuchsia-400">
              {canonicalCode}
            </div>
            {!parsedCode.isValid && <div className="mt-2 text-xs text-amber-300/80">{t('pattern.code_pending')}</div>}

            <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-2 border-y border-white/10 py-4 text-sm">
              {fields.map(([label, value]) => (
                <div key={label} className="contents">
                  <div className="col-span-1 text-white/40">{label}</div>
                  <div className="col-span-2 text-white/78">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <button onClick={toggleFavorite} className={`border px-3 py-3 text-sm transition-colors ${isFavorite ? 'border-fuchsia-500 bg-fuchsia-950/20 text-fuchsia-300' : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'}`}>
                <Star className="mx-auto mb-1 h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                {t('common.save')}
              </button>
              <button onClick={sharePattern} className="border border-white/20 px-3 py-3 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white">
                <Share2 className="mx-auto mb-1 h-4 w-4" />
                {isPreparingShare ? (isEnglish ? 'Preparing' : '生成中') : shareFeedback ? (isEnglish ? 'Copied' : '已复制') : t('common.share')}
              </button>
              <button onClick={() => setIsDownloadNoticeOpen(true)} className="border border-fuchsia-400/40 bg-fuchsia-950/20 px-3 py-3 text-sm text-fuchsia-100 transition-colors hover:border-fuchsia-300/80">
                <Download className="mx-auto mb-1 h-4 w-4" />
                {downloadFeedback ? (isEnglish ? 'Downloaded' : '已生成') : t('common.download_record')}
              </button>
            </div>
          </div>
        </aside>
      </section>

      <section id="basic-record" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
        <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
          {detailTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${activeTab === tab ? 'border-fuchsia-400/70 bg-fuchsia-950/30 text-white' : 'border-white/10 text-white/46 hover:text-white'}`}>
              {t(`pattern.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.025] p-6 text-sm leading-8 text-white/70">
          {activeTab === 'basic' && (
            <div className="grid gap-3 md:grid-cols-2">
              {[...fields, [t('pattern.literature'), getLocalizedText(pattern.literature, currentLang, fallback)]].map(([label, value]) => (
                <div key={label} className="border-b border-white/5 pb-3">
                  <span className="block text-white/36">{label}</span>
                  <strong className="font-normal text-white/76">{value}</strong>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'meaning' && <p>{getLocalizedText(pattern.symbolism, currentLang, fallback)}</p>}
          {activeTab === 'craft' && (
            <div className="space-y-6">
              <p>{getLocalizedText(pattern.craft, currentLang, fallback)}</p>
              {matchedStitches.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {matchedStitches.map((stitch) => {
                    const stitchTitle = isEnglish ? stitch.enName : stitch.name;
                    return (
                      <article key={stitch.name} className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                        <div className="aspect-[4/3] bg-white">
                          <img src={stitch.imageUrl} alt={stitchTitle} className="h-full w-full object-contain" loading="lazy" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-medium text-white">{stitchTitle}</h3>
                          <p className="mt-2 text-xs leading-6 text-white/58">
                            {getLocalizedText(stitch.summary, currentLang, isEnglish ? 'No English stitch summary available.' : stitch.summary['zh-CN'])}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {activeTab === 'analysis' && (
            <div className="grid gap-4 md:grid-cols-2">
              {analysisItems.map(([label, value]) => (
                <div key={label} className="rounded border border-white/8 bg-black/20 p-4">
                  <span className="block text-white/42">{label}</span>
                  <strong className="mt-2 block font-normal leading-7 text-white/76">{value}</strong>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'copyright' && (
            <div className="space-y-3">
              <p>{t('pattern.source')}: {sourceText}</p>
              <p>{isEnglish ? 'Image Source' : '图片来源'}: {copyrightText}</p>
              <p>{isEnglish ? 'Research Note' : '研究整理说明'}: {getLocalizedText(pattern.origin, currentLang, fallback)}</p>
              <p>{isEnglish ? 'Usage Scope' : '使用范围'}: {isEnglish ? 'Research display only. Commercial use requires authorization.' : '仅供研究展示，商业使用需授权。'}</p>
              <p>{t('pattern.copyright_notice')}: {copyrightText}</p>
            </div>
          )}
        </div>
      </section>

      {similarPatterns.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <h2 className="mb-8 text-2xl font-semibold text-white">{t('pattern.similar')}</h2>
          <GeneWall patterns={similarPatterns} showHoverInfo getMetaLabel={(item) => getCategoryDisplay(item, 'pattern', categoryLanguage)} />
        </section>
      )}

      {isDownloadNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/12 bg-[#0d0d10] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-200/50">{canonicalCode}</p>
                <h2 className="mt-2 text-xl font-medium text-white">{isEnglish ? 'Download Research Archive' : '下载研究档案'}</h2>
              </div>
              <button onClick={() => setIsDownloadNoticeOpen(false)} className="border border-white/10 px-3 py-1 text-sm text-white/50 transition-colors hover:text-white">
                {isEnglish ? 'Close' : '关闭'}
              </button>
            </div>
            <p className="mt-5 text-sm leading-7 text-white/58">
              {isEnglish
                ? 'The archive contains only a watermarked preview, metadata and a copyright notice. It does not include original images, commercial HD assets or vector source files.'
                : '档案包仅包含带水印预览图、纹样元数据和版权使用须知，不提供无水印原图、商用高清素材或矢量源文件。'}
            </p>
            <label className="mt-6 flex cursor-pointer items-start gap-3 border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-white/72">
              <input
                type="checkbox"
                checked={downloadConfirmed}
                onChange={(event) => setDownloadConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4 accent-fuchsia-500"
              />
              <span>{isEnglish ? 'I confirm this is only for non-commercial heritage research and I understand the copyright risk.' : '我确认仅用于非商用非遗研究，已知晓版权风险。'}</span>
            </label>
            <button
              onClick={handleDownloadArchive}
              disabled={!downloadConfirmed || isPreparingDownload}
              className="mt-5 w-full border border-fuchsia-400/50 bg-fuchsia-950/25 px-4 py-3 text-sm text-fuchsia-100 transition-colors hover:border-fuchsia-300 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:text-white/28"
            >
              {isPreparingDownload ? (isEnglish ? 'Preparing archive...' : '正在生成档案包...') : (isEnglish ? 'Confirm Download' : '确认下载')}
            </button>
          </div>
        </div>
      )}

      {isSharePanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-5 backdrop-blur-sm">
          <div className="grid max-h-[92vh] w-full max-w-4xl gap-5 overflow-y-auto border border-white/12 bg-[#0d0d10] p-5 shadow-2xl shadow-black/40 md:grid-cols-[minmax(260px,360px)_1fr]">
            <div className="border border-white/10 bg-black/30 p-3">
              {shareCardUrl && <img src={shareCardUrl} alt={`${canonicalCode} ${name}`} className="h-auto w-full object-contain" />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-200/50">{canonicalCode}</p>
                  <h2 className="mt-2 text-xl font-medium text-white">{isEnglish ? 'Share Card' : '分享图与文案'}</h2>
                </div>
                <button onClick={() => setIsSharePanelOpen(false)} className="border border-white/10 px-3 py-1 text-sm text-white/50 transition-colors hover:text-white">
                  {isEnglish ? 'Close' : '关闭'}
                </button>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/58">
                {isEnglish
                  ? 'The generated image and copy include non-commercial research and copyright risk notices.'
                  : '生成图和默认文案已包含“仅限非商用研究、商用风险自负”的版权提示。'}
              </p>
              <textarea
                readOnly
                value={shareCopy}
                className="mt-5 min-h-32 resize-none border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/72 outline-none"
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard?.writeText(shareCopy);
                    } catch {
                      return;
                    }
                    setShareFeedback(true);
                    window.setTimeout(() => setShareFeedback(false), 1200);
                  }}
                  className="border border-white/20 px-4 py-3 text-sm text-white/76 transition-colors hover:border-white/40 hover:text-white"
                >
                  {shareFeedback ? (isEnglish ? 'Copied' : '已复制') : (isEnglish ? 'Copy Text' : '复制文案')}
                </button>
                {shareCardUrl && (
                  <a
                    href={shareCardUrl}
                    download={`${sanitizeFileName(`${canonicalCode}_${name}_分享图`)}.png`}
                    className="border border-fuchsia-400/50 bg-fuchsia-950/25 px-4 py-3 text-center text-sm text-fuchsia-100 transition-colors hover:border-fuchsia-300"
                  >
                    {isEnglish ? 'Save Share Image' : '保存分享图'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
