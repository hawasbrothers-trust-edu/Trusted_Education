import React from 'react';
import type { SiteContent } from '../../types/cms.ts';
import { Plus, Trash2 } from 'lucide-react';

interface SectionsEditorProps {
  draft: SiteContent;
  onChange: (next: SiteContent) => void;
}

export const SectionsEditor: React.FC<SectionsEditorProps> = ({ draft, onChange }) => {
  const inputClass =
    'w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors';

  return (
    <div className="space-y-8">
      {/* 1. Header & Brand Texts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          1. نصوص الهيدر والهوية العليا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">اسم العلامة المختصر</label>
            <input
              type="text"
              value={draft.brand.shortName}
              onChange={(e) =>
                onChange({ ...draft, brand: { ...draft.brand, shortName: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف أسفل الشعار</label>
            <input
              type="text"
              value={draft.brand.subtitle}
              onChange={(e) =>
                onChange({ ...draft, brand: { ...draft.brand, subtitle: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل بالإنجليزية</label>
            <input
              type="text"
              dir="ltr"
              value={draft.brand.name}
              onChange={(e) =>
                onChange({ ...draft, brand: { ...draft.brand, name: e.target.value } })
              }
              className={`${inputClass} text-left`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل بالعربية</label>
            <input
              type="text"
              value={draft.brand.arabicName}
              onChange={(e) =>
                onChange({ ...draft, brand: { ...draft.brand, arabicName: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص زر الإجراء في الهيدر</label>
            <input
              type="text"
              value={draft.brand.headerCtaText}
              onChange={(e) =>
                onChange({ ...draft, brand: { ...draft.brand, headerCtaText: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص زر واتساب في الهيدر</label>
            <input
              type="text"
              value={draft.brand.headerWhatsappText}
              onChange={(e) =>
                onChange({ ...draft, brand: { ...draft.brand, headerWhatsappText: e.target.value } })
              }
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          2. القسم الرئيسي (Hero Section)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص الشريط - المؤسسة</label>
            <input
              type="text"
              value={draft.hero.kickerOrg}
              onChange={(e) => onChange({ ...draft, hero: { ...draft.hero, kickerOrg: e.target.value } })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص الشريط - الخبرة</label>
            <input
              type="text"
              value={draft.hero.kickerExperience}
              onChange={(e) =>
                onChange({ ...draft, hero: { ...draft.hero, kickerExperience: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص الشريط - الشعار</label>
            <input
              type="text"
              value={draft.hero.kickerTagline}
              onChange={(e) =>
                onChange({ ...draft, hero: { ...draft.hero, kickerTagline: e.target.value } })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الرئيسي (H1)</label>
          <input
            type="text"
            value={draft.hero.headline}
            onChange={(e) => onChange({ ...draft, hero: { ...draft.hero, headline: e.target.value } })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">الفقرة التعريفية</label>
          <textarea
            rows={3}
            value={draft.hero.description}
            onChange={(e) => onChange({ ...draft, hero: { ...draft.hero, description: e.target.value } })}
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700">نقاط الثقة والمزايا</label>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...draft,
                  hero: { ...draft.hero, trustPoints: [...draft.hero.trustPoints, 'ميزة جديدة'] },
                })
              }
              className="text-xs text-[#2C5F8A] font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة نقطة</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {draft.hero.trustPoints.map((pt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={pt}
                  onChange={(e) => {
                    const next = [...draft.hero.trustPoints];
                    next[idx] = e.target.value;
                    onChange({ ...draft, hero: { ...draft.hero, trustPoints: next } });
                  }}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = draft.hero.trustPoints.filter((_, i) => i !== idx);
                    onChange({ ...draft, hero: { ...draft.hero, trustPoints: next } });
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص الزر الأساسي</label>
            <input
              type="text"
              value={draft.hero.primaryCtaText}
              onChange={(e) =>
                onChange({ ...draft, hero: { ...draft.hero, primaryCtaText: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص زر الواتساب</label>
            <input
              type="text"
              value={draft.hero.whatsappCtaText}
              onChange={(e) =>
                onChange({ ...draft, hero: { ...draft.hero, whatsappCtaText: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص استعراض الخدمات</label>
            <input
              type="text"
              value={draft.hero.exploreCtaText}
              onChange={(e) =>
                onChange({ ...draft, hero: { ...draft.hero, exploreCtaText: e.target.value } })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان النص فوق صورة الهيرو</label>
            <input
              type="text"
              value={draft.hero.imageCaptionTitle}
              onChange={(e) =>
                onChange({ ...draft, hero: { ...draft.hero, imageCaptionTitle: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">وصف النص فوق صورة الهيرو</label>
            <input
              type="text"
              value={draft.hero.imageCaptionText}
              onChange={(e) =>
                onChange({ ...draft, hero: { ...draft.hero, imageCaptionText: e.target.value } })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظة المقر أسفل الأزرار</label>
          <input
            type="text"
            value={draft.hero.locationNote}
            onChange={(e) => onChange({ ...draft, hero: { ...draft.hero, locationNote: e.target.value } })}
            className={inputClass}
          />
        </div>
      </div>

      {/* 3. Stats Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          3. شريط الإحصائيات والأرقام
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.stats.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-2.5">
              <div className="text-xs font-bold text-[#2C5F8A]">بطاقة رقم {idx + 1}</div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">الرقم / القيمة</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...draft.stats];
                    next[idx] = { ...stat, value: e.target.value };
                    onChange({ ...draft, stats: next });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...draft.stats];
                    next[idx] = { ...stat, label: e.target.value };
                    onChange({ ...draft, stats: next });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">الوصف الفرعي</label>
                <input
                  type="text"
                  value={stat.sublabel}
                  onChange={(e) => {
                    const next = [...draft.stats];
                    next[idx] = { ...stat, sublabel: e.target.value };
                    onChange({ ...draft, stats: next });
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Workflow Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#1A3A5C]">4. قسم «كيف نعمل» والخطوات</h2>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...draft,
                workflowSteps: [
                  ...draft.workflowSteps,
                  {
                    stepNumber: String(draft.workflowSteps.length + 1).padStart(2, '0'),
                    title: 'خطوة جديدة',
                    description: 'وصف الخطوة...',
                    footerNote: 'ضمان الجودة',
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2C5F8A] bg-[#F0F5FA] rounded-lg hover:bg-[#E2ECF6]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة خطوة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان القسم</label>
            <input
              type="text"
              value={draft.workflowSection.headline}
              onChange={(e) =>
                onChange({
                  ...draft,
                  workflowSection: { ...draft.workflowSection, headline: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص الزر السفلي</label>
            <input
              type="text"
              value={draft.workflowSection.ctaButtonText}
              onChange={(e) =>
                onChange({
                  ...draft,
                  workflowSection: { ...draft.workflowSection, ctaButtonText: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">وصف القسم</label>
          <textarea
            rows={2}
            value={draft.workflowSection.description}
            onChange={(e) =>
              onChange({
                ...draft,
                workflowSection: { ...draft.workflowSection, description: e.target.value },
              })
            }
            className={inputClass}
          />
        </div>

        <div className="space-y-3">
          {draft.workflowSteps.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A3A5C]">خطوة {step.stepNumber}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...draft,
                      workflowSteps: draft.workflowSteps.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">الرقم</label>
                  <input
                    type="text"
                    value={step.stepNumber}
                    onChange={(e) => {
                      const next = [...draft.workflowSteps];
                      next[idx] = { ...step, stepNumber: e.target.value };
                      onChange({ ...draft, workflowSteps: next });
                    }}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">عنوان الخطوة</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const next = [...draft.workflowSteps];
                      next[idx] = { ...step, title: e.target.value };
                      onChange({ ...draft, workflowSteps: next });
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ملاحظة سفلية</label>
                  <input
                    type="text"
                    value={step.footerNote}
                    onChange={(e) => {
                      const next = [...draft.workflowSteps];
                      next[idx] = { ...step, footerNote: e.target.value };
                      onChange({ ...draft, workflowSteps: next });
                    }}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={step.description}
                  onChange={(e) => {
                    const next = [...draft.workflowSteps];
                    next[idx] = { ...step, description: e.target.value };
                    onChange({ ...draft, workflowSteps: next });
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Order Form & Footer Texts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          5. نموذج الطلبات والفوتر (Footer)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان نموذج الطلبات</label>
            <input
              type="text"
              value={draft.orderFormSection.headline}
              onChange={(e) =>
                onChange({
                  ...draft,
                  orderFormSection: { ...draft.orderFormSection, headline: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص زر إرسال الطلب</label>
            <input
              type="text"
              value={draft.orderFormSection.submitButtonText}
              onChange={(e) =>
                onChange({
                  ...draft,
                  orderFormSection: { ...draft.orderFormSection, submitButtonText: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">وصف نموذج الطلبات</label>
          <textarea
            rows={2}
            value={draft.orderFormSection.description}
            onChange={(e) =>
              onChange({
                ...draft,
                orderFormSection: { ...draft.orderFormSection, description: e.target.value },
              })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">نبذة الشركة في الفوتر</label>
          <textarea
            rows={2}
            value={draft.footer.description}
            onChange={(e) =>
              onChange({ ...draft, footer: { ...draft.footer, description: e.target.value } })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">نص حقوق النشر في الفوتر</label>
          <input
            type="text"
            value={draft.footer.copyrightText}
            onChange={(e) =>
              onChange({ ...draft, footer: { ...draft.footer, copyrightText: e.target.value } })
            }
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
};
