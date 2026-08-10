import React, { useState } from 'react';
import { Search, Home, AlertCircle } from 'lucide-react';
import { Article } from '../types';
import { NavLink } from '../components/NavLink';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  articles: Article[];
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate, articles }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const trending = articles.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto text-center space-y-6 bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
            404 Error
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            The page you requested may have been relocated, renamed, or is temporarily unavailable.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search EarnInfo articles..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </form>

        <NavLink
          to="/"
          onNavigate={onNavigate}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 mx-auto w-fit"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </NavLink>

        {trending.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700 text-left space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Or Explore Trending Stories
            </h3>
            <div className="space-y-2">
              {trending.map(art => (
                <NavLink
                  key={art.id}
                  to={`/article/${art.slug}`}
                  onNavigate={onNavigate}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate transition block"
                >
                  • {art.title}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
