import type { IncomingMessage, ServerResponse } from 'http';
import type { PatternQuery } from '../src/server/patternRepository';

export type ApiRequest = IncomingMessage & {
  query?: Record<string, string | string[]>;
  body?: unknown;
};

export type ApiResponse = ServerResponse & {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
};

export function parsePatternQuery(query: ApiRequest['query'] = {}): PatternQuery {
  const getString = (key: string) => {
    const value = query[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const limit = getString('limit');

  return {
    keyword: getString('keyword'),
    patternCategory: getString('patternCategory'),
    meaningCategory: getString('meaningCategory'),
    colorCategory: getString('colorCategory'),
    limit: limit ? Number(limit) || undefined : undefined,
  };
}

export function sendError(res: ApiResponse, error: unknown, fallbackStatus = 500) {
  const statusCode = typeof error === 'object' && error && 'statusCode' in error
    ? Number((error as { statusCode?: number }).statusCode)
    : fallbackStatus;
  const message = error instanceof Error ? error.message : 'Internal server error';
  res.status(statusCode || fallbackStatus).json({ success: false, error: message });
}

export function unsupportedMethod(res: ApiResponse) {
  res.status(405).json({ success: false, error: 'Method not allowed' });
}
