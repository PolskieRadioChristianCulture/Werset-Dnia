import { BibleVerse, BackgroundTheme, AspectRatioFormat, LuminaUser } from '../types';
import { GeneratedCardResult, renderVerseCardToCanvas } from '../utils/canvasGenerator';
import { db, defaultDb } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { trackEvent } from '../utils/analytics';

export interface PublishResult {
  success: boolean;
  postId: string;
  cardDataUrl: string;
  authorSlug: string;
  authorName: string;
  feedUrl: string;
  profileUrl: string;
  error?: string;
}

/**
 * Automatyczne publikowanie wygenerowanej karty wersetu w portalu LUMINA:
 * 1. Zapisuje w kolekcji `lumina_posts` (Tablica Społeczności) w Firestore
 * 2. Aktualizuje profil osobisty użytkownika w `lumina_profiles` w Firestore
 * 3. Zapisuje w lokalnej pamięci podręcznej localStorage (`lumina_cloud_posts_cache`, `lumina_profile_*`)
 * 4. Emituje zdarzenia `lumina_post_published` i `storage` dla synchronizacji na żywo.
 */
export async function publishVerseToLuminaCommunity({
  verse,
  background,
  format,
  user,
  renderedCard,
}: {
  verse: BibleVerse;
  background: BackgroundTheme;
  format: AspectRatioFormat;
  user: LuminaUser;
  renderedCard?: GeneratedCardResult | null;
}): Promise<PublishResult> {
  try {
    // 1. Upewnij się, że grafika ze stopką jest wyrenderowana
    let card = renderedCard;
    if (!card || !card.dataUrl) {
      card = await renderVerseCardToCanvas({ verse, background, format });
    }

    // 2. Normalizacja tożsamości autora
    let authorName = user.name || 'Użytkownik LUMINA';
    if (!authorName || authorName.includes('@')) {
      authorName = 'Społeczność LUMINA';
    }

    const emailLower = (user.email || '').toLowerCase();
    const nameLower = authorName.toLowerCase();
    let authorSlug = user.id ? user.id.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'user';

    if (nameLower.includes('cezary') || emailLower.includes('nazirczarkes') || emailLower.includes('cezary')) {
      authorSlug = 'cezaryrgowski';
      authorName = 'Cezary Rogowski';
    } else if (nameLower.includes('wioletta') || emailLower.includes('wioletta')) {
      authorSlug = 'wiolettarogowska';
      authorName = 'Wioletta Rogowska';
    } else if (nameLower.includes('andrzej') || emailLower.includes('thiel')) {
      authorSlug = 'andrzejthiel';
    }

    const authorAvatar = user.avatarUrl || 'lumina_icon.jpg';
    const authorRole = user.role || 'Społeczność LUMINA ✨';
    const authorUid = user.id || authorSlug;

    const postId = 'post_werset_' + Date.now();

    // 3. Pełny obiekt wpisu społecznościowego
    const postPayload = {
      id: postId,
      type: 'verse_card',
      title: `Mój Werset Dnia — ${verse.reference}`,
      text: `„${verse.text}”\n— ${verse.reference} (${verse.translation})\n\n🕊️ Opublikowano z aplikacji Mój Werset Dnia (polskieradio.cc/werset-dnia)`,
      image: card.webOptimizedDataUrl || card.dataUrl, // Zoptymalizowana karta ze stopką "Mój Werset Dnia" mieszcząca się w limicie Firestore
      verseId: verse.id,
      verseReference: verse.reference,
      verseText: verse.text,
      verseTranslation: verse.translation,
      aspectFormat: format,
      author: authorName,
      authorSlug: authorSlug,
      authorAvatar: authorAvatar,
      authorRole: authorRole,
      authorUid: authorUid,
      likes: 1,
      amen: 1,
      time: 'Przed chwilą • 📖 Mój Werset Dnia',
      createdAtTimestamp: Date.now(),
      createdAtDateStr: new Date().toISOString(),
    };

    // 4. Synchronizacja w LocalStorage (dla natychmiastowego widoku na tej samej domenie)
    try {
      // A. Tablica Społeczności (Feed Cache)
      const rawFeed = localStorage.getItem('lumina_cloud_posts_cache');
      const feedList = rawFeed ? JSON.parse(rawFeed) : [];
      if (!feedList.some((p: any) => p.id === postId)) {
        feedList.unshift(postPayload);
        localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(feedList));
      }

      // B. Profile osobiste w LocalStorage
      const isCezary = authorSlug.includes('cezary');
      const isWioletta = authorSlug.includes('wioletta');

      const profileKeys = [
        `lumina_profile_${authorSlug}`,
        'lumina_current_user_profile',
        'lumina_my_profile',
        isCezary ? 'lumina_profile_cezaryrgowski' : null,
        isCezary ? 'lumina_main_user_profile' : null,
        isWioletta ? 'lumina_profile_wiolettarogowska' : null,
      ].filter(Boolean) as string[];

      profileKeys.forEach((key) => {
        try {
          const rawProf = localStorage.getItem(key);
          let prof = rawProf ? JSON.parse(rawProf) : null;
          if (!prof) {
            prof = { name: authorName, slug: authorSlug, avatar: authorAvatar, role: authorRole, posts: [] };
          }
          if (!Array.isArray(prof.posts)) {
            prof.posts = [];
          }
          if (!prof.posts.some((p: any) => p.id === postId)) {
            prof.posts.unshift(postPayload);
            localStorage.setItem(key, JSON.stringify(prof));
          }
        } catch (e) {
          console.warn(`Błąd zapisu profilu ${key}:`, e);
        }
      });

      // C. Emisja eventów w przeglądarce
      window.dispatchEvent(new CustomEvent('lumina_post_published', { detail: postPayload }));
      window.dispatchEvent(new Event('storage'));
    } catch (localErr) {
      console.warn('Lumina local storage sync warning:', localErr);
    }

    // 5. Zapis w chmurze Firestore
    // A. Zapis w domyślnej bazie Firestore LUMINA (lumina-cc)
    if (defaultDb) {
      try {
        await addDoc(collection(defaultDb, 'lumina_posts'), {
          ...postPayload,
          createdAtTimestamp: serverTimestamp(),
        });
      } catch (fsErr) {
        console.warn('Zapis w defaultDb lumina_posts ostrzeżenie:', fsErr);
      }

      try {
        const profileDocRef = doc(defaultDb, 'lumina_profiles', authorSlug);
        await setDoc(
          profileDocRef,
          {
            slug: authorSlug,
            name: authorName,
            role: authorRole,
            avatar: authorAvatar,
            posts: arrayUnion(postPayload),
            lastPublishedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (profFsErr) {
        console.warn('Aktualizacja profilu w defaultDb ostrzeżenie:', profFsErr);
      }
    }

    // B. Zapis zapasowy w bazie db z konfiguracji appletu
    if (db && db !== defaultDb) {
      try {
        await addDoc(collection(db, 'lumina_posts'), {
          ...postPayload,
          createdAtTimestamp: serverTimestamp(),
        });
      } catch (fsErr2) {
        // Ignoruj opcjonalny błąd zapasowy
      }
    }

    // 6. Śledzenie analityki
    trackEvent('verse_published_to_lumina', {
      verse_id: verse.id,
      author_slug: authorSlug,
      format,
    });

    return {
      success: true,
      postId,
      cardDataUrl: card.dataUrl,
      authorSlug,
      authorName,
      feedUrl: 'https://polskieradio.cc/tablica',
      profileUrl: `https://polskieradio.cc/lumina-profile.html?u=${authorSlug}`,
    };
  } catch (err: any) {
    console.error('Błąd publikacji w LUMINA:', err);
    return {
      success: false,
      postId: '',
      cardDataUrl: '',
      authorSlug: '',
      authorName: '',
      feedUrl: 'https://polskieradio.cc/tablica',
      profileUrl: 'https://polskieradio.cc/profil',
      error: err?.message || 'Wystąpił błąd podczas publikacji',
    };
  }
}
