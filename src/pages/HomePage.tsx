import React, { useState } from 'react';
import { Article, Category, Tag } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Sidebar } from '../components/Sidebar';
import { AdSenseBanner } from '../components/AdSenseBanner';
import { JsonLd } from '../components/JsonLd';
import { NavLink } from '../components/NavLink';
import { Flame, Sparkles, ArrowRight, Layers, TrendingUp } from 'lucide-react';
import AdUnit from "../components/AdUnit";

interface HomePageProps {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  onNavigate: (path: string) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  showAds?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  categories,
  tags,
  onNavigate,
  bookmarks,
  onToggleBookmark,
  showAds = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const publishedArticles = articles.filter(a => a.status === 'published');
  const featuredArticle = publishedArticles.find(a => a.isFeatured) || publishedArticles[0];

  const trendingArticles = publishedArticles.filter(a => a.isTrending || a.views > 2000).slice(0, 3);

  const filteredArticles = publishedArticles.filter(a => {
    if (a.id === featuredArticle?.id) return false; // Don't duplicate featured article in main grid
    if (selectedCategory) return a.category === selectedCategory;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100">
      <JsonLd type="WebSite" />
      <JsonLd type="Organization" />

      {/* Hero Section with Featured Article */}
      <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-8 pb-12 sm:pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header AdSense Leaderboard Slot */}
          <AdUnit />



          <div className="flex items-center justify-between border-b border-indigo-900/80 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Featured Editorial Story
              </h1>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700">
              EarnInfo Lead Edition
            </span>
          </div>

          {featuredArticle && (
            <ArticleCard
              article={featuredArticle}
              onNavigate={onNavigate}
              variant="featured"
              isBookmarked={bookmarks.includes(featuredArticle.id)}
              onToggleBookmark={onToggleBookmark}
            />
          )}
        </div>
      </section>

      {/* Main Content Layout (Grid + Sidebar) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Trending Strip */}
        {trendingArticles.length > 0 && (
          <section className="mb-12 bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-lg pb-3 border-b border-slate-100 dark:border-slate-700">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2>Trending Topics Today</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingArticles.map(art => (
                <div key={art.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-3 group">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {art.category}
                    </span>
                    <NavLink
                      to={`/article/${art.slug}`}
                      onNavigate={onNavigate}
                      className="text-left block font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 mt-1"
                    >
                      {art.title}
                    </NavLink>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{art.author.name}</span>
                    <span>{art.views.toLocaleString()} views</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedCategory ? `Category: ${selectedCategory.toUpperCase()}` : 'Latest Tech Stories'}
                </h2>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === null
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat.slug
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Feed Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredArticles.map((art, idx) => (
                <React.Fragment key={art.id}>
                  <ArticleCard
                    article={art}
                    onNavigate={onNavigate}
                    isBookmarked={bookmarks.includes(art.id)}
                    onToggleBookmark={onToggleBookmark}
                  />
                  {/* Insert AdSense In-Article unit after 3rd article */}
                  {idx === 2 && (
                    <div className="sm:col-span-2 my-2">
                      <AdSenseBanner format="in-article" showAds={showAds} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Popular Categories Visual Grid */}
            <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Explore Categories
                  </h3>
                </div>
                <NavLink
                  to="/categories"
                  onNavigate={onNavigate}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Categories</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <NavLink
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onNavigate={onNavigate}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-sm hover:shadow-md transition text-left group block"
                  >
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider mb-1">
                      {cat.count || 0} Articles
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {cat.name}
                    </h4>
                  </NavLink>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4">
            <Sidebar
              articles={publishedArticles}
              tags={tags}
              onNavigate={onNavigate}
              showAds={showAds}
            />
          </div>
        </div>
      </main>

      {/* Footer Banner Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdUnit />


      </div>
    </div>
  );
};
