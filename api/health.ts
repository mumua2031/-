import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({
    success: true,
    status: 'ok',
    api: 'available',
    firebaseProjectConfigured: Boolean(process.env.FIREBASE_PROJECT_ID),
    firebaseServiceAccountConfigured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)),
    firebaseStorageConfigured: Boolean(process.env.FIREBASE_STORAGE_BUCKET),
    adminTokenConfigured: Boolean(process.env.ADMIN_API_TOKEN),
    githubUploadConfigured: Boolean(process.env.GITHUB_UPLOAD_TOKEN && process.env.GITHUB_REPOSITORY),
    githubBranch: process.env.GITHUB_BRANCH?.trim() || 'main',
  }));
}
