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

  // 2. Cinematic Dark Scrim Overlays for crystal clear text readability
  // Overall darkness overlay
  ctx.fillStyle = 'rgba(7, 9, 13, 0.45)';
  ctx.fillRect(0, 0, width, height);

  // Center vignette gradient
  const centerGrad = ctx.createRadialGradient(
    width / 2,
    height * 0.48,
    width * 0.1,
    width / 2,
    height * 0.48,
    width * 0.8
  );
  centerGrad.addColorStop(0, 'rgba(8, 10, 15, 0.55)');
  centerGrad.addColorStop(0.7, 'rgba(6, 8, 12, 0.82)');
  centerGrad.addColorStop(1, 'rgba(4, 5, 8, 0.95)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft bottom dark gradient for brand footer prominence
  const bottomGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
  bottomGrad.addColorStop(0, 'rgba(5, 7, 10, 0)');
  bottomGrad.addColorStop(1, 'rgba(4, 5, 8, 0.95)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  // 3. Subtle Warm Ambient Lighting Accent
  const goldAura = ctx.createRadialGradient(
    width / 2,
    height * 0.35,
    20,
    width / 2,
    height * 0.35,
    width * 0.45
  );
  goldAura.addColorStop(0, 'rgba(223, 184, 114, 0.08)');
  goldAura.addColorStop(1, 'rgba(223, 184, 114, 0)');
  ctx.fillStyle = goldAura;
  ctx.fillRect(0, 0, width, height);

  // Inner subtle border line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  const isTall = format === '9:16';
  const isLandscape = format === '16:9';
  const isSquare = format === '1:1';
  const isPortrait = format === '4:5';
  const margin = Math.round((isLandscape || isSquare) ? height * 0.035 : width * 0.04);
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // 4. Header Badge / Top Flourish (Crosses removed)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const topHeaderY = isTall ? height * 0.13 : (isLandscape || isSquare) ? height * 0.095 : isPortrait ? height * 0.105 : height * 0.11;
  const badgeFontSize = (isLandscape || isSquare || isPortrait) ? Math.round(height * 0.022) : Math.round(width * 0.024);

  // Spiritual badge without crosses
  ctx.fillStyle = '#dfb872'; // Refined champagne gold accent
  ctx.font = `600 ${badgeFontSize}px sans-serif`;
  ctx.letterSpacing = (isLandscape || isSquare || isPortrait) ? '4px' : '5px';
  ctx.fillText('SŁOWO BOŻE NA DZIŚ', width / 2, topHeaderY);

  // 5. Quote Mark
  const quoteY = topHeaderY + ((isLandscape || isSquare) ? height * 0.045 : isPortrait ? height * 0.048 : (isTall ? height * 0.055 : height * 0.05));
  const quoteFontSize = isLandscape ? Math.round(height * 0.058) : (isSquare || isPortrait) ? Math.round(height * 0.065) : Math.round(width * 0.08);
  ctx.font = `italic 700 ${quoteFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = 'rgba(223, 184, 114, 0.45)';
  ctx.fillText('“', width / 2, quoteY);

  // 8. MANDATORY BAKED-IN FOOTER WATERMARK coordinates defined early to measure available vertical window
  // Strictly inside decorative frame across all formats (especially 4:5)
  // In 1:1 format, footer is raised by 3mm (~34px on 1080x1080 canvas)
  const footerY = height - (
    isTall ? height * 0.085 :
    isLandscape ? (height * 0.096) :
    isSquare ? (height * 0.085 + 34) :
    isPortrait ? (height * 0.095) :
    height * 0.085
  );
  const footerSepY = footerY - (isLandscape || isSquare || isPortrait ? 24 : Math.round(width * 0.04));

  // Visual content window between quote mark and footer separator
  const contentTop = quoteY + ((isLandscape || isSquare || isPortrait) ? height * 0.035 : height * 0.04);
  const contentBottom = footerSepY - (isLandscape || isSquare || isPortrait ? 16 : 24);
  const availableHeight = Math.max(200, contentBottom - contentTop);

  // 6. Verse Text (Dynamic sizing & automatic line wrapping with auto-calibration)
  // In 16:9 landscape, 1:1 square, and 4:5 portrait, give generous horizontal column width for natural breathing
  const maxTextWidth = (isLandscape || isSquare || isPortrait) ? Math.round(width * 0.78) : Math.round(width * 0.72);

  const charCount = verse.text.length;
  let targetFontSize: number;
  if (isLandscape) {
    // 16:9 landscape height-calibrated typography
    if (charCount > 200) {
      targetFontSize = Math.round(height * 0.036);
    } else if (charCount > 140) {
      targetFontSize = Math.round(height * 0.042);
    } else if (charCount > 80) {
      targetFontSize = Math.round(height * 0.048);
    } else {
      targetFontSize = Math.round(height * 0.055);
    }
  } else if (isSquare) {
    // 1:1 square height & width calibrated typography (1080x1080)
    if (charCount > 200) {
      targetFontSize = Math.round(width * 0.035);
    } else if (charCount > 140) {
      targetFontSize = Math.round(width * 0.040);
    } else if (charCount > 80) {
      targetFontSize = Math.round(width * 0.045);
    } else if (charCount < 50) {
      targetFontSize = Math.round(width * 0.055);
    } else {
      targetFontSize = Math.round(width * 0.049);
    }
  } else if (isPortrait) {
    // 4:5 portrait calibrated typography (1080x1350)
    if (charCount > 200) {
      targetFontSize = Math.round(width * 0.035);
    } else if (charCount > 140) {
      targetFontSize = Math.round(width * 0.040);
    } else if (charCount > 80) {
      targetFontSize = Math.round(width * 0.045);
    } else if (charCount < 50) {
      targetFontSize = Math.round(width * 0.056);
    } else {
      targetFontSize = Math.round(width * 0.049);
    }
  } else {
    // Portrait / Vertical 9:16 scaling
    if (charCount > 180) {
      targetFontSize = Math.round(width * 0.038);
    } else if (charCount > 120) {
      targetFontSize = Math.round(width * 0.044);
    } else if (charCount < 60) {
      targetFontSize = Math.round(width * 0.062);
    } else {
      targetFontSize = Math.round(width * 0.052);
    }
  }

  // Reference elements dimensions
  const refFontSize = (isLandscape || isSquare || isPortrait) ? Math.round(height * 0.030) : Math.round(width * 0.036);
  const transFontSize = (isLandscape || isSquare || isPortrait) ? Math.round(height * 0.019) : Math.round(width * 0.022);
  const refGap = (isLandscape || isSquare) ? Math.round(height * 0.042) : isPortrait ? Math.round(height * 0.050) : (isTall ? Math.round(height * 0.08) : Math.round(height * 0.07));
  const refBlockExtra = refGap + refFontSize + (transFontSize * 1.8);

  // Auto-calibrating loop: decrease font size step-by-step until the whole block fits with elegance
  let fontSize = targetFontSize;
  let lines: string[] = [];
  let lineHeight = fontSize * (isLandscape ? 1.42 : isSquare ? 1.45 : isPortrait ? 1.46 : 1.5);
  let totalTextHeight = 0;
  let totalBlockHeight = 0;
  const minFontSize = (isLandscape || isSquare || isPortrait) ? 24 : 26;

  while (fontSize >= minFontSize) {
    ctx.font = `500 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
    lines = wrapText(ctx, `„${verse.text}”`, maxTextWidth);
    lineHeight = fontSize * (isLandscape ? 1.42 : isSquare ? 1.45 : isPortrait ? 1.46 : 1.5);
    totalTextHeight = lines.length * lineHeight;
    totalBlockHeight = totalTextHeight + refBlockExtra;

    if (totalBlockHeight <= availableHeight * 0.94) {
      break;
    }
    fontSize -= 2;
  }

  // Exact vertical optical centering inside available space
  const blockCenterY = (contentTop + contentBottom) / 2;
  const blockStartY = blockCenterY - totalBlockHeight / 2;
  const verseStartY = blockStartY + lineHeight / 2;

  // Render verse text
  ctx.font = `500 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = '#ffffff';

  // Drop shadow for text depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, verseStartY + i * lineHeight);
  }

  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 7. Reference (e.g. Psalm 23:1)
  const lastLineY = verseStartY + (lines.length - 1) * lineHeight;
  const refY = lastLineY + refGap;

  // Delicate decorative separator line
  const sepWidth = Math.round((isLandscape || isSquare || isPortrait) ? width * 0.13 : width * 0.16);
  const sepGap = (isLandscape || isSquare || isPortrait) ? 18 : (isTall ? 32 : 24);
  ctx.strokeStyle = 'rgba(223, 184, 114, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - sepWidth / 2, refY - sepGap);
  ctx.lineTo(width / 2 + sepWidth / 2, refY - sepGap);
  ctx.stroke();

  // Book & verse reference
  ctx.font = `700 ${refFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#e8cb93'; // Delicate luminous champagne gold
  ctx.fillText(verse.reference.toUpperCase(), width / 2, refY);

  // Translation name
  ctx.font = `400 ${transFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fillText(verse.translation, width / 2, refY + transFontSize * 1.8);

  // 8. MANDATORY BAKED-IN FOOTER WATERMARK
  // As requested in specification Section 4:
  // "Stopka musi być integralną częścią wygenerowanej grafiki, a nie elementem HTML nałożonym wyłącznie w przeglądarce.
  // Mój Werset Dnia
  // Christian Culture | polskieradio.cc"

  // Subtle separator line above footer
  const footerSepW = Math.round((isLandscape || isSquare || isPortrait) ? width * 0.38 : width * 0.45);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - footerSepW / 2, footerSepY);
  ctx.lineTo(width / 2 + footerSepW / 2, footerSepY);
  ctx.stroke();

  // Footer Title: "MÓJ WERSET DNIA"
  const footerTitleSize = (isLandscape || isSquare || isPortrait) ? Math.round(height * 0.024) : Math.round(width * 0.026);
  ctx.font = `700 ${footerTitleSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('MÓJ WERSET DNIA', width / 2, footerY - 4);

  // Footer Subtitle: "Christian Culture | polskieradio.cc"
  const footerSubSize = (isLandscape || isSquare || isPortrait) ? Math.round(height * 0.019) : Math.round(width * 0.021);
  ctx.font = `500 ${footerSubSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(223, 184, 114, 0.85)'; // Warm champagne gold brand accent
  ctx.fillText('Christian Culture  •  polskieradio.cc', width / 2, footerY + footerSubSize * 1.5);

  // Convert canvas to Blob & File
  const dataUrl = canvas.toDataURL('image/png', 0.95);

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
