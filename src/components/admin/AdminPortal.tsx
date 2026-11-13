import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, PRIMARY_ADMIN_EMAIL } from '../../firebase.ts';
import { useSiteContent } from '../../context/SiteContentContext.tsx';
import type { SiteContent } from '../../types/cms.ts';
import { AdminLogin } from './AdminLogin.tsx';
import { OrdersManager } from './OrdersManager.tsx';
import { SectionsEditor } from './SectionsEditor.tsx';
import { AboutContactEditor } from './AboutContactEditor.tsx';
import { MediaLibraryEditor } from './MediaLibraryEditor.tsx';
import { ServicesEditor } from './ServicesEditor.tsx';
import { TestimonialsEditor } from './TestimonialsEditor.tsx';
import { BlogFaqEditor } from './BlogFaqEditor.tsx';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Building2,
  Phone,
  Image as ImageIcon,
  MessageSquareQuote,
  BookOpen,
  HelpCircle,
  Save,
  RotateCcw,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Menu,
  X,
  KeyRound,
} from 'lucide-react';

type AdminTab =
  | 'orders'
  | 'sections'
  | 'services'
  | 'about'
  | 'contact'
  | 'media'
  | 'testimonials'
  | 'blog'
  | 'faq';

const SESSION_STORAGE_KEY = 'trusted_admin_token';

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'orders', label: 'الطلبات والاستشارات', icon: LayoutDashboard },
  { id: 'sections', label: 'نصوص الواجهة والأقسام', icon: FileText },
  { id: 'services', label: 'الخدمات الأكاديمية', icon: Briefcase },
  { id: 'about', label: 'من نحن والرؤية والقيم', icon: Building2 },
  { id: 'contact', label: 'بيانات الاتصال والتواصل', icon: Phone },
  { id: 'media', label: 'الصور والشعار الرسمي', icon: ImageIcon },
  { id: 'testimonials', label: 'آراء الباحثين والصوتيات', icon: MessageSquareQuote },
  { id: 'blog', label: 'المدونة والمقالات', icon: BookOpen },
  { id: 'faq', label: 'الأسئلة الشائعة والخصوصية', icon: HelpCircle },
];

