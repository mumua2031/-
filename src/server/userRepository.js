import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { formatHECodeForDisplay, validateHECode } from '../lib/classification.js';
import { getFirestoreDb } from './patternRepository.js';

function getBearerToken(headers) {
  const authHeader = Array.isArray(headers.authorization) ? headers.authorization[0] : headers.authorization;
  return authHeader?.replace(/^Bearer\s+/i, '').trim() || '';
}

function normalizeTimestamp(value) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return value;
}

function normalizeProfileRecord(record) {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, normalizeTimestamp(value)]));
}

function normalizeFavoriteCodes(value) {
  if (!Array.isArray(value)) return undefined;
  return [...new Set(value
    .filter((item) => typeof item === 'string')
    .map(formatHECodeForDisplay)
    .filter(validateHECode))];
}

function getCleanString(value, maxLength = 280) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function verifyFirebaseUser(headers) {
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

export async function getCurrentUserProfile(headers) {
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

export async function upsertCurrentUserProfile(headers, patch = {}) {
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

export async function listUserProfiles(options = {}) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Persistent database is not configured.');

  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 100);
  const page = Math.max(Number(options.page) || 1, 1);
  const keyword = getCleanString(options.keyword, 120).toLowerCase();
  const snapshot = await db.collection('userProfiles').orderBy('lastActiveAt', 'desc').limit(500).get();
  const allUsers = snapshot.docs.map((doc) => normalizeProfileRecord({ id: doc.id, ...doc.data() }));
  const filteredUsers = keyword
    ? allUsers.filter((user) => {
      const haystack = [
        user.email,
        user.displayName,
        user.lastPath,
        user.lastPatternCode,
      ].map((value) => String(value || '').toLowerCase()).join(' ');
      return haystack.includes(keyword);
    })
    : allUsers;
  const startIndex = (page - 1) * limit;
  const users = filteredUsers.slice(startIndex, startIndex + limit).map((user) => ({
    id: user.id,
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    favoriteCount: Number(user.favoriteCount || 0),
    visitCount: Number(user.visitCount || 0),
    lastPath: user.lastPath || '',
    lastPatternCode: user.lastPatternCode || '',
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    lastActiveAt: user.lastActiveAt || null,
  }));
  const totalUsers = filteredUsers.length;
  const totalFavorites = filteredUsers.reduce((sum, user) => sum + Number(user.favoriteCount || 0), 0);
  const totalVisits = filteredUsers.reduce((sum, user) => sum + Number(user.visitCount || 0), 0);

  return {
    users,
    meta: {
      totalUsers,
      totalFavorites,
      totalVisits,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(totalUsers / limit)),
    },
  };
}
