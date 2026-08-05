import React from 'react';
import { Category } from '../types';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';

interface CategoriesOverviewPageProps {
  categories: Category[];
  onNavigate: (path: string) => void;
}

export const CategoriesOverviewPage: React.FC<CategoriesOverviewPageProps> = ({
  categories,
  onNavigate
}) => {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700 text-xs font-bold uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Topics &amp; Channels</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Editorial Categories
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Discover in-depth reporting and tutorials organized across key digital domains.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className="group cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500 shadow-sm hover:shadow-xl transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {cat.count || 0} Articles
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {cat.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Browse Category</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
