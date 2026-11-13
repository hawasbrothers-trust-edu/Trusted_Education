import type { CloudflareEnv, R2Range } from './env.ts';
import { sanitizeUploadFilename, validateMediaUpload } from '../src/utils/cmsHelpers.ts';

function decodeBase64ToUint8Array(base64Input: string): Uint8Array {
  const clean = base64Input.includes(',') ? base64Input.split(',')[1] || '' : base64Input;
  const binary = atob(clean.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomHex(byteLength = 3): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function parseHttpRange(rangeHeader: string | null, totalSize: number): R2Range | undefined {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return undefined;
  const spec = rangeHeader.slice(6).split(',')[0]?.trim();
  if (!spec) return undefined;

  const [startStr, endStr] = spec.split('-');
  if (startStr === '' && endStr) {
    const suffix = Number(endStr);
    if (Number.isFinite(suffix) && suffix > 0) {
      return { suffix };
    }
    return undefined;
  }

  const start = Number(startStr);
  if (!Number.isFinite(start) || start < 0 || start >= totalSize) return undefined;

  if (endStr === '') {
    return { offset: start, length: totalSize - start };
  }

  const end = Number(endStr);
  if (!Number.isFinite(end) || end < start) return undefined;
  const clampedEnd = Math.min(end, totalSize - 1);
  return { offset: start, length: clampedEnd - start + 1 };
}

export interface UploadMediaResult {
  ok: boolean;
  status: number;
  url?: string;
  key?: string;
  fileName?: string;
  error?: string;
}

/**
 * Store uploaded images and audio clips in Cloudflare R2 (MEDIA_BUCKET).
 * Supports both JSON base64 payloads (used by Admin CMS) and multipart/form-data.
 */
export async function uploadMediaToR2(
  env: CloudflareEnv,
  request: Request
): Promise<UploadMediaResult> {
  if (!env.MEDIA_BUCKET) {
    return {
      ok: false,
      status: 500,
      error: 'ربط Cloudflare R2 (MEDIA_BUCKET) غير مهيأ في إعدادات المشروع.',
    };
  }

  let fileName = '';
  let mimeType = '';
  let kind: 'image' | 'audio' = 'image';
  let bytes: Uint8Array;

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const fileEntry = formData.get('file');
    const kindEntry = String(formData.get('kind') || 'image');
    if (!(fileEntry instanceof File)) {
      return { ok: false, status: 400, error: 'بيانات الملف غير مكتملة.' };
    }
    fileName = fileEntry.name || 'media';
    mimeType = fileEntry.type || (kindEntry === 'audio' ? 'audio/mpeg' : 'image/png');
    kind = kindEntry === 'audio' ? 'audio' : 'image';
    bytes = new Uint8Array(await fileEntry.arrayBuffer());
  } else {
    const body = (await request.json().catch(() => null)) as {
      fileName?: string;
      mimeType?: string;
      base64Data?: string;
      kind?: 'image' | 'audio';
    } | null;

    if (!body?.fileName || !body.mimeType || !body.base64Data || !body.kind) {
      return { ok: false, status: 400, error: 'بيانات الملف غير مكتملة.' };
    }

    fileName = body.fileName;
    mimeType = body.mimeType;
    kind = body.kind === 'audio' ? 'audio' : 'image';

    try {
      bytes = decodeBase64ToUint8Array(body.base64Data);
    } catch {
      return { ok: false, status: 400, error: 'تعذر فك ترميز الملف المرفوع.' };
    }
  }

  const validation = validateMediaUpload(kind, mimeType, bytes.byteLength);
  if (!validation.valid) {
    return { ok: false, status: 400, error: validation.error };
  }

  const safeName = sanitizeUploadFilename(fileName);
  const storedName = `${Date.now()}-${randomHex(3)}-${safeName}`;
  const objectKey = `uploads/${storedName}`;

  await env.MEDIA_BUCKET.put(objectKey, bytes, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      kind,
      originalName: fileName.slice(0, 120),
    },
  });

  const publicBase = (env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
  const publicUrl = publicBase ? `${publicBase}/${objectKey}` : `/${objectKey}`;

  return {
    ok: true,
    status: 200,
    url: publicUrl,
    key: objectKey,
    fileName: storedName,
  };
}

