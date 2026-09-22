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
} from 'lucide-react';
import { BibleVerse, BackgroundTheme } from '../types';
import { GeneratedCardResult, downloadCardImage } from '../utils/canvasGenerator';
import { getSocialShareLinks, getVerseShareUrl, copyToClipboard } from '../utils/shareUtils';
import { trackEvent } from '../utils/analytics';

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
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  const shareUrl = getVerseShareUrl(verse, background.id);
  const socialLinks = getSocialShareLinks(verse, background.id);

  const handleCopyLink = async () => {
    trackEvent('share_clicked', { method: 'copy_link', verse_id: verse.id });
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
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

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (cardResult?.file && navigator.canShare && navigator.canShare({ files: [cardResult.file] })) {
          await navigator.share({
            files: [cardResult.file],
            title: `Mój Werset Dnia: ${verse.reference}`,
            text: `„${verse.text}” — ${verse.reference} | polskieradio.cc`,
          });
        } else {
          await navigator.share({
            title: `Mój Werset Dnia: ${verse.reference}`,
            text: `„${verse.text}” — ${verse.reference}`,
            url: shareUrl,
          });
        }
        trackEvent('verse_shared', { method: 'system_sheet', verse_id: verse.id });
      } catch (e) {
        // User aborted
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-lg bg-[#0f121a] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#e8cb93]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">UDOSTĘPNIJ WERSET</h2>
                  <p className="text-xs text-[#eed7a1]/85">{verse.reference} • Christian Culture</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar my-4 space-y-4">
              {/* Card Preview Thumbnail */}
              {cardResult?.dataUrl && (
                <div className="flex items-center justify-center bg-black/40 rounded-2xl p-2 border border-white/5">
                  <img
                    src={cardResult.dataUrl}
                    alt="Podgląd karty"
                    className="max-h-48 rounded-xl object-contain shadow-lg"
                  />
                </div>
              )}

              {/* System Share Sheet Button (if available) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNativeShare}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Otwórz systemowe menu udostępniania</span>
                </motion.button>
              )}

              {/* Social Channels Grid */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-2 font-medium">
                  Wybierz aplikację:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* WhatsApp */}
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'whatsapp', verse_id: verse.id })}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white font-medium">WhatsApp</span>
                  </motion.a>

                  {/* Telegram */}
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'telegram', verse_id: verse.id })}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-[#229ED9]/20 border border-white/10 hover:border-[#229ED9]/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white font-medium">Telegram</span>
                  </motion.a>

                  {/* Facebook */}
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'facebook', verse_id: verse.id })}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white font-medium">Facebook</span>
                  </motion.a>

                  {/* X / Twitter */}
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    href={socialLinks.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('share_clicked', { method: 'x_twitter', verse_id: verse.id })}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/30 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <span className="font-bold text-xs">𝕏</span>
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white font-medium">X / Twitter</span>
                  </motion.a>
                </div>
              </div>

              {/* Instagram / Stories Guide */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-amber-900/10 border border-pink-500/20 flex items-start gap-3">
                <Instagram className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <div className="text-xs text-white/80 leading-relaxed">
                  <span className="font-semibold text-pink-300 block mb-0.5">
                    Instagram / TikTok / WhatsApp Relacje:
                  </span>
                  Pobierz gotową kartę 9:16 do pamięci telefonu, a następnie dodaj ją w aplikacji jako relację (Stories/Status).
                </div>
              </div>

              {/* Download direct button inside share modal */}
              {cardResult && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="w-full py-3 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-[#d4af37]/35 text-[#f3dfb8] hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#e8cb93]" />
                  <span>Pobierz grafikę (PNG) do galerii</span>
                </motion.button>
              )}

              {downloadedNotice && (
                <p className="text-[11px] text-green-400 text-center font-medium animate-pulse">
                  ✓ Grafika została zapisana na Twoim urządzeniu!
                </p>
              )}

              {/* Copy Direct Link Section */}
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-1.5 font-medium">
                  Bezpośredni link do tego wersetu:
                </span>
                <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-xl border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-transparent text-xs text-white/70 px-2 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-[#dfb872] hover:bg-[#ebd095] text-neutral-950 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-neutral-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Skopiowano!' : 'Kopiuj'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
