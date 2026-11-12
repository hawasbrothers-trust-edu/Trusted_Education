import React from 'react';
import type { SiteContent } from '../../types/cms.ts';
import { DEFAULT_SITE_CONTENT } from '../../data/defaultSiteContent.ts';
import { MediaUploaderField } from './MediaUploaderField.tsx';
import { RotateCcw } from 'lucide-react';

interface MediaLibraryEditorProps {
  draft: SiteContent;
  onChange: (next: SiteContent) => void;
  authToken: string | null;
}

export const MediaLibraryEditor: React.FC<MediaLibraryEditorProps> = ({
  draft,
  onChange,
  authToken,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#1A3A5C]">إدارة كافة صور الموقع والشعار</h2>
          <p className="text-xs text-slate-500 mt-1">
            يمكنك رفع صور جديدة مباشرة من جهازك أو استبدال الروابط. (تُدار صور المقالات وصور الباحثين أيضاً من تبويبي المدونة وآراء العملاء).
          </p>
        </div>

        {/* 1. Brand Logo */}
        <div className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A3A5C]">1. شعار الشركة الرسمي (الهيدر والفوتر)</span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...draft,
                  brand: { ...draft.brand, logoUrl: DEFAULT_SITE_CONTENT.brand.logoUrl },
                })
              }
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#2C5F8A]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>استعادة الشعار الأصلي</span>
            </button>
          </div>
          <MediaUploaderField
            label="رابط أو ملف الشعار"
            kind="image"
            value={draft.brand.logoUrl}
            onChange={(url) => onChange({ ...draft, brand: { ...draft.brand, logoUrl: url } })}
            authToken={authToken}
            helperText="يفضل استخدام صورة PNG بخلفية شفافة أو بيضاء."
          />
        </div>

        {/* 2. Hero Banner Image */}
        <div className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A3A5C]">2. صورة القسم الرئيسي (Hero Section)</span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...draft,
                  hero: { ...draft.hero, imageUrl: DEFAULT_SITE_CONTENT.hero.imageUrl },
                })
              }
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#2C5F8A]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>استعادة الصورة الأصلية</span>
            </button>
          </div>
          <MediaUploaderField
            label="رابط أو ملف صورة الواجهة الرئيسية"
            kind="image"
            value={draft.hero.imageUrl}
            onChange={(url) => onChange({ ...draft, hero: { ...draft.hero, imageUrl: url } })}
            authToken={authToken}
            helperText="نسبة أبعاد موصى بها 16:9 أو 4:3 بدقة عالية."
          />
        </div>

        {/* 3. About Advisory Hall Image */}
        <div className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A3A5C]">3. صورة قسم «من نحن» (قاعة الاستشارات)</span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...draft,
                  aboutSection: {
                    ...draft.aboutSection,
                    imageUrl: DEFAULT_SITE_CONTENT.aboutSection.imageUrl,
                  },
                })
              }
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#2C5F8A]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>استعادة الصورة الأصلية</span>
            </button>
          </div>
          <MediaUploaderField
            label="رابط أو ملف صورة قسم من نحن"
            kind="image"
            value={draft.aboutSection.imageUrl}
            onChange={(url) =>
              onChange({
                ...draft,
                aboutSection: { ...draft.aboutSection, imageUrl: url },
              })
            }
            authToken={authToken}
          />
        </div>
      </div>
    </div>
  );
};
