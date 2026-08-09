import { marked } from 'marked';
import { Article, Category, Tag, Comment, NewsletterSubscriber, ContactMessage, Author } from '../types.js';

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
  authors: Author[];
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

const CONTACT_EMAIL = 'muneebkhan7890t@gmail.com';
const CONTACT_PHONE = '+923149157941';
const CONTACT_LOCATION = 'Nowshera, Pakistan';

function buildFooterHtml(categories: Category[]): string {
  const categoryLinks = categories.slice(0, 6).map(cat =>
    `<a href="/category/${escapeHtml(cat.slug)}" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">${escapeHtml(cat.name)}</a>`
  ).join('\n');

  return `
<footer style="background:#0f172a;color:#cbd5e1;border-top:1px solid #1e293b;padding:48px 24px;font-family:sans-serif;font-size:14px;">
  <div style="max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:32px;">
    <div style="flex:2;min-width:240px;">
      <strong style="color:#fff;font-size:18px;">EarnInfo</strong>
      <p style="color:#94a3b8;max-width:400px;margin-top:8px;">EarnInfo is an independent digital publication delivering guides on earning money online, freelancing, AI, and technology trends.</p>
      <p style="margin-top:12px;">Email: <a href="mailto:${CONTACT_EMAIL}" style="color:#cbd5e1;">${CONTACT_EMAIL}</a></p>
      <p>Phone: <a href="tel:${CONTACT_PHONE}" style="color:#cbd5e1;">${CONTACT_PHONE}</a></p>
      <p>Location: ${CONTACT_LOCATION}</p>
    </div>
    <div style="flex:1;min-width:160px;">
      <strong style="color:#fff;">Top Categories</strong>
      <div style="margin-top:12px;">${categoryLinks}</div>
    </div>
    <div style="flex:1;min-width:160px;">
      <strong style="color:#fff;">Editorial</strong>
      <div style="margin-top:12px;">
        <a href="/about" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">About Us</a>
        <a href="/contact" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">Contact</a>
        <a href="/authors" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">Authors</a>
        <a href="/categories" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">Categories</a>
      </div>
    </div>
    <div style="flex:1;min-width:160px;">
      <strong style="color:#fff;">Legal &amp; Policy</strong>
      <div style="margin-top:12px;">
        <a href="/privacy-policy" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">Privacy Policy</a>
        <a href="/terms" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">Terms &amp; Conditions</a>
        <a href="/disclaimer" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">Disclaimer</a>
        <a href="/cookie-policy" style="color:#94a3b8;text-decoration:none;display:block;margin-bottom:8px;">Cookie Policy</a>
      </div>
    </div>
  </div>
  <div style="max-width:1200px;margin:32px auto 0;padding-top:24px;border-top:1px solid #1e293b;color:#64748b;font-size:12px;">
    © ${new Date().getFullYear()} EarnInfo Media. All rights reserved.
  </div>
</footer>`;
}

