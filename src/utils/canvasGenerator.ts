import { BibleVerse, BackgroundTheme, AspectRatioFormat, FormatOption } from '../types';

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: '1:1',
    label: '1:1',
    description: 'Kwadrat (Instagram/FB)',
    aspectClass: 'aspect-square',
    canvasWidth: 1080,
    canvasHeight: 1080,
    iconName: 'Square',
  },
  {
    id: '9:16',
    label: '9:16',
    description: 'Stories / Reels / TikTok',
    aspectClass: 'aspect-[9/16]',
    canvasWidth: 1080,
    canvasHeight: 1920,
    iconName: 'Smartphone',
  },
  {
    id: '4:5',
    label: '4:5',
    description: 'Portret (Post na telefon)',
    aspectClass: 'aspect-[4/5]',
    canvasWidth: 1080,
    canvasHeight: 1350,
    iconName: 'RectangleVertical',
  },
  {
    id: '16:9',
    label: '16:9',
    description: 'Poziomy (X / FB / Panorama)',
    aspectClass: 'aspect-[16/9]',
    canvasWidth: 1920,
    canvasHeight: 1080,
    iconName: 'Monitor',
  },
];

export function getFormatOption(format: AspectRatioFormat): FormatOption {
  return FORMAT_OPTIONS.find(f => f.id === format) || FORMAT_OPTIONS[0];
}

interface GenerateCardOptions {
  verse: BibleVerse;
  background: BackgroundTheme;
  format: AspectRatioFormat;
}

export interface GeneratedCardResult {
  dataUrl: string;
  blob: Blob;
  file: File;
  width: number;
  height: number;
  webOptimizedDataUrl?: string;
}

/**
 * Preloads web fonts into the document so Canvas can use them.
 * Canvas 2D ignores CSS @font-face unless the font is already loaded
 * in the document's FontFaceSet. We load Cormorant Garamond (serif, verse text)
 * and Plus Jakarta Sans (sans, reference & footer) explicitly.
 */
async function preloadCanvasFonts(): Promise<void> {
  const fonts = [
    {
      family: 'Cormorant Garamond',
      weight: '500',
      url: 'https://fonts.gstatic.com/s/cormorantgaramond/v22/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYrEtshqg.woff2',
    },
    {
      family: 'Cormorant Garamond',
      weight: '700',
      url: 'https://fonts.gstatic.com/s/cormorantgaramond/v22/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYrCtqhqg.woff2',
    },
    {
      family: 'Plus Jakarta Sans',
      weight: '600',
      url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA.woff2',
    },
    {
      family: 'Plus Jakarta Sans',
      weight: '700',
      url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA.woff2',
    },
  ];

  const loadPromises = fonts.map(async ({ family, weight, url }) => {
    if (document.fonts.check(`${weight} 12px "${family}"`)) return;
    try {
      const face = new FontFace(family, `url(${url})`, { weight });
      const loaded = await face.load();
      document.fonts.add(loaded);
    } catch (e) {
      console.warn(`[canvasGenerator] Could not load font ${family} ${weight}:`, e);
    }
  });

  await Promise.allSettled(loadPromises);
  await document.fonts.ready;
}

/**
 * Draws text with manual letter-spacing (ctx.letterSpacing is not standard Canvas API).
 * Centers the full string at (x, y) — ctx.textAlign should be 'center' conceptually
 * but we switch to 'left' internally and handle centering ourselves.
 */
function fillTextLetterSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number
): void {
  if (letterSpacing === 0) {
    ctx.fillText(text, x, y);
    return;
  }
  const charWidths = Array.from(text).map(ch => ctx.measureText(ch).width);
  const totalWidth =
    charWidths.reduce((sum, w) => sum + w, 0) +
    letterSpacing * (text.length - 1);
  const savedAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  let currentX = x - totalWidth / 2;
  Array.from(text).forEach((ch, i) => {
    ctx.fillText(ch, currentX, y);
    currentX += charWidths[i] + letterSpacing;
  });
  ctx.textAlign = savedAlign;
}

