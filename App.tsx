import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { VerseCardView } from './components/VerseCardView';
import { TopicHubView } from './components/TopicHubView';
import { QuestionAnswerView } from './components/QuestionAnswerView';
import { SeoAuditModal } from './components/SeoAuditModal';
import { LuminaAuthModal } from './components/LuminaAuthModal';
import { BackgroundPickerModal } from './components/BackgroundPickerModal';
import { UploadBackgroundModal } from './components/UploadBackgroundModal';
import { SavedVersesModal } from './components/SavedVersesModal';
import { ShareModal } from './components/ShareModal';
import { NotificationModal } from './components/NotificationModal';
import { ExitIntentMissionModal } from './components/ExitIntentMissionModal';
import { LoadingAnimation } from './components/LoadingAnimation';
import {
  saveVerseToFirestore,
  removeVerseFromFirestore,
  subscribeToUserSavedVerses,
  saveCustomThemeToFirestore,
  deleteCustomThemeFromFirestore,
  subscribeToUserCustomThemes,
  isFirebaseAuthActive,
} from './services/firebaseSync';
import { auth, onAuthStateChanged } from './lib/firebase';
import { BIBLE_VERSES, getRandomVerse, getVerseBySlug, getVerseById } from './data/verses';
import { BACKGROUNDS, DEFAULT_HOME_BACKGROUND, getBackgroundById, getDefaultBackgroundForCategory } from './data/backgrounds';
import { TOPIC_HUBS, getTopicBySlug } from './data/topics';
import { BIBLE_QUESTIONS, getQuestionBySlug } from './data/questions';
import { BibleVerse, BackgroundTheme, AspectRatioFormat, LuminaUser, AppViewMode, TopicHub, BibleQuestion } from './types';
import {
  getStoredLuminaUser,
  getStoredSavedVerseIds,
  getStoredHistory,
  saveLuminaSession,
  addVerseToFavorites,
  removeVerseFromFavorites,
  recordVerseHistory,
} from './services/luminaAuth';
import {
  getNotificationSettings,
  registerServiceWorker,
  checkAndTriggerScheduledNotification,
  NotificationSettings,
} from './services/notificationService';
import {
  updateDomSeo,
  getVerseSchema,
  getTopicSchema,
  getQuestionSchema,
  getWebSiteSchema,
  getOrganizationSchema,
  BASE_CANONICAL_DOMAIN,
} from './utils/seoHelper';
import { GeneratedCardResult, downloadCardImage, renderVerseCardToCanvas } from './utils/canvasGenerator';
import { shareWithWebShareAPI } from './utils/shareUtils';
import { trackEvent } from './utils/analytics';
import { playSpiritualChime } from './utils/audioChime';

