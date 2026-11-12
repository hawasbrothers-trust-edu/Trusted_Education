import React from 'react';
import { AcademicServiceItem, calculateEstimatedTimeline, formatWhatsAppUrl } from '../utils/academicCalculations.ts';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { X, CheckCircle, Clock, ShieldCheck, ArrowLeft, MessageCircle } from 'lucide-react';

interface ServiceDetailModalProps {
  service: AcademicServiceItem | null;
  onClose: () => void;
  onOrderNow: (service: AcademicServiceItem) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onOrderNow,
}) => {
  const { content } = useSiteContent();
  if (!service) return null;

  const timeline = calculateEstimatedTimeline(service.title, 'master');

  const whatsappInquiryUrl = formatWhatsAppUrl(
    content.contact.whatsappNumber,
    `السلام عليكم، أود الاستفسار تفصيلياً عن خدمة "${service.title}" ومعرفة التكلفة والجدول الزمني.`
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-100 text-right animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#2C5F8A] font-semibold mb-1">
              <span>{content.brand.shortName} الأكاديمية</span>
              <span aria-hidden="true">·</span>
              <span>{content.brand.parentOrg}</span>
            </div>
            <h3 id="modal-title" className="text-xl sm:text-2xl font-bold text-[#1A3A5C]">
              {service.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-6 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">وصف ونطاق الخدمة:</h4>
            <p className="text-slate-600 leading-relaxed">{service.description}</p>
          </div>

          <div className="bg-[#F7F9FC] p-4 rounded-xl border border-slate-100">
            <h4 className="font-semibold text-[#1A3A5C] mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#2C5F8A]" />
              <span>المخرجات والميزات المشمولة في هذه الخدمة:</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {service.deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700">
                  <span className="text-[#2C5F8A] font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100/80 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900 block">الوقت المتوقع للإنجاز:</span>
                <span className="text-amber-800">
                  ما بين {timeline.minDays} إلى {timeline.maxDays} يوماً (مع خيارات الإنجاز المستعجل عند الحاجة).
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-900 block">ضمان {content.brand.shortName} المعتمد:</span>
                <span className="text-emerald-800">
                  تعديلات مجانية غير محدودة وفق متطلبات المشرف وفحص Turnitin مجاني.
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">المراحل التنفيذية للخدمة:</h4>
            <div className="space-y-1.5">
              {timeline.stages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-[#F0F5FA] text-[#2C5F8A] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>استفسار واتساب مباشر</span>
          </a>

          <button
            type="button"
            onClick={() => onOrderNow(service)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg transition-colors shadow-2xs"
          >
            <span>طلب الخدمة وتحديد التفاصيل</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
