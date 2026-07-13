import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

type Locale = 'zh' | 'en';

type Section = {
  number: string;
  title: Record<Locale, string>;
  paragraphs?: Record<Locale, string[]>;
  items?: Record<Locale, string[]>;
};

const ownerZh = '邹牧希（英文名：Zoey）';
const ownerEn = '邹牧希 (English name: Zoey)';
const contactEmail = 'mumua2031@gmail.com';

const sections: Section[] = [
  {
    number: '一',
    title: { zh: '项目定位', en: 'Project Positioning' },
    paragraphs: {
      zh: [
        '「绣艺境」是面向非遗保护、学术研究与公共教育的汉绣纹样数字基因库，集成数字化存档、多维检索、在线阅览与文化解读功能。',
        '平台依托实物采集、文献整理、标准化编码与结构化建档，系统梳理汉绣纹样的题材、寓意、色彩、针法及载体信息，数字化呈现纹样视觉特征、工艺规律与文化内涵，为汉绣资源的保存、研究、学习与传播提供参考资料。',
        '本项目为个人研究与设计实践项目，仅承担资料整理、数字展示、分类检索与公共文化传播职能；不具备文物鉴定、权属认定、学术定论或商业授权资质，相关内容不作为任何法律、交易或学术判断的唯一依据。',
      ],
      en: [
        'XIUYIJING is a digital gene archive for Han embroidery patterns, serving intangible heritage preservation, academic research and public education through digital archiving, multi-dimensional retrieval, online browsing and cultural interpretation.',
        'Based on object collection, literature organization, standardized coding and structured records, the platform organizes subject matter, meaning, color, stitch and carrier information, and presents visual features, craft patterns and cultural context as reference material for preservation, research, learning and communication.',
        'This is a personal research and design practice project. It only supports data organization, digital display, classification retrieval and public cultural communication; it is not qualified for artifact authentication, ownership determination, academic finality or commercial authorization, and its content must not be used as the sole basis for legal, transaction or academic judgment.',
      ],
    },
  },
  {
    number: '二',
    title: { zh: 'HE 编码体系', en: 'HE Coding System' },
    paragraphs: {
      zh: [
        '编码格式：HE - 大类 - 寓意 - 色彩 - 序号（示例：HE-HS-R02）。',
        'HE：Han Embroidery 缩写，本项目汉绣档案统一固定前缀；纹样大类：N 自然纹样 / H 人文民俗纹样 / G 几何抽象纹样；寓意大类：B 吉祥祈福类 / S 精神信仰类 / L 生活志趣类；色彩大类：R 红色系 / G 绿色系 / B 蓝色系 / A 金银色系 / M 多色系；流水序号：同分类组合下唯一两位数字编号，实现一码对应单条纹样档案。',
        'HE 编码仅用于本项目内部的纹样分类、检索与数字档案管理，不构成对传统纹样、历史实物、原始图像或第三方文化资源的权属认定、真伪鉴定或价值评估。',
        '本项目仅就 HE 编码体系的原创文字说明、图形表达、页面呈现及数据库独创性编排主张相应权利，不对抽象分类思想、传统文化元素本身或不属于本项目的既有资料主张排他性所有权。',
      ],
      en: [
        'Code format: HE - category - meaning - color - sequence. Example: HE-HS-R02.',
        'HE is the fixed prefix for Han Embroidery records in this project. Pattern category: N nature / H humanities and folk motifs / G geometric and abstract motifs. Meaning category: B blessing / S spiritual belief / L lifestyle interest. Color category: R red / G green / B blue / A gold and silver / M multicolor. Sequence: a unique two-digit number under the same category combination, mapping one code to one pattern record.',
        'HE codes are only used for internal classification, retrieval and digital archive management. They do not determine ownership, authenticity or value of traditional motifs, historical objects, original images or third-party cultural resources.',
        'The project claims rights only in original wording, graphic expression, page presentation and original database arrangement related to the HE coding system. It does not claim exclusive ownership over abstract classification ideas, traditional cultural elements or existing materials outside the project.',
      ],
    },
  },
  {
    number: '三',
    title: { zh: '数据整理流程', en: 'Data Organization Workflow' },
    paragraphs: {
      zh: [
        '01 观绣・图像标准化处理。采集渠道：公开网络资料、正式出版物、文博机构公开信息、线下实物实拍、田野调查记录。处理流程：图像采集 → 画质校正 → 轮廓提取 → 数字描摹 → 规范化存档。',
        '数字化整理仅为统一展示与检索目的，不改变原始实物、摄影作品、馆藏资料及其他第三方内容的知识产权归属，也不衍生新的著作权授权。',
        '02 解绣・结构化建档编码。处理流程：纹样元素拆分 → 造型与针法提取 → 寓意归类 → HE 编码建档。',
        '从题材、寓意、色彩、工艺、载体多维度建立结构化档案。受地域流派、历史流变、资料完整度及学术观点差异影响，同一纹样可能存在不同释义、工艺判断或分类方式，库内标注仅代表本项目研究视角，不构成唯一标准结论。',
      ],
      en: [
        '01 Observation and image standardization. Collection channels include public online materials, formal publications, public information from cultural and museum institutions, offline object photography and fieldwork records. Workflow: image collection → quality correction → outline extraction → digital tracing → standardized archiving.',
        'Digital organization is only for unified display and retrieval. It does not change the intellectual-property ownership of original objects, photographs, collection materials or other third-party content, and does not create new copyright authorization.',
        '02 Interpretation and structured coding. Workflow: motif element separation → form and stitch extraction → meaning classification → HE code archive creation.',
        'Structured records are built across subject, meaning, color, craft and carrier dimensions. Because of regional schools, historical changes, data completeness and scholarly differences, the same motif may have different interpretations, craft judgments or classifications. Archive labels represent the project research perspective only and do not constitute a single standard conclusion.',
      ],
    },
  },
  {
    number: '四',
    title: { zh: '数据来源与信息说明', en: 'Data Sources and Information Notice' },
    paragraphs: {
      zh: [
        '本平台展示的图像、文字、纹样档案及研究信息，主要来源于公开网络资料、书籍文献、学术论文、博物馆及文化机构公开信息，以及项目执行中的线下拍摄、访谈、观察与整理记录。',
        '平台在资料收集过程中已尽合理勤勉义务标注已知来源，但受原始资料保存状况、年代记载缺失、匿名二次传播、公开信息完整度及不同研究观点等因素限制，部分内容可能存在来源信息不全、表述差异、分类争议或有待进一步考证的情形。',
        '平台所载内容仅供信息展示、研究整理与公共教育参考，不构成对相关纹样年代、作者、权属、工艺流派、收藏来源或历史事实的最终认定。使用者应结合原始文献、实物资料、收藏机构记录及其他权威来源自行甄别核实，不应将本平台内容作为学术、法律或商业决策的唯一依据。',
      ],
      en: [
        'Images, text, pattern records and research information displayed on this platform mainly come from public online materials, books, academic papers, public museum and cultural-institution information, and offline photography, interviews, observation and organization records formed during the project.',
        'The platform has made reasonable efforts to mark known sources during collection. However, because of source preservation, missing date records, anonymous redistribution, incomplete public information and differing research views, some content may have incomplete provenance, wording differences, classification disputes or points requiring further verification.',
        'Platform content is for information display, research organization and public education only. It does not constitute final determination of period, authorship, ownership, craft lineage, collection provenance or historical fact. Users should verify against original documents, physical materials, collection-institution records and other authoritative sources, and should not treat this platform as the sole basis for academic, legal or commercial decisions.',
      ],
    },
  },
  {
    number: '五',
    title: { zh: '第三方资料与权利归属', en: 'Third-Party Materials and Rights' },
    paragraphs: {
      zh: [
        '平台中来源于第三方的图片、摄影作品、扫描件、书籍内容、论文资料、馆藏图文、机构名称、标识及其他受法律保护的内容，其著作权、商标权及其他合法知识产权始终归原作者、出版机构、收藏机构或其他合法权利人所有。',
        `平台对第三方资料进行收集、分类、摘录、标注或数字化展示，不代表相关知识产权已转让给「绣艺境」或${ownerZh}，也不默示授予访问者复制、下载、传播、改编或商业使用的许可。`,
        '对于已进入公共领域、作者身份暂时无法确认或具有传统文化属性的纹样与资料，本项目仅对自身独立完成且具有原创性的文字说明、数字图像、图表表达、界面设计以及内容选择与编排成果主张相应权利，不对传统纹样本身、历史实物、第三方摄影作品或文献原文主张所有权。',
      ],
      en: [
        'Third-party images, photographs, scans, book content, academic materials, collection images and text, institution names, marks and other protected content remain owned by their original authors, publishers, collection institutions or other lawful right holders.',
        `The collection, classification, excerpting, annotation or digital display of third-party materials does not mean the relevant intellectual-property rights have been transferred to XIUYIJING or ${ownerEn}, and does not imply permission for visitors to copy, download, distribute, adapt or commercially use those materials.`,
        'For public-domain materials, temporarily unidentified authorship or traditional-cultural motifs and materials, the project claims rights only in original text, digital images, diagrams, interface design and original selection and arrangement independently completed by the project. It does not claim ownership over traditional motifs themselves, historical objects, third-party photographs or original literature.',
      ],
    },
  },
  {
    number: '六',
    title: { zh: '项目原创成果归属', en: 'Ownership of Original Project Outputs' },
    paragraphs: {
      zh: [`在不侵害第三方合法权利的前提下，以下由${ownerZh}独立完成且具有原创性的内容，相关知识产权依法归其所有：`],
      en: [`Without infringing lawful third-party rights, the following original content independently completed by ${ownerEn} is owned by her according to applicable law:`],
    },
    items: {
      zh: [
        '「绣艺境」网站的视觉设计、界面设计与交互设计；',
        '项目原创文字说明、研究整理成果与图表表达；',
        '项目独立绘制或制作的数字图像、矢量文件与视觉展示成果；',
        '数据库内容具有独创性的选择、分类与整体编排；',
        'HE 编码体系的原创文字说明、图形表达与页面呈现；',
        '项目原创标识、版式、信息架构及其他受法律保护的成果。',
        '严禁使用「本网站所有图片、纹样与文字均归邹牧希所有」等概括性表述。权利归属严格区分为：本项目原创编排、绘图与文字内容归邹牧希（英文名：Zoey）所有；第三方原始素材与既有作品的相关权利归原作者或原权利人所有。',
        '© 2026 邹牧希（英文名：Zoey）. All Rights Reserved.',
      ],
      en: [
        'Visual design, interface design and interaction design of the XIUYIJING website;',
        'Original text, research organization outputs and diagram expression;',
        'Digital images, vector files and visual presentation outputs independently drawn or produced by the project;',
        'Original selection, classification and overall arrangement of database content;',
        'Original wording, graphic expression and page presentation of the HE coding system;',
        'Original marks, layout, information architecture and other protected outputs.',
        'Do not use overbroad statements such as “all images, all motifs and all text on this website belong to 邹牧希.” Rights are strictly separated: original arrangement, drawings and written content of this project belong to 邹牧希 (English name: Zoey); third-party source materials and existing works remain owned by their original authors or right holders.',
        '© 2026 邹牧希 (English name: Zoey). All Rights Reserved.',
      ],
    },
  },
  {
    number: '七',
    title: { zh: '使用范围与限制', en: 'Permitted Scope and Restrictions' },
    paragraphs: {
      zh: [
        '本平台内容主要用于非遗保护、学术研究、个人学习、文化展示与公共教育目的。',
        `访问、浏览或在平台允许范围内查看内容，不代表「绣艺境」、${ownerZh}或任何第三方权利人向使用者转让任何知识产权，也不构成任何明示或默示的商业使用许可。`,
        '除适用法律明确规定的合理使用、法定许可、公共领域使用或其他法定例外情形外，未经相应权利人事先书面授权，不得实施以下行为：复制、下载、转载、传播平台全部或部分内容；改编、二次创作、衍生设计或制作衍生品；商业使用、广告宣传、产品包装或售卖获利；批量抓取、数据爬取、建立数据集或用于 AI 模型训练；删除、篡改来源标注或权利声明；以本平台名义进行授权、合作或其他误导性行为。',
        '仅注明来源、标注「非商业使用」或声明「仅供学习交流」，不当然代表相关使用已取得授权或必然符合法律规定。',
      ],
      en: [
        'Platform content is mainly intended for intangible heritage preservation, academic research, personal study, cultural display and public education.',
        `Accessing, browsing or viewing platform content within the permitted interface does not transfer any intellectual-property rights from XIUYIJING, ${ownerEn} or any third-party right holder, and does not constitute express or implied commercial permission.`,
        'Except for fair use, statutory licenses, public-domain use or other statutory exceptions expressly provided by applicable law, users may not copy, download, repost or distribute all or part of platform content; adapt, create derivatives or products; use it commercially, in advertising, packaging or sales; scrape in bulk, build datasets or use it for AI model training; remove or alter source notes or rights statements; or imply authorization, cooperation or other misleading association with the platform.',
        'Source attribution, a “non-commercial use” label or a “for study and exchange only” statement does not by itself mean authorization has been obtained or that the use is lawful.',
      ],
    },
  },
  {
    number: '八',
    title: { zh: '合理使用与法定例外', en: 'Fair Use and Statutory Exceptions' },
    paragraphs: {
      zh: [
        '本声明无意限制适用法律明确规定的合理使用、法定许可、公共领域使用或其他合法权利。',
        '使用者主张合理使用、教学研究使用、评论引用或其他法定例外时，应自行判断其使用目的、使用数量、引用比例、署名方式，以及相关行为是否影响原作品的正常使用或不合理损害权利人的合法权益。',
        '合理使用及其他法定例外是否成立，应根据具体使用方式、使用范围与适用法律个案判断，本平台不就此提供法律认定或担保。',
      ],
      en: [
        'This notice is not intended to restrict fair use, statutory licenses, public-domain use or other lawful rights expressly provided by applicable law.',
        'Users claiming fair use, educational or research use, quotation for comment or other statutory exceptions should independently assess purpose, amount, quotation ratio, attribution and whether the use affects normal exploitation of the original work or unreasonably harms right holders.',
        'Whether fair use or other statutory exceptions apply depends on the specific use, scope and applicable law. The platform does not provide legal determination or guarantee on this point.',
      ],
    },
  },
  {
    number: '九',
    title: { zh: '境外访问与跨境使用', en: 'Overseas Access and Cross-Border Use' },
    paragraphs: {
      zh: [
        '本平台可能被中国大陆以外的用户访问。境外用户在访问、下载、引用、传播或使用平台内容时，除应遵守中华人民共和国相关法律法规外，还应遵守其所在地、内容使用地及其他可能适用国家或地区的著作权、商标、数据库、传统文化表达及相关知识产权法律。',
        '本页面中的使用声明不替代任何国家或地区的强制性法律规定，也不应被理解为对境外法律后果的统一保证或合规承诺。跨境使用的法律风险与责任由使用者自行承担。',
      ],
      en: [
        'The platform may be accessed outside mainland China. Overseas users should comply with laws of the People’s Republic of China and with copyright, trademark, database, traditional-cultural-expression and related intellectual-property laws of their location, place of use and other applicable jurisdictions.',
        'This notice does not replace mandatory laws in any country or region and should not be understood as a unified guarantee or compliance commitment for overseas legal consequences. Legal risk and responsibility for cross-border use are borne by the user.',
      ],
    },
  },
  {
    number: '十',
    title: { zh: '权利通知与内容处理', en: 'Rights Notices and Content Handling' },
    paragraphs: {
      zh: [
        '如权利人认为平台中的某项图片、文字、文献、标识或其他内容侵犯其著作权、商标权、肖像权、隐私权、名誉权或其他合法权益，可通过平台公布的联系渠道提交书面权利通知。',
        '权利通知应当包含以下内容：1. 权利人或其代理人的真实身份信息与有效联系方式；2. 涉嫌侵权内容的具体页面地址或 HE 编码；3. 权利归属或授权关系的初步证明材料；4. 希望采取的具体处理方式；5. 权利人对通知内容真实准确的书面声明。',
        '平台在收到内容完整且附有初步证明材料的权利通知后，将根据具体情况及时进行核实，并视情况采取补充来源标注、修正信息、限制访问、断开链接或删除相关内容等合理措施。',
      ],
      en: [
        'If a right holder believes that any image, text, document, mark or other content on the platform infringes copyright, trademark rights, portrait rights, privacy, reputation or other lawful rights, the right holder may submit a written rights notice through the published contact channel.',
        'A rights notice should include: 1. true identity information and valid contact details for the right holder or agent; 2. the specific page address or HE code of the allegedly infringing content; 3. preliminary proof of ownership or authorization; 4. the requested handling method; 5. a written statement that the notice is true and accurate.',
        'After receiving a complete notice with preliminary proof, the platform will review the situation in a timely manner and may supplement source notes, correct information, restrict access, disconnect links or remove relevant content as appropriate.',
      ],
    },
  },
  {
    number: '十一',
    title: { zh: '说明修订与联络共建', en: 'Statement Updates and Collaborative Contact' },
    paragraphs: {
      zh: [
        '本页面及平台内关于数据来源、分类方式、HE 编码、纹样释义、版权与使用范围的说明，均基于项目当前掌握的线上线下公开资料及实践记录整理形成。',
        '因公开资料可能存在更新、遗漏、误引、重复传播、版本差异或权利状态变化，平台可根据新增资料、权利人通知、研究进展、页面优化或合规需要，对相关文字、分类、编码、图片展示、来源标注和权利说明进行补充、修订、限制展示或删除，无需事先逐一通知。',
        `在不违反法律法规强制性规定、不排除使用者依法享有的合理使用、法定许可、公共领域使用及其他法定权利的前提下，${ownerZh}对本项目原创说明、数据库编排、HE 编码解释、页面呈现与资料更新规则保留解释、修订与更新权。`,
        '本项目保留解释与更新权，不构成对第三方资料权属的确认，不代表平台可替代司法机关、行政机关、收藏机构、出版机构或其他权威主体作出最终法律、学术或事实认定。',
        `联络与共建：权利维权下架申请、纹样信息补正、汉绣实物素材投稿，海内外各界均可通过邮箱 ${contactEmail} 联系；投稿素材经审核入库后将标注贡献来源，共同完善汉绣数字基因档案。`,
      ],
      en: [
        'Statements on this page and within the platform about data sources, classification, HE codes, motif interpretation, copyright and use are based on the online and offline public materials and practice records currently available to the project.',
        'Because public materials may be updated, incomplete, misquoted, repeatedly circulated, versioned differently or subject to changing rights status, the platform may supplement, revise, restrict display of or remove relevant text, classifications, codes, image displays, source notes and rights statements based on new materials, rights-holder notices, research progress, page optimization or compliance needs, without giving individual prior notice.',
        `To the extent permitted by mandatory laws and without excluding statutory rights such as fair use, statutory licenses and public-domain use, ${ownerEn} reserves the right to interpret, revise and update the project’s original statements, database arrangement, HE code explanations, page presentation and data-update rules.`,
        'This reservation of interpretation and update rights does not confirm ownership of third-party materials and does not mean the platform can replace judicial authorities, administrative authorities, collection institutions, publishers or other authoritative bodies in making final legal, academic or factual determinations.',
        `Contact and collaboration: rights takedown requests, motif information corrections and Han embroidery object material submissions may be sent to ${contactEmail}. Accepted submissions will be credited after review to support the shared improvement of the Han embroidery digital gene archive.`,
      ],
    },
  },
];

