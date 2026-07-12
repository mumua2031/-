import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mockPatterns } from '../data';
import { getPatternClassification } from '../lib/classification';
import { stitchTechniques } from '../lib/stitches';

type FooterModalKey = 'research' | 'sources' | 'coding' | 'copyright';

const zh = {
  about: '\u5173\u4e8e\u7ee3\u827a\u5883',
  researchMethod: '\u7814\u7a76\u65b9\u6cd5',
  dataSources: '\u6570\u636e\u6765\u6e90',
  codingStandards: '\u7f16\u7801\u89c4\u8303',
  copyright: '\u7248\u6743\u4e0e\u4f7f\u7528',
  contactZoey: '\u8054\u7cfb Zoey',
  brand: '\u7ee3\u827a\u5883',
  aboutText: '\u7ee3\u827a\u5883\u4ee5\u6c49\u7ee3\u7eb9\u6837\u7684\u6570\u5b57\u5316\u91c7\u96c6\u3001\u5206\u7c7b\u7f16\u7801\u3001\u6587\u5316\u89e3\u8bfb\u4e0e\u89c6\u89c9\u89e3\u6790\u4e3a\u6838\u5fc3\uff0c\u901a\u8fc7\u6570\u5b57\u6280\u672f\u5448\u73b0\u6c49\u7ee3\u7eb9\u6837\u7684\u7ed3\u6784\u3001\u5de5\u827a\u4e0e\u6587\u5316\u5185\u6db5\uff0c\u4e3a\u975e\u9057\u4fdd\u62a4\u3001\u5b66\u672f\u7814\u7a76\u3001\u6587\u5316\u5c55\u793a\u4e0e\u516c\u5171\u6559\u80b2\u63d0\u4f9b\u53c2\u8003\u3002',
  footerText: '\u5177\u6709\u6c89\u6d78\u5f0f\u89c6\u89c9\u4f53\u9a8c\u7684\u975e\u9057\u6c49\u7ee3\u7eb9\u6837\u6570\u5b57\u57fa\u56e0\u5e93\u3002',
  learnMore: '\u4e86\u89e3\u9879\u76ee',
  archivedPatterns: '\u5df2\u6536\u5f55\u7eb9\u6837',
  patternCategories: '\u7eb9\u6837\u5927\u7c7b',
  meaningCategories: '\u5bd3\u610f\u5206\u7c7b',
  colorCategories: '\u8272\u5f69\u5206\u7c7b',
  stitchTypes: '\u9488\u6cd5\u7c7b\u578b',
  completedAnalyses: '\u5df2\u5b8c\u6210\u89e3\u6790',
  continuing: '\u6301\u7eed\u6536\u5f55',
  organizing: '\u6301\u7eed\u6574\u7406',
  updating: '\u6301\u7eed\u66f4\u65b0',
  close: '\u5173\u95ed',
  closeCopyright: '\u5173\u95ed\u7248\u6743\u8bf4\u660e',
  copyrightLine: '\u00a9 2026 \u90b9\u7267\u5e0c\uff08\u82f1\u6587\u540d\u7b80\u79f0\uff1aZoey\uff09. All Rights Reserved.',
};

const enCopyrightLine = '\u00a9 2026 \u90b9\u7267\u5e0c (English name abbreviation: Zoey). All Rights Reserved.';

const footerLinks = [
  { zh: zh.about, en: 'About XIUYIJING', to: '/about' },
  { zh: zh.researchMethod, en: 'Research Method', modal: 'research' },
  { zh: zh.dataSources, en: 'Data Sources', modal: 'sources' },
  { zh: zh.codingStandards, en: 'Coding Standards', modal: 'coding' },
  { zh: zh.copyright, en: 'Copyright', modal: 'copyright' },
  { zh: zh.contactZoey, en: 'Contact Zoey', href: 'mailto:mumua2031@gmail.com' },
] as const;

