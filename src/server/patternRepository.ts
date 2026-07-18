import type { Firestore } from 'firebase-admin/firestore';
import { mockPatterns } from '../data.js';
import type { PatternGene } from '../types.js';
import { validateHECode } from '../lib/classification.js';

type PatternRecord = PatternGene & Record<string, unknown>;

export type PatternQuery = {
  keyword?: string;
  patternCategory?: string;
  meaningCategory?: string;
  colorCategory?: string;
  limit?: number;
};

let cachedDb: Firestore | null | undefined;
let cachedAdminModules: Promise<{
  cert: typeof import('firebase-admin/app').cert;
  getApps: typeof import('firebase-admin/app').getApps;
  initializeApp: typeof import('firebase-admin/app').initializeApp;
  getFirestore: typeof import('firebase-admin/firestore').getFirestore;
  FieldValue: typeof import('firebase-admin/firestore').FieldValue;
}> | null = null;

function getFirebaseAdminModules() {
  cachedAdminModules ||= Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/firestore'),
  ]).then(([app, firestore]) => ({
    cert: app.cert,
    getApps: app.getApps,
    initializeApp: app.initializeApp,
    getFirestore: firestore.getFirestore,
    FieldValue: firestore.FieldValue,
  }));
  return cachedAdminModules;
}

function normalizePrivateKey(value?: string) {
  return value?.replace(/\\n/g, '\n');
}

function normalizeFirebaseProjectId(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === 'string') return normalizeFirebaseProjectId(parsed);
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      return normalizeFirebaseProjectId(String(record.project_id || record.projectId || ''));
    }
  } catch {
    // The Vercel field may contain a copied line such as `"project_id": "..."`.
  }

  const projectIdMatch = trimmed.match(/["']?project_?id["']?\s*[:=]\s*["']?([a-z][a-z0-9-]{4,28}[a-z0-9])["']?/i);
  if (projectIdMatch) return projectIdMatch[1];

  const assignmentMatch = trimmed.match(/^FIREBASE_PROJECT_ID\s*=\s*["']?(.+?)["']?$/i);
  const cleaned = (assignmentMatch?.[1] || trimmed)
    .replace(/^["']|["']$/g, '')
    .replace(/,$/, '')
    .trim();

  return cleaned || undefined;
}

function getServiceAccountProjectId() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return undefined;
  return normalizeFirebaseProjectId(serviceAccountJson);
}

async function getServiceAccountCredential() {
  try {
    const { cert } = await getFirebaseAdminModules();
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      return cert({
        projectId: normalizeFirebaseProjectId(parsed.project_id || parsed.projectId || serviceAccountJson),
        clientEmail: parsed.client_email || parsed.clientEmail,
        privateKey: normalizePrivateKey(parsed.private_key || parsed.privateKey),
      });
    }

    const envProjectId = normalizeFirebaseProjectId(process.env.FIREBASE_PROJECT_ID);
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && envProjectId) {
      return cert({
        projectId: envProjectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      });
    }
  } catch (error) {
    console.warn('Firebase service account is invalid. Falling back to local pattern data.', error);
  }

  return null;
}

export async function getFirestoreDb() {
  if (cachedDb !== undefined) return cachedDb;

  try {
    const credential = await getServiceAccountCredential();
    const projectId = normalizeFirebaseProjectId(process.env.FIREBASE_PROJECT_ID) || getServiceAccountProjectId();

    if (!credential || !projectId) {
      cachedDb = null;
      return cachedDb;
    }

    const { getApps, initializeApp, getFirestore } = await getFirebaseAdminModules();
    if (!getApps().length) {
      initializeApp({ credential, projectId });
    }

    cachedDb = getFirestore();
    const databaseId = process.env.FIREBASE_DATABASE_ID;
    if (databaseId) cachedDb.settings({ databaseId });
    return cachedDb;
  } catch (error) {
    console.warn('Firestore is unavailable. Falling back to local pattern data.', error);
    cachedDb = null;
    return cachedDb;
  }
}

async function getRequiredFirestoreDb() {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Persistent database is not configured.');
  return db;
}

function normalizeFirestoreValue(value: unknown): unknown {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) return value.map(normalizeFirestoreValue);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, normalizeFirestoreValue(nested)]),
    );
  }

  return value;
}

