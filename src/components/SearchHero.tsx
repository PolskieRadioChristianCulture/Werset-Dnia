import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Dices, X, ArrowRight, Flame, Bell, BellRing, BookOpen, Compass, HelpCircle, ShieldCheck, ChevronDown, Youtube, Play, ExternalLink } from 'lucide-react';
import { searchBibleVerses } from '../data/verses';
import { BibleVerse } from '../types';
import { trackEvent } from '../utils/analytics';

interface SearchHeroProps {
  onSelectVerse: (verse: BibleVerse) => void;
  onRandomVerse: () => void;
  isLoading: boolean;
  notificationsOptIn?: boolean;
  onOpenNotificationModal?: () => void;
  onSelectTopic?: (topicSlug: string) => void;
  onSelectQuestion?: (questionSlug: string) => void;
  onOpenSeoAudit?: () => void;
}

const TOPIC_CHIPS = [
  { label: 'Nadziei', query: 'nadzieja' },
  { label: 'Pokoju', query: 'pokoj' },
  { label: 'Siły', query: 'sila' },
  { label: 'Mądrości', query: 'madrosc' },
  { label: 'Pocieszenia', query: 'jest mi ciezko' },
  { label: 'Wiary', query: 'wiara' },
  { label: 'Przebaczenia', query: 'przebaczenie' },
  { label: 'Miłości', query: 'milosc' },
  { label: 'Przełamania lęku', query: 'strach' },
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  onSelectVerse,
  onRandomVerse,
  isLoading,
  notificationsOptIn,
  onOpenNotificationModal,
  onSelectTopic,
  onSelectQuestion,
  onOpenSeoAudit,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<BibleVerse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingServer, setIsSearchingServer] = useState(false);
  const [isNeedsExpanded, setIsNeedsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions dynamically as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 2) {
      const matches = searchBibleVerses(val);
      setSuggestions(matches.slice(0, 4));
      setShowDropdown(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleExecuteSearch = async (textToSearch: string) => {
    const term = textToSearch.trim();
    if (!term) {
      onRandomVerse();
      return;
    }

    setShowDropdown(false);
    trackEvent('verse_searched', { query_length: term.length });

    // 1. Check local instant database
    const localResults = searchBibleVerses(term);
    if (localResults.length > 0) {
      onSelectVerse(localResults[0]);
      return;
    }

    // 2. If no local match (e.g. natural language sentence), call server semantic route
    try {
      setIsSearchingServer(true);
      const res = await fetch('/api/semantic-verse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.verse) {
          onSelectVerse(data.verse);
          return;
        }
      }
    } catch (e) {
      console.warn('Semantic search network issue, using fallback', e);
    } finally {
      setIsSearchingServer(false);
    }

    // Default if everything else fails
    onRandomVerse();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(query);
  };

  const handleChipClick = (chipQuery: string) => {
    setQuery(chipQuery);
    handleExecuteSearch(chipQuery);
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-20 pb-16">
      {/* Background ambient lighting with soft breathing motion */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-[#d4af37] rounded-full blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.02, 0.05, 0.02],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[260px] bg-[#997a26] rounded-full blur-[110px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center"
      >
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3"
        >
          MÓJ WERSET DNIA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-cormorant italic text-xl sm:text-2xl text-[#f5ebd5]/85 mb-8 sm:mb-10 font-normal"
        >
          „Co dzisiaj mówi do Ciebie Słowo?”
        </motion.p>

        {/* Search Box Container */}
        <div ref={containerRef} className="w-full relative mb-5">
          <form
            onSubmit={handleSubmit}
            className="w-full relative flex items-center bg-[#101319]/90 hover:bg-[#121620] focus-within:bg-[#141924] border border-white/15 focus-within:border-[#d4af37]/50 rounded-full shadow-xl transition-all px-2.5 py-1 sm:py-1.5"
          >
            {/* Search Icon */}
            <div className="pl-2 pr-1.5 text-white/40 flex items-center pointer-events-none">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#e8cb93]/80" />
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Zapytaj Biblię... (np. nadzieja, lęk, Psalm 23)"
              className="w-full bg-transparent text-white text-sm sm:text-base placeholder:text-white/35 focus:outline-none py-1.5 sm:py-2 px-2"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                  inputRef.current?.focus();
                }}
                className="p-1 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors mr-1 cursor-pointer"
                title="Wyczyść"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Random Dice Button inside input */}
            <motion.button
              whileHover={{ rotate: 180, scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={onRandomVerse}
              disabled={isLoading}
              title="Wylosuj losowy werset"
              className="p-1.5 sm:p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#e8cb93] hover:text-[#f7e6c4] transition-colors border border-white/5 mr-1.5 sm:mr-2 cursor-pointer"
            >
              <Dices className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </motion.button>

            {/* Submit Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={isLoading || isSearchingServer}
              className="px-3.5 py-1.5 sm:py-2 rounded-full bg-[#dfb872] hover:bg-[#ebd095] text-neutral-950 font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Szukaj</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </form>

          {/* Dynamic Auto-suggestions Dropdown */}
          <AnimatePresence>
            {showDropdown && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#121620] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 text-left backdrop-blur-xl"
              >
                <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/5">
                  Dopasowane fragmenty z Pisma Świętego
                </div>
                <ul className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {suggestions.map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectVerse(v);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/[0.06] transition-colors flex flex-col group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#e8cb93] group-hover:text-[#f7e6c4]">
                            {v.reference}
                          </span>
                          <span className="text-[10px] text-white/40 px-2 py-0.5 rounded bg-white/5">
                            {v.translation}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 line-clamp-1 mt-1 font-cormorant italic text-base">
                          „{v.text}”
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Thematic YouTube channel recommendation item */}
                <a
                  href={`https://youtube.com/@wersetdnia_chsb?si=KSamoERrUAtHFL96`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-red-950/40 via-[#181b24] to-[#121620] hover:from-red-900/40 border-t border-red-500/20 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shrink-0">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-semibold text-red-200 group-hover:text-red-100 truncate">
                        Wideo rozważania: „{query}” na YouTube
                      </span>
                      <span className="text-[10px] text-white/50 truncate">
                        Oficjalny kanał @wersetdnia_chsb · Zobacz rozważania
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white shrink-0 ml-2" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delikatny przycisk: "Dzisiaj potrzebuję:" */}
        <div className="w-full flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsNeedsExpanded(!isNeedsExpanded)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/50 hover:text-[#eed7a1] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.07] hover:border-[#d4af37]/35 transition-all cursor-pointer shadow-sm tracking-wide"
            aria-expanded={isNeedsExpanded}
            aria-label="Rozwiń sekcję: Dzisiaj potrzebuję"
          >
            <Flame className="w-3.5 h-3.5 text-[#e8cb93]/70 group-hover:text-[#eed7a1] transition-colors" />
            <span className="font-medium">Dzisiaj potrzebuję:</span>
            <motion.div
              animate={{ rotate: isNeedsExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-white/40 group-hover:text-[#eed7a1] transition-colors" />
            </motion.div>
          </motion.button>
        </div>

        {/* Ukryta zawartość pod przyciskiem "Dzisiaj potrzebuję:" */}
        <AnimatePresence>
          {isNeedsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center overflow-hidden pt-5"
            >
              {/* Rekomendacja wideo kanału YouTube @wersetdnia_chsb wewnątrz "Dzisiaj potrzebuję:" */}
              <div className="mb-4">
                <a
                  href="https://youtube.com/@wersetdnia_chsb?si=KSamoERrUAtHFL96"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-950/40 via-red-900/25 to-red-950/40 hover:from-red-900/50 hover:via-red-800/40 hover:to-red-900/50 border border-red-500/30 hover:border-red-500/60 text-xs text-white/90 hover:text-white transition-all shadow-md cursor-pointer"
                  title="Wideo rozważania tematyczne na kanale YouTube @wersetdnia_chsb"
                >
                  <div className="w-4.5 h-4.5 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </div>
                  <span>
                    Wideo rozważania tematyczne na kanale <strong className="text-red-300 font-semibold group-hover:text-red-200">YouTube @wersetdnia_chsb</strong>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white shrink-0 ml-0.5" />
                </a>
              </div>

              {/* Chipy tematyczne */}
              <div className="w-full flex flex-col items-center">
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                  {TOPIC_CHIPS.map((chip) => (
                    <motion.button
                      key={chip.label}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleChipClick(chip.query)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] hover:bg-[#d4af37]/15 border border-white/10 hover:border-[#d4af37]/40 text-white/80 hover:text-[#f3dfb8] transition-all cursor-pointer whitespace-nowrap"
                    >
                      {chip.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Bottom spiritual prompt suggested in spec */}
              <div className="mt-8 text-center">
                <button
                  onClick={onRandomVerse}
                  className="text-xs sm:text-sm text-white/40 hover:text-[#eed7a1] transition-colors inline-flex items-center gap-1.5 font-light cursor-pointer group"
                >
                  <span>Nie wiesz, czego szukać?</span>
                  <span className="text-[#e8cb93]/80 group-hover:underline font-medium">
                    Po prostu powierz to Słowu → Losuj werset
                  </span>
                </button>
              </div>

              {/* Daily Verse Notification Opt-in Pill */}
              {onOpenNotificationModal && (
                <div className="mt-6 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onOpenNotificationModal}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                      notificationsOptIn
                        ? 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f3dfb8] hover:bg-[#d4af37]/25 shadow-sm'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    {notificationsOptIn ? (
                      <BellRing className="w-3.5 h-3.5 text-[#e8cb93]" />
                    ) : (
                      <Bell className="w-3.5 h-3.5 text-[#e8cb93]" />
                    )}
                    <span>
                      {notificationsOptIn
                        ? 'Powiadomienia o Wersecie Dnia: Włączone'
                        : 'Otrzymuj codzienny Werset Dnia w powiadomieniu przeglądarki'}
                    </span>
                  </button>
                </div>
              )}

              {/* Section: Tematy biblijne (SEO Landing Hubs) */}
              {onSelectTopic && (
                <div className="mt-10 pt-8 border-t border-white/5 w-full flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs text-white/50 mb-3 uppercase tracking-wider font-medium">
                    <Compass className="w-3.5 h-3.5 text-[#e8cb93]" />
                    <span>Główne tematy biblijne</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
                    {[
                      { slug: 'nadzieja', name: 'Nadzieja' },
                      { slug: 'milosc', name: 'Miłość' },
                      { slug: 'modlitwa', name: 'Modlitwa' },
                      { slug: 'rodzina', name: 'Rodzina' },
                      { slug: 'malzenstwo', name: 'Małżeństwo' },
                      { slug: 'przebaczenie', name: 'Przebaczenie' },
                      { slug: 'lek', name: 'Lęk i Strach' },
                      { slug: 'samotnosc', name: 'Samotność' },
                      { slug: 'pokoj', name: 'Pokój' },
                      { slug: 'wiara', name: 'Wiara' },
                      { slug: 'zbawienie', name: 'Zbawienie' },
                      { slug: 'jezus', name: 'Jezus' },
                      { slug: 'smierc', name: 'Śmierć' },
                      { slug: 'zmartwychwstanie', name: 'Zmartwychwstanie' },
                      { slug: 'sila', name: 'Siła' },
                      { slug: 'pocieszenie', name: 'Pocieszenie' },
                    ].map((t) => (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() => onSelectTopic(t.slug)}
                        className="px-3 py-1.5 rounded-xl text-xs bg-white/[0.03] hover:bg-white/[0.08] border border-white/8 hover:border-[#d4af37]/35 text-white/70 hover:text-[#eed7a1] transition-all cursor-pointer"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Naturalne pytania o Biblię (AEO / GEO Answer Engine) */}
              {onSelectQuestion && (
                <div className="mt-8 w-full flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs text-white/50 mb-3 uppercase tracking-wider font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-[#e8cb93]" />
                    <span>Częste pytania o Pismo Święte (AEO)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full">
                    {[
                      { slug: 'co-biblia-mowi-o-leku', title: 'Co Biblia mówi o lęku?' },
                      { slug: 'co-biblia-mowi-o-smierci', title: 'Co Biblia mówi o śmierci?' },
                      { slug: 'jakie-wersety-mowia-o-nadziei', title: 'Jakie wersety mówią o nadziei?' },
                      { slug: 'co-biblia-mowi-o-przebaczeniu', title: 'Co Biblia mówi o przebaczeniu?' },
                      { slug: 'jak-zaufac-bogu', title: 'Jak zaufać Bogu w trudnościach?' },
                      { slug: 'jaki-werset-przeczytac-gdy-jest-mi-ciezko', title: 'Jaki werset, gdy jest mi ciężko?' },
                    ].map((q) => (
                      <button
                        key={q.slug}
                        type="button"
                        onClick={() => onSelectQuestion(q.slug)}
                        className="p-2.5 rounded-xl text-xs text-left bg-white/[0.02] hover:bg-white/[0.06] border border-white/6 hover:border-[#d4af37]/30 text-white/80 hover:text-[#eed7a1] transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{q.title}</span>
                        <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-[#e8cb93] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO + AEO + GEO Compliance Status trigger */}
              {onOpenSeoAudit && (
                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onOpenSeoAudit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#d4af37]/30 text-white/50 hover:text-white/80 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Standardy SEO + AEO + GEO: Zgodność 100%</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
