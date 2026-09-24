import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BIBLE_VERSES } from '../src/data/verses.ts';
import { BACKGROUNDS } from '../src/data/backgrounds.ts';
import { TOPIC_HUBS } from '../src/data/topics.ts';
import { BIBLE_QUESTIONS } from '../src/data/questions.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const templateHtmlPath = path.join(distDir, 'index.html');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getBgImage(bgId?: string): string {
  if (bgId) {
    const found = BACKGROUNDS.find(b => b.id === bgId);
    if (found?.imageUrl) {
      if (found.imageUrl.startsWith('http')) return found.imageUrl;
      return `https://werset-dnia.polskieradio.cc${found.imageUrl}`;
    }
  }
  return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
}

function generateStaticPages() {
  if (!fs.existsSync(templateHtmlPath)) {
    console.error('[StaticGen] Błąd: Brak pliku dist/index.html. Najpierw uruchom vite build!');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(templateHtmlPath, 'utf-8');
  let count = 0;

  console.log('[StaticGen] Rozpoczynanie generowania stron statycznych z precyzyjnymi tagami OpenGraph...');

  // 1. Generowanie stron dla każdego wersetu
  for (const verse of BIBLE_VERSES) {
    const bgUrl = getBgImage(verse.defaultBgId);
    const title = `${verse.reference} — Mój Werset Dnia | Christian Culture`;
    const ogTitle = `${verse.reference} — Mój Werset Dnia`;
    const description = `„${verse.text}” — ${verse.reference} (${verse.translation}). Odkryj swój werset na dziś w Christian Culture.`;
    const canonicalUrl = `https://werset-dnia.polskieradio.cc/werset/${verse.slug}`;

    let pageHtml = templateHtml;

    // Podmiana tytułu
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

    // Podmiana meta description
    pageHtml = pageHtml.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

    // Podmiana og:title
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`
    );

    // Podmiana og:description
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    );

    // Podmiana og:image
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:image" content="${bgUrl}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="${escapeHtml(verse.reference)}" />`
    );

    // Podmiana og:url
    pageHtml = pageHtml.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${canonicalUrl}" />\n    <meta property="og:url" content="${canonicalUrl}" />`
    );

    // Podmiana twitter tagów
    pageHtml = pageHtml.replace(
      /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+name="twitter:card"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:image" content="${bgUrl}" />`
    );

    // Zapis do /werset/[slug]/index.html
    const targetDir = path.join(distDir, 'werset', verse.slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml, 'utf-8');

    // Zapis do /w/[slug]/index.html
    const targetShortDir = path.join(distDir, 'w', verse.slug);
    fs.mkdirSync(targetShortDir, { recursive: true });
    fs.writeFileSync(path.join(targetShortDir, 'index.html'), pageHtml, 'utf-8');

    count++;
  }

  // 2. Generowanie stron dla tematów (hubs)
  for (const topic of TOPIC_HUBS) {
    const title = `${topic.name} — Wersety Biblijne | Mój Werset Dnia`;
    const ogTitle = `${topic.name} — Wersety Biblijne`;
    const description = `${topic.description} • Odkryj wersety o ${topic.name} w Christian Culture.`;
    const canonicalUrl = `https://werset-dnia.polskieradio.cc/wersety/${topic.slug}`;
    const bgUrl = getBgImage(topic.bgId);

    let pageHtml = templateHtml;
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    pageHtml = pageHtml.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:image" content="${bgUrl}" />`
    );
    pageHtml = pageHtml.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${canonicalUrl}" />\n    <meta property="og:url" content="${canonicalUrl}" />`
    );

    const targetDir = path.join(distDir, 'wersety', topic.slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml, 'utf-8');

    const targetAltDir = path.join(distDir, 'temat', topic.slug);
    fs.mkdirSync(targetAltDir, { recursive: true });
    fs.writeFileSync(path.join(targetAltDir, 'index.html'), pageHtml, 'utf-8');
  }

  // 3. Generowanie stron dla pytań (Q&A)
  for (const q of BIBLE_QUESTIONS) {
    const title = `${q.question} — Co mówi Biblia? | Mój Werset Dnia`;
    const ogTitle = `${q.question} — Odpowiedź Biblii`;
    const description = `${q.metaDescription || q.shortAnswer.slice(0, 160)}... • Odpowiedzi biblijne w Christian Culture.`;
    const canonicalUrl = `https://werset-dnia.polskieradio.cc/pytanie/${q.slug}`;
    const bgUrl = getBgImage();

    let pageHtml = templateHtml;
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    pageHtml = pageHtml.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:image" content="${bgUrl}" />`
    );
    pageHtml = pageHtml.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${canonicalUrl}" />\n    <meta property="og:url" content="${canonicalUrl}" />`
    );

    const targetDir = path.join(distDir, 'pytanie', q.slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml, 'utf-8');
  }

  console.log(`[StaticGen] Pomyślnie wygenerowano ${count} stron wersetów z precyzyjnymi tagami OpenGraph dla Facebooka, X, LinkedIn, WhatsApp i Google.`);
}

generateStaticPages();