function buildStaticPageHtml(pageType: string): string {
  const wrap = (title: string, subtitle: string, body: string) => `
<div style="font-family:sans-serif;">
  <header style="background:#0f172a;color:#fff;padding:48px 24px;text-align:center;">
    <h1 style="font-size:32px;margin:0 0 8px;">${title}</h1>
    <p style="color:#94a3b8;margin:0;">${subtitle}</p>
  </header>
  <main style="max-width:800px;margin:0 auto;padding:48px 24px;line-height:1.7;color:#334155;">
    ${body}
  </main>
</div>`;

  switch (pageType) {
    case 'about':
      return wrap('About EarnInfo', 'Editorial Mission, Authority & Standards', `
        <p style="font-size:12px;color:#94a3b8;font-style:italic;">Last updated: August 2026</p>
        <h2>Our Editorial Mission</h2>
        <p>EarnInfo is an independent digital publication dedicated to practical, clearly written guides on earning money online, freelancing, technology, and artificial intelligence. We publish for readers who want a direct, honest answer rather than filler content padded around ad placements.</p>
        <h2>How We Work</h2>
        <p>Our editorial team researches each topic using primary sources where possible &mdash; official documentation, platform policies, and hands-on testing &mdash; and writes with the specific goal of being useful to someone making a real decision, not just ranking for a keyword.</p>
        <p>Some of our workflow uses AI-assisted drafting and research tools. Every article is reviewed and edited by a human editor before publication; see our <a href="/disclaimer">Disclaimer</a> for full detail on how AI assistance is used.</p>
        <h2>Contact</h2>
        <p>Questions, corrections, or press inquiries: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. See our <a href="/contact">Contact page</a> for more.</p>
      `);

    case 'contact':
      return wrap('Contact Us', 'Editorial Inquiries & Support', `
        <p>We read every message sent to the address below and aim to respond within a few business days.</p>
        <p><strong>Email:</strong> <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
        <p><strong>Phone:</strong> <a href="tel:${CONTACT_PHONE}">${CONTACT_PHONE}</a></p>
        <p><strong>Location:</strong> ${CONTACT_LOCATION}</p>
        <p>For corrections to a published article, please include the article URL and the specific detail you believe is incorrect &mdash; this helps us verify and fix it quickly.</p>
      `);

    case 'privacy-policy':
      return wrap('Privacy Policy', 'Data Protection & AdSense Disclosures', `
        <p style="font-size:12px;color:#94a3b8;font-style:italic;">Last updated: August 2026</p>
        <h2>1. Introduction</h2>
        <p>At EarnInfo, accessible from earninfos.com, protecting visitor privacy is a priority. This Privacy Policy explains what information is collected when you visit this site and how it's used.</p>
        <h2>2. Information We Collect</h2>
        <p>We collect information you voluntarily provide, such as your email address if you subscribe to our newsletter or your name and email if you submit the contact form. We also collect standard technical data automatically &mdash; browser type, approximate location from IP address, and pages visited &mdash; through analytics and advertising tools.</p>
        <h2>3. Google AdSense &amp; Cookies</h2>
        <p>This site may display advertising served by Google AdSense. Google, as a third-party vendor, uses cookies to serve ads based on a visitor's prior visits to this and other websites. Visitors may opt out of personalized advertising by visiting <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a>. Third-party ad vendors' own privacy policies are not covered by this document &mdash; consult each vendor's policy directly.</p>
        <h2>4. Your Rights</h2>
        <p>Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, and to object to its use. To exercise any of these rights, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
        <h2>5. Children's Privacy</h2>
        <p>This site is not directed at children under 13, and we do not knowingly collect personal information from children.</p>
      `);

    case 'terms':
      return wrap('Terms & Conditions', 'Platform Rules & Content Licensing', `
        <p style="font-size:12px;color:#94a3b8;font-style:italic;">Last updated: August 2026</p>
        <h2>Acceptance of Terms</h2>
        <p>By accessing EarnInfo, you accept these terms in full. If you disagree with any part of these terms, please discontinue use of the site.</p>
        <h2>Intellectual Property</h2>
        <p>Unless otherwise stated, EarnInfo and its content owners hold the intellectual property rights to material published on this site. Articles, images, and original graphics may not be reproduced, redistributed, or republished without prior written permission, except for brief quotations used with proper attribution and a link back to the original article.</p>
        <h2>No Professional Advice</h2>
        <p>Content on this site &mdash; including guides related to earning money, freelancing, scholarships, and technology &mdash; is provided for general informational purposes only and does not constitute financial, legal, tax, immigration, or professional advice. Always verify time-sensitive details (deadlines, eligibility, payout terms) directly with the official source before acting.</p>
        <h2>Limitation of Liability</h2>
        <p>EarnInfo is not liable for any loss or damage arising from reliance on information published on this site, including outcomes related to third-party platforms, applications, or offers described in our articles.</p>
        <h2>Changes to These Terms</h2>
        <p>We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised terms.</p>
      `);

    case 'disclaimer':
      return wrap('Disclaimer', 'Earning Claims, Financial Content & AI Assistance', `
        <p style="font-size:12px;color:#94a3b8;font-style:italic;">Last updated: August 2026</p>
        <h2>General Disclaimer</h2>
        <p>All information on this site is published in good faith for general informational purposes only. EarnInfo does not warrant the completeness, reliability, or accuracy of this information. Any action taken based on information found on this site is strictly at your own risk.</p>
        <h2>Earning &amp; Income Claims</h2>
        <p>Any figures describing potential earnings, payout amounts, or income &mdash; including content about platforms such as Swagbucks, freelancing, or other online income methods &mdash; are illustrative estimates based on publicly available information at the time of writing, not guarantees. Actual results vary significantly based on individual effort, location, platform changes, and factors outside our control. Nothing on this site should be interpreted as a promise or guarantee of income.</p>
        <h2>Scholarship &amp; Educational Content</h2>
        <p>Articles covering scholarships, certifications, or educational programs (such as DAAD or similar opportunities) describe eligibility criteria, deadlines, and application steps as understood at time of publication. These details change frequently and are set entirely by the issuing institution, not by EarnInfo. Always confirm current requirements directly on the official program or institution website before applying or making decisions based on this content.</p>
        <h2>AI Content Disclosure</h2>
        <p>EarnInfo uses AI-assisted tools to support research, drafting, and editorial workflows. All published articles are reviewed by a human editor prior to publication, but readers should independently verify any time-sensitive facts, figures, or claims before relying on them.</p>
        <h2>Third-Party Links</h2>
        <p>This site may link to third-party websites, apps, or services not owned or controlled by EarnInfo. We are not responsible for the content, accuracy, or practices of any third-party site.</p>
      `);

    case 'cookie-policy':
      return wrap('Cookie Policy', 'How This Site Uses Cookies', `
        <p style="font-size:12px;color:#94a3b8;font-style:italic;">Last updated: August 2026</p>
        <h2>What Are Cookies</h2>
        <p>Cookies are small text files stored on your device that help websites remember information about your visit.</p>
        <h2>How We Use Cookies</h2>
        <p>EarnInfo uses cookies to remember your display preferences (such as dark mode), support basic site functionality, and &mdash; where advertising is enabled &mdash; to allow Google AdSense and similar networks to serve relevant ads. See our <a href="/privacy-policy">Privacy Policy</a> for details on advertising cookies.</p>
        <h2>Managing Cookies</h2>
        <p>Most browsers let you refuse or delete cookies through their settings. Disabling cookies may affect some site functionality, such as saved preferences.</p>
      `);

    default:
      return '';
  }
}

