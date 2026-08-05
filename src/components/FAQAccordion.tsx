import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 my-8 space-y-4" id="article-faq-section">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
        <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
