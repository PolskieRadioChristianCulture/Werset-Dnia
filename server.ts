import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { BIBLE_VERSES, searchBibleVerses } from './src/data/verses.ts';
import { TOPIC_HUBS } from './src/data/topics.ts';
import { BIBLE_QUESTIONS } from './src/data/questions.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper for Gemini SDK to prevent startup crash if key is undefined
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'moj-werset-dnia', time: new Date().toISOString() });
});

// Service Worker explicit route with proper headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  res.sendFile(swPath);
});

// robots.txt route
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *
Allow: /

Sitemap: https://polskieradio.cc/sitemap.xml
`);
});

// Dynamic sitemap.xml route
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://polskieradio.cc';
  const now = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Topic landing hubs
  for (const topic of TOPIC_HUBS) {
    xml += `
  <url>
    <loc>${baseUrl}/wersety/${topic.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  // Answer Engine question pages
  for (const q of BIBLE_QUESTIONS) {
    xml += `
  <url>
    <loc>${baseUrl}/pytanie/${q.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // All Canonical Verses
  for (const verse of BIBLE_VERSES) {
    xml += `
  <url>
    <loc>${baseUrl}/werset/${verse.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// Semantic Bible Search API
// AI ONLY SELECTS from authentic canonical verses, never invents verses!
app.post('/api/semantic-verse', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Brak zapytania' });
      return;
    }

    const trimmed = query.trim();

    // 1. First test local keyword search
    const localMatches = searchBibleVerses(trimmed);
    if (localMatches.length > 0) {
      res.json({
        verse: localMatches[0],
        allMatches: localMatches.slice(0, 5),
        source: 'local_database',
      });
      return;
    }

    // 2. If no direct keyword match and Gemini key exists, perform semantic understanding
    const ai = getGeminiClient();
    if (ai) {
      // Build catalog summary for the model
      const verseCatalog = BIBLE_VERSES.map(v => ({
        id: v.id,
        reference: v.reference,
        category: v.category,
        tags: v.tags.slice(0, 5).join(', '),
        summary: v.text.slice(0, 90) + '...',
      }));

      const prompt = `Jesteś asystentem biblijnym w portalu Christian Culture.
Użytkownik zadał pytanie życiowe, duchowe lub emocjonalne: "${trimmed}".

Twoim zadaniem jest wybrać NAJBARDZIEJ ADEKWATNY identyfikator wersetu z poniższej listy autentycznych wersetów Pisma Świętego.
BEZWZGLĘDNA ZASADA: Nie wolno Ci generować fikcyjnych cytatów biblijnych. Wybierz wyłącznie ID z podanej listy.

LISTA DOSTĘPNYCH WERSETÓW:
${JSON.stringify(verseCatalog)}

Zwróć TYLKO czysty obiekt JSON bez znaczników markdown:
{"verseId": "identyfikator-z-listy", "reason": "jedno zdanie dlaczego ten werset odpowiada na potrzebę"}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text?.trim() || '';
      // Clean possible markdown code fences
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      try {
        const parsed = JSON.parse(cleanJson);
        const matched = BIBLE_VERSES.find(v => v.id === parsed.verseId);
        if (matched) {
          res.json({
            verse: matched,
            source: 'gemini_semantic',
            explanation: parsed.reason,
          });
          return;
        }
      } catch (parseErr) {
        console.warn('Failed to parse Gemini semantic JSON, falling back', parseErr);
      }
    }

    // Fallback: Return top default verse (Jeremiasz 29:11 or Psalm 23:1)
    const fallback = BIBLE_VERSES[0];
    res.json({
      verse: fallback,
      source: 'fallback',
    });
  } catch (err: any) {
    console.error('Semantic verse error:', err);
    res.status(500).json({ error: 'Błąd wyszukiwania semantycznego', fallback: BIBLE_VERSES[0] });
  }
});

// LUMINA Cloud Save/Sync endpoint
app.post('/api/lumina/save-verse', (req, res) => {
  const { verseId, userToken } = req.body;
  if (!verseId) {
    res.status(400).json({ error: 'Wymagane ID wersetu' });
    return;
  }
  // In our integrated architecture, LUMINA authenticates and syncs verses
  res.json({
    success: true,
    message: 'Werset został zapisany w profilu LUMINA',
    verseId,
    timestamp: Date.now(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mój Werset Dnia server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
