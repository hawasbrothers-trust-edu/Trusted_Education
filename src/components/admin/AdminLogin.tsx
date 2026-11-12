import React, { useState } from 'react';
import { useSiteContent } from '../../context/SiteContentContext.tsx';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { content, navigate } = useSiteContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة السر.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = (await res.json()) as {
        authenticated?: boolean;
        email?: string;
        token?: string;
        error?: string;
      };

      if (!res.ok || !data.authenticated || !data.token) {
        setError(data.error || 'بيانات الدخول غير صحيحة.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(data.email || email.trim(), data.token);
    } catch {
      setError('تعذر الاتصال بخادم التحقق. يرجى التأكد من تشغيل الخادم والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-9">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={content.brand.logoUrl}
            alt={`شعار ${content.brand.shortName}`}
            className="h-14 w-auto object-contain mb-4"
            referrerPolicy="no-referrer"
          />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C5F8A] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>بوابة الإدارة والتحكم بالمحتوى</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A3A5C]">
            تسجيل دخول المسؤول
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {content.brand.arabicName} – {content.brand.parentOrg}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              البريد الإلكتروني (اسم المستخدم)
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors text-left"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              كلمة السر
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors text-left"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg shadow-xs transition-colors disabled:opacity-60"
          >
            {isLoading ? 'جاري التحقق والدخول...' : 'دخول إلى لوحة التحكم'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#1A3A5C] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى الموقع الرئيسي</span>
          </button>
        </div>
      </div>
    </div>
  );
};
