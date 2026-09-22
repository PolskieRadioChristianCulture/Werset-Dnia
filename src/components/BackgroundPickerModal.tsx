import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, Upload } from 'lucide-react';
import { BACKGROUNDS } from '../data/backgrounds';
import { BackgroundTheme } from '../types';

interface BackgroundPickerModalProps {
  isOpen: boolean;
  currentBgId: string;
  customBackgrounds?: BackgroundTheme[];
  onOpenUploadModal?: () => void;
  onSelectBackground: (bg: BackgroundTheme) => void;
  onClose: () => void;
}

export const BackgroundPickerModal: React.FC<BackgroundPickerModalProps> = ({
  isOpen,
  currentBgId,
  customBackgrounds = [],
  onOpenUploadModal,
  onSelectBackground,
  onClose,
}) => {
  const allBackgrounds = [...customBackgrounds, ...BACKGROUNDS];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-[#0f1218] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[88vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎨</span>
                  <span>Wybierz tło dla wersetu</span>
                </h2>
                <p className="text-xs text-white/50">
                  Dopasuj nastrój i atmosferę grafiki do Słowa Bożego
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onOpenUploadModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUploadModal();
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#dfb872]/20 hover:bg-[#dfb872]/30 border border-[#dfb872]/50 text-[#f3dfb8] text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    title="Wgraj własne tło"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#dfb872]" />
                    <span className="hidden sm:inline">Wgraj własne</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Zamknij"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Backgrounds Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1 no-scrollbar flex-1 pb-2">
              {/* Optional Quick Upload Card at start */}
              {onOpenUploadModal && (
                <motion.button
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.975 }}
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUploadModal();
                  }}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] border-2 border-dashed border-[#dfb872]/40 hover:border-[#dfb872] bg-[#dfb872]/5 hover:bg-[#dfb872]/10 transition-all flex flex-col items-center justify-center gap-2 text-center p-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#dfb872]/20 text-[#e8cb93] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      + Wgraj własne tło
                    </span>
                    <span className="text-[10px] text-[#f3dfb8]/70 block">
                      Z pliku lub URL
                    </span>
                  </div>
                </motion.button>
              )}

              {allBackgrounds.map((bg) => {
                const isSelected = bg.id === currentBgId;
                return (
                  <motion.button
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.975 }}
                    key={bg.id}
                    type="button"
                    onClick={() => {
                      onSelectBackground(bg);
                      onClose();
                    }}
                    className={`relative rounded-2xl overflow-hidden aspect-[4/3] group border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-[#dfb872] ring-2 ring-[#dfb872]/40'
                        : 'border-white/10 hover:border-[#dfb872]/50'
                    }`}
                  >
                    <img
                      src={bg.thumbnailUrl}
                      alt={bg.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#dfb872] text-neutral-950 flex items-center justify-center font-bold shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-xs font-semibold text-white drop-shadow truncate">
                        {bg.name.split('—')[0].trim()}
                      </div>
                      <div className="text-[10px] text-[#f3dfb8] drop-shadow truncate font-light">
                        {bg.mood}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
