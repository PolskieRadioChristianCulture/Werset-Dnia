import { BibleVerse } from '../types';

/**
 * Mapowanie polskich skrótów i nazw ksiąg biblijnych z Wersetu Dnia
 * na 3-literowe identyfikatory USFM/OSIS używane w serwisie MojaBiblia (polskieradio.cc/mojabiblia).
 */
const BOOK_MAP: Record<string, string> = {
  // Stary Testament
  'rdz': 'GEN', 'rodzaju': 'GEN', 'księga rodzaju': 'GEN', 'gen': 'GEN',
  'wj': 'EXO', 'wyjścia': 'EXO', 'księga wyjścia': 'EXO', 'exo': 'EXO',
  'kpł': 'LEV', 'kapłańska': 'LEV', 'księga kapłańska': 'LEV', 'lev': 'LEV',
  'lb': 'NUM', 'liczb': 'NUM', 'księga liczb': 'NUM', 'num': 'NUM',
  'pwt': 'DEU', 'powtórzonego prawa': 'DEU', 'księga powtórzonego prawa': 'DEU', 'deu': 'DEU',
  'joz': 'JOS', 'jozuego': 'JOS', 'księga jozuego': 'JOS', 'jos': 'JOS',
  'sdz': 'JDG', 'sędziów': 'JDG', 'księga sędziów': 'JDG', 'jdg': 'JDG',
  'rut': 'RUT', 'księga rut': 'RUT',
  '1sm': '1SA', '1 samuela': '1SA', '1 księga samuela': '1SA',
  '2sm': '2SA', '2 samuela': '2SA', '2 księga samuela': '2SA',
  '1krl': '1KI', '1 królewska': '1KI', '1 księga królewska': '1KI',
  '2krl': '2KI', '2 królewska': '2KI', '2 księga królewska': '2KI',
  '1krn': '1CH', '1 kronik': '1CH', '1 księga kronik': '1CH',
  '2krn': '2CH', '2 kronik': '2CH', '2 księga kronik': '2CH',
  'ezd': 'EZR', 'ezdrasza': 'EZR', 'księga ezdrasza': 'EZR',
  'neh': 'NEH', 'nehemiasza': 'NEH', 'księga nehemiasza': 'NEH',
  'est': 'EST', 'estery': 'EST', 'księga estery': 'EST',
  'hi': 'JOB', 'hioba': 'JOB', 'księga hioba': 'JOB', 'job': 'JOB',
  'ps': 'PSA', 'psalm': 'PSA', 'psalmy': 'PSA', 'księga psalmów': 'PSA', 'psalmów': 'PSA', 'psa': 'PSA',
  'prz': 'PRO', 'przypowieści': 'PRO', 'przysłów': 'PRO', 'księga przysłów': 'PRO', 'przypowieści salomona': 'PRO', 'pro': 'PRO',
  'koh': 'ECC', 'koheleta': 'ECC', 'kaznodziei': 'ECC', 'księga koheleta': 'ECC', 'ecc': 'ECC',
  'pnp': 'SNG', 'pieśń nad pieśniami': 'SNG', 'sng': 'SNG',
  'iz': 'ISA', 'izajasz': 'ISA', 'izajasza': 'ISA', 'księga izajasza': 'ISA', 'isa': 'ISA',
  'jr': 'JER', 'jeremiasz': 'JER', 'jeremiasza': 'JER', 'księga jeremiasza': 'JER', 'jer': 'JER',
  'lm': 'LAM', 'lamentacje': 'LAM', 'treny': 'LAM', 'lamentacje jeremiasza': 'LAM',
  'ez': 'EZK', 'ezechiel': 'EZK', 'ezechiela': 'EZK', 'księga ezechiela': 'EZK', 'ezk': 'EZK',
  'dn': 'DAN', 'daniel': 'DAN', 'daniela': 'DAN', 'księga daniela': 'DAN', 'dan': 'DAN',
  'oz': 'HOS', 'ozeasz': 'HOS', 'ozeasza': 'HOS', 'księga ozeasza': 'HOS', 'hos': 'HOS',
  'jl': 'JOL', 'joel': 'JOL', 'joela': 'JOL', 'księga joela': 'JOL',
  'am': 'AMO', 'amos': 'AMO', 'amosa': 'AMO', 'księga amosa': 'AMO',
  'abd': 'OBA', 'abdiasz': 'OBA', 'abdiasza': 'OBA',
  'jon': 'JON', 'jonasz': 'JON', 'jonasza': 'JON', 'księga jonasza': 'JON',
  'mich': 'MIC', 'micheasz': 'MIC', 'micheasza': 'MIC', 'księga micheasza': 'MIC',
  'nah': 'NAM', 'nahum': 'NAM', 'nahuma': 'NAM',
  'hab': 'HAB', 'habakuk': 'HAB', 'habakuka': 'HAB', 'księga habakuka': 'HAB',
  'sof': 'ZEP', 'sofoniasz': 'ZEP', 'sofoniasza': 'ZEP',
  'agg': 'HAG', 'aggeusz': 'HAG', 'aggeusza': 'HAG',
  'zach': 'ZEC', 'zachariasz': 'ZEC', 'zachariasza': 'ZEC',
  'mal': 'MAL', 'malachiasz': 'MAL', 'malachiasza': 'MAL',

  // Nowy Testament
  'mt': 'MAT', 'mateusz': 'MAT', 'mateusza': 'MAT', 'ewangelia mateusza': 'MAT', 'ewangelia wg św. mateusza': 'MAT', 'mat': 'MAT',
  'mk': 'MRK', 'marek': 'MRK', 'marka': 'MRK', 'ewangelia marka': 'MRK', 'ewangelia wg św. marka': 'MRK', 'mrk': 'MRK',
  'łk': 'LUK', 'lk': 'LUK', 'łukasz': 'LUK', 'łukasza': 'LUK', 'ewangelia łukasza': 'LUK', 'ewangelia wg św. łukasza': 'LUK', 'luk': 'LUK',
  'j': 'JHN', 'jan': 'JHN', 'jana': 'JHN', 'ewangelia jana': 'JHN', 'ewangelia wg św. jana': 'JHN', 'jhn': 'JHN',
  'dz': 'ACT', 'dzieje': 'ACT', 'dzieje apostolskie': 'ACT', 'act': 'ACT',
  'rz': 'ROM', 'rzymian': 'ROM', 'list do rzymian': 'ROM', 'rom': 'ROM',
  '1kor': '1CO', '1 koryntian': '1CO', '1 list do koryntian': '1CO',
  '2kor': '2CO', '2 koryntian': '2CO', '2 list do koryntian': '2CO',
  'gal': 'GAL', 'galacjan': 'GAL', 'list do galacjan': 'GAL', 'galatów': 'GAL',
  'ef': 'EPH', 'efezjan': 'EPH', 'list do efezjan': 'EPH', 'eph': 'EPH',
  'flp': 'PHP', 'filipian': 'PHP', 'list do filipian': 'PHP', 'php': 'PHP',
  'kol': 'COL', 'kolosan': 'COL', 'list do kolosan': 'COL', 'col': 'COL',
  '1tes': '1TH', '1 tesaloniczan': '1TH', '1 list do tesaloniczan': '1TH',
  '2tes': '2TH', '2 tesaloniczan': '2TH', '2 list do tesaloniczan': '2TH',
  '1tm': '1TI', '1 tymoteusza': '1TI', '1 list do tymoteusza': '1TI',
  '2tm': '2TI', '2 tymoteusza': '2TI', '2 list do tymoteusza': '2TI',
  'tt': 'TIT', 'tytusa': 'TIT', 'list do tytusa': 'TIT',
  'flm': 'PHM', 'filemona': 'PHM', 'list do filemona': 'PHM',
  'hbr': 'HEB', 'hebrajczyków': 'HEB', 'list do hebrajczyków': 'HEB', 'heb': 'HEB',
  'jk': 'JAS', 'jakub': 'JAS', 'jakuba': 'JAS', 'list św. jakuba': 'JAS', 'jas': 'JAS',
  '1p': '1PE', '1 piotra': '1PE', '1 list piotra': '1PE', '1 list św. piotra': '1PE', '1pe': '1PE',
  '2p': '2PE', '2 piotra': '2PE', '2 list piotra': '2PE', '2 list św. piotra': '2PE', '2pe': '2PE',
  '1j': '1JN', '1 jana': '1JN', '1 list jana': '1JN', '1 list św. jana': '1JN', '1jn': '1JN',
  '2j': '2JN', '2 jana': '2JN', '2 list jana': '2JN',
  '3j': '3JN', '3 jana': '3JN', '3 list jana': '3JN',
  'jud': 'JUD', 'judy': 'JUD', 'list św. judy': 'JUD',
  'obj': 'REV', 'ap': 'REV', 'apokalipsa': 'REV', 'objawienie': 'REV', 'objawienie św. jana': 'REV', 'rev': 'REV',
};

