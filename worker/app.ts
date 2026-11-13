import type { CloudflareEnv } from './env.ts';
import type { SiteContent, StoredOrder } from '../src/types/cms.ts';
import { DEFAULT_SITE_CONTENT } from '../src/data/defaultSiteContent.ts';
import { mergeSiteContentWithDefaults } from '../src/utils/cmsHelpers.ts';
import { validateOrderForm } from '../src/utils/academicCalculations.ts';
import {
  buildLogoutCookie,
  buildSessionCookie,
  extractCloudflareAccessEmail,
  extractTokenFromRequest,
  getAdminEmail,
  hashPassword,
  resolveAuthSecret,
  signAuthToken,
  timingSafeEqualStrings,
  verifyAuthToken,
  verifyPassword,
} from './auth.ts';
import {
  readAdminPasswordCredential,
  readOrdersFromKV,
  readSiteContentFromKV,
  writeAdminPasswordHashToKV,
  writeOrdersToKV,
  writeSiteContentToKV,
} from './kvStorage.ts';
import {
  deleteMediaFromR2,
  listMediaFromR2,
  serveMediaFromR2,
  uploadMediaToR2,
} from './r2Storage.ts';

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      headers.set(k, v);
    }
  }
  return new Response(JSON.stringify(data), { status, headers });
}

async function authenticateAdmin(
  request: Request,
  env: CloudflareEnv
): Promise<{ email: string } | null> {
  const cfEmail = extractCloudflareAccessEmail(request, env);
  if (cfEmail) {
    return { email: cfEmail };
  }

  const token = extractTokenFromRequest(request);
  if (!token) return null;

  try {
    const secret = await resolveAuthSecret(env);
    return await verifyAuthToken(token, secret);
  } catch {
    return null;
  }
}

function unauthorizedResponse(): Response {
  return jsonResponse({ error: 'غير مصرح بالدخول. يرجى تسجيل الدخول أولاً.' }, 401);
}

