import React from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { Eye, Target, MapPin, Building, Lock } from 'lucide-react';

interface AboutSectionProps {
  onOpenPrivacyModal: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenPrivacyModal }) => {
  const { content } = useSiteContent();
  const { aboutSection, brand, contact } = content;

  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2C5F8A] font-semibold mb-2">
            <span>{aboutSection.kickerLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{aboutSection.kickerRight}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight leading-snug">
            {aboutSection.headline}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {aboutSection.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-16">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-200/80">
              <div className="flex items-center gap-2.5 text-[#1A3A5C] font-bold text-base sm:text-lg mb-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2C5F8A] shadow-2xs">
                  <Eye className="w-4 h-4" />
                </div>
                <span>{aboutSection.visionTitle}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{aboutSection.visionText}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F0F5FA] border border-[#2C5F8A]/20">
              <div className="flex items-center gap-2.5 text-[#1A3A5C] font-bold text-base sm:text-lg mb-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2C5F8A] shadow-2xs">
                  <Target className="w-4 h-4" />
                </div>
                <span>{aboutSection.missionTitle}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{aboutSection.missionText}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#2C5F8A] shrink-0" />
                <span>
                  <strong>الكيان الأم:</strong> {brand.parentOrg}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2C5F8A] shrink-0" />
                <span>
                  <strong>المقر:</strong> {contact.headquarters}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900 group h-full min-h-[340px]">
              <img
                src={aboutSection.imageUrl}
                alt={aboutSection.imageCaptionTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3A5C]/90 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-semibold text-amber-300">
                  {aboutSection.imageCaptionTitle}
                </span>
                <p className="text-xs sm:text-sm text-slate-100 mt-1 leading-snug">
                  {aboutSection.imageCaptionText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A3A5C]">
              {aboutSection.valuesHeadline}
            </h3>
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="text-xs font-semibold text-[#2C5F8A] hover:underline flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ميثاق السرية والخصوصية الأكاديمية ←</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {aboutSection.values.map((val, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#2C5F8A]/40 transition-colors"
              >
                <div className="text-xs font-mono text-[#2C5F8A] font-bold mb-1">
                  {String(idx + 1).padStart(2, '0')}.
                </div>
                <h4 className="text-base font-bold text-[#1A3A5C] mb-1.5">{val.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
