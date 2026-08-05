import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  initialArticles,
  initialCategories,
  initialTags,
  authorsList,
  initialComments
} from './src/data/initialData.js';
import { Article, Category, Tag, Comment, NewsletterSubscriber, ContactMessage } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// File storage persistence setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDB {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  comments: Comment[];
  subscribers: NewsletterSubscriber[];
  contactMessages: ContactMessage[];
}

// Initial DB load or seed
function loadDB(): LocalDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data: LocalDB = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      let modified = false;

      // Sync categories
      initialCategories.forEach(cat => {
        if (!data.categories.some(c => c.id === cat.id || c.slug === cat.slug)) {
          data.categories.push(cat);
          modified = true;
        }
      });

      // Sync tags
      initialTags.forEach(tag => {
        if (!data.tags.some(t => t.id === tag.id || t.slug === tag.slug)) {
          data.tags.push(tag);
          modified = true;
        }
      });

      // Sync initial articles: update existing or add if missing
      initialArticles.forEach(art => {
        const idx = data.articles.findIndex(a => a.id === art.id || a.slug === art.slug);
        if (idx >= 0) {
          data.articles[idx] = {
            ...data.articles[idx],
            ...art,
            // Keep user comments/views if already incremented
            views: Math.max(data.articles[idx].views || 0, art.views || 0),
            likes: Math.max(data.articles[idx].likes || 0, art.likes || 0)
          };
          modified = true;
        } else {
          data.articles.unshift(art);
          modified = true;
        }
      });

      if (modified) {
        saveDB(data);
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading DB file, using initial seed data:', err);
  }

  const defaultDB: LocalDB = {
    articles: initialArticles,
    categories: initialCategories,
    tags: initialTags,
    comments: initialComments,
    subscribers: [
      {
        id: 'sub-1',
        email: 'subscriber@techpulse.io',
        subscribedAt: '2026-07-01T08:00:00Z',
        active: true
      }
    ],
    contactMessages: [
      {
        id: 'msg-1',
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Partnership Inquiry',
        message: 'Hello, I am interested in sponsoring an article on AI developments.',
        createdAt: '2026-08-01T12:00:00Z',
        read: false
      }
    ]
  };

  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(data: LocalDB) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to DB file:', err);
  }
}

let db = loadDB();

// Dynamic Gemini Client Lazy Initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

// ------------------------------------------------------------------
// API ROUTES
// ------------------------------------------------------------------

