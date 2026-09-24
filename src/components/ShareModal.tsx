import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Send,
  ExternalLink,
  MessageCircle,
  Instagram,
  Mail,
  Smartphone,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { BibleVerse, BackgroundTheme } from '../types';
import { GeneratedCardResult, downloadCardImage, renderVerseCardToCanvas } from '../utils/canvasGenerator';
import { getSocialShareLinks, getVerseShareUrl, getShareMessageText, copyToClipboard } from '../utils/shareUtils';
import { trackEvent } from '../utils/analytics';

// Dedykowane wektorowe ikony mediów społecznościowych
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.06c-1.49 0-2.95-.4-4.22-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.03 8.03 0 0 1-1.24-4.28c0-4.45 3.63-8.08 8.1-8.08 2.16 0 4.19.84 5.72 2.37 1.53 1.53 2.37 3.56 2.37 5.72 0 4.46-3.64 8.12-8.24 8.12zm4.49-6.07c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.03 2.59.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const MessengerIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.13 2 11.23c0 2.9 1.46 5.48 3.74 7.12V22l3.47-1.91c.88.24 1.82.38 2.79.38 5.52 0 10-4.13 10-9.24C22 6.13 17.52 2 12 2zm1.09 12.44l-2.77-2.95-5.41 2.95 5.95-6.31 2.84 2.95 5.34-2.95-5.95 6.31z"/>
  </svg>
);