/**
 * Serve uploaded images and audio clips directly from Cloudflare R2 with HTTP Range support.
 */
export async function serveMediaFromR2(
  env: CloudflareEnv,
  request: Request,
  rawPathKey: string
): Promise<Response> {
  if (!env.MEDIA_BUCKET) {
    return new Response('R2 MEDIA_BUCKET binding is not configured.', { status: 500 });
  }

  const cleanSubPath = decodeURIComponent(rawPathKey).replace(/^\/+/, '');
  if (!cleanSubPath || cleanSubPath.includes('..')) {
    return new Response('Invalid media path.', { status: 400 });
  }

  const objectKey = cleanSubPath.startsWith('uploads/') ? cleanSubPath : `uploads/${cleanSubPath}`;
  const headObj = await env.MEDIA_BUCKET.head(objectKey);
  if (!headObj) {
    return new Response('Media file not found.', { status: 404 });
  }

  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch && (ifNoneMatch === headObj.httpEtag || ifNoneMatch === headObj.etag)) {
    return new Response(null, { status: 304 });
  }

  const headers = new Headers();
  headObj.writeHttpMetadata(headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/octet-stream');
  }
  if (!headers.has('cache-control')) {
    headers.set('cache-control', 'public, max-age=31536000, immutable');
  }
  headers.set('etag', headObj.httpEtag);
  headers.set('accept-ranges', 'bytes');

  if (request.method === 'HEAD') {
    headers.set('content-length', String(headObj.size));
    return new Response(null, { status: 200, headers });
  }

  const rangeHeader = request.headers.get('range');
  const parsedRange = parseHttpRange(rangeHeader, headObj.size);

  if (rangeHeader && !parsedRange) {
    headers.set('content-range', `bytes */${headObj.size}`);
    return new Response(null, { status: 416, headers });
  }

  const object = await env.MEDIA_BUCKET.get(
    objectKey,
    parsedRange ? { range: parsedRange } : undefined
  );

  if (!object) {
    return new Response('Media file not found.', { status: 404 });
  }

  if (parsedRange && object.range) {
    const start = object.range.offset ?? Math.max(0, headObj.size - (object.range.suffix ?? 0));
    const length = object.range.length ?? Math.max(0, headObj.size - start);
    const end = start + length - 1;
    headers.set('content-range', `bytes ${start}-${end}/${headObj.size}`);
    headers.set('content-length', String(length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('content-length', String(object.size));
  return new Response(object.body, { status: 200, headers });
}

export async function listMediaFromR2(env: CloudflareEnv): Promise<
  {
    key: string;
    url: string;
    size: number;
    uploaded: string;
    contentType?: string;
    kind?: string;
  }[]
> {
  if (!env.MEDIA_BUCKET) return [];
  const listed = await env.MEDIA_BUCKET.list({ prefix: 'uploads/', limit: 200 });
  const publicBase = (env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
  return listed.objects.map((obj) => ({
    key: obj.key,
    url: publicBase ? `${publicBase}/${obj.key}` : `/${obj.key}`,
    size: obj.size,
    uploaded: obj.uploaded.toISOString(),
    contentType: obj.httpMetadata?.contentType,
    kind: obj.customMetadata?.kind,
  }));
}

export async function deleteMediaFromR2(env: CloudflareEnv, rawKey: string): Promise<boolean> {
  if (!env.MEDIA_BUCKET) return false;
  const cleanKey = decodeURIComponent(rawKey).replace(/^\/+/, '');
  if (!cleanKey || cleanKey.includes('..')) return false;
  const objectKey = cleanKey.startsWith('uploads/') ? cleanKey : `uploads/${cleanKey}`;
  await env.MEDIA_BUCKET.delete(objectKey);
  return true;
}
