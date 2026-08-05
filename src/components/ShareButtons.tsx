import React, { useState } from 'react';
import { Share2, Link2, Check, Twitter, Linkedin, Facebook, MessageSquare } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2 flex-wrap py-4 border-y border-slate-200/80 dark:border-slate-800 my-6">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
        <Share2 className="w-3.5 h-3.5" />
        <span>Share:</span>
      </span>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        title="Share on Twitter / X"
      >
        <Twitter className="w-4 h-4" />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-700 hover:text-white text-slate-700 dark:text-slate-300 transition"
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 transition"
        title="Share on WhatsApp"
      >
        <MessageSquare className="w-4 h-4" />
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};
