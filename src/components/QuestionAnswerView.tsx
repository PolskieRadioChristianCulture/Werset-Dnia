import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, ChevronRight, BookOpen, Compass, HelpCircle } from 'lucide-react';
import { BibleQuestion, BibleVerse } from '../types';
import { getVerseBySlug } from '../data/verses';
import { getTopicBySlug } from '../data/topics';
import { getQuestionBySlug } from '../data/questions';

interface QuestionAnswerViewProps {
  question: BibleQuestion;
  onSelectVerse: (verse: BibleVerse) => void;
  onSelectTopic?: (topicSlug: string) => void;
  onSelectQuestion?: (questionSlug: string) => void;
  onSelectRelatedQuestion?: (questionSlug: string) => void;
  onBackToSearch: () => void;
}

export const QuestionAnswerView: React.FC<QuestionAnswerViewProps> = ({
  question,
  onSelectVerse,
  onSelectTopic,
  onSelectQuestion,
  onSelectRelatedQuestion,
  onBackToSearch,
}) => {
  const handleSelectQuestion = onSelectRelatedQuestion || onSelectQuestion;

  const verses: BibleVerse[] = question.keyVerseSlugs
    .map((slug) => getVerseBySlug(slug))
    .filter((v): v is BibleVerse => Boolean(v));

  const relatedTopics = question.relatedTopicSlugs
    .map((slug) => getTopicBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const relatedQuestions = question.relatedQuestionSlugs
    .map((slug) => getQuestionBySlug(slug))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen pt-20 pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-white"
    >
      {/* Breadcrumb Navigation */}
      <nav aria-label="Nawigacja okruszkowa" className="mb-6 flex items-center gap-1.5 text-xs text-white/50 overflow-x-auto py-1">
        <button
          onClick={onBackToSearch}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Główna
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <span className="text-white/40">Pytania o Biblię</span>
        <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <span className="text-[#e8cb93] font-medium truncate">{question.question}</span>
      </nav>

      <article className="space-y-8">
        {/* Header with H1 */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs text-[#eed7a1]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pytanie w naturalnym języku (AEO / GEO)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif tracking-tight text-[#fdfbf7] leading-snug">
            {question.question}
          </h1>

          <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-3xl">
            {question.metaDescription}
          </p>
        </header>

        {/* 1. SHORT DIRECT ANSWER (Answer Engine Optimization target snippet) */}
        <section aria-labelledby="direct-answer" className="p-6 rounded-2xl bg-white/[0.03] border border-[#d4af37]/30 shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />
          <h2 id="direct-answer" className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Krótka odpowiedź (Biblical Answer Engine)</span>
          </h2>
          <p className="text-base sm:text-lg text-white/95 font-serif leading-relaxed italic">
            „{question.shortAnswer}”
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50 flex flex-wrap items-center justify-between gap-2">
            <span>Odpowiedź przygotowana przez Christian Culture</span>
            <span>Zweryfikowane źródła biblijne</span>
          </div>
        </section>

        {/* 2. BIBLICAL EVIDENCE (Canonical Passages) */}
        <section aria-labelledby="evidence-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="evidence-heading" className="text-xl sm:text-2xl font-serif text-[#fdfbf7]">
              Podstawa biblijna — kluczowe fragmenty Pisma Świętego
            </h2>
            <span className="text-xs text-white/40">{verses.length} wersetów</span>
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
                    <span>Generuj kartę z tym wersetem</span>
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

        {/* 3. CONTEXT & EDITORIAL REFLECTION */}
        <section aria-labelledby="context-heading" className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <h2 id="context-heading" className="text-lg font-serif text-[#fdfbf7]">
            Kontekst i wyjaśnienie Christian Culture
          </h2>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light">
            {question.biblicalContext}
          </p>
          <div className="text-xs text-white/40 pt-2 border-t border-white/5">
            Mój Werset Dnia to biblijne narzędzie Christian Culture — polskieradio.cc
          </div>
        </section>

        {/* 4. RELATED TOPICS */}
        {relatedTopics.length > 0 && (
          <section aria-labelledby="related-topics" className="space-y-3">
            <h2 id="related-topics" className="text-base font-serif text-white/80 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#d4af37]" />
              <span>Powiązane tematy biblijne</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((rel) => (
                <button
                  key={rel.slug}
                  onClick={() => onSelectTopic && onSelectTopic(rel.slug)}
                  className="px-3.5 py-1.5 rounded-full text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#d4af37]/40 text-white/75 hover:text-white transition-all cursor-pointer"
                >
                  {rel.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 5. RELATED QUESTIONS */}
        {relatedQuestions.length > 0 && (
          <section aria-labelledby="related-q" className="space-y-3">
            <h2 id="related-q" className="text-base font-serif text-white/80 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#d4af37]" />
              <span>Powiązane pytania</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedQuestions.map((q) => (
                <button
                  key={q.slug}
                  onClick={() => handleSelectQuestion && handleSelectQuestion(q.slug)}
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

        {/* Navigation bottom */}
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