function normalizeEraForArchive(value?: unknown) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  const compact = text.replace(/\s+/g, '');

  const contemporaryReference = compact.match(/^当代(?:复原)?[（(]参考(.+?)[）)]$/);
  if (contemporaryReference?.[1]) return `当代（参考${contemporaryReference[1]}）`;
  if (compact === '当代复原') return '当代';
  if (compact === '当代采集，具体年代待考') return '具体年代待考';
  if (/^近现代.*戏衣/.test(compact)) return '近现代';
  if (compact === '清代民间婚嫁绣片') return '清代';

  if (/当代/.test(compact)) return '当代';
  if (/清末.*民国|民国.*清末/.test(compact)) return '清末民国';
  if (/清代.*近现代|近现代.*清代/.test(compact)) return '清代至近现代';
  if (/近代.*民国|民国.*近代/.test(compact)) return '近代民国';
  if (/20世纪50|1950|五十年代|50年代/.test(compact)) return '1950年代';
  if (/战国/.test(compact)) return '战国';
  if (/秦汉/.test(compact)) return '秦汉';
  if (/唐宋/.test(compact)) return '唐宋';
  if (/宋元/.test(compact)) return '宋元';
  if (/元明/.test(compact)) return '元明';
  if (/明清/.test(compact)) return '明清';
  if (/清代|清朝|清/.test(compact)) return '清代';
  if (/明代|明朝|明/.test(compact)) return '明代';
  if (/民国/.test(compact)) return '民国';
  if (/近现代/.test(compact)) return '近现代';
  if (/近代/.test(compact)) return '近代';
  if (/现代/.test(compact)) return '现代';
  if (/传统/.test(compact)) return '传统';
  if (/待考|不详|未知/.test(compact)) return '待考';

  return text.split(/[，,。.；;：:（(]/)[0].trim();
}

function normalizePattern(record: PatternRecord) {
  const pattern = normalizeFirestoreValue(record) as PatternGene;
  return {
    ...pattern,
    era: normalizeEraForArchive(pattern.era) || pattern.era,
  };
}