function SectionFrame({ section, locale, index }: { section: Section; locale: Locale; index: number }) {
  return (
    <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[150px_minmax(0,1fr)]">
      <div>
        <div className="text-sm font-medium text-fuchsia-200/70">{locale === 'en' ? String(index + 1).padStart(2, '0') : section.number}</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">{section.title[locale]}</h2>
      </div>
      <div className="space-y-5 text-base leading-8 text-white/68">
        {section.paragraphs?.[locale].map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {section.items && (
          <ul className="space-y-3 pl-5 text-white/72">
            {section.items[locale].map((item) => (
              <li key={item} className="list-disc pl-2">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function AboutProject() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language === 'en' ? 'en' : 'zh';

  return (
    <main className="min-h-screen bg-[#050506] px-5 pb-24 pt-28 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-sm text-white/68 hover:border-fuchsia-300/40 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === 'en' ? 'Back to Main Archive' : '返回主库界面'}
        </Link>

        <header className="mt-16 max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">
            {locale === 'en' ? 'About XIUYIJING' : '关于绣艺境'}
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white md:text-7xl">
            {locale === 'en' ? 'About XIUYIJING' : '关于绣艺境'}
          </h1>
          <p className="mt-8 text-lg leading-9 text-white/58">
            {locale === 'en'
              ? 'Project statement, coding system, data organization workflow, source notice and rights statement for the Han embroidery digital gene archive.'
              : '汉绣纹样数字基因库的项目说明、编码体系、数据整理流程、资料来源与权利声明。'}
          </p>
        </header>

        <div className="mt-24 space-y-24">
          {sections.map((section, index) => (
            <SectionFrame key={section.title.en} section={section} locale={locale} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
