import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { mockPatterns } from '../data';
import type { PatternGene } from '../types';

type PatternRecord = PatternGene & Record<string, unknown>;

export type PatternQuery = {
  keyword?: string;
  patternCategory?: string;
  meaningCategory?: string;
  colorCategory?: string;
  limit?: number;
};

let cachedDb: Firestore | null | undefined;

function normalizePrivateKey(value?: string) {
  return value?.replace(/\\n/g, '\n');
}

function getServiceAccountCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    return cert({
      projectId: parsed.project_id || parsed.projectId,
      clientEmail: parsed.client_email || parsed.clientEmail,
      privateKey: normalizePrivateKey(parsed.private_key || parsed.privateKey),
    });
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    });
  }

  return null;
}

export function getFirestoreDb() {
  if (cachedDb !== undefined) return cachedDb;

  const credential = getServiceAccountCredential();
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!credential || !projectId) {
    cachedDb = null;
    return cachedDb;
  }

  try {
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

function normalizePattern(record: PatternRecord) {
  return normalizeFirestoreValue(record) as PatternGene;
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
  const db = getFirestoreDb();

  if (!db) {
    return { data: applyQuery(mockPatterns, query), source: 'local' as const };
  }

  try {
    const snapshot = await db.collection('patterns').orderBy('createdAt', 'desc').get();
    const records = snapshot.docs.map((doc) => normalizePattern({ id: doc.id, ...doc.data() } as PatternRecord));
    const data = records.length > 0 ? records : mockPatterns;
    return { data: applyQuery(data, query), source: records.length > 0 ? ('firestore' as const) : ('local' as const) };
  } catch (error) {
    console.warn('Failed to read Firestore patterns. Falling back to local data.', error);
    return { data: applyQuery(mockPatterns, query), source: 'local' as const };
  }
}

export async function findPatternByCode(heCode: string) {
  const db = getFirestoreDb();

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

  const data = mockPatterns.find((pattern) => pattern.heCode === heCode || pattern.id === heCode) || null;
  return { data, source: 'local' as const };
}

export async function createPattern(pattern: Partial<PatternGene>) {
  const db = getFirestoreDb();
  if (!db) throw new Error('Persistent database is not configured.');
  const docRef = await db.collection('patterns').add({
    ...pattern,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePattern(heCode: string, patch: Partial<PatternGene>) {
  const db = getFirestoreDb();
  if (!db) throw new Error('Persistent database is not configured.');
  const snapshot = await db.collection('patterns').where('heCode', '==', heCode).limit(1).get();
  if (snapshot.empty) throw new Error('Pattern not found.');
  await snapshot.docs[0].ref.set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return snapshot.docs[0].id;
}

export function assertAdminToken(headers: Record<string, string | string[] | undefined>) {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) return;

  const authHeader = Array.isArray(headers.authorization) ? headers.authorization[0] : headers.authorization;
  const tokenHeader = Array.isArray(headers['x-admin-token']) ? headers['x-admin-token'][0] : headers['x-admin-token'];
  const token = authHeader?.replace(/^Bearer\s+/i, '') || tokenHeader;

  if (token !== configuredToken) {
    const error = new Error('Unauthorized');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
}
