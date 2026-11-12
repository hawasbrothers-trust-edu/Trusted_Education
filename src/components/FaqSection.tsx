import React, { useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const { content } = useSiteContent();
  const { faqSection, faqs } = content;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#F7F9FC] border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#2C5F8A] font-semibold mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>{faqSection.kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight">
            {faqSection.headline}
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600">{faqSection.description}</p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-right flex items-center justify-between gap-4 focus:outline-hidden hover:bg-slate-50/70 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[#1A3A5C] leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#2C5F8A]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
