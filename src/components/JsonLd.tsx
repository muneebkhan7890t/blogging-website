import React, { useEffect } from 'react';
import { Article, FAQItem } from '../types';

interface JsonLdProps {
  type: 'Article' | 'WebSite' | 'Organization' | 'Breadcrumb' | 'FAQPage';
  data?: {
    article?: Article;
    breadcrumbs?: { name: string; url: string }[];
    faqs?: FAQItem[];
  };
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, data }) => {
  useEffect(() => {
    const scriptId = `jsonld-${type.toLowerCase()}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const baseUrl = window.location.origin;

    let schemaObject: Record<string, unknown> = {};

    if (type === 'Article' && data?.article) {
      const art = data.article;
      schemaObject = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${baseUrl}/article/${art.slug}`
        },
        headline: art.metaTitle || art.title,
        description: art.metaDescription || art.excerpt,
        image: [art.featuredImage],
        datePublished: art.publishedAt,
        dateModified: art.updatedAt || art.publishedAt,
        author: {
          '@type': 'Person',
          name: art.author.name,
          jobTitle: art.author.role
        },
        publisher: {
          '@type': 'Organization',
          name: 'EarnInfo',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/favicon.ico`
          }
        },
        articleSection: art.category,
        keywords: art.tags.join(', ')
      };
    } else if (type === 'WebSite') {
      schemaObject = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'EarnInfo - Digital Publishing & Guides',
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
    } else if (type === 'Organization') {
      schemaObject = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'EarnInfo Media',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: [
          'https://twitter.com',
          'https://linkedin.com',
          'https://github.com'
        ]
      };
    } else if (type === 'Breadcrumb' && data?.breadcrumbs) {
      schemaObject = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${baseUrl}${item.url}`
        }))
      };
    } else if (type === 'FAQPage' && data?.faqs && data.faqs.length > 0) {
      schemaObject = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };
    }

    script.textContent = JSON.stringify(schemaObject, null, 2);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }
    };
  }, [type, data]);

  return null;
};
