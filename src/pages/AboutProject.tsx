import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

type LocalizedText = {
  zh: string;
  en: string;
};

type LocalizedSection = {
  number: LocalizedText;
  title: LocalizedText;
  paragraphs?: LocalizedText[];
  items?: LocalizedText[];
};

const ownerZh = '邹牧希（英文名简称：Zoey）';
const ownerEn = '邹牧希 (English name abbreviation: Zoey)';

const projectPosition: LocalizedSection = {
  number: { zh: '一', en: '01' },
  title: { zh: '项目定位', en: 'Project Positioning' },
  paragraphs: [
    {
      zh: '“绣艺境”是一个面向非遗保护、学术研究与公共教育的汉绣纹样数字基因库，集数字化存档、分类检索、在线浏览与文化解读于一体。',
      en: 'XIUYIJING is a digital gene archive for Han embroidery patterns, serving heritage preservation, academic research and public education through digital archiving, classification search, online browsing and cultural interpretation.',
    },
    {
      zh: '平台通过图像采集、规范编码与多维建档，对汉绣纹样的题材、寓意、色彩、针法及载体信息进行系统整理，并以数字化方式呈现纹样的视觉特征、工艺规律与文化内涵，为汉绣资源的保存、研究、学习与传播提供参考。',
      en: 'Through image collection, structured coding and multi-dimensional records, the platform organizes subject, meaning, color, stitch and carrier information, presenting visual features, craft patterns and cultural context as reference material.',
    },
    {
      zh: '该平台属于个人研究与设计实践项目，主要承担汉绣纹样资料整理、数字展示、分类检索和公共文化传播功能，不作为文物鉴定、权属鉴定、学术定论或商业授权平台。',
      en: 'The platform is a personal research and design practice project. It supports data organization, digital display, retrieval and public cultural communication, and is not an artifact authentication, ownership determination, academic finality or commercial authorization platform.',
    },
  ],
};

const heCodeParts = [
  {
    label: 'HE',
    text: {
      zh: '汉绣固定前缀，Han Embroidery 统一标识。',
      en: 'Fixed Han Embroidery prefix and project identifier.',
    },
  },
  {
    label: 'N / H / G',
    text: {
      zh: '纹样大类。N 为自然纹样，H 为人文或民俗纹样，G 为几何或抽象纹样。',
      en: 'Pattern category. N means nature, H means humanities or folk motif, and G means geometric or abstract motif.',
    },
  },
  {
    label: 'B / S / L',
    text: {
      zh: '寓意大类。B 为吉祥祈福类，S 为精神信仰类，L 为生活志趣类。',
      en: 'Meaning category. B means blessing, S means spiritual belief, and L means lifestyle interest.',
    },
  },
  {
    label: 'R / G / B / A / M',
    text: {
      zh: '色彩大类。R 为红色系，G 为绿色系，B 为蓝色系，A 为金色系，M 为多色系。',
      en: 'Color category. R means red, G means green, B means blue, A means gold, and M means multicolor.',
    },
  },
  {
    label: '01',
    text: {
      zh: '同一分类组合下的唯一序号，用于实现一码对应一纹样。',
      en: 'Unique sequence number under the same category combination, used to keep one code mapped to one pattern record.',
    },
  },
];

const heCodeNotes: LocalizedText[] = [
  {
    zh: 'HE 编码用于本项目内部的纹样分类、检索与数字档案管理。',
    en: 'HE codes are internal identifiers for pattern classification, retrieval and digital archive management in this project.',
  },
  {
    zh: '不得将 HE 编码解释为对传统纹样、历史实物、原始图像或相关文化资源权属的认定。',
    en: 'HE codes must not be interpreted as ownership determinations for traditional motifs, historical objects, original images or related cultural resources.',
  },
  {
    zh: '本项目主要对 HE 编码体系的原创文字说明、图形表达、页面呈现及相关数据库编排成果主张相应权利，不对抽象分类思想、传统文化元素或不属于本项目的既有资料主张排他性所有权。',
    en: 'The project claims rights only in its original wording, graphic expression, page presentation and original database arrangement related to the HE system. It does not claim exclusive ownership over abstract classification ideas, traditional cultural elements or third-party existing materials.',
  },
];

