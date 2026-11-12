import React, { useState, useRef } from 'react';
import { useSiteContent } from '../../context/SiteContentContext.tsx';
import { formatAudioSeconds } from '../../utils/cmsHelpers.ts';
import { Upload, Trash2, Image as ImageIcon, Volume2, AlertCircle, Loader2 } from 'lucide-react';

interface MediaUploaderFieldProps {
  label: string;
  kind: 'image' | 'audio';
  value: string;
  onChange: (newUrl: string) => void;
  onDurationDetected?: (formattedDuration: string) => void;
  authToken: string | null;
  helperText?: string;
}

export const MediaUploaderField: React.FC<MediaUploaderFieldProps> = ({
  label,
  kind,
  value,
  onChange,
  onDurationDetected,
  authToken,
  helperText,
}) => {
  const { uploadMedia } = useSiteContent();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Detect audio duration client-side if audio
    if (kind === 'audio' && onDurationDetected) {
      const objectUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(objectUrl);
      tempAudio.onloadedmetadata = () => {
        if (Number.isFinite(tempAudio.duration)) {
          onDurationDetected(formatAudioSeconds(tempAudio.duration));
        }
        URL.revokeObjectURL(objectUrl);
      };
    }

    const result = await uploadMedia(file, kind, authToken);
    setIsUploading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      onChange(result.url);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-800">{label}</label>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={kind === 'image' ? 'رابط الصورة أو ارفع ملفاً...' : 'رابط الملف الصوتي أو ارفع ملفاً...'}
          dir="ltr"
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white text-left font-mono"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept={kind === 'image' ? 'image/*' : 'audio/*,.mp3,.wav,.ogg,.m4a,.webm'}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1A3A5C] bg-[#F0F5FA] hover:bg-[#E2ECF6] border border-[#2C5F8A]/20 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{isUploading ? 'جاري الرفع...' : kind === 'image' ? 'رفع صورة من الجهاز' : 'رفع ملف صوتي'}</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            title="إزالة الملف"
            aria-label="إزالة الملف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Live Preview */}
      {value && kind === 'image' && (
        <div className="mt-2 p-2 rounded-lg border border-slate-200 bg-[#F7F9FC] inline-flex items-center gap-3">
          <img
            src={value}
            alt="معاينة الصورة"
            className="h-16 w-24 object-cover rounded-md border border-slate-200 bg-white"
            referrerPolicy="no-referrer"
          />
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-[#2C5F8A]" />
            <span className="max-w-[200px] truncate" dir="ltr">
              {value}
            </span>
          </div>
        </div>
      )}

      {value && kind === 'audio' && (
        <div className="mt-2 p-2.5 rounded-lg border border-slate-200 bg-[#F7F9FC] flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#2C5F8A] font-medium shrink-0">
            <Volume2 className="w-4 h-4" />
            <span>معاينة الصوت:</span>
          </div>
          <audio controls src={value} className="h-8 w-full max-w-sm" />
        </div>
      )}
    </div>
  );
};
