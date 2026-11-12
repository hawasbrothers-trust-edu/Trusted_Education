import React from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { ClipboardCheck, UserCheck, Layers, FileCheck2, Award, ArrowLeft } from 'lucide-react';

interface WorkflowSectionProps {
  onStartOrder: () => void;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({ onStartOrder }) => {
  const { content } = useSiteContent();
  const { workflowSection, workflowSteps } = content;
  const stepIcons = [ClipboardCheck, UserCheck, Layers, FileCheck2, Award];

  return (
    <section id="workflow" className="py-16 sm:py-24 bg-[#F7F9FC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2C5F8A] font-semibold mb-2">
            <span>{workflowSection.kickerLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{workflowSection.kickerRight}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight leading-snug">
            {workflowSection.headline}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {workflowSection.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {workflowSteps.map((step, idx) => {
            const Icon = stepIcons[idx % stepIcons.length] || ClipboardCheck;

            return (
              <div
                key={idx}
                className="relative bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between transition-all hover:border-[#2C5F8A]/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold font-mono text-[#2C5F8A] tabular-nums">
                      {step.stepNumber}.
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-[#F0F5FA] flex items-center justify-center text-[#2C5F8A]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1A3A5C] mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                </div>

                {step.footerNote && (
                  <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                    {step.footerNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onStartOrder}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg shadow-2xs transition-colors"
          >
            <span>{workflowSection.ctaButtonText}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
