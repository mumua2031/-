import type { IncomingMessage, ServerResponse } from 'http';

type PatternQuery = {
  keyword?: string;
  patternCategory?: string;
  meaningCategory?: string;
  colorCategory?: string;
  limit?: number;
};

export type ApiRequest = IncomingMessage & {
  query?: Record<string, string | string[]>;
  body?: unknown;
};

export type ApiResponse = ServerResponse & {
  status?: (statusCode: number) => ApiResponse;
  json?: (body: unknown) => void;
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
  const rawMessage = error instanceof Error ? error.message : 'Internal server error';
  const message = rawMessage === 'Unauthorized' ? '管理员接口令牌不正确，请检查 ADMIN_API_TOKEN。' : rawMessage;
  const safeStatus = statusCode >= 400 && statusCode < 600 ? statusCode : fallbackStatus;
  sendJson(res, safeStatus, { success: false, error: message });
}

export function unsupportedMethod(res: ApiResponse) {
  sendJson(res, 405, { success: false, error: '当前接口不支持这个操作。' });
}

export function sendJson(res: ApiResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export function assertAdminToken(headers: Record<string, string | string[] | undefined>) {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) {
    const error = new Error('管理员写入尚未配置，请先设置 ADMIN_API_TOKEN。');
    Object.assign(error, { statusCode: 503 });
    throw error;
  }

  const authHeader = Array.isArray(headers.authorization) ? headers.authorization[0] : headers.authorization;
  const tokenHeader = Array.isArray(headers['x-admin-token']) ? headers['x-admin-token'][0] : headers['x-admin-token'];
  const token = authHeader?.replace(/^Bearer\s+/i, '') || tokenHeader;

  if (token !== configuredToken) {
    const error = new Error('Unauthorized');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
}
