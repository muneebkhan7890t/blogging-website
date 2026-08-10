export type ArticleStatus = 'published' | 'draft' | 'scheduled';

export interface Author {
  id: string;
  slug: string;
  name: string;
  avatar?: string;
  role: string;
  bio: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'spam';
  parentId?: string | null;
  replies?: Comment[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageCaption?: string;
  category: string; // Category slug
  tags: string[]; // Tag slugs or names
  author: Author;
  publishedAt: string;
  updatedAt: string;
  scheduledAt?: string;
  status: ArticleStatus;
  readingTimeMinutes: number;
  views: number;
  likes: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  faqs?: FAQItem[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AnalyticsSummary {
  totalArticles: number;
  totalViews: number;
  totalComments: number;
  totalSubscribers: number;
  totalMessages: number;
  viewsByDay: { date: string; views: number }[];
  popularCategories: { name: string; views: number; count: number }[];
}
