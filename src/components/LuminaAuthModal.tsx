import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { LuminaUser } from '../types';
import { loginToLumina, SPECIAL_PROFILES } from '../services/luminaAuth';
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
  const [mode, setMode] = useState<'prompt' | 'login' | 'register'>('prompt');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleQuickLogin = (selectedEmail: string, selectedName?: string) => {
    trackEvent('lumina_login_started', { type: 'quick' });
    const user = loginToLumina(selectedEmail, selectedName);
    onSuccess(user);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Wprowadź prawidłowy adres e-mail');
      return;
    }
    trackEvent('lumina_login_started', { type: mode });
    const user = loginToLumina(email, name);
    onSuccess(user);
    onClose();
  };

  const handleGuestContinue = () => {
    // Instant guest access with preserved LUMINA guest session
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
            className="relative w-full max-w-md bg-[#10131a] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl golden-glow text-center z-10"
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

        {mode === 'prompt' && (
          <>
            {/* Required title from prompt specification */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              ❤️ Twój werset jest gotowy
            </h2>

            {/* Required body text from prompt specification */}
            <p className="text-white/70 text-sm leading-relaxed mb-6 font-light">
              Dołącz bezpłatnie do społeczności <span className="text-[#f3dfb8] font-medium">Christian Culture — LUMINA</span>, aby pobierać i udostępniać swoje wersety.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-3 mb-4">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#dfb872] to-[#c99f50] hover:from-[#e8cb93] hover:to-[#d4af37] text-neutral-950 font-bold text-sm uppercase tracking-wide transition-all shadow-lg shadow-[#d4af37]/15 cursor-pointer"
              >
                ZALOGUJ SIĘ
              </button>

              <button
                type="button"
                onClick={() => setMode('register')}
                className="w-full py-3.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-[#d4af37]/50 text-white font-semibold text-sm uppercase tracking-wide transition-all cursor-pointer"
              >
                ZAŁÓŻ DARMOWE KONTO
              </button>
            </div>

            {/* Instant Guest Mode (so no user is blocked) */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleGuestContinue}
                className="text-xs text-[#eed7a1] hover:text-[#fff] hover:underline transition-colors py-1 cursor-pointer font-medium"
              >
                Kontynuuj natychmiast (bez hasła) →
              </button>
            </div>

            {/* Quick access profiles */}
            <div className="mt-4 pt-3 text-left">
              <span className="text-[11px] text-white/40 uppercase tracking-wider block mb-2 font-medium">
                Szybki dostęp z profilu LUMINA:
              </span>
              <div className="flex flex-col gap-1.5">
                {SPECIAL_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleQuickLogin(p.email, p.name)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-[#d4af37]/10 border border-white/5 hover:border-[#d4af37]/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-[#f3dfb8]">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-white/50">{p.role}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#e8cb93]" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleSubmit} className="text-left">
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              {mode === 'login' ? 'Logowanie do LUMINA' : 'Załóż konto w LUMINA'}
            </h2>
            <p className="text-xs text-white/60 mb-5 text-center">
              {mode === 'login'
                ? 'Wpisz swój adres e-mail, aby powrócić do wersetu'
                : 'Dołącz do społeczności Christian Culture (polskieradio.cc)'}
            </p>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs mb-3">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="mb-3">
                <label className="block text-xs text-white/70 mb-1 font-medium">Imię / Pseudonim</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Maria"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#d4af37] text-white text-sm focus:outline-none"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-white/70 mb-1 font-medium">Adres e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                placeholder="twoj@adres.pl"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#d4af37] text-white text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#dfb872] to-[#c99f50] hover:from-[#e8cb93] hover:to-[#dfb872] text-neutral-950 font-bold text-sm uppercase tracking-wide transition-all shadow-lg shadow-[#d4af37]/15 cursor-pointer mb-3"
            >
              {mode === 'login' ? 'ZALOGUJ SIĘ I KONTYNUUJ' : 'ZAREJESTRUJ I KONTYNUUJ'}
            </button>

            <button
              type="button"
              onClick={() => setMode('prompt')}
              className="w-full text-center text-xs text-white/50 hover:text-white transition-colors py-1 cursor-pointer"
            >
              ← Powrót
            </button>
          </form>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
