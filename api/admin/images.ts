import { assertAdminToken } from '../../src/server/patternRepository';
import { uploadImageToGithub } from '../../src/server/githubImageStorage';
import type { ApiRequest, ApiResponse } from '../_utils';
import { sendError, unsupportedMethod } from '../_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return unsupportedMethod(res);
  try {
    assertAdminToken(req.headers);
    if (!process.env.GITHUB_UPLOAD_TOKEN) {
      return res.status(503).json({ success: false, error: '免费自动上传尚未配置。请在 Vercel 设置 GITHUB_UPLOAD_TOKEN、GITHUB_REPOSITORY 和 GITHUB_BRANCH。' });
    }
    const image = await uploadImageToGithub(req.body || {});
    return res.status(201).json({ success: true, data: image });
  } catch (error) {
    return sendError(res, error);
  }
}
