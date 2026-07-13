import { assertAdminToken, createPattern } from '../../src/server/patternRepository';
import type { ApiRequest, ApiResponse } from '../_utils';
import { sendError, unsupportedMethod } from '../_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return unsupportedMethod(res);

  try {
    assertAdminToken(req.headers);
    const id = await createPattern(req.body as Record<string, unknown>);
    return res.json({ success: true, id });
  } catch (error) {
    return sendError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
  }
}
