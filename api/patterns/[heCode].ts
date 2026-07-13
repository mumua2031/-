import { findPatternByCode } from '../../src/server/patternRepository';
import type { ApiRequest, ApiResponse } from '../_utils';
import { sendError, unsupportedMethod } from '../_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return unsupportedMethod(res);

  try {
    const heCode = Array.isArray(req.query?.heCode) ? req.query?.heCode[0] : req.query?.heCode;
    if (!heCode) return res.status(400).json({ success: false, error: 'HE code is required' });

    const { data, source } = await findPatternByCode(heCode);
    if (!data) return res.status(404).json({ success: false, error: 'Pattern not found' });

    return res.json({ success: true, data, meta: { source } });
  } catch (error) {
    return sendError(res, error);
  }
}
