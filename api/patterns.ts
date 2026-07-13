import { assertAdminToken, createPattern, listPatterns } from '../src/server/patternRepository';
import type { ApiRequest, ApiResponse } from './_utils';
import { parsePatternQuery, sendError, unsupportedMethod } from './_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, source } = await listPatterns(parsePatternQuery(req.query));
      return res.json({ success: true, data, meta: { count: data.length, source } });
    } catch (error) {
      return sendError(res, error);
    }
  }

  if (req.method === 'POST') {
    try {
      assertAdminToken(req.headers);
      const id = await createPattern(req.body as Record<string, unknown>);
      return res.json({ success: true, id });
    } catch (error) {
      return sendError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
    }
  }

  return unsupportedMethod(res);
}
