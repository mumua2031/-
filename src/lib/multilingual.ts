import type { MultilingualString, PatternGene } from '../types';
import { translateZhToEn } from './localTranslation';

const cjkPattern = /[\u3400-\u9fff\uf900-\ufaff]/;

export function containsCJK(value: string | undefined | null) {
  return Boolean(value && cjkPattern.test(value));
}

export function getLocalizedText(
  field: MultilingualString | undefined,
  language: keyof MultilingualString,
  fallback: string,
) {
  if (!field) return fallback;

  if (language === 'en') {
    const englishValue = field.en?.trim();
    if (englishValue && !containsCJK(englishValue)) return englishValue;
    const sourceValue = field['zh-CN']?.trim() || englishValue;
    return sourceValue ? translateZhToEn(sourceValue, fallback) : fallback;
  }

  return field[language] || field['zh-CN'] || field.en || fallback;
}

export function getLocalizedPlainText(value: string | undefined, language: keyof MultilingualString, fallback: string) {
  const cleanValue = value?.trim();
  if (!cleanValue) return fallback;
  if (language === 'en' && containsCJK(cleanValue)) return translateZhToEn(cleanValue, fallback);
  return cleanValue;
}

export function getLocalizedPatternName(pattern: PatternGene, language: keyof MultilingualString) {
  return getLocalizedText(pattern.name, language, pattern.heCode);
}
