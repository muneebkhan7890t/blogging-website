import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Article, Comment } from '../types';
import { ReadingProgressBar } from '../components/ReadingProgressBar';
import { TableOfContents } from '../components/TableOfContents';
import { ShareButtons } from '../components/ShareButtons';
import { CommentSection } from '../components/CommentSection';
import { FAQAccordion } from '../components/FAQAccordion';
import { AdSenseBanner } from '../components/AdSenseBanner';
import { Sidebar } from '../components/Sidebar';
import { JsonLd } from '../components/JsonLd';
import { api } from '../services/api';
import {
  Clock,
  Eye,
  Calendar,
  ChevronRight,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface ArticlePageProps {
  slug: string;
  onNavigate: (path: string) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  allArticles: Article[];
  showAds?: boolean;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  slug,
  onNavigate,
  bookmarks,
  onToggleBookmark,
  allArticles,
  showAds = true
}) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    async function loadArticle() {
try {
  console.log("Loading slug:", slug);

  const fetched = await api.getArticleBySlug(slug);
  console.log("Article loaded:", fetched);

  if (isMounted) {
    setArticle(fetched);

    try {
      const comms = await api.getArticleComments(fetched.id);
      console.log("Comments:", comms);
      setComments(comms);
    } catch (e) {
      console.error("Comments failed:", e);
    }

    document.title = `${fetched.metaTitle || fetched.title} | EarnInfo`;
  }
} catch (err) {
  console.error("ARTICLE ERROR:", err);

  if (isMounted) {
    setError("Article not found");
  }
}}

    loadArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const refreshComments = async () => {
    if (article) {
      const comms = await api.getArticleComments(article.id);
      setComments(comms);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            The story you are looking for may have been moved or updated.
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(article.id);

  // Find previous and next articles
  const publishedList = allArticles.filter(a => a.status === 'published');
  const currentIndex = publishedList.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? publishedList[currentIndex - 1] : null;
  const nextArticle = currentIndex < publishedList.length - 1 ? publishedList[currentIndex + 1] : null;

  // Related articles (same category)
  const relatedArticles = publishedList
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: article.category.toUpperCase(), url: `/category/${article.category}` },
    { name: article.title, url: `/article/${article.slug}` }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <ReadingProgressBar />
      <JsonLd type="Article" data={{ article }} />
      <JsonLd type="Breadcrumb" data={{ breadcrumbs }} />
      {article.faqs && article.faqs.length > 0 && (
        <JsonLd type="FAQPage" data={{ faqs: article.faqs }} />
      )}

      {/* Article Header Container */}
      <header className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-8 pb-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto no-scrollbar">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                <button
                  onClick={() => onNavigate(b.url)}
                  className={`hover:text-white transition whitespace-nowrap ${
                    i === breadcrumbs.length - 1 ? 'text-indigo-400 font-semibold line-clamp-1 max-w-[200px]' : ''
                  }`}
                >
                  {b.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* Title & Metadata */}
          <div className="space-y-4">
            <span className="inline-block bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {article.category}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {article.excerpt}
            </p>

            {/* Author Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <span className="text-sm font-bold text-white block flex items-center gap-1">
                    {article.author.name}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                  <span className="text-xs text-slate-400 block">{article.author.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {article.readingTimeMinutes} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  {article.views.toLocaleString()} views
                </span>

                <button
                  onClick={() => onToggleBookmark(article.id)}
                  className={`p-2 rounded-full border transition ${
                    isBookmarked
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content Column */}
          <article className="lg:col-span-8 bg-white dark:bg-slate-800/90 rounded-2xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
            {/* Featured Image */}
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto max-h-[480px] object-cover"
              />
              {article.imageCaption && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 p-2 italic bg-slate-100 dark:bg-slate-900">
                  {article.imageCaption}
                </p>
              )}
            </div>

            {/* Table of Contents */}
            <TableOfContents markdownContent={article.content} />

            {/* In-Article Ad Placement */}
            <AdSenseBanner format="in-article" showAds={showAds} />

            {/* Markdown Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-200 prose-h2:dark:border-slate-700 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-xl prose-p:text-slate-700 prose-p:dark:text-slate-300 prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children, ...props }) => {
                    const text = String(children).replace(/[*_~`]/g, '');
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <h2 id={id} className="text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children).replace(/[*_~`]/g, '');
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <h3 id={id} className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">
                        {children}
                      </h3>
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  img: ({ src, alt }) => (
                    <figure className="my-8 space-y-2">
                      <img
                        src={src}
                        alt={alt || 'Article illustration'}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-[480px] object-cover rounded-2xl shadow-md border border-slate-200 dark:border-slate-700"
                      />
                      {alt && (
                        <figcaption className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium italic">
                          📷 {alt}
                        </figcaption>
                      )}
                    </figure>
                  )
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Article Tags */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase">Tags:</span>
              {article.tags.map(t => (
                <button
                  key={t}
                  onClick={() => onNavigate(`/search?tag=${encodeURIComponent(t)}`)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition"
                >
                  #{t}
                </button>
              ))}
            </div>

            {/* Social Share Buttons */}
            <ShareButtons title={article.title} />

            {/* Author Bio Box */}
            <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-4">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Written by {article.author.role}
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {article.author.name}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {article.author.bio}
                </p>
              </div>
            </div>

            {/* FAQ Accordion */}
            {article.faqs && article.faqs.length > 0 && (
              <FAQAccordion faqs={article.faqs} />
            )}

            {/* Prev / Next Article Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              {prevArticle ? (
                <button
                  onClick={() => onNavigate(`/article/${prevArticle.slug}`)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition text-left space-y-1 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    <span>Previous Story</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                    {prevArticle.title}
                  </span>
                </button>
              ) : <div />}

              {nextArticle ? (
                <button
                  onClick={() => onNavigate(`/article/${nextArticle.slug}`)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition text-right space-y-1 group sm:col-start-2"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
                    <span>Next Story</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                    {nextArticle.title}
                  </span>
                </button>
              ) : <div />}
            </div>

            {/* Related Articles Grid */}
            {relatedArticles.length > 0 && (
              <section className="pt-8 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Related Stories in {article.category.toUpperCase()}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedArticles.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => onNavigate(`/article/${rel.slug}`)}
                      className="cursor-pointer group p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-indigo-500 transition"
                    >
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Comments Section */}
            <CommentSection
              articleId={article.id}
              comments={comments}
              onCommentAdded={refreshComments}
            />
          </article>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Sidebar
              articles={allArticles}
              tags={[]}
              onNavigate={onNavigate}
              showAds={showAds}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
