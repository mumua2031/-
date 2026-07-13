# 绣艺境后端与后续维护说明

## 当前架构

公开前端仍部署在 Vercel。项目现在新增了同源后端接口：

- `GET /api/health`：检查 API、数据源和基础可用性。
- `GET /api/patterns`：获取纹样列表。
- `GET /api/patterns/:heCode`：获取单条纹样档案。
- `POST /api/admin/patterns`：新增纹样，需管理员令牌。
- `PUT /api/admin/patterns/:heCode`：更新纹样，需管理员令牌。
- `POST /api/analyze-image`：调用 Gemini 做图像辅助分析，需 `GEMINI_API_KEY`。

前端通过 `PatternDataProvider` 读取 `/api/patterns`。如果 API、Firestore 或环境变量异常，前端会自动回退到 `src/data.ts`，避免公开网站空白。

## Vercel 环境变量

在 Vercel 项目后台添加：

```env
ADMIN_API_TOKEN=一段足够长的随机字符串
GEMINI_API_KEY=你的 Gemini API Key
```

如果要启用数据库写入，再添加 Firestore 配置。推荐方式：

```env
FIREBASE_PROJECT_ID=你的 Firebase Project ID
FIREBASE_DATABASE_ID=你的 Firestore Database ID，可为空
FIREBASE_SERVICE_ACCOUNT_JSON=完整服务账号 JSON
```

如果前端和 API 不在同一个域名，再配置：

```env
VITE_API_BASE_URL=https://api.example.com
```

当前同站部署时不需要填写 `VITE_API_BASE_URL`。

## 后续更新流程

1. 新增或修正纹样资料。
2. 后台生成 HE 编码。
3. 填写名称、分类、色彩、年代、地域、来源、版权状态。
4. 使用后台令牌提交到 `/api/admin/patterns`。
5. 到 `/api/health` 检查数据源是否正常。
6. 到前台纹样库检查展示和详情页是否一一对应。

## 数据库未配置时

没有配置 Firestore 时，新增/更新接口会返回：

```json
{
  "success": false,
  "error": "Persistent database is not configured."
}
```

这是正常保护机制。公开前台仍会使用 `src/data.ts` 的本地档案数据。

## 维护原则

- 不让前端直接连接数据库。
- 所有后台写入必须经过 `/api/admin/*`。
- `ADMIN_API_TOKEN` 不要写进前端源码。
- 来源不明确时保持保守表述。
- 版权状态不确定时使用“权属待确认，仅供非商用研究”。
- 定期从 Firestore 导出备份。
- 每次大批量更新后运行 `npm run lint` 和 `npm run build`。
