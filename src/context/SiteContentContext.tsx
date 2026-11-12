import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SiteContent } from '../types/cms.ts';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent.ts';
import { mergeSiteContentWithDefaults } from '../utils/cmsHelpers.ts';

interface SiteContentContextValue {
  content: SiteContent;
  isLoaded: boolean;
  currentPath: string;
  navigate: (path: string) => void;
  refreshContent: () => Promise<void>;
  saveContent: (updated: SiteContent, authToken: string | null) => Promise<{ ok: boolean; error?: string }>;
  resetContent: (authToken: string | null) => Promise<{ ok: boolean; error?: string }>;
  uploadMedia: (
    file: File,
    kind: 'image' | 'audio',
    authToken: string | null
  ) => Promise<{ url?: string; error?: string }>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const refreshContent = useCallback(async () => {
    try {
      const res = await fetch('/api/site-content', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as Partial<SiteContent>;
        setContent(mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, data));
      }
    } catch {
      // Fall back silently to defaults if offline
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshContent();
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
      try {
        const res = await fetch('/api/site-content', {
          method: 'PUT',
          headers: buildAuthHeaders(authToken),
          credentials: 'include',
          body: JSON.stringify(updated),
        });
        const data = (await res.json()) as { ok?: boolean; content?: SiteContent; error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'تعذر حفظ التعديلات. يرجى المحاولة مرة أخرى.' };
        }
        if (data.content) {
          setContent(mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, data.content));
        } else {
          setContent(updated);
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
      authToken: string | null
    ): Promise<{ url?: string; error?: string }> => {
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
