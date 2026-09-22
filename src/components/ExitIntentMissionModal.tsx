import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Sparkles,
  Smartphone,
  CreditCard,
  Globe,
  Radio,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface ExitIntentMissionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ExitIntentMissionModal: React.FC<ExitIntentMissionModalProps> = ({
  isOpen: externalIsOpen = false,
  onClose: externalOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isOpen = externalIsOpen || internalIsOpen;

  // Exit intent listener for desktop and session tracking
  useEffect(() => {
    // Check if shown in this session
    const hasBeenShown = sessionStorage.getItem('cc_mission_exit_shown');
    if (hasBeenShown === 'true') return;

    let timeoutId: number;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when cursor leaves through the top of the viewport (intent to change tab or close)
      if (e.clientY <= 12 && !sessionStorage.getItem('cc_mission_exit_shown')) {
        sessionStorage.setItem('cc_mission_exit_shown', 'true');
        setInternalIsOpen(true);
        try {
          trackEvent('topic_viewed', { action: 'exit_intent_triggered' });
        } catch {
          // ignore
        }
      }
    };

    // Delay activation of exit-intent by 3.5 seconds to let page settle
    timeoutId = window.setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3500);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setInternalIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop with dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Banner Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#0d0f15] border border-[#dfb872]/40 rounded-3xl p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85)] z-10 overflow-hidden my-auto"
          >
            {/* Ambient Background Warm Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#d4af37]/15 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-red-600/10 rounded-full blur-[90px] pointer-events-none" />

            {/* Top Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-20"
              title="Zamknij okno"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Brand & Tagline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10 pr-8">
              <div className="flex items-center gap-2.5">
                {/* Red Cross Icon */}
                <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-lg">
                  ✝
                </div>
                <div>
                  <div className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wide">
                    CHRISTIAN CULTURE
                  </div>
                  <div className="text-[10px] text-white/50 tracking-wider uppercase font-sans">
                    Media z Wartościami
                  </div>
                </div>
              </div>

              <div className="text-[10px] sm:text-xs text-[#dfb872] font-semibold tracking-wider uppercase flex items-center gap-2">
                <span>Ewangelia</span>
                <span className="text-white/30">•</span>
                <span>Ludzie</span>
                <span className="text-white/30">•</span>
                <span>Realne Zmiany</span>
              </div>
            </div>

            {/* Main Headline & Message */}
            <div className="text-center py-5">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-cinzel leading-none mb-2">
                WESPRZYJ <span className="text-red-500">MISJĘ</span>
              </h2>
              <div className="text-xs sm:text-sm font-semibold tracking-widest text-[#f3dfb8] uppercase mb-2 font-cinzel">
                CHRISTIAN CULTURE
              </div>
              <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto font-sans leading-relaxed">
                Razem docieramy z Ewangelią do ludzi na całym świecie. Każda modlitwa, udostępnienie i dar mają realne znaczenie.
              </p>
            </div>

            {/* 3 Pillars: Módl się, Udostępniaj, Wspieraj */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 px-2 bg-white/[0.02] border border-white/5 rounded-2xl mb-5 text-center">
              <div className="p-2 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#dfb872]/15 text-[#dfb872] flex items-center justify-center mx-auto mb-1.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">MÓDL SIĘ</div>
                <div className="text-[10px] text-white/50 hidden sm:block mt-0.5">
                  Polecaj nasze treści bliskim
                </div>
              </div>

              <div className="p-2 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center mx-auto mb-1.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">UDOSTĘPNIAJ</div>
                <div className="text-[10px] text-white/50 hidden sm:block mt-0.5">
                  Pomóż nam docierać dalej
                </div>
              </div>

              <div className="p-2 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-1.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">WSPIERAJ</div>
                <div className="text-[10px] text-white/50 hidden sm:block mt-0.5">
                  Każdy dar ma znaczenie
                </div>
              </div>
            </div>

            {/* Support Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* 1. PATRONITE */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-red-500/50 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-red-500 font-bold text-xs">
                      P
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-wider">PATRONITE</div>
                      <div className="text-[11px] text-white/50">patronite.pl/osobowoscplus</div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://patronite.pl/osobowoscplus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md mt-2"
                >
                  <span>ZOSTAŃ PATRONEM</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 2. REVOLUT */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/50 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      R
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-wider">Revolut</div>
                      <div className="text-[11px] text-white/50">revolut.me/christianculture</div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://revolut.me/christianculture"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-[#0075eb] hover:bg-[#1a85f5] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md mt-2"
                >
                  <span>SZYBKIE WSPARCIE</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3. BLIK */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/50 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-purple-400/40 flex items-center justify-center text-white font-extrabold text-[10px]">
                      blik
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">BLIK na numer:</div>
                      <div className="text-sm font-extrabold text-[#dfb872] tracking-wider font-mono">
                        537 137 043
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('537 137 043', 'blik')}
                  className="w-full py-2 px-3 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
                >
                  {copiedField === 'blik' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">SKOPIOWANO NUMER!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>KOPIUJ NUMER BLIK</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4. PRZELEW BANKOWY */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/50 flex flex-col justify-between transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Przelew bankowy:</span>
                  </div>
                  <div className="text-[11px] font-mono text-white/90 bg-black/40 px-2 py-1 rounded border border-white/5 break-all">
                    48 2910 0006 0000 0000 0527 2629
                  </div>
                  <div className="text-[10px] text-white/60 mt-1">
                    Tytuł: <span className="text-[#f3dfb8] font-semibold">„Dar misyjny”</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard('48291000060000000005272629', 'bank')
                  }
                  className="w-full py-2 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
                >
                  {copiedField === 'bank' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">SKOPIOWANO KONTO!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>KOPIUJ NUMER KONTA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom bar with cclite.pl ecosystem & gratitude */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <a
                href="https://cclite.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#dfb872] hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>cclite.pl</span>
                <span className="text-white/40 text-[10px] hidden md:inline">
                  | Aplikacja • Radio • TV • Społeczność • Biblia
                </span>
              </a>

              <div className="font-cormorant italic text-base sm:text-lg text-[#f3dfb8] font-semibold flex items-center gap-1">
                <span>Dziękujemy, że jesteś!</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 inline" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