export async function handleEdgeRequest(
  request: Request,
  env: CloudflareEnv
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method.toUpperCase();

  // Serve R2 uploaded images & audio clips
  if (pathname.startsWith('/uploads/') && (method === 'GET' || method === 'HEAD')) {
    const rawKey = pathname.slice('/uploads/'.length);
    return serveMediaFromR2(env, request, rawKey);
  }

  // Health & binding readiness check (no secrets exposed)
  if (pathname === '/api/health' && method === 'GET') {
    return jsonResponse({
      ok: true,
      runtime: 'cloudflare-workers',
      bindings: {
        r2MediaBucket: Boolean(env.MEDIA_BUCKET),
        kvNamespace: Boolean(env.CMS_KV),
        authSecretConfigured: Boolean(env.AUTH_SECRET),
        adminCredentialConfigured: Boolean(
          env.ADMIN_PASSWORD_HASH || env.ADMIN_PASSWORD || env.CMS_KV
        ),
      },
    });
  }

  // Authentication: Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    const email = (body?.email || '').trim().toLowerCase();
    const password = body?.password || '';
    const expectedEmail = getAdminEmail(env);
    const storedCredential = await readAdminPasswordCredential(env);

    if (!storedCredential) {
      return jsonResponse(
        { error: 'كلمة مرور الإدارة غير مهيأة في إعدادات Cloudflare Secrets.' },
        500
      );
    }

    const emailMatch = timingSafeEqualStrings(email, expectedEmail);
    const passMatch = await verifyPassword(password, storedCredential);

    if (!emailMatch || !passMatch) {
      return jsonResponse(
        { error: 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة السر.' },
        401
      );
    }

    const secret = await resolveAuthSecret(env);
    const token = await signAuthToken(email, secret);
    return jsonResponse(
      { authenticated: true, email, token },
      200,
      { 'Set-Cookie': buildSessionCookie(token, url) }
    );
  }

  // Authentication: Logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    return jsonResponse({ ok: true }, 200, {
      'Set-Cookie': buildLogoutCookie(url),
    });
  }

  // Authentication: Session check
  if (pathname === '/api/auth/session' && method === 'GET') {
    const session = await authenticateAdmin(request, env);
    if (!session) {
      return jsonResponse({ authenticated: false });
    }
    return jsonResponse({ authenticated: true, email: session.email });
  }

  // Authentication: Password management (change password)
  if (pathname === '/api/auth/change-password' && method === 'POST') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const body = (await request.json().catch(() => null)) as {
      currentPassword?: string;
      newPassword?: string;
    } | null;

    const currentPassword = body?.currentPassword || '';
    const newPassword = body?.newPassword || '';

    if (!currentPassword || newPassword.length < 8) {
      return jsonResponse(
        { error: 'يرجى إدخال كلمة المرور الحالية وكلمة مرور جديدة (8 أحرف على الأقل).' },
        400
      );
    }

    const storedCredential = await readAdminPasswordCredential(env);
    const currentValid = await verifyPassword(currentPassword, storedCredential);
    if (!currentValid) {
      return jsonResponse({ error: 'كلمة المرور الحالية غير صحيحة.' }, 401);
    }

    try {
      const nextHash = await hashPassword(newPassword);
      await writeAdminPasswordHashToKV(env, nextHash);
      return jsonResponse({
        ok: true,
        message: 'تم تحديث كلمة المرور وتشفيرها وحفظها في Cloudflare KV بنجاح.',
      });
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'تعذر حفظ كلمة المرور الجديدة.' },
        500
      );
    }
  }

  // Site Content: Public Read
  if (pathname === '/api/site-content' && method === 'GET') {
    const content = await readSiteContentFromKV(env);
    return jsonResponse(content);
  }

  // Site Content: Admin Save
  if (pathname === '/api/site-content' && method === 'PUT') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const payload = (await request.json().catch(() => null)) as Partial<SiteContent> | null;
    if (!payload || typeof payload !== 'object') {
      return jsonResponse({ error: 'بيانات المحتوى غير صالحة.' }, 400);
    }

    try {
      const merged = mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, payload);
      await writeSiteContentToKV(env, merged);
      return jsonResponse({ ok: true, content: merged });
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'تعذر حفظ محتوى الموقع.' },
        500
      );
    }
  }

  // Site Content: Admin Reset
  if (pathname === '/api/site-content/reset' && method === 'POST') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    try {
      await writeSiteContentToKV(env, DEFAULT_SITE_CONTENT);
      return jsonResponse({ ok: true, content: DEFAULT_SITE_CONTENT });
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'تعذر استعادة المحتوى الافتراضي.' },
        500
      );
    }
  }

  // Media Upload (R2): Admin Upload
  if (pathname === '/api/upload' && method === 'POST') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const result = await uploadMediaToR2(env, request);
    if (!result.ok) {
      return jsonResponse({ error: result.error }, result.status);
    }
    return jsonResponse({
      url: result.url,
      key: result.key,
      fileName: result.fileName,
    });
  }

  // Media Library (R2): List & Delete
  if (pathname === '/api/media' && method === 'GET') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const items = await listMediaFromR2(env);
    return jsonResponse({ items });
  }

  if (pathname.startsWith('/api/media/') && method === 'DELETE') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const rawKey = pathname.slice('/api/media/'.length);
    const deleted = await deleteMediaFromR2(env, rawKey);
    if (!deleted) {
      return jsonResponse({ error: 'تعذر حذف الملف المحدد.' }, 400);
    }
    return jsonResponse({ ok: true });
  }

  // Orders: Admin List
  if (pathname === '/api/orders' && method === 'GET') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const orders = await readOrdersFromKV(env);
    return jsonResponse({ orders });
  }

  // Orders: Public Create
  if (pathname === '/api/orders' && method === 'POST') {
    const body = (await request.json().catch(() => null)) as Partial<StoredOrder> | null;
    if (!body) {
      return jsonResponse({ error: 'بيانات الطلب غير صالحة.' }, 400);
    }

    const validation = validateOrderForm(body);
    if (!validation.isValid) {
      return jsonResponse(
        { error: 'يرجى التحقق من الحقول المطلوبة.', errors: validation.errors },
        400
      );
    }

    const randDigits = 1000 + (crypto.getRandomValues(new Uint16Array(1))[0] % 9000);
    const referenceId = body.id || `TR-${randDigits}`;
    const newOrder: StoredOrder = {
      id: referenceId,
      studentName: (body.studentName || '').trim(),
      phone: (body.phone || '').trim(),
      email: (body.email || '').trim(),
      academicLevel: body.academicLevel || 'master',
      serviceId: body.serviceId || '',
      specialization: (body.specialization || '').trim(),
      deadline: body.deadline || '',
      notes: (body.notes || '').trim(),
      createdAt:
        body.createdAt ||
        new Date().toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      status: 'جديد',
    };

    try {
      const orders = await readOrdersFromKV(env);
      orders.unshift(newOrder);
      await writeOrdersToKV(env, orders);
      return jsonResponse({ ok: true, order: newOrder }, 201);
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'تعذر تسجيل الطلب.' },
        500
      );
    }
  }

  // Orders: Admin Update Status
  if (pathname.startsWith('/api/orders/') && method === 'PATCH') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const id = decodeURIComponent(pathname.slice('/api/orders/'.length));
    const body = (await request.json().catch(() => null)) as { status?: string } | null;
    const status = body?.status;

    if (!id || !status) {
      return jsonResponse({ error: 'يرجى تحديد الحالة الجديدة.' }, 400);
    }

    try {
      const orders = await readOrdersFromKV(env);
      const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
      await writeOrdersToKV(env, updated);
      return jsonResponse({ ok: true, orders: updated });
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'تعذر تحديث حالة الطلب.' },
        500
      );
    }
  }

  // Orders: Admin Delete
  if (pathname.startsWith('/api/orders/') && method === 'DELETE') {
    const session = await authenticateAdmin(request, env);
    if (!session) return unauthorizedResponse();

    const id = decodeURIComponent(pathname.slice('/api/orders/'.length));
    if (!id) {
      return jsonResponse({ error: 'معرف الطلب غير صالح.' }, 400);
    }

    try {
      const orders = (await readOrdersFromKV(env)).filter((o) => o.id !== id);
      await writeOrdersToKV(env, orders);
      return jsonResponse({ ok: true, orders });
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'تعذر حذف الطلب.' },
        500
      );
    }
  }

  return jsonResponse({ error: 'المسار غير موجود.' }, 404);
}
