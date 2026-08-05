import React, { useEffect, useState } from 'react';
import { List, AlignLeft } from 'lucide-react';

interface HeadingsItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  markdownContent: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ markdownContent }) => {
  const [headings, setHeadings] = useState<HeadingsItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const lines = markdownContent.split('\n');
    const items: HeadingsItem[] = [];

    lines.forEach(line => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length; // 2 for H2, 3 for H3
        const rawText = match[2].trim().replace(/[*_~`]/g, '');
        const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        items.push({ id, text: rawText, level });
      }
    });

    setHeadings(items);
  }, [markdownContent]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    headings.forEach(heading => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // Header offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 my-6 space-y-3">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-200 dark:border-slate-700 pb-2.5">
        <AlignLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>Table of Contents</span>
      </div>

      <ul className="space-y-1.5 text-xs max-h-[300px] overflow-y-auto pr-1">
        {headings.map(item => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <button
              onClick={() => scrollToHeading(item.id)}
              className={`text-left w-full py-1 px-2 rounded-md transition line-clamp-1 ${
                activeId === item.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
