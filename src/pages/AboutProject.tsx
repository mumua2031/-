import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

type TextBlock = {
  paragraphs?: string[];
  items?: string[];
};

type AboutSection = TextBlock & {
  number: string;
  title: string;
};

const projectPosition: AboutSection = {
  number: '一',
  title: '项目定位',
  paragraphs: [
    '“绣艺境”是一个面向非遗保护、学术研究与公共教育的汉绣纹样数字基因库，集数字化存档、分类检索、在线浏览与文化解读于一体。',
    '平台通过图像采集、规范编码与多维建档，对汉绣纹样的题材、寓意、色彩、针法及载体信息进行系统整理，并以数字化方式呈现纹样的视觉特征、工艺规律与文化内涵，为汉绣资源的保存、研究、学习与传播提供参考。',
    '该平台属于个人研究与设计实践项目，主要承担汉绣纹样资料整理、数字展示、分类检索和公共文化传播功能，不作为文物鉴定、权属鉴定、学术定论或商业授权平台。',
  ],
};

const heCodeParts = [
  {
    label: 'HE',
    title: '汉绣固定前缀，Han Embroidery统一标识。',
  },
  {
    label: 'N / H / G',
    title: '纹样大类。',
    body: 'N为自然纹样，H为人文或民俗纹样，G为几何或抽象纹样。',
  },
  {
    label: 'B / S / L',
    title: '寓意大类。',
    body: 'B为吉祥祈福类，S为精神信仰类，L为生活志趣类。',
  },
  {
    label: 'R / G / B / A / M',
    title: '色彩大类。',
    body: 'R为红色系，G为绿色系，B为蓝色系，A为金色系，M为多色系。',
  },
  {
    label: '01',
    title: '同一分类组合下的唯一序号，用于实现一码对应一纹样。',
  },
];

const heCodeNotes = [
  'HE编码用于本项目内部的纹样分类、检索与数字档案管理。',
  '不得将HE编码解释为对传统纹样、历史实物、原始图像或相关文化资源权属的认定。',
  '本项目主要对HE编码体系的原创文字说明、图形表达、页面呈现及相关数据库编排成果主张相应权利，不对抽象分类思想、传统文化元素或不属于本项目的既有资料主张排他性所有权。',
];

const processCards = [
  {
    number: '01',
    title: '观绣',
    steps: ['线上与线下图像采集', '图像整理与校正', '轮廓提取', '数字描摹', '规范化存档'],
    description:
      '对公开网络、文献资料、文化机构公开信息及线下采集过程中获得的汉绣图像进行整理、校正和标准化处理，建立统一的数字图像档案。数字化整理不改变原始实物、原始摄影作品、馆藏资料及其他第三方内容的权利归属。',
  },
  {
    number: '02',
    title: '解绣',
    steps: ['纹样元素整理', '造型特征提取', '针法信息记录', '寓意分类', 'HE编码建档'],
    description:
      '从纹样题材、文化寓意、色彩属性、工艺及载体等维度建立结构化档案。分类与解释主要用于研究整理和信息检索。受地域差异、历史流变、资料完整程度及研究观点不同等因素影响，同一纹样可能存在不同名称、寓意解释、工艺判断或分类方式。',
  },
];

