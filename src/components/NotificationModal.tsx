import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  BellOff,
  Check,
  X,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Send,
} from 'lucide-react';
import { BibleVerse } from '../types';
import {
  isNotificationSupported,
  isServiceWorkerSupported,
  getNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  disableNotifications,
  sendVerseNotification,
  NotificationSettings,
} from '../services/notificationService';
import { playSpiritualChime } from '../utils/audioChime';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVerse: BibleVerse;
  soundEnabled: boolean;
  onSettingsChange?: (settings: NotificationSettings) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  currentVerse,
  soundEnabled,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [testSent, setTestSent] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getNotificationSettings());
      setPermission(getNotificationPermission());
      setStatusMessage(null);
      setTestSent(false);
    }
  }, [isOpen]);

  const supported = isNotificationSupported();

  const handleToggleOptIn = async () => {
    setIsProcessing(true);
    setStatusMessage(null);

    if (settings.optIn) {
      // Turn off
      const updated = disableNotifications();
      setSettings(updated);
      onSettingsChange?.(updated);
      setStatusMessage({ type: 'info', text: 'Powiadomienia o Wersecie Dnia zostały wyłączone.' });
      setIsProcessing(false);
      return;
    }

    // Turn ON: request permission
    const result = await requestNotificationPermission();
    setPermission(result.status);

    if (result.granted) {
      const updated = saveNotificationSettings({ optIn: true });
      setSettings(updated);
      onSettingsChange?.(updated);
      if (soundEnabled) playSpiritualChime();
      setStatusMessage({
        type: 'success',
        text: 'Wspaniale! Powiadomienia zostały aktywowane. Otrzymasz Słowo Boże o wybranej godzinie.',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Nie udało się włączyć powiadomień. Sprawdź uprawnienia przeglądarki.',
      });
    }

    setIsProcessing(false);
  };

  const handleTimeChange = (newTime: string) => {
    const updated = saveNotificationSettings({ time: newTime });
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleSendTestNotification = async () => {
    setIsProcessing(true);
    setStatusMessage(null);

    // If permission not granted yet, try to request
    if (permission !== 'granted') {
      const permResult = await requestNotificationPermission();
      setPermission(permResult.status);
      if (!permResult.granted) {
        setStatusMessage({
          type: 'error',
          text: permResult.error || 'Wymagane jest zezwolenie na powiadomienia w przeglądarce.',
        });
        setIsProcessing(false);
        return;
      }
      setSettings(getNotificationSettings());
    }

    const sendResult = await sendVerseNotification(currentVerse, '✝ Test Powiadomienia — Werset Dnia');
    if (sendResult.success) {
      setTestSent(true);
      if (soundEnabled) playSpiritualChime();
      setStatusMessage({
        type: 'success',
        text: `Wysłano powiadomienie testowe: „${currentVerse.reference}”. Sprawdź ekran!`,
      });
      setTimeout(() => setTestSent(false), 5000);
    } else {
      setStatusMessage({
        type: 'error',
        text: sendResult.error || 'Nie udało się wyświetlić powiadomienia testowego.',
      });
    }

    setIsProcessing(false);
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-md bg-[#0e1219] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Top Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          title="Zamknij"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#997a26]/20 border border-[#d4af37]/35 flex items-center justify-center text-[#e8cb93] shadow-md">
            {settings.optIn ? (
              <BellRing className="w-6 h-6 animate-pulse" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
              Werset Dnia
            </h3>
            <p className="text-xs text-[#eed7a1]/85 font-medium">
              Powiadomienia w przeglądarce • Service Worker
            </p>
          </div>
        </div>

        {/* Main Opt-in Toggle Card */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-4 transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Codzienny Werset Dnia</span>
                {settings.optIn && (
                  <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3dfb8] text-[10px] font-bold border border-[#d4af37]/30">
                    AKTYWNE
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Otrzymuj poranną dawkę Słowa Bożego bezpośrednio na pulpit lub telefon.
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={settings.optIn}
              disabled={isProcessing || !supported}
              onClick={handleToggleOptIn}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                settings.optIn ? 'bg-[#dfb872]' : 'bg-white/20'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.optIn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Browser Permission Info Tag */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-white/50">Status uprawnień przeglądarki:</span>
            {permission === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-[#f3dfb8] font-medium">
                <Check className="w-3.5 h-3.5 text-[#dfb872]" />
                Przyznano zgodę
              </span>
            ) : permission === 'denied' ? (
              <span className="inline-flex items-center gap-1 text-rose-300 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Zablokowane
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-white/60">
                Wymaga kliknięcia
              </span>
            )}
          </div>
        </div>

        {/* Time of Delivery Preference */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
              <Clock className="w-4 h-4 text-[#e8cb93]" />
              <span>Godzina doręczenia wersetu</span>
            </div>
            <span className="text-xs text-[#eed7a1] font-bold font-mono">
              {settings.time}
            </span>
          </div>

          {/* Quick Time Selectors */}
          <div className="grid grid-cols-4 gap-1.5">
            {['07:00', '08:00', '09:00', '12:00'].map((timeOption) => (
              <button
                key={timeOption}
                type="button"
                onClick={() => handleTimeChange(timeOption)}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  settings.time === timeOption
                    ? 'bg-[#dfb872] text-neutral-950 font-bold shadow-sm'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {timeOption}
              </button>
            ))}
          </div>
        </div>

        {/* Status Message / Notification Feedback */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs leading-relaxed mb-4 flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200'
                : 'bg-blue-950/40 border border-blue-500/30 text-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {/* Test Notification Action */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSendTestNotification}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-[#d4af37]/35 hover:border-[#dfb872] text-[#f3dfb8] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-[#e8cb93]" />
            <span>
              {testSent ? 'Wysłano powiadomienie!' : 'Wyślij testowe powiadomienie z wersetem'}
            </span>
          </button>
        </div>

        {/* Information footnote about Service Worker & iframe */}
        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/45 text-center leading-relaxed font-light">
          Obsługiwane przez Service Worker w tle. Jeśli Twoja przeglądarka blokuje powiadomienia w oknie podglądu, otwórz aplikację w nowej karcie.
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
