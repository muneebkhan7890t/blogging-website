import React, { useState } from 'react';
import { Mail, Rss, Shield, CheckCircle2, ArrowRight, MapPin, Phone } from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';

interface FooterProps {
  categories: Category[];
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ categories, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await api.subscribeNewsletter(email);
      setStatus({ type: 'success', msg: res.message });
      setEmail('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'Subscription failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800" id="main-footer">
      {/* Top Newsletter & Assurance Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-800">
              <Mail className="w-3.5 h-3.5" />
              <span>Weekly Tech Briefing</span>
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Stay ahead in AI, Cybersecurity &amp; Software Engineering
            </h3>
            <p className="text-slate-400 text-sm max-w-xl">
              Get our editorial team’s top curated breakthroughs, technical tutorials, and industry insights delivered straight to your inbox once a week. Zero spam.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your professional email address..."
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  id="footer-newsletter-email"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                  id="footer-newsletter-submit"
                >
                  {submitting ? (
                    <span>Subscribing...</span>
                  ) : (
                    <>
                      <span>Join Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {status && (
                <div
                  className={`text-xs p-2.5 rounded-lg flex items-center gap-2 ${
                    status.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{status.msg}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                TP
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                TechPulse
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              TechPulse is an independent digital publication committed to delivering rigorous, high-authority reporting on Artificial Intelligence, developer ecosystems, cloud architecture, and cybersecurity.
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Nowshera, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <a href="mailto:muneebkhan7890t@gmail.com" className="hover:text-white transition">
                  muneebkhan7890t@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <a href="tel:+923149157941" className="hover:text-white transition">
                  +923149157941
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-amber-400 transition"
              >
                <Rss className="w-3.5 h-3.5" />
                <span>RSS Feed</span>
              </a>
              <span>•</span>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-400 transition"
              >
                XML Sitemap
              </a>
              <span>•</span>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-400 transition"
              >
                robots.txt
              </a>
            </div>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Top Categories
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className="hover:text-indigo-400 transition text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Platform &amp; Editorial
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-indigo-400 transition">
                  Latest News
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categories')} className="hover:text-indigo-400 transition">
                  Categories Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/authors')} className="hover:text-indigo-400 transition">
                  Editorial Team &amp; Authors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-indigo-400 transition">
                  About Us &amp; Mission
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-indigo-400 transition">
                  Contact &amp; Editorial Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                  Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Mandatory AdSense Policy Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Legal &amp; Policy
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-indigo-400 transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-indigo-400 transition">
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/disclaimer')} className="hover:text-indigo-400 transition">
                  Editorial Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/cookie-policy')} className="hover:text-indigo-400 transition">
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & AdSense Compliance Strip */}
      <div className="bg-slate-950 py-6 border-t border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TechPulse Media Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>GDPR &amp; Privacy Compliant Digital Media</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
