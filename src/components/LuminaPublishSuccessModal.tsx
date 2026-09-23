import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ExternalLink, User, X, CheckCircle2 } from 'lucide-react';
import { PublishResult } from '../services/luminaCommunityPublisher';

interface LuminaPublishSuccessModalProps {
  isOpen: boolean;
  result: PublishResult | null;
  onClose: () => void;
}

export const LuminaPublishSuccessModal: React.FC<LuminaPublishSuccessModalProps> = ({
  isOpen,
  result,
  onClose,
}) => {
  if (!isOpen || !result) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#0e1117] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-center overflow-hidden"
        >
          {/* Decorative ambient glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Icon */}
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <CheckCircle2 className="w-8 h-8 text-neutral-950" />
          </div>

          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2">
            Werset Opublikowany na LUMINA!
          </h3>

          <p className="text-white/70 text-sm leading-relaxed mb-5">
            Twoja grafika ze stopką <span className="text-[#f3dfb8] font-semibold">„Mój Werset Dnia” Christian Culture | polskieradio.cc</span> została automatycznie opublikowana na publicznej <span className="text-[#f3dfb8] font-semibold">Tablicy Społeczności</span> oraz w Twoim <span className="text-[#f3dfb8] font-semibold">Profilu Osobistym</span>.
          </p>

          {/* Thumbnail preview of the generated card with watermark */}
          {result.cardDataUrl && (
            <div className="relative mx-auto mb-6 max-w-[220px] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black/40">
              <img
                src={result.cardDataUrl}
                alt="Wygenerowana karta z wersetem"
                className="w-full h-auto object-contain max-h-[220px]"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent py-1.5 px-2 text-[10px] text-amber-200/90 font-medium">
                Ze stopką Christian Culture | polskieradio.cc
              </div>
            </div>
          )}

          {/* Action links */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={result.feedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#dfb872] via-[#f3dfb8] to-[#dfb872] hover:from-[#e5c283] hover:to-[#ebd6a6] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/15"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>Zobacz na Tablicy</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-950/70" />
            </a>

            <a
              href={result.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-300" />
              <span>Mój Profil LUMINA</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="mt-4 text-xs text-white/40 hover:text-white transition-colors cursor-pointer py-1 px-3"
          >
            Zamknij i zostań w wersetach
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
