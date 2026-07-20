import { timingSafeEqual } from 'crypto';

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

  const tokenBuffer = Buffer.from(token || '');
  const configuredTokenBuffer = Buffer.from(configuredToken);
  const isTokenValid = tokenBuffer.length === configuredTokenBuffer.length && timingSafeEqual(tokenBuffer, configuredTokenBuffer);

  if (!isTokenValid) {
    const error = new Error('Unauthorized');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
}