export const AdminPortal: React.FC = () => {
  const {
    content,
    navigate,
    saveContent,
    resetContent,
    firebaseUser,
    isFirebaseAuthReady,
    signOutFirebase,
  } = useSiteContent();
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [unauthorizedGoogleEmail, setUnauthorizedGoogleEmail] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [draft, setDraft] = useState<SiteContent>(content);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync draft when server content loads and user hasn't edited yet
  useEffect(() => {
    if (!isDirty) {
      setDraft(content);
    }
  }, [content, isDirty]);

  // Verify Firebase Auth admin role OR existing server session token/cookie
  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      if (!isFirebaseAuthReady) return;

      if (firebaseUser) {
        const emailLower = (firebaseUser.email || '').trim().toLowerCase();
        let isAuthorizedAdmin =
          firebaseUser.emailVerified && emailLower === PRIMARY_ADMIN_EMAIL;

        if (!isAuthorizedAdmin && firebaseUser.emailVerified) {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
            if (adminSnap.exists()) {
              isAuthorizedAdmin = true;
            }
          } catch {
            // Not an admin
          }
        }

        if (!active) return;
        if (isAuthorizedAdmin) {
          setUnauthorizedGoogleEmail(null);
          setIsAuthenticated(true);
          setAuthEmail(firebaseUser.email || emailLower);
        } else {
          setUnauthorizedGoogleEmail(firebaseUser.email || 'حساب غير مصرح');
          setIsAuthenticated(false);
        }
        setIsCheckingAuth(false);
        return;
      }

      setUnauthorizedGoogleEmail(null);

      try {
        const res = await fetch('/api/auth/session', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          credentials: 'include',
          cache: 'no-store',
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          if (active) setIsAuthenticated(false);
          return;
        }
        const data = (await res.json()) as { authenticated?: boolean; email?: string };
        if (!active) return;
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAuthEmail(data.email || null);
        } else {
          setIsAuthenticated(false);
          setAuthToken(null);
          try {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      } catch {
        if (active) setIsAuthenticated(false);
      } finally {
        if (active) setIsCheckingAuth(false);
      }
    };
    checkSession();
    return () => {
      active = false;
    };
  }, [authToken, firebaseUser, isFirebaseAuthReady]);

  const handleLoginSuccess = (email: string, token: string) => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    } catch {
      // ignore
    }
    setAuthToken(token);
    setAuthEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOutFirebase();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    setUnauthorizedGoogleEmail(null);
    setAuthToken(null);
    setAuthEmail(null);
    setIsAuthenticated(false);
  };

  const handleDraftChange = (next: SiteContent) => {
    setDraft(next);
    setIsDirty(true);
    if (feedback) setFeedback(null);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setFeedback(null);
    const result = await saveContent(draft, authToken);
    setIsSaving(false);

    if (result.ok) {
      setIsDirty(false);
      setFeedback({ type: 'success', message: 'تم حفظ ونشر كافة التغييرات على الموقع بنجاح.' });
    } else {
      setFeedback({ type: 'error', message: result.error || 'تعذر حفظ التعديلات.' });
    }
  };

  const handleResetDefaults = async () => {
    setConfirmReset(false);
    setIsResetting(true);
    setFeedback(null);
    const result = await resetContent(authToken);
    setIsResetting(false);

    if (result.ok) {
      setIsDirty(false);
      setFeedback({ type: 'success', message: 'تمت استعادة الإعدادات والمحتوى الافتراضي للموقع.' });
    } else {
      setFeedback({ type: 'error', message: result.error || 'تعذر استعادة الافتراضي.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword || newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) {
        setPasswordStatus({
          type: 'error',
          message: data.error || 'تعذر تحديث كلمة المرور.',
        });
      } else {
        setPasswordStatus({
          type: 'success',
          message: data.message || 'تم تحديث كلمة المرور بنجاح.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch {
      setPasswordStatus({
        type: 'error',
        message: 'تعذر الاتصال بالخادم لتحديث كلمة المرور.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isCheckingAuth || !isFirebaseAuthReady) {
    return (
      <div className="min-h-screen bg-[#F0F5FA] flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-7 h-7 animate-spin text-[#2C5F8A]" />
        <span className="text-xs font-medium">جاري التحقق من جلسة الإدارة...</span>
      </div>
    );
  }

  if (unauthorizedGoogleEmail) {
    return (
      <div className="min-h-screen bg-[#F0F5FA] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-rose-200 shadow-sm p-7 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-extrabold text-[#1A3A5C]">حساب Google غير مخوّل للإدارة</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            الحساب المسجّل حالياً (<span dir="ltr" className="font-mono font-semibold">{unauthorizedGoogleEmail}</span>) لا يملك صلاحية الوصول إلى لوحة تحكم Trusted. يرجى تسجيل الدخول بحساب المسؤول المعتمد.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg transition-colors"
            >
              تبديل الحساب / تسجيل الخروج
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              العودة للموقع
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#2D3748] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (RTL Right Side) */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:right-0 bg-white border-l border-slate-200 z-30">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <img
            src={draft.brand.logoUrl}
            alt={draft.brand.shortName}
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-[#1A3A5C] truncate">لوحة تحكم Trusted</div>
            <div className="text-[11px] text-slate-500 truncate" dir="ltr">
              {authEmail || 'admin'}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="أقسام لوحة التحكم">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-right ${
                  active
                    ? 'bg-[#1A3A5C] text-white'
                    : 'text-slate-700 hover:bg-[#F0F5FA] hover:text-[#1A3A5C]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C9A86C]' : 'text-[#2C5F8A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => {
              setPasswordStatus(null);
              setPasswordModalOpen(true);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>تغيير كلمة المرور</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#2C5F8A] bg-[#F0F5FA] hover:bg-[#E2ECF6] rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة الموقع العام</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pr-72 flex flex-col min-w-0">
        {/* Top Action Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                aria-label="قائمة لوحة التحكم"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-[#1A3A5C]">
                  {activeNav.label}
                </h1>
                <p className="text-[11px] text-slate-500">
                  {isDirty ? 'لديك تعديلات غير محفوظة — اضغط «حفظ كافة التغييرات» لنشرها.' : 'كافة التعديلات محدثة ومنشورة.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTab !== 'orders' && (
                <>
                  {confirmReset ? (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <span className="text-[11px] text-amber-800 font-medium">استعادة الافتراضي؟</span>
                      <button
                        type="button"
                        onClick={handleResetDefaults}
                        disabled={isResetting}
                        className="px-2 py-1 text-[11px] font-bold bg-amber-600 text-white rounded-md hover:bg-amber-700"
                      >
                        تأكيد
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      disabled={isResetting}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">استعادة الافتراضي</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg shadow-xs transition-colors disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كافة التغييرات'}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => navigate('/')}
                className="lg:hidden inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#2C5F8A] bg-[#F0F5FA] rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>الموقع</span>
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileNavOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-slate-100 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                      active ? 'bg-[#1A3A5C] text-white' : 'text-slate-700 hover:bg-[#F0F5FA]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setPasswordStatus(null);
                  setPasswordModalOpen(true);
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>تغيير كلمة المرور</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </header>

        {/* Feedback Banner */}
        {feedback && (
          <div className="px-4 sm:px-6 lg:px-8 pt-5">
            <div
              role="status"
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 hover:opacity-70"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Active Tab Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'orders' && (
            <OrdersManager authToken={authToken} brandArabicName={draft.brand.arabicName} />
          )}
          {activeTab === 'sections' && <SectionsEditor draft={draft} onChange={handleDraftChange} />}
          {activeTab === 'services' && <ServicesEditor draft={draft} onChange={handleDraftChange} />}
          {activeTab === 'about' && (
            <AboutContactEditor draft={draft} onChange={handleDraftChange} mode="about" />
          )}
          {activeTab === 'contact' && (
            <AboutContactEditor draft={draft} onChange={handleDraftChange} mode="contact" />
          )}
          {activeTab === 'media' && (
            <MediaLibraryEditor draft={draft} onChange={handleDraftChange} authToken={authToken} />
          )}
          {activeTab === 'testimonials' && (
            <TestimonialsEditor draft={draft} onChange={handleDraftChange} authToken={authToken} />
          )}
          {activeTab === 'blog' && (
            <BlogFaqEditor draft={draft} onChange={handleDraftChange} mode="blog" authToken={authToken} />
          )}
          {activeTab === 'faq' && (
            <BlogFaqEditor draft={draft} onChange={handleDraftChange} mode="faq" authToken={authToken} />
          )}
        </main>
      </div>

      {passwordModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#2C5F8A]" />
                <h2 id="password-modal-title" className="text-sm font-extrabold text-[#1A3A5C]">
                  تغيير كلمة مرور لوحة التحكم
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordStatus && (
                <div
                  role="alert"
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  dir="ltr"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white text-left"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  كلمة المرور الجديدة (8 أحرف على الأقل)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  dir="ltr"
                  minLength={8}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white text-left"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  dir="ltr"
                  minLength={8}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white text-left"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg disabled:opacity-60"
                >
                  {isUpdatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ كلمة المرور</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
