const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/png']);

function createError(message: string, statusCode: number) {
  const error = new Error(message);
  Object.assign(error, { statusCode });
  return error;
}

function decodeImage(base64: unknown) {
  if (typeof base64 !== 'string' || !base64.trim()) throw createError('缺少图片数据。', 400);
  const normalized = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  const buffer = Buffer.from(normalized, 'base64');
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw createError('免费自动发布模式仅支持 4 MB 以下图片。', 413);
  return { buffer, base64: buffer.toString('base64') };
}

function config() {
  const token = process.env.GITHUB_UPLOAD_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repository) throw createError('未配置 GitHub 自动发布。请设置 GITHUB_UPLOAD_TOKEN 和 GITHUB_REPOSITORY。', 503);
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw createError('GITHUB_REPOSITORY 格式应为 用户名/仓库名。', 500);
  return { token, repository, branch };
}

export async function uploadImageToGithub(input: { image?: unknown; mimeType?: unknown; heCode?: unknown }) {
  if (typeof input.mimeType !== 'string' || !allowedMimeTypes.has(input.mimeType)) throw createError('仅支持 PNG、JPG 图片。', 415);
  if (typeof input.heCode !== 'string' || !/^HE-[NHG]-[BSL]-[RGBAM]\d{2,}$/.test(input.heCode)) throw createError('图片编号格式无效。', 400);
  const { base64 } = decodeImage(input.image);
  const { token, repository, branch } = config();
  const extension = input.mimeType === 'image/png' ? 'png' : 'jpg';
  const path = `public/patterns/${input.heCode}.${extension}`;
  const url = `https://api.github.com/repos/${repository}/contents/${path}`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };

  const existing = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) throw createError(`图片 ${input.heCode}.${extension} 已存在，请使用新的编号或在数据管理中更新资料。`, 409);
  if (existing.status !== 404) throw createError('无法检查 GitHub 图片目录，请检查令牌权限和仓库名称。', 502);

  const response = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `上传纹样图片 ${input.heCode}`, content: base64, branch }),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { message?: string } | null;
    throw createError(`GitHub 图片发布失败：${detail?.message || response.status}`, 502);
  }

  return { imageUrl: `/patterns/${input.heCode}.${extension}`, deploymentPending: true };
}
