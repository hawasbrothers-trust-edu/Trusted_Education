import React, { useState } from 'react';
import type { SiteContent } from '../../types/cms.ts';
import type { AcademicServiceItem } from '../../utils/academicCalculations.ts';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface ServicesEditorProps {
  draft: SiteContent;
  onChange: (next: SiteContent) => void;
}

export const ServicesEditor: React.FC<ServicesEditorProps> = ({ draft, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(draft.services[0]?.id || null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const inputClass =
    'w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors';

  const handleAddService = () => {
    const newId = `service-${Date.now()}`;
    const newItem: AcademicServiceItem = {
      id: newId,
      title: 'خدمة أكاديمية جديدة',
      category: 'research',
      popular: false,
      summary: 'ملخص موجز للخدمة يظهر في البطاقة.',
      description: 'الوصف التفصيلي الكامل لنطاق الخدمة ومخرجاتها.',
      deliverables: ['تسليم ملف Word منسق', 'تعديلات مجانية'],
      keyFeatures: ['إشراف متخصص', 'سرية تامة'],
    };
    onChange({ ...draft, services: [newItem, ...draft.services] });
    setExpandedId(newId);
  };

  const updateService = (idx: number, patch: Partial<AcademicServiceItem>) => {
    const next = [...draft.services];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...draft, services: next });
  };

  return (
    <div className="space-y-6">
      {/* Section Headings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-[#1A3A5C] border-b border-slate-100 pb-3">
          نصوص قسم الخدمات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان القسم</label>
            <input
              type="text"
              value={draft.servicesSection.headline}
              onChange={(e) =>
                onChange({
                  ...draft,
                  servicesSection: { ...draft.servicesSection, headline: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نص زر الاستشارة المخصصة</label>
            <input
              type="text"
              value={draft.servicesSection.customCtaButtonText}
              onChange={(e) =>
                onChange({
                  ...draft,
                  servicesSection: { ...draft.servicesSection, customCtaButtonText: e.target.value },
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
            value={draft.servicesSection.description}
            onChange={(e) =>
              onChange({
                ...draft,
                servicesSection: { ...draft.servicesSection, description: e.target.value },
              })
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Services CRUD List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#1A3A5C]">
            قائمة الخدمات ({draft.services.length} خدمة)
          </h2>
          <button
            type="button"
            onClick={handleAddService}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خدمة جديدة</span>
          </button>
        </div>

        <div className="space-y-3">
          {draft.services.map((service, idx) => {
            const isOpen = expandedId === service.id;
            const isConfirming = confirmDeleteId === service.id;

            return (
              <div key={service.id} className="rounded-xl border border-slate-200/90 overflow-hidden bg-[#F7F9FC]">
                <div className="flex items-center justify-between p-4 bg-white gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : service.id)}
                    className="flex-1 flex items-center gap-3 text-right focus:outline-hidden"
                  >
                    <span className="font-mono text-xs font-bold text-[#2C5F8A]">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="text-sm font-bold text-[#1A3A5C]">{service.title}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 mr-auto" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 mr-auto" />
                    )}
                  </button>

                  {isConfirming ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...draft,
                            services: draft.services.filter((_, i) => i !== idx),
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
                        className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(service.id)}
                      className="mr-3 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      aria-label="حذف الخدمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="p-4 sm:p-5 border-t border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الخدمة</label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => updateService(idx, { title: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">التصنيف</label>
                        <select
                          value={service.category}
                          onChange={(e) =>
                            updateService(idx, {
                              category: e.target.value as AcademicServiceItem['category'],
                            })
                          }
                          className={inputClass}
                        >
                          <option value="theses">رسائل الماجستير والدكتوراه</option>
                          <option value="research">الأبحاث ومشاريع التخرج</option>
                          <option value="writing">الكتابة والتدقيق والصياغة</option>
                          <option value="analysis">التحليل الإحصائي ونسبة الاقتباس</option>
                          <option value="presentation">العروض والتصميم الأكاديمي</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">الملخص القصير</label>
                      <textarea
                        rows={2}
                        value={service.summary}
                        onChange={(e) => updateService(idx, { summary: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف التفصيلي الكامل</label>
                      <textarea
                        rows={3}
                        value={service.description}
                        onChange={(e) => updateService(idx, { description: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        المخرجات المشمولة (كل مخرج في سطر مستقل)
                      </label>
                      <textarea
                        rows={3}
                        value={service.deliverables.join('\n')}
                        onChange={(e) =>
                          updateService(idx, {
                            deliverables: e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(service.popular)}
                        onChange={(e) => updateService(idx, { popular: e.target.checked })}
                        className="rounded border-slate-300 text-[#2C5F8A]"
                      />
                      <span>تمييز كـ «خدمة مميزة وأكثر طلباً»</span>
                    </label>
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
