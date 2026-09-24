import { BibleVerse, BackgroundTheme } from '../types';
import { trackEvent } from './analytics';

export function getVerseShareUrl(verse: BibleVerse, bgId?: string): string {
  if (typeof window === 'undefined') return `https://werset-dnia.polskieradio.cc/werset/${verse.slug}`;
  const origin = window.location.origin;
  return `${origin}/werset/${verse.slug}${bgId ? `?bg=${bgId}` : ''}`;
}

export function getShareMessageText(verse: BibleVerse, shareUrl: string): string {
  return `„${verse.text}”\n\n— ${verse.reference} (${verse.translation})\n\nOdkryj swój werset na dziś:\n${shareUrl}\n\nChristian Culture | polskieradio.cc`;
}

export interface ShareOptions {
  verse: BibleVerse;
  background: BackgroundTheme;
  cardFile?: File;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

/**
 * Executes native Web Share API if supported, or returns false if fallback UI is needed
 */
export async function shareWithWebShareAPI({
  verse,
  background,
  cardFile,
  onSuccess,
  onError,
}: ShareOptions): Promise<boolean> {
  const shareUrl = getVerseShareUrl(verse, background.id);
  const shareTitle = `Mój Werset Dnia: ${verse.reference}`;
  const shareText = getShareMessageText(verse, shareUrl);

  trackEvent('share_clicked', { verse_id: verse.id, method: 'web_share' });

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // Check if file sharing is supported
      if (cardFile && navigator.canShare && navigator.canShare({ files: [cardFile] })) {
        await navigator.share({
          files: [cardFile],
          title: shareTitle,
          text: shareText,
        });
        trackEvent('verse_shared', { verse_id: verse.id, has_file: true });
        onSuccess?.();
        return true;
      } else {
        // Share standard link & text
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        trackEvent('verse_shared', { verse_id: verse.id, has_file: false });
        onSuccess?.();
        return true;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return true;
      }
      console.warn('Native share failed or dismissed, opening fallback dialog', err);
      onError?.(err);
      return false;
    }
  }

  return false;
}

/**
 * Returns direct share links for prominent social messengers and networks
 */
export function getSocialShareLinks(verse: BibleVerse, bgId: string) {
  const shareUrl = getVerseShareUrl(verse, bgId);
  const message = getShareMessageText(verse, shareUrl);
  const encodedText = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`Mój Werset Dnia: ${verse.reference}`);
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    messenger: isMobile
      ? `fb-messenger://share?link=${encodedUrl}`
      : `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`„${verse.text.slice(0, 160)}...” — ${verse.reference}`)}&url=${encodedUrl}&hashtags=WersetDnia,Biblia,ChristianCulture`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    threads: `https://www.threads.net/intent/post?text=${encodedText}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    sms: `sms:?&body=${encodedText}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
  };
}

/**
 * Copy text or link to clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Copy rendered PNG image blob to clipboard safely
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Clipboard write image failed, falling back:', err);
    return false;
  }
}
