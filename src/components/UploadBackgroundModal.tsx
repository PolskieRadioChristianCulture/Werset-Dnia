import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Layers,
  Layout,
  BookOpen,
  Trash2,
  Link2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { BackgroundTheme } from '../types';

interface UploadBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBackground: (theme: BackgroundTheme, target: 'all' | 'home' | 'verse') => void;
  homeBg: BackgroundTheme | null;
  onResetHomeBackground: () => void;
  savedCustomThemes: BackgroundTheme[];
  onDeleteCustomTheme: (id: string) => void;
}

/**
 * Compresses an image data URL via Canvas to optimize storage and speed
 */
function compressImage(dataUrl: string, maxDim = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const UploadBackgroundModal: React.FC<UploadBackgroundModalProps> = ({
  isOpen,
  onClose,
  onApplyBackground,
  homeBg,
  onResetHomeBackground,
  savedCustomThemes,
  onDeleteCustomTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'saved'>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [bgName, setBgName] = useState<string>('Moje własne tło');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Proszę wybrać plik graficzny (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawResult = e.target?.result as string;
      try {
        const optimized = await compressImage(rawResult);
        setImageUrl(optimized);
        setPreviewError(false);
      } catch {
        setImageUrl(rawResult);
      } finally {
        setIsProcessing(false);
      }

      if (!bgName || bgName === 'Moje własne tło') {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setBgName(cleanName.length > 25 ? cleanName.substring(0, 25) + '...' : cleanName);
      }
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('Wystąpił błąd podczas odczytu pliku.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApply = (target: 'all' | 'home' | 'verse', customImg?: string) => {
    const finalUrl = customImg || imageUrl;
    if (!finalUrl) return;

    const newTheme: BackgroundTheme = {
      id: `custom-bg-${Date.now()}`,
      name: bgName.trim() || 'Własne tło',
      category: 'własne',
      imageUrl: finalUrl,
      thumbnailUrl: finalUrl,
      overlayGradient: 'linear-gradient(to bottom, rgba(7,9,13,0.45) 0%, rgba(7,9,13,0.85) 100%)',
      attribution: 'Własna grafika',
      mood: 'własny nastrój',
    };

    onApplyBackground(newTheme, target);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-xl bg-[#0f1218] border border-[#dfb872]/35 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#dfb872]/15 border border-[#dfb872]/40 flex items-center justify-center text-[#e8cb93] shadow-inner">
                  <Upload className="w-5 h-5 text-[#e8cb93]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 font-cinzel">
                    <span>Wgraj Własne Tło</span>
                  </h2>
                  <p className="text-xs text-white/50">
                    Spersonalizuj wygląd strony głównej oraz grafiki wersetu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/8 rounded-xl mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#dfb872] text-neutral-950 font-semibold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Z pliku</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-[#dfb872] text-neutral-950 font-semibold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Z linku URL</span>
              </button>
              {savedCustomThemes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'saved'
                      ? 'bg-[#dfb872] text-neutral-950 font-semibold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Moje tła ({savedCustomThemes.length})</span>
                </button>
              )}
            </div>

            {/* Main scrollable body */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4 no-scrollbar">
              {/* TAB 1: File Upload */}
              {activeTab === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                      isDragging
                        ? 'border-[#dfb872] bg-[#dfb872]/10 scale-[1.01]'
                        : 'border-white/15 hover:border-[#dfb872]/50 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Loader2 className="w-8 h-8 text-[#dfb872] animate-spin" />
                        <span className="text-xs text-[#f3dfb8]">Przetwarzanie i optymalizacja grafiki...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-[#e8cb93]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white block">
                            Kliknij, aby wybrać zdjęcie z urządzenia
                          </span>
                          <span className="text-xs text-white/40 block mt-0.5">
                            Możesz też przeciągnąć i upuścić plik tutaj (JPG, PNG, WebP)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: URL Input */}
              {activeTab === 'url' && (
                <div className="space-y-2">
                  <label className="text-xs text-white/70 font-medium block">
                    Wklej bezpośredni adres URL do grafiki:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreviewError(false);
                      }}
                      placeholder="https://domena.pl/zdjecie.jpg"
                      className="w-full bg-white/[0.05] border border-white/12 focus:border-[#dfb872]/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Saved Custom Themes List */}
              {activeTab === 'saved' && (
                <div className="space-y-3">
                  <span className="text-xs text-white/60 block">
                    Wybierz jedno z wcześniej wgranych teł i wskaż, gdzie chcesz je zastosować:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {savedCustomThemes.map((st) => (
                      <div
                        key={st.id}
                        className="relative group rounded-xl overflow-hidden aspect-[4/3] border border-white/10 hover:border-[#dfb872]/60 bg-neutral-900 flex flex-col justify-end p-2"
                      >
                        <img
                          src={st.thumbnailUrl}
                          alt={st.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <span className="relative z-10 text-[11px] font-semibold text-white truncate drop-shadow mb-1.5">
                          {st.name}
                        </span>

                        {/* Quick apply buttons for saved theme */}
                        <div className="relative z-10 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onApplyBackground(st, 'home');
                              onClose();
                            }}
                            className="flex-1 py-1 rounded bg-[#dfb872] hover:bg-[#ebd095] text-[10px] text-neutral-950 font-bold shadow cursor-pointer transition-colors"
                            title="Ustaw jako tło strony głównej"
                          >
                            Strona
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onApplyBackground(st, 'verse');
                              onClose();
                            }}
                            className="flex-1 py-1 rounded bg-white/20 hover:bg-white/30 text-[10px] text-white font-medium cursor-pointer transition-colors"
                            title="Ustaw jako tło wersetu"
                          >
                            Werset
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomTheme(st.id);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white/70 hover:text-white transition-colors z-20"
                          title="Usuń to tło"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview Box if image is selected */}
              {imageUrl && activeTab !== 'saved' && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs text-white/60 font-medium flex items-center justify-between">
                    <span>Podgląd wybranego tła:</span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-white/40 hover:text-rose-400 text-[11px] underline cursor-pointer"
                    >
                      Zmień / Wyczyść
                    </button>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#dfb872]/40 shadow-xl bg-black/50">
                    <img
                      src={imageUrl}
                      alt="Podgląd"
                      onError={() => setPreviewError(true)}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {previewError && (
                      <div className="absolute inset-0 bg-black/85 flex items-center justify-center text-xs text-rose-400 p-4 text-center">
                        Nie udało się załadować grafiki z podanego adresu. Upewnij się, że link prowadzi bezpośrednio do pliku graficznego.
                      </div>
                    )}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-[#f3dfb8] drop-shadow font-medium">
                      <span>{bgName}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Gotowe do użycia
                      </span>
                    </div>
                  </div>

                  {/* Background name input */}
                  <div>
                    <label className="text-[11px] text-white/50 block mb-1">
                      Nazwa tła (opcjonalnie):
                    </label>
                    <input
                      type="text"
                      value={bgName}
                      onChange={(e) => setBgName(e.target.value)}
                      placeholder="np. Moje ulubione góry..."
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#dfb872]/50 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>

                  {/* Direct Action Apply Buttons */}
                  <div className="pt-2">
                    <label className="text-xs text-white/80 font-bold block mb-2">
                      Wybierz, gdzie chcesz natychmiast zastosować to tło:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleApply('home')}
                        className="py-3 px-3 rounded-2xl bg-[#dfb872]/20 hover:bg-[#dfb872]/30 border border-[#dfb872]/60 hover:border-[#dfb872] text-[#f3dfb8] flex flex-col items-center text-center gap-1 transition-all cursor-pointer shadow-md group"
                      >
                        <Layout className="w-5 h-5 text-[#dfb872] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-white">Strona Główna</span>
                        <span className="text-[10px] text-white/50">Tło całego portalu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApply('verse')}
                        className="py-3 px-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-[#dfb872]/50 text-white flex flex-col items-center text-center gap-1 transition-all cursor-pointer shadow-md group"
                      >
                        <BookOpen className="w-5 h-5 text-[#dfb872] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-white">Karta Wersetu</span>
                        <span className="text-[10px] text-white/50">Do grafiki wersetu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApply('all')}
                        className="py-3 px-3 rounded-2xl bg-gradient-to-br from-[#dfb872] to-[#b88c2b] hover:from-[#ebd095] hover:to-[#dfb872] text-neutral-950 flex flex-col items-center text-center gap-1 transition-all cursor-pointer shadow-lg group font-bold"
                      >
                        <Sparkles className="w-5 h-5 text-neutral-950 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-extrabold">Do obu na raz</span>
                        <span className="text-[10px] text-neutral-900/80">Strona + Werset</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Home Background option if currently customized */}
              {homeBg && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-white/60">
                    <span className="block text-white/80 font-medium">Aktywne tło strony głównej:</span>
                    <span className="text-[#f3dfb8] text-[11px] truncate max-w-[220px] block">
                      {homeBg.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onResetHomeBackground();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Przywróć domyślne tło</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
