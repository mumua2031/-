import { randomUUID } from 'node:crypto';
import { getFirestoreDb } from './patternRepository.js';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/png']);

function createError(message: string, statusCode: number) {
  const error = new Error(message);
  Object.assign(error, { statusCode });
  return error;
}

function decodeImage(base64: unknown) {
  if (typeof base64 !== 'string' || !base64.trim()) throw createError('缺少图片数据。', 400);
  const normalized = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) throw createError('图片数据格式无效。', 400);
  const buffer = Buffer.from(normalized, 'base64');
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw createError('图片必须小于 10 MB。', 413);
  return buffer;
}

export async function uploadPatternImage(input: { image?: unknown; mimeType?: unknown; heCode?: unknown }) {
  const db = await getFirestoreDb();
  if (!db) throw createError('持久化数据库尚未配置，无法保存图片。', 503);
  if (typeof input.mimeType !== 'string' || !allowedMimeTypes.has(input.mimeType)) throw createError('仅支持 PNG、JPG 图片。', 415);
  if (typeof input.heCode !== 'string' || !/^HE-[NHG]-[BSL]-[RGBAM]\d{2,}$/.test(input.heCode)) throw createError('图片编号格式无效。', 400);

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw createError('未配置 FIREBASE_STORAGE_BUCKET，无法保存图片。', 503);

  const extension = input.mimeType === 'image/png' ? 'png' : 'jpg';
  const storagePath = `patterns/${input.heCode}/${randomUUID()}.${extension}`;
  const token = randomUUID();
  const { getStorage } = await import('firebase-admin/storage');
  const bucket = getStorage().bucket(bucketName);
  const file = bucket.file(storagePath);
  await file.save(decodeImage(input.image), {
    resumable: false,
    metadata: {
      contentType: input.mimeType,
      cacheControl: 'public,max-age=31536000,immutable',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return {
    storagePath,
    imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`,
  };
}

export async function deletePatternImage(storagePath: unknown) {
  if (typeof storagePath !== 'string' || !storagePath.startsWith('patterns/')) return;
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) return;
  const { getStorage } = await import('firebase-admin/storage');
  await getStorage().bucket(bucketName).file(storagePath).delete({ ignoreNotFound: true });
}
