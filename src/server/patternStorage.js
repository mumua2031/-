import { randomUUID } from "node:crypto";
import { getFirestoreDb } from "./patternRepository.js";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
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
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw createError("\u56FE\u7247\u5FC5\u987B\u5C0F\u4E8E 10 MB\u3002", 413);
  return buffer;
}
async function uploadPatternImage(input) {
  const db = await getFirestoreDb();
  if (!db) throw createError("\u6301\u4E45\u5316\u6570\u636E\u5E93\u5C1A\u672A\u914D\u7F6E\uFF0C\u65E0\u6CD5\u4FDD\u5B58\u56FE\u7247\u3002", 503);
  if (typeof input.mimeType !== "string" || !allowedMimeTypes.has(input.mimeType)) throw createError("\u4EC5\u652F\u6301 PNG\u3001JPG \u56FE\u7247\u3002", 415);
  if (typeof input.heCode !== "string" || !/^HE-[NHG]-[BSL]-[RGBAM]\d{2,}$/.test(input.heCode)) throw createError("\u56FE\u7247\u7F16\u53F7\u683C\u5F0F\u65E0\u6548\u3002", 400);
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw createError("\u672A\u914D\u7F6E FIREBASE_STORAGE_BUCKET\uFF0C\u65E0\u6CD5\u4FDD\u5B58\u56FE\u7247\u3002", 503);
  const extension = input.mimeType === "image/png" ? "png" : "jpg";
  const storagePath = `patterns/${input.heCode}/${randomUUID()}.${extension}`;
  const token = randomUUID();
  const { getStorage } = await import("firebase-admin/storage");
  const bucket = getStorage().bucket(bucketName);
  const file = bucket.file(storagePath);
  await file.save(decodeImage(input.image), {
    resumable: false,
    metadata: {
      contentType: input.mimeType,
      cacheControl: "public,max-age=31536000,immutable",
      metadata: { firebaseStorageDownloadTokens: token }
    }
  });
  return {
    storagePath,
    imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`
  };
}
async function deletePatternImage(storagePath) {
  if (typeof storagePath !== "string" || !storagePath.startsWith("patterns/")) return;
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) return;
  const { getStorage } = await import("firebase-admin/storage");
  await getStorage().bucket(bucketName).file(storagePath).delete({ ignoreNotFound: true });
}
export {
  deletePatternImage,
  uploadPatternImage
};
