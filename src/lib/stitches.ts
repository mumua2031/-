import type { StitchTechnique } from '../types';

export const stitchSourceNote =
  '据《汉绣针法类别》、项目针法整合文档、公开非遗资料与学术资料核对后整理；界面说明采用研究展示用精简表述。';

const categories = {
  foundation: { zh: '基础骨架针法', en: 'Foundation Structure Stitches' },
  transition: { zh: '晕染过渡针法', en: 'Color Transition Stitches' },
  outline: { zh: '轮廓锁边装饰针法', en: 'Outline and Edge Stitches' },
  relief: { zh: '立体垫高针法', en: 'Raised Padding Stitches' },
  texture: { zh: '编织肌理针法', en: 'Woven Texture Stitches' },
  metallic: { zh: '平金夹绣金属特色针法', en: 'Metallic Couching Stitches' },
};

function stitch(data: Omit<StitchTechnique, 'source'>): StitchTechnique {
  return { ...data, source: stitchSourceNote };
}

export const stitchTechniques: StitchTechnique[] = [
  stitch({
    name: '分层齐针',
    enName: 'Layered Straight Stitch',
    category: categories.foundation.zh,
    enCategory: categories.foundation.en,
    aliases: ['齐针', '坎子针', '分层破色针', '分层配色'],
    imageUrl: '/stitches/分层齐针.png',
    summary: {
      'zh-CN': '分层密排，针脚咬合，用于平整填色。',
      en: 'Layered parallel filling for even color fields.',
    },
    origin: {
      'zh-CN': '源自战国楚平针改良，清代汉口绣花街艺人定型“分层破色”工艺，边缘齐整，是汉绣区别苏绣平针的重要特征。',
      en: 'Developed from Chu plain stitching and refined in Hankou embroidery workshops as a layered color-breaking method.',
    },
    features: {
      'zh-CN': '由外向内分层密排，每层针脚紧贴前一层、针针咬合，色块间留细水路区分层次，大面积填充平整耐磨。',
      en: 'Dense layers move inward, with interlocked stitches and narrow separation lines between color blocks.',
    },
    usage: {
      'zh-CN': '适用于牡丹、花叶、背景底色等大面积平整填充。',
      en: 'Used for peonies, leaves and broad background color fields.',
    },
  }),
  stitch({
    name: '铺针',
    enName: 'Foundation Stitch',
    category: categories.foundation.zh,
    enCategory: categories.foundation.en,
    aliases: ['平针铺底', '满铺'],
    imageUrl: '/stitches/铺针.png',
    summary: {
      'zh-CN': '长线铺底，为上层绣线建立基底。',
      en: 'Long foundation threads used beneath surface stitches.',
    },
    origin: {
      'zh-CN': '由多层齐针的底层铺垫方式简化而来，清代戏衣绣工常用于快速填充大块底色。',
      en: 'A simplified base layer derived from layered straight stitching for broad color filling.',
    },
    features: {
      'zh-CN': '长针满铺底层，上层再叠短齐针上色，主要承担基底作用，不作为表层纹样表现。',
      en: 'Long stitches cover the base, then shorter straight stitches are layered above.',
    },
    usage: {
      'zh-CN': '适用于山石、大面积绸缎底色与厚底铺垫。',
      en: 'Used for rock forms, large silk grounds and padded foundations.',
    },
  }),
  stitch({
    name: '套针',
    enName: 'Long-and-short Stitch',
    category: categories.foundation.zh,
    enCategory: categories.foundation.en,
    aliases: ['长短针', '长短掺针', '散套针'],
    imageUrl: '/stitches/套针.png',
    summary: {
      'zh-CN': '长短针套接，形成柔和渐变。',
      en: 'Interlocked long and short stitches for soft gradation.',
    },
    origin: {
      'zh-CN': '吸收湘绣长短套针方法，并结合汉绣浓艳撞色审美进行改良。',
      en: 'Adapted from long-and-short stitch methods and adjusted for Han embroidery color contrast.',
    },
    features: {
      'zh-CN': '长短针交错套接，色块衔接无生硬边界，适合形成自然过渡。',
      en: 'Alternating long and short stitches connect color areas without hard boundaries.',
    },
    usage: {
      'zh-CN': '适用于花瓣渐变、鸟类羽毛与柔和明暗转换。',
      en: 'Used for petal gradients, feathers and soft tonal changes.',
    },
  }),
  stitch({
    name: '掺针',
    enName: 'Blended Stitch',
    category: categories.transition.zh,
    enCategory: categories.transition.en,
    aliases: ['插针', '虚实掺针', '分层掺针', '多色掺针', '掺针套色'],
    imageUrl: '/stitches/掺针.png',
    summary: {
      'zh-CN': '长短错落换色，表现花瓣、羽毛明暗。',
      en: 'Staggered color blending for petals and feathers.',
    },
    origin: {
      'zh-CN': '江汉民间绣人为解决花卉色彩断层而形成的核心晕染针法，又称插针。',
      en: 'A Jianghan folk method for solving abrupt color breaks in floral embroidery.',
    },
    features: {
      'zh-CN': '一针长一针短交替排布，多层换色叠加，形成自然渐变。',
      en: 'Long and short stitches alternate across layers to blend colors naturally.',
    },
    usage: {
      'zh-CN': '适用于牡丹、荷花、鸟兽皮毛等需要色彩晕染的位置。',
      en: 'Used for peonies, lotus, feathers and animal fur.',
    },
  }),
  stitch({
    name: '润针',
    enName: 'Retouching Stitch',
    category: categories.transition.zh,
    enCategory: categories.transition.en,
    aliases: ['补色针'],
    imageUrl: '/stitches/润针.png',
    summary: {
      'zh-CN': '短线局部补色，弱化色彩断层。',
      en: 'Short local stitches used to soften color breaks.',
    },
    origin: {
      'zh-CN': '由掺针的辅助修补方式发展而来，民国时期汉绣艺人进一步完善。',
      en: 'A retouching method developed as a support technique for blended stitching.',
    },
    features: {
      'zh-CN': '以细短线在局部补色，修整明暗交界和突兀色块。',
      en: 'Short fine stitches are added locally to soften harsh tonal transitions.',
    },
    usage: {
      'zh-CN': '适用于人像面部、纹样明暗微调与局部补色。',
      en: 'Used for faces, small tonal adjustments and local color correction.',
    },
  }),
  stitch({
    name: '游针',
    enName: 'Free-flow Stitch',
    category: categories.transition.zh,
    enCategory: categories.transition.en,
    aliases: ['曲线游针'],
    imageUrl: '/stitches/游针.png',
    summary: {
      'zh-CN': '自由曲线走针，适合云水、飘带。',
      en: 'Free curved stitching for clouds, water and ribbons.',
    },
    origin: {
      'zh-CN': '为表现飘逸曲线而形成的针法，常见于云纹、水纹和动态线条表现。',
      en: 'Formed to express flowing curved lines in clouds, water and motion details.',
    },
    features: {
      'zh-CN': '针路随物象流动，无固定排布规则，强调线条的方向感与流动性。',
      en: 'The stitch path follows the image form freely, emphasizing direction and movement.',
    },
    usage: {
      'zh-CN': '适用于云纹、流水、飘带、发丝等曲线纹样。',
      en: 'Used for clouds, water, ribbons and hair-like flowing lines.',
    },
  }),
  stitch({
    name: '锁针',
    enName: 'Chain Stitch',
    category: categories.outline.zh,
    enCategory: categories.outline.en,
    aliases: ['辫子股针', '锁边绣', '锁针（辫子针）', '辫子针'],
    imageUrl: '/stitches/锁针（辫子针）.png',
    summary: {
      'zh-CN': '连环线圈成链，常用于轮廓锁边。',
      en: 'Linked chain loops for durable outlines.',
    },
    origin: {
      'zh-CN': '继承江陵马山楚墓出土先秦辫子股绣传统，是楚绣系统中较早见的链式针迹。',
      en: 'Inherited from early Chu chain-stitch traditions represented by braided stitch traces.',
    },
    features: {
      'zh-CN': '线圈连环锁缝，形成连续凸起的辫子纹路，耐磨耐洗。',
      en: 'Interlinked loops create a raised chain texture with strong durability.',
    },
    usage: {
      'zh-CN': '适用于纹样外轮廓、藤蔓、衣缘包边。',
      en: 'Used for motif outlines, vines and garment edge binding.',
    },
  }),
  stitch({
    name: '扣针',
    enName: 'Back Stitch',
    category: categories.outline.zh,
    enCategory: categories.outline.en,
    aliases: ['回针'],
    imageUrl: '/stitches/扣针.png',
    summary: {
      'zh-CN': '短针往返互扣，固定细小边缘。',
      en: 'Small return stitches for tight edge control.',
    },
    origin: {
      'zh-CN': '民间固定细碎纹样的锁边针法，明清戏衣镶边中较常见。',
      en: 'A folk edge-securing stitch often used in opera costume trimming.',
    },
    features: {
      'zh-CN': '短针往返互扣，线条紧致细密，不易脱线。',
      en: 'Short returning stitches interlock to form tight, stable lines.',
    },
    usage: {
      'zh-CN': '适用于小型花瓣、首饰细轮廓与局部锁边。',
      en: 'Used for small petals, jewelry outlines and fine edge control.',
    },
  }),
  stitch({
    name: '滚针',
    enName: 'Stem Stitch',
    category: categories.outline.zh,
    enCategory: categories.outline.en,
    aliases: ['细滚针'],
    imageUrl: '/stitches/滚针.png',
    summary: {
      'zh-CN': '针脚叠压成线，适合叶脉细枝。',
      en: 'Overlapped stitches forming smooth fine lines.',
    },
    origin: {
      'zh-CN': '汉口绣花街细线条专用针法，常用于叶脉、细枝等线性细节。',
      en: 'A fine-line stitch used in Hankou embroidery workshops for veins and branches.',
    },
    features: {
      'zh-CN': '前后针相互叠压，针眼藏于线下，线条光滑连续。',
      en: 'Overlapping stitches hide holes under the thread and create smooth lines.',
    },
    usage: {
      'zh-CN': '适用于叶脉、细枝干、曲线纹样。',
      en: 'Used for leaf veins, fine branches and curved outlines.',
    },
  }),
  stitch({
    name: '关针',
    enName: 'Securing Stitch',
    category: categories.outline.zh,
    enCategory: categories.outline.en,
    aliases: ['加固针'],
    imageUrl: '/stitches/关针.png',
    summary: {
      'zh-CN': '交叉短线加固纹样边角。',
      en: 'Crossed short stitches used to secure corners.',
    },
    origin: {
      'zh-CN': '细碎小花加固针法，用于防止长期揉搓后边缘脱丝。',
      en: 'A reinforcing stitch for small floral and edge details.',
    },
    features: {
      'zh-CN': '短针交叉往返，锁定纹样边角和细小节点。',
      en: 'Crossed short stitches secure corners and small nodes.',
    },
    usage: {
      'zh-CN': '适用于细碎小花、昆虫轮廓与易磨损边缘。',
      en: 'Used for small flowers, insect outlines and fragile edges.',
    },
  }),
  stitch({
    name: '垫针',
    enName: 'Padding Stitch',
    category: categories.relief.zh,
    enCategory: categories.relief.en,
    aliases: ['垫线'],
    imageUrl: '/stitches/垫针.png',
    summary: {
      'zh-CN': '底层垫高，上层覆盖形成浮雕感。',
      en: 'Padded base stitches for raised relief effects.',
    },
    origin: {
      'zh-CN': '为浮雕立体效果而形成，先以棉线或粗丝线垫高，再覆盖表层绣线。',
      en: 'Created for relief effects by padding the base before covering it with surface stitches.',
    },
    features: {
      'zh-CN': '底层垫高，表层以齐针、掺针覆盖，形成凹凸浮雕感。',
      en: 'A raised base is covered with straight or blended stitches to form relief.',
    },
    usage: {
      'zh-CN': '适用于花瓣、瑞兽头部、山石凸起处。',
      en: 'Used for petals, auspicious beast heads and raised rock forms.',
    },
  }),
  stitch({
    name: '凸针',
    enName: 'Raised Padding Stitch',
    category: categories.relief.zh,
    enCategory: categories.relief.en,
    aliases: ['堆针'],
    imageUrl: '/stitches/凸针.png',
    summary: {
      'zh-CN': '多层垫高，强化主体立体度。',
      en: 'Stacked padding for strongly raised motifs.',
    },
    origin: {
      'zh-CN': '由多层垫针叠加发展而来，常用于高端戏衣龙凤等主体纹样。',
      en: 'Developed by stacking padding layers for strongly raised major motifs.',
    },
    features: {
      'zh-CN': '多层粗线堆叠垫高，厚重饱满，立体感强。',
      en: 'Multiple coarse-thread layers create a thick, full and highly raised surface.',
    },
    usage: {
      'zh-CN': '适用于大幅龙凤、民俗挂屏主体纹样。',
      en: 'Used for large dragon-phoenix motifs and major hanging-screen patterns.',
    },
  }),
  stitch({
    name: '打子针',
    enName: 'Seed Stitch',
    category: categories.relief.zh,
    enCategory: categories.relief.en,
    aliases: ['打籽针', '籽针', '打籽绣'],
    imageUrl: '/stitches/打籽针.png',
    summary: {
      'zh-CN': '绕线成粒，常作花蕊与圆点。',
      en: 'Knotted seed-like dots for stamens and details.',
    },
    origin: {
      'zh-CN': '民间花卉花蕊古法针法，先秦楚绣中已见点状籽绣雏形。',
      en: 'An old floral stamen stitch with early dotted precedents in Chu embroidery.',
    },
    features: {
      'zh-CN': '丝线绕针形成圆润颗粒，呈现立体圆点肌理。',
      en: 'Thread is wrapped into rounded granules to create raised dot texture.',
    },
    usage: {
      'zh-CN': '适用于花蕊、果实、装饰圆点。',
      en: 'Used for stamens, fruit and ornamental dots.',
    },
  }),
  stitch({
    name: '织针',
    enName: 'Woven Stitch',
    category: categories.texture.zh,
    enCategory: categories.texture.en,
    aliases: ['织针（灯笼锦）', '灯笼锦', '芦席片'],
    imageUrl: '/stitches/织针（灯笼锦）.png',
    summary: {
      'zh-CN': '横竖交织，形成网格肌理。',
      en: 'Interwoven threads forming grid-like texture.',
    },
    origin: {
      'zh-CN': '由古代锦地刺绣演化，模拟编织席纹和灯笼格，是汉绣肌理表现针法。',
      en: 'Evolved from brocade-ground embroidery to imitate woven mat and lantern-grid textures.',
    },
    features: {
      'zh-CN': '横竖针交叉排布，形成席纹、灯笼格等网格肌理。',
      en: 'Horizontal and vertical stitches interweave into grid-like textures.',
    },
    usage: {
      'zh-CN': '适用于背景锦纹、衣料肌理装饰。',
      en: 'Used for brocade backgrounds and textile texture decoration.',
    },
  }),
  stitch({
    name: '间针',
    enName: 'Interval Stitch',
    category: categories.texture.zh,
    enCategory: categories.texture.en,
    aliases: ['虚实针'],
    imageUrl: '/stitches/间针.png',
    summary: {
      'zh-CN': '长短间隔排布，表现虚实纹理。',
      en: 'Alternating stitch lengths for broken texture.',
    },
    origin: {
      'zh-CN': '虚实纹理表现针法，清代灯彩绣品中常见。',
      en: 'A texture stitch used to create alternating solid and empty effects.',
    },
    features: {
      'zh-CN': '长短针间隔排布，制造虚实交错的质感。',
      en: 'Long and short stitches alternate to create broken texture.',
    },
    usage: {
      'zh-CN': '适用于水波、虚化背景、木纹。',
      en: 'Used for ripples, blurred backgrounds and wood grain.',
    },
  }),
  stitch({
    name: '缆针',
    enName: 'Cording Stitch',
    category: categories.texture.zh,
    enCategory: categories.texture.en,
    aliases: ['揽针', '粗线揽针'],
    imageUrl: '/stitches/揽针.png',
    summary: {
      'zh-CN': '多股并线走针，塑造粗重轮廓。',
      en: 'Bundled threads used for heavy outlines.',
    },
    origin: {
      'zh-CN': '粗重轮廓专用针法，多用于龙爪、粗树干、建筑边框等厚重线条。',
      en: 'A heavy-line stitch used for strong outlines such as claws, trunks and architectural borders.',
    },
    features: {
      'zh-CN': '多股丝线并排缠绕走针，线条粗壮厚重。',
      en: 'Multiple silk strands are bundled and stitched into heavy raised lines.',
    },
    usage: {
      'zh-CN': '适用于粗枝干、龙纹爪部、大幅纹样边框。',
      en: 'Used for thick branches, dragon claws and large motif borders.',
    },
  }),
  stitch({
    name: '盘金绣',
    enName: 'Gold Couching',
    category: categories.metallic.zh,
    enCategory: categories.metallic.en,
    aliases: ['盘金', '银线盘绣'],
    imageUrl: '/stitches/盘金绣.png',
    summary: {
      'zh-CN': '金线沿轮廓盘绕钉固，增强华丽感。',
      en: 'Couched metallic thread following motif outlines.',
    },
    origin: {
      'zh-CN': '承续楚人尚金审美，明清官服、汉剧戏衣中常用，并与唐代蹙金绣传统有关。',
      en: 'Linked to a gold-valuing Chu aesthetic and widely used in official dress and Han opera costume embroidery.',
    },
    features: {
      'zh-CN': '金线沿纹样轮廓平铺盘绕，再以细色丝钉牢固定，金线凸起反光。',
      en: 'Metallic thread is laid along outlines and fixed by fine colored silk stitches.',
    },
    usage: {
      'zh-CN': '适用于龙凤轮廓、戏衣镶边、宗教绣品。',
      en: 'Used for dragon-phoenix outlines, opera costume borders and religious embroidery.',
    },
  }),
  stitch({
    name: '压金绣',
    enName: 'Pressed Gold Stitch',
    category: categories.metallic.zh,
    enCategory: categories.metallic.en,
    aliases: ['压金', '夹金绣', '平金夹绣'],
    imageUrl: '/stitches/压金绣.png',
    summary: {
      'zh-CN': '金线夹于彩丝层间，形成厚重层次。',
      en: 'Metallic thread pressed between colored silk layers.',
    },
    origin: {
      'zh-CN': '清代汉口绣工形成“平金夹绣”工艺，是汉绣区别其他绣种的重要标识。',
      en: 'A Hankou flat-gold sandwich embroidery method regarded as a key Han embroidery feature.',
    },
    features: {
      'zh-CN': '金线夹在两层色丝中间，底层铺彩色丝线，表层压金线，层次金碧厚重。',
      en: 'Gold thread is pressed between colored silk layers to create a rich metallic depth.',
    },
    usage: {
      'zh-CN': '适用于大面积牡丹、祥云主体装饰。',
      en: 'Used for large peonies, clouds and major decorative areas.',
    },
  }),
  stitch({
    name: '堆金绣',
    enName: 'Raised Gold Couching',
    category: categories.metallic.zh,
    enCategory: categories.metallic.en,
    aliases: ['堆金'],
    imageUrl: '/stitches/堆金绣.png',
    summary: {
      'zh-CN': '多层金线堆叠，形成金属浮雕。',
      en: 'Layered metallic thread forming raised relief.',
    },
    origin: {
      'zh-CN': '多层金线堆叠垫高，晚清高端挂屏、寺庙供绣中常见。',
      en: 'A raised metallic method often used in late-Qing high-end hangings and temple embroidery.',
    },
    features: {
      'zh-CN': '多层金线叠加垫高，形成金属浮雕立体效果。',
      en: 'Stacked metallic threads create raised relief with a sculptural effect.',
    },
    usage: {
      'zh-CN': '适用于大型落地挂屏、宗教祭祀绣品。',
      en: 'Used for large hanging screens and religious ceremonial embroidery.',
    },
  }),
];

export function findStitchesInText(text: string) {
  const normalizedText = text.replace(/\s+/g, '');
  return stitchTechniques.filter((technique) => {
    const names = [technique.name, ...(technique.aliases || [])];
    return names.some((name) => normalizedText.includes(name.replace(/\s+/g, '')));
  });
}
