import React, { useState } from 'react';
import { ShieldCheck, FileText, Send, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { api } from '../services/api';

interface PolicyPageProps {
  pageType: 'privacy-policy' | 'terms' | 'disclaimer' | 'cookie-policy' | 'about' | 'contact';
  onNavigate: (path: string) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ pageType, onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    try {
      await api.sendContactMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getPageTitleAndIcon = () => {
    switch (pageType) {
      case 'privacy-policy':
        return { title: 'Privacy Policy', subtitle: 'AdSense & GDPR Data Protection Disclosures' };
      case 'terms':
        return { title: 'Terms & Conditions', subtitle: 'Platform Rules & Content Licensing Terms' };
      case 'disclaimer':
        return { title: 'Editorial Disclaimer', subtitle: 'Affiliate, AI Generation & Technical Guidance Terms' };
      case 'cookie-policy':
        return { title: 'Cookie Policy', subtitle: 'Detailed Usage of Tracking & Essential Cookies' };
      case 'about':
        return { title: 'About EarnInfo', subtitle: 'Editorial Mission, Authority & Standards' };
      case 'contact':
        return { title: 'Contact Desk', subtitle: 'Editorial Inquiries, Press Releases & Support' };
    }
  };

  const headerInfo = getPageTitleAndIcon();

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Editorial Documentation</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">{headerInfo.title}</h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">{headerInfo.subtitle}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-8 prose dark:prose-invert max-w-none">
          {pageType === 'privacy-policy' && (
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <p className="text-xs text-slate-400 italic">Last updated: August 2026</p>
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Introduction</h2>
              <p>
                At <strong>EarnInfo Media</strong>, accessible from earninfo.org, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by EarnInfo and how we use it.
              </p>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Google DoubleClick DART Cookie &amp; AdSense</h2>
              <p>
                Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to earninfo.org and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">https://policies.google.com/technologies/ads</a>.
              </p>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Third-Party Privacy Policies &amp; Analytics</h2>
              <p>
                EarnInfo's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers or ad networks for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
              </p>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. GDPR Data Protection Rights</h2>
              <p>
                We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the right to access, rectification, erasure, restrict processing, object to processing, and data portability.
              </p>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
              <p>
                Welcome to EarnInfo. By accessing this website, you accept these terms and conditions in full. Do not continue to use EarnInfo if you do not accept all of the terms and conditions stated on this page.
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Intellectual Property Rights</h3>
              <p>
                Unless otherwise stated, EarnInfo and/or its licensors own the intellectual property rights for all material published on EarnInfo. All intellectual property rights are reserved.
              </p>
            </div>
          )}

          {pageType === 'disclaimer' && (
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editorial &amp; Technology Disclaimer</h2>
              <p>
                All the information on this website is published in good faith and for general information purpose only. EarnInfo does not make any warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk.
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Content Disclosure</h3>
              <p>
                EarnInfo utilizes specialized AI toolsets (including Google Gemini) to assist editorial staff in code synthesis, data verification, and research summarization. All published materials are reviewed by human domain experts.
              </p>
            </div>
          )}

          {pageType === 'cookie-policy' && (
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cookie Declaration</h2>
              <p>
                EarnInfo uses cookies to enhance browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
          )}

          {pageType === 'about' && (
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Editorial Mission</h2>
              <p>
                EarnInfo is an independent digital publishing outlet dedicated to technical clarity, actionable earning guides, deep system architecture breakdowns, and ethical Artificial Intelligence reporting.
              </p>
              <p>
                Founded in 2026, our newsroom brings together principal researchers, senior software architects, and digital marketing strategists to deliver actionable insights without commercial noise or clickbait.
              </p>
            </div>
          )}

          {pageType === 'contact' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Contact Email</span>
                  <a href="mailto:muneebkhan7890t@gmail.com" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline break-all">
                    muneebkhan7890t@gmail.com
                  </a>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">HQ Location</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Nowshera, Pakistan</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Phone Line</span>
                  <a href="tel:+923149157941" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    +923149157941
                  </a>
                </div>
              </div>

              {submitted ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Message Sent Successfully!</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Our editorial desk will review your inquiry within 24 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 not-prose">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send an Editorial Message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Your Email Address *"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Subject (e.g., Press Release, Licensing, Correction)"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                  />
                  <textarea
                    rows={5}
                    placeholder="Type your message details here..."
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending...' : 'Submit Message'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
