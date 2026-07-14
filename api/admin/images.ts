import { assertAdminToken } from '../../src/server/patternRepository';
import { uploadPatternImage } from '../../src/server/patternStorage';
import { uploadImageToGithub } from '../../src/server/githubImageStorage';
import type { ApiRequest, ApiResponse } from '../_utils';
import { sendError, unsupportedMethod } from '../_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return unsupportedMethod(res);
  try {
    assertAdminToken(req.headers);
    const image = process.env.GITHUB_UPLOAD_TOKEN
      ? await uploadImageToGithub(req.body || {})
      : await uploadPatternImage(req.body || {});
    return res.status(201).json({ success: true, data: image });
  } catch (error) {
    return sendError(res, error);
  }
}
