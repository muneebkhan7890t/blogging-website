import React, { useState, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  Megaphone,
  BookOpen,
  ChevronDown,
  Rss,
  Bookmark
} from 'lucide-react';
import { Category } from '../types';
import { NavLink } from './NavLink';

interface HeaderProps {
  categories: Category[];
  currentCategory?: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  showAds: boolean;
  setShowAds: (val: boolean) => void;
  onNavigate: (path: string) => void;
  savedBookmarksCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  currentCategory,
  darkMode,
  setDarkMode,
  showAds,
  setShowAds,
  onNavigate,
  savedBookmarksCount = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80'
      }`}
      id="main-header"
    >
      {/* Top Banner Bar for Publication Metadata */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 text-xs py-1.5 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EarnInfo Media</span>
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">
            Digital Publishing, Online Income &amp; Technology Hub
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden sm:inline text-[11px] text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-orange-400 transition text-[11px]"
            title="RSS 2.0 Feed"
          >
            <Rss className="w-3 h-3" />
            <span>RSS</span>
          </a>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <NavLink
              to="/"
              onNavigate={onNavigate}
              className="flex items-center gap-2.5 text-left group"
              id="brand-logo"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                EI
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 dark:from-white dark:via-emerald-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  EarnInfo
                </span>
                <span className="text-[10px] block font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase -mt-1">
                  Earn Money &amp; Tech Guides
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-700 dark:text-slate-300">
              <NavLink
                to="/"
                onNavigate={onNavigate}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Home
              </NavLink>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  id="categories-dropdown-btn"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {categoriesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                    <NavLink
                      to="/categories"
                      onNavigate={onNavigate}
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition flex items-center justify-between"
                    >
                      <span>View All Categories</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </NavLink>
                    {categories.map(cat => (
                      <NavLink
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onNavigate={onNavigate}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition ${
                          currentCategory === cat.slug
                            ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {cat.count || 0}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <NavLink
                to="/authors"
                onNavigate={onNavigate}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Authors
              </NavLink>
              <NavLink
                to="/about"
                onNavigate={onNavigate}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                onNavigate={onNavigate}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Contact
              </NavLink>
            </nav>
          </div>

          {/* Search, Dark Mode, Bookmarks, Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition focus:outline-none"
                id="search-input"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            {/* Bookmarks Quick Link */}
            <NavLink
              to="/search?bookmarks=true"
              onNavigate={onNavigate}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative transition inline-flex items-center"
              title="Saved Bookmarks"
              id="bookmarks-btn"
            >
              <Bookmark className="w-5 h-5" />
              {savedBookmarksCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedBookmarksCount}
                </span>
              )}
            </NavLink>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-btn"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar on Desktop */}
      <div className="hidden lg:block border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <NavLink
            to="/"
            onNavigate={onNavigate}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              !currentCategory
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
            }`}
          >
            All Top News
          </NavLink>
          {categories.map(cat => (
            <NavLink
              key={cat.id}
              to={`/category/${cat.slug}`}
              onNavigate={onNavigate}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                currentCategory === cat.slug
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tech & AI articles..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <div className="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <NavLink
              to="/"
              onNavigate={onNavigate}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </NavLink>
            <NavLink
              to="/categories"
              onNavigate={onNavigate}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Categories Catalogue
            </NavLink>
            <NavLink
              to="/authors"
              onNavigate={onNavigate}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Editorial Authors
            </NavLink>
            <NavLink
              to="/about"
              onNavigate={onNavigate}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              About Us
            </NavLink>
            <NavLink
              to="/contact"
              onNavigate={onNavigate}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Contact Us
            </NavLink>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Browse Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <NavLink
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onNavigate={onNavigate}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {cat.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
