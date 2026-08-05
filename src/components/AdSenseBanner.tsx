import React from 'react';

interface AdSenseBannerProps {
  format: 'header' | 'in-article' | 'sidebar' | 'sticky-mobile' | 'footer';
  className?: string;
  showAds?: boolean;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({ format, className = '', showAds = true }) => {
  if (!showAds) return null;

  const getFormatDetails = () => {
    switch (format) {
      case 'header':
        return {
          title: 'Cloud Native & AI Infrastructure Conference 2026',
          subtitle: 'Join 10,000+ engineers online. Reserve early bird tickets today.',
          cta: 'Register Free',
          dimensions: 'min-h-[90px] max-w-[728px] py-4'
        };
      case 'in-article':
        return {
          title: 'Accelerate High-Performance Vector Database Workloads',
          subtitle: 'Sub-millisecond latency embeddings indexing for enterprise Gemini AI deployments.',
          cta: 'Download Technical Whitepaper',
          dimensions: 'min-h-[140px] w-full py-5'
        };
      case 'sidebar':
        return {
          title: 'Developer Cloud Platform',
          subtitle: 'Deploy full-stack apps with automated CI/CD and zero-downtime scaling.',
          cta: 'Start Free Trial',
          dimensions: 'min-h-[220px] w-full max-w-[300px] py-6'
        };
      case 'sticky-mobile':
        return {
          title: 'AI Dev Tooling',
          subtitle: 'Intelligent code completions for modern TypeScript.',
          cta: 'Try Now',
          dimensions: 'h-[50px] w-full max-w-[320px] py-2'
        };
      case 'footer':
        return {
          title: 'Enterprise Cyber Security & Compliance Report',
          subtitle: 'Read the latest zero-trust architecture benchmark report.',
          cta: 'Read Report',
          dimensions: 'min-h-[90px] max-w-[728px] py-4'
        };
    }
  };

  const details = getFormatDetails();

  return (
    <div
      className={`my-6 mx-auto flex flex-col items-center justify-center bg-slate-100/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-4 text-center transition-all ${details.dimensions} ${className}`}
      id={`adsense-slot-${format}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700/60 px-2 py-0.5 rounded">
          Sponsored Announcement
        </span>
      </div>

      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
        {details.title}
      </h4>

      {format !== 'sticky-mobile' && (
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md line-clamp-1">
          {details.subtitle}
        </p>
      )}

      <div className="mt-2">
        <span className="inline-block px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold tracking-wide uppercase transition shadow-sm">
          {details.cta}
        </span>
      </div>
    </div>
  );
};

