import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mockPatterns } from '../data';
import { getPatternClassification } from '../lib/classification';
import { stitchTechniques } from '../lib/stitches';

type FooterModalKey = 'research' | 'sources' | 'coding' | 'copyright';
type Locale = 'zh' | 'en';

const contactEmail = 'mumua2031@gmail.com';
const ownerZh = '邹牧希（英文名：Zoey）';
const ownerEn = '邹牧希 (English name: Zoey)';

const copy = {
  zh: {
    about: '关于绣艺境',
    research: '研究方法',
    sources: '数据来源',
    coding: '编码规范',
    copyright: '版权与使用',
    contact: '维权投稿',
    brand: '绣艺境',
    intro: '汉绣纹样数字基因库，面向非遗保护、学术研究、个人学习、文化展示与公共教育。',
    learnMore: '了解项目',
    archivedPatterns: '已收录纹样',
    patternCategories: '纹样大类',
    meaningCategories: '寓意分类',
    colorCategories: '色彩分类',
    stitchTypes: '针法类型',
    completedAnalyses: '已完成解析',
    continuing: '持续收录',
    organizing: '持续整理',
    updating: '持续更新',
    close: '关闭',
    closeNotice: '关闭说明',
    copyrightLine: '©2026 邹牧希（Zoey）原创内容保留权利，第三方素材权属归原权利人',
  },
  en: {
    about: 'About XIUYIJING',
    research: 'Research Method',
    sources: 'Data Sources',
    coding: 'Coding Standards',
    copyright: 'Copyright and Use',
    contact: 'Rights / Submissions',
    brand: 'XIUYIJING',
    intro: 'A digital gene archive for Han embroidery patterns, serving heritage preservation, academic research, personal study, cultural display and public education.',
    learnMore: 'Learn More',
    archivedPatterns: 'Archived Patterns',
    patternCategories: 'Pattern Categories',
    meaningCategories: 'Meaning Categories',
    colorCategories: 'Color Categories',
    stitchTypes: 'Stitch Types',
    completedAnalyses: 'Completed Analyses',
    continuing: 'Continuing',
    organizing: 'Organizing',
    updating: 'Updating',
    close: 'Close',
    closeNotice: 'Close notice',
    copyrightLine: '©2026 邹牧希 (Zoey). Original content rights reserved; third-party materials remain with their right holders.',
  },
};

const footerLinks = [
  { key: 'about', to: '/about' },
  { key: 'research', modal: 'research' },
  { key: 'sources', modal: 'sources' },
  { key: 'coding', modal: 'coding' },
  { key: 'copyright', modal: 'copyright' },
  { key: 'contact', href: `mailto:${contactEmail}` },
] as const;

