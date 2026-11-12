import React, { useState } from 'react';
import type { SiteContent, TestimonialItem } from '../../types/cms.ts';
import { MediaUploaderField } from './MediaUploaderField.tsx';
import { Plus, Trash2, ChevronDown, ChevronUp, Volume2, Star } from 'lucide-react';

interface TestimonialsEditorProps {
  draft: SiteContent;
  onChange: (next: SiteContent) => void;
  authToken: string | null;
}

export const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({
  draft,
  onChange,
  authToken,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(draft.testimonials[0]?.id || null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const inputClass =
    'w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors';

  const handleAddTestimonial = () => {
    const newId = `t-${Date.now()}`;
    const newItem: TestimonialItem = {
      id: newId,
      name: 'باحث / باحثة جديدة',
      role: 'ماجستير',
      university: 'الجامعة',
      country: 'السعودية',
      feedback: 'شهادة الباحث وتجربته مع خدمات شركة Trusted...',
      hasAudio: false,
      audioUrl: '',
      audioDuration: '0:00',
      avatarUrl: '',
      rating: 5,
    };
    onChange({ ...draft, testimonials: [newItem, ...draft.testimonials] });
    setExpandedId(newId);
  };

  const updateItem = (idx: number, patch: Partial<TestimonialItem>) => {
    const next = [...draft.testimonials];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...draft, testimonials: next });
  };

  return (
    <div className="space-y-6">
      {/* Section Heading Texts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          نصوص قسم آراء العملاء والباحثين
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الفرعي الأيمن</label>
            <input
              type="text"
              value={draft.testimonialsSection.kickerLeft}
              onChange={(e) =>
                onChange({
                  ...draft,
                  testimonialsSection: { ...draft.testimonialsSection, kickerLeft: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الفرعي الأيسر</label>
            <input
              type="text"
              value={draft.testimonialsSection.kickerRight}
              onChange={(e) =>
                onChange({
                  ...draft,
                  testimonialsSection: { ...draft.testimonialsSection, kickerRight: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الرئيسي للقسم</label>
          <input
            type="text"
            value={draft.testimonialsSection.headline}
            onChange={(e) =>
              onChange({
                ...draft,
                testimonialsSection: { ...draft.testimonialsSection, headline: e.target.value },
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف</label>
          <textarea
            rows={2}
            value={draft.testimonialsSection.description}
            onChange={(e) =>
              onChange({
                ...draft,
                testimonialsSection: { ...draft.testimonialsSection, description: e.target.value },
              })
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Testimonials List + Audio Manager */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-[#1A3A5C]">
              شهادات الباحثين والمقاطع الصوتية ({draft.testimonials.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              يمكنك إضافة أو تعديل آراء الباحثين ورفع تسجيلات صوتية حقيقية (.mp3, .wav, .ogg, .m4a) أو صور شخصية.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddTestimonial}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رأي عميل جديد</span>
          </button>
        </div>

        <div className="space-y-3">
          {draft.testimonials.map((item, idx) => {
            const isOpen = expandedId === item.id;
            const isConfirming = confirmDeleteId === item.id;

            return (
              <div key={item.id} className="rounded-xl border border-slate-200/90 overflow-hidden bg-[#F7F9FC]">
                <div className="flex items-center justify-between p-4 bg-white gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    className="flex-1 flex items-center gap-3 text-right focus:outline-hidden min-w-0"
                  >
                    <span className="font-mono text-xs font-bold text-[#2C5F8A] shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#1A3A5C] truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.university} {item.country ? `· ${item.country}` : ''}
                      </div>
                    </div>
                    {item.hasAudio && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F0F5FA] text-[#2C5F8A] text-[11px] font-medium shrink-0">
                        <Volume2 className="w-3 h-3" />
                        <span>{item.audioUrl ? 'صوت مرفوع' : 'صوتي'}</span>
                      </span>
                    )}
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
                            testimonials: draft.testimonials.filter((_, i) => i !== idx),
                          });
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded-md hover:bg-rose-700"
                      >
                        تأكيد الحذف
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                      aria-label="حذف الشهادة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="p-4 sm:p-5 border-t border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الباحث / العميل</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(idx, { name: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">الصفة / الدرجة العلمية</label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => updateItem(idx, { role: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">الجامعة / الجهة</label>
                        <input
                          type="text"
                          value={item.university}
                          onChange={(e) => updateItem(idx, { university: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">الدولة</label>
                        <input
                          type="text"
                          value={item.country}
                          onChange={(e) => updateItem(idx, { country: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">نص الشهادة</label>
                      <textarea
                        rows={3}
                        value={item.feedback}
                        onChange={(e) => updateItem(idx, { feedback: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">التقييم (نجوم)</label>
                        <div className="flex items-center gap-1.5 py-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateItem(idx, { rating: star })}
                              className="p-0.5 focus:outline-hidden"
                              aria-label={`تقييم ${star} نجوم`}
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= (item.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">مدة المقطع الصوتي</label>
                        <input
                          type="text"
                          dir="ltr"
                          value={item.audioDuration}
                          onChange={(e) => updateItem(idx, { audioDuration: e.target.value })}
                          placeholder="0:42"
                          className={`${inputClass} text-left font-mono`}
                        />
                      </div>

                      <div className="pb-2">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.hasAudio}
                            onChange={(e) => updateItem(idx, { hasAudio: e.target.checked })}
                            className="rounded border-slate-300 text-[#2C5F8A]"
                          />
                          <span>تفعيل مشغّل التسجيل الصوتي</span>
                        </label>
                      </div>
                    </div>

                    {/* Real Audio Upload & Player */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3">
                      <MediaUploaderField
                        label="الملف الصوتي لرأي الباحث (MP3 / WAV / OGG / M4A / WebM)"
                        kind="audio"
                        value={item.audioUrl || ''}
                        onChange={(url) =>
                          updateItem(idx, {
                            audioUrl: url,
                            hasAudio: url.trim().length > 0 ? true : item.hasAudio,
                          })
                        }
                        onDurationDetected={(duration) => updateItem(idx, { audioDuration: duration })}
                        authToken={authToken}
                        helperText="عند رفع ملف صوتي أو لصق رابط، سيتم تشغيله مباشرة للزوار في قسم آراء العملاء."
                      />
                    </div>

                    {/* Optional Researcher Avatar */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80">
                      <MediaUploaderField
                        label="صورة الباحث (اختياري)"
                        kind="image"
                        value={item.avatarUrl || ''}
                        onChange={(url) => updateItem(idx, { avatarUrl: url })}
                        authToken={authToken}
                        helperText="تُترك فارغة للاكتفاء بعرض الاسم والجامعة بشكل أنيق أو تُرفع صورة رمزية للباحث."
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
};
