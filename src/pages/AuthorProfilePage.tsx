import React from 'react';
import { Author, Article } from '../types';
import { Twitter, Linkedin, Github, Globe, BookOpen } from 'lucide-react';
import { AuthorAvatar } from '../components/AuthorAvatar';
import { NavLink } from '../components/NavLink';
import { ArticleCard } from '../components/ArticleCard';

interface AuthorProfilePageProps {
  slug: string;
  authors: Author[];
  articles: Article[];
  onNavigate: (path: string) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
}

export const AuthorProfilePage: React.FC<AuthorProfilePageProps> = ({
  slug,
  authors,
  articles,
  onNavigate,
  bookmarks,
  onToggleBookmark
}) => {
  const author = authors.find(a => a.slug === slug);

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Author not found</h1>
          <NavLink to="/authors" onNavigate={onNavigate} className="text-indigo-600 hover:underline">
            View all authors
          </NavLink>
        </div>
      </div>
    );
  }

  const authorArticles = articles.filter(a => a.author.slug === author.slug && a.status === 'published');

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <AuthorAvatar
            name={author.name}
            avatar={author.avatar}
            className="w-24 h-24 rounded-full mx-auto text-2xl"
            borderClassName="border-4 border-indigo-500"
          />
          <h1 className="text-3xl sm:text-4xl font-black text-white">{author.name}</h1>
          <p className="text-indigo-300 font-semibold">{author.role}</p>
          {author.bio && (
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">{author.bio}</p>
          )}
          {author.socials && (
            <div className="flex items-center justify-center gap-4 pt-2">
              {author.socials.twitter && (
                <a href={author.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {author.socials.linkedin && (
                <a href={author.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {author.socials.github && (
                <a href={author.socials.github} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">
                  <Github className="w-5 h-5" />
                </a>
              )}
              {author.socials.website && (
                <a href={author.socials.website} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Articles by {author.name} ({authorArticles.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authorArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onNavigate={onNavigate}
              isBookmarked={bookmarks.includes(article.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