const processCards = [
  {
    number: '01',
    title: { zh: '观绣', en: 'Observation' },
    steps: {
      zh: ['线上与线下图像采集', '图像整理与校正', '轮廓提取', '数字描摹', '规范化存档'],
      en: ['Online and offline image collection', 'Image organization and correction', 'Outline extraction', 'Digital tracing', 'Standardized archiving'],
    },
    description: {
      zh: '对公开网络、文献资料、文化机构公开信息及线下采集过程中获得的汉绣图像进行整理、校正和标准化处理，建立统一的数字图像档案。数字化整理不改变原始实物、原始摄影作品、馆藏资料及其他第三方内容的权利归属。',
      en: 'Images from public web sources, literature, cultural institutions and offline collection are organized, corrected and standardized into a digital image archive. Digital organization does not change ownership of original objects, photographs, collection records or other third-party content.',
    },
  },
  {
    number: '02',
    title: { zh: '解绣', en: 'Interpretation' },
    steps: {
      zh: ['纹样元素整理', '造型特征提取', '针法信息记录', '寓意分类', 'HE 编码建档'],
      en: ['Motif element organization', 'Form feature extraction', 'Stitch information recording', 'Meaning classification', 'HE code archiving'],
    },
    description: {
      zh: '从纹样题材、文化寓意、色彩属性、工艺及载体等维度建立结构化档案。分类与解释主要用于研究整理和信息检索。受地域差异、历史流变、资料完整程度及研究观点不同等因素影响，同一纹样可能存在不同名称、寓意解释、工艺判断或分类方式。',
      en: 'Structured records are built from subject, cultural meaning, color, craft and carrier dimensions. Classification and interpretation support research organization and retrieval. Regional variation, historical change, data completeness and scholarly viewpoints may lead to different names, meanings, craft judgments or classifications for the same motif.',
    },
  },
];

