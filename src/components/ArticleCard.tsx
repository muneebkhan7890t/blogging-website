import React from 'react';
import { Clock, Eye, Bookmark, ArrowUpRight, Calendar } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onNavigate: (path: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  variant?: 'featured' | 'standard' | 'compact';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onNavigate,
  isBookmarked = false,
  onToggleBookmark,
  variant = 'standard'
}) => {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (variant === 'featured') {
    return (
      <div
        className="group relative bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0"
        id={`article-featured-${article.id}`}
      >
        <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:hidden" />
          <span className="absolute top-4 left-4 bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            {article.category}
          </span>
        </div>

        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {article.readingTimeMinutes} min read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                {article.views.toLocaleString()} views
              </span>
            </div>

            <button
              onClick={() => onNavigate(`/article/${article.slug}`)}
              className="text-left group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {article.title}
              </h2>
            </button>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {article.author.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[160px]">
                  {article.author.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onToggleBookmark && (
                <button
                  onClick={() => onToggleBookmark(article.id)}
                  className={`p-2 rounded-full border transition ${
                    isBookmarked
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800'
                      : 'border-slate-200 text-slate-400 hover:text-slate-700 dark:border-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              )}
              <button
                onClick={() => onNavigate(`/article/${article.slug}`)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Read Story</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className="group flex gap-4 items-center p-3 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition"
        id={`article-compact-${article.id}`}
      >
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-20 h-20 rounded-lg object-cover shrink-0"
        />
        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {article.category}
          </span>
          <button
            onClick={() => onNavigate(`/article/${article.slug}`)}
            className="text-left text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2"
          >
            {article.title}
          </button>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{article.readingTimeMinutes}m read</span>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card
  return (
    <div
      className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      id={`article-card-${article.id}`}
    >
      <div>
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white font-semibold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider">
            {article.category}
          </span>
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
                isBookmarked
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900/60 text-white/80 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{article.readingTimeMinutes} min read</span>
            <span>•</span>
            <span>{article.views.toLocaleString()} views</span>
          </div>

          <button
            onClick={() => onNavigate(`/article/${article.slug}`)}
            className="text-left group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </button>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {article.author.name}
          </span>
        </div>

        <button
          onClick={() => onNavigate(`/article/${article.slug}`)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
        >
          <span>Read</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
