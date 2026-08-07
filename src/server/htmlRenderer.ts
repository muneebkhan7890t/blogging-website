import { marked } from 'marked';
import { Article, Category, Tag, Comment, NewsletterSubscriber, ContactMessage } from '../types.js';

export interface LocalDB {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  comments: Comment[];
  subscribers: NewsletterSubscriber[];
  contactMessages: ContactMessage[];
}

interface RenderOptions {
  reqUrl: string;
  hostUrl: string;
  db: LocalDB;
  templateHtml: string;
}

interface RenderResult {
  statusCode: number;
  html: string;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function renderPageHtml({ reqUrl, hostUrl, db, templateHtml }: RenderOptions): Promise<RenderResult> {
  let urlObj: URL;
  try {
    urlObj = new URL(reqUrl, hostUrl);
  } catch {
    urlObj = new URL('/', hostUrl);
  }
  
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  const siteName = 'EarnInfo';
  const defaultMetaTitle = 'EarnInfo - Digital Publishing, Tech & Online Income Guides';
  const defaultMetaDesc = 'In-depth coverage of Artificial Intelligence, Tech Certifications, Online Income, Software Engineering, Cybersecurity, and Cloud Architecture.';
  const defaultOgImage = `${hostUrl}/og-image.jpg`;

  let statusCode = 200;
  let pageTitle = defaultMetaTitle;
  let metaDesc = defaultMetaDesc;
  let canonicalUrl = `${hostUrl}${pathname}`;
  let ogImage = defaultOgImage;
  let ogType = 'website';
  let extraHead = '';
  let bodyContentHtml = '';

  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  // ------------------------------------------------------------------
  // 1. SINGLE ARTICLE ROUTE: /article/:slug
  // ------------------------------------------------------------------
  if (normalizedPath.startsWith('/article/')) {
    const rawSlug = normalizedPath.replace('/article/', '');
    const cleanSlug = decodeURIComponent(rawSlug).replace(/\/+$/, '').trim().toLowerCase();

    const article = db.articles.find(a => {
      const aSlug = (a.slug || '').trim().toLowerCase();
      const aId = (a.id || '').trim().toLowerCase();
      return aSlug === cleanSlug || aId === cleanSlug;
    });

    const isPublished = article && (!article.status || article.status === 'published');

    if (!article || !isPublished) {
      statusCode = 404;
      pageTitle = `404 - Article Not Found | ${siteName}`;
      metaDesc = 'The requested article could not be found or has been moved.';
      extraHead = `<meta name="robots" content="noindex, follow">`;
      bodyContentHtml = `
        <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-6 text-center">
          <div class="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h1 class="text-6xl font-black text-indigo-600 mb-2">404</h1>
            <h2 class="text-2xl font-bold mb-4">Article Not Found</h2>
            <p class="text-slate-600 mb-6">Sorry, the article you are looking for does not exist or has been removed.</p>
            <a href="/" class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">Return to Home</a>
          </div>
        </div>
      `;
    } else {
      statusCode = 200;
      pageTitle = `${article.metaTitle || article.title} | ${siteName}`;
      metaDesc = escapeHtml(article.metaDescription || article.excerpt || defaultMetaDesc);
      canonicalUrl = article.canonicalUrl || `${hostUrl}/article/${article.slug}`;
      ogImage = article.featuredImage || defaultOgImage;
      ogType = 'article';

      // Render Markdown content to HTML
      let renderedMarkdown = '';
      try {
        renderedMarkdown = await marked.parse(article.content || '');
      } catch (e) {
        renderedMarkdown = article.content || '';
      }

      // JSON-LD Article Schema
      const jsonLdArticle = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        'headline': article.metaTitle || article.title,
        'description': article.metaDescription || article.excerpt,
        'image': [ogImage],
        'datePublished': article.publishedAt,
        'dateModified': article.updatedAt || article.publishedAt,
        'author': {
          '@type': 'Person',
          'name': article.author?.name || 'EarnInfo Editorial Staff',
          'jobTitle': article.author?.role || 'Senior Writer'
        },
        'publisher': {
          '@type': 'Organization',
          'name': siteName,
          'logo': {
            '@type': 'ImageObject',
            'url': `${hostUrl}/favicon.ico`
          }
        },
        'articleSection': article.category,
        'keywords': article.tags.join(', ')
      };

      // JSON-LD Breadcrumb Schema
      const jsonLdBreadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': hostUrl
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': article.category,
            'item': `${hostUrl}/category/${article.category}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': article.title,
            'item': canonicalUrl
          }
        ]
      };

      // JSON-LD FAQ Schema
      let jsonLdFaqHtml = '';
      if (article.faqs && article.faqs.length > 0) {
        const jsonLdFaq = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': article.faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': faq.answer
            }
          }))
        };
        jsonLdFaqHtml = `<script type="application/ld+json">${JSON.stringify(jsonLdFaq, null, 2)}</script>`;
      }

      extraHead = `
        <meta property="article:published_time" content="${article.publishedAt}">
        <meta property="article:modified_time" content="${article.updatedAt || article.publishedAt}">
        <meta property="article:section" content="${escapeHtml(article.category)}">
        <meta name="keywords" content="${escapeHtml(article.tags.join(', '))}">
        <script type="application/ld+json">${JSON.stringify(jsonLdArticle, null, 2)}</script>
        <script type="application/ld+json">${JSON.stringify(jsonLdBreadcrumb, null, 2)}</script>
        ${jsonLdFaqHtml}
      `;

      // Pre-rendered Body HTML inside <div id="root">
      bodyContentHtml = `
        <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <header class="border-b bg-white py-4 px-6 sticky top-0 z-40">
            <div class="max-w-7xl mx-auto flex items-center justify-between">
              <a href="/" class="text-2xl font-black tracking-tight text-indigo-600">${siteName}</a>
              <a href="/search" class="text-sm font-semibold text-slate-600 hover:text-indigo-600">Search</a>
            </div>
          </header>

          <main class="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
            <nav class="text-xs md:text-sm text-slate-500 mb-6 flex flex-wrap items-center gap-2">
              <a href="/" class="hover:underline">Home</a> &gt;
              <a href="/category/${article.category}" class="hover:underline capitalize">${escapeHtml(article.category)}</a> &gt;
              <span class="text-slate-800 font-medium truncate max-w-xs md:max-w-md">${escapeHtml(article.title)}</span>
            </nav>

            <article class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-10 mb-8">
              <header class="mb-8 border-b pb-6">
                <div class="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  ${escapeHtml(article.category)}
                </div>
                <h1 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                  ${escapeHtml(article.title)}
                </h1>
                <p class="text-lg md:text-xl text-slate-600 leading-relaxed mb-6 font-medium">
                  ${escapeHtml(article.excerpt)}
                </p>
                <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span class="font-bold text-slate-800">By ${escapeHtml(article.author?.name || 'Editorial Team')}</span>
                  <span>•</span>
                  <time datetime="${article.publishedAt}">${new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  <span>•</span>
                  <span>${article.readingTimeMinutes || 5} min read</span>
                </div>
              </header>

              ${article.featuredImage ? `
                <div class="mb-8 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                  <img src="${article.featuredImage}" alt="${escapeHtml(article.title)}" class="w-full h-auto object-cover max-h-[500px]" />
                </div>
              ` : ''}

              <div class="article-body prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg">
                ${renderedMarkdown}
              </div>

              ${article.faqs && article.faqs.length > 0 ? `
                <section class="mt-12 pt-8 border-t border-slate-200">
                  <h2 class="text-2xl font-bold mb-6 text-slate-900">Frequently Asked Questions</h2>
                  <div class="space-y-4">
                    ${article.faqs.map(faq => `
                      <div class="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <h3 class="font-bold text-slate-900 text-lg mb-2">${escapeHtml(faq.question)}</h3>
                        <p class="text-slate-700 leading-relaxed">${escapeHtml(faq.answer)}</p>
                      </div>
                    `).join('')}
                  </div>
                </section>
              ` : ''}

              <footer class="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
                ${article.tags.map(tag => `
                  <span class="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">#${escapeHtml(tag)}</span>
                `).join('')}
              </footer>
            </article>
          </main>
        </div>
      `;
    }
  }
  // ------------------------------------------------------------------
  // 2. CATEGORY ROUTE: /category/:slug
  // ------------------------------------------------------------------
  else if (normalizedPath.startsWith('/category/')) {
    const rawSlug = normalizedPath.replace('/category/', '');
    const cleanCatSlug = decodeURIComponent(rawSlug).replace(/\/+$/, '').trim().toLowerCase();

    const category = db.categories.find(c => {
      const cSlug = (c.slug || '').trim().toLowerCase();
      const cId = (c.id || '').trim().toLowerCase();
      const cName = (c.name || '').trim().toLowerCase();
      return cSlug === cleanCatSlug || cId === cleanCatSlug || cName === cleanCatSlug;
    });

    if (!category) {
      statusCode = 404;
      pageTitle = `404 - Category Not Found | ${siteName}`;
      metaDesc = 'The requested category does not exist.';
      extraHead = `<meta name="robots" content="noindex, follow">`;
      bodyContentHtml = `
        <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-6 text-center">
          <div class="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h1 class="text-6xl font-black text-indigo-600 mb-2">404</h1>
            <h2 class="text-2xl font-bold mb-4">Category Not Found</h2>
            <a href="/" class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl">Return to Home</a>
          </div>
        </div>
      `;
    } else {
      statusCode = 200;
      pageTitle = `${category.name} Articles & Guides | ${siteName}`;
      metaDesc = escapeHtml(category.description || `Explore top articles, guides, and updates in ${category.name}.`);
      canonicalUrl = `${hostUrl}/category/${category.slug}`;

      const catArticles = db.articles.filter(a => 
        (!a.status || a.status === 'published') && (
          (a.category || '').trim().toLowerCase() === (category.slug || '').trim().toLowerCase() || 
          (a.category || '').trim().toLowerCase() === (category.id || '').trim().toLowerCase() || 
          (a.category || '').trim().toLowerCase() === (category.name || '').trim().toLowerCase()
        )
      );

      const jsonLdBreadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': hostUrl },
          { '@type': 'ListItem', 'position': 2, 'name': category.name, 'item': canonicalUrl }
        ]
      };

      extraHead = `<script type="application/ld+json">${JSON.stringify(jsonLdBreadcrumb, null, 2)}</script>`;

      bodyContentHtml = `
        <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <header class="border-b bg-white py-4 px-6 sticky top-0 z-40">
            <div class="max-w-7xl mx-auto flex items-center justify-between">
              <a href="/" class="text-2xl font-black tracking-tight text-indigo-600">${siteName}</a>
            </div>
          </header>

          <main class="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
            <div class="mb-8 bg-white p-8 rounded-2xl border border-slate-200">
              <h1 class="text-3xl font-black text-slate-900 mb-2">${escapeHtml(category.name)}</h1>
              <p class="text-slate-600 text-lg">${escapeHtml(category.description)}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${catArticles.map(art => `
                <article class="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                  ${art.featuredImage ? `<img src="${art.featuredImage}" alt="${escapeHtml(art.title)}" class="w-full h-48 object-cover" />` : ''}
                  <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 class="text-xl font-bold text-slate-900 mb-2 hover:text-indigo-600">
                        <a href="/article/${art.slug}">${escapeHtml(art.title)}</a>
                      </h2>
                      <p class="text-slate-600 text-sm line-clamp-3 mb-4">${escapeHtml(art.excerpt)}</p>
                    </div>
                    <a href="/article/${art.slug}" class="text-indigo-600 font-semibold text-sm hover:underline">Read Full Article &rarr;</a>
                  </div>
                </article>
              `).join('')}
            </div>
          </main>
        </div>
      `;
    }
  }
  // ------------------------------------------------------------------
  // 3. HOMEPAGE ROUTE: /
  // ------------------------------------------------------------------
  else if (normalizedPath === '/' || normalizedPath === '') {
    statusCode = 200;
    pageTitle = defaultMetaTitle;
    metaDesc = defaultMetaDesc;
    canonicalUrl = `${hostUrl}/`;

    const publishedArticles = db.articles.filter(a => !a.status || a.status === 'published');

    const jsonLdWebsite = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': siteName,
      'url': hostUrl,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${hostUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    extraHead = `<script type="application/ld+json">${JSON.stringify(jsonLdWebsite, null, 2)}</script>`;

    bodyContentHtml = `
      <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header class="border-b bg-white py-4 px-6 sticky top-0 z-40">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" class="text-2xl font-black tracking-tight text-indigo-600">${siteName}</a>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
          <section class="mb-12 text-center max-w-3xl mx-auto">
            <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Digital Publishing, Tech & Online Income Guides
            </h1>
            <p class="text-slate-600 text-lg md:text-xl">
              In-depth analysis, step-by-step tech certification guides, cybersecurity blueprints, and verified online income strategies.
            </p>
          </section>

          <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${publishedArticles.slice(0, 12).map(art => `
              <article class="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col">
                ${art.featuredImage ? `<img src="${art.featuredImage}" alt="${escapeHtml(art.title)}" class="w-full h-52 object-cover" />` : ''}
                <div class="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md mb-3 uppercase tracking-wider">${escapeHtml(art.category)}</span>
                    <h2 class="text-xl font-bold text-slate-900 mb-3 hover:text-indigo-600 leading-snug">
                      <a href="/article/${art.slug}">${escapeHtml(art.title)}</a>
                    </h2>
                    <p class="text-slate-600 text-sm line-clamp-3 mb-4">${escapeHtml(art.excerpt)}</p>
                  </div>
                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <span>By ${escapeHtml(art.author?.name || 'Editorial Team')}</span>
                    <a href="/article/${art.slug}" class="text-indigo-600 font-bold hover:underline">Read Article &rarr;</a>
                  </div>
                </div>
              </article>
            `).join('')}
          </section>
        </main>
      </div>
    `;
  }
  // ------------------------------------------------------------------
  // 4. OTHER STATIC / CLIENT-SIDE ROUTES
  // ------------------------------------------------------------------
  else {
    statusCode = 200;
    if (normalizedPath === '/admin') {
      pageTitle = `Admin Dashboard | ${siteName}`;
      extraHead = `<meta name="robots" content="noindex, nofollow">`;
    } else if (normalizedPath === '/categories') {
      pageTitle = `All Categories | ${siteName}`;
    } else if (normalizedPath === '/about') {
      pageTitle = `About Us | ${siteName}`;
    } else if (normalizedPath === '/privacy-policy') {
      pageTitle = `Privacy Policy | ${siteName}`;
    } else if (normalizedPath === '/terms') {
      pageTitle = `Terms of Service | ${siteName}`;
    } else if (normalizedPath === '/disclaimer') {
      pageTitle = `Disclaimer | ${siteName}`;
    } else if (normalizedPath === '/cookie-policy') {
      pageTitle = `Cookie Policy | ${siteName}`;
    } else if (normalizedPath === '/contact') {
      pageTitle = `Contact Us | ${siteName}`;
    } else if (normalizedPath === '/authors') {
      pageTitle = `Authors | ${siteName}`;
    } else if (normalizedPath === '/search') {
      pageTitle = `Search | ${siteName}`;
    } else {
      // Any unhandled route
      statusCode = 404;
      pageTitle = `404 - Page Not Found | ${siteName}`;
      extraHead = `<meta name="robots" content="noindex, follow">`;
    }
  }

  // Construct complete Head Injections
  const headInjections = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="title" content="${escapeHtml(pageTitle)}" />
    <meta name="description" content="${escapeHtml(metaDesc)}" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDesc)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="${siteName}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDesc)}" />
    <meta name="twitter:image" content="${ogImage}" />

    ${extraHead}
  `;

  let finalHtml = templateHtml;

  // Remove generic <title> tag from templateHtml if present
  if (finalHtml.includes('<title>')) {
    finalHtml = finalHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  }

  // Inject headInjections before </head>
  finalHtml = finalHtml.replace('</head>', `${headInjections}\n</head>`);

  // Inject pre-rendered bodyContentHtml inside <div id="root">
  if (bodyContentHtml) {
    if (finalHtml.includes('<div id="root"></div>')) {
      finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${bodyContentHtml}</div>`);
    } else if (finalHtml.includes('<div id="root">')) {
      finalHtml = finalHtml.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${bodyContentHtml}</div>`);
    }
  }

  return {
    statusCode,
    html: finalHtml
  };
}
