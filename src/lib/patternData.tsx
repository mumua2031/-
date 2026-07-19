import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockPatterns } from '../data';
import { readApiPayload } from './apiResponse';
import {
  getCategoryLabel,
  normalizePatternClassificationText,
  parseHECode,
  resolvePatternHECode,
} from './classification';
import { normalizeEraForArchive } from './patternArchiveForm';
import type { PatternGene } from '../types';

type PatternDataSource = 'api' | 'local';

type PatternDataContextValue = {
  patterns: PatternGene[];
  isLoading: boolean;
  source: PatternDataSource;
  error: string | null;
  refresh: () => Promise<void>;
};

const PatternDataContext = createContext<PatternDataContextValue | null>(null);

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
}

async function fetchPatternsFromApi() {
  const response = await fetch(`${getApiBaseUrl()}/api/patterns`, {
    headers: { Accept: 'application/json' },
  });

  const payload = await readApiPayload<{ data?: PatternGene[] }>(response, '读取纹样数据');
  if (!Array.isArray(payload.data)) {
    throw new Error('读取纹样数据失败：接口返回格式不正确。');
  }

  return payload.data as PatternGene[];
}

function normalizePatterns(patterns: PatternGene[]) {
  return patterns.map((pattern) => ({
    ...normalizePatternIdentity(pattern),
    era: normalizeEraForArchive(pattern.era) || pattern.era,
  }));
}

function normalizePatternIdentity(pattern: PatternGene): PatternGene {
  const storedCode = pattern.heCode;
  const canonicalCode = resolvePatternHECode(storedCode, pattern.previousHeCode);
  const parsedCode = parseHECode(canonicalCode);

  if (!parsedCode.isValid) return pattern;

  return normalizePatternClassificationText({
    ...pattern,
    id: canonicalCode,
    heCode: canonicalCode,
    ...(storedCode !== canonicalCode ? { previousHeCode: pattern.previousHeCode || storedCode } : {}),
    patternCategory: parsedCode.patternCategory,
    meaningCategory: parsedCode.meaningCategory,
    colorCategory: parsedCode.colorCategory,
    sequence: parsedCode.sequence ?? pattern.sequence,
    categoryLabels: [
      { 'zh-CN': `${getCategoryLabel('pattern', parsedCode.patternCategory, 'zh')} (${parsedCode.patternCategory})`, en: `${getCategoryLabel('pattern', parsedCode.patternCategory, 'en')} (${parsedCode.patternCategory})` },
      { 'zh-CN': `${getCategoryLabel('meaning', parsedCode.meaningCategory, 'zh')} (${parsedCode.meaningCategory})`, en: `${getCategoryLabel('meaning', parsedCode.meaningCategory, 'en')} (${parsedCode.meaningCategory})` },
      { 'zh-CN': `${getCategoryLabel('color', parsedCode.colorCategory, 'zh')} (${parsedCode.colorCategory})`, en: `${getCategoryLabel('color', parsedCode.colorCategory, 'en')} (${parsedCode.colorCategory})` },
    ],
  });
}

const normalizedMockPatterns = normalizePatterns(mockPatterns);

export function PatternDataProvider({ children }: { children: ReactNode }) {
  const [patterns, setPatterns] = useState<PatternGene[]>(normalizedMockPatterns);
  const [source, setSource] = useState<PatternDataSource>('local');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const remotePatterns = await fetchPatternsFromApi();
      if (remotePatterns.length > 0) {
        setPatterns(normalizePatterns(remotePatterns));
        setSource('api');
      } else {
        setPatterns(normalizedMockPatterns);
        setSource('local');
      }
    } catch (nextError) {
      setPatterns(normalizedMockPatterns);
      setSource('local');
      setError(nextError instanceof Error ? nextError.message : 'Pattern API is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(
    () => ({ patterns, isLoading, source, error, refresh }),
    [error, isLoading, patterns, source],
  );

  return <PatternDataContext.Provider value={value}>{children}</PatternDataContext.Provider>;
}

export function usePatternData() {
  const value = useContext(PatternDataContext);
  if (!value) throw new Error('usePatternData must be used inside PatternDataProvider.');
  return value;
}
