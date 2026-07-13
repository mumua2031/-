import { GoogleGenAI } from '@google/genai';
import type { ApiRequest, ApiResponse } from './_utils';
import { sendError, unsupportedMethod } from './_utils';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return unsupportedMethod(res);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });

    const body = req.body as { image?: string; mimeType?: string };
    if (!body?.image) return res.status(400).json({ success: false, error: 'No image provided.' });

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

    return res.json({ success: true, result: JSON.parse(response.text || '{}') });
  } catch (error) {
    return sendError(res, error);
  }
}