function buildSearchText(pattern: PatternGene) {
  return [
    pattern.heCode,
    pattern.name?.['zh-CN'],
    pattern.name?.en,
    pattern.era,
    pattern.carrier,
    pattern.region,
    pattern.craft?.['zh-CN'],
    pattern.craft?.en,
    pattern.symbolism?.['zh-CN'],
    pattern.symbolism?.en,
    pattern.origin?.['zh-CN'],
    pattern.origin?.en,
    pattern.literature?.['zh-CN'],
    pattern.literature?.en,
    pattern.inheritor?.['zh-CN'],
    pattern.inheritor?.en,
    pattern.copyrightOwner,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function applyQuery(patterns: PatternGene[], query: PatternQuery) {
  const keyword = query.keyword?.trim().toLowerCase();

  const filtered = patterns.filter((pattern) => {
    if (query.patternCategory && pattern.patternCategory !== query.patternCategory) return false;
    if (query.meaningCategory && pattern.meaningCategory !== query.meaningCategory) return false;
    if (query.colorCategory && pattern.colorCategory !== query.colorCategory) return false;
    if (keyword && !buildSearchText(pattern).includes(keyword)) return false;
    return true;
  });

  return query.limit ? filtered.slice(0, query.limit) : filtered;
}

export async function listPatterns(query: PatternQuery = {}) {
  const db = await getFirestoreDb();

  if (!db) {
    return { data: applyQuery(mockPatterns.map((pattern) => normalizePattern(pattern as PatternRecord)), query), source: 'local' as const };
  }

  try {
    const snapshot = await db.collection('patterns').orderBy('createdAt', 'desc').get();
    const records = snapshot.docs.map((doc) => normalizePattern({ id: doc.id, ...doc.data() } as PatternRecord));
    // 保留随站点发布的历史图库；数据库中的同编号资料拥有更高优先级，新增记录直接追加。
    const mergedByCode = new Map(mockPatterns.map((pattern) => {
      const normalizedPattern = normalizePattern(pattern as PatternRecord);
      return [normalizedPattern.heCode, normalizedPattern] as const;
    }));
    records.forEach((pattern) => {
      const record = pattern as PatternGene & { previousHeCode?: unknown };
      const previousHeCode = typeof record.previousHeCode === 'string' ? record.previousHeCode : '';
      if (previousHeCode && previousHeCode !== pattern.heCode) mergedByCode.delete(previousHeCode);
      mergedByCode.set(pattern.heCode, pattern);
    });
    const data = [...mergedByCode.values()];
    return { data: applyQuery(data, query), source: records.length > 0 ? ('firestore' as const) : ('local' as const) };
  } catch (error) {
    console.warn('Failed to read Firestore patterns. Falling back to local data.', error);
    return { data: applyQuery(mockPatterns.map((pattern) => normalizePattern(pattern as PatternRecord)), query), source: 'local' as const };
  }
}

export async function findPatternByCode(heCode: string) {
  const db = await getFirestoreDb();

  if (db) {
    try {
      const snapshot = await db.collection('patterns').where('heCode', '==', heCode).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { data: normalizePattern({ id: doc.id, ...doc.data() } as PatternRecord), source: 'firestore' as const };
      }
    } catch (error) {
      console.warn('Failed to read Firestore pattern detail. Falling back to local data.', error);
    }
  }

  const data = mockPatterns.find((pattern) => pattern.heCode === heCode || pattern.id === heCode);
  if (data) return { data: normalizePattern(data as PatternRecord), source: 'local' as const };
  return { data: null, source: 'local' as const };
}

export async function createPattern(pattern: Partial<PatternGene>) {
  const db = await getRequiredFirestoreDb();
  const { FieldValue } = await getFirebaseAdminModules();
  if (!pattern.heCode || !validateHECode(pattern.heCode)) {
    const error = new Error('HE 编号格式必须为 HE-N-B-R01。');
    Object.assign(error, { statusCode: 400 });
    throw error;
  }
  if (!pattern.name?.['zh-CN']?.trim() || !pattern.imageUrl) {
    const error = new Error('纹样名称和图片不能为空。');
    Object.assign(error, { statusCode: 400 });
    throw error;
  }
  const docRef = db.collection('patterns').doc(pattern.heCode);
  const normalizedPattern = {
    ...pattern,
    era: normalizeEraForArchive(pattern.era) || '具体年代待考',
  };
  try {
    await docRef.create({
      ...normalizedPattern,
      id: pattern.heCode,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    if (error instanceof Error && /already exists|ALREADY_EXISTS|6/i.test(error.message)) {
      const duplicateError = new Error(`编号 ${pattern.heCode} 已存在，请刷新数据后重新生成编号。`);
      Object.assign(duplicateError, { statusCode: 409 });
      throw duplicateError;
    }
    throw error;
  }
  return docRef.id;
}

export async function updatePattern(heCode: string, patch: Partial<PatternGene>) {
  const db = await getRequiredFirestoreDb();
  const { FieldValue } = await getFirebaseAdminModules();
  const snapshot = await db.collection('patterns').where('heCode', '==', heCode).limit(1).get();
  const normalizedPatch = {
    ...patch,
    ...(Object.prototype.hasOwnProperty.call(patch, 'era') ? { era: normalizeEraForArchive(patch.era) || '具体年代待考' } : {}),
  } as PatternRecord;

  if (snapshot.empty) {
    const localPattern = mockPatterns.find((pattern) => pattern.heCode === heCode || pattern.id === heCode);
    if (!localPattern) throw new Error('Pattern not found.');

    const mergedPattern = {
      ...normalizePattern(localPattern as PatternRecord),
      ...normalizedPatch,
    } as PatternRecord;
    const nextHeCode = typeof mergedPattern.heCode === 'string' && mergedPattern.heCode ? mergedPattern.heCode : heCode;
    const docRef = db.collection('patterns').doc(nextHeCode);
    await docRef.set({
      ...mergedPattern,
      id: nextHeCode,
      heCode: nextHeCode,
      previousHeCode: heCode,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return docRef.id;
  }

  await snapshot.docs[0].ref.set({ ...normalizedPatch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return snapshot.docs[0].id;
}

export async function deletePattern(heCode: string) {
  const db = await getRequiredFirestoreDb();
  const snapshot = await db.collection('patterns').where('heCode', '==', heCode).limit(1).get();
  if (snapshot.empty) {
    const error = new Error('Pattern not found.');
    Object.assign(error, { statusCode: 404 });
    throw error;
  }
  const doc = snapshot.docs[0];
  await doc.ref.delete();
  return normalizeFirestoreValue({ id: doc.id, ...doc.data() }) as PatternRecord;
}

export function assertAdminToken(headers: Record<string, string | string[] | undefined>) {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) {
    const error = new Error('管理员写入尚未配置，请先设置 ADMIN_API_TOKEN。');
    Object.assign(error, { statusCode: 503 });
    throw error;
  }

  const authHeader = Array.isArray(headers.authorization) ? headers.authorization[0] : headers.authorization;
  const tokenHeader = Array.isArray(headers['x-admin-token']) ? headers['x-admin-token'][0] : headers['x-admin-token'];
  const token = authHeader?.replace(/^Bearer\s+/i, '') || tokenHeader;

  if (token !== configuredToken) {
    const error = new Error('Unauthorized');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
}
