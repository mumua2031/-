type ApiPayload<T = unknown> = {
  success?: boolean;
  data?: T;
  error?: string;
  [key: string]: unknown;
};

function fallbackMessage(status: number) {
  if (status === 401) return '管理员接口令牌不正确，请检查 ADMIN_API_TOKEN。';
  if (status === 403) return '当前令牌没有操作权限，请检查 GitHub 或管理员令牌权限。';
  if (status === 404) return '接口地址不存在，请确认网站已重新部署。';
  if (status === 413) return '图片过大，免费上传模式仅支持 4 MB 以下图片。';
  if (status >= 500) return '服务器暂时无法处理请求，请检查 Vercel 环境变量并重新部署。';
  return `请求失败（${status}）。`;
}

export async function readApiPayload<T extends ApiPayload = ApiPayload>(response: Response, action = '请求') {
  const text = await response.text();
  let payload: ApiPayload<T> | null = null;

  if (text.trim()) {
    try {
      payload = JSON.parse(text) as ApiPayload<T>;
    } catch {
      const cleanText = text.replace(/\s+/g, ' ').trim();
      throw new Error(`${action}失败：${cleanText || fallbackMessage(response.status)}`);
    }
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(`${action}失败：${payload?.error || fallbackMessage(response.status)}`);
  }

  return payload as T;
}
