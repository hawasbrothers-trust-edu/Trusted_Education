import React from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { formatWhatsAppUrl } from '../utils/academicCalculations.ts';
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink, Shield } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { content } = useSiteContent();
  const { contactSection, contact, brand } = content;

  const whatsappUrl = formatWhatsAppUrl(
    contact.whatsappNumber,
    `السلام عليكم، أرغب في التواصل المباشر مع إدارة شركة ${brand.shortName} للخدمات الطلابية.`
  );

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2C5F8A] font-semibold mb-2">
            <span>{contactSection.kickerLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{contactSection.kickerRight}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight leading-snug">
            {contactSection.headline}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {contactSection.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="p-5 rounded-xl bg-[#F7F9FC] border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-white shadow-2xs flex items-center justify-center text-[#2C5F8A] shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">المقر الرئيسي للشركة:</span>
                <span className="text-sm sm:text-base font-bold text-[#1A3A5C] block">
                  {contact.headquarters}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  (شركة تابعة لـ {brand.parentOrg})
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F9FC] border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-white shadow-2xs flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">الهاتف والواتساب الموحد:</span>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-base sm:text-lg font-bold text-[#1A3A5C] hover:text-[#2C5F8A] transition-colors block font-mono"
                  dir="ltr"
                >
                  {contact.phone}
                </a>
                <div className="mt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>بدء محادثة واتساب فورية الآن</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F9FC] border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-white shadow-2xs flex items-center justify-center text-[#2C5F8A] shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">البريد الإلكتروني الرسمي:</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm sm:text-base font-bold text-[#1A3A5C] hover:text-[#2C5F8A] transition-colors block font-mono"
                  dir="ltr"
                >
                  {contact.email}
                </a>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  مخصص لاستقبال المخططات والملفات والبحوث الرسمية
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/60 bg-white flex items-center gap-3 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-[#2C5F8A] shrink-0" />
              <span>
                <strong>ساعات العمل والاستشارات:</strong> {contact.workingHours}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="bg-[#1A3A5C] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden flex-1 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-2">
                  <Shield className="w-4 h-4" />
                  <span>{contactSection.mapCardBadge}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{contactSection.mapCardHeadline}</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md mb-6">
                  {contactSection.mapCardDescription}
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span className="font-semibold text-white">إحداثيات المقر:</span>
                  <span className="font-mono text-slate-400">{contact.mapCoordinatesLabel}</span>
                </div>
                <div className="h-28 rounded-lg bg-gradient-to-r from-blue-900/60 via-[#1e3a5f] to-slate-900 flex items-center justify-center relative overflow-hidden border border-slate-700/60">
                  <div className="absolute inset-x-0 h-1 bg-sky-500/30 bottom-10"></div>
                  <div className="flex flex-col items-center z-10">
                    <MapPin className="w-6 h-6 text-rose-400 animate-bounce" />
                    <span className="text-[11px] font-bold text-white bg-slate-900/90 px-2.5 py-0.5 rounded-full mt-1 border border-slate-600">
                      شركة {brand.shortName} — {contact.headquarters}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(contact.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>فتح الموقع في خرائط Google</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#2C5F8A] hover:bg-[#336799] rounded-lg transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تنسيق موعد زيارة للمقر</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
