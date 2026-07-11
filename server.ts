import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'gen-lang-client-0446963755'
});

const firestoreDb = getFirestore();
firestoreDb.settings({ databaseId: 'ai-studio-c15e0efa-10a9-4c13-960f-65e19b9286a6' });

async function startServer() {

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.get('/', (_req, res) => {
    res.redirect('/hanxiu');
  });

  // RESTful APIs
  
  // 1. Get Patterns List
  app.get('/api/patterns', async (req, res) => {
    try {
      const snapshot = await firestoreDb.collection('patterns').orderBy('createdAt', 'desc').get();
      const patterns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ success: true, data: patterns });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 2. Get Pattern Detail by HE Code
  app.get('/api/patterns/:heCode', async (req, res) => {
    try {
      const snapshot = await firestoreDb.collection('patterns').where('heCode', '==', req.params.heCode).limit(1).get();
      if (snapshot.empty) {
        return res.status(404).json({ success: false, error: 'Pattern not found' });
      }
      res.json({ success: true, data: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 3. Admin: Add Pattern
  app.post('/api/patterns', async (req, res) => {
    try {
      // In a real scenario, check admin auth token here
      const docRef = await firestoreDb.collection('patterns').add({
        ...req.body,
        createdAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true, id: docRef.id });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 4. Analyze Image with Gemini
  app.post('/api/analyze-image', async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: 'No image provided' });
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image,
        },
      };
      
      const textPart = {
        text: `Analyze this image (a traditional Chinese Han Embroidery pattern) and classify its features based on the following rules:
1. Category (大类): N(自然/Nature), H(人文/Humanities), or G(几何/Geometric)
2. Symbolism (寓意): B(祈福/Blessing), S(信仰/Belief), or L(生活/Life)
3. Dominant Color (色彩): R(红/Red), G(绿/Green), B(蓝/Blue), A(金/Gold), or M(多色/Multi)

Respond strictly in valid JSON format:
{
  "category": "N|H|G",
  "symbolism": "B|S|L",
  "color": "R|G|B|A|M",
  "description": "Brief analysis of why these categories were chosen."
}`,
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json({ success: true, result });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
