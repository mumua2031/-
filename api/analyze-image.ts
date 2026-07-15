import { GoogleGenAI } from '@google/genai';
import type { ApiRequest, ApiResponse } from './_utils.js';
import { sendError, sendJson, unsupportedMethod } from './_utils.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return unsupportedMethod(res);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return sendJson(res, 503, { success: false, error: 'GEMINI_API_KEY is not configured.' });

    const body = req.body as { image?: string; mimeType?: string };
    if (!body?.image) return sendJson(res, 400, { success: false, error: 'No image provided.' });

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType: body.mimeType || 'image/jpeg', data: body.image } },
          {
            text: [
              'Analyze this traditional Chinese Han embroidery pattern.',
              'Return strict JSON with keys category, symbolism, color and description.',
              'category must be N, H or G.',
              'symbolism must be B, S or L.',
              'color must be R, G, B, A or M.',
              'Do not invent unverifiable historical facts.',
            ].join('\n'),
          },
        ],
      },
      config: { responseMimeType: 'application/json' },
    });

    try {
      return sendJson(res, 200, { success: true, result: JSON.parse(response.text || '{}') });
    } catch {
      return sendJson(res, 502, { success: false, error: 'AI 识别结果格式异常，请先手动选择分类。' });
    }
  } catch (error) {
    return sendError(res, error);
  }
}
