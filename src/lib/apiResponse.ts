type ApiPayload<T = unknown> = {
  success?: boolean;
  data?: T;
  error?: string;
  [key: string]: unknown;
};

function fallbackMessage(status: number) {
  if (status === 401) return '管理员接口令牌不正确，请检查 ADMIN_API_TOKEN。';
  if (status === 403) return '当前令牌没有操作权限，请检查 GitHub 或管理员令牌权限。';
  if (status === 404) return '接口地址不存在，请确认网站已经重新部署。';
  if (status === 413) return '图片过大，请压缩后再上传。';
  if (status >= 500) return '服务器暂时无法处理请求，请检查 Vercel 环境变量并重新部署。';
  return `请求失败（${status}）。`;
}

function cleanPlatformError(text: string) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (!cleanText) return '';
  if (cleanText.includes('FUNCTION_INVOCATION_FAILED')) {
    return 'Vercel 后端函数执行失败。常见原因是图片请求体过大、环境变量缺失，或 GitHub/Firebase 配置错误。';
  }
  return cleanText;
}

export async function readApiPayload<T extends ApiPayload = ApiPayload>(response: Response, action = '请求') {
  const text = await response.text();
  let payload: ApiPayload<T> | null = null;

  if (text.trim()) {
    try {
      payload = JSON.parse(text) as ApiPayload<T>;
    } catch {
      throw new Error(`${action}失败：${cleanPlatformError(text) || fallbackMessage(response.status)}`);
    }
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(`${action}失败：${payload?.error || fallbackMessage(response.status)}`);
  }

  return payload as T;
}
