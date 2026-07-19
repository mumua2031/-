export const adminTokenStorageKey = 'hanxiu:admin-token';
const legacyAdminTokenStorageKey = 'hanxiu-admin-token';

export function readStoredAdminToken() {
  if (typeof window === 'undefined') return '';
  const sessionToken = sessionStorage.getItem(adminTokenStorageKey) || '';
  if (sessionToken) return sessionToken;

  const localToken = localStorage.getItem(adminTokenStorageKey) || localStorage.getItem(legacyAdminTokenStorageKey) || '';
  if (localToken) {
    localStorage.setItem(adminTokenStorageKey, localToken);
    localStorage.removeItem(legacyAdminTokenStorageKey);
  }
  return localToken;
}

export function storeAdminToken(token: string, remember = false) {
  if (typeof window === 'undefined') return;
  const cleanToken = token.trim();
  sessionStorage.setItem(adminTokenStorageKey, cleanToken);
  if (remember) localStorage.setItem(adminTokenStorageKey, cleanToken);
  else localStorage.removeItem(adminTokenStorageKey);
  localStorage.removeItem(legacyAdminTokenStorageKey);
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(adminTokenStorageKey);
  localStorage.removeItem(adminTokenStorageKey);
  localStorage.removeItem(legacyAdminTokenStorageKey);
}

export async function verifyAdminToken(token: string) {
  const response = await fetch('/api/admin/session', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token.trim()}`,
    },
  });
  const payload = await response.json().catch(() => null) as { success?: boolean; error?: string } | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || '管理员身份校验失败，请检查 ADMIN_API_TOKEN。');
  }
  return true;
}
