import React from 'react';
import { motion } from 'motion/react';
import { LuminaUser } from '../types';
import { Bookmark, Volume2, VolumeX, Sparkles, Bell, BellRing, BookOpen, Plus } from 'lucide-react';

interface NavbarProps {
  user: LuminaUser | null;
  savedCount: number;
  soundEnabled: boolean;
  notificationsOptIn: boolean;
  onToggleSound: () => void;
  onOpenNotificationModal: () => void;
  onOpenSavedModal: () => void;
  onOpenAuthModal: () => void;
  onOpenUploadModal: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  savedCount,
  soundEnabled,
  notificationsOptIn,
  onToggleSound,
  onOpenNotificationModal,
  onOpenSavedModal,
  onOpenAuthModal,
  onOpenUploadModal,
  onGoHome,
}) => {
  return (
    <header className="w-full fixed top-0 left-0 z-40 px-2 sm:px-4 py-3 bg-[#07080a]/85 backdrop-blur-md border-b border-white/[0.06] transition-all">
      <div className="w-full px-2 sm:px-4 md:px-8 flex items-center justify-between">
        {/* Left Brand - Linked to https://polskieradio.cc/ */}
        <div className="flex items-center gap-3">
          <motion.a
            href="https://polskieradio.cc/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Przejdź do oficjalnego portalu Christian Culture (polskieradio.cc)"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37]/20 to-[#997a26]/20 border border-[#d4af37]/35 flex items-center justify-center text-[#e8cb93] group-hover:border-[#e8cb93]/60 transition-colors shadow-sm">
              <BookOpen className="w-4 h-4 text-[#e8cb93]" />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-xs tracking-widest text-[#e8cb93] uppercase font-semibold">
                Christian Culture
              </span>
              <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors flex items-center gap-1">
                polskieradio.cc
                <span className="text-[10px] text-[#e8cb93]/60 group-hover:text-[#e8cb93]">↗</span>
              </span>
            </div>
          </motion.a>
        </div>

        {/* Right Corner Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add custom background (+) button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenUploadModal}
            id="navbar-upload-bg-btn"
            aria-label="Wgraj własne tło"
            title="Wgraj własne tło na stronę główną i do wersetu (+)"
            className="w-9 h-9 rounded-full bg-[#dfb872]/15 hover:bg-[#dfb872]/25 border border-[#dfb872]/50 hover:border-[#dfb872] text-[#dfb872] flex items-center justify-center transition-all cursor-pointer shadow-sm group"
          >
            <Plus className="w-4 h-4 text-[#dfb872] group-hover:rotate-90 transition-transform duration-300" />
          </motion.button>

          {/* Notification Opt-In Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenNotificationModal}
            aria-label="Powiadomienia o Wersecie Dnia"
            title={
              notificationsOptIn
                ? 'Powiadomienia o Wersecie Dnia są aktywne'
                : 'Włącz powiadomienia o Wersecie Dnia'
            }
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              notificationsOptIn
                ? 'bg-[#d4af37]/15 border border-[#d4af37]/45 text-[#e8cb93] hover:bg-[#d4af37]/25 shadow-sm'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white'
            }`}
          >
            {notificationsOptIn ? (
              <>
                <BellRing className="w-4 h-4 text-[#e8cb93]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#dfb872] ring-2 ring-[#07080a]" />
              </>
            ) : (
              <Bell className="w-4 h-4 text-white/50 hover:text-white/80" />
            )}
          </motion.button>

          {/* Audio Chime Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Wycisz dźwięk' : 'Włącz dźwięk'}
            title={soundEnabled ? 'Dźwięk włączony' : 'Dźwięk wyciszony'}
            className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#e8cb93]" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/40" />
            )}
          </motion.button>

          {/* Moje Wersety (Saved Verses) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSavedModal}
            id="navbar-saved-verses-btn"
            aria-label="Moje zapisane wersety"
            title="Moje zapisane wersety"
            className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-[#d4af37]/35 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer relative"
          >
            <Bookmark className="w-4 h-4 text-[#e8cb93]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d4af37] text-[#07080a] text-[10px] font-bold flex items-center justify-center shadow-sm">
                {savedCount}
              </span>
            )}
          </motion.button>

          {/* User profile / Login to LUMINA */}
          {user ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-transparent hover:bg-white/[0.06] border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs text-[#f3dfb8] transition-all cursor-pointer"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#d4af37]/30 flex items-center justify-center text-[10px] font-bold text-[#f3dfb8]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="max-w-[100px] truncate font-medium">{user.name}</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-white/[0.06] border border-[#d4af37]/40 hover:border-[#e8cb93]/80 text-xs text-[#f3dfb8] hover:text-white font-medium transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e8cb93]" />
              <span>LUMINA</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
