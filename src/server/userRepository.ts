import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { formatHECodeForDisplay, validateHECode } from '../lib/classification.js';
import { getFirestoreDb } from './patternRepository.js';

type RequestHeaders = Record<string, string | string[] | undefined>;

type UserProfilePatch = {
  displayName?: unknown;
  favoriteCodes?: unknown;
  event?: unknown;
  path?: unknown;
  patternCode?: unknown;
};

function getBearerToken(headers: RequestHeaders) {
  const authHeader = Array.isArray(headers.authorization) ? headers.authorization[0] : headers.authorization;
  return authHeader?.replace(/^Bearer\s+/i, '').trim() || '';
}

function normalizeTimestamp(value: unknown): unknown {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return value;
}

function normalizeProfileRecord(record: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, normalizeTimestamp(value)]));
}

function normalizeFavoriteCodes(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return [...new Set(value
    .filter((item): item is string => typeof item === 'string')
    .map(formatHECodeForDisplay)
    .filter(validateHECode))];
}

function getCleanString(value: unknown, maxLength = 280) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function verifyFirebaseUser(headers: RequestHeaders) {
  const token = getBearerToken(headers);
  if (!token) {
    const error = new Error('请先登录邮箱账号。');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }

  await getFirestoreDb();
  try {
    return await getAuth().verifyIdToken(token);
  } catch {
    const error = new Error('登录状态已过期，请重新登录。');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
}

export async function getCurrentUserProfile(headers: RequestHeaders) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Persistent database is not configured.');

  const user = await verifyFirebaseUser(headers);
  const doc = await db.collection('userProfiles').doc(user.uid).get();
  const stored = doc.exists ? normalizeProfileRecord(doc.data() || {}) : {};

  return {
    uid: user.uid,
    email: user.email || '',
    displayName: stored.displayName || user.name || '',
    emailVerified: Boolean(user.email_verified),
    favoriteCodes: Array.isArray(stored.favoriteCodes) ? stored.favoriteCodes : [],
    favoriteCount: Number(stored.favoriteCount || 0),
    visitCount: Number(stored.visitCount || 0),
    lastPath: stored.lastPath || '',
    lastPatternCode: stored.lastPatternCode || '',
    createdAt: stored.createdAt || null,
    updatedAt: stored.updatedAt || null,
    lastActiveAt: stored.lastActiveAt || null,
  };
}

export async function upsertCurrentUserProfile(headers: RequestHeaders, patch: UserProfilePatch = {}) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Persistent database is not configured.');

  const user = await verifyFirebaseUser(headers);
  const ref = db.collection('userProfiles').doc(user.uid);
  const snapshot = await ref.get();
  const favoriteCodes = normalizeFavoriteCodes(patch.favoriteCodes);
  const path = getCleanString(patch.path);
  const patternCode = getCleanString(patch.patternCode, 48);
  const displayName = getCleanString(patch.displayName, 80);
  const isPageView = patch.event === 'page_view';

  await ref.set({
    uid: user.uid,
    email: user.email || '',
    displayName: displayName || user.name || user.email || '',
    emailVerified: Boolean(user.email_verified),
    ...(favoriteCodes ? { favoriteCodes, favoriteCount: favoriteCodes.length } : {}),
    ...(path ? { lastPath: path } : {}),
    ...(patternCode ? { lastPatternCode: formatHECodeForDisplay(patternCode) } : {}),
    ...(isPageView ? { visitCount: FieldValue.increment(1) } : {}),
    ...(snapshot.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    updatedAt: FieldValue.serverTimestamp(),
    lastActiveAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return getCurrentUserProfile(headers);
}

export async function listUserProfiles(limit = 100) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Persistent database is not configured.');

  const snapshot = await db.collection('userProfiles').orderBy('lastActiveAt', 'desc').limit(Math.min(Math.max(limit, 1), 200)).get();
  const users = snapshot.docs.map((doc) => normalizeProfileRecord({ id: doc.id, ...doc.data() }));
  const totalUsers = users.length;
  const totalFavorites = users.reduce((sum, user) => sum + Number(user.favoriteCount || 0), 0);
  const totalVisits = users.reduce((sum, user) => sum + Number(user.visitCount || 0), 0);

  return { users, meta: { totalUsers, totalFavorites, totalVisits } };
}