export default function App() {
  // App navigation state
  const [viewMode, setViewMode] = useState<AppViewMode>('search');
  const [currentVerse, setCurrentVerse] = useState<BibleVerse>(BIBLE_VERSES[0]);
  const [selectedTopic, setSelectedTopic] = useState<TopicHub | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<BibleQuestion | null>(null);
  const [currentBackground, setCurrentBackground] = useState<BackgroundTheme>(BACKGROUNDS[0]);
  const [homeBackground, setHomeBackground] = useState<BackgroundTheme>(DEFAULT_HOME_BACKGROUND);
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundTheme[]>([]);
  const [format, setFormat] = useState<AspectRatioFormat>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // LUMINA user & favorites state
  const [user, setUser] = useState<LuminaUser | null>(null);
  const [savedVerseIds, setSavedVerseIds] = useState<string[]>([]);
  const [verseHistory, setVerseHistory] = useState<{ verseId: string; bgId: string; timestamp: number }[]>([]);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'download' | 'share' | 'save' | null>(null);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isUploadBgModalOpen, setIsUploadBgModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isSeoAuditOpen, setIsSeoAuditOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [activeCardResult, setActiveCardResult] = useState<GeneratedCardResult | null>(null);

  // Initialize session and URL routing on mount
  useEffect(() => {
    // 1. Load user session
    const storedUser = getStoredLuminaUser();
    setUser(storedUser);
    setSavedVerseIds(getStoredSavedVerseIds());
    setVerseHistory(getStoredHistory());

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const syncedUser: LuminaUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Użytkownik LUMINA',
          email: fbUser.email || 'brak-email@lumina.cc',
          avatarUrl: fbUser.photoURL || undefined,
          role: 'Społeczność LUMINA',
          isLoggedIn: true,
          savedVerseIds: getStoredSavedVerseIds(),
          history: getStoredHistory(),
        };
        setUser(syncedUser);
        saveLuminaSession(syncedUser);
      }
    });

    // 2. Sound preference
    const soundPref = localStorage.getItem('cc_sound_enabled');
    if (soundPref !== null) {
      setSoundEnabled(soundPref === 'true');
    }

    // 3. Load custom backgrounds and custom home background
    try {
      const savedBgJson = localStorage.getItem('cc_user_custom_backgrounds');
      if (savedBgJson) {
        setCustomBackgrounds(JSON.parse(savedBgJson));
      }
      const savedHomeBgJson = localStorage.getItem('cc_custom_home_bg');
      if (savedHomeBgJson) {
        setHomeBackground(JSON.parse(savedHomeBgJson));
      }
    } catch (e) {
      console.warn('Could not load custom backgrounds from localStorage', e);
    }

    // 4. Register Service Worker and check daily verse notifications
    registerServiceWorker();

    // 4. Check URL for direct verse, topic, question, or audit link
    const parseUrl = () => {
      let slug = '';
      let bgId = '';
      let topicSlug = '';
      let questionSlug = '';

      if (window.location.hash) {
        // Example: #w/psalm-23-1?bg=green-pastures-psalm23 or #temat/nadzieja or #pytanie/co-biblia-mowi-o-leku
        const hash = window.location.hash.replace(/^#\/?/, '');
        const [pathPart, queryPart] = hash.split('?');

        if (pathPart.startsWith('w/') || pathPart.startsWith('werset/')) {
          slug = pathPart.replace(/^(w\/|werset\/)/, '');
        } else if (pathPart.startsWith('temat/') || pathPart.startsWith('wersety/')) {
          topicSlug = pathPart.replace(/^(temat\/|wersety\/)/, '');
        } else if (pathPart.startsWith('pytanie/')) {
          questionSlug = pathPart.replace(/^pytanie\//, '');
        } else if (pathPart === 'audyt') {
          setIsSeoAuditOpen(true);
        }

        if (queryPart) {
          const params = new URLSearchParams(queryPart);
          bgId = params.get('bg') || '';
        }
      }

      if (window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        if (!slug && searchParams.get('w')) slug = searchParams.get('w') || '';
        if (!topicSlug && searchParams.get('temat')) topicSlug = searchParams.get('temat') || '';
        if (!questionSlug && searchParams.get('pytanie')) questionSlug = searchParams.get('pytanie') || '';
        if (searchParams.get('audit') === 'true') setIsSeoAuditOpen(true);
        if (!bgId && searchParams.get('bg')) bgId = searchParams.get('bg') || '';
      }

      // Check pathname (clean SSR / crawler URLs)
      const pathname = window.location.pathname;
      if (pathname.startsWith('/werset/')) {
        slug = pathname.replace('/werset/', '');
      } else if (pathname.startsWith('/wersety/')) {
        topicSlug = pathname.replace('/wersety/', '');
      } else if (pathname.startsWith('/pytanie/')) {
        questionSlug = pathname.replace('/pytanie/', '');
      }

      if (slug) {
        const found = getVerseBySlug(slug);
        if (found) {
          const bg = bgId ? getBackgroundById(bgId) : getBackgroundById(found.defaultBgId);
          displayVerse(found, bg, false);
          return;
        }
      }

      if (topicSlug) {
        const topic = getTopicBySlug(topicSlug);
        if (topic) {
          setSelectedTopic(topic);
          setViewMode('topic');
          return;
        }
      }

      if (questionSlug) {
        const q = getQuestionBySlug(questionSlug);
        if (q) {
          setSelectedQuestion(q);
          setViewMode('question');
          return;
        }
      }
    };

    parseUrl();
    window.addEventListener('hashchange', parseUrl);

    // Periodic check for scheduled daily notification (every 60s)
    const timer = setInterval(() => {
      checkAndTriggerScheduledNotification(currentVerse);
    }, 60000);

    return () => {
      window.removeEventListener('hashchange', parseUrl);
      clearInterval(timer);
      unsubscribeAuth();
    };
  }, []);

  // Check scheduled notification whenever verse is ready or updated
  useEffect(() => {
    checkAndTriggerScheduledNotification(currentVerse);
  }, [currentVerse]);

  // Update dynamic document title, meta tags, and JSON-LD schema when view or verse changes
  useEffect(() => {
    if (viewMode === 'verse') {
      const canonicalUrl = `${BASE_CANONICAL_DOMAIN}/werset/${currentVerse.slug}`;
      updateDomSeo({
        title: `„${currentVerse.text.slice(0, 50)}...” — ${currentVerse.reference} | Mój Werset Dnia`,
        description: `Przeczytaj ${currentVerse.reference} w przekładzie ${currentVerse.translation}: „${currentVerse.text}”. Poznaj kontekst biblijny i stwórz estetyczną grafikę ze Słowem Bożym.`,
        canonicalUrl,
        ogType: 'article',
        ogImage: currentBackground.imageUrl,
        jsonLd: getVerseSchema(currentVerse, canonicalUrl),
      });
    } else if (viewMode === 'topic' && selectedTopic) {
      const canonicalUrl = `${BASE_CANONICAL_DOMAIN}/wersety/${selectedTopic.slug}`;
      updateDomSeo({
        title: `${selectedTopic.h1} | Mój Werset Dnia — Christian Culture`,
        description: selectedTopic.metaDescription,
        canonicalUrl,
        ogType: 'website',
        jsonLd: getTopicSchema(selectedTopic, canonicalUrl),
      });
    } else if (viewMode === 'question' && selectedQuestion) {
      const canonicalUrl = `${BASE_CANONICAL_DOMAIN}/pytanie/${selectedQuestion.slug}`;
      updateDomSeo({
        title: `${selectedQuestion.question} — Krótka odpowiedź i wersety biblijne`,
        description: selectedQuestion.metaDescription,
        canonicalUrl,
        ogType: 'article',
        jsonLd: getQuestionSchema(selectedQuestion, canonicalUrl),
      });
    } else {
      updateDomSeo({
        title: 'Mój Werset Dnia — Christian Culture',
        description: 'Wyszukiwarka Słowa Bożego i generator pięknych kart z wersetami biblijnymi dla ekosystemu Christian Culture oraz portalu LUMINA (polskieradio.cc).',
        canonicalUrl: `${BASE_CANONICAL_DOMAIN}/`,
        ogType: 'website',
        ogImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        jsonLd: [getOrganizationSchema(), getWebSiteSchema(BASE_CANONICAL_DOMAIN)],
      });
    }
  }, [viewMode, currentVerse, currentBackground, selectedTopic, selectedQuestion]);

  // Display a topic hub
  const displayTopic = useCallback((topicSlug: string) => {
    const topic = getTopicBySlug(topicSlug);
    if (topic) {
      setSelectedTopic(topic);
      setViewMode('topic');
      const newHash = `#temat/${topic.slug}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
      trackEvent('topic_viewed', { topic: topic.slug });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Display a natural language Bible question
  const displayQuestion = useCallback((questionSlug: string) => {
    const question = getQuestionBySlug(questionSlug);
    if (question) {
      setSelectedQuestion(question);
      setViewMode('question');
      const newHash = `#pytanie/${question.slug}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
      trackEvent('question_viewed', { question: question.slug });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Display a verse with optional sound & history tracking
  const displayVerse = useCallback(
    (verse: BibleVerse, bg?: BackgroundTheme, triggerSound = true) => {
      const chosenBg = bg || getBackgroundById(verse.defaultBgId);
      setCurrentVerse(verse);
      setCurrentBackground(chosenBg);
      setViewMode('verse');

      // Update URL hash smoothly without reloading
      const newHash = `#w/${verse.slug}?bg=${chosenBg.id}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }

      // Record in history
      recordVerseHistory(verse.id, chosenBg.id);
      setVerseHistory(getStoredHistory());

      trackEvent('verse_generated', { verse_id: verse.id, category: verse.category });

      if (triggerSound && soundEnabled) {
        playSpiritualChime(true);
      }
    },
    [soundEnabled]
  );

  // Trigger smooth spiritual drawing animation
  const handleRandomize = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Pick random verse that isn't the exact same one if possible
      let next = getRandomVerse();
      if (BIBLE_VERSES.length > 1 && next.id === currentVerse.id) {
        next = getRandomVerse();
      }
      const bg = getBackgroundById(next.defaultBgId);
      displayVerse(next, bg, true);
      setIsLoading(false);
    }, 450);
  }, [currentVerse.id, displayVerse]);

  // Select a specific verse (from search or suggestion chip)
  const handleSelectVerse = useCallback(
    (verse: BibleVerse, bgId?: string) => {
      setIsLoading(true);
      setTimeout(() => {
        const bg = bgId ? getBackgroundById(bgId) : getBackgroundById(verse.defaultBgId);
        displayVerse(verse, bg, true);
        setIsLoading(false);
      }, 350);
    },
    [displayVerse]
  );

  // Cycle to next background
  const handleCycleBackground = useCallback(() => {
    const currentIndex = BACKGROUNDS.findIndex((b) => b.id === currentBackground.id);
    const nextIndex = (currentIndex + 1) % BACKGROUNDS.length;
    const nextBg = BACKGROUNDS[nextIndex];
    setCurrentBackground(nextBg);
    trackEvent('background_changed', { bg_id: nextBg.id });

    // Update URL hash
    window.history.replaceState(null, '', `#w/${currentVerse.slug}?bg=${nextBg.id}`);
  }, [currentBackground.id, currentVerse.slug]);

  const handleSelectBackgroundFromModal = useCallback(
    (bg: BackgroundTheme) => {
      setCurrentBackground(bg);
      trackEvent('background_changed', { bg_id: bg.id });
      window.history.replaceState(null, '', `#w/${currentVerse.slug}?bg=${bg.id}`);
    },
    [currentVerse.slug]
  );

  // Apply custom uploaded background (to home, verse, or both)
  const handleApplyCustomBackground = useCallback(
    (theme: BackgroundTheme, target: 'all' | 'home' | 'verse') => {
      // 1. Save to custom backgrounds list
      setCustomBackgrounds((prev) => {
        const exists = prev.some((b) => b.id === theme.id || (b.imageUrl === theme.imageUrl && theme.imageUrl.startsWith('http')));
        const updated = exists ? prev : [theme, ...prev];
        try {
          localStorage.setItem('cc_user_custom_backgrounds', JSON.stringify(updated.slice(0, 20)));
        } catch (e) {
          console.warn('Storage limit reached for custom backgrounds', e);
        }
        return updated;
      });

      if (user?.id) {
        saveCustomThemeToFirestore(user.id, theme).catch(() => {});
      }

      // 2. Apply to home
      if (target === 'home' || target === 'all') {
        setHomeBackground(theme);
        try {
          localStorage.setItem('cc_custom_home_bg', JSON.stringify(theme));
        } catch (e) {
          console.warn('Storage limit reached for home bg', e);
        }
      }

      // 3. Apply to verse
      if (target === 'verse' || target === 'all') {
        setCurrentBackground(theme);
        trackEvent('background_custom_applied', { bg_id: theme.id, target });
        window.history.replaceState(null, '', `#w/${currentVerse.slug}?bg=${theme.id}`);
      }
    },
    [currentVerse.slug, user?.id]
  );

  const handleResetHomeBackground = useCallback(() => {
    setHomeBackground(DEFAULT_HOME_BACKGROUND);
    localStorage.removeItem('cc_custom_home_bg');
  }, []);

  const handleDeleteCustomTheme = useCallback((id: string) => {
    setCustomBackgrounds((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('cc_user_custom_backgrounds', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not update custom backgrounds in storage', e);
      }
      return updated;
    });
    setHomeBackground((prev) => (prev?.id === id ? DEFAULT_HOME_BACKGROUND : prev));
    if (user?.id) {
      deleteCustomThemeFromFirestore(user.id, id).catch(() => {});
    }
  }, [user?.id]);

  // Firestore Real-Time Subscriptions for logged-in user
  useEffect(() => {
    if (!user?.id || !isFirebaseAuthActive(user.id)) return;

    // 1. Sync saved verses in real-time
    const unsubscribeVerses = subscribeToUserSavedVerses(user.id, (cloudVerseIds) => {
      if (cloudVerseIds && cloudVerseIds.length > 0) {
        setSavedVerseIds(cloudVerseIds);
      }
    });

    // 2. Sync custom themes in real-time
    const unsubscribeThemes = subscribeToUserCustomThemes(user.id, (cloudThemes) => {
      if (cloudThemes && cloudThemes.length > 0) {
        setCustomBackgrounds(cloudThemes);
      }
    });

    return () => {
      unsubscribeVerses();
      unsubscribeThemes();
    };
  }, [user?.id]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('cc_sound_enabled', String(next));
  };

  // Toggle favorite in LUMINA / Moje Wersety
  const handleSaveToLumina = () => {
    if (savedVerseIds.includes(currentVerse.id)) {
      const updated = removeVerseFromFavorites(currentVerse.id);
      setSavedVerseIds(updated);
      if (user) {
        saveLuminaSession({ ...user, savedVerseIds: updated });
        removeVerseFromFirestore(user.id, currentVerse.id).catch(() => {});
      }
    } else {
      const updated = addVerseToFavorites(currentVerse.id);
      setSavedVerseIds(updated);
      if (user) {
        saveLuminaSession({ ...user, savedVerseIds: updated });
        saveVerseToFirestore(user.id, currentVerse).catch(() => {});
      }
    }
  };

  // Handler when LUMINA login is required
  const handleRequireLuminaAuth = (action: 'download' | 'share' | 'save') => {
    setPendingAction(action);
    setIsAuthModalOpen(true);
  };

  // Callback on successful LUMINA login
  const handleLuminaAuthSuccess = async (authenticatedUser: LuminaUser) => {
    setUser(authenticatedUser);
    setSavedVerseIds(authenticatedUser.savedVerseIds);
    setVerseHistory(authenticatedUser.history);

    const actionToRun = pendingAction;
    setPendingAction(null);

    // Carry out the pending action seamlessly after login without losing state!
    if (actionToRun === 'save') {
      const updated = addVerseToFavorites(currentVerse.id);
      setSavedVerseIds(updated);
    } else if (actionToRun === 'download') {
      try {
        const card = await renderVerseCardToCanvas({
          verse: currentVerse,
          background: currentBackground,
          format,
        });
        downloadCardImage(card.blob, `moj-werset-dnia-${currentVerse.slug}.png`);
      } catch (e) {
        console.error('Download failed after login', e);
      }
    } else if (actionToRun === 'share') {
      try {
        const card = await renderVerseCardToCanvas({
          verse: currentVerse,
          background: currentBackground,
          format,
        });
        setActiveCardResult(card);
        const shared = await shareWithWebShareAPI({
          verse: currentVerse,
          background: currentBackground,
          cardFile: card.file,
        });
        if (!shared) {
          setIsShareModalOpen(true);
        }
      } catch (e) {
        setIsShareModalOpen(true);
      }
    }
  };

  const isCurrentSaved = savedVerseIds.includes(currentVerse.id);

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f1f3f7] flex flex-col selection:bg-amber-500/20 selection:text-amber-200 relative overflow-x-hidden">
      {/* Ambient Custom Homepage Background Layer */}
      {homeBackground && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={homeBackground.imageUrl}
            alt="Tło strony głównej"
            className="w-full h-full object-cover object-center scale-100 transition-all duration-700 opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Subtle contrast overlay that preserves vivid image colors while ensuring 100% text readability */}
          <div className="absolute inset-0 bg-[#07080a]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07080a]/80 via-[#07080a]/25 to-[#07080a]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#07080a]/15 to-[#07080a]/70" />
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        savedCount={savedVerseIds.length}
        soundEnabled={soundEnabled}
        notificationsOptIn={notificationSettings.optIn}
        onToggleSound={handleToggleSound}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenUploadModal={() => setIsUploadBgModalOpen(true)}
        onOpenAuthModal={() => {
          setPendingAction(null);
          setIsAuthModalOpen(true);
        }}
        onGoHome={() => {
          setViewMode('search');
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />

      {/* Main View Flow */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col relative z-10">
        {isLoading && <LoadingAnimation />}

        {viewMode === 'search' && (
          <SearchHero
            onSelectVerse={(v) => handleSelectVerse(v)}
            onRandomVerse={handleRandomize}
            isLoading={isLoading}
            notificationsOptIn={notificationSettings.optIn}
            onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
            onSelectTopic={displayTopic}
            onSelectQuestion={displayQuestion}
            onOpenSeoAudit={() => setIsSeoAuditOpen(true)}
          />
        )}

        {viewMode === 'verse' && (
          <VerseCardView
            verse={currentVerse}
            background={currentBackground}
            format={format}
            isSavedInLumina={isCurrentSaved}
            isLoggedIn={user !== null}
            notificationsOptIn={notificationSettings.optIn}
            onChangeFormat={(f) => setFormat(f)}
            onNextVerse={handleRandomize}
            onCycleBackground={handleCycleBackground}
            onOpenBackgroundModal={() => setIsBgModalOpen(true)}
            onSaveToLumina={handleSaveToLumina}
            onOpenSavedModal={() => setIsSavedModalOpen(true)}
            onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
            onRequireLuminaAuth={handleRequireLuminaAuth}
            onOpenShareModal={(card) => {
              setActiveCardResult(card || null);
              setIsShareModalOpen(true);
            }}
            onBackToSearch={() => {
              setViewMode('search');
              window.history.replaceState(null, '', window.location.pathname);
            }}
            onSelectTopic={displayTopic}
            onSelectVerse={(v) => handleSelectVerse(v)}
          />
        )}

        {viewMode === 'topic' && selectedTopic && (
          <TopicHubView
            topic={selectedTopic}
            onSelectVerse={(v) => handleSelectVerse(v)}
            onSelectRelatedTopic={displayTopic}
            onBackToSearch={() => {
              setViewMode('search');
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        )}

        {viewMode === 'question' && selectedQuestion && (
          <QuestionAnswerView
            question={selectedQuestion}
            onSelectVerse={(v) => handleSelectVerse(v)}
            onSelectTopic={displayTopic}
            onSelectRelatedQuestion={displayQuestion}
            onBackToSearch={() => {
              setViewMode('search');
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        )}
      </main>

      {/* Page Footer */}
      <footer id="app-footer" className="w-full relative z-10 py-6 border-t border-white/5 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://polskieradio.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-cinzel text-xs text-white/50 hover:text-[#dfb872] transition-colors tracking-widest font-medium"
          >
            Christian Culture 2026
          </a>

          <button
            type="button"
            onClick={() => setIsMissionModalOpen(true)}
            className="font-cinzel text-xs text-white/50 hover:text-[#dfb872] transition-colors tracking-widest font-medium cursor-pointer"
          >
            Wesprzyj Misję Kultury Chrześcijańskiej
          </button>
        </div>
      </footer>

      {/* Exit Intent & Mission Support Modal */}
      <ExitIntentMissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
      />

      {/* SEO + AEO + GEO Compliance Audit Modal */}
      <SeoAuditModal
        isOpen={isSeoAuditOpen}
        onClose={() => setIsSeoAuditOpen(false)}
      />

      {/* LUMINA Authentication Modal */}
      <LuminaAuthModal
        isOpen={isAuthModalOpen}
        pendingAction={pendingAction}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleLuminaAuthSuccess}
      />

      {/* Background Visual Picker Modal */}
      <BackgroundPickerModal
        isOpen={isBgModalOpen}
        currentBgId={currentBackground.id}
        customBackgrounds={customBackgrounds}
        onOpenUploadModal={() => setIsUploadBgModalOpen(true)}
        onSelectBackground={handleSelectBackgroundFromModal}
        onClose={() => setIsBgModalOpen(false)}
      />

      {/* Upload & Personalize Background Modal */}
      <UploadBackgroundModal
        isOpen={isUploadBgModalOpen}
        onClose={() => setIsUploadBgModalOpen(false)}
        onApplyBackground={handleApplyCustomBackground}
        homeBg={homeBackground}
        onResetHomeBackground={handleResetHomeBackground}
        savedCustomThemes={customBackgrounds}
        onDeleteCustomTheme={handleDeleteCustomTheme}
      />

      {/* Moje Wersety / Saved Verses Modal */}
      <SavedVersesModal
        isOpen={isSavedModalOpen}
        user={user}
        savedVerseIds={savedVerseIds}
        history={verseHistory}
        onSelectVerse={(v, bgId) => handleSelectVerse(v, bgId)}
        onUpdateSavedIds={(ids) => setSavedVerseIds(ids)}
        onClose={() => setIsSavedModalOpen(false)}
      />

      {/* Social & Web Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        verse={currentVerse}
        background={currentBackground}
        cardResult={activeCardResult}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Daily Verse Notification Opt-in Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentVerse={currentVerse}
        soundEnabled={soundEnabled}
        onSettingsChange={(newSettings) => setNotificationSettings(newSettings)}
      />
    </div>
  );
}
