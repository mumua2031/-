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

type GithubImageStorageConfig = {
  token: string;
  repository: string;
  branch: string;
};

function getGithubImageStorageConfig(): GithubImageStorageConfig {
  const token = process.env.GITHUB_UPLOAD_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_BRANCH?.trim() || 'main';
  if (!token || !repository) throw createError('未配置 GitHub 自动发布。请设置 GITHUB_UPLOAD_TOKEN 和 GITHUB_REPOSITORY。', 503);
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw createError('GITHUB_REPOSITORY 格式应为 用户名/仓库名。', 500);
  return { token, repository, branch };
}

function getGithubImageUrl(config: GithubImageStorageConfig, path: string) {
  return `https://raw.githubusercontent.com/${config.repository}/${config.branch}/${path}`;
}

async function readGithubError(response: Response) {
  const text = await response.text().catch(() => '');
  if (!text) return String(response.status);
  try {
    const detail = JSON.parse(text) as { message?: string };
    return detail.message || String(response.status);
  } catch {
    return text.replace(/\s+/g, ' ').trim() || String(response.status);
  }
}

function getGithubImagePath(config: GithubImageStorageConfig, imageUrl: unknown) {
  if (typeof imageUrl !== 'string') return null;
  const filenamePattern = '(HE-[NHG]-[BSL]-[RGBAM]\\d{2,}\\.(?:jpg|png))';
  const localMatch = imageUrl.match(new RegExp(`^/patterns/${filenamePattern}$`, 'i'));
  if (localMatch) return `public/patterns/${localMatch[1]}`;

  const remotePrefix = `https://raw.githubusercontent.com/${config.repository}/${config.branch}/public/patterns/`;
  if (!imageUrl.startsWith(remotePrefix)) return null;
  const filename = imageUrl.slice(remotePrefix.length);
  return new RegExp(`^${filenamePattern}$`, 'i').test(filename) ? `public/patterns/${filename}` : null;
}

export async function uploadImageToGithub(input: { image?: unknown; mimeType?: unknown; heCode?: unknown }) {
  if (typeof input.mimeType !== 'string' || !allowedMimeTypes.has(input.mimeType)) throw createError('仅支持 PNG、JPG 图片。', 415);
  if (typeof input.heCode !== 'string' || !/^HE-[NHG]-[BSL]-[RGBAM]\d{2,}$/.test(input.heCode)) throw createError('图片编号格式无效。', 400);
  const { base64 } = decodeImage(input.image);
  const config = getGithubImageStorageConfig();
  const { token, repository, branch } = config;
  const extension = input.mimeType === 'image/png' ? 'png' : 'jpg';
  const path = `public/patterns/${input.heCode}.${extension}`;
  const url = `https://api.github.com/repos/${repository}/contents/${path}`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };

  const existing = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) {
    return { imageUrl: getGithubImageUrl(config, path), deploymentPending: false, reused: true };
  }
  if (existing.status !== 404) throw createError('无法检查 GitHub 图片目录，请检查令牌权限和仓库名称。', 502);

  const response = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `上传纹样图片 ${input.heCode}`, content: base64, branch }),
  });
  if (!response.ok) {
    throw createError(`GitHub 图片发布失败：${await readGithubError(response)}`, 502);
  }

  return { imageUrl: getGithubImageUrl(config, path), deploymentPending: true };
}

export async function deleteImageFromGithub(input: { imageUrl?: unknown }) {
  const config = getGithubImageStorageConfig();
  const path = getGithubImagePath(config, input.imageUrl);
  if (!path) return;
  const { token, repository, branch } = config;
  const url = `https://api.github.com/repos/${repository}/contents/${path}`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };
  const existing = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });

  if (existing.status === 404) return;
  if (!existing.ok) throw createError('无法读取 GitHub 图片，请检查令牌权限和仓库名称。', 502);

  const content = await existing.json() as { sha?: string };
  if (!content.sha) throw createError('GitHub 图片缺少版本信息，无法删除。', 502);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `删除纹样图片 ${path.split('/').at(-1)}`, sha: content.sha, branch }),
  });
  if (!response.ok) {
    throw createError(`GitHub 图片删除失败：${await readGithubError(response)}`, 502);
  }
}

export function isGithubPatternImageUrl(imageUrl: unknown) {
  if (typeof imageUrl !== 'string') return false;
  return /^\/patterns\/HE-[NHG]-[BSL]-[RGBAM]\d{2,}\.(?:jpg|png)$/i.test(imageUrl)
    || /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public\/patterns\/HE-[NHG]-[BSL]-[RGBAM]\d{2,}\.(?:jpg|png)$/i.test(imageUrl);
}
