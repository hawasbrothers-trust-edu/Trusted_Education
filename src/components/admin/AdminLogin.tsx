import React, { useState } from 'react';
import { useSiteContent } from '../../context/SiteContentContext.tsx';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { content, navigate, signInWithGoogle } = useSiteContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (!result.ok) {
      setError(result.error || 'تعذر تسجيل الدخول عبر حساب Google.');
    }
  };

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

        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 text-sm font-bold text-[#1A3A5C] bg-[#F0F5FA] hover:bg-[#E2ECF6] border border-[#2C5F8A]/25 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>
              {isGoogleLoading ? 'جاري الاتصال بـ Google...' : 'تسجيل الدخول بحساب Google (Firebase)'}
            </span>
          </button>

          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium whitespace-nowrap">
              أو الدخول بالبريد وكلمة السر
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>
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
