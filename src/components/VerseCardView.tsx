import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw,
  Image as ImageIcon,
  Share2,
  Download,
  Search,
  Check,
  Sparkles,
  Smartphone,
  Square,
  RectangleVertical,
  Monitor,
  Copy,
  Bell,
  BellRing,
  BookOpen,
  ChevronRight,
  Info,
  ExternalLink,
  Heart,
  Youtube,
  Loader2,
} from 'lucide-react';
import { BibleVerse, BackgroundTheme, AspectRatioFormat, LuminaUser } from '../types';
import { FORMAT_OPTIONS, getFormatOption, renderVerseCardToCanvas, downloadCardImage, GeneratedCardResult } from '../utils/canvasGenerator';
import { shareWithWebShareAPI, copyToClipboard, getVerseShareUrl, getSocialShareLinks } from '../utils/shareUtils';
import { trackEvent } from '../utils/analytics';
import { publishVerseToLuminaCommunity, PublishResult } from '../services/luminaCommunityPublisher';
import { getStoredLuminaUser } from '../services/luminaAuth';
import { LuminaPublishSuccessModal } from './LuminaPublishSuccessModal';
import { getMojaBibliaStudyUrl } from '../utils/mojaBibliaHelper';

// Ikony wektorowe dla paska szybkiego udostępniania
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

interface VerseCardViewProps {
  verse: BibleVerse;
  background: BackgroundTheme;
  format: AspectRatioFormat;
  isSavedInLumina: boolean;
  isLoggedIn: boolean;
  user?: LuminaUser | null;
  notificationsOptIn?: boolean;
  onChangeFormat: (format: AspectRatioFormat) => void;
  onNextVerse: () => void;
  onCycleBackground: () => void;
  onOpenBackgroundModal: () => void;
  onSaveToLumina: () => void;
  onOpenSavedModal?: () => void;
  onOpenNotificationModal?: () => void;
  onRequireLuminaAuth: (pendingAction: 'download' | 'share' | 'save' | 'publish_lumina') => void;
  onOpenShareModal: (cardResult?: GeneratedCardResult) => void;
  onBackToSearch: () => void;
  onSelectTopic?: (topicSlug: string) => void;
  onSelectVerse?: (verse: BibleVerse) => void;
}

