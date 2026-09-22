import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info';
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0f1218]/95 border border-[#d4af37]/40 shadow-2xl backdrop-blur-xl text-white text-xs sm:text-sm font-medium"
          >
            <div className="p-1.5 rounded-xl bg-[#d4af37]/15 text-[#eed7a1] shrink-0">
              {toast.type === 'info' ? (
                <Info className="w-4 h-4 text-[#e8cb93]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#e8cb93]" />
              )}
            </div>
            <span className="text-[#fdfbf7]">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
