# 非遗汉绣纹样基因库 (Han Embroidery Pattern Gene Bank)

## 1. 系统架构与目录结构
本系统基于全栈 TypeScript 构建，采用 Express (Node.js) 提供 RESTful API 接口与后端服务，使用 Vite + React 构建前端应用，并通过 Firebase Firestore 提供云端 NoSQL 数据持久化方案（代替传统关系型数据库建表，提供更灵活的多语种扩展）。

```text
/
├── server.ts               # 后端 Express 核心主入口，定义 RESTful API、后台路由、鉴权与 Firebase Admin 初始化
├── src/
│   ├── components/         # 独立、解耦的 React 组件
│   │   ├── Navigation.tsx  # 多语种主导航
│   │   └── GeneWall.tsx    # 基因墙展示规范组件（严格遵守网格、极简、独立呼吸动效限制）
│   ├── pages/              # 各个功能视图
│   │   ├── Home.tsx        # 前台大厅界面
│   │   ├── PatternDetail.tsx # 图文分离布局的详情页面
│   │   └── Admin.tsx       # 后台管理 Dashboard 视图
│   ├── lib/                # 业务逻辑与第三方集成
│   │   ├── firebase.ts     # 前端 Firebase Client 配置 (预留功能)
│   │   └── i18n.ts         # 完整的 5 语种切换框架及静态语言包资源
│   ├── types.ts            # 全局 TypeScript 接口及 Schema 定义
│   ├── data.ts             # 开发和预览环境的 Mock 数据生成（预装了 20+ 个符合 HE 规范的纹样）
│   ├── App.tsx             # 路由中心 (React Router)
│   └── main.tsx            # 前端启动入口
└── package.json            # 完整工程化配置（支持单命令全栈编译）
```

## 2. 数据库设计 (Firestore Schema)

由于系统使用 Firebase Firestore，我们在代码 `src/types.ts` 中定义了以下 Schema（以 JSON 结构展示等效表结构）：

### Collection: `patterns`
用于存储所有纹样基因记录。采用多语种字段内嵌（嵌入式 Document）的方法。

```typescript
{
  "id": "String (Auto-generated UUID)", 
  "heCode": "String (Global Unique, e.g. HE-N-B-R01)",
  "name": {
    "zh-CN": "String (Required)",
    "zh-TW": "String (Optional)",
    "en": "String (Optional)",
    "ja": "String (Optional)",
    "ko": "String (Optional)"
  },
  "imageUrl": "String (URL to processed PNG file in Storage)",
  "originalImageUrl": "String (URL to raw uploaded file in Storage)",
  
  // 结构化分类标签 (可包含 N/H/G 的系统树)
  "categoryLabels": [
    { "zh-CN": "...", "en": "..." }
  ],
  
  // 基本著录信息
  "era": "String",
  "carrier": "String",
  "region": "String",
  "copyrightOwner": "String",
  "format": "String",
  "resolution": "String",
  
  // 基因解读 (全部使用多语言 Schema)
  "craft": { "zh-CN": "...", "en": "..." },
  "symbolism": { "zh-CN": "...", "en": "..." },
  "origin": { "zh-CN": "...", "en": "..." },
  "scenario": { "zh-CN": "...", "en": "..." },
  "literature": { "zh-CN": "...", "en": "..." },
  "inheritor": { "zh-CN": "...", "en": "..." },

  // 系统及运维字段
  "createdAt": "Timestamp",
  "status": "String (DRAFT | PENDING | PUBLISHED | ARCHIVED)",
  "views": "Number",
  "isOpenToMiniProgram": "Boolean"
}
```

### Collection: `api_keys`
用于外部接口鉴权，存储分配给第三方机构或小程序的凭证。
```typescript
{
  "keyHash": "String (SHA-256 encrypted string)",
  "organization": "String",
  "permissions": ["READ_BASIC", "DOWNLOAD_WATERMARK", "DOWNLOAD_HD"],
  "rateLimit": "Number (requests per hour)",
  "isActive": "Boolean",
  "createdAt": "Timestamp"
}
```

## 3. 对外数据 RESTful API 接口文档

基础路径: `https://[DOMAIN]/api/v1`