/**
 * Rozpoznaje 3-literowy kod księgi MojaBiblia na podstawie nazwy lub skrótu.
 */
export function getMojaBibliaBookId(bookOrShort: string): string {
  if (!bookOrShort) return 'PSA';
  const clean = bookOrShort.toLowerCase().trim().replace(/[\s\.\,\-]+/g, ' ');
  if (BOOK_MAP[clean]) return BOOK_MAP[clean];

  // Wyszukanie częściowe
  for (const [key, id] of Object.entries(BOOK_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return id;
    }
  }

  return 'PSA';
}

/**
 * Generuje inteligentny, bezpośredni odnośnik do badania danego wersetu w MojaBiblia:
 * Otwiera werset w trybie interlinearnym ze Strongiem i 4 przekładami (UBG, BW, BT, BG).
 */
export function getMojaBibliaStudyUrl(verse: BibleVerse): string {
  const bookId = getMojaBibliaBookId(verse.bookShort || verse.book);
  const chapter = verse.chapter || 1;
  // W przypadku zakresów '1-2' lub '10,11' wyciągamy pierwszy numer wersetu
  const vMatch = String(verse.verse || '').match(/\d+/);
  const vNum = vMatch ? vMatch[0] : '1';

  return `https://polskieradio.cc/mojabiblia?book=${bookId}&chapter=${chapter}&verse=${vNum}&mode=interlinear`;
}

