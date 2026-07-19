import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const detailPath = path.join(root, 'src', 'pages', 'PatternDetail.tsx');
const source = fs.readFileSync(detailPath, 'utf8');

const requiredSnippets = [
  '_带水印预览图.png',
  '_完整纹样档案.txt',
  '_版权使用须知.txt',
  '档案包仅包含带水印预览图 PNG、完整纹样档案 TXT 和版权使用须知 TXT。',
];

const forbiddenSnippets = [
  '_纹样元数据.md',
  'Markdown、无水印原图、商用高清素材或矢量源文件',
  '不包含 Markdown',
];

const failures = [];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    failures.push(`缺少必要下载包内容或提示：${snippet}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (source.includes(snippet)) {
    failures.push(`仍包含旧下载包内容或旧提示：${snippet}`);
  }
}

if (/createZip\([\s\S]*?\.md[`'"]/.test(source)) {
  failures.push('下载压缩包仍在生成 .md 文件。');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('下载压缩包格式检查通过：仅包含预览 PNG、完整档案 TXT、版权须知 TXT。');
