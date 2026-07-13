import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockPatterns } from '../data';
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

  if (!response.ok) {
    throw new Error(`Pattern API responded with ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.success || !Array.isArray(payload.data)) {
    throw new Error('Pattern API returned an invalid response.');
  }

  return payload.data as PatternGene[];
}

export function PatternDataProvider({ children }: { children: ReactNode }) {
  const [patterns, setPatterns] = useState<PatternGene[]>(mockPatterns);
  const [source, setSource] = useState<PatternDataSource>('local');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const remotePatterns = await fetchPatternsFromApi();
      if (remotePatterns.length > 0) {
        setPatterns(remotePatterns);
        setSource('api');
      } else {
        setPatterns(mockPatterns);
        setSource('local');
      }
    } catch (nextError) {
      setPatterns(mockPatterns);
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
