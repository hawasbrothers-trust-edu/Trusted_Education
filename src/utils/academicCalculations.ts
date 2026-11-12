/**
 * Pure academic service helper functions and calculations
 * Decoupled from React UI for deterministic testing and validation
 */

export interface OrderFormPayload {
  studentName: string;
  phone: string;
  email?: string;
  academicLevel: 'bachelor' | 'master' | 'phd' | 'general';
  serviceId: string;
  specialization: string;
  deadline?: string;
  notes?: string;
  countryCode?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface TimelineEstimate {
  minDays: number;
  maxDays: number;
  stagesCount: number;
  stages: string[];
}

export interface AcademicServiceItem {
  id: string;
  title: string;
  category: 'theses' | 'research' | 'writing' | 'analysis' | 'presentation';
  summary: string;
  description: string;
  deliverables: string[];
  keyFeatures: string[];
  popular?: boolean;
}

/**
 * Clean phone number and generate direct WhatsApp link
 */
export function formatWhatsAppUrl(phoneNumber: string, message: string): string {
  // Strip spaces, dashes, parentheses and plus sign
  const cleaned = phoneNumber.replace(/[^\d]/g, '');
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

/**
 * Format structured Arabic WhatsApp order message
 */
export function buildServiceOrderMessage(order: OrderFormPayload, referenceId: string): string {
  const levelNames: Record<string, string> = {
    bachelor: 'مرحلة البكالوريوس / الليسانس',
    master: 'مرحلة الماجستير',
    phd: 'مرحلة الدكتوراه',
    general: 'استشارة عامة / باحث مستقل',
  };

  const lines = [
    `السلام عليكم ورحمة الله وبركاته،`,
    `أرغب في الاستفسار والطلب من *شركة Trusted للخدمات الطلابية والتعليمية*:`,
    ``,
    `📌 *رقم الطلب المرجعي:* #${referenceId}`,
    `👤 *اسم الباحث/ـة:* ${order.studentName.trim()}`,
    `🎓 *المرحلة الدراسية:* ${levelNames[order.academicLevel] || order.academicLevel}`,
    `📚 *الخدمة المطلوبة:* ${order.serviceId}`,
    order.specialization ? `🏛 *التخصص الأكاديمي:* ${order.specialization.trim()}` : '',
    order.deadline ? `⏳ *الموعد النهائي للتسليم:* ${order.deadline}` : '',
    order.notes ? `📝 *تفاصيل إضافية:* ${order.notes.trim()}` : '',
    ``,
    `أرجو إفادتي بخطة العمل والتكلفة والوقت المقدر. شكراً لكم.`,
  ].filter(line => line !== '');

  return lines.join('\n');
}

/**
 * Validate customer order submission
 */
export function validateOrderForm(data: Partial<OrderFormPayload>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.studentName || data.studentName.trim().length < 2) {
    errors.studentName = 'يرجى كتابة الاسم الكريم بالكامل (حرفان على الأقل)';
  }

  if (!data.phone || data.phone.trim().length < 8) {
    errors.phone = 'يرجى إدخال رقم هاتف/واتساب صحيح للتواصل السريع';
  } else {
    const digitsOnly = data.phone.replace(/[^\d]/g, '');
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      errors.phone = 'رقم الهاتف يبدو غير مكتمل، يرجى التحقق من المفتاح الدولي والرقم';
    }
  }

  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }
  }

  if (!data.serviceId || data.serviceId.trim().length === 0) {
    errors.serviceId = 'يرجى اختيار الخدمة المطلوبة';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Estimate working duration based on service and level
 */
export function calculateEstimatedTimeline(
  serviceId: string,
  academicLevel: 'bachelor' | 'master' | 'phd' | 'general'
): TimelineEstimate {
  // Heavy services (full theses)
  if (serviceId.includes('ماجستير') || serviceId.includes('دكتوراه')) {
    if (academicLevel === 'phd') {
      return {
        minDays: 20,
        maxDays: 45,
        stagesCount: 5,
        stages: ['إعداد الخطة واعتمادها', 'جمع المراجع والدراسات السابقة', 'صياغة الإطار النظري', 'المنهجية والتحليل الميداني', 'المراجعة النهائية وفحص الاقتباس'],
      };
    }
    return {
      minDays: 14,
      maxDays: 30,
      stagesCount: 4,
      stages: ['اعتماد خطة البحث والمراجع', 'كتابة الفصول مرحلياً', 'التدقيق اللغوي والأكاديمي', 'فحص الاقتباس والتقرير النهائي'],
    };
  }

  // Intermediate services (Graduation project, proposal, theoretical framework)
  if (
    serviceId.includes('تخرج') ||
    serviceId.includes('خطة') ||
    serviceId.includes('الإطار النظري') ||
    serviceId.includes('إحصائي')
  ) {
    return {
      minDays: 5,
      maxDays: 12,
      stagesCount: 3,
      stages: ['تحديد المتطلبات والأدوات', 'التنفيذ والتحليل العلمي', 'التدقيق والتسليم الأولي والملاحظات'],
    };
  }

  // Rapid services (Plagiarism report, proofreading, paraphrasing, presentation)
  return {
    minDays: 1,
    maxDays: 4,
    stagesCount: 2,
    stages: ['فحص الملفات وتحديد النطاق', 'التنفيذ الدقيق مع تقرير الفحص والتسليم'],
  };
}

/**
 * Filter services by search term and category
 */
export function filterServices(
  services: AcademicServiceItem[],
  searchTerm: string,
  categoryFilter: string
): AcademicServiceItem[] {
  const query = searchTerm.trim().toLowerCase();

  return services.filter(service => {
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    if (!matchesCategory) return false;

    if (!query) return true;

    return (
      service.title.toLowerCase().includes(query) ||
      service.summary.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.deliverables.some(d => d.toLowerCase().includes(query)) ||
      service.keyFeatures.some(f => f.toLowerCase().includes(query))
    );
  });
}
