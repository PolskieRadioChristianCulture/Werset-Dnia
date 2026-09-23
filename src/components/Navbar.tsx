import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuminaUser } from '../types';
import { Bookmark, Sparkles, Bell, BellRing, BookOpen, Plus, LogOut, User, ChevronDown, ExternalLink } from 'lucide-react';

interface NavbarProps {
  user: LuminaUser | null;
  savedCount: number;
  soundEnabled?: boolean;
  notificationsOptIn: boolean;
  onToggleSound?: () => void;
  onOpenNotificationModal: () => void;
  onOpenSavedModal: () => void;
  onOpenAuthModal: () => void;
  onOpenUploadModal: () => void;
  onGoHome: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  savedCount,
  notificationsOptIn,
  onOpenNotificationModal,
  onOpenSavedModal,
  onOpenAuthModal,
  onOpenUploadModal,
  onGoHome,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Clean displayName - never display raw email addresses
  const displayName = React.useMemo(() => {
    if (!user || !user.name) return 'Społeczność LUMINA';
    if (user.name.includes('@')) {
      return 'Społeczność LUMINA';
    }
    return user.name;
  }, [user]);

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
              <span className="text-[10px] text-white/50 tracking-wider">
                polskieradio.cc
              </span>
            </div>
          </motion.a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add / Personalize Custom Background (+) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenUploadModal}
            id="navbar-add-bg-btn"
            aria-label="Wgraj własne tło"
            title="Wgraj własne tło do serwisu"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b38e28]/20 hover:from-[#d4af37]/35 hover:to-[#b38e28]/35 border border-[#d4af37]/40 hover:border-[#e8cb93]/70 flex items-center justify-center text-[#f3dfb8] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#e8cb93]" />
          </motion.button>

          {/* Notification Opt-in */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenNotificationModal}
            aria-label="Powiadomienia o wersecie dnia"
            title="Powiadomienia o wersecie dnia"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              notificationsOptIn
                ? 'bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f3dfb8]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white'
            }`}
          >
            {notificationsOptIn ? (
              <>
                <BellRing className="w-4 h-4 text-[#e8cb93]" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#dfb872] ring-2 ring-[#07080a]" />
              </>
            ) : (
              <Bell className="w-4 h-4 text-white/50 hover:text-white/80" />
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
          {user && user.isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs text-[#f3dfb8] transition-all cursor-pointer"
                title="Konto społeczności LUMINA"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-5 h-5 rounded-full object-cover border border-[#d4af37]/40"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/30 flex items-center justify-center text-[10px] font-bold text-[#f3dfb8]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[110px] truncate font-medium">{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#dfb872]/80 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* User Dropdown Menu with Logout & Community Profile Link */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-64 bg-[#0d1017]/95 border border-[#d4af37]/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl z-50 text-left"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center font-bold text-[#f3dfb8]">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">{displayName}</span>
                        <span className="text-[11px] text-[#dfb872] tracking-wide font-medium">Społeczność LUMINA 🕊️</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <a
                        href={`https://polskieradio.cc/lumina-profile.html?u=${encodeURIComponent(user.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-[#dfb872]" />
                          <span>Mój profil w LUMINA</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-white/40" />
                      </a>
                      <button
                        type="button"
                        onClick={() => { setIsUserMenuOpen(false); onOpenSavedModal(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                      >
                        <Bookmark className="w-4 h-4 text-[#dfb872]" />
                        <span>Moje zapisane wersety ({savedCount})</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Wyloguj się</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
