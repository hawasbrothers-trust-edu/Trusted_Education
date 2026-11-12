import React, { useState, useMemo } from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { AcademicServiceItem, filterServices } from '../utils/academicCalculations.ts';
import { Search, CheckCircle2, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: AcademicServiceItem) => void;
  onRequestService: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onRequestService,
}) => {
  const { content } = useSiteContent();
  const { servicesSection, services } = content;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: `كافة الخدمات (${services.length})` },
    { id: 'theses', label: 'رسائل الماجستير والدكتوراه' },
    { id: 'research', label: 'الأبحاث ومشاريع التخرج' },
    { id: 'writing', label: 'الكتابة والتدقيق والصياغة' },
    { id: 'analysis', label: 'التحليل الإحصائي ونسبة الاقتباس' },
    { id: 'presentation', label: 'العروض والتصميم الأكاديمي' },
  ];

  const filteredServices = useMemo(() => {
    return filterServices(services, searchQuery, activeCategory);
  }, [services, searchQuery, activeCategory]);

  return (
    <section id="services" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2C5F8A] font-semibold mb-2">
            <span>{servicesSection.kickerLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{servicesSection.kickerRight}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight leading-snug">
            {servicesSection.headline}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {servicesSection.description}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#1A3A5C] text-white shadow-xs'
                      : 'bg-[#F0F5FA] text-slate-600 hover:text-[#1A3A5C] hover:bg-slate-200/60'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو التخصص (مثال: قانون، SPSS...)"
              className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-[#F7F9FC] rounded-2xl border border-slate-100">
            <p className="text-sm text-slate-600 font-medium">
              لم نعثر على خدمات مطابقة للبحث "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 text-xs text-[#2C5F8A] font-semibold underline"
            >
              عرض كافة الخدمات ({services.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => {
              const displayIndex = String(index + 1).padStart(2, '0');

              return (
                <div
                  key={service.id}
                  className="group flex flex-col justify-between bg-white rounded-xl p-6 border border-slate-200/80 hover:border-[#2C5F8A]/40 hover:shadow-xs transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span className="font-mono font-medium text-slate-400">{displayIndex}.</span>
                      {service.popular && (
                        <span className="text-[11px] font-semibold text-[#2C5F8A]">
                          خدمة مميزة وأكثر طلباً
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#1A3A5C] mb-2.5 group-hover:text-[#2C5F8A] transition-colors leading-snug">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {service.summary}
                    </p>

                    <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100">
                      {service.deliverables.slice(0, 2).map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5F8A] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100/90 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectService(service)}
                      className="text-xs font-semibold text-slate-600 hover:text-[#1A3A5C] py-1.5 transition-colors whitespace-nowrap"
                    >
                      تفاصيل الخدمة والضمانات ←
                    </button>

                    <button
                      type="button"
                      onClick={() => onRequestService(service.title)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-[#2C5F8A] bg-[#F0F5FA] hover:bg-[#2C5F8A] hover:text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      طلب الخدمة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 p-5 rounded-xl bg-[#F7F9FC] border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#C9A86C] shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700">{servicesSection.customCtaText}</p>
          </div>
          <button
            type="button"
            onClick={() => onRequestService('استشارة بحثية مخصصة')}
            className="px-4 py-2 text-xs font-semibold text-[#1A3A5C] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {servicesSection.customCtaButtonText}
          </button>
        </div>
      </div>
    </section>
  );
};
