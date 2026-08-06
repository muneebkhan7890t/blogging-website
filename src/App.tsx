import React, { useState, useEffect } from 'react';
import { Article, Category, Tag, Author } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { CategoriesOverviewPage } from './pages/CategoriesOverviewPage';
import { SearchPage } from './pages/SearchPage';
import { AuthorsPage } from './pages/AuthorsPage';
import { PolicyPage } from './pages/PolicyPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname + window.location.search);
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('techpulse_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // AdSense Wireframe Toggle State
  const [showAds, setShowAds] = useState<boolean>(true);

  // Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Saved Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('techpulse_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('techpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('techpulse_theme', 'light');
    }
  }, [darkMode]);

  // Handle URL Location Pops
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch initial content
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [artRes, catRes, tagRes, autRes] = await Promise.all([
        api.getArticles({ status: 'all', limit: 100 }),
        api.getCategories(),
        api.getTags(),
        api.getAuthors()
      ]);
      setArticles(artRes.articles);
      setCategories(catRes);
      setTags(tagRes);
      setAuthors(autRes);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Navigation Handler
  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem('techpulse_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // Route Resolver
  const renderRoute = () => {
    const rawPath = currentPath.split('?')[0];
    const path = rawPath.replace(/\/+$/, '') || '/';
    const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');

    // 1. Admin Page
    if (path === '/admin') {
      return (
        <AdminDashboard
          categories={categories}
          tags={tags}
          onNavigate={handleNavigate}
          onDataChanged={loadInitialData}
        />
      );
    }

    // 2. Single Article Page: /article/:slug
    if (path.startsWith('/article/')) {
      const slug = decodeURIComponent(path.replace('/article/', '')).replace(/\/+$/, '').trim();
      return (
        <ArticlePage
          slug={slug}
          onNavigate={handleNavigate}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          allArticles={articles}
          showAds={showAds}
        />
      );
    }

    // 3. Category Page: /category/:slug
    if (path.startsWith('/category/')) {
      const slug = decodeURIComponent(path.replace('/category/', '')).replace(/\/+$/, '').trim();
      return (
        <CategoryPage
          categorySlug={slug}
          categories={categories}
          articles={articles}
          onNavigate={handleNavigate}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          showAds={showAds}
        />
      );
    }

    // 4. Categories Overview: /categories
    if (path === '/categories') {
      return (
        <CategoriesOverviewPage
          categories={categories}
          onNavigate={handleNavigate}
        />
      );
    }

    // 5. Search Page: /search
    if (path === '/search') {
      return (
        <SearchPage
          articles={articles}
          categories={categories}
          tags={tags}
          onNavigate={handleNavigate}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          initialQuery={searchParams.get('q') || ''}
          initialTag={searchParams.get('tag') || ''}
          initialBookmarksOnly={searchParams.get('bookmarks') === 'true'}
        />
      );
    }

    // 6. Authors Page: /authors
    if (path === '/authors') {
      return (
        <AuthorsPage
          authors={authors}
          articles={articles}
          onNavigate={handleNavigate}
        />
      );
    }

    // 7. Legal & Policy Pages
    if (path === '/privacy-policy') return <PolicyPage pageType="privacy-policy" onNavigate={handleNavigate} />;
    if (path === '/terms') return <PolicyPage pageType="terms" onNavigate={handleNavigate} />;
    if (path === '/disclaimer') return <PolicyPage pageType="disclaimer" onNavigate={handleNavigate} />;
    if (path === '/cookie-policy') return <PolicyPage pageType="cookie-policy" onNavigate={handleNavigate} />;
    if (path === '/about') return <PolicyPage pageType="about" onNavigate={handleNavigate} />;
    if (path === '/contact') return <PolicyPage pageType="contact" onNavigate={handleNavigate} />;

    // 8. Homepage: /
    if (path === '/' || path === '') {
      return (
        <HomePage
          articles={articles}
          categories={categories}
          tags={tags}
          onNavigate={handleNavigate}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          showAds={showAds}
        />
      );
    }

    // 9. 404 Fallback
    return <NotFoundPage onNavigate={handleNavigate} articles={articles} />;
  };

  const isAdminView = currentPath.startsWith('/admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-300">Initializing EarnInfo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {!isAdminView && (
        <Header
          categories={categories}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showAds={showAds}
          setShowAds={setShowAds}
          onNavigate={handleNavigate}
          savedBookmarksCount={bookmarks.length}
        />
      )}

      <div className="flex-1">
        {renderRoute()}
      </div>

      {!isAdminView && (
        <Footer
          categories={categories}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
