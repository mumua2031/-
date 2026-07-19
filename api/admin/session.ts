import type { ApiRequest, ApiResponse } from '../_utils.js';
import { assertAdminToken, sendError, sendJson, unsupportedMethod } from '../_utils.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'GET') return unsupportedMethod(res);
    assertAdminToken(req.headers);
    return sendJson(res, 200, {
      success: true,
      data: {
        role: 'admin',
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}