export const VerseCardView: React.FC<VerseCardViewProps> = ({
  verse,
  background,
  format,
  isSavedInLumina,
  isLoggedIn,
  user,
  notificationsOptIn,
  onChangeFormat,
  onNextVerse,
  onCycleBackground,
  onOpenBackgroundModal,
  onSaveToLumina,
  onOpenSavedModal,
  onOpenNotificationModal,
  onRequireLuminaAuth,
  onOpenShareModal,
  onBackToSearch,
  onSelectTopic,
  onSelectVerse,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishingLumina, setIsPublishingLumina] = useState(false);
  const [publishedResult, setPublishedResult] = useState<PublishResult | null>(null);
  const [isPublishSuccessModalOpen, setIsPublishSuccessModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [renderedCard, setRenderedCard] = useState<GeneratedCardResult | null>(null);
  const [favoriteToast, setFavoriteToast] = useState<string | null>(null);

  const handleToggleFavorite = () => {
    const willBeSaved = !isSavedInLumina;
    onSaveToLumina();
    setFavoriteToast(
      willBeSaved ? 'Zapisano w: Moje Wersety / Ulubione ❤️' : 'Usunięto z Ulubionych'
    );
    setTimeout(() => {
      setFavoriteToast(null);
    }, 2400);
  };

  const handlePublishToLumina = async () => {
    trackEvent('publish_to_lumina_btn_clicked', { verse_id: verse.id, format });

    if (!isLoggedIn) {
      onRequireLuminaAuth('publish_lumina');
      return;
    }

    const currentUser = user || getStoredLuminaUser();
    if (!currentUser) {
      onRequireLuminaAuth('publish_lumina');
      return;
    }

    try {
      setIsPublishingLumina(true);
      let card = renderedCard;
      if (!card) {
        card = await renderVerseCardToCanvas({ verse, background, format });
        setRenderedCard(card);
      }

      const res = await publishVerseToLuminaCommunity({
        verse,
        background,
        format,
        user: currentUser,
        renderedCard: card,
      });

      if (res.success) {
        setPublishedResult(res);
        setIsPublishSuccessModalOpen(true);
      } else {
        alert(res.error || 'Nie udało się opublikować na LUMINA. Spróbuj ponownie.');
      }
    } catch (e: any) {
      console.error('Publishing error:', e);
      alert('Wystąpił błąd podczas publikowania na LUMINA.');
    } finally {
      setIsPublishingLumina(false);
    }
  };

  // Pre-render canvas card in background when verse, bg or format changes
  useEffect(() => {
    let isCancelled = false;
    async function updateCard() {
      try {
        const result = await renderVerseCardToCanvas({ verse, background, format });
        if (!isCancelled) {
          setRenderedCard(result);
        }
      } catch (err) {
        console.warn('Canvas card generation deferred:', err);
      }
    }
    updateCard();
    return () => {
      isCancelled = true;
    };
  }, [verse, background, format]);

  // Handle Download Action (requires LUMINA login per specification)
  const handleDownloadClick = async () => {
    trackEvent('download_clicked', { verse_id: verse.id, format });

    if (!isLoggedIn) {
      onRequireLuminaAuth('download');
      return;
    }

    try {
      setIsGenerating(true);
      let card = renderedCard;
      if (!card) {
        card = await renderVerseCardToCanvas({ verse, background, format });
        setRenderedCard(card);
      }
      const filename = `moj-werset-dnia-${verse.slug}-${format.replace(':', 'x')}.png`;
      downloadCardImage(card.blob, filename);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const socialLinks = getSocialShareLinks(verse, background.id);

  // Handle Share Action - dedykowane, natychmiastowe udostępnianie na wszystkie popularne social media
  const handleShareClick = async () => {
    trackEvent('share_clicked', { verse_id: verse.id, format });

    try {
      let card = renderedCard;
      if (!card) {
        setIsGenerating(true);
        card = await renderVerseCardToCanvas({ verse, background, format });
        setRenderedCard(card);
      }
      onOpenShareModal(card || undefined);
    } catch (e) {
      onOpenShareModal(renderedCard || undefined);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleCopyLink = async () => {
    const url = getVerseShareUrl(verse, background.id);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyText = async () => {
    const text = `„${verse.text}” — ${verse.reference} (${verse.translation})`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Aspect ratio styling container calculation
  const getAspectClass = () => {
    switch (format) {
      case '9:16':
        return 'w-full max-w-[360px] aspect-[9/16]';
      case '1:1':
        return 'w-full max-w-[380px] sm:max-w-[440px] md:max-w-[460px] aspect-square';
      case '4:5':
        return 'w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5]';
      case '16:9':
        return 'w-full max-w-[560px] sm:max-w-[680px] lg:max-w-[760px] aspect-[16/9]';
      default:
        return 'w-full max-w-[360px] aspect-[9/16]';
    }
  };

  return (
    <div className="min-h-screen pt-18 pb-20 px-3 sm:px-4 flex flex-col items-center justify-center">
      {/* Top Breadcrumb & Return to Search */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={onBackToSearch}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/60 hover:text-amber-300 transition-colors py-1.5 px-3 rounded-full bg-white/[0.04] border border-white/10 hover:border-amber-500/30 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Szukaj innego wersetu</span>
        </button>

        {/* Quick format selector pills */}
        <div className="flex items-center gap-1 bg-[#101319] p-1 rounded-xl border border-white/10">
          {FORMAT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => onChangeFormat(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                format === f.id
                  ? 'bg-[#dfb872] text-neutral-950 font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title={f.description}
            >
              {f.id === '9:16' && <Smartphone className="w-3 h-3" />}
              {f.id === '1:1' && <Square className="w-3 h-3" />}
              {f.id === '4:5' && <RectangleVertical className="w-3 h-3" />}
              {f.id === '16:9' && <Monitor className="w-3 h-3" />}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CARD CONTAINER */}
      {/* ========================================================================= */}
      <div className="relative w-full flex items-center justify-center my-2">
        <motion.div
          layout
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={`relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 golden-glow flex flex-col justify-between ${getAspectClass()}`}
        >
          {/* Background Image with Cinematic Crossfade */}
          <AnimatePresence mode="popLayout">
            <motion.img
              key={background.id}
              src={background.imageUrl}
              alt={background.name}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Cinematic Contrast Overlays */}
          <div className="absolute inset-0 bg-[#07090d]/45 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080a0f]/60 via-[#06080c]/70 to-[#040508]/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/[0.05] via-transparent to-transparent pointer-events-none" />

          {/* Thin inner hairline frame */}
          <div className="absolute inset-3 sm:inset-4 rounded-2xl border border-white/15 pointer-events-none" />

          {/* Floating Heart Action Button on the Generated Graphic Card - positioned cleanly inside the frame */}
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
            <AnimatePresence>
              {favoriteToast && (
                <motion.div
                  initial={{ opacity: 0, x: 8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                  onClick={onOpenSavedModal}
                  className={`px-3 py-1.5 rounded-full bg-neutral-950/95 border border-[#dfb872]/60 text-[#f3dfb8] text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-1.5 ${
                    onOpenSavedModal ? 'cursor-pointer hover:border-[#dfb872] hover:bg-neutral-900' : 'pointer-events-none'
                  }`}
                  title={onOpenSavedModal ? 'Kliknij, aby przejść do Moje Wersety / Ulubione' : undefined}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSavedInLumina ? 'fill-rose-500 text-rose-500' : 'text-[#e8cb93]'}`} />
                  <span className="whitespace-nowrap">{favoriteToast}</span>
                  {onOpenSavedModal && isSavedInLumina && (
                    <span className="text-[10px] text-amber-300 font-bold underline ml-1">Zobacz</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              id="verse-card-heart-btn"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={handleToggleFavorite}
              className={`p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xl flex items-center justify-center border group ${
                isSavedInLumina
                  ? 'bg-neutral-950/80 border-rose-500/60 text-rose-500 shadow-rose-950/50 ring-2 ring-rose-500/25'
                  : 'bg-black/45 hover:bg-black/70 border-white/20 hover:border-[#dfb872]/60 text-white/80 hover:text-white'
              }`}
              title={
                isSavedInLumina
                  ? 'Werset zapisany w: Moje Wersety / Ulubione (kliknij, by usunąć)'
                  : 'Zapisz ten werset do: Moje Wersety / Ulubione'
              }
              aria-label={
                isSavedInLumina
                  ? 'Usuń werset z Moich Wersetów'
                  : 'Zapisz werset do: Moje Wersety / Ulubione'
              }
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  isSavedInLumina
                    ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] scale-110'
                    : 'text-white/90 group-hover:scale-110'
                }`}
              />
            </motion.button>
          </div>

          {/* 1. Card Top Badge (Crosses removed) */}
          <div className={`relative z-10 text-center px-4 ${
            format === '16:9' ? 'pt-2.5 sm:pt-3.5' : format === '1:1' || format === '4:5' ? 'pt-3.5 sm:pt-4.5' : 'pt-6 sm:pt-8'
          }`}>
            <div className={`inline-flex items-center gap-1.5 text-[#e8cb93] font-cinzel font-semibold tracking-widest uppercase ${
              format === '16:9' || format === '1:1' || format === '4:5' ? 'text-[10px] sm:text-xs' : 'text-[11px] sm:text-xs'
            }`}>
              <span>SŁOWO BOŻE NA DZIŚ</span>
            </div>
            <div className={`font-cormorant italic text-[#e8cb93]/40 leading-none select-none ${
              format === '16:9' ? 'text-xl sm:text-2xl mt-0.5' : format === '1:1' || format === '4:5' ? 'text-2xl sm:text-3xl mt-0.5' : 'text-3xl sm:text-4xl mt-1'
            }`}>
              “
            </div>
          </div>

          {/* 2. Verse Text Centerpiece with Motion Stagger & Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={verse.id}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`relative z-10 my-auto text-center flex flex-col items-center ${
                format === '16:9'
                  ? 'px-6 sm:px-12 py-0.5'
                  : format === '1:1' || format === '4:5'
                  ? 'px-5 sm:px-8 py-1'
                  : 'px-6 sm:px-8 py-3'
              }`}
            >
              <p
                className={`font-cormorant text-white font-medium italic tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] ${
                  format === '16:9'
                    ? verse.text.length > 180
                      ? 'text-xs sm:text-sm md:text-base leading-snug sm:leading-relaxed'
                      : verse.text.length > 120
                      ? 'text-sm sm:text-base md:text-lg leading-snug sm:leading-relaxed'
                      : 'text-base sm:text-lg md:text-xl leading-snug sm:leading-normal'
                    : format === '1:1' || format === '4:5'
                    ? verse.text.length > 180
                      ? 'text-xs sm:text-sm md:text-base leading-snug sm:leading-normal'
                      : verse.text.length > 120
                      ? 'text-sm sm:text-base md:text-lg leading-snug sm:leading-normal'
                      : verse.text.length > 70
                      ? 'text-base sm:text-lg md:text-xl leading-normal'
                      : 'text-lg sm:text-xl md:text-2xl leading-normal'
                    : verse.text.length > 180
                    ? 'text-lg sm:text-xl leading-relaxed'
                    : verse.text.length > 120
                    ? 'text-xl sm:text-2xl leading-relaxed'
                    : 'text-2xl sm:text-3xl leading-relaxed'
                }`}
              >
                „{verse.text}”
              </p>

              {/* Separator line */}
              <div className={`h-0.5 bg-[#dfb872]/50 rounded-full ${
                format === '16:9' ? 'w-12 sm:w-16 my-1 sm:my-2' : format === '1:1' || format === '4:5' ? 'w-12 sm:w-16 my-1.5 sm:my-2.5' : 'w-16 my-4'
              }`} />

              {/* Reference */}
              <h2 className={`font-sans font-bold text-[#f3dfb8] tracking-wider uppercase drop-shadow ${
                format === '16:9' || format === '1:1' || format === '4:5' ? 'text-xs sm:text-sm md:text-base' : 'text-base sm:text-lg'
              }`}>
                {verse.reference}
              </h2>

              {/* Translation */}
              <span className={`text-white/60 font-light ${
                format === '16:9' ? 'text-[9px] sm:text-[11px] mt-0' : format === '1:1' || format === '4:5' ? 'text-[10px] sm:text-[11px] mt-0.5' : 'text-[11px] mt-0.5'
              }`}>
                {verse.translation}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* 3. BAKED-IN BRAND WATERMARK FOOTER (raised by 3mm in 1:1 format) */}
          <div className={`relative z-10 text-center px-4 ${
            format === '16:9'
              ? 'pb-3.5 sm:pb-4.5'
              : format === '1:1'
                ? 'pb-[calc(0.75rem+3mm)] sm:pb-[calc(1rem+3mm)]'
                : format === '4:5'
                  ? 'pb-4 sm:pb-5'
                  : 'pb-5 sm:pb-6'
          }`}>
            <div className={`h-[1px] bg-white/15 mx-auto ${
              format === '16:9' ? 'w-24 sm:w-32 mb-1 sm:mb-1.5' : format === '1:1' || format === '4:5' ? 'w-28 sm:w-32 mb-1.5 sm:mb-2' : 'w-32 mb-2.5'
            }`} />
            <div className={`font-sans font-bold text-white tracking-wider uppercase ${
              format === '16:9' || format === '1:1' || format === '4:5' ? 'text-[10px] sm:text-xs' : 'text-[11px] sm:text-xs'
            }`}>
              MÓJ WERSET DNIA
            </div>
            <div className={`font-sans text-[#e8cb93]/90 font-medium ${
              format === '16:9' || format === '1:1' || format === '4:5' ? 'text-[9px] sm:text-[10px]' : 'text-[10px]'
            }`}>
              Christian Culture | polskieradio.cc
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION BUTTONS BAR (Thumb-friendly mobile layout) */}
      {/* 6 głównych przycisków o identycznym rozmiarze; Opublikuj na LUMINA jako 1. opcja */}
      {/* ========================================================================= */}
      <div className="w-full max-w-xl mx-auto mt-4 sm:mt-6 flex flex-col gap-2.5">
        {/* Row 1: [ ✨ Opublikuj na LUMINA (Promowana jako 1. opcja!) ] [ ❤️ Zapisz do Ulubionych ] */}
        <div className="grid grid-cols-2 gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePublishToLumina}
            disabled={isPublishingLumina}
            className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#dfb872] via-[#f3dfb8] to-[#dfb872] hover:from-[#e5c283] hover:to-[#ebd6a6] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-amber-500/20 ring-1 ring-amber-300/50 relative overflow-hidden group disabled:opacity-60"
            title="Opublikuj werset z grafiką na Tablicy Społeczności i Profilu LUMINA"
          >
            {isPublishingLumina ? (
              <>
                <Loader2 className="w-4 h-4 text-neutral-950 animate-spin" />
                <span>Publikowanie...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-neutral-950 group-hover:scale-110 transition-transform" />
                <span>Opublikuj na LUMINA</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            id="action-bar-favorite-btn"
            onClick={handleToggleFavorite}
            className={`py-3.5 px-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg border ${
              isSavedInLumina
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                : 'bg-white/[0.07] hover:bg-white/[0.12] border-white/12 hover:border-[#dfb872]/40 text-white'
            }`}
            title={
              isSavedInLumina
                ? 'Werset zapisany w Moje Wersety / Ulubione (kliknij, by usunąć)'
                : 'Zapisz do: Moje Wersety / Ulubione'
            }
          >
            <Heart
              className={`w-4 h-4 ${
                isSavedInLumina
                  ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                  : 'text-[#e8cb93]'
              }`}
            />
            <span>{isSavedInLumina ? 'W Ulubionych' : 'Do Ulubionych'}</span>
          </motion.button>
        </div>

        {/* Row 2: [ 🔄 Inny werset ] [ 🎨 Zmień tło ] */}
        <div className="grid grid-cols-2 gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextVerse}
            className="py-3.5 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 hover:border-[#d4af37]/40 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw className="w-4 h-4 text-[#e8cb93]" />
            <span>Inny werset</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenBackgroundModal}
            className="py-3.5 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 hover:border-[#d4af37]/40 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <ImageIcon className="w-4 h-4 text-[#e8cb93]" />
            <span>Zmień tło</span>
          </motion.button>
        </div>

        {/* Row 3: [ ↗ Udostępnij ] [ ↓ Pobierz grafikę ] */}
        <div className="grid grid-cols-2 gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShareClick}
            disabled={isGenerating}
            className="py-3.5 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 hover:border-[#d4af37]/40 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Share2 className="w-4 h-4 text-[#e8cb93]" />
            <span>Udostępnij</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadClick}
            disabled={isGenerating}
            className="py-3.5 px-4 rounded-2xl bg-white/[0.09] hover:bg-white/[0.15] border border-[#d4af37]/40 hover:border-[#e8cb93] text-[#f3dfb8] hover:text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#e8cb93]" />
            <span>Pobierz grafikę</span>
          </motion.button>
        </div>

        {/* Pasek Szybkiego Dedykowanego Udostępniania (WhatsApp, FB, Messenger, Telegram, X, Więcej) */}
        <div className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-medium shrink-0">
            <Share2 className="w-3.5 h-3.5 text-[#dfb872]" />
            <span className="hidden sm:inline">Udostępnij w:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* WhatsApp */}
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share_clicked', { method: 'whatsapp_strip', verse_id: verse.id })}
              className="w-8 h-8 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 flex items-center justify-center transition-all cursor-pointer shadow-sm group shrink-0"
              title="Udostępnij na WhatsApp (czat, grupa)"
            >
              <WhatsAppIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>

            {/* Facebook */}
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share_clicked', { method: 'facebook_strip', verse_id: verse.id })}
              className="w-8 h-8 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 flex items-center justify-center transition-all cursor-pointer shadow-sm group shrink-0"
              title="Udostępnij na Facebooku"
            >
              <FacebookIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>

            {/* Messenger */}
            <a
              href={socialLinks.messenger}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share_clicked', { method: 'messenger_strip', verse_id: verse.id })}
              className="w-8 h-8 rounded-xl bg-[#0084FF]/15 hover:bg-[#0084FF] text-[#0084FF] hover:text-white border border-[#0084FF]/30 flex items-center justify-center transition-all cursor-pointer shadow-sm group shrink-0"
              title="Wyślij przez Messenger"
            >
              <MessengerIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>

            {/* Telegram */}
            <a
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share_clicked', { method: 'telegram_strip', verse_id: verse.id })}
              className="w-8 h-8 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 flex items-center justify-center transition-all cursor-pointer shadow-sm group shrink-0"
              title="Wyślij na Telegram"
            >
              <TelegramIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>

            {/* X / Twitter */}
            <a
              href={socialLinks.x}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share_clicked', { method: 'x_strip', verse_id: verse.id })}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-sm group shrink-0"
              title="Opublikuj na 𝕏"
            >
              <XTwitterIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </a>

            {/* Więcej opcji udostępniania */}
            <button
              type="button"
              onClick={handleShareClick}
              className="py-1 px-2.5 rounded-xl bg-[#dfb872]/15 hover:bg-[#dfb872]/25 border border-[#dfb872]/40 text-[#f3dfb8] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ml-1"
              title="Więcej aplikacji (Instagram, Pinterest, LinkedIn, SMS, E-mail, Relacje)"
            >
              <span>Więcej</span>
              <ExternalLink className="w-3 h-3 text-[#dfb872]" />
            </button>
          </div>
        </div>


        {/* Propozycja: Głębsze Studium w MojaBiblia (Oryginał, Strong, 4 Przekłady) */}
        <motion.a
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          href={getMojaBibliaStudyUrl(verse)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#dfb872]/10 to-amber-500/15 hover:from-amber-500/25 hover:via-[#dfb872]/20 hover:to-amber-500/25 border border-[#dfb872]/45 hover:border-[#dfb872] text-[#f3dfb8] hover:text-white transition-all cursor-pointer shadow-lg group flex items-center justify-between gap-3"
          title={`Zbadaj ${verse.reference} w MojaBiblia: tekst interlinearny, greka/hebrajski, kody Stronga i 4 przekłady (UBG, BW, BT, BG)`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#dfb872]/20 border border-[#dfb872]/30 flex items-center justify-center text-[#dfb872] group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">Głębsze Studium: {verse.reference}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#dfb872]/20 text-[#f3dfb8] border border-[#dfb872]/30">
                  MojaBiblia
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-white/60 group-hover:text-white/80 font-normal truncate">
                Oryginał interlinearny · Kody Stronga · 4 przekłady (UBG, BW, BT, BG)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#dfb872] group-hover:text-[#f3dfb8] shrink-0 font-medium">
            <span className="hidden sm:inline">Zbadaj werset</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.a>

        {/* Quick Utility Tools Row: [ Kopiuj tekst ] [ Kopiuj link ] [ YouTube ] [ Powiadomienia ] */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white py-1.5 px-2.5 rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Kopiuj treść wersetu"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Skopiowano' : 'Kopiuj tekst'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white py-1.5 px-2.5 rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Kopiuj bezpośredni link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link skopiowany' : 'Kopiuj link'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNotificationModal && (
              <button
                onClick={onOpenNotificationModal}
                className={`inline-flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-full transition-colors cursor-pointer ${
                  notificationsOptIn
                    ? 'text-[#f3dfb8] bg-[#d4af37]/15 hover:bg-[#d4af37]/25'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Codzienne powiadomienie o Wersecie Dnia"
              >
                {notificationsOptIn ? (
                  <BellRing className="w-3.5 h-3.5 text-[#e8cb93]" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-[#e8cb93]" />
                )}
                <span className="hidden sm:inline">Powiadomienia</span>
              </button>
            )}

            <a
              href="https://youtube.com/@wersetdnia_chsb?si=KSamoERrUAtHFL96"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 py-1.5 px-2.5 rounded-full bg-red-500/[0.08] hover:bg-red-500/[0.16] border border-red-500/20 transition-colors cursor-pointer"
              title="Wideo rozważania na oficjalnym kanale YouTube Werset Dnia"
            >
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEMANTIC ARTICLE SECTION (SEO + AEO + GEO & Human Accessibility) */}
      {/* ========================================================================= */}
      <article className="w-full max-w-xl mx-auto mt-10 pt-8 border-t border-white/10 space-y-6 text-white/80">
        {/* Semantic Breadcrumbs */}
        <nav aria-label="Nawigacja okruszkowa" className="flex items-center gap-1.5 text-xs text-white/40 overflow-x-auto py-1">
          <button
            onClick={onBackToSearch}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Główna
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
          <span className="text-white/40">Wersety biblijne</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
          {onSelectTopic ? (
            <button
              onClick={() => onSelectTopic(verse.category)}
              className="hover:text-[#eed7a1] transition-colors cursor-pointer capitalize"
            >
              {verse.category}
            </button>
          ) : (
            <span className="capitalize">{verse.category}</span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
          <span className="text-[#e8cb93] font-medium truncate">{verse.reference}</span>
        </nav>

        {/* H1 Heading matching canonical intent */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-xs text-[#eed7a1]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pismo Święte: {verse.book}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-[#fdfbf7] tracking-tight">
            {verse.reference} — Tekst wersetu, przekład i rozważanie
          </h1>
        </header>

        {/* Direct Biblical Quotation in blockquote */}
        <section aria-labelledby="canonical-text-heading" className="p-5 rounded-2xl bg-white/[0.02] border border-[#d4af37]/25 space-y-3">
          <h2 id="canonical-text-heading" className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider flex items-center justify-between">
            <span>Tekst kanoniczny</span>
            <span className="text-white/40 font-normal">{verse.translation}</span>
          </h2>
          <blockquote className="text-base sm:text-lg font-serif text-white/95 italic leading-relaxed pl-3 border-l-2 border-[#d4af37]/60">
            „{verse.text}”
          </blockquote>
        </section>

        {/* Structured Scripture Details Table */}
        <section aria-labelledby="scripture-details-heading" className="space-y-3">
          <h2 id="scripture-details-heading" className="text-sm font-semibold text-white/90">
            Szczegóły fragmentu biblijnego
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block mb-1">Księga</span>
              <span className="text-white/90 font-medium">{verse.book} ({verse.bookShort})</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block mb-1">Lokalizacja wersetu</span>
              <span className="text-[#f3dfb8] font-medium text-xs sm:text-sm block">
                {verse.reference.replace(':', ' wer. ')}
              </span>
              <span className="text-white/50 text-[11px] block mt-0.5">
                Rozdz. {verse.chapter}, wer. {verse.verse} ({verse.bookShort} {verse.chapter},{verse.verse})
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block mb-1">Przekład</span>
              <span className="text-white/90 font-medium">{verse.translation}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block mb-1">Kategoria</span>
              {onSelectTopic ? (
                <button
                  onClick={() => onSelectTopic(verse.category)}
                  className="text-[#eed7a1] hover:underline font-medium text-left capitalize cursor-pointer"
                >
                  {verse.category} →
                </button>
              ) : (
                <span className="text-[#eed7a1] font-medium capitalize">{verse.category}</span>
              )}
            </div>
          </div>
        </section>

        {/* Głębsze Studium w MojaBiblia (Oryginał i 4 przekłady) */}
        <section aria-labelledby="deep-study-heading" className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1a1711] via-[#101319] to-[#0d1017] border border-[#dfb872]/40 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3dfb8] uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#dfb872]" />
              <h2 id="deep-study-heading">Głębsze Studium Słowa — MojaBiblia</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#dfb872]/15 text-[#eed7a1] border border-[#dfb872]/30 font-medium">
              Interlinear · Kody Stronga · 4 Przekłady
            </span>
          </div>

          <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light">
            Chcesz poznać pierwotny sens wersetu <strong className="text-white font-medium">{verse.reference}</strong>? W serwisie MojaBiblia możesz zbadać oryginalny tekst biblijny w języku hebrajskim lub greckim, sprawdzić kody Stronga i analizę morfologiczną słowo po słowie, a także porównać 4 przekłady równoległe: <span className="text-[#f3dfb8] font-medium">UBG (Uwspółcześniona Biblia Gdańska), BW (Biblia Warszawska), BT (Biblia Tysiąclecia) i BG (Biblia Gdańska)</span>.
          </p>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
            <span className="text-[11px] text-white/40">polskieradio.cc/mojabiblia</span>
            <a
              href={getMojaBibliaStudyUrl(verse)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dfb872] to-[#c79b50] hover:from-[#e5c283] hover:to-[#d4af65] text-neutral-950 font-bold text-xs shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Otwórz {verse.reference} w MojaBiblia</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Theological context & Reflection (Christian Culture Commentary) */}
        <section aria-labelledby="editorial-context-heading" className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#e8cb93] uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            <span>Komentarz i kontekst — Christian Culture</span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
            Słowo Boże z {verse.reference} przypomina nam o Bożej wierności i prowadzeniu w codziennym życiu.
            Każdy werset Pisma Świętego jest natchniony przez Boga i pożyteczny do nauki, do strofowania, do poprawy i do wychowania w sprawiedliwości.
            Komentarz i opracowanie graficzne przygotowane przez redakcję Christian Culture.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <span>Redakcja Biblijna Christian Culture</span>
            <span>polskieradio.cc</span>
          </div>
        </section>

        {/* Category Hub Link banner */}
        {onSelectTopic && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-white/40">Odkryj więcej wersetów w tej kategorii:</div>
              <div className="text-sm font-medium text-[#eed7a1] capitalize">{verse.category}</div>
            </div>
            <button
              onClick={() => onSelectTopic(verse.category)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-xs text-[#f3dfb8] transition-colors cursor-pointer"
            >
              <span>Zobacz temat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Canonical Footnote & Platform Clarity */}
        <footer className="pt-4 border-t border-white/5 text-[11px] text-white/40 flex flex-wrap items-center justify-between gap-2">
          <span>Mój Werset Dnia — narzędzie biblijne Christian Culture</span>
          <span>Domena: polskieradio.cc</span>
        </footer>
      </article>

      {/* Modal Sukcesu Publikacji na Tablicy Społeczności i Profilu LUMINA */}
      <LuminaPublishSuccessModal
        isOpen={isPublishSuccessModalOpen}
        result={publishedResult}
        onClose={() => setIsPublishSuccessModalOpen(false)}
      />
    </div>
  );
};
