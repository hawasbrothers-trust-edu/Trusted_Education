import type { CloudflareEnv } from './env.ts';
import type { SiteContent, StoredOrder } from '../src/types/cms.ts';
import { DEFAULT_SITE_CONTENT } from '../src/data/defaultSiteContent.ts';
import { mergeSiteContentWithDefaults } from '../src/utils/cmsHelpers.ts';

const SITE_CONTENT_KEY = 'cms:site_content';
const ORDERS_KEY = 'cms:orders';
const ADMIN_PASSWORD_HASH_KEY = 'auth:admin_password_hash';

const SEED_ORDERS: StoredOrder[] = [
  {
    id: 'TR-9102',
    studentName: 'أ. دلال بنت خالد العتيبي',
    phone: '+966501234567',
    email: 'dalal@example.com',
    academicLevel: 'phd',
    serviceId: 'إعداد رسائل الماجستير والدكتوراه',
    specialization: 'إدارة الأعمال والموارد البشرية',
    deadline: '2026-12-30',
    notes: 'تحليل استبيان على عينة من 400 موظف مع استخراج نتائج نموذج SEM.',
    createdAt: '12 نوفمبر 2026، 11:30 ص',
    status: 'قيد التنفيذ',
  },
  {
    id: 'TR-8421',
    studentName: 'المستشار سالم المنصوري',
    phone: '+971509876543',
    email: 'salem@example.com',
    academicLevel: 'master',
    serviceId: 'كتابة رسائل ماجستير في تخصصات القانون',
    specialization: 'القانون التجاري والبحري المقارن',
    deadline: '2026-12-10',
    notes: 'مقارنة بين القانون الإماراتي والمصري وقرارات التحكيم الدولية.',
    createdAt: '11 نوفمبر 2026، 03:15 م',
    status: 'تم التسليم',
  },
];

export async function readSiteContentFromKV(env: CloudflareEnv): Promise<SiteContent> {
  if (!env.CMS_KV) {
    return DEFAULT_SITE_CONTENT;
  }
  try {
    const raw = await env.CMS_KV.get(SITE_CONTENT_KEY);
    if (!raw) {
      return DEFAULT_SITE_CONTENT;
    }
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, parsed);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function writeSiteContentToKV(
  env: CloudflareEnv,
  content: SiteContent
): Promise<void> {
  if (!env.CMS_KV) {
    throw new Error('ربط Cloudflare KV (CMS_KV) غير مهيأ لحفظ محتوى الموقع.');
  }
  await env.CMS_KV.put(SITE_CONTENT_KEY, JSON.stringify(content));
}

export async function readOrdersFromKV(env: CloudflareEnv): Promise<StoredOrder[]> {
  if (!env.CMS_KV) {
    return SEED_ORDERS;
  }
  try {
    const raw = await env.CMS_KV.get(ORDERS_KEY);
    if (raw === null) {
      await env.CMS_KV.put(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredOrder[]) : SEED_ORDERS;
  } catch {
    return SEED_ORDERS;
  }
}

export async function writeOrdersToKV(env: CloudflareEnv, orders: StoredOrder[]): Promise<void> {
  if (!env.CMS_KV) {
    throw new Error('ربط Cloudflare KV (CMS_KV) غير مهيأ لحفظ الطلبات.');
  }
  await env.CMS_KV.put(ORDERS_KEY, JSON.stringify(orders));
}

export async function readAdminPasswordCredential(env: CloudflareEnv): Promise<string> {
  if (env.CMS_KV) {
    const kvHash = await env.CMS_KV.get(ADMIN_PASSWORD_HASH_KEY);
    if (kvHash && kvHash.trim().length > 0) {
      return kvHash.trim();
    }
  }
  if (env.ADMIN_PASSWORD_HASH && env.ADMIN_PASSWORD_HASH.trim().length > 0) {
    return env.ADMIN_PASSWORD_HASH.trim();
  }
  if (env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.trim().length > 0) {
    return env.ADMIN_PASSWORD;
  }
  return '';
}

export async function writeAdminPasswordHashToKV(
  env: CloudflareEnv,
  passwordHash: string
): Promise<void> {
  if (!env.CMS_KV) {
    throw new Error('ربط Cloudflare KV (CMS_KV) غير مهيأ لحفظ كلمة المرور المحدّثة.');
  }
  await env.CMS_KV.put(ADMIN_PASSWORD_HASH_KEY, passwordHash);
}
