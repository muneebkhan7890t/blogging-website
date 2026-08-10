import React from 'react';
import { Author, Article } from '../types';
import { UserCheck, Twitter, Linkedin, Github, Globe, BookOpen } from 'lucide-react';
import { AuthorAvatar } from '../components/AuthorAvatar';

interface AuthorsPageProps {
  authors: Author[];
  articles: Article[];
  onNavigate: (path: string) => void;
}

export const AuthorsPage: React.FC<AuthorsPageProps> = ({
  authors,
  articles,
  onNavigate
}) => {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700 text-xs font-bold uppercase">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Editorial Board</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Editorial Team
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Meet the person behind EarnInfo's coverage.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {authors.map(author => {
            const authorArticles = articles.filter(a => a.author.name === author.name && a.status === 'published');
            return (
              <div
                key={author.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <AuthorAvatar
                      name={author.name}
                      avatar={author.avatar}
                      className="w-16 h-16 rounded-full"
                      borderClassName="border-2 border-indigo-500 shadow-md"
                    />
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {author.name}
                      </h3>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                        {author.role}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {author.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      {authorArticles.length} Stories Published
                    </span>

                    <div className="flex items-center gap-2">
                      {author.socials?.twitter && (
                        <a href={author.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                          <Twitter className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {author.socials?.linkedin && (
                        <a href={author.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {author.socials?.github && (
                        <a href={author.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {author.socials?.website && (
                        <a href={author.socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(`/author/${author.slug}`)}
                    className="w-full text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
