import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, CircleDotDashed, Crown, Download, Flower2, Share2, Shapes, Sparkles, Wand2 } from 'lucide-react';
import CircularGallery from '../components/CircularGallery';
import { mockPatterns } from '../data';
import type { PatternGene } from '../types';

const colorSets = [
  ['#E60012', '#CBA42A', '#00C9FF', '#00A383', '#880088'],
  ['#D61F69', '#F2A23A', '#114A7A', '#1CA88B', '#F6E9CB'],
  ['#F01828', '#22B8D8', '#E0B437', '#0B7E63', '#7A0B8E'],
];

const stitchTags = ['平金绣', '锁针绣', '破丝绣'];
const originCardGroups = [
  [
    {
      title: '花鸟纹',
      label: '自然生息',
      text: '以牡丹、莲花、蝶鸟构成祝颂秩序，记录汉绣从民间审美到礼俗表达的纹样基因。',
      detail: '花鸟纹以自然物象寄托生息、繁盛与礼俗祝愿，是汉绣纹样中最常见的符号系统之一。它通过花瓣、叶脉、羽翼等形态组织画面秩序。',
      icon: Flower2,
    },
    {
      title: '神兽纹',
      label: '瑞意护佑',
      text: '凤、龙、瑞兽等形象承载祈福与守护，在线脚密度和色彩层次中形成富丽堂皇的精神象征。',
      detail: '神兽纹强调祥瑞、守护与精神信仰。汉绣以浓重色彩和密集针脚塑造神兽的威仪，使纹样具有礼仪性和叙事感。',
      icon: Crown,
    },
    {
      title: '几何纹',
      label: '秩序骨架',
      text: '回纹、连珠与云雷纹构成可复用的结构骨架，让传统纹样能被编码、检索与再创作。',
      detail: '几何纹是纹样结构化的基础，可作为边饰、骨架和重复单元。它让汉绣纹样具备可拆解、可编码、可再生的数字基因特征。',
      icon: Shapes,
    },
  ],
  [
    {
      title: '齐针',
      label: '针脚齐整',
      text: '以均匀针脚顺势铺陈，稳住花瓣边缘和纹样骨架，让汉绣画面呈现清晰、饱满的基础层次。',
      detail: '齐针强调针脚方向与长度的秩序感，适合表现花瓣、叶片与边缘轮廓。它让复杂纹样先获得稳定骨架，再承接后续套针、盘金等重绣工艺。',
      icon: CircleDotDashed,
    },
    {
      title: '套针',
      label: '层层递进',
      text: '一引一接，丝线翻飞。通过长短交叠形成自然过渡，使花卉色彩从深到浅柔和衔接。',
      detail: '套针以多层线迹压叠与衔接塑造色彩渐变，能表现花瓣翻卷、叶脉起伏和绣面厚度，是汉绣重绣立体感的重要来源。',
      icon: Wand2,
    },
    {
      title: '盘金',
      label: '金线提亮',
      text: '以金线盘绕勾勒纹样边缘和重点结构，提升光泽层次，形成富丽堂皇的装饰气象。',
      detail: '盘金技法将金属线或亮线沿纹样走势盘置固定，常用于花心、边缘和装饰骨线，强化视觉中心，也让汉绣具有典型的华彩质感。',
      icon: Sparkles,
    },
  ],
];

function getDisplayName(pattern: PatternGene) {
  return pattern.name['zh-CN'] || pattern.name.en || pattern.heCode;
}

function getColors(index: number) {
  return colorSets[index % colorSets.length];
}

