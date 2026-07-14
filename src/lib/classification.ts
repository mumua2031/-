import type { PatternGene } from '../types';

export type PatternCategoryCode = 'N' | 'H' | 'G';
export type MeaningCategoryCode = 'B' | 'S' | 'L';
export type ColorCategoryCode = 'R' | 'G' | 'B' | 'A' | 'M';

export type HECodeParts = {
  prefix: 'HE' | '';
  patternCategory: PatternCategoryCode | '';
  meaningCategory: MeaningCategoryCode | '';
  colorCategory: ColorCategoryCode | '';
  sequence: number | null;
  isValid: boolean;
};

export type PatternClassification = {
  patternCategory: PatternCategoryCode | '';
  meaningCategory: MeaningCategoryCode | '';
  colorCategory: ColorCategoryCode | '';
  sequence: number | null;
  isValidHECode: boolean;
};

type CategoryOption<TCode extends string> = {
  code: TCode;
  zh: string;
  en: string;
};

export const patternCategories: CategoryOption<PatternCategoryCode>[] = [
  { code: 'N', zh: '\u81ea\u7136\u7eb9\u6837', en: 'Nature Pattern' },
  { code: 'H', zh: '\u4eba\u6587 / \u6c11\u4fd7\u7eb9\u6837', en: 'Humanities Pattern' },
  { code: 'G', zh: '\u51e0\u4f55 / \u62bd\u8c61\u7eb9\u6837', en: 'Geometry Pattern' },
];

export const meaningCategories: CategoryOption<MeaningCategoryCode>[] = [
  { code: 'B', zh: '\u5409\u7965\u7948\u798f\u7c7b', en: 'Blessing' },
  { code: 'S', zh: '\u7cbe\u795e\u4fe1\u4ef0\u7c7b', en: 'Spiritual Belief' },
  { code: 'L', zh: '\u751f\u6d3b\u5fd7\u8da3\u7c7b', en: 'Lifestyle' },
];

export const colorCategories: CategoryOption<ColorCategoryCode>[] = [
  { code: 'R', zh: '\u7ea2\u8272\u7cfb', en: 'Red' },
  { code: 'G', zh: '\u7eff\u8272\u7cfb', en: 'Green' },
  { code: 'B', zh: '\u84dd\u8272\u7cfb', en: 'Blue' },
  { code: 'A', zh: '\u91d1\u94f6\u8272\u7cfb', en: 'Gold and Silver' },
  { code: 'M', zh: '\u591a\u8272\u7cfb', en: 'Multicolor' },
];

export const archiveTopFilters = [
  { key: 'all', zh: '\u5168\u90e8', en: 'All' },
  { key: 'nature', zh: '\u81ea\u7136\u5927\u7c7b', en: 'Nature', categoryType: 'pattern', code: 'N' },
  { key: 'humanities', zh: '\u4eba\u6587\u5927\u7c7b', en: 'Humanities', categoryType: 'pattern', code: 'H' },
  { key: 'geometry', zh: '\u51e0\u4f55\u5927\u7c7b', en: 'Geometry', categoryType: 'pattern', code: 'G' },
  { key: 'meaning', zh: '\u5bd3\u610f\u5927\u7c7b', en: 'Meaning', categoryType: 'meaning' },
  { key: 'color', zh: '\u8272\u5f69\u5927\u7c7b', en: 'Color', categoryType: 'color' },
] as const;

const heCodePattern = /^HE-([NHG])-([BSL])-([RGBAM])(\d{2,})$/;
const legacyHeCodePattern = /^HE-([NHG])([BSL])-([RGBAM])(\d{2,})$/;
const classificationCache = new WeakMap<PatternGene, PatternClassification>();

function cleanCode(code: string) {
  return code.trim().replace(/\s+/g, '').toUpperCase();
}

function isPatternCategory(code: string): code is PatternCategoryCode {
  return patternCategories.some((category) => category.code === code);
}

function isMeaningCategory(code: string): code is MeaningCategoryCode {
  return meaningCategories.some((category) => category.code === code);
}

function isColorCategory(code: string): code is ColorCategoryCode {
  return colorCategories.some((category) => category.code === code);
}

export function formatSequence(sequence: string | number | null | undefined) {
  if (sequence === null || sequence === undefined || sequence === '') return '';
  const numericSequence = Number.parseInt(String(sequence).trim(), 10);
  if (!Number.isFinite(numericSequence) || numericSequence < 0) return '';
  return String(numericSequence).padStart(2, '0');
}

export function validateHECode(code: string) {
  return heCodePattern.test(cleanCode(code));
}

