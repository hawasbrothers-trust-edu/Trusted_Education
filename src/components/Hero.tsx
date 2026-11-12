import React from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { formatWhatsAppUrl } from '../utils/academicCalculations.ts';
import { ShieldCheck, GraduationCap, CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react';

interface HeroProps {
  onOpenOrderModal: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenOrderModal, onExploreServices }) => {
  const { content } = useSiteContent();
  const { hero, contact } = content;

  const whatsappUrl = formatWhatsAppUrl(
    contact.whatsappNumber,
    `مرحباً بكم، أرغب في الحصول على استشارة أكاديمية بخصوص دراساتي العليا والبحوث مع شركة ${content.brand.shortName}.`
  );

  return (
    <section
      id="home"
      className="relative pt-6 pb-16 lg:py-20 bg-gradient-to-b from-[#F0F5FA]/60 via-[#F7F9FC] to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Institutional Kicker */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
          <span className="font-semibold text-[#1A3A5C]">{hero.kickerOrg}</span>
          <span aria-hidden="true">·</span>
          <span>{hero.kickerExperience}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#2C5F8A] font-medium">{hero.kickerTagline}</span>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A3A5C] leading-[1.25] sm:leading-[1.2] tracking-tight mb-5"
              style={{ textWrap: 'balance' }}
            >
              {hero.headline}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
              {hero.description}
            </p>

            {/* Core Trust Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs sm:text-sm text-slate-700">
              {hero.trustPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2C5F8A] shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onOpenOrderModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg shadow-sm transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2C5F8A]"
              >
                <span>{hero.primaryCtaText}</span>
                <ArrowLeft className="w-4 h-4 shrink-0" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#1A3A5C] bg-white hover:bg-slate-50 border border-slate-200/90 rounded-lg shadow-2xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{hero.whatsappCtaText}</span>
              </a>

              <button
                type="button"
                onClick={onExploreServices}
                className="text-xs sm:text-sm font-medium text-slate-500 hover:text-[#2C5F8A] py-2 px-2 transition-colors sm:mr-2"
              >
                {hero.exploreCtaText}
              </button>
            </div>

            {/* Regional Trust Proof */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center gap-3 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#C9A86C] shrink-0" />
              <span>{hero.locationNote}</span>
            </div>
          </div>

          {/* Column 2: Visual Asset */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-white group h-full min-h-[340px]">
              <img
                src={hero.imageUrl}
                alt={hero.imageCaptionTitle}
                className="w-full h-80 sm:h-96 lg:h-full max-h-[460px] object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3A5C]/85 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center gap-2 text-xs text-amber-200/90 mb-1 font-medium">
                  <GraduationCap className="w-4 h-4" />
                  <span>{hero.imageCaptionTitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-light leading-snug">
                  {hero.imageCaptionText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
