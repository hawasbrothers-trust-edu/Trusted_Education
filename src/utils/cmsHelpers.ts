import type { SiteContent } from '../types/cms.ts';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/webm',
];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MB

export function isAdminRoutePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '').toLowerCase();
  return normalized === '/authr';
}

export function validateMediaUpload(
  kind: 'image' | 'audio',
  mimeType: string,
  sizeBytes: number
): { valid: boolean; error?: string } {
  const cleanMime = mimeType.toLowerCase().trim();

  if (kind === 'image') {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(cleanMime)) {
      return {
        valid: false,
        error: 'صيغة الصورة غير مدعومة. الصيغ المسموحة: PNG, JPG, WEBP, GIF, SVG.',
      };
    }
    if (sizeBytes > MAX_IMAGE_BYTES) {
      return {
        valid: false,
        error: 'حجم الصورة يتجاوز الحد الأقصى المسموح (10 ميجابايت).',
      };
    }
    return { valid: true };
  }

  if (!ALLOWED_AUDIO_MIME_TYPES.includes(cleanMime)) {
    return {
      valid: false,
      error: 'صيغة الملف الصوتي غير مدعومة. الصيغ المسموحة: MP3, WAV, OGG, M4A, WebM.',
    };
  }
  if (sizeBytes > MAX_AUDIO_BYTES) {
    return {
      valid: false,
      error: 'حجم الملف الصوتي يتجاوز الحد الأقصى المسموح (20 ميجابايت).',
    };
  }
  return { valid: true };
}

export function formatAudioSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function sanitizeUploadFilename(originalName: string): string {
  const parts = originalName.split('.');
  const ext = parts.length > 1 ? parts.pop()!.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : 'bin';
  const base = parts
    .join('-')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'media';
  return `${base}.${ext || 'bin'}`;
}

/**
 * Deep-merge saved partial site content with defaults so newly added fields are always populated
 */
export function mergeSiteContentWithDefaults(
  defaults: SiteContent,
  saved: Partial<SiteContent> | null | undefined
): SiteContent {
  if (!saved || typeof saved !== 'object') return defaults;

  const LEGACY_DEFAULT_LOGO = '/assets/aistudio/trusted-2_977ca46d.png';
  const mergedBrand = { ...defaults.brand, ...(saved.brand || {}) };
  if (!mergedBrand.logoUrl || mergedBrand.logoUrl === LEGACY_DEFAULT_LOGO) {
    mergedBrand.logoUrl = defaults.brand.logoUrl;
  }

  return {
    brand: mergedBrand,
    contact: {
      ...defaults.contact,
      ...(saved.contact || {}),
      socials: {
        ...defaults.contact.socials,
        ...(saved.contact?.socials || {}),
      },
    },
    hero: {
      ...defaults.hero,
      ...(saved.hero || {}),
      trustPoints: Array.isArray(saved.hero?.trustPoints) ? saved.hero.trustPoints : defaults.hero.trustPoints,
    },
    stats: Array.isArray(saved.stats) ? saved.stats : defaults.stats,
    servicesSection: { ...defaults.servicesSection, ...(saved.servicesSection || {}) },
    services: Array.isArray(saved.services) ? saved.services : defaults.services,
    workflowSection: { ...defaults.workflowSection, ...(saved.workflowSection || {}) },
    workflowSteps: Array.isArray(saved.workflowSteps) ? saved.workflowSteps : defaults.workflowSteps,
    aboutSection: {
      ...defaults.aboutSection,
      ...(saved.aboutSection || {}),
      values: Array.isArray(saved.aboutSection?.values) ? saved.aboutSection.values : defaults.aboutSection.values,
    },
    testimonialsSection: { ...defaults.testimonialsSection, ...(saved.testimonialsSection || {}) },
    testimonials: Array.isArray(saved.testimonials) ? saved.testimonials : defaults.testimonials,
    orderFormSection: { ...defaults.orderFormSection, ...(saved.orderFormSection || {}) },
    blogSection: { ...defaults.blogSection, ...(saved.blogSection || {}) },
    articles: Array.isArray(saved.articles) ? saved.articles : defaults.articles,
    faqSection: { ...defaults.faqSection, ...(saved.faqSection || {}) },
    faqs: Array.isArray(saved.faqs) ? saved.faqs : defaults.faqs,
    contactSection: { ...defaults.contactSection, ...(saved.contactSection || {}) },
    privacyPolicy: {
      ...defaults.privacyPolicy,
      ...(saved.privacyPolicy || {}),
      clauses: Array.isArray(saved.privacyPolicy?.clauses)
        ? saved.privacyPolicy.clauses
        : defaults.privacyPolicy.clauses,
    },
    footer: {
      ...defaults.footer,
      ...(saved.footer || {}),
      specialties: Array.isArray(saved.footer?.specialties)
        ? saved.footer.specialties
        : defaults.footer.specialties,
    },
  };
}
