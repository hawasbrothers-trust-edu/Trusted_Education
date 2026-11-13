import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import {
  OrderFormPayload,
  validateOrderForm,
  calculateEstimatedTimeline,
  buildServiceOrderMessage,
  formatWhatsAppUrl,
} from '../utils/academicCalculations.ts';
import { doc, setDoc } from 'firebase/firestore';
import {
  db,
  OperationType,
  handleFirestoreError,
  buildFirestoreOrderPayload,
} from '../firebase.ts';
import { Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';

interface OrderFormSectionProps {
  preselectedService?: string;
}

export const OrderFormSection: React.FC<OrderFormSectionProps> = ({ preselectedService }) => {
  const { content } = useSiteContent();
  const { orderFormSection, services, contact } = content;

  const [formData, setFormData] = useState<OrderFormPayload>({
    studentName: '',
    phone: '',
    email: '',
    academicLevel: 'master',
    serviceId: preselectedService || services[0]?.title || 'إعداد رسائل الماجستير والدكتوراه',
    specialization: '',
    deadline: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<{ id: string; whatsappUrl: string } | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, serviceId: preselectedService }));
    }
  }, [preselectedService]);

  const timeline = calculateEstimatedTimeline(formData.serviceId, formData.academicLevel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateOrderForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const referenceId = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const payload = {
      ...formData,
      id: referenceId,
      createdAt,
      status: 'جديد',
    };

    try {
      const firestoreOrder = buildFirestoreOrderPayload(referenceId, formData, createdAt);
      await setDoc(doc(db, 'orders', referenceId), firestoreOrder);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `orders/${referenceId}`);
      } catch {
        // Continue to server API / local fallback if Firestore unavailable
      }
    }

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback local store if server unavailable
      try {
        const existing = localStorage.getItem('trusted_orders');
        const orders = existing ? JSON.parse(existing) : [];
        orders.unshift(payload);
        localStorage.setItem('trusted_orders', JSON.stringify(orders));
      } catch {
        // ignore
      }
    }

    const message = buildServiceOrderMessage(formData, referenceId);
    const whatsappUrl = formatWhatsAppUrl(contact.whatsappNumber, message);

    setIsSubmitting(false);
    setSubmittedOrder({ id: referenceId, whatsappUrl });
  };

  return (
    <section id="order-form" className="py-16 sm:py-24 bg-[#F0F5FA]/50 border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#2C5F8A] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{orderFormSection.kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3A5C] tracking-tight">
            {orderFormSection.headline}
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600">{orderFormSection.description}</p>
        </div>

        {submittedOrder ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-emerald-200/80 shadow-md text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs text-slate-500 font-mono">
              رقم طلبك المرجعي: #{submittedOrder.id}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A3A5C] mt-1 mb-3">
              تم استلام طلبك بنجاح وسرية تامة!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
              تم تسجيل استشارتك في نظام شركة {content.brand.shortName} الأكاديمي. يمكنك الآن تسريع التواصل وفتح محادثة مباشرة وفورية مع المستشار عبر واتساب لمناقشة التفاصيل.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={submittedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إرسال التفاصيل الآن عبر واتساب ({contact.whatsappNumber})</span>
              </a>

              <button
                type="button"
                onClick={() => setSubmittedOrder(null)}
                className="w-full sm:w-auto px-5 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                تقديم طلب آخر
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-xs"
            noValidate
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="studentName" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  الاسم الكريم بالكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="مثال: د. عبدالرحمن الشهري"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:bg-white transition-colors ${
                    errors.studentName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#2C5F8A]'
                  }`}
                />
                {errors.studentName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.studentName}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  رقم الهاتف / واتساب (مع المفتاح الدولي) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={`مثال: +966501234567 أو ${contact.whatsappNumber}`}
                  dir="ltr"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:bg-white transition-colors text-right ${
                    errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#2C5F8A]'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="academicLevel" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  المرحلة الدراسية والأكاديمية
                </label>
                <select
                  id="academicLevel"
                  value={formData.academicLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicLevel: e.target.value as 'bachelor' | 'master' | 'phd' | 'general',
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors"
                >
                  <option value="master">مرحلة الماجستير (أطروحة / بحث تكميلي)</option>
                  <option value="phd">مرحلة الدكتوراه (أطروحة دكتوراه)</option>
                  <option value="bachelor">مرحلة البكالوريوس / الليسانس (مشروع تخرج / بحث تخرج)</option>
                  <option value="general">استشارة بحثية عامة / ترقية علمية</option>
                </select>
              </div>

              <div>
                <label htmlFor="serviceId" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  الخدمة المطلوبة <span className="text-rose-500">*</span>
                </label>
                <select
                  id="serviceId"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="خدمة أخرى مخصصة">خدمة بحثية أخرى غير مدرجة</option>
                </select>
              </div>

              <div>
                <label htmlFor="specialization" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  التخصص والجامعة (اختياري)
                </label>
                <input
                  type="text"
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="مثال: قانون خاص – جامعة القاهرة / إدارة أعمال"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  الموعد التقريبي المطلوب للتسليم
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                تفاصيل إضافية أو ملاحظات خاصة بموضوع البحث
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="اكتب هنا عنوان البحث، أو خطة العمل المبدئية، أو أي شروط خاصة بالمشرف..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-[#F7F9FC] text-slate-900 focus:outline-hidden focus:border-[#2C5F8A] focus:bg-white transition-colors"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-slate-200/80 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-[#2C5F8A] shrink-0" />
                <span>
                  <strong>المدة التقديرية للإنجاز:</strong> بين {timeline.minDays} و {timeline.maxDays} يوماً (مع إمكانية التسليم المستعجل).
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ضمان سرية 100% وتعديلات مجانية غير محدودة</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">{orderFormSection.submitNote}</p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg shadow-sm transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الطلب...</span>
                ) : (
                  <>
                    <span>{orderFormSection.submitButtonText}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
