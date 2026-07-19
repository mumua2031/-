import type { User } from 'firebase/auth';
import { formatHECodeForDisplay, validateHECode } from './classification';

export const favoritesUpdatedEvent = 'hanxiu:favorites-updated';
export const openFavoritesEvent = 'hanxiu:open-favorites';

type UserProfile = {
  favoriteCodes?: unknown;
};

function getFavoriteStorageKey(user: User | null) {
  return user?.uid ? `hanxiu:favorites:${user.uid}` : 'hanxiu:favorites:guest';
}

function normalizeFavoriteCodes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .filter((code): code is string => typeof code === 'string')
      .map(formatHECodeForDisplay)
      .filter(validateHECode),
  )];
}

async function getAuthHeaders(user: User) {
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function readJsonPayload<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || fallbackMessage);
  }

  if (!response.ok || (payload && typeof payload === 'object' && 'success' in payload && !payload.success)) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      ? String((payload as { error?: unknown }).error)
      : fallbackMessage;
    throw new Error(message);
  }

  return payload as T;
}

export function readLocalFavorites(user: User | null) {
  try {
    const stored = JSON.parse(localStorage.getItem(getFavoriteStorageKey(user)) || '[]') as unknown;
    return normalizeFavoriteCodes(stored);
  } catch {
    return [];
  }
}

export function writeLocalFavorites(user: User | null, favoriteCodes: string[]) {
  const normalized = normalizeFavoriteCodes(favoriteCodes);
  localStorage.setItem(getFavoriteStorageKey(user), JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(favoritesUpdatedEvent));
  return normalized;
}

export async function loadUserFavorites(user: User | null) {
  const localCodes = readLocalFavorites(user);
  if (!user) return localCodes;

  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: await getAuthHeaders(user),
    });
    const payload = await readJsonPayload<{ data?: UserProfile }>(response, '读取用户收藏失败。');
    const remoteCodes = normalizeFavoriteCodes(payload.data?.favoriteCodes);
    const merged = normalizeFavoriteCodes([...remoteCodes, ...localCodes]);
    writeLocalFavorites(user, merged);
    if (merged.length !== remoteCodes.length || merged.some((code) => !remoteCodes.includes(code))) {
      void saveUserFavorites(user, merged);
    }
    return merged;
  } catch {
    return localCodes;
  }
}

export async function saveUserFavorites(user: User, favoriteCodes: string[]) {
  const normalized = writeLocalFavorites(user, favoriteCodes);
  const response = await fetch('/api/users/me', {
    method: 'PUT',
    headers: await getAuthHeaders(user),
    body: JSON.stringify({ favoriteCodes: normalized }),
  });
  await readJsonPayload(response, '保存用户收藏失败。');
  return normalized;
}

export async function syncUserProfile(user: User) {
  const response = await fetch('/api/users/me', {
    method: 'PUT',
    headers: await getAuthHeaders(user),
    body: JSON.stringify({ displayName: user.displayName || user.email || '' }),
  });
  await readJsonPayload(response, '同步用户资料失败。');
}

export async function recordUserPageView(user: User | null, path: string, patternCode?: string) {
  if (!user) return;
  const throttleKey = `hanxiu:page-view:${user.uid}:${path}`;
  const now = Date.now();
  try {
    const lastRecordedAt = Number(sessionStorage.getItem(throttleKey) || 0);
    if (now - lastRecordedAt < 5 * 60 * 1000) return;
    sessionStorage.setItem(throttleKey, String(now));
  } catch {
    // sessionStorage 不可用时仍允许记录一次，不影响浏览。
  }

  try {
    const response = await fetch('/api/users/me', {
      method: 'POST',
      headers: await getAuthHeaders(user),
      body: JSON.stringify({ event: 'page_view', path, patternCode }),
    });
    await readJsonPayload(response, '记录访问失败。');
  } catch {
    // 访问记录不影响前台浏览；后台配置未完成时静默降级。
  }
}
