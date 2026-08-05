import { Article, Category, Tag, Author, Comment, NewsletterSubscriber, ContactMessage, AnalyticsSummary } from '../types';

export const api = {
  // Articles
  async getArticles(params?: {
    category?: string;
    tag?: string;
    search?: string;
    status?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ articles: Article[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.isFeatured) query.append('isFeatured', 'true');
    if (params?.isTrending) query.append('isTrending', 'true');
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`/api/articles?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticleBySlug(slugOrId: string): Promise<Article> {
    const res = await fetch(`/api/articles/${encodeURIComponent(slugOrId)}`);
    if (!res.ok) throw new Error('Article not found');
    return res.json();
  },

  async createArticle(data: Partial<Article>): Promise<Article> {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create article');
    return res.json();
  },

  async updateArticle(id: string, data: Partial<Article>): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update article');
    return res.json();
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete article');
  },

  // Categories & Tags
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async getTags(): Promise<Tag[]> {
    const res = await fetch('/api/tags');
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
  },

  async getAuthors(): Promise<Author[]> {
    const res = await fetch('/api/authors');
    if (!res.ok) throw new Error('Failed to fetch authors');
    return res.json();
  },

  // Comments
  async getArticleComments(articleId: string): Promise<Comment[]> {
    const res = await fetch(`/api/articles/${articleId}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  async postComment(articleId: string, data: { authorName: string; authorEmail?: string; content: string; parentId?: string }): Promise<Comment> {
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit comment');
    return res.json();
  },

  async getAdminComments(): Promise<Comment[]> {
    const res = await fetch('/api/admin/comments');
    if (!res.ok) throw new Error('Failed to fetch admin comments');
    return res.json();
  },

  async updateCommentStatus(id: string, status: 'approved' | 'pending' | 'spam'): Promise<Comment> {
    const res = await fetch(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update comment status');
    return res.json();
  },

  // Newsletter & Contact
  async subscribeNewsletter(email: string): Promise<{ message: string }> {
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Subscription failed');
    return data;
  },

  async sendContactMessage(data: { name: string; email: string; subject?: string; message: string }): Promise<{ message: string }> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send message');
    return result;
  },

  async getAdminSubscribers(): Promise<NewsletterSubscriber[]> {
    const res = await fetch('/api/admin/subscribers');
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
  },

  async getAdminContactMessages(): Promise<ContactMessage[]> {
    const res = await fetch('/api/admin/contact-messages');
    if (!res.ok) throw new Error('Failed to fetch contact messages');
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/admin/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Gemini AI Writer
  async generateAiArticle(prompt: string, category?: string): Promise<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    metaTitle: string;
    metaDescription: string;
    faqs: { question: string; answer: string }[];
  }> {
    const res = await fetch('/api/ai/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, topic: prompt, category })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.details || err.error || 'AI generation failed');
    }
    return res.json();
  }
};
