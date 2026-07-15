import type { ApiRequest, ApiResponse } from '../_utils';
import { assertAdminToken, sendError, sendJson, unsupportedMethod } from '../_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return unsupportedMethod(res);
  try {
    assertAdminToken(req.headers);
    if (!process.env.GITHUB_UPLOAD_TOKEN || !process.env.GITHUB_REPOSITORY) {
      return sendJson(res, 503, {
        success: false,
        error: '免费自动上传尚未配置。请在 Vercel 设置 GITHUB_UPLOAD_TOKEN、GITHUB_REPOSITORY 和 GITHUB_BRANCH。',
      });
    }
    const { uploadImageToGithub } = await import('../../src/server/githubImageStorage');
    const image = await uploadImageToGithub(req.body || {});
    return sendJson(res, 201, { success: true, data: image });
  } catch (error) {
    return sendError(res, error);
  }
}
