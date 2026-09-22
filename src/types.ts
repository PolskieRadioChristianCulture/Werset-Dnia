export type VerseCategory = 
  | 'nadzieja' 
  | 'pokoj' 
  | 'sila' 
  | 'madrosc' 
  | 'pocieszenie' 
  | 'wiara' 
  | 'przebaczenie' 
  | 'milosc' 
  | 'ochrona' 
  | 'zbawienie' 
  | 'modlitwa' 
  | 'psalm23'
  | 'zaufanie';

export interface BibleVerse {
  id: string;
  book: string;
  bookShort: string;
  chapter: number;
  verse: string;
  reference: string;
  text: string;
  translation: string;
  category: VerseCategory;
  tags: string[];
  defaultBgId: string;
  slug: string;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  overlayGradient: string;
  attribution?: string;
  mood: string;
}

export type AspectRatioFormat = '9:16' | '1:1' | '4:5' | '16:9';

export interface FormatOption {
  id: AspectRatioFormat;
  label: string;
  description: string;
  aspectClass: string;
  canvasWidth: number;
  canvasHeight: number;
  iconName: string;
}

export interface LuminaUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isLoggedIn: boolean;
  savedVerseIds: string[];
  history: {
    verseId: string;
    bgId: string;
    timestamp: number;
  }[];
}

export type AppViewMode = 'search' | 'verse' | 'loading' | 'topic' | 'question' | 'audit';

export interface TopicHub {
  slug: string;
  name: string;
  h1: string;
  metaDescription: string;
  shortAnswer: string;
  biblicalContext: string;
  verseSlugs: string[];
  relatedTopicSlugs: string[];
  relatedQuestionSlugs: string[];
}

export interface BibleQuestion {
  slug: string;
  question: string;
  metaDescription: string;
  shortAnswer: string;
  biblicalEvidenceSummary: string;
  keyVerseSlugs: string[];
  biblicalContext: string;
  relatedTopicSlugs: string[];
  relatedQuestionSlugs: string[];
}

export interface SeoAuditItem {
  id: string;
  category: string;
  label: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
}