// 1. Get Articles (with query filters: category, tag, search, status, limit, offset, isFeatured, isTrending)
app.get('/api/articles', (req, res) => {
  const { category, tag, search, status, isFeatured, isTrending, limit, page } = req.query;

  let filtered = [...db.articles];

  // Default to published articles unless status is explicitly specified ('all' returns all statuses)
  if (status && status !== 'all') {
    filtered = filtered.filter(a => a.status === status);
  } else if (!status) {
    filtered = filtered.filter(a => a.status === 'published');
  }

  if (category) {
    filtered = filtered.filter(a => a.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (tag) {
    const searchTag = (tag as string).toLowerCase();
    filtered = filtered.filter(a =>
      a.tags.some(t => t.toLowerCase() === searchTag)
    );
  }

  if (isFeatured === 'true') {
    filtered = filtered.filter(a => a.isFeatured);
  }

  if (isTrending === 'true') {
    filtered = filtered.filter(a => a.isTrending);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    filtered = filtered.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort by publish date descending
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const total = filtered.length;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    articles: paginated,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// 2. Get Single Article by Slug or ID + Increment View Counter
app.get('/api/articles/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const articleIndex = db.articles.findIndex(
    a => a.slug === slugOrId || a.id === slugOrId
  );

  if (articleIndex === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Increment view
  db.articles[articleIndex].views += 1;
  saveDB(db);

  res.json(db.articles[articleIndex]);
});

// 3. Create Article (Admin)
app.post('/api/articles', (req, res) => {
  const newArticle: Article = {
    id: 'art-' + Date.now(),
    title: req.body.title || 'Untitled Article',
    slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'untitled-' + Date.now()),
    excerpt: req.body.excerpt || '',
    content: req.body.content || '',
    featuredImage: req.body.featuredImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    category: req.body.category || 'ai',
    tags: Array.isArray(req.body.tags)
      ? req.body.tags
      : typeof req.body.tags === 'string'
        ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : ['General'],
    author: req.body.author || authorsList[0],
    publishedAt: req.body.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: req.body.scheduledAt,
    status: req.body.status || 'published',
    readingTimeMinutes: Math.max(1, Math.ceil((req.body.content || '').split(' ').length / 200)),
    views: 0,
    likes: 0,
    isFeatured: req.body.isFeatured || false,
    isTrending: req.body.isTrending || false,
    faqs: req.body.faqs || [],
    metaTitle: req.body.metaTitle || req.body.title,
    metaDescription: req.body.metaDescription || req.body.excerpt,
    canonicalUrl: req.body.canonicalUrl
  };

  db.articles.unshift(newArticle);
  saveDB(db);

  res.status(201).json(newArticle);
});

// 4. Update Article (Admin)
app.put('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  const index = db.articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const updated: Article = {
    ...db.articles[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
    readingTimeMinutes: req.body.content
      ? Math.max(1, Math.ceil(req.body.content.split(' ').length / 200))
      : db.articles[index].readingTimeMinutes
  };

  db.articles[index] = updated;
  saveDB(db);

  res.json(updated);
});

// 5. Delete Article (Admin)
app.delete('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = db.articles.length;
  db.articles = db.articles.filter(a => a.id !== id);

  if (db.articles.length === initialLen) {
    return res.status(404).json({ error: 'Article not found' });
  }

  saveDB(db);
  res.json({ success: true, message: 'Article deleted successfully' });
});

// 6. Categories Endpoints
app.get('/api/categories', (req, res) => {
  // Update article counts
  const categoriesWithCounts = db.categories.map(cat => ({
    ...cat,
    count: db.articles.filter(a => a.category === cat.slug && a.status === 'published').length
  }));
  res.json(categoriesWithCounts);
});

app.post('/api/categories', (req, res) => {
  const newCat: Category = {
    id: 'cat-' + Date.now(),
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: req.body.description || '',
    icon: req.body.icon || 'Folder',
    color: req.body.color || 'from-blue-500 to-indigo-600',
    count: 0
  };
  db.categories.push(newCat);
  saveDB(db);
  res.status(201).json(newCat);
});

// 7. Tags Endpoints
app.get('/api/tags', (req, res) => {
  res.json(db.tags);
});

// 8. Authors Endpoint
app.get('/api/authors', (req, res) => {
  res.json(authorsList);
});

// 9. Comments Endpoints
app.get('/api/articles/:articleId/comments', (req, res) => {
  const { articleId } = req.params;
  const articleComments = db.comments.filter(
    c => c.articleId === articleId && c.status === 'approved'
  );
  res.json(articleComments);
});

app.post('/api/articles/:articleId/comments', (req, res) => {
  const { articleId } = req.params;
  const { authorName, authorEmail, content, parentId } = req.body;

  if (!authorName || !content) {
    return res.status(400).json({ error: 'Name and comment text are required.' });
  }

  const newComment: Comment = {
    id: 'comm-' + Date.now(),
    articleId,
    authorName,
    authorEmail: authorEmail || 'visitor@example.com',
    authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`,
    content,
    createdAt: new Date().toISOString(),
    status: 'approved', // Auto approve for live demo smoothness
    parentId: parentId || null
  };

  db.comments.push(newComment);
  saveDB(db);

  res.status(201).json(newComment);
});

// Admin All Comments
app.get('/api/admin/comments', (req, res) => {
  res.json(db.comments);
});

app.patch('/api/admin/comments/:id', (req, res) => {
  const { id } = req.params;
  const comment = db.comments.find(c => c.id === id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (req.body.status) {
    comment.status = req.body.status;
  }
  saveDB(db);
  res.json(comment);
});

// 10. Newsletter Subscription Endpoint
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required' });
  }

  const existing = db.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ message: 'You are already subscribed!' });
  }

  const newSub: NewsletterSubscriber = {
    id: 'sub-' + Date.now(),
    email,
    subscribedAt: new Date().toISOString(),
    active: true
  };

  db.subscribers.push(newSub);
  saveDB(db);

  res.status(201).json({ message: 'Successfully subscribed to newsletter!', subscriber: newSub });
});

app.get('/api/admin/subscribers', (req, res) => {
  res.json(db.subscribers);
});

// 11. Contact Message Submission
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const newMsg: ContactMessage = {
    id: 'msg-' + Date.now(),
    name,
    email,
    subject: subject || 'General Contact',
    message,
    createdAt: new Date().toISOString(),
    read: false
  };

  db.contactMessages.push(newMsg);
  saveDB(db);

  res.status(201).json({ message: 'Message sent successfully!', messageData: newMsg });
});

app.get('/api/admin/contact-messages', (req, res) => {
  res.json(db.contactMessages);
});

// 12. Analytics Summary
app.get('/api/admin/analytics', (req, res) => {
  const totalArticles = db.articles.length;
  const totalViews = db.articles.reduce((acc, a) => acc + (a.views || 0), 0);
  const totalComments = db.comments.length;
  const totalSubscribers = db.subscribers.length;
  const totalMessages = db.contactMessages.length;

  const popularCategories = db.categories.map(c => {
    const catArticles = db.articles.filter(a => a.category === c.slug);
    const views = catArticles.reduce((acc, a) => acc + a.views, 0);
    return { name: c.name, count: catArticles.length, views };
  });

  const viewsByDay = [
    { date: 'Mon', views: 820 },
    { date: 'Tue', views: 1150 },
    { date: 'Wed', views: 1420 },
    { date: 'Thu', views: 1280 },
    { date: 'Fri', views: 1890 },
    { date: 'Sat', views: 2310 },
    { date: 'Sun', views: 2750 }
  ];

  res.json({
    totalArticles,
    totalViews,
    totalComments,
    totalSubscribers,
    totalMessages,
    popularCategories,
    viewsByDay
  });
});

// 13. Gemini AI Assistant Writer endpoint for Admin CMS
app.post('/api/ai/generate-article', async (req, res) => {
  try {
    const { prompt, topic, category, targetLength } = req.body;

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert technical AI editor and blog writer for a top-tier tech publication (TechPulse).
Write a professional, in-depth Markdown article about "${topic || prompt}".
Category: ${category || 'Technology'}.

Respond with a JSON object containing:
{
  "title": "A captivating, SEO-friendly headline",
  "slug": "seo-friendly-url-slug",
  "excerpt": "A concise 2-sentence summary hook",
  "content": "Full Markdown article with H2/H3 headings, code examples in TS/Python/HTML, bullet points, blockquotes, and actionable technical analysis.",
  "metaTitle": "SEO title under 60 chars",
  "metaDescription": "SEO meta description under 155 chars",
  "faqs": [
    {"question": "Q1?", "answer": "A1"},
    {"question": "Q2?", "answer": "A2"}
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini AI generation error:', err);
    res.status(500).json({
      error: 'Failed to generate AI article content',
      details: err.message || 'Please check GEMINI_API_KEY settings.'
    });
  }
});

// ------------------------------------------------------------------
// SEO FILES & XML FEEDS (AdSense & Google Search Console Essential!)
// ------------------------------------------------------------------

// Sitemap XML endpoint
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://techpulse-blog.com';
  
  const staticPages = [
    '',
    '/categories',
    '/authors',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/cookie-policy'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  staticPages.forEach(path => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${path}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${path === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Category pages
  db.categories.forEach(cat => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/category/${cat.slug}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  // Articles
  db.articles
    .filter(a => a.status === 'published')
    .forEach(article => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/article/${article.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(article.updatedAt || article.publishedAt).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// RSS Feed endpoint
app.get('/rss.xml', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://techpulse-blog.com';

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  rss += `<channel>\n`;
  rss += `  <title>TechPulse - Modern Tech &amp; AI Publishing</title>\n`;
  rss += `  <link>${baseUrl}</link>\n`;
  rss += `  <description>In-depth coverage of Artificial Intelligence, Software Engineering, Cybersecurity, and Cloud Architecture.</description>\n`;
  rss += `  <language>en-us</language>\n`;
  rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  db.articles
    .filter(a => a.status === 'published')
    .slice(0, 20)
    .forEach(article => {
      rss += `  <item>\n`;
      rss += `    <title><![CDATA[${article.title}]]></title>\n`;
      rss += `    <link>${baseUrl}/article/${article.slug}</link>\n`;
      rss += `    <guid isPermaLink="true">${baseUrl}/article/${article.slug}</guid>\n`;
      rss += `    <description><![CDATA[${article.excerpt}]]></description>\n`;
      rss += `    <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>\n`;
      rss += `    <category>${article.category}</category>\n`;
      rss += `  </item>\n`;
    });

  rss += `</channel>\n`;
  rss += `</rss>`;

  res.header('Content-Type', 'application/xml');
  res.send(rss);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://techpulse-blog.com';
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(content);
});

// ------------------------------------------------------------------
// SERVER INITIALIZATION & VITE MIDDLEWARE
// ------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TechPulse SEO Blog Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