### 全局规范
- **Header 鉴权**: `Authorization: Bearer <API_KEY>` (除公开预览接口外)
- **多语言参数**: 所有 GET 请求接受 `lang` 参数 (例如: `?lang=zh-CN` 或 `?lang=en`)，返回的 JSON 将优先过滤并提取指定语言的纯字符串，缺失则回退到 `zh-CN`。
- **返回结构**:
  ```json
  {
    "success": true,
    "data": {}, // 或数组
    "error": null
  }
  ```

### 3.1 检索与列表 `/patterns` (GET)
获取数字馆藏列表，支持复合筛选。
- **参数**:
  - `page` (int, default=1)
  - `limit` (int, default=20)
  - `keyword` (string, 支持五语语义或模糊匹配)
  - `he_code` (string, 例如 `HE-N` 将检索自然大类)
  - `lang` (string, enum: zh-CN, zh-TW, en, ja, ko)
- **预留 AI 接口支持**: 当传入 `keyword` 为长句（如 "适合婚礼的红色刺绣"），网关将调用 AI 语义模型，转换为向量进行近似查询 (Vector Search)。

### 3.2 获取纹样详情 `/patterns/:heCode` (GET)
根据全球唯一 HE 编码获取著录详情。
- **参数**: `lang` (string)

### 3.3 以图搜图 `/patterns/search-by-image` (POST)
- **Header**: `Content-Type: multipart/form-data`
- **Body**: `file` (Image binary, max 5MB)
- **响应**: 返回包含 `heCode` 与 `similarity` (相似度) 的数组。
- **预留 AI 接口支持**: 系统将提取图片 Feature Vector，并与云端大模型 Vision 库比对，返回相关结果。

### 3.4 获取商用授权及下载凭证 `/patterns/:heCode/download-ticket` (POST)
生成时效签名 (Signed URL) 以防数据泄露。
- **参数**: `purpose` (string, e.g. "commercial", "academic")
- **响应**: 
  ```json
  { "url": "https://storage.../token=xyz", "expiresIn": 3600 }
  ```

### 3.5 错误码字典
- `401 Unauthorized`: API Key 缺失或无效
- `403 Forbidden`: 权限不足（如未获商业下载许可）
- `404 Not Found`: HE编码或资源不存在
- `429 Too Many Requests`: 触发频次限制

## 4. AI 引擎处理队列规范 (后台任务节点预留)

在 `server.ts` 和 Cloud Functions 的后台工作流中，预留了以下 AI 自动化接口及参数规范：

1. **图像处理 (Image Matting & Processing)**
   - **触发**: 管理员上传原图后。
   - **调用**: `POST /internal/ai/matting`
   - **规范**: 提取主体，分离透明通道并转为 PNG。输出至隔离存储桶，禁止覆写原始归档。

2. **自动分类编码 (Auto Taxonomy & HE Generator)**
   - **触发**: 上传完毕后。
   - **调用**: `POST /internal/ai/classify` (Gemini Pro Vision)
   - **规范**: 输入原图，AI 根据视觉特征返回推荐的 `HE` 编码前缀（如属于 N, H 还是 G 库）及结构化标签阵列。

3. **多语文案与基因解读生成**
   - **触发**: 初审入库时或用户点击 "AI 解读"。
   - **调用**: `POST /internal/ai/generate-interpretation` (Gemini Pro)
   - **规范**: 基于提取到的结构化短词，延展生成完整的工艺、寓意溯源文本，并同步翻译为 5 种目标语言返回 JSON Schema 供终审修改。

## 5. 项目亮点合规性 (Compliance Checklist)
- [x] **零在线编辑限制**: 系统底层与前端全量剥离了画板、拼接、组合等创作模块，严格定位为 "Archive & Registry"。
- [x] **极简基因墙**: `GeneWall.tsx` 中禁用了各类边框、阴影，背景去装饰化；精准实现了随机延迟的缓动呼吸效果 (`scale 0.98~1.02, opacity 0.7~1`)，未引入霓虹/发光污染。
- [x] **国际化体系**: 完整的 5 语种静态字典库已在 `src/lib/i18n.ts` 中就绪；HE 编码被标记为全局不翻译 ID。
- [x] **图文分离布局**: `PatternDetail.tsx` 精确执行了 65% 左区纯洁展示（带放大），35% 右区高密度数据陈列的学术规范布局。
