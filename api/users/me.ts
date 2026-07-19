import type { ApiRequest, ApiResponse } from '../_utils.js';
import { sendError, sendJson, unsupportedMethod } from '../_utils.js';
import { getCurrentUserProfile, upsertCurrentUserProfile } from '../../src/server/userRepository.js';

function readBody(req: ApiRequest) {
  return req.body && typeof req.body === 'object'
    ? req.body as Record<string, unknown>
    : {};
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method === 'GET') {
      const data = await getCurrentUserProfile(req.headers);
      return sendJson(res, 200, { success: true, data });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const data = await upsertCurrentUserProfile(req.headers, readBody(req));
      return sendJson(res, 200, { success: true, data });
    }

    return unsupportedMethod(res);
  } catch (error) {
    return sendError(res, error);
  }
}