const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const XTwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const PinterestIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.99-.12-2.52.02-3.6.14-.97.9-3.83.9-3.83s-.23-.46-.23-1.14c0-1.07.62-1.87 1.4-1.87.66 0 .98.49.98 1.09 0 .66-.42 1.66-.64 2.58-.18.77.38 1.4 1.14 1.4 1.37 0 2.42-1.44 2.42-3.53 0-1.85-1.33-3.14-3.23-3.14-2.35 0-3.73 1.76-3.73 3.58 0 .71.27 1.47.62 1.88.07.08.08.15.06.24-.06.27-.21.85-.24.97-.04.16-.13.2-.3.12-1.12-.52-1.82-2.15-1.82-3.46 0-2.82 2.05-5.4 5.9-5.4 3.1 0 5.51 2.21 5.51 5.16 0 3.08-1.94 5.56-4.64 5.56-.91 0-1.76-.47-2.05-1.03l-.56 2.13c-.2.78-.75 1.76-1.12 2.36A12 12 0 1 0 12 0z"/>
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  verse: BibleVerse;
  background: BackgroundTheme;
  cardResult?: GeneratedCardResult | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  verse,
  background,
  cardResult,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [downloadedNotice, setDownloadedNotice] = useState(false);
  const [storiesNotice, setStoriesNotice] = useState(false);
  const [isPreparingStories, setIsPreparingStories] = useState(false);

  const shareUrl = getVerseShareUrl(verse, background.id);
  const socialLinks = getSocialShareLinks(verse, background.id);
  const fullShareText = getShareMessageText(verse, shareUrl);

  const handleCopyLink = async () => {
    trackEvent('share_clicked', { method: 'copy_link', verse_id: verse.id });
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const handleCopyFullText = async () => {
    trackEvent('share_clicked', { method: 'copy_full_text', verse_id: verse.id });
    const ok = await copyToClipboard(fullShareText);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2400);
    }
  };

  const handleDownload = () => {
    if (cardResult) {
      trackEvent('download_clicked', { verse_id: verse.id, from: 'share_modal' });
      const filename = `moj-werset-dnia-${verse.slug}.png`;
      downloadCardImage(cardResult.blob, filename);
      setDownloadedNotice(true);
      setTimeout(() => setDownloadedNotice(false), 3500);
    }
  };

  // Obsługa dedykowanego przygotowania do Instagram / TikTok Relacji (Stories 9:16)
  const handlePrepareForStories = async () => {
    try {
      setIsPreparingStories(true);
      trackEvent('share_clicked', { method: 'instagram_stories_prepared', verse_id: verse.id });

      // 1. Kopiuj cytat z hasztagami
      const storiesCaption = `„${verse.text}”\n\n— ${verse.reference} (${verse.translation})\n\nMój Werset Dnia: polskieradio.cc\n#WersetDnia #SłowoBoże #Biblia #ChristianCulture`;
      await copyToClipboard(storiesCaption);

      // 2. Wygeneruj dedykowaną kartę pionową 9:16 dla Stories jeśli nie ma lub pobierz obecną
      let storyCard = cardResult;
      if (!storyCard || storyCard.blob.size === 0) {
        storyCard = await renderVerseCardToCanvas({
          verse,
          background,
          format: '9:16',
        });
      }

      const filename = `relacja-stories-${verse.slug}-9x16.png`;
      downloadCardImage(storyCard.blob, filename);

      setStoriesNotice(true);
      setTimeout(() => setStoriesNotice(false), 4500);
    } catch (e) {
      console.error('Stories preparation error:', e);
    } finally {
      setIsPreparingStories(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (cardResult?.file && navigator.canShare && navigator.canShare({ files: [cardResult.file] })) {
          await navigator.share({
            files: [cardResult.file],
            title: `Mój Werset Dnia: ${verse.reference}`,
            text: fullShareText,
          });
        } else {
          await navigator.share({
            title: `Mój Werset Dnia: ${verse.reference}`,
            text: fullShareText,
            url: shareUrl,
          });
        }
        trackEvent('verse_shared', { method: 'system_sheet', verse_id: verse.id });
      } catch (e) {
        // Użytkownik zamknął okno udostępniania
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-xl bg-[#0f121a] border border-[#dfb872]/40 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#dfb872]/25 to-amber-500/10 border border-[#dfb872]/40 flex items-center justify-center text-[#dfb872] shrink-0 shadow-inner">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                    UDOSTĘPNIJ SŁOWO BOŻE
                  </h2>
                  <p className="text-xs text-[#eed7a1]/85 truncate font-medium">
                    {verse.reference} • Christian Culture
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar my-4 space-y-4">
              {/* Card Preview Thumbnail */}
              {cardResult?.dataUrl && (
                <div className="flex items-center justify-center bg-black/50 rounded-2xl p-2.5 border border-white/8 relative group">
                  <img
                    src={cardResult.dataUrl}
                    alt="Podgląd wygenerowanej grafiki wersetu"
                    className="max-h-44 sm:max-h-48 rounded-xl object-contain shadow-2xl border border-white/10"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 rounded-full bg-black/80 hover:bg-black text-[#f3dfb8] hover:text-white text-[11px] font-semibold border border-white/15 flex items-center gap-1 shadow-lg transition-all cursor-pointer backdrop-blur-md"
                      title="Pobierz ten plik graficzny"
                    >
                      <Download className="w-3 h-3 text-[#dfb872]" />
                      <span>Pobierz PNG</span>
                    </button>
                  </div>
                </div>
              )}

              {/* System Share Sheet Button (One-click for mobile) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-[#dfb872] hover:from-amber-400 hover:to-[#ebd095] text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shadow-amber-500/20"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Otwórz systemowe menu telefonu (Wszystkie aplikacje)</span>
                </motion.button>
              )}

              {/* Dedykowane Kanały Social Media (Kompletne 1-Click Sharing) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#dfb872]" />
                    <span>Dedykowane media społecznościowe:</span>
                  </span>
                  <span className="text-[10px] text-white/40">1-kliknięcie</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {/* 1. WhatsApp */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'whatsapp', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/25 border border-[#25D366]/30 hover:border-[#25D366]/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Udostępnij na WhatsApp (czat, grupa lub status)"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <WhatsAppIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-white font-semibold">WhatsApp</span>
                    <span className="text-[9px] text-[#25D366] mt-0.5">Czat & Grupy</span>
                  </motion.a>

                  {/* 2. Facebook */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'facebook', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 hover:border-[#1877F2]/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Udostępnij post na Facebooku"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <FacebookIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-white font-semibold">Facebook</span>
                    <span className="text-[9px] text-[#58a6ff] mt-0.5">Oś czasu</span>
                  </motion.a>

                  {/* 3. Messenger */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'messenger', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-[#0084FF]/10 hover:bg-[#0084FF]/25 border border-[#0084FF]/30 hover:border-[#0084FF]/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Wyślij wiadomość przez Messenger"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0084FF] via-[#00C6FF] to-[#A824FF] text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <MessengerIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-white font-semibold">Messenger</span>
                    <span className="text-[9px] text-[#00C6FF] mt-0.5">Wiadomość</span>
                  </motion.a>

                  {/* 4. Telegram */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'telegram', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 hover:border-[#229ED9]/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Wyślij na Telegram (czat, kanał)"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <TelegramIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-white font-semibold">Telegram</span>
                    <span className="text-[9px] text-[#229ED9] mt-0.5">Czat & Kanał</span>
                  </motion.a>

                  {/* 5. X / Twitter */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'x_twitter', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/12 hover:border-white/30 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Opublikuj na 𝕏 (Twitter)"
                  >
                    <div className="w-9 h-9 rounded-xl bg-black border border-white/20 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <XTwitterIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white font-semibold">X (Twitter)</span>
                    <span className="text-[9px] text-white/50 mt-0.5">Wpis na 𝕏</span>
                  </motion.a>

                  {/* 6. LinkedIn */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'linkedin', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/25 border border-[#0A66C2]/30 hover:border-[#0A66C2]/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Udostępnij na LinkedIn"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <LinkedInIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white font-semibold">LinkedIn</span>
                    <span className="text-[9px] text-[#70b5f9] mt-0.5">Post w sieci</span>
                  </motion.a>

                  {/* 7. Pinterest */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'pinterest', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-[#E60023]/10 hover:bg-[#E60023]/25 border border-[#E60023]/30 hover:border-[#E60023]/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Przypnij grafikę na tablicy Pinterest"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#E60023] text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <PinterestIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white font-semibold">Pinterest</span>
                    <span className="text-[9px] text-[#ff6b7e] mt-0.5">Zapisz Pin</span>
                  </motion.a>

                  {/* 8. SMS */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.sms}
                    onClick={() => trackEvent('share_clicked', { method: 'sms', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm"
                    title="Wyślij werset w wiadomości SMS"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white font-semibold">SMS</span>
                    <span className="text-[9px] text-emerald-300 mt-0.5">Wiadomość</span>
                  </motion.a>

                  {/* 9. E-mail */}
                  <motion.a
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href={socialLinks.email}
                    onClick={() => trackEvent('share_clicked', { method: 'email', verse_id: verse.id })}
                    className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/60 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-sm col-span-2 sm:col-span-1"
                    title="Wyślij werset pocztą e-mail"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-md">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white font-semibold">E-mail</span>
                    <span className="text-[9px] text-amber-300 mt-0.5">Poczta</span>
                  </motion.a>
                </div>
              </div>

              {/* Dedykowany asystent: Instagram / TikTok / Relacje (Stories 9:16) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-pink-950/30 to-amber-950/20 border border-pink-500/30 space-y-2.5 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs sm:text-sm block">
                      Instagram • TikTok • Relacje (Stories)
                    </span>
                    <span className="text-[10px] text-pink-300 font-medium">
                      Pionowy format 9:16 gotowy do publikacji w 1 kliknięcie
                    </span>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed font-light">
                  Aplikacje mobilne Instagram i TikTok nie pozwalają przeglądarce na automatyczne wklejenie relacji. Kliknij poniższy przycisk, aby natychmiast zapisać grafikę 9:16 w telefonie oraz skopiować gotowy opis z hasztagami!
                </p>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handlePrepareForStories}
                  disabled={isPreparingStories}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-60"
                >
                  <Instagram className="w-4 h-4" />
                  <span>
                    {isPreparingStories
                      ? 'Przygotowywanie grafiki 9:16...'
                      : '📸 Przygotuj do Relacji (Pobierz grafikę + Kopiuj opis)'}
                  </span>
                </motion.button>

                {storiesNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-200 text-[11px] text-center font-medium"
                  >
                    ✓ Grafika 9:16 została zapisana, a opis skopiowany! Otwórz Instagram lub TikTok i dodaj do Relacji.
                  </motion.div>
                )}
              </div>

              {/* Kopiowanie do schowka: Pełny cytat i link */}
              <div className="pt-1 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-white/50 block font-semibold">
                  Szybkie kopiowanie:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Kopiuj pełny cytat */}
                  <button
                    onClick={handleCopyFullText}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#dfb872]/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                    title="Kopiuj cytat wersetu ze źródłem i linkiem"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-semibold text-white block group-hover:text-[#f3dfb8]">
                        Kopiuj pełną treść
                      </span>
                      <span className="text-[10px] text-white/50 truncate block">
                        Cytat, siglum i link do wersetu
                      </span>
                    </div>
                    {copiedText ? (
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/40 group-hover:text-[#dfb872] shrink-0" />
                    )}
                  </button>

                  {/* Kopiuj sam link */}
                  <button
                    onClick={handleCopyLink}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#dfb872]/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                    title="Kopiuj krótki link do tego wersetu"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-semibold text-white block group-hover:text-[#f3dfb8]">
                        Kopiuj sam link
                      </span>
                      <span className="text-[10px] text-white/50 truncate block">
                        {shareUrl.replace('https://', '')}
                      </span>
                    </div>
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/40 group-hover:text-[#dfb872] shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {downloadedNotice && (
                <p className="text-xs text-green-400 text-center font-medium animate-pulse">
                  ✓ Grafika została pomyślnie zapisana na Twoim urządzeniu!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