/**
 * Generuje odnośnik do wyszukiwarki lub leksykonu w MojaBiblia na podstawie zapytania użytkownika.
 */
export function getMojaBibliaSearchUrl(query: string): string {
  const q = encodeURIComponent(query.trim());
  return `https://polskieradio.cc/mojabiblia?q=${q}`;
}

/**
 * Inteligentnie parsuje zapytanie użytkownika (np. "Psalm 23:1", "Jan 3:16", "nadzieja")
 * i generuje bezpośredni odnośnik do wersetu lub wyszukiwania w MojaBiblia.
 */
export function parseQueryToMojaBibliaUrl(query: string): string {
  const clean = query.trim();
  if (!clean) return 'https://polskieradio.cc/mojabiblia';

  // Rozpoznawanie wzorca referencji biblijnej np. "Psalm 23:1", "Ps 23, 1", "Jan 3:16", "1 Kor 13:4", "Rz 8"
  const refMatch = clean.match(/^([1-3]?\s*[a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ]+)\s+(\d+)[:,\s]*(\d+)?/i);
  if (refMatch) {
    const rawBook = refMatch[1].trim();
    const chapter = refMatch[2];
    const verse = refMatch[3] || '1';
    const bookId = getMojaBibliaBookId(rawBook);
    return `https://polskieradio.cc/mojabiblia?book=${bookId}&chapter=${chapter}&verse=${verse}&mode=interlinear`;
  }

  return getMojaBibliaSearchUrl(clean);
}

