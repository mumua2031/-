const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const allowedMimeTypes = /* @__PURE__ */ new Set(["image/jpeg", "image/png"]);
function createError(message, statusCode) {
  const error = new Error(message);
  Object.assign(error, { statusCode });
  return error;
}
function decodeImage(base64) {
  if (typeof base64 !== "string" || !base64.trim()) throw createError("\u7F3A\u5C11\u56FE\u7247\u6570\u636E\u3002", 400);
  const normalized = base64.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) throw createError("\u56FE\u7247\u6570\u636E\u683C\u5F0F\u65E0\u6548\u3002", 400);
  const buffer = Buffer.from(normalized, "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw createError("\u514D\u8D39\u81EA\u52A8\u4E0A\u4F20\u6A21\u5F0F\u4EC5\u652F\u6301\u538B\u7F29\u540E 1.5 MB \u4EE5\u4E0B\u56FE\u7247\u3002", 413);
  return { buffer, base64: buffer.toString("base64") };
}
function getGithubImageStorageConfig() {
  const token = process.env.GITHUB_UPLOAD_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  if (!token || !repository) throw createError("\u672A\u914D\u7F6E GitHub \u81EA\u52A8\u53D1\u5E03\u3002\u8BF7\u8BBE\u7F6E GITHUB_UPLOAD_TOKEN \u548C GITHUB_REPOSITORY\u3002", 503);
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw createError("GITHUB_REPOSITORY \u683C\u5F0F\u5E94\u4E3A \u7528\u6237\u540D/\u4ED3\u5E93\u540D\u3002", 500);
  return { token, repository, branch };
}
function getGithubImageUrl(config, path) {
  return `https://raw.githubusercontent.com/${config.repository}/${config.branch}/${path}`;
}
async function readGithubError(response) {
  const text = await response.text().catch(() => "");
  if (!text) return String(response.status);
  try {
    const detail = JSON.parse(text);
    return detail.message || String(response.status);
  } catch {
    return text.replace(/\s+/g, " ").trim() || String(response.status);
  }
}
function getGithubImagePath(config, imageUrl) {
  if (typeof imageUrl !== "string") return null;
  const filenamePattern = "(HE-[NHG]-[BSL]-[RGBAM]\\d{2,}\\.(?:jpg|png))";
  const localMatch = imageUrl.match(new RegExp(`^/patterns/${filenamePattern}$`, "i"));
  if (localMatch) return `public/patterns/${localMatch[1]}`;
  const remotePrefix = `https://raw.githubusercontent.com/${config.repository}/${config.branch}/public/patterns/`;
  if (!imageUrl.startsWith(remotePrefix)) return null;
  const filename = imageUrl.slice(remotePrefix.length);
  return new RegExp(`^${filenamePattern}$`, "i").test(filename) ? `public/patterns/${filename}` : null;
}
async function uploadImageToGithub(input) {
  if (typeof input.mimeType !== "string" || !allowedMimeTypes.has(input.mimeType)) throw createError("\u4EC5\u652F\u6301 PNG\u3001JPG \u56FE\u7247\u3002", 415);
  if (typeof input.heCode !== "string" || !/^HE-[NHG]-[BSL]-[RGBAM]\d{2,}$/.test(input.heCode)) throw createError("\u56FE\u7247\u7F16\u53F7\u683C\u5F0F\u65E0\u6548\u3002", 400);
  const { base64 } = decodeImage(input.image);
  const config = getGithubImageStorageConfig();
  const { token, repository, branch } = config;
  const extension = input.mimeType === "image/png" ? "png" : "jpg";
  const path = `public/patterns/${input.heCode}.${extension}`;
  const url = `https://api.github.com/repos/${repository}/contents/${path}`;
  const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };
  const existing = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) {
    return { imageUrl: getGithubImageUrl(config, path), deploymentPending: false, reused: true };
  }
  if (existing.status !== 404) throw createError(`\u65E0\u6CD5\u68C0\u67E5 GitHub \u56FE\u7247\u76EE\u5F55\uFF1A${await readGithubError(existing)}\u3002\u8BF7\u68C0\u67E5\u4EE4\u724C\u6743\u9650\u548C\u4ED3\u5E93\u540D\u79F0\u3002`, 502);
  const response = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message: `\u4E0A\u4F20\u7EB9\u6837\u56FE\u7247 ${input.heCode}`, content: base64, branch })
  });
  if (!response.ok) {
    throw createError(`GitHub \u56FE\u7247\u53D1\u5E03\u5931\u8D25\uFF1A${await readGithubError(response)}`, 502);
  }
  return { imageUrl: getGithubImageUrl(config, path), deploymentPending: true };
}
async function deleteImageFromGithub(input) {
  const config = getGithubImageStorageConfig();
  const path = getGithubImagePath(config, input.imageUrl);
  if (!path) return;
  const { token, repository, branch } = config;
  const url = `https://api.github.com/repos/${repository}/contents/${path}`;
  const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };
  const existing = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.status === 404) return;
  if (!existing.ok) throw createError(`\u65E0\u6CD5\u8BFB\u53D6 GitHub \u56FE\u7247\uFF1A${await readGithubError(existing)}\u3002\u8BF7\u68C0\u67E5\u4EE4\u724C\u6743\u9650\u548C\u4ED3\u5E93\u540D\u79F0\u3002`, 502);
  const content = await existing.json();
  if (!content.sha) throw createError("GitHub \u56FE\u7247\u7F3A\u5C11\u7248\u672C\u4FE1\u606F\uFF0C\u65E0\u6CD5\u5220\u9664\u3002", 502);
  const response = await fetch(url, {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message: `\u5220\u9664\u7EB9\u6837\u56FE\u7247 ${path.split("/").at(-1)}`, sha: content.sha, branch })
  });
  if (!response.ok) {
    throw createError(`GitHub \u56FE\u7247\u5220\u9664\u5931\u8D25\uFF1A${await readGithubError(response)}`, 502);
  }
}
function isGithubPatternImageUrl(imageUrl) {
  if (typeof imageUrl !== "string") return false;
  return /^\/patterns\/HE-[NHG]-[BSL]-[RGBAM]\d{2,}\.(?:jpg|png)$/i.test(imageUrl) || /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public\/patterns\/HE-[NHG]-[BSL]-[RGBAM]\d{2,}\.(?:jpg|png)$/i.test(imageUrl);
}
export {
  deleteImageFromGithub,
  isGithubPatternImageUrl,
  uploadImageToGithub
};
