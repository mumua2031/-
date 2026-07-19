import type { ApiRequest, ApiResponse } from '../_utils.js';
import { assertAdminToken, sendError, sendJson, unsupportedMethod } from '../_utils.js';
import { listUserProfiles } from '../../src/server/userRepository.js';

function getLimit(query: ApiRequest['query']) {
  const raw = Array.isArray(query?.limit) ? query.limit[0] : query?.limit;
  return raw ? Number(raw) || 100 : 100;
}

function getPage(query: ApiRequest['query']) {
  const raw = Array.isArray(query?.page) ? query.page[0] : query?.page;
  return raw ? Number(raw) || 1 : 1;
}

function getKeyword(query: ApiRequest['query']) {
  const raw = Array.isArray(query?.keyword) ? query.keyword[0] : query?.keyword;
  return raw || '';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'GET') return unsupportedMethod(res);

    assertAdminToken(req.headers);
    const data = await listUserProfiles({
      limit: getLimit(req.query),
      page: getPage(req.query),
      keyword: getKeyword(req.query),
    });
    return sendJson(res, 200, { success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
}