/**
 * Loads an image with CORS enabled, returning an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Wraps text onto multiple lines given maxWidth and context measurement
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * High-resolution canvas rendering of the spiritual scripture card
 */
export async function renderVerseCardToCanvas({
  verse,
  background,
  format,
}: GenerateCardOptions): Promise<GeneratedCardResult> {
  const formatConfig = getFormatOption(format);
  const width = formatConfig.canvasWidth;
  const height = formatConfig.canvasHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to acquire canvas context');
  }

  // 0. Preload web fonts so Canvas renders Cormorant Garamond & Plus Jakarta Sans correctly
  await preloadCanvasFonts();

  // 1. Draw Background
  try {
    const img = await loadImage(background.imageUrl);
    // Draw using object-fit cover
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;
    let renderW = width;
    let renderH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > canvasAspect) {
      renderW = height * imgAspect;
      offsetX = (width - renderW) / 2;
    } else {
      renderH = width / imgAspect;
      offsetY = (height - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  } catch (err) {
    console.warn('Could not load remote image for canvas, using artistic gradient backdrop', err);
    // Fallback gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0c1017');
    bgGrad.addColorStop(0.5, '#161c28');
    bgGrad.addColorStop(1, '#080a0f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Cinematic Dark Scrim — balanced so background photo remains visible
  // Single base overlay (reduced from 0.45 → 0.30 so photo shows through)
  ctx.fillStyle = 'rgba(5, 7, 11, 0.30)';
  ctx.fillRect(0, 0, width, height);

  // Vignette — edges darken, center stays lighter to show the photo
  const centerGrad = ctx.createRadialGradient(
    width / 2,
    height * 0.5,
    width * 0.05,
    width / 2,
    height * 0.5,
    width * 0.85
  );
  centerGrad.addColorStop(0, 'rgba(0, 0, 0, 0.20)');
  centerGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.52)');
  centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.82)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, width, height);

  // Bottom gradient for footer area readability
  const bottomGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
  bottomGrad.addColorStop(0, 'rgba(3, 4, 6, 0)');
  bottomGrad.addColorStop(1, 'rgba(3, 4, 6, 0.88)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height * 0.72, width, height * 0.28);

  // Top gradient for header area
  const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.22);
  topGrad.addColorStop(0, 'rgba(3, 4, 6, 0.75)');
  topGrad.addColorStop(1, 'rgba(3, 4, 6, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, height * 0.22);

  // 3. Subtle Warm Ambient Lighting Accent
  const goldAura = ctx.createRadialGradient(
    width / 2,
    height * 0.40,
    20,
    width / 2,
    height * 0.40,
    width * 0.5
  );
  goldAura.addColorStop(0, 'rgba(223, 184, 114, 0.06)');
  goldAura.addColorStop(1, 'rgba(223, 184, 114, 0)');
  ctx.fillStyle = goldAura;
  ctx.fillRect(0, 0, width, height);

  // Inner subtle border line
  ctx.strokeStyle = 'rgba(223, 184, 114, 0.18)';
  ctx.lineWidth = 2;
  const isTall = format === '9:16';
  const isLandscape = format === '16:9';
  const isSquare = format === '1:1';
  const isPortrait = format === '4:5';
  const margin = Math.round((isLandscape || isSquare) ? height * 0.035 : width * 0.04);
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // 4. Header Badge
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const topHeaderY = isTall ? height * 0.13 : (isLandscape || isSquare) ? height * 0.095 : isPortrait ? height * 0.105 : height * 0.11;
  const badgeFontSize = (isLandscape || isSquare || isPortrait) ? Math.round(height * 0.022) : Math.round(width * 0.024);
  const badgeLetterSpacing = (isLandscape || isSquare || isPortrait) ? 4 : 5;

  // Subtle text shadow for header
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = '#dfb872';
  ctx.font = `700 ${badgeFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  fillTextLetterSpaced(ctx, 'SŁOWO BOŻE NA DZIŚ', width / 2, topHeaderY, badgeLetterSpacing);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 5. Quote Mark
  const quoteY = topHeaderY + ((isLandscape || isSquare) ? height * 0.045 : isPortrait ? height * 0.048 : (isTall ? height * 0.055 : height * 0.05));
  const quoteFontSize = isLandscape ? Math.round(height * 0.058) : (isSquare || isPortrait) ? Math.round(height * 0.065) : Math.round(width * 0.08);
  ctx.font = `700 ${quoteFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = 'rgba(223, 184, 114, 0.55)';
  ctx.fillText('\u201C', width / 2, quoteY);

  // ─── LAYOUT: Fixed percentage Y positions ─────────────────────────────────
  // Each element is anchored directly to canvas height — NO cascading.
  // Zones (% of height):
  //   0-20%  : header (SŁOWO BOŻE + quote mark)
  //   20-62% : verse text
  //   63%    : verse→ref separator line (short gold)
  //   67%    : PSALM reference
  //   73%    : Biblia Warszawska
  //   79%    : footer separator line (wide)
  //   85%    : MÓJ WERSET DNIA
  //   91%    : Christian Culture | polskieradio.cc

  // Adjust for landscape (wider, shorter) vs tall formats
  const zVerseSep  = isLandscape ? 0.60 : isTall ? 0.64 : 0.63;  // short gold line
  const zRef       = isLandscape ? 0.68 : isTall ? 0.70 : 0.68;  // PSALM X:Y
  const zTrans     = isLandscape ? 0.75 : isTall ? 0.77 : 0.74;  // Biblia Warszawska
  const zFooterSep = isLandscape ? 0.82 : isTall ? 0.83 : 0.80;  // wide footer line
  const zTitle     = isLandscape ? 0.88 : isTall ? 0.89 : 0.86;  // MÓJ WERSET DNIA
  const zSub       = isLandscape ? 0.93 : isTall ? 0.93 : 0.92;  // Christian Culture

  const verseSepLineY = height * zVerseSep;
  const refY          = height * zRef;
  const transY        = height * zTrans;
  const footerSepLineY = height * zFooterSep;
  const footerTitleY  = height * zTitle;
  const footerSubY    = height * zSub;

  // === FONT SIZES ===
  const refFontSize     = isLandscape ? Math.round(height * 0.032) : Math.round(height * 0.030);
  const transFontSize   = isLandscape ? Math.round(height * 0.021) : Math.round(height * 0.019);
  const footerTitleSize = isLandscape ? Math.round(height * 0.026) : Math.round(height * 0.024);
  const footerSubSize   = isLandscape ? Math.round(height * 0.020) : Math.round(height * 0.019);

  // === VERSE AREA: from quote mark bottom to verse separator line ===
  const quoteMarkBottom = quoteY + quoteFontSize * 0.5;
  const verseAreaTop    = quoteMarkBottom + 20;
  const verseAreaBottom = verseSepLineY - 24;  // guaranteed gap above separator
  const verseAvailH     = Math.max(100, verseAreaBottom - verseAreaTop);

  const maxTextWidth = isLandscape ? Math.round(width * 0.80) : isSquare ? Math.round(width * 0.82) : isPortrait ? Math.round(width * 0.80) : Math.round(width * 0.76);

  // === VERSE AUTO-SIZING: shrink until text fits in verseAvailH ===
  const charCount = verse.text.length;
  let targetFontSize: number;
  if (isLandscape) {
    targetFontSize = charCount > 200 ? Math.round(height * 0.036) : charCount > 140 ? Math.round(height * 0.042) : charCount > 80 ? Math.round(height * 0.048) : Math.round(height * 0.055);
  } else if (isSquare) {
    targetFontSize = charCount > 200 ? Math.round(width * 0.034) : charCount > 140 ? Math.round(width * 0.038) : charCount > 80 ? Math.round(width * 0.044) : charCount < 50 ? Math.round(width * 0.054) : Math.round(width * 0.048);
  } else if (isPortrait) {
    targetFontSize = charCount > 200 ? Math.round(width * 0.034) : charCount > 140 ? Math.round(width * 0.038) : charCount > 80 ? Math.round(width * 0.044) : charCount < 50 ? Math.round(width * 0.054) : Math.round(width * 0.048);
  } else {
    targetFontSize = charCount > 180 ? Math.round(width * 0.038) : charCount > 120 ? Math.round(width * 0.044) : charCount < 60 ? Math.round(width * 0.062) : Math.round(width * 0.052);
  }

  const minFontSize = 20;
  let fontSize = targetFontSize;
  let lines: string[] = [];
  let lineHeight = fontSize * 1.46;

  while (fontSize >= minFontSize) {
    ctx.font = `500 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
    lines = wrapText(ctx, `\u201E${verse.text}\u201D`, maxTextWidth);
    lineHeight = fontSize * (isLandscape ? 1.42 : 1.46);
    if (lines.length * lineHeight <= verseAvailH) break;
    fontSize -= 2;
  }

  // Center verse block in its zone
  const totalVerseH = lines.length * lineHeight;
  const verseBlockMid = (verseAreaTop + verseAreaBottom) / 2;
  const verseStartY = verseBlockMid - totalVerseH / 2 + lineHeight / 2;

  // === DRAW: Verse text ===
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.font = `500 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, verseStartY + i * lineHeight);
  }
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // === DRAW: Verse → Ref separator line (short gold) at 63% ===
  const verseSepW = Math.round(isLandscape ? width * 0.10 : width * 0.12);
  ctx.strokeStyle = 'rgba(223, 184, 114, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - verseSepW / 2, verseSepLineY);
  ctx.lineTo(width / 2 + verseSepW / 2, verseSepLineY);
  ctx.stroke();

  // === DRAW: PSALM X:Y reference at 68% ===
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1;
  ctx.font = `700 ${refFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#e8cb93';
  fillTextLetterSpaced(ctx, verse.reference.toUpperCase(), width / 2, refY, 2);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // === DRAW: Biblia Warszawska at 74% ===
  ctx.font = `400 ${transFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.60)';
  ctx.fillText(verse.translation, width / 2, transY);

  // === DRAW: Footer separator line (wide) at 80% ===
  const footerSepW = Math.round(isLandscape ? width * 0.38 : width * 0.38);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - footerSepW / 2, footerSepLineY);
  ctx.lineTo(width / 2 + footerSepW / 2, footerSepLineY);
  ctx.stroke();

  // === DRAW: Footer "MÓJ WERSET DNIA" ===
  ctx.font = `700 ${footerTitleSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('MÓJ WERSET DNIA', width / 2, footerTitleY);

  // === DRAW: Footer "Christian Culture | polskieradio.cc" ===
  ctx.font = `500 ${footerSubSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(223, 184, 114, 0.85)';
  ctx.fillText('Christian Culture | polskieradio.cc', width / 2, footerSubY);

  // Convert canvas to Blob & File
  const dataUrl = canvas.toDataURL('image/png', 0.95);
  // Lightweight JPEG for Firestore post document to guarantee it never exceeds 1MB limit
  const webOptimizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'));
        return;
      }
      const filename = `moj-werset-dnia-${verse.slug}-${format.replace(':', 'x')}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      resolve({
        dataUrl,
        blob,
        file,
        width,
        height,
        webOptimizedDataUrl,
      });
    }, 'image/png', 0.95);
  });
}

/**
 * Triggers browser download of the image
 */
export function downloadCardImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
