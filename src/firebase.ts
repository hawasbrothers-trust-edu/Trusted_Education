import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import type { SiteContent } from './types/cms.ts';
import type { OrderFormPayload } from './utils/academicCalculations.ts';
import { sanitizeUploadFilename, validateMediaUpload } from './utils/cmsHelpers.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const PRIMARY_ADMIN_EMAIL = 'hawasbrothers@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Build a strictly allowlisted & bounded SiteContent payload matching firestore.rules
 */
export function buildFirestoreSiteContentPayload(content: SiteContent, uid: string) {
  return {
    brand: content.brand,
    contact: content.contact,
    hero: content.hero,
    stats: content.stats.slice(0, 20),
    servicesSection: content.servicesSection,
    services: content.services.slice(0, 50),
    workflowSection: content.workflowSection,
    workflowSteps: content.workflowSteps.slice(0, 20),
    aboutSection: content.aboutSection,
    testimonialsSection: content.testimonialsSection,
    testimonials: content.testimonials.slice(0, 100),
    orderFormSection: content.orderFormSection,
    blogSection: content.blogSection,
    articles: content.articles.slice(0, 100),
    faqSection: content.faqSection,
    faqs: content.faqs.slice(0, 100),
    contactSection: content.contactSection,
    privacyPolicy: content.privacyPolicy,
    footer: content.footer,
    updatedAt: serverTimestamp(),
    updatedBy: uid.slice(0, 128),
  };
}

/**
 * Build a strictly allowlisted & bounded Order payload matching firestore.rules
 */
export function buildFirestoreOrderPayload(
  orderId: string,
  formData: OrderFormPayload,
  createdAt: string
) {
  const payload: Record<string, unknown> = {
    id: orderId.slice(0, 64),
    studentName: (formData.studentName || '').trim().slice(0, 150),
    phone: (formData.phone || '').trim().slice(0, 32),
    academicLevel: formData.academicLevel || 'master',
    serviceId: (formData.serviceId || '').trim().slice(0, 200),
    createdAt: createdAt.slice(0, 80),
    submittedAt: serverTimestamp(),
    status: 'جديد',
  };

  const email = (formData.email || '').trim().slice(0, 180);
  if (email) payload.email = email;

  const specialization = (formData.specialization || '').trim().slice(0, 200);
  if (specialization) payload.specialization = specialization;

  const deadline = (formData.deadline || '').trim().slice(0, 40);
  if (deadline) payload.deadline = deadline;

  const notes = (formData.notes || '').trim().slice(0, 2000);
  if (notes) payload.notes = notes;

  if (formData.countryCode) {
    payload.countryCode = String(formData.countryCode).trim().slice(0, 16);
  }

  return payload;
}

/**
 * Upload an image or audio file to Firebase Storage under /media/images or /media/audio
 */
export async function uploadMediaToFirebaseStorage(
  file: File,
  kind: 'image' | 'audio',
  onProgress?: (percent: number) => void
): Promise<{ url: string; path: string }> {
  const mimeType = file.type || (kind === 'image' ? 'image/png' : 'audio/mpeg');
  const validation = validateMediaUpload(kind, mimeType, file.size);
  if (!validation.valid) {
    throw new Error(validation.error || 'الملف غير صالح للرفع.');
  }

  if (!auth.currentUser) {
    throw new Error('يجب تسجيل الدخول عبر Firebase Auth لرفع الملفات.');
  }

  const safeName = sanitizeUploadFilename(file.name);
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const folder = kind === 'image' ? 'images' : 'audio';
  const storagePath = `media/${folder}/${Date.now()}-${randomSuffix}-${safeName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: mimeType,
    cacheControl: 'public, max-age=31536000, immutable',
    customMetadata: {
      kind,
      uploadedBy: auth.currentUser.uid,
    },
  });

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (error) => reject(error),
      () => resolve()
    );
  });

  const url = await getDownloadURL(uploadTask.snapshot.ref);
  return { url, path: storagePath };
}

/**
 * Delete a media file from Firebase Storage by path or download URL
 */
export async function deleteMediaFromFirebaseStorage(storageUrlOrPath: string): Promise<void> {
  if (!storageUrlOrPath) return;
  const targetRef = ref(storage, storageUrlOrPath);
  await deleteObject(targetRef);
}
