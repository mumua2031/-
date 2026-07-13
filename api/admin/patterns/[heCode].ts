import { assertAdminToken, updatePattern } from '../../../src/server/patternRepository';
import type { ApiRequest, ApiResponse } from '../../_utils';
import { sendError, unsupportedMethod } from '../../_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') return unsupportedMethod(res);

  try {
    assertAdminToken(req.headers);
    const heCode = Array.isArray(req.query?.heCode) ? req.query?.heCode[0] : req.query?.heCode;
    if (!heCode) return res.status(400).json({ success: false, error: 'HE code is required' });

    const id = await updatePattern(heCode, req.body as Record<string, unknown>);
    return res.json({ success: true, id });
  } catch (error) {
    return sendError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
  }
}
