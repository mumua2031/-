import type { ApiRequest, ApiResponse } from '../../_utils.js';
import { assertAdminToken, sendError, sendJson, unsupportedMethod } from '../../_utils.js';
import { syncLocalPatternsToFirestore } from '../../../src/server/patternRepository.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return unsupportedMethod(res);

  try {
    assertAdminToken(req.headers);
    const summary = await syncLocalPatternsToFirestore();
    return sendJson(res, 200, { success: true, ...summary });
  } catch (error) {
    return sendError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
  }
}
