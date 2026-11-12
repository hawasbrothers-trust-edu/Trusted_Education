import React from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { Users, Award, BookOpen, CheckCircle } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { content } = useSiteContent();
  const icons = [Users, Award, BookOpen, CheckCircle];

  return (
    <div className="border-y border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {content.stats.map((stat, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="flex flex-col items-start p-3 sm:p-4 rounded-xl transition-colors hover:bg-[#F7F9FC]"
              >
                <div className="flex items-center gap-2 mb-2 text-[#2C5F8A]">
                  <Icon className="w-5 h-5 shrink-0 opacity-80" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1A3A5C] tracking-tight tabular-nums">
                    {stat.value}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-800 leading-snug">
                  {stat.label}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 leading-normal">
                  {stat.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
