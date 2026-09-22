import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, History, Trash2, ArrowUpRight, BookOpen, Share2 } from 'lucide-react';
import { BibleVerse, LuminaUser } from '../types';
import { getVerseById } from '../data/verses';
import { removeVerseFromFavorites } from '../services/luminaAuth';

interface SavedVersesModalProps {
  isOpen: boolean;
  user: LuminaUser | null;
  savedVerseIds: string[];
  history: { verseId: string; bgId: string; timestamp: number }[];
  onSelectVerse: (verse: BibleVerse, bgId?: string) => void;
  onUpdateSavedIds: (ids: string[]) => void;
  onClose: () => void;
}

export const SavedVersesModal: React.FC<SavedVersesModalProps> = ({
  isOpen,
  user,
  savedVerseIds,
  history,
  onSelectVerse,
  onUpdateSavedIds,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  const handleRemoveFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = removeVerseFromFavorites(id);
    onUpdateSavedIds(updated);
  };

  const favoriteVerses = savedVerseIds
    .map((id) => getVerseById(id))
    .filter((v): v is BibleVerse => v !== undefined);

  const historyItems = history
    .map((item) => ({
      ...item,
      verse: getVerseById(item.verseId),
    }))
    .filter((item): item is { verseId: string; bgId: string; timestamp: number; verse: BibleVerse } => item.verse !== undefined);

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
            className="relative w-full max-w-xl bg-[#0f1219] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[85vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#e8cb93]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">MOJE WERSETY</h2>
                  <span className="text-xs text-[#eed7a1]/85">
                    {user ? `${user.name} • LUMINA Christian Culture` : 'Twoja duchowa biblioteczka'}
                  </span>
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

            {/* Tabs: Ulubione vs Historia */}
            <div className="flex gap-2 my-4 p-1 bg-white/[0.04] rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-[#dfb872] text-neutral-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>❤️ Ulubione ({favoriteVerses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#dfb872] text-neutral-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>📅 Historia ({historyItems.length})</span>
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-2.5">
              {activeTab === 'favorites' && (
                <>
                  {favoriteVerses.length === 0 ? (
                    <div className="py-12 text-center text-white/40">
                      <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nie masz jeszcze zapisanych wersetów.</p>
                      <p className="text-xs mt-1 text-white/30">
                        Kliknij „Zapisz w LUMINA” na karcie wersetu, aby zachować go w sercu.
                      </p>
                    </div>
                  ) : (
                    favoriteVerses.map((v) => (
                      <motion.div
                        key={v.id}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                          onSelectVerse(v);
                          onClose();
                        }}
                        className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-[#d4af37]/10 border border-white/10 hover:border-[#d4af37]/40 transition-all cursor-pointer group flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#f3dfb8] group-hover:text-white">
                              {v.reference}
                            </span>
                            <span className="text-[10px] text-white/40 px-1.5 py-0.5 rounded bg-white/5">
                              {v.translation}
                            </span>
                          </div>
                          <p className="text-xs text-white/80 line-clamp-2 mt-1 font-cormorant italic text-base leading-snug">
                            „{v.text}”
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleRemoveFavorite(e, v.id)}
                            className="p-1.5 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                            title="Usuń z ulubionych"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="p-1.5 text-white/30 group-hover:text-amber-400">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <>
                  {historyItems.length === 0 ? (
                    <div className="py-12 text-center text-white/40">
                      <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Brak historii przeglądania.</p>
                    </div>
                  ) : (
                    historyItems.map((item, idx) => (
                      <motion.div
                        key={`${item.verseId}-${idx}`}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                          onSelectVerse(item.verse, item.bgId);
                          onClose();
                        }}
                        className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer group flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-amber-300">
                              {item.verse.reference}
                            </span>
                            <span className="text-[10px] text-white/40">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-white/80 line-clamp-1 mt-1 font-cormorant italic text-base">
                            „{item.verse.text}”
                          </p>
                        </div>

                        <div className="p-1.5 text-white/30 group-hover:text-amber-400">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
