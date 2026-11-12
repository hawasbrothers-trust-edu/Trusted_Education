import React, { useState } from 'react';
import type { SiteContent, ArticleItem, FaqItem, PrivacyClauseItem } from '../../types/cms.ts';
import { MediaUploaderField } from './MediaUploaderField.tsx';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface BlogFaqEditorProps {
  draft: SiteContent;
  onChange: (next: SiteContent) => void;
  mode: 'blog' | 'faq';
  authToken: string | null;
}

export const BlogFaqEditor: React.FC<BlogFaqEditorProps> = ({
  draft,
  onChange,
  mode,
  authToken,
}) => {
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(
    draft.articles[0]?.id || null
  );
  const [confirmDeleteArticleId, setConfirmDeleteArticleId] = useState<string | null>(null);

  const inputClass =
    'w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors';

  if (mode === 'blog') {
    const handleAddArticle = () => {
      const newId = `art-${Date.now()}`;
      const newArticle: ArticleItem = {
        id: newId,
        title: 'عنوان مقال علمي جديد',
        date: new Date().toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        author: 'هيئة التحرير الأكاديمية – Trusted',
        category: 'منهجية البحث',
        readTime: '5 دقائق',
        excerpt: 'ملخص موجز يظهر في بطاقة المقال على الصفحة الرئيسية...',
        content: 'النص الكامل للمقال العلمي...',
        imageUrl: '',
      };
      onChange({ ...draft, articles: [newArticle, ...draft.articles] });
      setExpandedArticleId(newId);
    };

    const updateArticle = (idx: number, patch: Partial<ArticleItem>) => {
      const next = [...draft.articles];
      next[idx] = { ...next[idx], ...patch };
      onChange({ ...draft, articles: next });
    };

    return (
      <div className="space-y-6">
        {/* Blog Section Heading */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
            نصوص قسم المدونة والمقالات العلمية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الفرعي الأيمن</label>
              <input
                type="text"
                value={draft.blogSection.kickerLeft}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    blogSection: { ...draft.blogSection, kickerLeft: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الفرعي الأيسر</label>
              <input
                type="text"
                value={draft.blogSection.kickerRight}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    blogSection: { ...draft.blogSection, kickerRight: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان القسم</label>
            <input
              type="text"
              value={draft.blogSection.headline}
              onChange={(e) =>
                onChange({
                  ...draft,
                  blogSection: { ...draft.blogSection, headline: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">وصف القسم</label>
            <textarea
              rows={2}
              value={draft.blogSection.description}
              onChange={(e) =>
                onChange({
                  ...draft,
                  blogSection: { ...draft.blogSection, description: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Articles CRUD */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#1A3A5C]">
              إدارة المقالات ({draft.articles.length} مقال)
            </h2>
            <button
              type="button"
              onClick={handleAddArticle}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مقال جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {draft.articles.map((article, idx) => {
              const isOpen = expandedArticleId === article.id;
              const isConfirming = confirmDeleteArticleId === article.id;

              return (
                <div key={article.id} className="rounded-xl border border-slate-200/90 overflow-hidden bg-[#F7F9FC]">
                  <div className="flex items-center justify-between p-4 bg-white gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedArticleId(isOpen ? null : article.id)}
                      className="flex-1 flex items-center gap-3 text-right focus:outline-hidden min-w-0"
                    >
                      <span className="font-mono text-xs font-bold text-[#2C5F8A] shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[#1A3A5C] truncate">{article.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {article.category} · {article.date}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onChange({
                              ...draft,
                              articles: draft.articles.filter((_, i) => i !== idx),
                            });
                            setConfirmDeleteArticleId(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded-md hover:bg-rose-700"
                        >
                          تأكيد الحذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteArticleId(null)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteArticleId(article.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                        aria-label="حذف المقال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="p-4 sm:p-5 border-t border-slate-200 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان المقال</label>
                        <input
                          type="text"
                          value={article.title}
                          onChange={(e) => updateArticle(idx, { title: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">التصنيف</label>
                          <input
                            type="text"
                            value={article.category}
                            onChange={(e) => updateArticle(idx, { category: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ النشر</label>
                          <input
                            type="text"
                            value={article.date}
                            onChange={(e) => updateArticle(idx, { date: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">مدة القراءة</label>
                          <input
                            type="text"
                            value={article.readTime}
                            onChange={(e) => updateArticle(idx, { readTime: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">الكاتب</label>
                          <input
                            type="text"
                            value={article.author}
                            onChange={(e) => updateArticle(idx, { author: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/80">
                        <MediaUploaderField
                          label="صورة الغلاف للمقال (اختياري)"
                          kind="image"
                          value={article.imageUrl || ''}
                          onChange={(url) => updateArticle(idx, { imageUrl: url })}
                          authToken={authToken}
                          helperText="تظهر أعلى بطاقة المقال وداخل نافذة القراءة."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">المقتطف المختصر</label>
                        <textarea
                          rows={2}
                          value={article.excerpt}
                          onChange={(e) => updateArticle(idx, { excerpt: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">نص المقال الكامل</label>
                        <textarea
                          rows={7}
                          value={article.content}
                          onChange={(e) => updateArticle(idx, { content: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // FAQ & Privacy Policy Editor
  const updateFaq = (idx: number, patch: Partial<FaqItem>) => {
    const next = [...draft.faqs];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...draft, faqs: next });
  };

  const updateClause = (idx: number, patch: Partial<PrivacyClauseItem>) => {
    const next = [...draft.privacyPolicy.clauses];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...draft, privacyPolicy: { ...draft.privacyPolicy, clauses: next } });
  };

  return (
    <div className="space-y-6">
      {/* FAQs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#1A3A5C]">قسم الأسئلة الشائعة ({draft.faqs.length})</h2>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...draft,
                faqs: [...draft.faqs, { q: 'سؤال جديد؟', a: 'الإجابة التفصيلية...' }],
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2C5F8A] bg-[#F0F5FA] rounded-lg hover:bg-[#E2ECF6]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة سؤال</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الفرعي</label>
            <input
              type="text"
              value={draft.faqSection.kicker}
              onChange={(e) =>
                onChange({ ...draft, faqSection: { ...draft.faqSection, kicker: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الرئيسي</label>
            <input
              type="text"
              value={draft.faqSection.headline}
              onChange={(e) =>
                onChange({ ...draft, faqSection: { ...draft.faqSection, headline: e.target.value } })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">وصف القسم</label>
          <input
            type="text"
            value={draft.faqSection.description}
            onChange={(e) =>
              onChange({ ...draft, faqSection: { ...draft.faqSection, description: e.target.value } })
            }
            className={inputClass}
          />
        </div>

        <div className="space-y-3 pt-2">
          {draft.faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C5F8A]">سؤال {idx + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...draft,
                      faqs: draft.faqs.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-slate-400 hover:text-rose-600"
                  aria-label="حذف السؤال"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={faq.q}
                onChange={(e) => updateFaq(idx, { q: e.target.value })}
                placeholder="السؤال"
                className={inputClass}
              />
              <textarea
                rows={2}
                value={faq.a}
                onChange={(e) => updateFaq(idx, { a: e.target.value })}
                placeholder="الإجابة"
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#1A3A5C]">سياسة الخصوصية والسرية</h2>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...draft,
                privacyPolicy: {
                  ...draft.privacyPolicy,
                  clauses: [
                    ...draft.privacyPolicy.clauses,
                    { title: 'بند جديد', description: 'تفاصيل البند...' },
                  ],
                },
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2C5F8A] bg-[#F0F5FA] rounded-lg hover:bg-[#E2ECF6]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة بند</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان النافذة</label>
            <input
              type="text"
              value={draft.privacyPolicy.title}
              onChange={(e) =>
                onChange({
                  ...draft,
                  privacyPolicy: { ...draft.privacyPolicy, title: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الفرعي</label>
            <input
              type="text"
              value={draft.privacyPolicy.subtitle}
              onChange={(e) =>
                onChange({
                  ...draft,
                  privacyPolicy: { ...draft.privacyPolicy, subtitle: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-3">
          {draft.privacyPolicy.clauses.map((clause, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A3A5C]">بند {idx + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...draft,
                      privacyPolicy: {
                        ...draft.privacyPolicy,
                        clauses: draft.privacyPolicy.clauses.filter((_, i) => i !== idx),
                      },
                    })
                  }
                  className="text-slate-400 hover:text-rose-600"
                  aria-label="حذف البند"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={clause.title}
                onChange={(e) => updateClause(idx, { title: e.target.value })}
                className={inputClass}
              />
              <textarea
                rows={2}
                value={clause.description}
                onChange={(e) => updateClause(idx, { description: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
