import type { ApiRequest, ApiResponse } from './_utils';
import { parsePatternQuery, sendError, sendJson, unsupportedMethod } from './_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return unsupportedMethod(res);
  try {
    const { listPatterns } = await import('../src/server/patternRepository');
    const { data, source } = await listPatterns(parsePatternQuery(req.query));
    return sendJson(res, 200, { success: true, data, meta: { count: data.length, source } });
  } catch (error) {
    return sendError(res, error);
  }
}
