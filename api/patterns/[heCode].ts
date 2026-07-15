import type { ApiRequest, ApiResponse } from '../_utils.js';
import { sendError, sendJson, unsupportedMethod } from '../_utils.js';
import { findPatternByCode } from '../../src/server/patternRepository.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return unsupportedMethod(res);

  try {
    const heCode = Array.isArray(req.query?.heCode) ? req.query?.heCode[0] : req.query?.heCode;
    if (!heCode) return sendJson(res, 400, { success: false, error: 'HE code is required' });

    const { data, source } = await findPatternByCode(heCode);
    if (!data) return sendJson(res, 404, { success: false, error: 'Pattern not found' });

    return sendJson(res, 200, { success: true, data, meta: { source } });
  } catch (error) {
    return sendError(res, error);
  }
}