const legalSections: AboutSection[] = [
  {
    number: '四',
    title: '数据来源与信息说明',
    paragraphs: [
      '本平台展示的图像、文字、纹样档案及相关研究信息，主要来源于公开网络资料、书籍文献、学术资料、博物馆及文化机构公开信息，以及项目开展过程中形成的线下拍摄、访谈、观察和整理记录。',
      '平台资料采集遵循公开、可追溯和非商业研究展示原则，主要面向线上公开信息、公开出版物、公开展览资料、公开馆藏信息、线下公开参观或经允许形成的项目记录，不主动收录明知属于未公开、受限制访问或未经许可披露的资料。',
      '平台在资料收集与整理过程中尽可能记录和标注已知来源，但受原始资料保存状况、年代记载、地域称谓、公开信息完整程度及不同研究观点等因素影响，部分内容可能存在来源信息不完整、表述差异、分类争议或有待进一步考证的情况。',
      '平台所载内容主要用于信息展示、研究整理和公共教育，不构成对相关纹样年代、作者、权属、工艺流派、收藏来源或历史事实的最终认定。',
      '使用者应结合原始文献、实物资料、收藏机构记录及其他权威来源自行甄别和核实，不应将本平台内容作为唯一的学术、法律或事实依据。',
      '平台不对因资料本身错误、第三方来源更新、历史记录缺失或使用者未经核实而使用相关信息所产生的结果作绝对保证，但将在发现明确错误或收到有效更正材料后，视情况进行核实、修订或补充说明。',
    ],
  },
  {
    number: '五',
    title: '第三方资料与权利归属',
    paragraphs: [
      '平台中来源于第三方的图片、摄影作品、扫描件、书籍内容、论文资料、馆藏信息、机构名称、标识及其他受法律保护的内容，其著作权、商标权及其他合法权利仍归原作者、出版机构、收藏机构或其他权利人所有。',
      '平台对第三方资料进行收集、分类、摘录、标注或数字化展示，不代表相关著作权、所有权或其他知识产权已经转让给“绣艺境”或邹牧希 Zoey，也不代表访问者获得对相关资料进行复制、下载、传播、改编或商业使用的许可。',
      '对于已经进入公共领域、作者身份暂时无法确认或具有传统文化属性的纹样与资料，本项目仅对自身独立完成且具有原创性的文字说明、数字图像、图表表达、界面设计以及内容选择和编排成果主张相应权利。',
      '本项目不对不属于自身的传统纹样、历史实物、第三方摄影作品、文献原文及馆藏资料主张所有权。',
      '如具体资料页面已标注来源、作者、收藏单位或使用范围，使用者还应同时遵守该页面的单项权利说明。',
    ],
  },
  {
    number: '六',
    title: '项目原创成果',
    paragraphs: [
      '在不影响第三方合法权利的前提下，下列由邹牧希 Zoey独立完成并具有原创性的内容，其相关知识产权依法归邹牧希 Zoey所有：',
    ],
    items: [
      '“绣艺境”网站的视觉设计、界面设计和交互设计；',
      '项目原创文字说明、研究整理成果和图表表达；',
      '由项目独立绘制或制作的数字图像、矢量文件和视觉展示成果；',
      '数据库内容具有独创性的选择、分类和编排；',
      'HE编码体系的原创文字说明、图形表达和页面呈现；',
      '项目原创标识、版式、信息架构及其他依法受到保护的成果。',
    ],
  },
  {
    number: '七',
    title: '使用范围与限制',
    paragraphs: [
      '本平台内容主要用于非遗保护、学术研究、个人学习、文化展示与公共教育。',
      '访问、浏览或在平台允许范围内查看相关内容，不代表“绣艺境”、邹牧希 Zoey或任何第三方权利人向使用者转让著作权、商标权、数据库相关权利或其他知识产权，也不构成任何明示或默示的商业许可。',
      '除适用法律明确规定的合理使用、法定许可、公共领域使用或其他法定例外情形外，未经相应权利人事先书面授权，不得实施以下行为：',
    ],
    items: [
      '复制、转载、摘编、出版、发行或公开传播平台内容；',
      '修改、改编、翻译、重绘或制作衍生作品；',
      '将相关图像、纹样、文字、界面或数据用于商品包装、文创产品、广告宣传、品牌设计、商业展览或其他经营活动；',
      '用于付费课程、商业出版物、商业数据库、会员服务或其他收费项目；',
      '批量抓取、爬取、镜像存储、建立数据集或再次分发平台内容；',
      '用于商业模型训练、商业素材训练库或其他直接、间接营利用途；',
      '删除、遮挡或修改作者署名、来源信息、版权标识及其他权利管理信息；',
      '以任何方式暗示已经获得本项目、邹牧希 Zoey、博物馆、文化机构或其他第三方的授权、合作、推荐或背书。',
    ],
  },
  {
    number: '八',
    title: '合理使用与法定例外',
    paragraphs: [
      '本声明无意限制适用法律明确规定的合理使用、法定许可、公共领域使用或其他合法权利。',
      '使用者主张合理使用、教学研究使用、评论引用或其他法定例外时，应自行判断其使用目的、使用数量、引用比例、署名方式，以及相关行为是否影响原作品的正常使用或不合理损害权利人的合法权益。',
      '即使使用目的属于学习、研究、教学、评论或文化传播，也不代表可以不受限制地复制、传播完整作品、大量下载平台资料或将相关内容用于公开发布。',
      '合理使用及其他法定例外的成立，应根据具体使用方式、使用范围和适用法律个案判断。',
    ],
  },
  {
    number: '九',
    title: '境外访问与跨境使用',
    paragraphs: [
      '本平台可能被中国大陆以外的用户访问。',
      '境外用户在访问、下载、引用、传播或使用平台内容时，除应遵守中华人民共和国相关法律法规外，还应遵守其所在地、内容使用地及其他可能适用国家或地区的著作权、商标、数据库、传统文化表达及相关知识产权法律。',
      '不同国家或地区在保护范围、保护期限、合理使用、教育使用、数据库保护及侵权救济等方面可能存在差异。',
      '本页面中的使用声明不替代任何国家或地区的强制性法律规定，也不应被理解为对境外法律后果的统一保证。',
    ],
  },
  {
    number: '十',
    title: '权利通知与内容处理',
    paragraphs: [
      '如权利人认为平台中的某项图片、文字、文献、标识或其他内容侵犯其著作权、商标权、肖像权、隐私权、名誉权或其他合法权益，可通过平台公布的联系渠道提交权利通知。',
      '权利通知建议包括：',
    ],
    items: [
      '权利人或授权代理人的姓名、机构名称及有效联系方式；',
      '涉及内容的名称、页面地址、HE编码或具体位置；',
      '权利归属、授权关系或其他合法权益的初步证明；',
      '希望采取的处理方式，例如补充署名、更正来源、限制展示或删除内容；',
      '对通知内容真实、准确的声明。',
    ],
  },
  {
    number: '十一',
    title: '说明、修订与解释',
    paragraphs: [
      '本页面及平台内关于数据来源、分类方式、HE编码、纹样释义、版权与使用范围的说明，均基于项目当前掌握的线上、线下公开资料及项目实践记录整理形成。',
      '因公开资料可能存在更新、遗漏、误引、重复传播、版本差异或权利状态变化，平台可根据新增资料、权利人通知、研究进展、页面优化或合规需要，对相关文字、分类、编码、图片展示、来源标注和权利说明进行补充、修订、限制展示或删除。',
      '在不违反法律法规强制性规定、不排除使用者依法享有的合理使用、法定许可、公共领域使用及其他法定权利的前提下，邹牧希 Zoey 对本项目原创说明、数据库编排、HE编码解释、页面呈现和资料更新规则保留解释、修订与更新权。',
      '本项目保留解释与更新权，不构成对第三方资料权属的确认，不代表平台可替代司法机关、行政机关、收藏机构、出版机构或其他权威主体作出最终法律、学术或事实认定。',
      '如平台内容与原始文献、收藏机构记录、权利人有效说明或现行法律法规存在冲突，应以原始资料、权利人有效证明及适用法律法规为准；平台将在合理范围内进行核实和调整。',
    ],
  },
];

