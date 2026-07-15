import type { ApiRequest, ApiResponse } from './_utils.js';
import { parsePatternQuery, sendError, sendJson, unsupportedMethod } from './_utils.js';
import { listPatterns } from '../src/server/patternRepository.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return unsupportedMethod(res);
  try {
    const { data, source } = await listPatterns(parsePatternQuery(req.query));
    return sendJson(res, 200, { success: true, data, meta: { count: data.length, source } });
  } catch (error) {
    return sendError(res, error);
  }
}
