import React, { useState, useEffect } from 'react';
import { Article, Category, Tag } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Search, Filter, Bookmark, Layers } from 'lucide-react';

interface SearchPageProps {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  onNavigate: (path: string) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  initialQuery?: string;
  initialTag?: string;
  initialBookmarksOnly?: boolean;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  articles,
  categories,
  tags,
  onNavigate,
  bookmarks,
  onToggleBookmark,
  initialQuery = '',
  initialTag = '',
  initialBookmarksOnly = false
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [bookmarksOnly, setBookmarksOnly] = useState<boolean>(initialBookmarksOnly);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedTag(initialTag);
  }, [initialTag]);

  useEffect(() => {
    setBookmarksOnly(initialBookmarksOnly);
  }, [initialBookmarksOnly]);

  const publishedArticles = articles.filter(a => a.status === 'published');

  const filteredArticles = publishedArticles.filter(art => {
    if (bookmarksOnly && !bookmarks.includes(art.id)) return false;

    if (selectedCategory !== 'all' && art.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    if (selectedTag && !art.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()))) {
      return false;
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchExcerpt = art.excerpt.toLowerCase().includes(q);
      const matchContent = art.content.toLowerCase().includes(q);
      const matchTag = art.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchExcerpt && !matchContent && !matchTag) return false;
    }

    return true;
  });

  if (sortBy === 'newest') {
    filteredArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } else {
    filteredArticles.sort((a, b) => b.views - a.views);
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Header Controls */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {bookmarksOnly ? 'Your Saved Bookmarks' : 'Search Articles'}
              </h1>
              <p className="text-xs text-slate-500">
                Found {filteredArticles.length} matching stories
              </p>
            </div>

            <button
              onClick={() => setBookmarksOnly(!bookmarksOnly)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                bookmarksOnly
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>{bookmarksOnly ? 'Showing Bookmarks' : 'Show Bookmarks Only'}</span>
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by keywords, topic, technology..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          </div>

          {/* Filter Bar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Category:</span>
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>

              {selectedTag && (
                <div className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  <span>Tag: #{selectedTag}</span>
                  <button onClick={() => setSelectedTag('')} className="hover:text-indigo-900">×</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Sort:</span>
              <button
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  sortBy === 'newest' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Newest First
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  sortBy === 'popular' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Most Popular
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold">No matching articles found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(art => (
              <ArticleCard
                key={art.id}
                article={art}
                onNavigate={onNavigate}
                isBookmarked={bookmarks.includes(art.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
