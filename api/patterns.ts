import { listPatterns } from '../src/server/patternRepository';
import type { ApiRequest, ApiResponse } from './_utils';
import { parsePatternQuery, sendError, unsupportedMethod } from './_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return unsupportedMethod(res);
  try {
    const { data, source } = await listPatterns(parsePatternQuery(req.query));
    return res.json({ success: true, data, meta: { count: data.length, source } });
  } catch (error) {
    return sendError(res, error);
  }
}