const footerModalContent: Record<FooterModalKey, {
  titleZh: string;
  titleEn: string;
  paragraphsZh: string[];
  paragraphsEn: string[];
  itemsZh?: string[];
  itemsEn?: string[];
}> = {
  research: {
    titleZh: '研究方法',
    titleEn: 'Research Method',
    paragraphsZh: [
      '本项目以“观绣”和“解绣”为基本方法：先整理公开图像、文献、线下观察与拍摄资料，再从题材、寓意、色彩、针法、载体和年代线索建立结构化档案。',
      '平台中的分类、释义和编码主要服务于资料整理、检索和展示，不作为文物鉴定、权属鉴定、学术定论或商业授权依据。',
    ],
    paragraphsEn: [
      'The project combines visual observation and structured interpretation: public images, literature, offline observation and field records are organized before subjects, meanings, colors, stitches, carriers and period clues are archived.',
      'The classifications and interpretations support research, retrieval and display only. They are not authentication, ownership confirmation, academic finality or commercial authorization.',
    ],
  },
  sources: {
    titleZh: '数据来源',
    titleEn: 'Data Sources',
    paragraphsZh: [
      '平台资料主要来源于线上与线下公开资源，包括公开网络资料、书籍文献、学术资料、博物馆及文化机构公开信息，以及项目实践中形成的拍摄、访谈、观察和整理记录。',
      '平台会尽量标注已知来源；如部分资料存在来源不完整、名称差异、年代争议或解释分歧，应以原始文献、实物记录和权威机构资料进一步核实。',
    ],
    paragraphsEn: [
      'Materials mainly come from public online and offline resources, including public web information, books, academic references, museum and cultural-institution records, plus project photography, interviews, observation and organization notes.',
      'Known sources are recorded where possible. Incomplete provenance, naming differences, period disputes or interpretation gaps should be checked against original documents, physical records and authoritative institutions.',
    ],
  },
  coding: {
    titleZh: '编码规范',
    titleEn: 'Coding Standards',
    paragraphsZh: [
      'HE 编码是本项目内部使用的汉绣纹样数字档案编码，用于分类检索、数据管理和页面展示。',
      '编码结构示例：HE-NB-R01。HE 为 Han Embroidery 固定前缀；N/H/G 表示纹样大类；B/S/L 表示寓意大类；R/G/B/A/M 表示色彩大类；01 表示同一分类组合下的唯一序号。',
      'HE 编码不代表对传统纹样、历史实物、原始图像、馆藏资料或第三方文化资源权属的认定。',
    ],
    paragraphsEn: [
      'HE codes are internal archive identifiers for Han embroidery pattern records, supporting retrieval, data management and page display.',
      'Example: HE-NB-R01. HE is the fixed Han Embroidery prefix; N/H/G marks the motif category; B/S/L marks the meaning category; R/G/B/A/M marks the color category; 01 is the sequence number under that category combination.',
      'HE codes do not determine ownership of traditional motifs, historical objects, original images, collection records or third-party cultural resources.',
    ],
  },
  copyright: {
    titleZh: '版权与使用',
    titleEn: 'Copyright and Use',
    paragraphsZh: [
      '本平台原创内容及具有独创性的选择、编排与视觉表达，其相关权利归邹牧希（英文名简称：Zoey）所有；第三方资料及既有作品的相关权利归原作者、出版机构、收藏机构或原权利人所有。',
      '访问、浏览或查看平台内容，不代表获得复制、下载、传播、改编、商业使用或用于模型训练、商业数据库、文创产品等用途的许可。',
      '如权利人认为平台内容涉及其合法权益，可通过页面公布的联系方式提交权利通知。平台将在收到有效材料后视情况核实、补充来源、修正信息、限制展示或删除内容。',
    ],
    paragraphsEn: [
      'Original platform content and original selection, arrangement and visual expression belong to \u90b9\u7267\u5e0c (English name abbreviation: Zoey). Third-party materials and existing works remain owned by their original authors, publishers, collection institutions or right holders.',
      'Accessing or viewing the platform does not grant permission to copy, download, distribute, adapt, commercially use, train models with, build commercial databases from or apply the materials to products.',
      'Right holders may submit notices through the published contact channel. The platform may verify, supplement sources, correct information, restrict display or remove content after receiving valid materials.',
    ],
  },
};

function countUniqueClassifications(type: 'pattern' | 'meaning' | 'color') {
  const values = new Set<string>();
  mockPatterns.forEach((pattern) => {
    const classification = getPatternClassification(pattern);
    const code = type === 'pattern'
      ? classification.patternCategory
      : type === 'meaning'
        ? classification.meaningCategory
        : classification.colorCategory;
    if (code) values.add(code);
  });
  return values.size;
}

function countTechniqueTypes() {
  return stitchTechniques.length;
}

function formatOverviewValue(value: number | null, zhFallback: string, enFallback: string, isEnglish: boolean) {
  if (value && value > 0) return String(value);
  return isEnglish ? enFallback : zhFallback;
}

