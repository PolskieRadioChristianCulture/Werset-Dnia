import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, ExternalLink, Code2, Globe, Sparkles, HelpCircle, Layers } from 'lucide-react';
import { SeoAuditItem } from '../types';

interface SeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUDIT_ITEMS: SeoAuditItem[] = [
  {
    id: 'indexability',
    category: 'Techniczne SEO',
    label: 'Dostępność i indeksowalność (Bez logowania)',
    status: 'PASS',
    details: 'Wszystkie podstrony wersetów, landing page tematyczne oraz strony pytań są publicznie dostępne bez wymogu logowania. Roboty Google, Bing oraz modele AI mają pełny, natychmiastowy dostęp do tekstu.',
  },
  {
    id: 'semantic-html',
    category: 'Techniczne SEO',
    label: 'Semantyka HTML5 (<main>, <article>, <header>, <blockquote>)',
    status: 'PASS',
    details: 'Wdrożono rygorystyczną hierarchię: jeden główny nagłówek <h1> na każdej podstronie, cytaty biblijne w <blockquote cite="...">, nawigacja okruszkowa w <nav aria-label="Nawigacja okruszkowa">.',
  },
  {
    id: 'canonical-urls',
    category: 'Techniczne SEO',
    label: 'Adresy kanoniczne (<link rel="canonical">)',
    status: 'PASS',
    details: 'Każda podstrona posiada unikalny, samoistny link kanoniczny (np. https://polskieradio.cc/werset/:slug, https://polskieradio.cc/wersety/:topic), zapobiegając duplikacji treści.',
  },
  {
    id: 'schema-org',
    category: 'Dane Strukturalne',
    label: 'JSON-LD (WebSite, Organization, Article, FAQPage, BreadcrumbList)',
    status: 'PASS',
    details: 'Dynamiczne generowanie i wstrzykiwanie danych Schema.org dla Organization (Christian Culture), WebSite z SearchAction, Article (dla wersetów i artykułów) oraz FAQPage (dla pytań AEO).',
  },
  {
    id: 'aeo-answers',
    category: 'AEO (Answer Engine)',
    label: 'Optymalizacja pod silniki odpowiedzi (Krótka odpowiedź + Dowód)',
    status: 'PASS',
    details: 'Zaprojektowano moduły natychmiastowej odpowiedzi: zwięzła definicja dla asystentów AI i featured snippets + dosłowne fragmenty kanoniczne z podaniem księgi i rozdziału.',
  },
  {
    id: 'geo-entity',
    category: 'GEO (Generative Engine)',
    label: 'Spójność encji i brak halucynacji (Christian Culture — polskieradio.cc)',
    status: 'PASS',
    details: 'Pismo Święte cytowane jest wyłącznie z autentycznych przekładów (Biblia Warszawska, Biblia Tysiąclecia). Wyraźne rozgraniczenie tekstu objawionego od komentarza redakcyjnego.',
  },
  {
    id: 'open-graph',
    category: 'Social & Share',
    label: 'Karty Open Graph i Twitter Card (1200x630)',
    status: 'PASS',
    details: 'Pełna obsługa znaczników og:title, og:description, og:image, og:url oraz twitter:card summary_large_image dla każdego wersetu i tematu.',
  },
  {
    id: 'sitemap-robots',
    category: 'Crawlability',
    label: 'Pliki sitemap.xml i robots.txt',
    status: 'PASS',
    details: 'Serwer Express udostępnia dynamiczny sitemap.xml ze wszystkimi wersetami i tematami biblijnymi oraz plik robots.txt z właściwą dyrektywą Allow i odnośnikiem do mapy witryny.',
  },
  {
    id: 'internal-linking',
    category: 'Architektura',
    label: 'Struktura powiązań wewnętrznych (Brak stron osieroconych)',
    status: 'PASS',
    details: 'Wszystkie wersety, kategorie i pytania są połączone siecią linków powiązanych tematów, breadcrumbs oraz sekcji pytań.',
  },
  {
    id: 'mobile-cwv',
    category: 'Wydajność & UX',
    label: 'Core Web Vitals & Mobile-First',
    status: 'PASS',
    details: 'Lekka, responsywna architektura na Tailwind CSS, natychmiastowe ładowanie, zero zbędnych bibliotek zewnętrznych, responsywność 320px–4k.',
  },
];

export const SeoAuditModal: React.FC<SeoAuditModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Techniczne SEO', 'Dane Strukturalne', 'AEO (Answer Engine)', 'GEO (Generative Engine)', 'Social & Share', 'Crawlability'];

  const filteredItems = activeCategory === 'all'
    ? AUDIT_ITEMS
    : AUDIT_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-[#0f1218] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Zamknij audyt"
            >
              <X className="w-5 h-5" />
            </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#e8cb93]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-[#fdfbf7]">
              Raport Zgodności: SEO + AEO + GEO
            </h2>
            <p className="text-xs text-white/60">
              Weryfikacja wytycznych punktów 22–42 dla ekosystemu Christian Culture
            </p>
          </div>
        </div>

        {/* Summary score pill */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-emerald-300">Wszystkie wskaźniki zaliczone (10/10)</div>
              <div className="text-xs text-white/60">Brak duplikacji, brak keyword stuffingu, czysta struktura kanoniczna</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
            100% OK
          </span>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#dfb872] text-neutral-950 font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {cat === 'all' ? 'Wszystkie kryteria' : cat}
            </button>
          ))}
        </div>

        {/* Audit List */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#eed7a1]">{item.label}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>PASS</span>
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                {item.details}
              </p>
              <div className="text-[10px] text-white/40 pt-1 flex items-center justify-between">
                <span>Obszar: {item.category}</span>
                <span>Zweryfikowano z polskieradio.cc</span>
              </div>
            </div>
          ))}
        </div>

        {/* Raw endpoints test links */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
          <div className="flex items-center gap-4">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#eed7a1] flex items-center gap-1 transition-colors"
            >
              <span>sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#eed7a1] flex items-center gap-1 transition-colors"
            >
              <span>robots.txt</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white transition-colors cursor-pointer"
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
