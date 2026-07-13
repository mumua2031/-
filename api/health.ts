import type { ApiRequest, ApiResponse } from './_utils';
import { unsupportedMethod } from './_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return unsupportedMethod(res);

  return res.json({
    success: true,
    status: 'ok',
    api: 'available',
    firebaseProjectConfigured: Boolean(process.env.FIREBASE_PROJECT_ID),
    firebaseServiceAccountConfigured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)),
    adminTokenConfigured: Boolean(process.env.ADMIN_API_TOKEN),
  });
}
