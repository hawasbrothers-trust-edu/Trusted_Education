import React, { useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { formatWhatsAppUrl } from '../utils/academicCalculations.ts';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { content } = useSiteContent();
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = formatWhatsAppUrl(
    content.contact.whatsappNumber,
    `السلام عليكم، أرغب في الاستفسار عن استشارة أكاديمية وبحثية مع شركة ${content.brand.shortName}.`
  );

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2">
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-200/90 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="font-medium">مستشار أكاديمي متاح الآن عبر واتساب</span>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 ml-1"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`تواصل فوري عبر واتساب مع المستشار الأكاديمي (${content.contact.whatsappNumber})`}
        className="group flex items-center gap-2 px-3.5 sm:px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <MessageCircle className="w-5 h-5 shrink-0" />
        <span className="hidden sm:inline font-bold">محادثة واتساب سريعة</span>
      </a>
    </div>
  );
};
