import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Sparkles, ChevronRight, Share2, Compass, HelpCircle } from 'lucide-react';
import { TopicHub, BibleVerse, BibleQuestion } from '../types';
import { getVerseBySlug } from '../data/verses';
import { TOPIC_HUBS, getTopicBySlug } from '../data/topics';
import { BIBLE_QUESTIONS, getQuestionBySlug } from '../data/questions';

interface TopicHubViewProps {
  topic: TopicHub;
  onSelectVerse: (verse: BibleVerse) => void;
  onSelectTopic?: (topicSlug: string) => void;
  onSelectRelatedTopic?: (topicSlug: string) => void;
  onSelectQuestion?: (questionSlug: string) => void;
  onBackToSearch: () => void;
}

export const TopicHubView: React.FC<TopicHubViewProps> = ({
  topic,
  onSelectVerse,
  onSelectTopic,
  onSelectRelatedTopic,
  onSelectQuestion,
  onBackToSearch,
}) => {
  const handleSelectTopic = onSelectRelatedTopic || onSelectTopic;

  const verses: BibleVerse[] = topic.verseSlugs
    .map(slug => getVerseBySlug(slug))
    .filter((v): v is BibleVerse => Boolean(v));

  const relatedTopics = topic.relatedTopicSlugs
    .map(slug => getTopicBySlug(slug))
    .filter((t): t is TopicHub => Boolean(t));

  const relatedQuestions: BibleQuestion[] = topic.relatedQuestionSlugs
    .map(slug => getQuestionBySlug(slug))
    .filter((q): q is BibleQuestion => Boolean(q));

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen pt-20 pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-white"
    >
      {/* Breadcrumb Navigation (Semantic & SEO Friendly) */}
      <nav aria-label="Nawigacja okruszkowa" className="mb-6 flex items-center gap-1.5 text-xs text-white/50 overflow-x-auto py-1">
        <button
          onClick={onBackToSearch}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Główna
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <span className="text-white/40">Tematy biblijne</span>
        <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <span className="text-[#e8cb93] font-medium truncate">{topic.name}</span>
      </nav>

      <article className="space-y-8">
        {/* Header Section */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs text-[#eed7a1]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kategoria biblijna: {topic.name}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif tracking-tight text-[#fdfbf7] leading-snug">
            {topic.h1}
          </h1>

          <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-3xl">
            {topic.metaDescription}
          </p>
        </header>

        {/* Section 1: Answer Engine / AI Snippet Box (Direct Answer) */}
        <section aria-labelledby="direct-answer-heading" className="p-6 rounded-2xl bg-white/[0.03] border border-[#d4af37]/25 shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />
          <h2 id="direct-answer-heading" className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Krótka odpowiedź biblijna</span>
          </h2>
          <p className="text-base sm:text-lg text-white/90 font-serif leading-relaxed italic">
            „{topic.shortAnswer}”
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50 flex flex-wrap items-center justify-between gap-2">
            <span>Opracowanie: Christian Culture — Redakcja Biblijna</span>
            <span>Źródło: Pismo Święte Starego i Nowego Testamentu</span>
          </div>
        </section>

        {/* Section 2: Biblical Verses (Canonical Passages) */}
        <section aria-labelledby="verses-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="verses-heading" className="text-xl sm:text-2xl font-serif text-[#fdfbf7]">
              Wersety z Pisma Świętego o: {topic.name}
            </h2>
            <span className="text-xs text-white/40">{verses.length} wybranych fragmentów</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verses.map((verse) => (
              <div
                key={verse.id}
                className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#e8cb93] uppercase tracking-wider">
                      {verse.reference}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {verse.translation}
                    </span>
                  </div>
                  <blockquote className="text-sm sm:text-base font-serif text-white/90 leading-relaxed italic mb-4">
                    „{verse.text}”
                  </blockquote>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectVerse(verse)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-[#eed7a1] font-medium transition-colors cursor-pointer"
                  >
                    <span>Stwórz kartę wersetu</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <a
                    href={`/werset/${verse.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectVerse(verse);
                    }}
                    className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
                  >
                    /werset/{verse.slug}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Context & Reflection */}
        <section aria-labelledby="context-heading" className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <h2 id="context-heading" className="text-lg font-serif text-[#fdfbf7]">
            Kontekst i refleksja Christian Culture
          </h2>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light">
            {topic.biblicalContext}
          </p>
          <div className="text-xs text-white/40 pt-2 border-t border-white/5">
            Mój Werset Dnia to biblijne narzędzie Christian Culture — polskieradio.cc
          </div>
        </section>

        {/* Section 4: Related Natural Language Questions (AEO/GEO) */}
        {relatedQuestions.length > 0 && (
          <section aria-labelledby="questions-heading" className="space-y-3">
            <h2 id="questions-heading" className="text-lg font-serif text-[#fdfbf7] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#d4af37]" />
              <span>Często zadawane pytania</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedQuestions.map((q) => (
                <button
                  key={q.slug}
                  onClick={() => onSelectQuestion && onSelectQuestion(q.slug)}
                  className="text-left p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#d4af37]/30 transition-all cursor-pointer group"
                >
                  <div className="text-sm text-white/90 group-hover:text-[#eed7a1] font-medium mb-1">
                    {q.question}
                  </div>
                  <div className="text-xs text-white/50 line-clamp-2">
                    {q.shortAnswer}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Related Topics (Internal Linking Network) */}
        {relatedTopics.length > 0 && (
          <section aria-labelledby="related-topics-heading" className="space-y-3">
            <h2 id="related-topics-heading" className="text-base font-serif text-white/80 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#d4af37]" />
              <span>Powiązane tematy biblijne</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((rel) => (
                <button
                  key={rel.slug}
                  onClick={() => handleSelectTopic && handleSelectTopic(rel.slug)}
                  className="px-3.5 py-1.5 rounded-full text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#d4af37]/40 text-white/75 hover:text-white transition-all cursor-pointer"
                >
                  {rel.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Back navigation button */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onBackToSearch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Powrót do wyszukiwarki</span>
          </button>
          <span className="text-[11px] text-white/40">
            Christian Culture — polskieradio.cc
          </span>
        </div>
      </article>
    </motion.main>
  );
};
