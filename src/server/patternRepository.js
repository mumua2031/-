import { mockPatterns } from "../data.js";
import { validateHECode } from "../lib/classification.js";
let cachedDb;
let cachedAdminModules = null;
function getFirebaseAdminModules() {
  cachedAdminModules ||= Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/firestore")
  ]).then(([app, firestore]) => ({
    cert: app.cert,
    getApps: app.getApps,
    initializeApp: app.initializeApp,
    getFirestore: firestore.getFirestore,
    FieldValue: firestore.FieldValue
  }));
  return cachedAdminModules;
}
function normalizePrivateKey(value) {
  return value?.replace(/\\n/g, "\n");
}
function normalizeFirebaseProjectId(value) {
  const trimmed = value?.trim();
  if (!trimmed) return void 0;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") return normalizeFirebaseProjectId(parsed);
    if (parsed && typeof parsed === "object") {
      const record = parsed;
      return normalizeFirebaseProjectId(String(record.project_id || record.projectId || ""));
    }
  } catch {
  }
  const projectIdMatch = trimmed.match(/["']?project_?id["']?\s*[:=]\s*["']?([a-z][a-z0-9-]{4,28}[a-z0-9])["']?/i);
  if (projectIdMatch) return projectIdMatch[1];
  const assignmentMatch = trimmed.match(/^FIREBASE_PROJECT_ID\s*=\s*["']?(.+?)["']?$/i);
  const cleaned = (assignmentMatch?.[1] || trimmed).replace(/^["']|["']$/g, "").replace(/,$/, "").trim();
  return cleaned || void 0;
}
function getServiceAccountProjectId() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return void 0;
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
        privateKey: normalizePrivateKey(parsed.private_key || parsed.privateKey)
      });
    }
    const envProjectId = normalizeFirebaseProjectId(process.env.FIREBASE_PROJECT_ID);
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && envProjectId) {
      return cert({
        projectId: envProjectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
      });
    }
  } catch (error) {
    console.warn("Firebase service account is invalid. Falling back to local pattern data.", error);
  }
  return null;
}
async function getFirestoreDb() {
  if (cachedDb !== void 0) return cachedDb;
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
    console.warn("Firestore is unavailable. Falling back to local pattern data.", error);
    cachedDb = null;
    return cachedDb;
  }
}
async function getRequiredFirestoreDb() {
  const db = await getFirestoreDb();
  if (!db) throw new Error("Persistent database is not configured.");
  return db;
}
function normalizeFirestoreValue(value) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(normalizeFirestoreValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalizeFirestoreValue(nested)])
    );
  }
  return value;
}
function normalizePattern(record) {
  return normalizeFirestoreValue(record);
}
function buildSearchText(pattern) {
  return [
    pattern.heCode,
    pattern.name?.["zh-CN"],
    pattern.name?.en,
    pattern.era,
    pattern.carrier,
    pattern.region,
    pattern.craft?.["zh-CN"],
    pattern.craft?.en,
    pattern.symbolism?.["zh-CN"],
    pattern.symbolism?.en,
    pattern.origin?.["zh-CN"],
    pattern.origin?.en,
    pattern.literature?.["zh-CN"],
    pattern.literature?.en,
    pattern.inheritor?.["zh-CN"],
    pattern.inheritor?.en,
    pattern.copyrightOwner
  ].filter(Boolean).join(" ").toLowerCase();
}
function applyQuery(patterns, query) {
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
async function listPatterns(query = {}) {
  const db = await getFirestoreDb();
  if (!db) {
    return { data: applyQuery(mockPatterns, query), source: "local" };
  }
  try {
    const snapshot = await db.collection("patterns").orderBy("createdAt", "desc").get();
    const records = snapshot.docs.map((doc) => normalizePattern({ id: doc.id, ...doc.data() }));
    const mergedByCode = new Map(mockPatterns.map((pattern) => [pattern.heCode, pattern]));
    records.forEach((pattern) => mergedByCode.set(pattern.heCode, pattern));
    const data = [...mergedByCode.values()];
    return { data: applyQuery(data, query), source: records.length > 0 ? "firestore" : "local" };
  } catch (error) {
    console.warn("Failed to read Firestore patterns. Falling back to local data.", error);
    return { data: applyQuery(mockPatterns, query), source: "local" };
  }
}
async function findPatternByCode(heCode) {
  const db = await getFirestoreDb();
  if (db) {
    try {
      const snapshot = await db.collection("patterns").where("heCode", "==", heCode).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { data: normalizePattern({ id: doc.id, ...doc.data() }), source: "firestore" };
      }
    } catch (error) {
      console.warn("Failed to read Firestore pattern detail. Falling back to local data.", error);
    }
  }
  const data = mockPatterns.find((pattern) => pattern.heCode === heCode || pattern.id === heCode) || null;
  return { data, source: "local" };
}
async function createPattern(pattern) {
  const db = await getRequiredFirestoreDb();
  const { FieldValue } = await getFirebaseAdminModules();
  if (!pattern.heCode || !validateHECode(pattern.heCode)) {
    const error = new Error("HE \u7F16\u53F7\u683C\u5F0F\u5FC5\u987B\u4E3A HE-N-B-R01\u3002");
    Object.assign(error, { statusCode: 400 });
    throw error;
  }
  if (!pattern.name?.["zh-CN"]?.trim() || !pattern.imageUrl) {
    const error = new Error("\u7EB9\u6837\u540D\u79F0\u548C\u56FE\u7247\u4E0D\u80FD\u4E3A\u7A7A\u3002");
    Object.assign(error, { statusCode: 400 });
    throw error;
  }
  const docRef = db.collection("patterns").doc(pattern.heCode);
  try {
    await docRef.create({
      ...pattern,
      id: pattern.heCode,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    if (error instanceof Error && /already exists|ALREADY_EXISTS|6/i.test(error.message)) {
      const duplicateError = new Error(`\u7F16\u53F7 ${pattern.heCode} \u5DF2\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u6570\u636E\u540E\u91CD\u65B0\u751F\u6210\u7F16\u53F7\u3002`);
      Object.assign(duplicateError, { statusCode: 409 });
      throw duplicateError;
    }
    throw error;
  }
  return docRef.id;
}
async function updatePattern(heCode, patch) {
  const db = await getRequiredFirestoreDb();
  const { FieldValue } = await getFirebaseAdminModules();
  const snapshot = await db.collection("patterns").where("heCode", "==", heCode).limit(1).get();
  if (snapshot.empty) throw new Error("Pattern not found.");
  await snapshot.docs[0].ref.set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return snapshot.docs[0].id;
}
async function deletePattern(heCode) {
  const db = await getRequiredFirestoreDb();
  const snapshot = await db.collection("patterns").where("heCode", "==", heCode).limit(1).get();
  if (snapshot.empty) {
    const error = new Error("Pattern not found.");
    Object.assign(error, { statusCode: 404 });
    throw error;
  }
  const doc = snapshot.docs[0];
  await doc.ref.delete();
  return normalizeFirestoreValue({ id: doc.id, ...doc.data() });
}
function assertAdminToken(headers) {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) {
    const error = new Error("\u7BA1\u7406\u5458\u5199\u5165\u5C1A\u672A\u914D\u7F6E\uFF0C\u8BF7\u5148\u8BBE\u7F6E ADMIN_API_TOKEN\u3002");
    Object.assign(error, { statusCode: 503 });
    throw error;
  }
  const authHeader = Array.isArray(headers.authorization) ? headers.authorization[0] : headers.authorization;
  const tokenHeader = Array.isArray(headers["x-admin-token"]) ? headers["x-admin-token"][0] : headers["x-admin-token"];
  const token = authHeader?.replace(/^Bearer\s+/i, "") || tokenHeader;
  if (token !== configuredToken) {
    const error = new Error("Unauthorized");
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
}
export {
  assertAdminToken,
  createPattern,
  deletePattern,
  findPatternByCode,
  getFirestoreDb,
  listPatterns,
  updatePattern
};
