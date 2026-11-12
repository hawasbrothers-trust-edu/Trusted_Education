import React from 'react';
import type { SiteContent } from '../../types/cms.ts';
import { Plus, Trash2 } from 'lucide-react';

interface AboutContactEditorProps {
  draft: SiteContent;
  onChange: (next: SiteContent) => void;
  mode: 'about' | 'contact';
}

export const AboutContactEditor: React.FC<AboutContactEditorProps> = ({
  draft,
  onChange,
  mode,
}) => {
  const inputClass =
    'w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors';

  if (mode === 'about') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
            قسم «من نحن» والرؤية والرسالة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الفرعي الأيمن</label>
              <input
                type="text"
                value={draft.aboutSection.kickerLeft}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    aboutSection: { ...draft.aboutSection, kickerLeft: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">الكيان الأم</label>
              <input
                type="text"
                value={draft.brand.parentOrg}
                onChange={(e) =>
                  onChange({ ...draft, brand: { ...draft.brand, parentOrg: e.target.value } })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الرئيسي للقسم</label>
            <input
              type="text"
              value={draft.aboutSection.headline}
              onChange={(e) =>
                onChange({
                  ...draft,
                  aboutSection: { ...draft.aboutSection, headline: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف التفصيلي</label>
            <textarea
              rows={3}
              value={draft.aboutSection.description}
              onChange={(e) =>
                onChange({
                  ...draft,
                  aboutSection: { ...draft.aboutSection, description: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/70 space-y-2">
              <label className="block text-xs font-bold text-[#1A3A5C]">عنوان الرؤية</label>
              <input
                type="text"
                value={draft.aboutSection.visionTitle}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    aboutSection: { ...draft.aboutSection, visionTitle: e.target.value },
                  })
                }
                className={inputClass}
              />
              <label className="block text-xs font-semibold text-slate-600">نص الرؤية</label>
              <textarea
                rows={3}
                value={draft.aboutSection.visionText}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    aboutSection: { ...draft.aboutSection, visionText: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>

            <div className="p-4 rounded-xl bg-[#F0F5FA] border border-[#2C5F8A]/20 space-y-2">
              <label className="block text-xs font-bold text-[#1A3A5C]">عنوان الرسالة</label>
              <input
                type="text"
                value={draft.aboutSection.missionTitle}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    aboutSection: { ...draft.aboutSection, missionTitle: e.target.value },
                  })
                }
                className={inputClass}
              />
              <label className="block text-xs font-semibold text-slate-600">نص الرسالة</label>
              <textarea
                rows={3}
                value={draft.aboutSection.missionText}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    aboutSection: { ...draft.aboutSection, missionText: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان النص فوق صورة «من نحن»</label>
              <input
                type="text"
                value={draft.aboutSection.imageCaptionTitle}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    aboutSection: { ...draft.aboutSection, imageCaptionTitle: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">وصف النص فوق صورة «من نحن»</label>
              <input
                type="text"
                value={draft.aboutSection.imageCaptionText}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    aboutSection: { ...draft.aboutSection, imageCaptionText: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Values Editor */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#1A3A5C]">القيم المؤسسية</h2>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...draft,
                  aboutSection: {
                    ...draft.aboutSection,
                    values: [...draft.aboutSection.values, { title: 'قيمة جديدة', desc: 'وصف القيمة...' }],
                  },
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2C5F8A] bg-[#F0F5FA] rounded-lg hover:bg-[#E2ECF6]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة قيمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draft.aboutSection.values.map((val, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C5F8A]">القيمة {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...draft,
                        aboutSection: {
                          ...draft.aboutSection,
                          values: draft.aboutSection.values.filter((_, i) => i !== idx),
                        },
                      })
                    }
                    className="text-slate-400 hover:text-rose-600"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={val.title}
                  onChange={(e) => {
                    const next = [...draft.aboutSection.values];
                    next[idx] = { ...val, title: e.target.value };
                    onChange({ ...draft, aboutSection: { ...draft.aboutSection, values: next } });
                  }}
                  placeholder="اسم القيمة"
                  className={inputClass}
                />
                <textarea
                  rows={2}
                  value={val.desc}
                  onChange={(e) => {
                    const next = [...draft.aboutSection.values];
                    next[idx] = { ...val, desc: e.target.value };
                    onChange({ ...draft, aboutSection: { ...draft.aboutSection, values: next } });
                  }}
                  placeholder="وصف القيمة"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Direct Contact Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          بيانات الاتصال والمقر الرسمي
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف للاتصال</label>
            <input
              type="text"
              dir="ltr"
              value={draft.contact.phone}
              onChange={(e) =>
                onChange({ ...draft, contact: { ...draft.contact, phone: e.target.value } })
              }
              className={`${inputClass} text-left font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الواتساب (مع المفتاح الدولي)</label>
            <input
              type="text"
              dir="ltr"
              value={draft.contact.whatsappNumber}
              onChange={(e) =>
                onChange({ ...draft, contact: { ...draft.contact, whatsappNumber: e.target.value } })
              }
              className={`${inputClass} text-left font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني الرسمي</label>
            <input
              type="email"
              dir="ltr"
              value={draft.contact.email}
              onChange={(e) =>
                onChange({ ...draft, contact: { ...draft.contact, email: e.target.value } })
              }
              className={`${inputClass} text-left font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان المقر الرسمي</label>
            <input
              type="text"
              value={draft.contact.headquarters}
              onChange={(e) =>
                onChange({ ...draft, contact: { ...draft.contact, headquarters: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ساعات العمل</label>
            <input
              type="text"
              value={draft.contact.workingHours}
              onChange={(e) =>
                onChange({ ...draft, contact: { ...draft.contact, workingHours: e.target.value } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص إحداثيات الخريطة</label>
            <input
              type="text"
              dir="ltr"
              value={draft.contact.mapCoordinatesLabel}
              onChange={(e) =>
                onChange({
                  ...draft,
                  contact: { ...draft.contact, mapCoordinatesLabel: e.target.value },
                })
              }
              className={`${inputClass} text-left font-mono`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">استعلام البحث في خرائط Google</label>
          <input
            type="text"
            dir="ltr"
            value={draft.contact.mapQuery}
            onChange={(e) =>
              onChange({ ...draft, contact: { ...draft.contact, mapQuery: e.target.value } })
            }
            className={`${inputClass} text-left font-mono`}
          />
        </div>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان قسم اتصل بنا</label>
            <input
              type="text"
              value={draft.contactSection.headline}
              onChange={(e) =>
                onChange({
                  ...draft,
                  contactSection: { ...draft.contactSection, headline: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان بطاقة الخريطة</label>
            <input
              type="text"
              value={draft.contactSection.mapCardHeadline}
              onChange={(e) =>
                onChange({
                  ...draft,
                  contactSection: { ...draft.contactSection, mapCardHeadline: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          حسابات التواصل الاجتماعي
        </h2>

        {(
          [
            { key: 'instagram', label: 'Instagram' },
            { key: 'facebook', label: 'Facebook' },
            { key: 'x', label: 'X (Twitter)' },
            { key: 'linkedin', label: 'LinkedIn' },
            { key: 'youtube', label: 'YouTube' },
          ] as const
        ).map(({ key, label }) => (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-3 rounded-lg bg-[#F7F9FC] border border-slate-200/70">
            <div className="text-xs font-bold text-[#1A3A5C]">{label}</div>
            <div>
              <input
                type="text"
                dir="ltr"
                value={draft.contact.socials[key].handle}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    contact: {
                      ...draft.contact,
                      socials: {
                        ...draft.contact.socials,
                        [key]: { ...draft.contact.socials[key], handle: e.target.value },
                      },
                    },
                  })
                }
                placeholder="اسم الحساب"
                className={`${inputClass} text-left`}
              />
            </div>
            <div>
              <input
                type="url"
                dir="ltr"
                value={draft.contact.socials[key].url}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    contact: {
                      ...draft.contact,
                      socials: {
                        ...draft.contact.socials,
                        [key]: { ...draft.contact.socials[key], url: e.target.value },
                      },
                    },
                  })
                }
                placeholder="https://..."
                className={`${inputClass} text-left font-mono`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
