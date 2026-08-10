import React, { useState } from 'react';
import { TrendingUp, Flame, Tag as TagIcon, Mail, Check, ArrowRight } from 'lucide-react';
import { Article, Tag } from '../types';
import { AdSenseBanner } from './AdSenseBanner';
import { api } from '../services/api';
import { NavLink } from './NavLink';

interface SidebarProps {
  articles: Article[];
  tags: Tag[];
  onNavigate: (path: string) => void;
  showAds?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  articles,
  tags,
  onNavigate,
  showAds = true
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4);

  const popularArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubmitting(true);
    try {
      await api.subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="space-y-8" id="sidebar-container">
      {/* Newsletter Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-800 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/80 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-white">
            Get Daily Tech Intelligence
          </h3>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Curated analysis on AI, cybersecurity, and cloud architecture sent straight to your inbox.
          </p>
        </div>

        {subscribed ? (
          <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thank you! You are now subscribed to EarnInfo.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address..."
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-indigo-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              id="sidebar-newsletter-input"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <span>{submitting ? 'Subscribing...' : 'Subscribe Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* AdSense Sidebar Slot (300x250) */}
      <AdSenseBanner format="sidebar" showAds={showAds} />

      {/* Popular Posts */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <Flame className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Most Popular Stories
          </h3>
        </div>

        <div className="space-y-4">
          {popularArticles.map((art, idx) => (
            <div key={art.id} className="flex gap-3 items-start group">
              <span className="text-2xl font-black text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition w-6 shrink-0 pt-0.5">
                0{idx + 1}
              </span>
              <div className="space-y-1 min-w-0 flex-1">
                <NavLink
                  to={`/article/${art.slug}`}
                  onNavigate={onNavigate}
                  className="text-left block font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 leading-snug"
                >
                  {art.title}
                </NavLink>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{art.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{art.readingTimeMinutes} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <TagIcon className="w-4 h-4 text-indigo-500" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Trending Tech Tags
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <NavLink
              key={tag.id}
              to={`/search?tag=${encodeURIComponent(tag.slug)}`}
              onNavigate={onNavigate}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition"
            >
              #{tag.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Recent Articles
          </h3>
        </div>

        <div className="space-y-3">
          {recentArticles.map(art => (
            <div key={art.id} className="flex items-center gap-3 group">
              <img
                src={art.featuredImage}
                alt={art.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <NavLink
                  to={`/article/${art.slug}`}
                  onNavigate={onNavigate}
                  className="text-left block text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2"
                >
                  {art.title}
                </NavLink>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {new Date(art.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
