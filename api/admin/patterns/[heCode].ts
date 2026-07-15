import type { ApiRequest, ApiResponse } from '../../_utils';
import { assertAdminToken, sendError, sendJson, unsupportedMethod } from '../../_utils';
import { createPattern, deletePattern, updatePattern } from '../../../src/server/patternRepository';
import { deleteImageFromGithub, isGithubPatternImageUrl } from '../../../src/server/githubImageStorage';
import { deletePatternImage } from '../../../src/server/patternStorage';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'PATCH' && req.method !== 'DELETE') return unsupportedMethod(res);

  try {
    assertAdminToken(req.headers);
    const heCode = Array.isArray(req.query?.heCode) ? req.query?.heCode[0] : req.query?.heCode;
    if (!heCode) return sendJson(res, 400, { success: false, error: 'HE code is required' });

    if (req.method === 'DELETE') {
      const pattern = await deletePattern(heCode);
      try {
        if (isGithubPatternImageUrl(pattern.imageUrl)) {
          await deleteImageFromGithub({ imageUrl: pattern.imageUrl });
        } else {
          await deletePatternImage(pattern.storagePath);
        }
      } catch (imageError) {
        await createPattern(pattern).catch(() => undefined);
        throw imageError;
      }
      return sendJson(res, 200, { success: true, id: pattern.id });
    }

    const id = await updatePattern(heCode, req.body as Record<string, unknown>);
    return sendJson(res, 200, { success: true, id });
  } catch (error) {
    return sendError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
  }
}