const modalContent: Record<FooterModalKey, {
  title: Record<Locale, string>;
  paragraphs: Record<Locale, string[]>;
}> = {
  research: {
    title: { zh: '研究方法', en: 'Research Method' },
    paragraphs: {
      zh: [
        '本项目以「观绣」和「解绣」为基本方法：先整理公开网络资料、正式出版物、文博机构公开信息、线下实物实拍与田野调查记录，再从题材、寓意、色彩、针法、载体等维度建立结构化档案。',
        '库内分类、释义和 HE 编码主要服务于资料整理、检索与展示，仅代表本项目当前研究视角，不作为文物鉴定、权属认定、学术定论或商业授权依据。',
      ],
      en: [
        'The project uses observation and interpretation as its core method: public online materials, formal publications, public information from cultural institutions, offline object photography and fieldwork records are organized before structured records are built across subject, meaning, color, stitch and carrier dimensions.',
        'Classifications, interpretations and HE codes mainly support organization, retrieval and display. They represent the project’s current research perspective only and are not artifact authentication, ownership determination, academic finality or commercial authorization.',
      ],
    },
  },
  sources: {
    title: { zh: '数据来源', en: 'Data Sources' },
    paragraphs: {
      zh: [
        '平台资料主要来源于线上线下公开资源，包括公开网络资料、书籍文献、学术论文、博物馆及文化机构公开信息，以及项目执行中的线下拍摄、访谈、观察与整理记录。',
        '平台已尽合理勤勉义务标注已知来源。因公开资料可能存在遗漏、误引、版本差异或权利状态变化，部分内容仍可能有待进一步考证，使用者应结合原始文献、实物资料和权威机构记录自行核实。',
      ],
      en: [
        'Materials mainly come from public online and offline resources, including public web information, books, academic papers, museum and cultural-institution records, plus project photography, interviews, observation and organization notes.',
        'Known sources are marked with reasonable diligence. Because public materials may be incomplete, misquoted, versioned differently or subject to changing rights status, some content may still require further verification against original documents, physical materials and authoritative institutional records.',
      ],
    },
  },
  coding: {
    title: { zh: '编码规范', en: 'Coding Standards' },
    paragraphs: {
      zh: [
        'HE 编码是本项目内部使用的汉绣纹样数字档案编码，用于分类检索、数据管理和页面展示。编码格式为 HE - 大类 - 寓意 - 色彩 - 序号，示例：HE-HS-R02。',
        'N/H/G 对应自然纹样、人文民俗纹样、几何抽象纹样；B/S/L 对应吉祥祈福类、精神信仰类、生活志趣类；R/G/B/A/M 对应红色系、绿色系、蓝色系、金银色系、多色系。',
        'HE 编码不构成对传统纹样、历史实物、原始图像、馆藏资料或第三方文化资源的权属认定、真伪鉴定或价值评估。',
      ],
      en: [
        'HE codes are internal archive identifiers for Han embroidery pattern records, supporting classification retrieval, data management and page display. Format: HE - category - meaning - color - sequence. Example: HE-HS-R02.',
        'N/H/G indicate nature, humanities and folk, or geometric and abstract motifs. B/S/L indicate blessing, spiritual belief or lifestyle interest. R/G/B/A/M indicate red, green, blue, gold and silver, or multicolor groups.',
        'HE codes do not determine ownership, authenticity or value of traditional motifs, historical objects, original images, collection records or third-party cultural resources.',
      ],
    },
  },
  copyright: {
    title: { zh: '版权与使用', en: 'Copyright and Use' },
    paragraphs: {
      zh: [
        `本平台原创内容及具有独创性的选择、编排与视觉表达，其相关权利归${ownerZh}所有；第三方资料及既有作品的相关权利归原作者、出版机构、收藏机构或原权利人所有。`,
        '访问、浏览或查看平台内容，不代表获得复制、下载、传播、改编、商业使用、模型训练、商业数据库建设或文创产品开发等许可。',
        `权利维权下架申请、纹样信息补正、汉绣实物素材投稿，可通过邮箱 ${contactEmail} 联系。平台将在收到有效材料后视情况核实、补充来源、修正信息、限制展示或删除内容。`,
      ],
      en: [
        `Original platform content and original selection, arrangement and visual expression belong to ${ownerEn}. Third-party materials and existing works remain owned by their original authors, publishers, collection institutions or right holders.`,
        'Accessing, browsing or viewing the platform does not grant permission to copy, download, distribute, adapt, commercially use, train models with, build commercial databases from or develop products from the content.',
        `Rights takedown requests, motif information corrections and Han embroidery object material submissions may be sent to ${contactEmail}. The platform may verify, supplement sources, correct information, restrict display or remove content after receiving valid materials.`,
      ],
    },
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

function formatOverviewValue(value: number | null, locale: Locale) {
  if (value && value > 0) return String(value);
  return copy[locale].organizing;
}

function getOverviewItems(locale: Locale) {
  return [
    { label: copy[locale].archivedPatterns, value: formatOverviewValue(mockPatterns.length, locale) },
    { label: copy[locale].patternCategories, value: formatOverviewValue(countUniqueClassifications('pattern'), locale) },
    { label: copy[locale].meaningCategories, value: formatOverviewValue(countUniqueClassifications('meaning'), locale) },
    { label: copy[locale].colorCategories, value: formatOverviewValue(countUniqueClassifications('color'), locale) },
    { label: copy[locale].stitchTypes, value: formatOverviewValue(countTechniqueTypes(), locale) },
    { label: copy[locale].completedAnalyses, value: copy[locale].updating },
  ];
}

export function Footer() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language === 'en' ? 'en' : 'zh';
  const [activeModal, setActiveModal] = useState<FooterModalKey | null>(null);
  const overviewItems = getOverviewItems(locale);
  const activeContent = activeModal ? modalContent[activeModal] : null;

  return (
    <>
      <section id="about-xiuyijing" className="border-t border-white/10 bg-[radial-gradient(circle_at_12%_12%,rgba(217,70,239,0.12),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(236,72,153,0.09),transparent_34%),#050506] px-5 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{copy[locale].about}</p>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{copy[locale].about}</h2>
              <p className="mt-6 max-w-4xl text-base leading-8 text-white/66">{copy[locale].intro}</p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                to="/about"
                className="w-max rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)] transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
              >
                {copy[locale].learnMore}
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {overviewItems.map((item, index) => (
              <div
                key={item.label}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-6 opacity-0 animate-[gene-origin-card-in_420ms_ease_both] transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/10"
                style={{ animationDelay: String(index * 70) + 'ms' }}
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/45 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="font-mono text-4xl text-white tabular-nums md:text-5xl">{item.value}</div>
                <div className="mt-5 text-sm text-white/78">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="hanxiu-site-footer" className="border-t border-white/10 bg-[radial-gradient(circle_at_8%_18%,rgba(217,70,239,0.1),transparent_28%),radial-gradient(circle_at_92%_20%,rgba(236,72,153,0.1),transparent_30%),#000] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.35fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-fuchsia-200/55">{copy[locale].brand}</p>
            <h2 className="mt-3 text-2xl font-semibold">{copy[locale].brand}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">{copy[locale].intro}</p>
          </div>

          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Footer navigation">
            {footerLinks.map((link) => {
              const className = 'group rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-left transition-colors hover:border-fuchsia-300/35 hover:bg-fuchsia-950/10';
              const content = <span className="block text-sm text-white/78 group-hover:text-white">{copy[locale][link.key]}</span>;

              if ('modal' in link) {
                return (
                  <button key={link.key} type="button" className={className} onClick={() => setActiveModal(link.modal)}>
                    {content}
                  </button>
                );
              }

              if ('href' in link) {
                return (
                  <a key={link.key} className={className} href={link.href}>
                    {content}
                  </a>
                );
              }

              return (
                <Link key={link.key} className={className} to={link.to}>
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
          <p>{copy[locale].copyrightLine}</p>
          <a className="transition-colors hover:text-fuchsia-200" href={`mailto:${contactEmail}`}>
            {copy[locale].contact}
          </a>
        </div>
      </footer>

      {activeContent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
          <button
            type="button"
            className="absolute inset-0 bg-black/72 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
            aria-label={copy[locale].closeNotice}
          />
          <section className="relative z-10 max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-fuchsia-200/18 bg-[#08090a] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-fuchsia-200/55">{activeContent.title[locale]}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{activeContent.title[locale]}</h3>
            <div className="mt-5 space-y-4 text-sm leading-8 text-white/68">
              {activeContent.paragraphs[locale].map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                className="rounded-full border border-fuchsia-300/35 bg-fuchsia-950/20 px-5 py-2 text-sm text-fuchsia-100 transition-colors hover:border-fuchsia-200/70 hover:bg-fuchsia-800/25"
                onClick={() => setActiveModal(null)}
              >
                {copy[locale].close}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
