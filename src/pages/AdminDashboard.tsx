import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Article,
  Category,
  Tag,
  Comment,
  NewsletterSubscriber,
  ContactMessage,
  AnalyticsSummary
} from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Mail,
  Plus,
  Edit,
  Trash2,
  Check,
  Eye,
  Lock,
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface AdminDashboardProps {
  categories: Category[];
  tags: Tag[];
  onNavigate: (path: string) => void;
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  tags,
  onNavigate,
  onDataChanged
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('techpulse_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'analytics' | 'articles' | 'editor' | 'comments' | 'subscribers' | 'messages'
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Data States
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Article Editor State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<Partial<Article>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'ai',
    tags: ['Gemini AI'],
    featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    status: 'published',
    isFeatured: false,
    isTrending: false,
    faqs: [
      { question: 'What is the key takeaway of this guide?', answer: 'Provides actionable technical blueprints.' }
    ]
  });

  // Gemini AI Writer State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  async function loadAdminData() {
    try {
      const [artData, comms, subs, msgs, stats] = await Promise.all([
        api.getArticles({ status: 'all', limit: 100 }),
        api.getAdminComments(),
        api.getAdminSubscribers(),
        api.getAdminContactMessages(),
        api.getAnalytics()
      ]);
      setArticles(artData.articles);
      setComments(comms);
      setSubscribers(subs);
      setMessages(msgs);
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Gullk8900@') {
      localStorage.setItem('techpulse_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrator passcode.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('techpulse_admin_auth');
    setIsAuthenticated(false);
  };

  // Article Actions
  const handleCreateNewClick = () => {
    setEditingArticleId(null);
    setArticleForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'ai',
      tags: ['Gemini AI'],
      featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      status: 'published',
      isFeatured: false,
      isTrending: false,
      faqs: []
    });
    setActiveTab('editor');
  };

  const handleEditClick = (art: Article) => {
    setEditingArticleId(art.id);
    setArticleForm({ ...art });
    setActiveTab('editor');
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await api.deleteArticle(id);
      loadAdminData();
      onDataChanged();
    }
  };

  const handleTitleChange = (newTitle: string) => {
    const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setArticleForm(prev => ({
      ...prev,
      title: newTitle,
      slug: !prev.slug || prev.slug === prev.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ? autoSlug : prev.slug
    }));
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedSlug = articleForm.slug?.trim() ||
        (articleForm.title ? articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'article-' + Date.now());

      const payload: Partial<Article> = {
        ...articleForm,
        slug: generatedSlug,
        status: articleForm.status || 'published',
        publishedAt: articleForm.publishedAt || new Date().toISOString()
      };

      if (editingArticleId) {
        await api.updateArticle(editingArticleId, payload);
      } else {
        await api.createArticle(payload);
      }
      await loadAdminData();
      onDataChanged();
      setActiveTab('articles');
    } catch (err: any) {
      alert(err.message || 'Error saving article');
    }
  };

  // AI Generation with Gemini
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiStatus('Gemini 2.5 is drafting Markdown article...');
    try {
      const generated = await api.generateAiArticle(aiPrompt, articleForm.category);
      setArticleForm(prev => ({
        ...prev,
        title: generated.title || prev.title,
        slug: generated.slug || prev.slug,
        excerpt: generated.excerpt || prev.excerpt,
        content: generated.content || prev.content,
        metaTitle: generated.metaTitle || generated.title,
        metaDescription: generated.metaDescription || generated.excerpt,
        faqs: generated.faqs || prev.faqs
      }));
      setAiStatus('Successfully drafted article with Gemini AI!');
    } catch (err: any) {
      setAiStatus(`AI Generation Error: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // CSV Export for Subscribers
  const handleExportSubscribersCsv = () => {
    const headers = 'ID,Email,SubscribedAt,Active\n';
    const rows = subscribers.map(s => `"${s.id}","${s.email}","${s.subscribedAt}",${s.active}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black">Admin CMS Access</h1>
            <p className="text-xs text-slate-400">
              TechPulse Publishing Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter security passcode..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm transition shadow-lg shadow-indigo-600/30"
            >
              Sign In to CMS
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700 text-center">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Site</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* CMS Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">
            TP
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">TechPulse Admin Console</h1>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              Single-Admin Publishing Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main CMS Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Analytics &amp; Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'articles'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manage Articles ({articles.length})</span>
          </button>

          <button
            onClick={handleCreateNewClick}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Article Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'comments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment Moderation ({comments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'subscribers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Newsletter Subscribers ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'messages'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Messages ({messages.length})</span>
          </button>
        </aside>

        {/* CMS Tab Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white">Platform Analytics Summary</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">Total Published Articles</span>
                  <span className="text-3xl font-black text-white">{analytics.totalArticles}</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">Total Page Views</span>
                  <span className="text-3xl font-black text-indigo-400">{analytics.totalViews.toLocaleString()}</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">Total Comments</span>
                  <span className="text-3xl font-black text-emerald-400">{analytics.totalComments}</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">Active Subscribers</span>
                  <span className="text-3xl font-black text-amber-400">{analytics.totalSubscribers}</span>
                </div>
              </div>

              {/* Popular Categories Performance */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-base font-extrabold text-white">Category Traffic Breakdown</h3>
                <div className="space-y-3">
                  {analytics.popularCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{cat.name} ({cat.count} posts)</span>
                        <span className="text-indigo-400">{cat.views.toLocaleString()} views</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.min(100, (cat.views / (analytics.totalViews || 1)) * 100 * 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLES MANAGER */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Article Manager</h2>
                <button
                  onClick={handleCreateNewClick}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Article</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Views</th>
                      <th className="p-4">Published</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {articles.map(art => (
                      <tr key={art.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-4 font-bold text-white max-w-xs truncate">{art.title}</td>
                        <td className="p-4 uppercase text-[10px] font-bold text-indigo-400">{art.category}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              art.status === 'published'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold">{art.views.toLocaleString()}</td>
                        <td className="p-4 text-slate-400">{new Date(art.publishedAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(art)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ARTICLE EDITOR + GEMINI AI ASSISTANT */}
          {activeTab === 'editor' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">
                  {editingArticleId ? 'Edit Article' : 'Publish New Article'}
                </h2>
                <button
                  onClick={() => setActiveTab('articles')}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>

              {/* Gemini AI Assistant Prompt Box */}
              <div className="p-5 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 rounded-2xl border border-indigo-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Gemini 2.5 AI Article Co-Writer</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder="Enter topic or outline (e.g. 'Kubernetes 2026 Autoscaling Best Practices')..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-700 text-white text-xs placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <span>{aiGenerating ? 'Drafting...' : 'Generate with Gemini'}</span>
                  </button>
                </div>
                {aiStatus && <p className="text-xs text-indigo-200">{aiStatus}</p>}
              </div>

              {/* Form */}
              <form onSubmit={handleSaveArticle} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Article Title *</label>
                    <input
                      type="text"
                      required
                      value={articleForm.title || ''}
                      onChange={e => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={articleForm.slug || ''}
                      onChange={e => setArticleForm({ ...articleForm, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Excerpt Summary *</label>
                  <textarea
                    rows={2}
                    required
                    value={articleForm.excerpt || ''}
                    onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={articleForm.category || 'ai'}
                      onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                    <select
                      value={articleForm.status || 'published'}
                      onChange={e => setArticleForm({ ...articleForm, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={articleForm.featuredImage || ''}
                      onChange={e => setArticleForm({ ...articleForm, featuredImage: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Split-Screen Markdown Editor */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Markdown Body Content *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      rows={14}
                      required
                      value={articleForm.content || ''}
                      onChange={e => setArticleForm({ ...articleForm, content: e.target.value })}
                      placeholder="# Heading 2\nWrite your markdown text here..."
                      className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono leading-relaxed focus:outline-none"
                    />
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 max-h-[380px] overflow-y-auto prose prose-invert prose-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {articleForm.content || '*Live markdown preview will appear here...*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition shadow-lg shadow-indigo-600/30"
                  >
                    Save &amp; Publish Article
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">Comment Moderation Desk</h2>
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">{c.authorName} ({c.authorEmail})</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-300">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NEWSLETTER SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Newsletter Subscriber List</h2>
                <button
                  onClick={handleExportSubscribersCsv}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">Subscriber Email</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {subscribers.map(s => (
                      <tr key={s.id}>
                        <td className="p-4 font-bold text-white">{s.email}</td>
                        <td className="p-4 text-slate-400">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                        <td className="p-4 text-emerald-400 font-bold">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">Contact Desk Inbox</h2>
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{m.name} ({m.email})</span>
                      <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-indigo-400">{m.subject}</h4>
                    <p className="text-xs text-slate-300">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
