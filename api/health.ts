import { listPatterns } from '../src/server/patternRepository';
import type { ApiRequest, ApiResponse } from './_utils';
import { sendError, unsupportedMethod } from './_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return unsupportedMethod(res);

  try {
    const { data, source } = await listPatterns({ limit: 1 });
    return res.json({
      success: true,
      status: 'ok',
      patternSource: source,
      hasPatterns: data.length > 0,
      databaseConfigured: source === 'firestore',
    });
  } catch (error) {
    return sendError(res, error);
  }
}