export function GeneDeconstruct() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeStitch, setActiveStitch] = useState(stitchTags[0]);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [originGroup, setOriginGroup] = useState(0);
  const [activeOriginCard, setActiveOriginCard] = useState(1);
  const [activeTechnique, setActiveTechnique] = useState<(typeof originCardGroups)[number][number] | null>(null);
  const selected = mockPatterns[selectedIndex];
  const colors = useMemo(() => getColors(selectedIndex), [selectedIndex]);
  const originCards = originCardGroups[originGroup];
  const galleryItems = useMemo(
    () =>
      mockPatterns.slice(0, 10).map((pattern) => ({
        image: pattern.imageUrl,
        text: getDisplayName(pattern),
      })),
    [],
  );

  const rotateOriginCards = (direction: number) => {
    setOriginGroup((current) => (current + direction + originCardGroups.length) % originCardGroups.length);
    setActiveOriginCard(1);
  };

  const downloadGene = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(120 + (index % 3) * 285, 120 + Math.floor(index / 3) * 255, index === 0 ? 270 : 220, index === 1 ? 430 : 220);
    });
    ctx.fillStyle = '#F8F3DF';
    ctx.save();
    ctx.translate(820, 230);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(0, 0, 150, 150);
    ctx.restore();
    ctx.strokeStyle = '#CBA42A';
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.arc(640, 520, 86, 0, Math.PI * 1.85);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '32px sans-serif';
    ctx.fillText(`${selected.heCode} 结构化基因`, 90, 820);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${selected.heCode}-gene.png`;
    link.click();
  };

  const shareGene = async () => {
    const shareText = `绣艺境基因解构：${selected.heCode} ${getDisplayName(selected)}`;
    if (navigator.share) {
      await navigator.share({ title: '绣艺境基因解构', text: shareText });
      return;
    }
    await navigator.clipboard?.writeText(shareText);
    alert('分享信息已复制');
  };

  return (
    <main className="gene-deconstruct-page bg-black text-white">
      <section className="hanxiu-panel px-5 pb-10 pt-24">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
          <div className="gene-circular-gallery-shell">
            <CircularGallery
              items={galleryItems}
              bend={2.2}
              textColor="#f7d8ff"
              borderRadius={0.06}
              scrollSpeed={1.8}
              scrollEase={0.045}
              font="600 28px Noto Sans SC"
            />
          </div>
        </div>
      </section>

      <section className="hanxiu-panel bg-[#09090b] px-5 py-24">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center">
            <h2 className="text-4xl font-semibold text-white md:text-5xl">{originGroup === 0 ? '符号分类' : '技艺分类'}</h2>
            <div className="flex gap-3">
              <button className="hanxiu-carousel-button" onClick={() => rotateOriginCards(-1)} aria-label="上一组">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="hanxiu-carousel-button" onClick={() => rotateOriginCards(1)} aria-label="下一组">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="hanxiu-symbol-carousel">
            {originCards.map((card, index) => {
              const Icon = card.icon;
              const offset = index - activeOriginCard;
              return (
                <button
                  key={card.title}
                  className="hanxiu-symbol-card gene-origin-technique-card"
                  style={{ '--offset': offset, '--lift': Math.abs(offset) } as CSSProperties}
                  onClick={() => setActiveTechnique(card)}
                  onMouseEnter={() => setActiveOriginCard(index)}
                  onFocus={() => setActiveOriginCard(index)}
                >
                  <span className="hanxiu-symbol-icon">
                    <Icon className="h-8 w-8" />
                  </span>
                  <span className="text-sm text-fuchsia-200/70">{card.label}</span>
                  <strong className="text-3xl font-semibold text-white">{card.title}</strong>
                  <span className="relative z-10 text-left text-base leading-8 text-white/74">{card.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeTechnique && (
        <div className="gene-technique-modal" role="dialog" aria-modal="true">
          <button className="gene-technique-modal-backdrop" onClick={() => setActiveTechnique(null)} aria-label="关闭针法详情" />
          <div className="gene-technique-modal-card">
            <img src="/hanxiu-stitch-museum.jpg" alt={`${activeTechnique.title}针法完整图`} />
            <div className="gene-technique-modal-copy">
              <span>{activeTechnique.label}</span>
              <h3>{activeTechnique.title}</h3>
              <p>{activeTechnique.detail}</p>
              <button onClick={() => setActiveTechnique(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      <section className="gene-deconstruct-workspace px-5 pb-4 pt-20">
        <div className="gene-shell mx-auto max-w-[1800px]">
          <div className="gene-grid gene-grid-compact grid gap-3">
            <section className="gene-panel gene-panel-compact">
              <header className="gene-panel-header">
                <strong>原样</strong>
              </header>

              <div className="gene-thumb-strip">
                {mockPatterns.slice(0, 12).map((pattern, index) => (
                  <button
                    key={pattern.id}
                    className={`gene-thumb ${selectedIndex === index ? 'gene-thumb-active' : ''}`}
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`选择 ${getDisplayName(pattern)}`}
                  >
                    <img src={pattern.imageUrl} alt={getDisplayName(pattern)} />
                  </button>
                ))}
              </div>

              <div className="gene-large-photo gene-large-photo-compact">
                <img src={selected.imageUrl} alt={getDisplayName(selected)} />
                <span className={`gene-highlight gene-highlight-${stitchTags.indexOf(activeStitch) + 1}`}></span>
              </div>

              <div className="gene-archive gene-archive-compact">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <span className="block text-white/38">基因编码</span>
                    <strong className="font-mono text-white/88">{selected.heCode}</strong>
                  </div>
                  <strong className="truncate text-right text-white/72">{getDisplayName(selected)}</strong>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stitchTags.map((tag) => (
                    <button
                      key={tag}
                      className={`gene-stitch-tag ${activeStitch === tag ? 'gene-stitch-tag-active' : ''}`}
                      onClick={() => setActiveStitch(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="gene-panel gene-panel-compact">
              <header className="gene-panel-header">
                <strong>提炼</strong>
              </header>

              <div className="gene-subpanel gene-subpanel-compact">
                <h3>色彩</h3>
                <div className="mt-3 grid grid-cols-5 gap-3">
                  {colors.map((color) => (
                    <div key={color}>
                      <div className="h-12 border border-white/10" style={{ backgroundColor: color }}></div>
                      <span className="mt-2 block font-mono text-[11px] text-white/58">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gene-subpanel gene-subpanel-compact flex-1">
                <h3>线稿</h3>
                <svg className="mt-2 h-full min-h-[96px] w-full" viewBox="0 0 520 180" aria-hidden="true">
                  <path d="M34 112 C84 28, 152 48, 174 92 S266 158, 306 96 S430 30, 486 96" fill="none" stroke="rgba(255,255,255,.62)" strokeWidth="2" />
                  <path d="M70 128 C132 96, 164 126, 214 88 C252 64, 288 66, 330 94 C372 122, 420 112, 470 70" fill="none" stroke="rgba(255,255,255,.36)" strokeWidth="1.5" />
                  <path d="M118 58 L168 92 L126 132 L78 94 Z M318 48 L396 78 L360 136 L292 106 Z" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
                  <circle cx="232" cy="98" r="34" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
                </svg>
              </div>
            </section>

            <section className="gene-panel gene-panel-compact">
              <header className="gene-panel-header">
                <strong>生成</strong>
              </header>

              <div
                className="gene-pop-window gene-pop-window-compact"
                style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setRotate({
                    x: ((event.clientY - rect.top) / rect.height - 0.5) * -8,
                    y: ((event.clientX - rect.left) / rect.width - 0.5) * 8,
                  });
                }}
                onMouseLeave={() => setRotate({ x: 0, y: 0 })}
              >
                <div style={{ backgroundColor: colors[0] }}></div>
                <div style={{ backgroundColor: colors[1] }}></div>
                <div style={{ backgroundColor: colors[2] }}></div>
                <div style={{ backgroundColor: colors[3] }}></div>
                <span style={{ backgroundColor: colors[4] }}></span>
                <i></i>
              </div>

              <div className="gene-action-row mt-auto">
                <button className="gene-export-button" onClick={downloadGene}>
                  <Download className="h-4 w-4" />
                  下载
                </button>
                <button className="gene-export-button gene-export-button-muted" onClick={shareGene}>
                  <Share2 className="h-4 w-4" />
                  分享
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