const legalSections: LocalizedSection[] = [
  {
    number: { zh: '四', en: '04' },
    title: { zh: '数据来源与信息说明', en: 'Data Sources and Information Notice' },
    paragraphs: [
      {
        zh: '本平台展示的图像、文字、纹样档案及相关研究信息，主要来源于公开网络资料、书籍文献、学术资料、博物馆及文化机构公开信息，以及项目开展过程中形成的线下拍摄、访谈、观察和整理记录。',
        en: 'Images, text, pattern records and research information displayed on this platform mainly come from public online materials, books, academic references, public museum and cultural-institution information, and offline photography, interviews, observation and organization notes formed during the project.',
      },
      {
        zh: '平台在资料收集与整理过程中尽可能记录和标注已知来源，但受原始资料保存状况、年代记载、地域称谓、公开信息完整程度及不同研究观点等因素影响，部分内容可能存在来源信息不完整、表述差异、分类争议或有待进一步考证的情况。',
        en: 'Known sources are recorded where possible. Some entries may still have incomplete provenance, wording differences, classification disputes or points requiring further verification because of source preservation, period records, regional naming, public-information completeness and differing research views.',
      },
      {
        zh: '平台所载内容主要用于信息展示、研究整理和公共教育，不构成对相关纹样年代、作者、权属、工艺流派、收藏来源或历史事实的最终认定。',
        en: 'Platform content is for information display, research organization and public education only. It does not constitute final determination of period, authorship, ownership, craft lineage, collection provenance or historical fact.',
      },
      {
        zh: '使用者应结合原始文献、实物资料、收藏机构记录及其他权威来源自行甄别和核实，不应将本平台内容作为唯一的学术、法律或事实依据。',
        en: 'Users should verify information against original documents, physical materials, collection-institution records and other authoritative sources, and should not treat this platform as the sole academic, legal or factual basis.',
      },
    ],
  },
  {
    number: { zh: '五', en: '05' },
    title: { zh: '第三方资料与权利归属', en: 'Third-Party Materials and Rights' },
    paragraphs: [
      {
        zh: '平台中来源于第三方的图片、摄影作品、扫描件、书籍内容、论文资料、馆藏信息、机构名称、标识及其他受法律保护的内容，其著作权、商标权及其他合法权利仍归原作者、出版机构、收藏机构或其他权利人所有。',
        en: 'Third-party images, photographs, scans, book content, academic materials, collection records, institution names, marks and other protected content remain owned by their original authors, publishers, collection institutions or other right holders.',
      },
      {
        zh: `平台对第三方资料进行收集、分类、摘录、标注或数字化展示，不代表相关著作权、所有权或其他知识产权已经转让给“绣艺境”或${ownerZh}，也不代表访问者获得复制、下载、传播、改编或商业使用许可。`,
        en: `The collection, classification, excerpting, annotation or digital display of third-party materials does not mean copyright, ownership or other intellectual-property rights have been transferred to XIUYIJING or ${ownerEn}, and does not grant visitors permission to copy, download, distribute, adapt or commercially use those materials.`,
      },
      {
        zh: '对于已经进入公共领域、作者身份暂时无法确认或具有传统文化属性的纹样与资料，本项目仅对自身独立完成且具有原创性的文字说明、数字图像、图表表达、界面设计以及内容选择和编排成果主张相应权利。',
        en: 'For public-domain materials, temporarily unidentified authorship or traditional-cultural materials, the project claims rights only in original text, digital images, diagrams, interface design and original selection and arrangement independently created by the project.',
      },
      {
        zh: '本项目不对不属于自身的传统纹样、历史实物、第三方摄影作品、文献原文及馆藏资料主张所有权。',
        en: 'The project does not claim ownership over traditional motifs, historical objects, third-party photographs, original literature or collection records that do not belong to the project.',
      },
    ],
  },
  {
    number: { zh: '六', en: '06' },
    title: { zh: '项目原创成果', en: 'Original Project Outputs' },
    paragraphs: [
      {
        zh: `在不影响第三方合法权利的前提下，下列由${ownerZh}独立完成并具有原创性的内容，其相关知识产权依法归${ownerZh}所有：`,
        en: `Without affecting lawful third-party rights, the following original content independently completed by ${ownerEn} is owned by ${ownerEn} according to applicable law:`,
      },
    ],
    items: [
      { zh: '“绣艺境”网站的视觉设计、界面设计和交互设计；', en: 'Visual design, interface design and interaction design of the XIUYIJING website;' },
      { zh: '项目原创文字说明、研究整理成果和图表表达；', en: 'Original text, research organization outputs and diagram expression;' },
      { zh: '由项目独立绘制或制作的数字图像、矢量文件和视觉展示成果；', en: 'Digital images, vector files and visual presentation outputs independently drawn or produced by the project;' },
      { zh: '数据库内容具有独创性的选择、分类和编排；', en: 'Original selection, classification and arrangement of database content;' },
      { zh: 'HE 编码体系的原创文字说明、图形表达和页面呈现；', en: 'Original wording, graphic expression and page presentation of the HE coding system;' },
      { zh: '项目原创标识、版式、信息架构及其他依法受到保护的成果。', en: 'Original marks, layout, information architecture and other legally protected outputs.' },
    ],
  },
  {
    number: { zh: '七', en: '07' },
    title: { zh: '使用范围与限制', en: 'Permitted Scope and Restrictions' },
    paragraphs: [
      {
        zh: '本平台内容主要用于非遗保护、学术研究、个人学习、文化展示与公共教育。',
        en: 'Platform content is mainly intended for heritage preservation, academic research, personal study, cultural display and public education.',
      },
      {
        zh: `访问、浏览或在平台允许范围内查看相关内容，不代表“绣艺境”、${ownerZh}或任何第三方权利人向使用者转让著作权、商标权、数据库相关权利或其他知识产权，也不构成任何明示或默示的商业许可。`,
        en: `Accessing, browsing or viewing platform content within the platform interface does not transfer copyright, trademark rights, database-related rights or other intellectual-property rights from XIUYIJING, ${ownerEn} or any third-party right holder, and does not constitute express or implied commercial permission.`,
      },
      {
        zh: '除适用法律明确规定的合理使用、法定许可、公共领域使用或其他法定例外情形外，未经相应权利人事先书面授权，不得实施复制、转载、改编、商业使用、批量抓取、建立数据集、模型训练、删除署名或暗示授权合作等行为。',
        en: 'Except for fair use, statutory licenses, public-domain use or other statutory exceptions expressly provided by applicable law, users may not copy, repost, adapt, commercially use, scrape in bulk, build datasets, train models, remove attribution or imply authorization or cooperation without prior written permission from the relevant right holder.',
      },
      {
        zh: '注明来源、标注“非商业使用”或声明“仅供学习交流”，不当然代表相关使用已经取得授权或必然符合法律规定。',
        en: 'Source attribution, a “non-commercial use” label or a “for study and exchange only” statement does not by itself mean authorization has been obtained or that the use is lawful.',
      },
    ],
  },
  {
    number: { zh: '八', en: '08' },
    title: { zh: '合理使用与法定例外', en: 'Fair Use and Statutory Exceptions' },
    paragraphs: [
      {
        zh: '本声明无意限制适用法律明确规定的合理使用、法定许可、公共领域使用或其他合法权利。',
        en: 'This notice is not intended to restrict fair use, statutory licenses, public-domain use or other lawful rights expressly provided by applicable law.',
      },
      {
        zh: '使用者主张合理使用、教学研究使用、评论引用或其他法定例外时，应自行判断其使用目的、使用数量、引用比例、署名方式，以及相关行为是否影响原作品的正常使用或不合理损害权利人的合法权益。',
        en: 'Users claiming fair use, educational or research use, quotation for comment or other statutory exceptions should independently assess purpose, amount, quotation ratio, attribution and whether the use affects normal exploitation of the original work or unreasonably harms right holders.',
      },
      {
        zh: '合理使用及其他法定例外的成立，应根据具体使用方式、使用范围和适用法律个案判断。',
        en: 'Fair use and other statutory exceptions depend on the specific use, scope and applicable law.',
      },
    ],
  },
  {
    number: { zh: '九', en: '09' },
    title: { zh: '境外访问与跨境使用', en: 'Overseas Access and Cross-Border Use' },
    paragraphs: [
      {
        zh: '本平台可能被中国大陆以外的用户访问。境外用户在访问、下载、引用、传播或使用平台内容时，除应遵守中华人民共和国相关法律法规外，还应遵守其所在地、内容使用地及其他可能适用国家或地区的著作权、商标、数据库、传统文化表达及相关知识产权法律。',
        en: 'The platform may be accessed outside mainland China. Overseas users should comply with laws of the People’s Republic of China and with copyright, trademark, database, traditional-cultural-expression and related intellectual-property laws of their location, place of use and other applicable jurisdictions.',
      },
      {
        zh: '本页面中的使用声明不替代任何国家或地区的强制性法律规定，也不应被理解为对境外法律后果的统一保证。',
        en: 'This notice does not replace mandatory laws in any jurisdiction and should not be understood as a unified guarantee of overseas legal consequences.',
      },
    ],
  },
  {
    number: { zh: '十', en: '10' },
    title: { zh: '权利通知与内容处理', en: 'Rights Notices and Content Handling' },
    paragraphs: [
      {
        zh: '如权利人认为平台中的某项图片、文字、文献、标识或其他内容侵犯其著作权、商标权、肖像权、隐私权、名誉权或其他合法权益，可通过平台公布的联系渠道提交权利通知。',
        en: 'If a right holder believes that any image, text, document, mark or other content on the platform infringes copyright, trademark rights, portrait rights, privacy, reputation or other lawful rights, the right holder may submit a notice through the published contact channel.',
      },
      {
        zh: '权利通知建议包括权利人或代理人的有效联系方式、涉及内容的页面地址或 HE 编码、权利归属或授权关系的初步证明、希望采取的处理方式，以及对通知内容真实准确的声明。',
        en: 'A rights notice should include valid contact information for the right holder or agent, the page address or HE code of the relevant content, preliminary proof of rights or authorization, the requested handling method and a statement that the notice is true and accurate.',
      },
      {
        zh: '平台在收到内容完整且具有初步证明材料的权利通知后，将根据具体情况进行核实，并视情况采取补充来源、修正信息、限制访问、断开链接或删除相关内容等合理措施。',
        en: 'After receiving a complete notice with preliminary proof, the platform will review the situation and may supplement sources, correct information, restrict access, disconnect links or remove relevant content as appropriate.',
      },
    ],
  },
  {
    number: { zh: '十一', en: '11' },
    title: { zh: '说明、修订与解释', en: 'Updates, Revisions and Interpretation' },
    paragraphs: [
      {
        zh: '本页面及平台内关于数据来源、分类方式、HE 编码、纹样释义、版权与使用范围的说明，均基于项目当前掌握的线上、线下公开资料及项目实践记录整理形成。',
        en: 'Statements about data sources, classification, HE codes, motif interpretation, copyright and use are based on the online and offline public materials and project practice records currently available to the project.',
      },
      {
        zh: '因公开资料可能存在更新、遗漏、误引、重复传播、版本差异或权利状态变化，平台可根据新增资料、权利人通知、研究进展、页面优化或合规需要，对相关文字、分类、编码、图片展示、来源标注和权利说明进行补充、修订、限制展示或删除。',
        en: 'Because public materials may be updated, incomplete, misquoted, repeatedly circulated, versioned differently or subject to changing rights status, the platform may supplement, revise, restrict display of or remove relevant text, classifications, codes, image displays, source notes and rights statements based on new materials, rights notices, research progress, page optimization or compliance needs.',
      },
      {
        zh: `在不违反法律法规强制性规定、不排除使用者依法享有的合理使用、法定许可、公共领域使用及其他法定权利的前提下，${ownerZh}对本项目原创说明、数据库编排、HE 编码解释、页面呈现和资料更新规则保留解释、修订与更新权。`,
        en: `To the extent permitted by mandatory laws and without excluding statutory rights such as fair use, statutory licenses or public-domain use, ${ownerEn} reserves the right to interpret, revise and update the project’s original statements, database arrangement, HE code explanations, page presentation and data-update rules.`,
      },
      {
        zh: '本项目保留解释与更新权，不构成对第三方资料权属的确认，不代表平台可替代司法机关、行政机关、收藏机构、出版机构或其他权威主体作出最终法律、学术或事实认定。',
        en: 'This reservation of interpretation and update rights does not confirm ownership of third-party materials and does not mean the platform can replace judicial authorities, administrative authorities, collection institutions, publishers or other authoritative bodies in making final legal, academic or factual determinations.',
      },
    ],
  },
];

