import React from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenPrivacyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyModal }) => {
  const { content, navigate } = useSiteContent();
  const { brand, contact, footer, services } = content;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A3A5C] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-700/60">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg">
                <img
                  src={brand.logoUrl}
                  alt={`شعار شركة ${brand.shortName}`}
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-bold text-lg text-white block leading-tight">{brand.name}</span>
                <span className="text-xs text-slate-300 block">شركة تابعة لـ {brand.parentOrg}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              {footer.description}
            </p>

            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2 font-medium">حسابات التواصل الرسمية:</span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={contact.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-[#2C5F8A] text-slate-200 rounded-md transition-colors"
                >
                  Instagram
                </a>
                <a
                  href={contact.socials.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-[#2C5F8A] text-slate-200 rounded-md transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={contact.socials.x.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-[#2C5F8A] text-slate-200 rounded-md transition-colors"
                >
                  X (Twitter)
                </a>
                <a
                  href={contact.socials.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-[#2C5F8A] text-slate-200 rounded-md transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href={contact.socials.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-[#2C5F8A] text-slate-200 rounded-md transition-colors"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">روابط سريعة</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  دليل الخدمات الأكاديمية ({services.length} خدمة)
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  من نحن – الرؤية والرسالة والقيم
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-white transition-colors">
                  كيف نعمل (مراحل التنفيذ)
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  آراء باحثي الخليج والجامعات
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition-colors">
                  المدونة والمقالات المنهجية
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  الأسئلة الشائعة والضمانات
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">{footer.specialtiesTitle}</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {footer.specialties.map((spec, idx) => (
                <li key={idx}>{spec}</li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">بيانات المقر والتواصل</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A86C] shrink-0 mt-0.5" />
                <span>{contact.headquarters}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${contact.phone}`} className="hover:text-white font-mono" dir="ltr">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2C5F8A] shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-white font-mono">
                  {contact.email}
                </a>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenPrivacyModal}
                  className="text-xs text-[#C9A86C] hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>سياسة الخصوصية وحماية الملكية الفكرية</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {currentYear} — {footer.copyrightText}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="hover:text-slate-200 transition-colors"
            >
              ميثاق السرية
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="/authr"
              onClick={(e) => {
                e.preventDefault();
                navigate('/authr');
              }}
              className="hover:text-slate-200 transition-colors"
            >
              لوحة التحكم
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
