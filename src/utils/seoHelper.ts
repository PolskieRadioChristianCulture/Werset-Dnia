import { BibleVerse } from '../types';
import { TopicHub } from '../types';
import { BibleQuestion } from '../types';

export const BASE_SITE_NAME = 'Mój Werset Dnia — Christian Culture';
export const BASE_CANONICAL_DOMAIN = 'https://polskieradio.cc';
export const PUBLISHER_NAME = 'Christian Culture';
export const PUBLISHER_URL = 'https://polskieradio.cc';

export interface SeoMetaParams {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: Record<string, any>[];
  articleData?: {
    publishedTime?: string;
    section?: string;
    tags?: string[];
  };
}

/**
 * Generates Schema.org Organization for Christian Culture
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_CANONICAL_DOMAIN}/#organization`,
    name: 'Christian Culture',
    url: BASE_CANONICAL_DOMAIN,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_CANONICAL_DOMAIN}/favicon.ico`,
      width: 192,
      height: 192,
    },
    sameAs: [
      'https://polskieradio.cc',
      'https://facebook.com/christianculturepl',
      'https://youtube.com/@christianculture',
    ],
    description: 'Chrześcijański portal medialny, ewangelizacyjny i biblijny ekosystem Christian Culture.',
  };
}

/**
 * Generates Schema.org WebSite
 */
export function getWebSiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'Mój Werset Dnia',
    alternateName: 'Moj Werset Dnia — Christian Culture',
    description: 'Minimalistyczna wyszukiwarka Słowa Bożego i generator pięknych kart z wersetami biblijnymi.',
    publisher: {
      '@id': `${BASE_CANONICAL_DOMAIN}/#organization`,
    },
    inLanguage: 'pl-PL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Schema.org Article & Scripture Reference for a Verse page
 */
export function getVerseSchema(verse: BibleVerse, pageUrl: string) {
  return [
    getOrganizationSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${pageUrl}/#article`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Mój Werset Dnia',
        url: BASE_CANONICAL_DOMAIN,
      },
      headline: `${verse.reference} — „${verse.text.slice(0, 90)}...”`,
      name: `${verse.reference} | Mój Werset Dnia — Christian Culture`,
      description: `Przeczytaj ${verse.reference} w przekładzie ${verse.translation}. Poznaj kontekst biblijny i stwórz estetyczną grafikę ze Słowem Bożym.`,
      inLanguage: 'pl-PL',
      mainEntityOfPage: pageUrl,
      datePublished: '2025-01-01T08:00:00+01:00',
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Christian Culture — Redakcja Biblijna',
        url: BASE_CANONICAL_DOMAIN,
      },
      publisher: {
        '@id': `${BASE_CANONICAL_DOMAIN}/#organization`,
      },
      articleSection: verse.category,
      keywords: [verse.reference, verse.book, verse.translation, ...verse.tags].join(', '),
      citation: {
        '@type': 'Book',
        name: `Pismo Święte — ${verse.book}`,
        translator: verse.translation,
        hasPart: {
          '@type': 'Chapter',
          name: `${verse.book} Rozdział ${verse.chapter}, werset ${verse.verse}`,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Strona Główna',
          item: BASE_CANONICAL_DOMAIN,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Wersety Biblijne',
          item: `${BASE_CANONICAL_DOMAIN}/#wersety`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: verse.reference,
          item: pageUrl,
        },
      ],
    },
  ];
}

/**
 * Generates Schema.org for Topic Hub
 */
export function getTopicSchema(topic: TopicHub, pageUrl: string) {
  return [
    getOrganizationSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${pageUrl}/#webpage`,
      name: topic.h1,
      headline: topic.h1,
      description: topic.metaDescription,
      inLanguage: 'pl-PL',
      url: pageUrl,
      publisher: {
        '@id': `${BASE_CANONICAL_DOMAIN}/#organization`,
      },
      about: {
        '@type': 'Thing',
        name: topic.name,
        description: topic.shortAnswer,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Strona Główna',
          item: BASE_CANONICAL_DOMAIN,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tematy biblijne',
          item: `${BASE_CANONICAL_DOMAIN}/#tematy`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: topic.name,
          item: pageUrl,
        },
      ],
    },
  ];
}

/**
 * Generates Schema.org for Answer Engine FAQ/Question page (AEO)
 */
export function getQuestionSchema(question: BibleQuestion, pageUrl: string) {
  return [
    getOrganizationSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${pageUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: question.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${question.shortAnswer} Podstawa biblijna: ${question.biblicalEvidenceSummary}`,
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${pageUrl}/#article`,
      headline: question.question,
      description: question.metaDescription,
      inLanguage: 'pl-PL',
      url: pageUrl,
      author: {
        '@type': 'Organization',
        name: 'Christian Culture — Redakcja Biblijna',
        url: BASE_CANONICAL_DOMAIN,
      },
      publisher: {
        '@id': `${BASE_CANONICAL_DOMAIN}/#organization`,
      },
      mainEntityOfPage: pageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Strona Główna',
          item: BASE_CANONICAL_DOMAIN,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Pytania o Biblię',
          item: `${BASE_CANONICAL_DOMAIN}/#pytania`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: question.question,
          item: pageUrl,
        },
      ],
    },
  ];
}

/**
 * Dynamically updates DOM meta tags, title, link canonical, and JSON-LD
 */
export function updateDomSeo(params: SeoMetaParams) {
  if (typeof document === 'undefined') return;

  // Title
  document.title = params.title;

  // Meta description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', params.description);

  // Canonical
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', params.canonicalUrl);

  // Helper for meta tags
  const setMetaProp = (prop: string, val: string) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  };

  const setMetaName = (name: string, val: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  };

  // Open Graph
  setMetaProp('og:title', params.title);
  setMetaProp('og:description', params.description);
  setMetaProp('og:url', params.canonicalUrl);
  setMetaProp('og:type', params.ogType || 'website');
  setMetaProp('og:site_name', BASE_SITE_NAME);
  if (params.ogImage) {
    setMetaProp('og:image', params.ogImage);
    setMetaProp('og:image:width', '1200');
    setMetaProp('og:image:height', '630');
    setMetaProp('og:image:alt', params.title);
  }

  // Twitter Card
  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', params.title);
  setMetaName('twitter:description', params.description);
  if (params.ogImage) {
    setMetaName('twitter:image', params.ogImage);
  }

  // Schema.org JSON-LD
  const SCRIPT_ID = 'seo-dynamic-json-ld';
  let jsonLdScript = document.getElementById(SCRIPT_ID);
  if (jsonLdScript) {
    jsonLdScript.remove();
  }

  if (params.jsonLd && params.jsonLd.length > 0) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = SCRIPT_ID;
    jsonLdScript.setAttribute('type', 'application/ld+json');
    jsonLdScript.textContent = JSON.stringify(
      params.jsonLd.length === 1 ? params.jsonLd[0] : params.jsonLd,
      null,
      2
    );
    document.head.appendChild(jsonLdScript);
  }
}