function text(value: LocalizedText, isEnglish: boolean) {
  return isEnglish ? value.en : value.zh;
}

function SectionFrame({ section, isEnglish }: { section: LocalizedSection; isEnglish: boolean }) {
  return (
    <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[150px_minmax(0,1fr)]">
      <div>
        <div className="text-sm font-medium text-fuchsia-200/70">{text(section.number, isEnglish)}</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">{text(section.title, isEnglish)}</h2>
      </div>
      <div className="space-y-5 text-base leading-8 text-white/68">
        {section.paragraphs?.map((paragraph) => (
          <p key={text(paragraph, isEnglish)}>{text(paragraph, isEnglish)}</p>
        ))}
        {section.items && (
          <ol className="space-y-3 pl-5 text-white/72">
            {section.items.map((item) => (
              <li key={text(item, isEnglish)} className="list-decimal pl-2">
                {text(item, isEnglish)}
              </li>
            ))}
          </ol>
        )}
        {section.title.en === 'Original Project Outputs' && (
          <div className="mt-8 border-l border-fuchsia-300/40 pl-5">
            <p>
              {isEnglish
                ? 'Do not use overbroad statements such as “all images, all motifs and all text on this website belong to the project owner.”'
                : '不得使用“本网站所有图片、所有纹样和所有文字均归邹牧希所有”等过度概括的表述。'}
            </p>
            <p className="mt-4 text-white/78">
              {isEnglish
                ? `Original platform content and original selection, arrangement and visual expression belong to ${ownerEn}; third-party materials and existing works remain owned by their original authors or right holders.`
                : `本平台原创内容及具有独创性的选择、编排与视觉表达，其相关权利归${ownerZh}所有；第三方资料及既有作品的相关权利归原作者或原权利人所有。`}
            </p>
            <p className="mt-4 text-sm text-fuchsia-100/80">
              {isEnglish ? `© 2026 ${ownerEn}. All Rights Reserved.` : `© 2026 ${ownerZh}. All Rights Reserved.`}
            </p>
          </div>
        )}
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
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white md:text-7xl">
            {isEnglish ? 'About XIUYIJING' : '关于绣艺境'}
          </h1>
          <p className="mt-8 text-lg leading-9 text-white/58">
            {isEnglish
              ? 'Project positioning, HE coding system, data organization workflow, source notice and rights statement for the Han embroidery digital gene archive.'
              : '汉绣纹样数字基因库的项目说明、编码体系、数据整理流程、资料来源与权利声明。'}
          </p>
        </header>

        <div className="mt-24 space-y-24">
          <SectionFrame section={projectPosition} isEnglish={isEnglish} />

          <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[150px_minmax(0,1fr)]">
            <div>
              <div className="text-sm font-medium text-fuchsia-200/70">{isEnglish ? '02' : '二'}</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">{isEnglish ? 'HE Coding System' : 'HE 编码体系'}</h2>
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
                    <p className="text-base leading-8 text-white/68">{text(part.text, isEnglish)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 text-base leading-8 text-white/68">
                {heCodeNotes.map((note) => (
                  <p key={text(note, isEnglish)}>{text(note, isEnglish)}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[150px_minmax(0,1fr)]">
            <div>
              <div className="text-sm font-medium text-fuchsia-200/70">{isEnglish ? '03' : '三'}</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">{isEnglish ? 'Data Organization Workflow' : '数据整理流程'}</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {processCards.map((card) => {
                const steps = isEnglish ? card.steps.en : card.steps.zh;
                return (
                  <article key={card.number} className="rounded-lg border border-white/10 bg-white/[0.025] p-7">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-2xl font-semibold text-white">{text(card.title, isEnglish)}</h3>
                      <span className="font-mono text-sm text-fuchsia-100/70">{card.number}</span>
                    </div>
                    <div className="mt-7 text-sm leading-7 text-fuchsia-50/78">
                      {steps.map((step, index) => (
                        <span key={step}>
                          {index > 0 && <span className="mx-2 text-white/28">→</span>}
                          <span>{step}</span>
                        </span>
                      ))}
                    </div>
                    <p className="mt-7 text-sm leading-7 text-white/62">{text(card.description, isEnglish)}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {legalSections.map((section) => (
            <SectionFrame key={section.title.en} section={section} isEnglish={isEnglish} />
          ))}
        </div>
      </div>
    </main>
  );
}
