import type { AcademicServiceItem, OrderFormPayload } from '../utils/academicCalculations.ts';

export interface StatItem {
  value: string;
  label: string;
  sublabel: string;
}

export interface ValueItem {
  title: string;
  desc: string;
}

export interface WorkflowStepItem {
  stepNumber: string;
  title: string;
  description: string;
  footerNote: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  university: string;
  country: string;
  feedback: string;
  hasAudio: boolean;
  audioUrl?: string;
  audioDuration: string;
  avatarUrl?: string;
  rating: number;
}

export interface ArticleItem {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PrivacyClauseItem {
  title: string;
  description: string;
}

export interface SocialLinkItem {
  handle: string;
  url: string;
}

export interface SiteContent {
  brand: {
    name: string;
    arabicName: string;
    shortName: string;
    subtitle: string;
    parentOrg: string;
    logoUrl: string;
    headerCtaText: string;
    headerWhatsappText: string;
  };
  contact: {
    headquarters: string;
    phone: string;
    whatsappNumber: string;
    email: string;
    workingHours: string;
    mapCoordinatesLabel: string;
    mapQuery: string;
    socials: {
      instagram: SocialLinkItem;
      facebook: SocialLinkItem;
      x: SocialLinkItem;
      linkedin: SocialLinkItem;
      youtube: SocialLinkItem;
    };
  };
  hero: {
    kickerOrg: string;
    kickerExperience: string;
    kickerTagline: string;
    headline: string;
    description: string;
    trustPoints: string[];
    primaryCtaText: string;
    whatsappCtaText: string;
    exploreCtaText: string;
    locationNote: string;
    imageUrl: string;
    imageCaptionTitle: string;
    imageCaptionText: string;
  };
  stats: StatItem[];
  servicesSection: {
    kickerLeft: string;
    kickerRight: string;
    headline: string;
    description: string;
    customCtaText: string;
    customCtaButtonText: string;
  };
  services: AcademicServiceItem[];
  workflowSection: {
    kickerLeft: string;
    kickerRight: string;
    headline: string;
    description: string;
    ctaButtonText: string;
  };
  workflowSteps: WorkflowStepItem[];
  aboutSection: {
    kickerLeft: string;
    kickerRight: string;
    headline: string;
    description: string;
    visionTitle: string;
    visionText: string;
    missionTitle: string;
    missionText: string;
    imageUrl: string;
    imageCaptionTitle: string;
    imageCaptionText: string;
    valuesHeadline: string;
    values: ValueItem[];
  };
  testimonialsSection: {
    kickerLeft: string;
    kickerRight: string;
    headline: string;
    description: string;
  };
  testimonials: TestimonialItem[];
  orderFormSection: {
    kicker: string;
    headline: string;
    description: string;
    submitNote: string;
    submitButtonText: string;
  };
  blogSection: {
    kickerLeft: string;
    kickerRight: string;
    headline: string;
    description: string;
  };
  articles: ArticleItem[];
  faqSection: {
    kicker: string;
    headline: string;
    description: string;
  };
  faqs: FaqItem[];
  contactSection: {
    kickerLeft: string;
    kickerRight: string;
    headline: string;
    description: string;
    mapCardBadge: string;
    mapCardHeadline: string;
    mapCardDescription: string;
  };
  privacyPolicy: {
    title: string;
    subtitle: string;
    clauses: PrivacyClauseItem[];
  };
  footer: {
    description: string;
    specialtiesTitle: string;
    specialties: string[];
    copyrightText: string;
  };
}

export interface StoredOrder extends OrderFormPayload {
  id: string;
  createdAt: string;
  status: 'جديد' | 'قيد التنفيذ' | 'تم التسليم' | string;
}
