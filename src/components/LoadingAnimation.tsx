import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoadingAnimationProps {
  message?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = 'Szukam dla Ciebie Słowa…',
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080a]/92 backdrop-blur-2xl"
      >
        {/* Radiant sacred aura */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer breathing halo */}
          <motion.div
            animate={{
              scale: [0.9, 1.35, 0.9],
              opacity: [0.15, 0.45, 0.15],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#997a26]/30 to-[#dfb872]/30 blur-2xl absolute"
          />

          {/* Inner ring */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 180, 360],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="w-28 h-28 rounded-full border border-[#d4af37]/30 border-dashed absolute"
          />

          {/* Central Sacred Emblem */}
          <motion.div
            animate={{
              scale: [0.96, 1.04, 0.96],
              boxShadow: [
                '0 0 20px rgba(212,175,55,0.2)',
                '0 0 45px rgba(212,175,55,0.45)',
                '0 0 20px rgba(212,175,55,0.2)',
              ],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-16 h-16 rounded-2xl bg-[#101319] border border-[#d4af37]/50 flex items-center justify-center text-[#e8cb93] z-10"
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="font-cinzel text-2xl font-bold"
            >
              ✝
            </motion.span>
          </motion.div>
        </div>

        {/* Spiritual Message with gentle fade-in */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-cormorant italic text-2xl sm:text-3xl text-white font-medium tracking-wide mb-2 text-center px-4"
        >
          {message}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs text-[#eed7a1] font-light tracking-widest uppercase flex items-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-[#d4af37]" />
          <span>Pismo Święte • Christian Culture</span>
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};
