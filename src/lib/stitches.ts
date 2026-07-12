import type { StitchTechnique } from '../types';

export const stitchSourceNote =
  '据项目针法整合文档、公开非遗资料与学术资料核对后整理；界面说明采用研究展示用精简表述。';

export const stitchTechniques: StitchTechnique[] = [
  {
    name: '分层齐针',
    enName: 'Layered Straight Stitch',
    aliases: ['齐针', '分层破色针', '分层配色'],
    imageUrl: '/stitches/分层齐针.png',
    summary: {
      'zh-CN': '分层密排，针脚咬合，用于平整填色。',
      en: 'Layered parallel filling for even color fields.',
    },
    source: stitchSourceNote,
  },
  {
    name: '铺针',
    enName: 'Foundation Stitch',
    aliases: ['平针铺底', '满铺'],
    imageUrl: '/stitches/铺针.png',
    summary: {
      'zh-CN': '长线铺底，为上层绣线建立基底。',
      en: 'Long foundation threads used beneath surface stitches.',
    },
    source: stitchSourceNote,
  },
  {
    name: '套针',
    enName: 'Long-and-short Stitch',
    aliases: ['长短针', '长短掺针'],
    imageUrl: '/stitches/套针.png',
    summary: {
      'zh-CN': '长短针套接，形成柔和渐变。',
      en: 'Interlocked long and short stitches for soft gradation.',
    },
    source: stitchSourceNote,
  },
  {
    name: '掺针',
    enName: 'Blended Stitch',
    aliases: ['虚实掺针', '分层掺针', '多色掺针', '掺针套色'],
    imageUrl: '/stitches/掺针.png',
    summary: {
      'zh-CN': '长短错落换色，表现花瓣、羽毛明暗。',
      en: 'Staggered color blending for petals and feathers.',
    },
    source: stitchSourceNote,
  },
  {
    name: '润针',
    enName: 'Retouching Stitch',
    aliases: ['补色针'],
    imageUrl: '/stitches/润针.png',
    summary: {
      'zh-CN': '短线局部补色，弱化色彩断层。',
      en: 'Short local stitches used to soften color breaks.',
    },
    source: stitchSourceNote,
  },
  {
    name: '游针',
    enName: 'Free-flow Stitch',
    aliases: ['曲线游针'],
    imageUrl: '/stitches/游针.png',
    summary: {
      'zh-CN': '自由曲线走针，适合云水、飘带。',
      en: 'Free curved stitching for clouds, water and ribbons.',
    },
    source: stitchSourceNote,
  },
  {
    name: '锁针',
    enName: 'Chain Stitch',
    aliases: ['锁边绣', '锁针（辫子针）', '辫子针'],
    imageUrl: '/stitches/锁针（辫子针）.png',
    summary: {
      'zh-CN': '连环线圈成链，常用于轮廓锁边。',
      en: 'Linked chain loops for durable outlines.',
    },
    source: stitchSourceNote,
  },
  {
    name: '扣针',
    enName: 'Back Stitch',
    aliases: ['回针'],
    imageUrl: '/stitches/扣针.png',
    summary: {
      'zh-CN': '短针往返互扣，固定细小边缘。',
      en: 'Small return stitches for tight edge control.',
    },
    source: stitchSourceNote,
  },
  {
    name: '滚针',
    enName: 'Stem Stitch',
    aliases: ['细滚针'],
    imageUrl: '/stitches/滚针.png',
    summary: {
      'zh-CN': '针脚叠压成线，适合叶脉细枝。',
      en: 'Overlapped stitches forming smooth fine lines.',
    },
    source: stitchSourceNote,
  },
  {
    name: '关针',
    enName: 'Securing Stitch',
    aliases: ['加固针'],
    imageUrl: '/stitches/关针.png',
    summary: {
      'zh-CN': '交叉短线加固纹样边角。',
      en: 'Crossed short stitches used to secure corners.',
    },
    source: stitchSourceNote,
  },
  {
    name: '垫针',
    enName: 'Padding Stitch',
    aliases: ['垫线'],
    imageUrl: '/stitches/垫针.png',
    summary: {
      'zh-CN': '底层垫高，上层覆盖形成浮雕感。',
      en: 'Padded base stitches for raised relief effects.',
    },
    source: stitchSourceNote,
  },
  {
    name: '凸针',
    enName: 'Raised Padding Stitch',
    aliases: ['堆针'],
    imageUrl: '/stitches/凸针.png',
    summary: {
      'zh-CN': '多层垫高，强化主体立体度。',
      en: 'Stacked padding for strongly raised motifs.',
    },
    source: stitchSourceNote,
  },
  {
    name: '打籽针',
    enName: 'Seed Stitch',
    aliases: ['打子针', '籽针', '打籽绣'],
    imageUrl: '/stitches/打籽针.png',
    summary: {
      'zh-CN': '绕线成粒，常作花蕊与圆点。',
      en: 'Knotted seed-like dots for stamens and details.',
    },
    source: stitchSourceNote,
  },
  {
    name: '织针',
    enName: 'Woven Stitch',
    aliases: ['织针（灯笼锦）', '灯笼锦', '芦席片'],
    imageUrl: '/stitches/织针（灯笼锦）.png',
    summary: {
      'zh-CN': '横竖交织，形成网格肌理。',
      en: 'Interwoven threads forming grid-like texture.',
    },
    source: stitchSourceNote,
  },
  {
    name: '间针',
    enName: 'Interval Stitch',
    aliases: ['虚实针'],
    imageUrl: '/stitches/间针.png',
    summary: {
      'zh-CN': '长短间隔排布，表现虚实纹理。',
      en: 'Alternating stitch lengths for broken texture.',
    },
    source: stitchSourceNote,
  },
  {
    name: '揽针',
    enName: 'Cording Stitch',
    aliases: ['缆针', '粗线揽针'],
    imageUrl: '/stitches/揽针.png',
    summary: {
      'zh-CN': '多股并线走针，塑造粗重轮廓。',
      en: 'Bundled threads used for heavy outlines.',
    },
    source: stitchSourceNote,
  },
  {
    name: '盘金绣',
    enName: 'Gold Couching',
    aliases: ['盘金', '盘金绣', '银线盘绣'],
    imageUrl: '/stitches/盘金绣.png',
    summary: {
      'zh-CN': '金线沿轮廓盘绕钉固，增强华丽感。',
      en: 'Couched metallic thread following motif outlines.',
    },
    source: stitchSourceNote,
  },
  {
    name: '压金绣',
    enName: 'Pressed Gold Stitch',
    aliases: ['压金', '夹金绣', '平金夹绣'],
    imageUrl: '/stitches/压金绣.png',
    summary: {
      'zh-CN': '金线夹于彩丝层间，形成厚重层次。',
      en: 'Metallic thread pressed between colored silk layers.',
    },
    source: stitchSourceNote,
  },
  {
    name: '堆金绣',
    enName: 'Raised Gold Couching',
    aliases: ['堆金'],
    imageUrl: '/stitches/堆金绣.png',
    summary: {
      'zh-CN': '多层金线堆叠，形成金属浮雕。',
      en: 'Layered metallic thread forming raised relief.',
    },
    source: stitchSourceNote,
  },
];

export function findStitchesInText(text: string) {
  const normalizedText = text.replace(/\s+/g, '');
  return stitchTechniques.filter((technique) => {
    const names = [technique.name, ...(technique.aliases || [])];
    return names.some((name) => normalizedText.includes(name.replace(/\s+/g, '')));
  });
}
