import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Crown, Flower2, Layers3, Shapes, Sparkles, Wand2 } from 'lucide-react';
import { GeneWall } from '../components/GeneWall';
import { InteractiveBackground } from '../components/InteractiveBackground';
import { mockPatterns } from '../data';

const cardGroups = [
  [
    {
      title: '花鸟纹',
      label: '自然生息',
      text: '以牡丹、莲花、蝶鸟构成祝颂秩序，记录汉绣从民间审美到礼俗表达的纹样基因。',
      icon: Flower2,
    },
    {
      title: '神兽纹',
      label: '瑞意护佑',
      text: '凤、龙、瑞兽等形象承载祈福与守护，在线脚密度和色彩层次中形成富丽堂皇的精神象征。',
      icon: Crown,
    },
    {
      title: '几何纹',
      label: '秩序骨架',
      text: '万字、回纹、连珠与云雷纹构成可复用的结构骨架，让传统纹样能被编码、检索与再创作。',
      icon: Shapes,
    },
  ],
  [
    {
      title: '铺针绣',
      label: '厚重铺色',
      text: '汉绣标志性针法，分层铺色堆叠，线条粗犷饱满，色块对比强烈，适合大面积花鸟、人物服饰铺底，色彩厚重立体。',
      icon: Layers3,
    },
    {
      title: '游针绣',
      label: '渐变晕染',
      text: '长短针交错渐变过渡，柔和晕染色彩，多用于花瓣、羽毛，让深浅色彩自然衔接，是汉绣柔化画面的关键工艺。',
      icon: Wand2,
    },
    {
      title: '打籽绣',
      label: '颗粒立体',
      text: '以丝线打结形成凸起小圆颗粒，用来点缀花蕊、装饰纹样，颗粒立体感极强，增添绣品精致质感。',
      icon: Sparkles,
    },
  ],
];

export function Home() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeCard, setActiveCard] = useState(1);
  const currentCards = cardGroups[activeGroup];

  const rotateCards = (direction: number) => {
    setActiveGroup((current) => (current + direction + cardGroups.length) % cardGroups.length);
    setActiveCard(1);
  };

  return (
    <main className="hanxiu-home min-h-screen bg-black">
      <section className="hanxiu-panel hanxiu-hero-stage relative overflow-hidden bg-black" aria-label="绣艺境汉绣纹样抽丝烟雾动画">
        <InteractiveBackground />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9),rgba(0,0,0,0.56)_34%,rgba(0,0,0,0.16)_62%,rgba(0,0,0,0.48))]" />
        <div className="hanxiu-hero-content relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-8 pt-16">
          <div className="hanxiu-hero-copy max-w-3xl">
            <h1 className="hanxiu-hero-title text-6xl font-semibold leading-none text-white md:text-8xl">
              绣艺境
            </h1>
            <p className="hanxiu-hero-subtitle mt-8 text-2xl font-light tracking-[0.55em] text-white/82 md:text-4xl">
              非遗汉绣纹样基因库
            </p>
          </div>

          <button
            className="hanxiu-scroll-cue absolute bottom-10 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-fuchsia-200/30 bg-black/35 text-fuchsia-100 shadow-[0_0_28px_rgba(236,72,153,0.24)] backdrop-blur-sm"
            onClick={() => document.getElementById('hanxiu-origin')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="向下浏览"
          >
            <ChevronDown className="h-7 w-7" />
          </button>
        </div>
      </section>

      <section id="hanxiu-origin" className="hanxiu-panel bg-[#08090a] px-4 py-24">
        <div className="mx-auto mb-10 flex max-w-7xl items-center justify-end px-4">
          <Link
            to="/explore"
            className="rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)] transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
          >
            进入纹样基因
          </Link>
        </div>
        <GeneWall patterns={mockPatterns} showLabels={false} />
      </section>

      <section className="hanxiu-panel bg-[#050506] px-5 py-24">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center">
            <h2 className="text-4xl font-semibold text-white md:text-5xl">
              {activeGroup === 0 ? '符号分类' : '针法分类'}
            </h2>
            <div className="flex gap-3">
              <button className="hanxiu-carousel-button" onClick={() => rotateCards(-1)} aria-label="上一组">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="hanxiu-carousel-button" onClick={() => rotateCards(1)} aria-label="下一组">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Link
              to="/deconstruct"
              className="rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)] transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25 md:ml-auto"
            >
              进入基因解构
            </Link>
          </div>

          <div className="hanxiu-symbol-carousel">
            {currentCards.map((card, index) => {
              const Icon = card.icon;
              const offset = index - activeCard;

              return (
                <button
                  key={card.title}
                  className="hanxiu-symbol-card"
                  style={{ '--offset': offset, '--lift': Math.abs(offset) } as CSSProperties}
                  onMouseEnter={() => setActiveCard(index)}
                  onFocus={() => setActiveCard(index)}
                >
                  <span className="hanxiu-symbol-icon">
                    <Icon className="h-8 w-8" />
                  </span>
                  <span className="text-sm text-fuchsia-200/70">{card.label}</span>
                  <strong className="text-3xl font-semibold text-white">{card.title}</strong>
                  <span className="text-left text-base leading-8 text-white/64">{card.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
