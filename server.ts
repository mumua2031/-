import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  assertAdminToken,
  createPattern,
  deletePattern,
  findPatternByCode,
  listPatterns,
  updatePattern,
  type PatternQuery,
} from './src/server/patternRepository';
import { deletePatternImage, uploadPatternImage } from './src/server/patternStorage';
import { uploadImageToGithub } from './src/server/githubImageStorage';

function parsePatternQuery(query: Record<string, unknown>): PatternQuery {
  return {
    keyword: typeof query.keyword === 'string' ? query.keyword : undefined,
    patternCategory: typeof query.patternCategory === 'string' ? query.patternCategory : undefined,
    meaningCategory: typeof query.meaningCategory === 'string' ? query.meaningCategory : undefined,
    colorCategory: typeof query.colorCategory === 'string' ? query.colorCategory : undefined,
    limit: typeof query.limit === 'string' ? Number(query.limit) || undefined : undefined,
  };
}

function sendApiError(res: express.Response, error: unknown, fallbackStatus = 500) {
  const statusCode = typeof error === 'object' && error && 'statusCode' in error
    ? Number((error as { statusCode?: number }).statusCode)
    : fallbackStatus;
  const message = error instanceof Error ? error.message : 'Internal server error';
  res.status(statusCode || fallbackStatus).json({ success: false, error: message });
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', async (_req, res) => {
    const { data, source } = await listPatterns({ limit: 1 });
    res.json({
      success: true,
      status: 'ok',
      patternSource: source,
      hasPatterns: data.length > 0,
      databaseConfigured: source === 'firestore',
    });
  });

  app.get('/api/patterns', async (req, res) => {
    try {
      const { data, source } = await listPatterns(parsePatternQuery(req.query));
      res.json({ success: true, data, meta: { count: data.length, source } });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/patterns/:heCode', async (req, res) => {
    try {
      const { data, source } = await findPatternByCode(req.params.heCode);
      if (!data) return res.status(404).json({ success: false, error: 'Pattern not found' });
      return res.json({ success: true, data, meta: { source } });
    } catch (error) {
      return sendApiError(res, error);
    }
  });

  app.post('/api/admin/patterns', async (req, res) => {
    try {
      assertAdminToken(req.headers);
      const id = await createPattern(req.body);
      res.json({ success: true, id });
    } catch (error) {
      sendApiError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
    }
  });

  app.put('/api/admin/patterns/:heCode', async (req, res) => {
    try {
      assertAdminToken(req.headers);
      const id = await updatePattern(req.params.heCode, req.body);
      res.json({ success: true, id });
    } catch (error) {
      sendApiError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
    }
  });

  app.delete('/api/admin/patterns/:heCode', async (req, res) => {
    try {
      assertAdminToken(req.headers);
      const pattern = await deletePattern(req.params.heCode);
      await deletePatternImage(pattern.storagePath);
      res.json({ success: true, id: pattern.id });
    } catch (error) {
      sendApiError(res, error, error instanceof Error && error.message.includes('Persistent database') ? 503 : 500);
    }
  });

  app.post('/api/admin/images', async (req, res) => {
    try {
      assertAdminToken(req.headers);
      const image = process.env.GITHUB_UPLOAD_TOKEN
        ? await uploadImageToGithub(req.body || {})
        : await uploadPatternImage(req.body || {});
      res.status(201).json({ success: true, data: image });
    } catch (error) {
      sendApiError(res, error, 500);
    }
  });

  app.post('/api/analyze-image', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
      }

      const { image, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: 'No image provided.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
          parts: [
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: image } },
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

      res.json({ success: true, result: JSON.parse(response.text || '{}') });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