function getOverviewItems(isEnglish: boolean) {
  return [
    { zh: zh.archivedPatterns, en: 'Archived Patterns', value: formatOverviewValue(mockPatterns.length, zh.continuing, 'Continuing', isEnglish) },
    { zh: zh.patternCategories, en: 'Pattern Categories', value: formatOverviewValue(countUniqueClassifications('pattern'), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.meaningCategories, en: 'Meaning Categories', value: formatOverviewValue(countUniqueClassifications('meaning'), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.colorCategories, en: 'Color Categories', value: formatOverviewValue(countUniqueClassifications('color'), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.stitchTypes, en: 'Stitch Types', value: formatOverviewValue(countTechniqueTypes(), zh.organizing, 'Organizing', isEnglish) },
    { zh: zh.completedAnalyses, en: 'Completed Analyses', value: isEnglish ? 'Updating' : zh.updating },
  ];
}

export function Footer() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [activeModal, setActiveModal] = useState<FooterModalKey | null>(null);
  const overviewItems = getOverviewItems(isEnglish);
  const modalContent = activeModal ? footerModalContent[activeModal] : null;

  return (
    <>
      <section id="about-xiuyijing" className="border-t border-white/10 bg-[radial-gradient(circle_at_12%_12%,rgba(217,70,239,0.12),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(236,72,153,0.09),transparent_34%),#050506] px-5 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'About XIUYIJING' : zh.about}</p>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{isEnglish ? 'About XIUYIJING' : zh.about}</h2>
              <p className="mt-6 max-w-4xl text-base leading-8 text-white/66">
                {isEnglish
                  ? 'XIUYIJING focuses on the digital collection, classification, coding and visual analysis of Han embroidery patterns, supporting heritage preservation, academic research, cultural display and public education.'
                  : zh.aboutText}
              </p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                to="/about"
                className="w-max rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)] transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
              >
                {isEnglish ? 'Learn More' : zh.learnMore}
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {overviewItems.map((item, index) => (
              <div
                key={item.en}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-6 opacity-0 animate-[gene-origin-card-in_420ms_ease_both] transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/10"
                style={{ animationDelay: String(index * 70) + 'ms' }}
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/45 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="font-mono text-4xl text-white tabular-nums md:text-5xl">{item.value}</div>
                <div className="mt-5 text-sm text-white/78">{isEnglish ? item.en : item.zh}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="hanxiu-site-footer" className="border-t border-white/10 bg-[radial-gradient(circle_at_8%_18%,rgba(217,70,239,0.1),transparent_28%),radial-gradient(circle_at_92%_20%,rgba(236,72,153,0.1),transparent_30%),#000] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.35fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{isEnglish ? 'XIUYIJING' : zh.brand}</p>
            <h2 className="mt-3 text-2xl font-semibold">{isEnglish ? 'XIUYIJING' : zh.brand}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
              {isEnglish
                ? 'An immersive digital gene archive for Han embroidery patterns.'
                : zh.footerText}
            </p>
          </div>

          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Footer navigation">
            {footerLinks.map((link) => {
              const className = 'group rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-left transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/10';
              const content = <span className="block text-sm text-white/78 group-hover:text-white">{isEnglish ? link.en : link.zh}</span>;

              if ('modal' in link) {
                return (
                  <button key={link.en} type="button" className={className} onClick={() => setActiveModal(link.modal)}>
                    {content}
                  </button>
                );
              }

              if ('href' in link) {
                return (
                  <a key={link.en} className={className} href={link.href}>
                    {content}
                  </a>
                );
              }

              return (
                <Link key={link.en} className={className} to={link.to}>
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
          <p>{isEnglish ? enCopyrightLine : zh.copyrightLine}</p>
          <a className="transition-colors hover:text-fuchsia-200" href="mailto:mumua2031@gmail.com">
            mumua2031@gmail.com
          </a>
        </div>
      </footer>

      {modalContent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
          <button
            type="button"
            className="absolute inset-0 bg-black/72 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
            aria-label={isEnglish ? 'Close notice' : zh.closeCopyright}
          />
          <section className="relative z-10 max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-fuchsia-200/18 bg-[#08090a] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-fuchsia-200/55">{isEnglish ? modalContent.titleEn : modalContent.titleZh}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{isEnglish ? modalContent.titleEn : modalContent.titleZh}</h3>
            <div className="mt-5 space-y-4 text-sm leading-8 text-white/68">
              {(isEnglish ? modalContent.paragraphsEn : modalContent.paragraphsZh).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {(isEnglish ? modalContent.itemsEn : modalContent.itemsZh)?.length ? (
                <ol className="space-y-2 pl-5 text-white/72">
                  {(isEnglish ? modalContent.itemsEn : modalContent.itemsZh)?.map((item) => (
                    <li key={item} className="list-decimal pl-2">{item}</li>
                  ))}
                </ol>
              ) : null}
            </div>
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                className="rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
                onClick={() => setActiveModal(null)}
              >
                {isEnglish ? 'Close' : zh.close}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
