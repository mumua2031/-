import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mockPatterns } from '../src/data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const finalImportPath = path.join(root, 'import-manifests', 'final-import-patterns.json');
const previousRecords = JSON.parse(fs.readFileSync(finalImportPath, 'utf8'));
const synchronized = mockPatterns.map((pattern) => ({
  ...pattern,
  id: pattern.heCode,
  heCode: pattern.heCode,
}));

const codes = synchronized.map((record) => record.heCode);
const duplicates = [...new Set(codes.filter((code, index) => codes.indexOf(code) !== index))];
if (duplicates.length > 0) throw new Error(`同步后编号重复：${duplicates.join('、')}`);

fs.writeFileSync(finalImportPath, `${JSON.stringify(synchronized, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(root, 'import-manifests', 'final-import-sync-report.json'),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    previousRecordCount: previousRecords.length,
    recordCount: synchronized.length,
    addedRecordCount: Math.max(0, synchronized.length - previousRecords.length),
    canonicalCodeCount: synchronized.filter((record) => /^HE-[NHG]-[BSL]-[RGBAM]\d{2,}$/.test(record.heCode)).length,
  }, null, 2)}\n`,
  'utf8',
);

console.log(JSON.stringify({
  recordCount: synchronized.length,
  previousRecordCount: previousRecords.length,
  addedRecordCount: Math.max(0, synchronized.length - previousRecords.length),
  duplicateCount: duplicates.length,
}, null, 2));
