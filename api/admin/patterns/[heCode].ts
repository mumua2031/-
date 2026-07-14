import { assertAdminToken, deletePattern, updatePattern } from '../../../src/server/patternRepository';
import { deletePatternImage } from '../../../src/server/patternStorage';
import { deleteImageFromGithub } from '../../../src/server/githubImageStorage';
import type { ApiRequest, ApiResponse } from '../../_utils';
import { sendError, unsupportedMethod } from '../../_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'PATCH' && req.method !== 'DELETE') return unsupportedMethod(res);

  try {
    assertAdminToken(req.headers);
    const heCode = Array.isArray(req.query?.heCode) ? req.query?.heCode[0] : req.query?.heCode;
    if (!heCode) return res.status(400).json({ success: false, error: 'HE code is required' });

    if (req.method === 'DELETE') {
      const pattern = await deletePattern(heCode);
      if (process.env.GITHUB_UPLOAD_TOKEN) {
        await deleteImageFromGithub({ imageUrl: pattern.imageUrl });
      } else {
        await deletePatternImage(pattern.storagePath);
      }
      return res.json({ success: true, id: pattern.id });
    }

    const id = await updatePattern(heCode, req.body as Record<string, unknown>);
    return res.json({ success: true, id });
  } catch (error) {
    return sendError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
  }
}
