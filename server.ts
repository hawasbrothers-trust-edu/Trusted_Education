import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { DEFAULT_SITE_CONTENT } from './src/data/defaultSiteContent.ts';
import {
  mergeSiteContentWithDefaults,
  sanitizeUploadFilename,
  validateMediaUpload,
} from './src/utils/cmsHelpers.ts';
import { validateOrderForm } from './src/utils/academicCalculations.ts';
import type { SiteContent, StoredOrder } from './src/types/cms.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const SITE_CONTENT_FILE = path.join(DATA_DIR, 'site-content.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SECRET_FILE = path.join(DATA_DIR, '.auth-secret');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'hawasbrothers@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Rasto%%4444';

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function getAuthSecret(): string {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
    return process.env.AUTH_SECRET;
  }
  if (fs.existsSync(SECRET_FILE)) {
    const existing = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    if (existing.length >= 16) return existing;
  }
  const generated = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_FILE, generated, 'utf8');
  return generated;
}

const AUTH_SECRET = getAuthSecret();

function signToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined): { email: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    if (!decoded.email || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }
    return { email: decoded.email };
  } catch {
    return null;
  }
}

function extractTokenFromReq(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';');
  for (const item of cookies) {
    const [k, ...rest] = item.trim().split('=');
    if (k === 'trusted_admin_token') {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromReq(req);
  const session = verifyToken(token);
  if (!session) {
    res.status(401).json({ error: 'غير مصرح بالدخول. يرجى تسجيل الدخول أولاً.' });
    return;
  }
  next();
}

function readSiteContent(): SiteContent {
  try {
    if (!fs.existsSync(SITE_CONTENT_FILE)) {
      fs.writeFileSync(SITE_CONTENT_FILE, JSON.stringify(DEFAULT_SITE_CONTENT, null, 2), 'utf8');
      return DEFAULT_SITE_CONTENT;
    }
    const raw = fs.readFileSync(SITE_CONTENT_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, parsed);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

function writeSiteContent(content: SiteContent): void {
  const tmpFile = `${SITE_CONTENT_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(content, null, 2), 'utf8');
  fs.renameSync(tmpFile, SITE_CONTENT_FILE);
}

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

function readOrders(): StoredOrder[] {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(SEED_ORDERS, null, 2), 'utf8');
      return SEED_ORDERS;
    }
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredOrder[]) : SEED_ORDERS;
  } catch {
    return SEED_ORDERS;
  }
}

function writeOrders(orders: StoredOrder[]): void {
  const tmpFile = `${ORDERS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(orders, null, 2), 'utf8');
  fs.renameSync(tmpFile, ORDERS_FILE);
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '30mb' }));

  // Serve uploaded images and audio clips directly
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Authentication Routes
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const body = req.body as { email?: string; password?: string };
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    const emailMatch = email === ADMIN_EMAIL;
    const passBuf = Buffer.from(password);
    const expectedBuf = Buffer.from(ADMIN_PASSWORD);
    const passMatch =
      passBuf.length === expectedBuf.length && crypto.timingSafeEqual(passBuf, expectedBuf);

    if (!emailMatch || !passMatch) {
      res.status(401).json({ error: 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة السر.' });
      return;
    }

    const token = signToken(email);
    res.setHeader(
      'Set-Cookie',
      `trusted_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );
    res.json({ authenticated: true, email, token });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.setHeader('Set-Cookie', 'trusted_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ ok: true });
  });

  app.get('/api/auth/session', (req: Request, res: Response) => {
    const token = extractTokenFromReq(req);
    const session = verifyToken(token);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, email: session.email });
  });

  // Public & Admin Site Content Routes
  app.get('/api/site-content', (_req: Request, res: Response) => {
    res.json(readSiteContent());
  });

  app.put('/api/site-content', requireAdmin, (req: Request, res: Response) => {
    const payload = req.body as Partial<SiteContent>;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'بيانات المحتوى غير صالحة.' });
      return;
    }
    const merged = mergeSiteContentWithDefaults(DEFAULT_SITE_CONTENT, payload);
    writeSiteContent(merged);
    res.json({ ok: true, content: merged });
  });

  app.post('/api/site-content/reset', requireAdmin, (_req: Request, res: Response) => {
    writeSiteContent(DEFAULT_SITE_CONTENT);
    res.json({ ok: true, content: DEFAULT_SITE_CONTENT });
  });

  // Protected Media Upload Route (Images & Audio)
  app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
    const body = req.body as {
      fileName?: string;
      mimeType?: string;
      base64Data?: string;
      kind?: 'image' | 'audio';
    };

    if (!body.fileName || !body.mimeType || !body.base64Data || !body.kind) {
      res.status(400).json({ error: 'بيانات الملف غير مكتملة.' });
      return;
    }

    const base64Clean = body.base64Data.includes(',')
      ? body.base64Data.split(',')[1] || ''
      : body.base64Data;
    const buffer = Buffer.from(base64Clean, 'base64');

    const validation = validateMediaUpload(body.kind, body.mimeType, buffer.length);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const safeName = sanitizeUploadFilename(body.fileName);
    const storedName = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${safeName}`;
    const destPath = path.join(UPLOADS_DIR, storedName);
    fs.writeFileSync(destPath, buffer);

    res.json({ url: `/uploads/${storedName}`, fileName: storedName });
  });

  // Orders API Routes
  app.get('/api/orders', requireAdmin, (_req: Request, res: Response) => {
    res.json({ orders: readOrders() });
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const body = req.body as Partial<StoredOrder>;
    const validation = validateOrderForm(body);
    if (!validation.isValid) {
      res.status(400).json({ error: 'يرجى التحقق من الحقول المطلوبة.', errors: validation.errors });
      return;
    }

    const referenceId = body.id || `TR-${Math.floor(1000 + Math.random() * 9000)}`;
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

    const orders = readOrders();
    orders.unshift(newOrder);
    writeOrders(orders);
    res.status(201).json({ ok: true, order: newOrder });
  });

  app.patch('/api/orders/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    if (!status) {
      res.status(400).json({ error: 'يرجى تحديد الحالة الجديدة.' });
      return;
    }
    const orders = readOrders();
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    writeOrders(updated);
    res.json({ ok: true, orders: updated });
  });

  app.delete('/api/orders/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const orders = readOrders().filter((o) => o.id !== id);
    writeOrders(orders);
    res.json({ ok: true, orders });
  });

  // Vite / Static SPA serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trusted server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
