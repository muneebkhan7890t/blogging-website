import React from 'react';
import { Article, Category } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Sidebar } from '../components/Sidebar';
import { AdSenseBanner } from '../components/AdSenseBanner';
import { Folder, Layers } from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
  categories: Category[];
  articles: Article[];
  onNavigate: (path: string) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  showAds?: boolean;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  categories,
  articles,
  onNavigate,
  bookmarks,
  onToggleBookmark,
  showAds = true
}) => {
  const currentCategory = categories.find(c => c.slug === categorySlug) || {
    name: categorySlug.toUpperCase(),
    slug: categorySlug,
    description: `Browse all high-authority articles and technical guides published in ${categorySlug}.`,
    count: 0
  };

  const categoryArticles = articles.filter(
    a => a.category.toLowerCase() === categorySlug.toLowerCase() && a.status === 'published'
  );

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Category Header */}
      <header className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Folder className="w-3.5 h-3.5" />
            <span>Topic Channel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {currentCategory.name}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {currentCategory.description}
          </p>

          <span className="inline-block text-xs text-indigo-400 font-semibold">
            Showing {categoryArticles.length} Published Stories
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {categoryArticles.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold">No articles found in this category yet</h3>
                <p className="text-xs text-slate-500">Check back soon for new published stories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categoryArticles.map((art, idx) => (
                  <React.Fragment key={art.id}>
                    <ArticleCard
                      article={art}
                      onNavigate={onNavigate}
                      isBookmarked={bookmarks.includes(art.id)}
                      onToggleBookmark={onToggleBookmark}
                    />
                    {idx === 1 && (
                      <div className="sm:col-span-2 my-2">
                        <AdSenseBanner format="in-article" showAds={showAds} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <Sidebar
              articles={articles}
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
