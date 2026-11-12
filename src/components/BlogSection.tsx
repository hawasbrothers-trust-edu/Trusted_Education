import React, { useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import type { ArticleItem } from '../types/cms.ts';
import { ArrowLeft, X, Share2, Check } from 'lucide-react';

export const BlogSection: React.FC = () => {
  const { content } = useSiteContent();
  const { blogSection, articles, brand } = content;
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="blog" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2C5F8A] font-semibold mb-2">
            <span>{blogSection.kickerLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{blogSection.kickerRight}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight leading-snug">
            {blogSection.headline}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {blogSection.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:border-[#2C5F8A]/40 hover:shadow-xs transition-all duration-200"
            >
              <div>
                {article.imageUrl && (
                  <div className="h-44 w-full overflow-hidden border-b border-slate-100 bg-slate-100">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="text-[#2C5F8A] font-semibold">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#1A3A5C] mb-3 leading-snug hover:text-[#2C5F8A] transition-colors">
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(article)}
                      className="text-right focus:outline-hidden"
                    >
                      {article.title}
                    </button>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">{article.date}</span>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(article)}
                  className="text-xs font-semibold text-[#2C5F8A] hover:text-[#1A3A5C] transition-colors flex items-center gap-1"
                >
                  <span>قراءة المقال كاملاً</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {selectedArticle && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 text-right animate-in fade-in zoom-in-95 duration-200 my-8">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#2C5F8A]">{selectedArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedArticle.readTime}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedArticle.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                    title="مشاركة رابط المقال"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'تم النسخ' : 'مشاركة'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="إغلاق المقال"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {selectedArticle.imageUrl && (
                <div className="mt-6 rounded-xl overflow-hidden max-h-72 border border-slate-100">
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="py-6">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1A3A5C] leading-snug mb-3">
                  {selectedArticle.title}
                </h3>
                <div className="text-xs text-slate-500">
                  بواسطة: <span className="font-medium text-slate-700">{selectedArticle.author}</span>
                </div>
              </div>

              <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-6">
                {selectedArticle.content}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {brand.arabicName} — جميع الحقوق محفوظة
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
