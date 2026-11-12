import React from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { X, ShieldCheck, Lock, FileCheck, CheckCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { content } = useSiteContent();
  if (!isOpen) return null;

  const { privacyPolicy, contact } = content;
  const icons = [ShieldCheck, Lock, FileCheck, CheckCircle];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-right animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#F0F5FA] text-[#2C5F8A] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A3A5C]">{privacyPolicy.title}</h3>
              <p className="text-xs text-slate-500">{privacyPolicy.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="إغلاق وثيقة الخصوصية"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto">
          {privacyPolicy.clauses.map((clause, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-100">
                <h4 className="font-bold text-[#1A3A5C] mb-1.5 flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-[#2C5F8A]" />
                  <span>{clause.title}</span>
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">{clause.description}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            البريد الرسمي للاستفسارات القانونية: {contact.email}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg transition-colors"
          >
            فهمت وموافق
          </button>
        </div>
      </div>
    </div>
  );
};
