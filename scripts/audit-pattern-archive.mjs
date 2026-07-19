import fs from 'node:fs';
import { mockPatterns } from '../src/data.js';
import {
  getLegacyHECodeAliases,
  normalizePatternClassificationText,
  validateHECode,
} from '../src/lib/classification.js';

const finalImport = JSON.parse(fs.readFileSync(new URL('../import-manifests/final-import-patterns.json', import.meta.url), 'utf8'));
const codes = mockPatterns.map((pattern) => pattern.heCode);
const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
const invalid = codes.filter((code) => !validateHECode(code));
const classMismatch = mockPatterns.filter((pattern) => {
  const [, patternCategory, meaningCategory, colorAndSequence] = pattern.heCode.split('-');
  const colorCategory = colorAndSequence?.[0];
  return pattern.patternCategory !== patternCategory
    || pattern.meaningCategory !== meaningCategory
    || pattern.colorCategory !== colorCategory;
}).map((pattern) => pattern.heCode);
const importByCode = new Map(finalImport.map((pattern) => [pattern.heCode, pattern]));
const importMismatch = mockPatterns
  .filter((pattern) => JSON.stringify(pattern) !== JSON.stringify(importByCode.get(pattern.heCode)))
  .map((pattern) => pattern.heCode);
const aliasMismatch = mockPatterns
  .filter((pattern) => pattern.previousHeCode && !getLegacyHECodeAliases(pattern.heCode).includes(pattern.previousHeCode))
  .map((pattern) => pattern.heCode);
const textConflicts = mockPatterns
  .filter((pattern) => JSON.stringify(pattern) !== JSON.stringify(normalizePatternClassificationText(pattern)))
  .map((pattern) => pattern.heCode);
const missingImages = mockPatterns
  .filter((pattern) => pattern.imageUrl?.startsWith('/') && !fs.existsSync(new URL(`../public${pattern.imageUrl}`, import.meta.url)))
  .map((pattern) => pattern.heCode);

const result = {
  patternCount: mockPatterns.length,
  finalImportCount: finalImport.length,
  previousAliasCount: mockPatterns.filter((pattern) => pattern.previousHeCode).length,
  duplicates,
  invalid,
  classMismatch,
  importMismatch,
  aliasMismatch,
  missingImages,
  textConflicts,
};
console.log(JSON.stringify(result, null, 2));

if (
  finalImport.length !== mockPatterns.length
  || [duplicates, invalid, classMismatch, importMismatch, aliasMismatch, missingImages, textConflicts]
    .some((items) => items.length > 0)
) {
  process.exitCode = 1;
}
