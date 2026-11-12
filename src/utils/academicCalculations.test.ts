import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatWhatsAppUrl,
  buildServiceOrderMessage,
  validateOrderForm,
  calculateEstimatedTimeline,
  filterServices,
  type AcademicServiceItem,
} from './academicCalculations.ts';

test('formatWhatsAppUrl strips non-digits and encodes arabic message correctly', () => {
  const url = formatWhatsAppUrl('+20 114 246 4520', 'السلام عليكم أرغب في طلب خدمة');
  assert.match(url, /^https:\/\/wa\.me\/201142464520\?text=/);
  assert.ok(url.includes('%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85'));
});

test('buildServiceOrderMessage produces clean formatted message with reference ID', () => {
  const msg = buildServiceOrderMessage(
    {
      studentName: 'عبدالرحمن الشمري',
      phone: '+966501234567',
      academicLevel: 'master',
      serviceId: 'إعداد رسائل الماجستير والدكتوراه',
      specialization: 'إدارة الأعمال الدولية',
      deadline: '2026-12-15',
      notes: 'أحتاج التركيز على منهجية البحث والدراسات السابقة الحديثة',
    },
    'TR-8821'
  );

  assert.ok(msg.includes('#TR-8821'));
  assert.ok(msg.includes('عبدالرحمن الشمري'));
  assert.ok(msg.includes('مرحلة الماجستير'));
  assert.ok(msg.includes('إدارة الأعمال الدولية'));
  assert.ok(msg.includes('2026-12-15'));
});

test('validateOrderForm catches missing required fields and invalid formats', () => {
  const invalid = validateOrderForm({
    studentName: '',
    phone: '123',
    serviceId: '',
    email: 'not-an-email',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.studentName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.serviceId);
  assert.ok(invalid.errors.email);

  const valid = validateOrderForm({
    studentName: 'د. خالد بن سلطان',
    phone: '+966551234567',
    serviceId: 'التحليل الإحصائي',
    email: 'khaled@example.com',
  });

  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('calculateEstimatedTimeline gives proper duration for thesis vs quick proofreading', () => {
  const thesisTimeline = calculateEstimatedTimeline('إعداد رسائل الماجستير والدكتوراه', 'phd');
  assert.ok(thesisTimeline.minDays >= 20);
  assert.equal(thesisTimeline.stagesCount, 5);

  const rapidTimeline = calculateEstimatedTimeline('التدقيق اللغوي', 'master');
  assert.ok(rapidTimeline.minDays <= 2);
  assert.equal(rapidTimeline.stagesCount, 2);
});

test('filterServices filters accurately by search keyword and category', () => {
  const mockServices: AcademicServiceItem[] = [
    {
      id: 'thesis-law',
      title: 'كتابة رسائل ماجستير في تخصصات القانون',
      category: 'theses',
      summary: 'صياغة أطروحات قانونية رصينة',
      description: 'إشراف كبار أساتذة القانون العام والخاص',
      deliverables: ['صياغة الدفوع والنصوص القانونية'],
      keyFeatures: ['توثيق الأحكام القضائية'],
    },
    {
      id: 'spss-analysis',
      title: 'التحليل الإحصائي',
      category: 'analysis',
      summary: 'تحليل دقيق لبيانات الاستبيان عبر SPSS و SmartPLS',
      description: 'استخراج الجداول واختبار الفرضيات',
      deliverables: ['جداول إحصائية وتفسير النتائج'],
      keyFeatures: ['دقة عالية وفق APA 7'],
    },
  ];

  const lawResult = filterServices(mockServices, 'قانون', 'all');
  assert.equal(lawResult.length, 1);
  assert.equal(lawResult[0].id, 'thesis-law');

  const categoryFiltered = filterServices(mockServices, '', 'analysis');
  assert.equal(categoryFiltered.length, 1);
  assert.equal(categoryFiltered[0].id, 'spss-analysis');
});