export function parseHECode(code: string): HECodeParts {
  const normalizedCode = cleanCode(code);
  const match = normalizedCode.match(heCodePattern);

  if (!match) {
    return {
      prefix: normalizedCode.startsWith('HE-') ? 'HE' : '',
      patternCategory: '',
      meaningCategory: '',
      colorCategory: '',
      sequence: null,
      isValid: false,
    };
  }

  return {
    prefix: 'HE',
    patternCategory: match[1] as PatternCategoryCode,
    meaningCategory: match[2] as MeaningCategoryCode,
    colorCategory: match[3] as ColorCategoryCode,
    sequence: Number.parseInt(match[4], 10),
    isValid: true,
  };
}

function parseLegacyHECode(code: string): PatternClassification {
  const match = cleanCode(code).match(legacyHeCodePattern);

  if (!match) {
    return {
      patternCategory: '',
      meaningCategory: '',
      colorCategory: '',
      sequence: null,
      isValidHECode: false,
    };
  }

  return {
    patternCategory: match[1] as PatternCategoryCode,
    meaningCategory: match[2] as MeaningCategoryCode,
    colorCategory: match[3] as ColorCategoryCode,
    sequence: Number.parseInt(match[4], 10),
    isValidHECode: false,
  };
}

export function buildHECode(data: {
  patternCategory?: string;
  meaningCategory?: string;
  colorCategory?: string;
  sequence?: string | number | null;
}) {
  const patternCategory = data.patternCategory?.trim().toUpperCase() || '';
  const meaningCategory = data.meaningCategory?.trim().toUpperCase() || '';
  const colorCategory = data.colorCategory?.trim().toUpperCase() || '';
  const sequence = formatSequence(data.sequence);

  if (
    !isPatternCategory(patternCategory) ||
    !isMeaningCategory(meaningCategory) ||
    !isColorCategory(colorCategory) ||
    !sequence
  ) {
    return '';
  }

  return `HE-${patternCategory}-${meaningCategory}-${colorCategory}${sequence}`;
}

export function getPatternClassification(pattern: PatternGene): PatternClassification {
  const cachedClassification = classificationCache.get(pattern);
  if (cachedClassification) return cachedClassification;

  let classification: PatternClassification;

  if (
    pattern.patternCategory &&
    pattern.meaningCategory &&
    pattern.colorCategory &&
    pattern.sequence !== undefined
  ) {
    classification = {
      patternCategory: isPatternCategory(pattern.patternCategory) ? pattern.patternCategory : '',
      meaningCategory: isMeaningCategory(pattern.meaningCategory) ? pattern.meaningCategory : '',
      colorCategory: isColorCategory(pattern.colorCategory) ? pattern.colorCategory : '',
      sequence: Number.isFinite(Number(pattern.sequence)) ? Number(pattern.sequence) : null,
      isValidHECode: validateHECode(pattern.heCode),
    };
  } else {
    const parsed = parseHECode(pattern.heCode);

    classification = parsed.isValid
      ? {
          patternCategory: parsed.patternCategory,
          meaningCategory: parsed.meaningCategory,
          colorCategory: parsed.colorCategory,
          sequence: parsed.sequence,
          isValidHECode: true,
        }
      : parseLegacyHECode(pattern.heCode);
  }

  classificationCache.set(pattern, classification);
  return classification;
}

export function getCategoryLabel(
  categoryType: 'pattern' | 'meaning' | 'color',
  code: string,
  language: 'zh' | 'en' = 'zh',
) {
  const source =
    categoryType === 'pattern'
      ? patternCategories
      : categoryType === 'meaning'
        ? meaningCategories
        : colorCategories;
  const option = source.find((category) => category.code === code);
  return option ? option[language] : '';
}

export function matchesArchiveTopFilter(pattern: PatternGene, filterKey: string) {
  const classification = getPatternClassification(pattern);

  switch (filterKey) {
    case 'all':
      return true;
    case 'nature':
      return classification.patternCategory === 'N';
    case 'humanities':
      return classification.patternCategory === 'H';
    case 'geometry':
      return classification.patternCategory === 'G';
    case 'meaning':
      return Boolean(classification.meaningCategory);
    case 'color':
      return Boolean(classification.colorCategory);
    default:
      return true;
  }
}

export function hasDuplicateHECodes(patterns: PatternGene[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  patterns.forEach((pattern) => {
    const code = cleanCode(pattern.heCode);
    if (seen.has(code)) duplicates.add(code);
    seen.add(code);
  });

  return [...duplicates];
}

export function hasDuplicateCategorySequences(patterns: PatternGene[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  patterns.forEach((pattern) => {
    const classification = getPatternClassification(pattern);
    if (
      !classification.patternCategory ||
      !classification.meaningCategory ||
      !classification.colorCategory ||
      classification.sequence === null
    ) {
      return;
    }

    const key = `${classification.patternCategory}${classification.meaningCategory}-${classification.colorCategory}${formatSequence(classification.sequence)}`;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  });

  return [...duplicates];
}