const postListNotes = [
  '注明来源、标注“非商业使用”或声明“仅供学习交流”，不当然代表相关使用已经取得授权或必然符合法律规定。',
  '任何使用者在复制、引用、传播或改编具体资料前，均应自行确认相关内容的权利状态，并在需要时取得原作者、收藏机构、出版机构或其他权利人的有效许可。',
];

const rightsHandlingNotes = [
  '平台在收到内容完整且具有初步证明材料的权利通知后，将根据具体情况进行核实，并视情况采取补充来源、修正信息、限制访问、断开链接或删除相关内容等合理措施。',
  '本项目设置权利通知渠道，不代表平台预先承认相关内容构成侵权，也不影响各方依法主张权利或进行进一步核实。',
];

function SectionFrame({ section }: { section: AboutSection }) {
  return (
    <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[150px_minmax(0,1fr)]">
      <div>
        <div className="text-sm font-medium text-fuchsia-200/70">{section.number}</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">{section.title}</h2>
      </div>
      <div className="space-y-5 text-base leading-8 text-white/68">
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {section.items && (
          <ol className="space-y-3 pl-5 text-white/72">
            {section.items.map((item) => (
              <li key={item} className="list-decimal pl-2">
                {item}
              </li>
            ))}
          </ol>
        )}
        {section.title === '项目原创成果' && (
          <div className="mt-8 border-l border-fuchsia-300/40 pl-5">
            <p>不得使用“本网站所有图片、所有纹样和所有文字均归邹牧希所有”等过度概括的表述。</p>
            <p className="mt-4 text-white/78">
              本平台原创内容及具有独创性的选择、编排与视觉表达，其相关权利归邹牧希 Zoey所有；第三方资料及既有作品的相关权利归原作者或原权利人所有。
            </p>
            <p className="mt-4 text-sm text-fuchsia-100/80">© 2026 邹牧希 Zoey. All Rights Reserved.</p>
          </div>
        )}
        {section.title === '使用范围与限制' &&
          postListNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        {section.title === '权利通知与内容处理' &&
          rightsHandlingNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
      </div>
    </section>
  );
}

export function AboutProject() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <main className="min-h-screen bg-[#050506] px-5 pb-24 pt-28 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-sm text-white/68 hover:border-fuchsia-300/40 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglish ? 'Back to Archive' : '返回主库界面'}
        </Link>

        <header className="mt-16 max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">
            {isEnglish ? 'About XIUYIJING' : '关于绣艺境'}
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white md:text-7xl">关于绣艺境</h1>
          <p className="mt-8 text-lg leading-9 text-white/58">
            汉绣纹样数字基因库的项目说明、编码体系、数据整理流程与权利声明。
          </p>
        </header>

        <div className="mt-24 space-y-24">
          <SectionFrame section={projectPosition} />

          <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[150px_minmax(0,1fr)]">
            <div>
              <div className="text-sm font-medium text-fuchsia-200/70">二</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">HE编码体系</h2>
            </div>
            <div>
              <div className="mb-4 font-mono text-lg text-fuchsia-100">HE-NB-R01</div>
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-fuchsia-300/30 bg-fuchsia-950/20 px-4 py-3 text-sm text-fuchsia-50">
                {['HE', 'NB', 'R', '01'].map((part) => (
                  <span key={part} className="rounded-full bg-fuchsia-300/14 px-4 py-2 font-medium">
                    {part}
                  </span>
                ))}
              </div>

              <div className="mt-9 grid gap-4">
                {heCodeParts.map((part) => (
                  <div key={part.label} className="grid gap-3 border-b border-white/10 pb-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                    <div className="font-mono text-sm text-fuchsia-100">{part.label}</div>
                    <div className="text-base leading-8 text-white/68">
                      <p>{part.title}</p>
                      {part.body && <p>{part.body}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 text-base leading-8 text-white/68">
                {heCodeNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[150px_minmax(0,1fr)]">
            <div>
              <div className="text-sm font-medium text-fuchsia-200/70">三</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">数据整理流程</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {processCards.map((card) => (
                <article key={card.title} className="rounded-lg border border-white/10 bg-white/[0.025] p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                    <span className="font-mono text-sm text-fuchsia-100/70">{card.number}</span>
                  </div>
                  <div className="mt-7 text-sm leading-7 text-fuchsia-50/78">
                    {card.steps.map((step, index) => (
                      <span key={step}>
                        {index > 0 && <span className="mx-2 text-white/28">→</span>}
                        <span>{step}</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-7 text-sm leading-7 text-white/62">{card.description}</p>
                </article>
              ))}
            </div>
          </section>

          {legalSections.map((section) => (
            <SectionFrame key={section.title} section={section} />
          ))}
        </div>
      </div>
    </main>
  );
}