export async function renderPageHtml({ reqUrl, hostUrl, db, templateHtml, authors }: RenderOptions): Promise<RenderResult> {
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
  let hydrationArticle: Article | null = null;

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
      hydrationArticle = article;
      statusCode = 200;
      pageTitle = `${article.metaTitle || article.title} | ${siteName}`;
      metaDesc = escapeHtml(article.metaDescription || article.excerpt || defaultMetaDesc);
      canonicalUrl = `https://earninfos.com/article/${article.slug}`;
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
      metaDesc = 'Learn about EarnInfo\'s editorial mission, standards, and how we research and publish our guides on tech and online income.';
      bodyContentHtml = buildStaticPageHtml('about');
    } else if (normalizedPath === '/privacy-policy') {
      pageTitle = `Privacy Policy | ${siteName}`;
      metaDesc = 'How EarnInfo collects, uses, and protects visitor data, including Google AdSense cookie disclosures.';
      bodyContentHtml = buildStaticPageHtml('privacy-policy');
    } else if (normalizedPath === '/terms') {
      pageTitle = `Terms & Conditions | ${siteName}`;
      metaDesc = 'The terms and conditions governing use of EarnInfo, including intellectual property and liability terms.';
      bodyContentHtml = buildStaticPageHtml('terms');
    } else if (normalizedPath === '/disclaimer') {
      pageTitle = `Disclaimer | ${siteName}`;
      metaDesc = 'Important disclaimers regarding earning claims, scholarship/educational content, and AI-assisted content on EarnInfo.';
      bodyContentHtml = buildStaticPageHtml('disclaimer');
    } else if (normalizedPath === '/cookie-policy') {
      pageTitle = `Cookie Policy | ${siteName}`;
      metaDesc = 'How EarnInfo uses cookies for site functionality and advertising.';
      bodyContentHtml = buildStaticPageHtml('cookie-policy');
    } else if (normalizedPath === '/contact') {
      pageTitle = `Contact Us | ${siteName}`;
      metaDesc = 'Get in touch with the EarnInfo editorial team for questions, corrections, or press inquiries.';
      bodyContentHtml = buildStaticPageHtml('contact');
    } else if (normalizedPath === '/authors') {
      pageTitle = `Authors | ${siteName}`;
    } else if (normalizedPath === '/search') {
      pageTitle = `Search | ${siteName}`;
      extraHead = `<meta name="robots" content="noindex, follow">`;
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

<meta name="description" content="${escapeHtml(metaDesc)}" />

<link rel="canonical" href="${canonicalUrl}" />

<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:title" content="${escapeHtml(pageTitle)}" />
<meta property="og:description" content="${escapeHtml(metaDesc)}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:site_name" content="${siteName}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${canonicalUrl}" />
<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
<meta name="twitter:description" content="${escapeHtml(metaDesc)}" />
<meta name="twitter:image" content="${ogImage}" />

${extraHead}

<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: hostUrl,
  logo: `${hostUrl}/og-image.jpg`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: CONTACT_EMAIL,
    contactType: 'customer support'
  }
}).replace(/</g, '\\u003c')}</script>
`;

  let finalHtml = templateHtml;

  // Remove generic <title> tag from templateHtml if present
  if (finalHtml.includes('<title>')) {
    finalHtml = finalHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  }

  // Inject headInjections before </head>
  finalHtml = finalHtml.replace('</head>', `${headInjections}\n</head>`);

  // Every page gets the real footer server-rendered too — previously the
  // footer only existed in the client-side React tree, so a crawler that
  // doesn't execute JavaScript (which many AdSense/SEO audit tools don't)
  // saw no footer, no policy page links, and no real contact info on any
  // page at all, even though real browser visitors always saw it fine.
  bodyContentHtml = `${bodyContentHtml}${buildFooterHtml(db.categories)}`;

  // Inject pre-rendered bodyContentHtml inside <div id="root">
  if (bodyContentHtml) {
    if (finalHtml.includes('<div id="root"></div>')) {
      finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${bodyContentHtml}</div>`);
    } else if (finalHtml.includes('<div id="root">')) {
      finalHtml = finalHtml.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${bodyContentHtml}</div>`);
    }
  }

  // ------------------------------------------------------------------
  // EMBED INITIAL DATA FOR CLIENT HYDRATION
  // ------------------------------------------------------------------
  // The React app used to blow away this SSR HTML on mount and re-fetch
  // everything from scratch (App-level data, then the article again).
  // That fetch waterfall is what Googlebot was catching mid-flight,
  // rendering a loading spinner or a false "Article Not Found" state
  // even though the real server response was correct.
  // By embedding the data we already fetched here, the client can
  // render the correct content on the very first paint, with zero
  // network round-trips required.
  const publishedArticles = db.articles.filter(a => !a.status || a.status === 'published');
  const initialData = {
    articles: publishedArticles,
    categories: db.categories,
    tags: db.tags,
    authors,
    article: hydrationArticle,
    notFound: statusCode === 404
  };

  // Escape "</" sequences so embedded content can never prematurely
  // close the <script> tag (also neutralizes </script> injection).
  const serializedInitialData = JSON.stringify(initialData).replace(/</g, '\\u003c');
  const initialDataScript = `<script id="__INITIAL_DATA__">window.__INITIAL_DATA__ = ${serializedInitialData};</script>`;

  if (finalHtml.includes('</body>')) {
    finalHtml = finalHtml.replace('</body>', `${initialDataScript}\n</body>`);
  } else {
    finalHtml += initialDataScript;
  }

  return {
    statusCode,
    html: finalHtml
  };
}
