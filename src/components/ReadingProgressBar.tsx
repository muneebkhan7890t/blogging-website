import React, { useEffect, useState } from 'react';

export const ReadingProgressBar: React.FC = () => {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion(Math.min(100, Math.max(0, (currentProgress / scrollHeight) * 100)));
      }
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 h-1 bg-slate-200/50 dark:bg-slate-800/50">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-150 ease-out shadow-sm"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
};
