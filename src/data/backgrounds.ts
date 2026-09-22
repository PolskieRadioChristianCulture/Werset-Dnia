import { BackgroundTheme } from '../types';

export const DEFAULT_HOME_BACKGROUND: BackgroundTheme = {
  id: 'christian-culture-reference',
  name: 'Pismo Święte — Christian Culture',
  category: 'modlitwa',
  imageUrl: '/christian-culture-reference-bg.jpg',
  thumbnailUrl: '/christian-culture-reference-bg.jpg',
  overlayGradient: 'linear-gradient(to bottom, rgba(5,7,12,0.4) 0%, rgba(5,7,12,0.75) 100%)',
  attribution: 'Christian Culture',
  mood: 'Słowo Boże, skupienie i modlitwa',
};

export const BACKGROUNDS: BackgroundTheme[] = [
  DEFAULT_HOME_BACKGROUND,
  {
    id: 'sunrise-hope',
    name: 'Wschód Słońca — Nadzieja',
    category: 'nadzieja',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(5,7,12,0.45) 0%, rgba(5,7,12,0.7) 100%)',
    attribution: 'Unsplash / Sean Oulashin',
    mood: 'nadzieja i nowy początek',
  },
  {
    id: 'calm-lake-peace',
    name: 'Spokojne Jezioro — Pokój',
    category: 'pokoj',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(5,8,14,0.4) 0%, rgba(5,8,14,0.75) 100%)',
    attribution: 'Unsplash / Bailey Zindel',
    mood: 'cisza i ukojenie',
  },
  {
    id: 'mountains-strength',
    name: 'Majestatyczne Góry — Siła',
    category: 'sila',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(4,6,10,0.45) 0%, rgba(4,6,10,0.75) 100%)',
    attribution: 'Unsplash / Kalen Emsley',
    mood: 'moc, niezłomność i opoka',
  },
  {
    id: 'light-beam-prayer',
    name: 'Promień Światła — Modlitwa',
    category: 'modlitwa',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(7,7,10,0.4) 0%, rgba(7,7,10,0.72) 100%)',
    attribution: 'Unsplash / Benjamin Davies',
    mood: 'obecność Boża i skupienie',
  },
  {
    id: 'pathway-light-way',
    name: 'Ścieżka do Światła — Droga',
    category: 'droga',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(6,9,14,0.45) 0%, rgba(6,9,14,0.75) 100%)',
    attribution: 'Unsplash / Casey Horner',
    mood: 'kierunek i prowadzenie Boże',
  },
  {
    id: 'clouds-breakthrough-comfort',
    name: 'Światło w Chmurach — Pocieszenie',
    category: 'pocieszenie',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(7,8,12,0.4) 0%, rgba(7,8,12,0.75) 100%)',
    attribution: 'Unsplash / Jeremy Bishop',
    mood: 'pociecha w trudnościach',
  },
  {
    id: 'golden-warmth-love',
    name: 'Ciepłe Złote Światło — Miłość',
    category: 'milosc',
    imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(12,7,5,0.4) 0%, rgba(12,7,5,0.72) 100%)',
    attribution: 'Unsplash / Jonas Weckschmied',
    mood: 'bezwarunkowa Boża miłość',
  },
  {
    id: 'green-pastures-psalm23',
    name: 'Zielone Pastwiska — Psalm 23',
    category: 'psalm23',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(5,10,7,0.45) 0%, rgba(5,10,7,0.75) 100%)',
    attribution: 'Unsplash / Luca Bravo',
    mood: 'dobry pasterz i bezpieczeństwo',
  },
  {
    id: 'deep-ocean-depth',
    name: 'Głębia Oceanu — Niezgłębiony Bóg',
    category: 'ochrona',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(3,7,14,0.45) 0%, rgba(3,7,14,0.78) 100%)',
    attribution: 'Unsplash / Matt Hardy',
    mood: 'wielkość i majestat',
  },
  {
    id: 'starry-night-sky',
    name: 'Gwiaździsta Noc — Czuwanie',
    category: 'wiara',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(4,4,8,0.5) 0%, rgba(4,4,8,0.8) 100%)',
    attribution: 'Unsplash / Greg Rakozy',
    mood: 'wieczność i obietnice Boże',
  },
  {
    id: 'misty-forest-wisdom',
    name: 'Poranna Mgła — Mądrość',
    category: 'madrosc',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(5,8,7,0.48) 0%, rgba(5,8,7,0.75) 100%)',
    attribution: 'Unsplash / Sebastian Unrau',
    mood: 'roztropność i rozeznanie',
  },
  {
    id: 'desert-light-salvation',
    name: 'Światło Pustyni — Przebaczenie i Łaska',
    category: 'przebaczenie',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=70',
    overlayGradient: 'linear-gradient(to bottom, rgba(10,8,6,0.45) 0%, rgba(10,8,6,0.75) 100%)',
    attribution: 'Unsplash / Jeremy Thomas',
    mood: 'nowe serce i łaska',
  }
];

export function getBackgroundById(id: string): BackgroundTheme {
  const found = BACKGROUNDS.find(b => b.id === id);
  return found || BACKGROUNDS[0];
}

export function getDefaultBackgroundForCategory(cat: string): BackgroundTheme {
  const match = BACKGROUNDS.find(b => b.category === cat);
  return match || BACKGROUNDS[0];
}
