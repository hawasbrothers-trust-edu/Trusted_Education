import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
  buildFirestoreSiteContentPayload,
  uploadMediaToFirebaseStorage,
} from '../firebase.ts';
import type { SiteContent } from '../types/cms.ts';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent.ts';
import { mergeSiteContentWithDefaults } from '../utils/cmsHelpers.ts';

interface SiteContentContextValue {
  content: SiteContent;
  isLoaded: boolean;
  currentPath: string;
  firebaseUser: User | null;
  isFirebaseAuthReady: boolean;
  signInWithGoogle: () => Promise<{ ok: boolean; user?: User; error?: string }>;
  signOutFirebase: () => Promise<void>;
  navigate: (path: string) => void;
  refreshContent: () => Promise<void>;
  saveContent: (updated: SiteContent, authToken: string | null) => Promise<{ ok: boolean; error?: string }>;
  resetContent: (authToken: string | null) => Promise<{ ok: boolean; error?: string }>;
  uploadMedia: (
    file: File,
    kind: 'image' | 'audio',
    authToken: string | null,
    onProgress?: (percent: number) => void
  ) => Promise<{ url?: string; error?: string }>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsFirebaseAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{
    ok: boolean;
    user?: User;
    error?: string;
  }> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      return { ok: true, user: cred.user };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'تعذر تسجيل الدخول عبر حساب Google.';
      return { ok: false, error: message };
    }
  }, []);

  const signOutFirebase = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const refreshContent = useCallback(async () => {
    const siteDocPath = 'siteContent/main';
    let loadedFromFirestore = false;

    try {
      const snap = await getDoc(doc(db, 'siteContent', 'main'));
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteContent>;
        setContent(mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, data));
        loadedFromFirestore = true;
      }
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.GET, siteDocPath);
      }
    }

    if (!loadedFromFirestore) {
      try {
        const res = await fetch('/api/site-content', { cache: 'no-store' });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = (await res.json()) as Partial<SiteContent>;
          setContent(mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, data));
        }
      } catch {
        // Fall back silently to defaults if offline or static hosting
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshContent();

    const siteDocPath = 'siteContent/main';
    const unsubscribe = onSnapshot(
      doc(db, 'siteContent', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteContent>;
          setContent(mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, data));
        }
        setIsLoaded(true);
      },
      (error) => {
        if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
          handleFirestoreError(error, OperationType.GET, siteDocPath);
        }
      }
    );

    return () => unsubscribe();
  }, [refreshContent]);

  const buildAuthHeaders = (authToken: string | null): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  };

  const saveContent = useCallback(
    async (updated: SiteContent, authToken: string | null): Promise<{ ok: boolean; error?: string }> => {
      const merged = mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, updated);
      const currentUser = auth.currentUser;

      if (currentUser) {
        const siteDocPath = 'siteContent/main';
        try {
          const payload = buildFirestoreSiteContentPayload(merged, currentUser.uid);
          await setDoc(doc(db, 'siteContent', 'main'), payload);
          setContent(merged);

          if (authToken) {
            fetch('/api/site-content', {
              method: 'PUT',
              headers: buildAuthHeaders(authToken),
              credentials: 'include',
              body: JSON.stringify(merged),
            }).catch(() => {});
          }
          return { ok: true };
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.WRITE, siteDocPath);
          } catch (wrapped) {
            return {
              ok: false,
              error:
                wrapped instanceof Error
                  ? 'تعذر الحفظ في Firestore. تأكد من صلاحيات المسؤول لحساب Google.'
                  : 'تعذر الحفظ في Firestore.',
            };
          }
        }
      }

      try {
        const res = await fetch('/api/site-content', {
          method: 'PUT',
          headers: buildAuthHeaders(authToken),
          credentials: 'include',
          body: JSON.stringify(merged),
        });
        const data = (await res.json()) as { ok?: boolean; content?: SiteContent; error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'تعذر حفظ التعديلات. يرجى المحاولة مرة أخرى.' };
        }
        if (data.content) {
          setContent(mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, data.content));
        } else {
          setContent(merged);
        }
        return { ok: true };
      } catch {
        return { ok: false, error: 'تعذر الاتصال بالخادم أثناء الحفظ.' };
      }
    },
    []
  );

  const resetContent = useCallback(
    async (authToken: string | null): Promise<{ ok: boolean; error?: string }> => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const siteDocPath = 'siteContent/main';
        try {
          const payload = buildFirestoreSiteContentPayload(DEFAULT_SITE_CONTENT, currentUser.uid);
          await setDoc(doc(db, 'siteContent', 'main'), payload);
          setContent(DEFAULT_SITE_CONTENT);

          if (authToken) {
            fetch('/api/site-content/reset', {
              method: 'POST',
              headers: buildAuthHeaders(authToken),
              credentials: 'include',
            }).catch(() => {});
          }
          return { ok: true };
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.WRITE, siteDocPath);
          } catch {
            return {
              ok: false,
              error: 'تعذر استعادة المحتوى الافتراضي في Firestore. تحقق من صلاحيات المسؤول.',
            };
          }
        }
      }

      try {
        const res = await fetch('/api/site-content/reset', {
          method: 'POST',
          headers: buildAuthHeaders(authToken),
          credentials: 'include',
        });
        const data = (await res.json()) as { ok?: boolean; content?: SiteContent; error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'تعذر استعادة المحتوى الافتراضي.' };
        }
        setContent(data.content || DEFAULT_SITE_CONTENT);
        return { ok: true };
      } catch {
        return { ok: false, error: 'تعذر الاتصال بالخادم.' };
      }
    },
    []
  );

  const uploadMedia = useCallback(
    async (
      file: File,
      kind: 'image' | 'audio',
      authToken: string | null,
      onProgress?: (percent: number) => void
    ): Promise<{ url?: string; error?: string }> => {
      if (auth.currentUser) {
        try {
          const result = await uploadMediaToFirebaseStorage(file, kind, onProgress);
          return { url: result.url };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes('storage/unauthorized')) {
            return {
              error:
                'ليس لديك صلاحية رفع الملفات في Firebase Storage. تأكد من نشر قواعد storage.rules والدخول بحساب المسؤول المعتمد.',
            };
          }
          if (message.includes('storage/bucket-not-found') || message.includes('storage/unknown')) {
            return {
              error:
                'خدمة Firebase Storage غير مفعّلة بعد في وحدة تحكم Firebase أو تعذر الوصول إلى الحاوية.',
            };
          }
          return { error: message || 'فشل رفع الملف إلى Firebase Storage.' };
        }
      }

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('File read error'));
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: buildAuthHeaders(authToken),
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type || (kind === 'image' ? 'image/png' : 'audio/mpeg'),
            base64Data,
            kind,
          }),
        });

        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          return { error: data.error || 'فشل رفع الملف على الخادم.' };
        }
        return { url: data.url };
      } catch {
        return { error: 'حدث خطأ أثناء قراءة أو رفع الملف.' };
      }
    },
    []
  );

  return (
    <SiteContentContext.Provider
      value={{
        content,
        isLoaded,
        currentPath,
        firebaseUser,
        isFirebaseAuthReady,
        signInWithGoogle,
        signOutFirebase,
        navigate,
        refreshContent,
        saveContent,
        resetContent,
        uploadMedia,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export function useSiteContent(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error('useSiteContent must be used inside SiteContentProvider');
  }
  return ctx;
}
