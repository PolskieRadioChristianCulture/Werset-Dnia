import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Loader2 } from 'lucide-react';
import { LuminaUser } from '../types';
import { loginToLumina } from '../services/luminaAuth';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { syncUserProfileToFirestore } from '../services/firebaseSync';
import { trackEvent } from '../utils/analytics';

interface LuminaAuthModalProps {
  isOpen: boolean;
  pendingAction?: 'download' | 'share' | 'save' | null;
  onClose: () => void;
  onSuccess: (user: LuminaUser) => void;
}

export const LuminaAuthModal: React.FC<LuminaAuthModalProps> = ({
  isOpen,
  pendingAction,
  onClose,
  onSuccess,
}) => {
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      trackEvent('lumina_login_started', { type: 'google_firebase' });
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      localStorage.removeItem('cc_user_explicitly_logged_out');

      let cleanName = firebaseUser.displayName;
      if (!cleanName || cleanName.includes('@')) {
        cleanName = 'Członek Społeczności LUMINA';
      }

      const luminaUser: LuminaUser = {
        id: firebaseUser.uid,
        name: cleanName,
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || undefined,
        role: 'Społeczność LUMINA',
        isLoggedIn: true,
        savedVerseIds: [],
        history: [],
      };

      await syncUserProfileToFirestore(luminaUser);
      onSuccess(luminaUser);
      onClose();
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      const errMsg =
        err instanceof Error
          ? err.message.includes('popup-closed-by-user')
            ? 'Logowanie zostało anulowane.'
            : 'Błąd logowania przez Google. Spróbuj ponownie.'
          : 'Wystąpił błąd podczas logowania.';
      setError(errMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestContinue = () => {
    trackEvent('lumina_login_started', { type: 'guest_instant' });
    const guestUser = loginToLumina('gosc@polskieradio.cc', 'Gość Christian Culture');
    onSuccess(guestUser);
    onClose();
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
            className="relative w-full max-w-md bg-[#10131a] border border-[#dfb872]/40 rounded-3xl p-6 sm:p-8 shadow-2xl golden-glow text-center z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Heart Icon / Header */}
            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#e8cb93] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 fill-[#d4af37]/20 text-[#e8cb93]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-cinzel">
              ❤️ Twój werset jest gotowy
            </h2>

            <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6 font-light">
              Zaloguj się kontem <span className="text-[#f3dfb8] font-medium">Google</span>, aby zapisać swoje ulubione wersety i autorskie tła w chmurze portalu{' '}
              <span className="text-[#dfb872] font-semibold">Christian Culture — LUMINA</span>.
            </p>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs mb-4 text-center">
                {error}
              </div>
            )}

            {/* Google Sign-In Only */}
            <div className="flex flex-col gap-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Zaloguj przez Google</span>
              </button>
            </div>

            {/* Instant Guest Mode */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleGuestContinue}
                className="text-xs text-[#eed7a1] hover:text-[#fff] hover:underline transition-colors py-1 cursor-pointer font-medium"
              >
                Kontynuuj jako gość (bez logowania) →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
