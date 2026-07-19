const siteUrl = String(process.env.SITE_URL || 'https://xiuyijing.vercel.app').replace(/\/$/, '');
const adminToken = String(process.env.ADMIN_API_TOKEN || '').trim();

if (!adminToken) {
  throw new Error('请先在当前终端设置 ADMIN_API_TOKEN，再执行生产档案同步。');
}

const response = await fetch(`${siteUrl}/api/admin/patterns/sync`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
});
const text = await response.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = { raw: text };
}

if (!response.ok) {
  throw new Error(`生产档案同步失败（HTTP ${response.status}）：${body.error || body.raw || '未知错误'}`);
}

console.log(JSON.stringify(body, null, 2));
