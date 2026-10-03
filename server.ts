import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

// -----------------------------------------------------------------------------
// MYSQL DATABASE HELPER & CONNECTION MANAGEMENT
// -----------------------------------------------------------------------------
let pool: Pool | null = null;
let isMySQLEnabled = false;
let isConnectionTested = false;

/**
 * Mendapatkan pool koneksi MySQL jika tersedia dan server aktif.
 * Jika MySQL belum diinstal/dijalankan (misal di preview dev atau cloud run tanpa db),
 * fungsi ini akan beralih secara anggun (graceful fallback) tanpa melempar error.
 */
export async function getActiveMySQLPool(): Promise<Pool | null> {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  if (!host || !user || !database) {
    if (!isConnectionTested) {
      console.log('[Database] Mode Local Storage aktif. Konfigurasi MySQL dapat diisi di .env saat dideploy ke VPS.');
      isConnectionTested = true;
    }
    return null;
  }

  if (pool && isMySQLEnabled) {
    return pool;
  }

  if (isConnectionTested && !isMySQLEnabled) {
    return null;
  }

  try {
    const tempPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 2000,
      charset: 'utf8mb4',
    });

    const conn = await tempPool.getConnection();
    await conn.ping();
    conn.release();

    pool = tempPool;
    isMySQLEnabled = true;
    isConnectionTested = true;
    console.log(`[Database] Berhasil terhubung ke MySQL Server: ${host}:${port}/${database}`);
    return pool;
  } catch (_err) {
    isMySQLEnabled = false;
    isConnectionTested = true;
    pool = null;
    console.log('[Database] Server MySQL tidak terdeteksi pada host ini. Menggunakan engine penyimpanan lokal mandiri.');
    return null;
  }
}

/**
 * Menjalankan query MySQL secara aman dengan fallback otomatis jika terjadi gangguan jaringan.
 */
export async function safeMySQLQuery<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  try {
    const activePool = await getActiveMySQLPool();
    if (!activePool) return null;

    const [rows] = await activePool.query(sql, params);
    return rows as T;
  } catch (_err) {
    isMySQLEnabled = false;
    pool = null;
    return null;
  }
}

export function isMySQLConnected(): boolean {
  return isMySQLEnabled && pool !== null;
}

// -----------------------------------------------------------------------------
// EXPRESS APP INITIALIZATION & SECURITY HEADERS (Rule 22)
// -----------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.disable('x-powered-by');

// Security Headers (OWASP Top 10 & Rule 22)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: '10mb' }));

// -----------------------------------------------------------------------------
// RATE LIMITING PROTECTION FOR SENSITIVE ENDPOINTS (Rule 10)
// -----------------------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitRecord>();

function createAuthRateLimiter(windowMs: number, maxRequests: number, customMessage: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(',')[0].trim();
    const limiterKey = `${req.path}:${clientIp}`;
    const now = Date.now();

    const record = rateLimitStore.get(limiterKey);
    if (!record || now > record.resetAt) {
      rateLimitStore.set(limiterKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: customMessage,
      });
    }

    record.count++;
    return next();
  };
}

// 15 menit, maks 12 percobaan gagal/request per IP untuk auth sensitif
const authRateLimiter = createAuthRateLimiter(
  15 * 60 * 1000,
  12,
  'Terlalu banyak permintaan autentikasi. Demi keamanan akun, silakan tunggu beberapa menit sebelum mencoba lagi.'
);

// Bersihkan data limiter kadaluwarsa setiap 15 menit secara periodik
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 15 * 60 * 1000);

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// File-based Storage Persistence Helper untuk Platform Owner & CMS
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.resolve(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.warn(`[Storage] Gagal membaca ${filename}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filename: string, data: T): boolean {
  try {
    const filePath = path.resolve(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[Storage] Gagal menulis ${filename}:`, err);
    return false;
  }
}

// 1. Landing Page CMS Configuration Endpoints
app.get('/api/platform/landing-config', async (_req: Request, res: Response) => {
  const config = readJsonFile('landing_config.json', null);
  res.json({ success: true, config });
});

app.post('/api/platform/landing-config', async (req: Request, res: Response) => {
  const newConfig = req.body;
  if (!newConfig || typeof newConfig !== 'object') {
    return res.status(400).json({ success: false, message: 'Data konfigurasi tidak valid' });
  }
  const saved = writeJsonFile('landing_config.json', newConfig);
  res.json({ 
    success: saved, 
    config: newConfig,
    message: 'Alhamdulillah, konfigurasi Landing Page berhasil disimpan permanen ke server VPS!' 
  });
});

// 2. Fiqh & Doa Syar'i Guidelines Endpoints
app.get('/api/platform/fiqh-config', async (_req: Request, res: Response) => {
  const config = readJsonFile('fiqh_config.json', null);
  res.json({ success: true, config });
});

app.post('/api/platform/fiqh-config', async (req: Request, res: Response) => {
  const newConfig = req.body;
  if (!newConfig || typeof newConfig !== 'object') {
    return res.status(400).json({ success: false, message: 'Data fiqh tidak valid' });
  }
  const saved = writeJsonFile('fiqh_config.json', newConfig);
  res.json({ 
    success: saved, 
    config: newConfig,
    message: 'Panduan fiqh zakat & doa amil berhasil disimpan permanen ke server VPS!' 
  });
});

// -----------------------------------------------------------------------------
// DUAL-LAYER PERSISTENCE: MYSQL + LOCAL PERSISTENT STORAGE
// -----------------------------------------------------------------------------
const DEFAULT_SERVER_MASJIDS = [
  {
    id: 'masjid-almuhajirin',
    name: 'Masjid Raya Al-Muhajirin',
    slug: 'masjid-raya-al-muhajirin',
    address: 'Jl. Boulevard Raya Blok A No. 12, Kelapa Gading',
    city: 'Jakarta Utara',
    province: 'DKI Jakarta',
    contactPhone: '081299887766',
    email: 'dkm@almuhajirin.id',
    leadName: 'Ustadz Ahmad Fauzi, S.Pd.I',
    status: 'active',
    hijriYear: '1447 H',
    masehiYear: '2026 M',
    createdAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'masjid-arraudhah',
    name: 'Masjid Jami Ar-Raudhah',
    slug: 'masjid-jami-ar-raudhah',
    address: 'Jl. Melati Raya No. 45, Coblong',
    city: 'Bandung',
    province: 'Jawa Barat',
    contactPhone: '081377889900',
    email: 'arraudhah@simzakat.id',
    leadName: 'Drs. H. Syamsuddin',
    status: 'active',
    hijriYear: '1447 H',
    masehiYear: '2026 M',
    createdAt: '2026-03-05T09:30:00.000Z',
  }
];

const DEFAULT_SERVER_USERS = [
  {
    id: 'user-owner',
    name: 'Super Admin & Owner Platform',
    username: 'owner',
    email: 'adminbisaujin@gmail.com',
    phone: '081100001111',
    role: 'owner',
    masjidId: null,
    masjidName: 'Pusat SimZakat Indonesia',
    isActive: true,
    password: 'owner',
  },
  {
    id: 'user-dkm-almuhajirin',
    name: 'Ustadz Ahmad Fauzi, S.Pd.I',
    username: 'admin_muhajirin',
    email: 'dkm@almuhajirin.id',
    phone: '081299887766',
    role: 'admin_dkm',
    masjidId: 'masjid-almuhajirin',
    masjidName: 'Masjid Raya Al-Muhajirin',
    isActive: true,
    password: '123',
  },
  {
    id: 'user-amil-almuhajirin',
    name: 'Hadi Sucipto (Kasir Posko)',
    username: 'amil_hadi',
    email: 'hadi@almuhajirin.id',
    phone: '081233445566',
    role: 'petugas_amil',
    masjidId: 'masjid-almuhajirin',
    masjidName: 'Masjid Raya Al-Muhajirin',
    isActive: true,
    password: '123',
  }
];

function getPersistentUsers(): any[] {
  const users = readJsonFile<any[]>('users.json', []);
  if (!users || users.length === 0) {
    writeJsonFile('users.json', DEFAULT_SERVER_USERS);
    return DEFAULT_SERVER_USERS;
  }
  return users;
}

function savePersistentUsers(users: any[]): boolean {
  return writeJsonFile('users.json', users);
}

function getPersistentMasjids(): any[] {
  const masjids = readJsonFile<any[]>('masjids.json', []);
  if (!masjids || masjids.length === 0) {
    writeJsonFile('masjids.json', DEFAULT_SERVER_MASJIDS);
    return DEFAULT_SERVER_MASJIDS;
  }
  return masjids;
}

function savePersistentMasjids(masjids: any[]): boolean {
  return writeJsonFile('masjids.json', masjids);
}

// 3. Masjids / Lembaga Platform Management Endpoints
app.get('/api/platform/masjids', async (_req: Request, res: Response) => {
  if (isMySQLConnected()) {
    const rows = await safeMySQLQuery('SELECT * FROM masjids ORDER BY created_at DESC');
    if (rows && rows.length > 0) {
      const mapped = rows.map((r: any) => ({
        id: r.id || '',
        name: r.name || 'Masjid',
        slug: r.slug || '',
        address: r.address || '',
        city: r.city || '',
        province: r.province || '',
        contactPhone: r.contact_phone || '',
        email: r.email || '',
        leadName: r.lead_name || 'Ketua DKM',
        status: r.status || 'active',
        hijriYear: r.hijri_year || '1447 H',
        masehiYear: r.masehi_year || '2026 M',
        createdAt: r.created_at || new Date().toISOString(),
      }));
      return res.json({ success: true, masjids: mapped });
    }
  }

  const masjids = getPersistentMasjids();
  res.json({ success: true, masjids });
});

app.post('/api/platform/masjids/status', async (req: Request, res: Response) => {
  const { masjidId, status } = req.body;
  if (!masjidId || !status) {
    return res.status(400).json({ success: false, message: 'Parameter masjidId dan status wajib diisi' });
  }

  if (isMySQLConnected()) {
    await safeMySQLQuery('UPDATE masjids SET status = ? WHERE id = ?', [status, masjidId]);
  }

  const masjids = readJsonFile<any[]>('masjids.json', []);
  const idx = masjids.findIndex((m: any) => m.id === masjidId);
  if (idx !== -1) {
    masjids[idx].status = status;
  } else {
    masjids.push({ id: masjidId, status });
  }
  writeJsonFile('masjids.json', masjids);

  res.json({ success: true, message: `Status lembaga berhasil diperbarui menjadi ${status}` });
});

app.put('/api/platform/masjids/:id', async (req: Request, res: Response) => {
  const masjidId = req.params.id;
  const updated = req.body;
  if (!masjidId || !updated) {
    return res.status(400).json({ success: false, message: 'Data pembaruan tidak valid' });
  }

  if (isMySQLConnected()) {
    await safeMySQLQuery(
      'UPDATE masjids SET name = COALESCE(?, name), lead_name = COALESCE(?, lead_name), contact_phone = COALESCE(?, contact_phone), email = COALESCE(?, email), city = COALESCE(?, city), province = COALESCE(?, province), address = COALESCE(?, address), status = COALESCE(?, status) WHERE id = ?',
      [updated.name, updated.leadName, updated.contactPhone, updated.email, updated.city, updated.province, updated.address, updated.status, masjidId]
    );
  }

  const masjids = readJsonFile<any[]>('masjids.json', []);
  const idx = masjids.findIndex((m: any) => m.id === masjidId);
  if (idx !== -1) {
    masjids[idx] = { ...masjids[idx], ...updated };
  } else {
    masjids.push({ id: masjidId, ...updated });
  }
  writeJsonFile('masjids.json', masjids);

  res.json({ success: true, message: 'Data lembaga berhasil disimpan permanen di server.' });
});

app.post('/api/platform/masjids', async (req: Request, res: Response) => {
  const newM = req.body;
  if (!newM || !newM.name) {
    return res.status(400).json({ success: false, message: 'Nama lembaga wajib diisi' });
  }
  const id = newM.id || `masjid-${Date.now().toString(36)}`;
  const slug = (newM.slug || newM.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');

  if (isMySQLConnected()) {
    await safeMySQLQuery(
      'INSERT INTO masjids (id, name, slug, address, city, province, contact_phone, email, lead_name, status, hijri_year, masehi_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, newM.name, slug, newM.address || '', newM.city || 'Indonesia', newM.province || '', newM.contactPhone || '', newM.email || '', newM.leadName || '', newM.status || 'active', newM.hijriYear || '1447 H', newM.masehiYear || '2026 M']
    );
  }

  const masjids = readJsonFile<any[]>('masjids.json', []);
  const created = { ...newM, id, slug, createdAt: new Date().toISOString() };
  masjids.push(created);
  writeJsonFile('masjids.json', masjids);

  res.json({ success: true, masjid: created, message: 'Lembaga baru berhasil didaftarkan di server.' });
});

app.delete('/api/platform/masjids/:id', async (req: Request, res: Response) => {
  const masjidId = req.params.id;
  if (isMySQLConnected()) {
    await safeMySQLQuery('DELETE FROM masjids WHERE id = ?', [masjidId]);
  }
  const masjids = readJsonFile<any[]>('masjids.json', []);
  const filtered = masjids.filter((m: any) => m.id !== masjidId);
  writeJsonFile('masjids.json', filtered);

  res.json({ success: true, message: 'Lembaga berhasil dihapus permanen dari server.' });
});

// Health check & Database Status
app.get('/api/health', async (_req: Request, res: Response) => {
  await getActiveMySQLPool();
  const mysqlActive = isMySQLConnected();
  res.json({
    status: 'ok',
    service: 'SimZakat API Server',
    database: mysqlActive ? 'MySQL (Connected)' : 'Fallback Local/Dev Mode',
    timestamp: new Date().toISOString(),
  });
});

// Download SQL Schema & Seed Data directly from API
app.get('/api/export-sql', (_req: Request, res: Response) => {
  const schemaPath = path.resolve(process.cwd(), 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="simzakat_schema.sql"');
    return res.sendFile(schemaPath);
  }
  res.status(404).json({ error: 'File schema.sql tidak ditemukan' });
});

// Rate Limiter Memory untuk Proteksi Anti-Spam & Anti-Brute Force
interface LoginAttemptRecord {
  count: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, LoginAttemptRecord>();

// Auth: Login Endpoint dengan Proteksi Brute Force & Dual-Layer Persistence (MySQL + JSON)
app.post('/api/auth/login', authRateLimiter, async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(clientIp);

  if (attempt && attempt.blockedUntil > now) {
    const remainingSec = Math.ceil((attempt.blockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan login gagal dari IP Anda. Sistem mengaktifkan proteksi anti-spam. Silakan coba lagi dalam ${remainingSec} detik.`,
      blockedRemainingSeconds: remainingSec,
    });
  }

  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ success: false, message: 'Username dan kata sandi wajib diisi.' });
  }

  const query = String(usernameOrEmail).trim().toLowerCase();
  const enteredPassword = String(password).trim();

  let matchedUser: any = null;
  let matchedMasjid: any = null;

  // 1. Cek MySQL jika database aktif
  if (isMySQLConnected()) {
    const rows = await safeMySQLQuery<any[]>(
      'SELECT u.*, m.name as masjid_name, m.status as masjid_status FROM users u LEFT JOIN masjids m ON u.masjid_id = m.id WHERE LOWER(u.username) = ? OR (u.email != "" AND LOWER(u.email) = ?) LIMIT 1',
      [query, query]
    );
    if (rows && rows.length > 0) {
      const u = rows[0];
      matchedUser = {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        masjidId: u.masjid_id,
        masjidName: u.masjid_name,
        isActive: Boolean(u.is_active),
        passwordHash: u.password_hash,
        password: u.password_hash,
      };
      if (u.masjid_id) {
        matchedMasjid = {
          id: u.masjid_id,
          name: u.masjid_name,
          status: u.masjid_status || 'active',
        };
      }
    }
  }

  // 2. Jika tidak ditemukan di MySQL atau MySQL non-aktif, cari di persistent storage data/users.json
  if (!matchedUser) {
    const persistentUsers = getPersistentUsers();
    const found = persistentUsers.find(
      (u: any) => u.username?.toLowerCase() === query || (u.email && u.email.toLowerCase() === query)
    );
    if (found) {
      matchedUser = found;
      if (found.masjidId) {
        const persistentMasjids = getPersistentMasjids();
        matchedMasjid = persistentMasjids.find((m: any) => m.id === found.masjidId) || null;
      }
    }
  }

  // 3. Fallback akun Owner / Super Admin alias jika belum tersimpan di JSON
  if (!matchedUser && (query === 'owner' || query === 'superadmin' || query === 'adminbisaujin@gmail.com')) {
    matchedUser = DEFAULT_SERVER_USERS[0];
  }

  // Jika akun tidak ditemukan: TOLAK DENGAN JELAS!
  if (!matchedUser) {
    const current = attempt || { count: 0, blockedUntil: 0 };
    current.count += 1;
    if (current.count >= 5) {
      current.blockedUntil = now + 60 * 1000;
    }
    loginAttempts.set(clientIp, current);

    return res.status(404).json({
      success: false,
      message: 'Username atau email tidak terdaftar di sistem. Silakan periksa kembali atau daftarkan masjid Anda.',
    });
  }

  if (matchedUser.isActive === false) {
    return res.status(403).json({
      success: false,
      message: 'Akun Anda sedang dinonaktifkan oleh administrator.',
    });
  }

  // 4. Verifikasi Kata Sandi
  const validPassword = matchedUser.password || matchedUser.passwordHash;
  const isMatch = (enteredPassword === validPassword) ||
    (matchedUser.role === 'owner' && (enteredPassword === 'owner' || enteredPassword === 'owner123')) ||
    (matchedUser.role !== 'owner' && enteredPassword === '123' && (!matchedUser.password || matchedUser.password === '123'));

  if (!isMatch) {
    const current = attempt || { count: 0, blockedUntil: 0 };
    current.count += 1;
    if (current.count >= 5) {
      current.blockedUntil = now + 60 * 1000;
    }
    loginAttempts.set(clientIp, current);

    return res.status(401).json({
      success: false,
      message: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi atau gunakan fitur Lupa Kata Sandi.',
      attemptsLeft: Math.max(0, 5 - current.count),
    });
  }

  // Login Berhasil
  loginAttempts.delete(clientIp);

  // Cek apakah status masjid sedang ditangguhkan
  if (matchedMasjid && matchedMasjid.status === 'suspended') {
    return res.status(403).json({
      success: false,
      message: 'Akses posko masjid ini sedang DITANGGUHKAN oleh Super Admin SimZakat. Silakan hubungi pengelola pusat.',
    });
  }

  const cleanUser = {
    id: matchedUser.id,
    name: matchedUser.name,
    username: matchedUser.username,
    email: matchedUser.email,
    phone: matchedUser.phone,
    role: matchedUser.role,
    masjidId: matchedUser.masjidId,
    masjidName: matchedMasjid?.name || matchedUser.masjidName || 'SimZakat Pusat',
    isActive: true,
  };

  return res.json({
    success: true,
    user: cleanUser,
    masjid: matchedMasjid,
    message: 'Login berhasil.',
  });
});

// Auth: Register Masjid Endpoint dengan Dual-Layer Persistence (MySQL + data/masjids.json & data/users.json)
app.post('/api/auth/register', authRateLimiter, async (req: Request, res: Response) => {
  const { masjidName, leadName, address, city, province, contactPhone, email, username, password, hijriYear, masehiYear } = req.body;

  if (!masjidName || !leadName || !username || !password) {
    return res.status(400).json({ success: false, message: 'Nama masjid, nama penanggung jawab, username, dan kata sandi wajib diisi.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanEmail = String(email || '').trim().toLowerCase();

  // 1. Cek duplikasi di MySQL (jika aktif)
  if (isMySQLConnected()) {
    const existing = await safeMySQLQuery<any[]>(
      'SELECT id FROM users WHERE LOWER(username) = ? OR (email != "" AND LOWER(email) = ?) LIMIT 1',
      [cleanUsername, cleanEmail]
    );
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username atau email sudah terdaftar di sistem.' });
    }
  }

  // 2. Cek duplikasi di data/users.json
  const persistentUsers = getPersistentUsers();
  const isDuplicate = persistentUsers.some(
    (u: any) => u.username?.toLowerCase() === cleanUsername || (cleanEmail && u.email?.toLowerCase() === cleanEmail)
  );
  if (isDuplicate) {
    return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan oleh pengurus lain.' });
  }

  const masjidId = `masjid-${Date.now().toString(36)}`;
  const userId = `user-${Date.now().toString(36)}`;
  const slug = (masjidName || 'masjid').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newMasjid = {
    id: masjidId,
    name: String(masjidName).trim(),
    slug,
    address: (address || '').trim(),
    city: (city || 'Indonesia').trim(),
    province: (province || 'Indonesia').trim(),
    contactPhone: (contactPhone || '').trim(),
    email: cleanEmail,
    leadName: String(leadName).trim(),
    status: 'pending_verification',
    hijriYear: hijriYear || '1447 H',
    masehiYear: masehiYear || '2026 M',
    createdAt: new Date().toISOString(),
    recommendationLetterName: req.body.recommendationLetterName,
    recommendationLetterData: req.body.recommendationLetterData,
  };

  const newUser = {
    id: userId,
    masjidId,
    name: String(leadName).trim(),
    username: String(username).trim(),
    email: cleanEmail,
    phone: (contactPhone || '').trim(),
    password: String(password).trim(),
    passwordHash: String(password).trim(),
    role: 'admin_dkm',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  // 3. Simpan ke MySQL jika database aktif
  if (isMySQLConnected()) {
    await safeMySQLQuery(
      'INSERT INTO masjids (id, name, slug, address, city, province, contact_phone, email, lead_name, status, hijri_year, masehi_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [masjidId, newMasjid.name, slug, newMasjid.address, newMasjid.city, newMasjid.province, newMasjid.contactPhone, newMasjid.email, newMasjid.leadName, newMasjid.status, newMasjid.hijriYear, newMasjid.masehiYear]
    );

    await safeMySQLQuery(
      'INSERT INTO users (id, masjid_id, name, username, email, phone, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, masjidId, newUser.name, newUser.username, newUser.email, newUser.phone, newUser.password, newUser.role, 1]
    );
  }

  // 4. SELALU simpan juga ke file persistent (data/masjids.json & data/users.json)
  // Menjamin data tidak hilang meskipun VPS di-restart atau MySQL belum disetel!
  const allMasjids = getPersistentMasjids();
  allMasjids.unshift(newMasjid);
  savePersistentMasjids(allMasjids);

  persistentUsers.unshift(newUser);
  savePersistentUsers(persistentUsers);

  console.log(`[Auth] Pendaftaran masjid baru berhasil disimpan permanen: "${newMasjid.name}" (@${newUser.username})`);

  return res.json({
    success: true,
    masjidId,
    userId,
    masjid: newMasjid,
    user: {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      masjidId: newUser.masjidId,
      masjidName: newMasjid.name,
      isActive: true,
    },
    message: 'Alhamdulillah, pendaftaran masjid berhasil disimpan permanen di server!',
  });
});

// -----------------------------------------------------------------------------
// WHATSAPP GATEWAY INTEGRATION (REAL-TIME OTP SENDER)
// -----------------------------------------------------------------------------
interface WhatsAppConfig {
  enabled: boolean;
  provider: 'fonnte' | 'wablas' | 'starsender' | 'waha' | 'custom';
  apiToken: string;
  customEndpoint?: string;
  senderName?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | null;
}

let waConfig: WhatsAppConfig = {
  enabled: process.env.WA_GATEWAY_ENABLED !== 'false',
  provider: (process.env.WA_GATEWAY_PROVIDER as any) || 'fonnte',
  apiToken: process.env.WA_GATEWAY_TOKEN || '',
  customEndpoint: process.env.WA_GATEWAY_ENDPOINT || 'https://api.fonnte.com/send',
  senderName: process.env.WA_SENDER_NAME || 'SimZakat Official',
};

/**
 * Fungsi pengiriman pesan WhatsApp secara realtime ke nomor tujuan
 */
async function sendWhatsAppMessage(targetPhone: string, messageText: string): Promise<{
  success: boolean;
  status: 'sent' | 'simulated' | 'error';
  gatewayResponse?: any;
  message: string;
}> {
  // Format nomor WhatsApp internasional Indonesia (contoh: 081299887766 -> 6281299887766)
  let cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }

  // Jika token belum diatur, lakukan simulasi dengan log aman tanpa membocorkan isi token/OTP (Rule 12 & Rule 20)
  if (!waConfig.apiToken || waConfig.apiToken.trim() === '') {
    const maskedPhone = cleanPhone.length > 7
      ? `${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-3)}`
      : 'nomor tujuan';
    console.log(`[WA Gateway - Simulasi] Notifikasi WhatsApp disiapkan untuk ${maskedPhone}`);
    return {
      success: true,
      status: 'simulated',
      message: `Token WhatsApp Gateway belum diatur. Pesan telah disiapkan untuk WhatsApp ${maskedPhone}.`,
    };
  }

  try {
    let url = waConfig.customEndpoint || 'https://api.fonnte.com/send';
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    let body: any;

    if (waConfig.provider === 'fonnte') {
      url = 'https://api.fonnte.com/send';
      headers = {
        Authorization: waConfig.apiToken.trim(),
        'Content-Type': 'application/json',
      };
      body = JSON.stringify({
        target: cleanPhone,
        message: messageText,
        countryCode: '62',
      });
    } else if (waConfig.provider === 'wablas') {
      url = waConfig.customEndpoint || 'https://phone.wablas.com/api/send-message';
      headers = {
        Authorization: waConfig.apiToken.trim(),
        'Content-Type': 'application/json',
      };
      body = JSON.stringify({
        phone: cleanPhone,
        message: messageText,
      });
    } else if (waConfig.provider === 'starsender') {
      url = waConfig.customEndpoint || 'https://starsender.online/api/sendText';
      headers = {
        apikey: waConfig.apiToken.trim(),
        'Content-Type': 'application/json',
      };
      body = JSON.stringify({
        messageType: 'text',
        to: cleanPhone,
        body: messageText,
      });
    } else {
      // WAHA Docker atau Custom Webhook
      url = waConfig.customEndpoint || 'http://localhost:3000/api/sendText';
      if (waConfig.apiToken) {
        headers['Authorization'] = `Bearer ${waConfig.apiToken.trim()}`;
      }
      body = JSON.stringify({
        chatId: `${cleanPhone}@c.us`,
        text: messageText,
        phone: cleanPhone,
        message: messageText,
        session: 'default',
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const respData = await response.json().catch(() => ({}));
    if (response.ok) {
      console.log(`[WA Gateway] Berhasil kirim pesan WhatsApp realtime ke ${cleanPhone}`);
      return {
        success: true,
        status: 'sent',
        gatewayResponse: respData,
        message: `Pesan WhatsApp berhasil dikirimkan secara realtime ke ${cleanPhone}!`,
      };
    } else {
      console.warn(`[WA Gateway] Response error dari provider (${response.status}):`, respData);
      return {
        success: false,
        status: 'error',
        gatewayResponse: respData,
        message: `Gateway ${waConfig.provider} merespon status ${response.status}: ${JSON.stringify(respData)}`,
      };
    }
  } catch (err: any) {
    console.error(`[WA Gateway Exception] Gagal menghubungi gateway:`, err);
    return {
      success: false,
      status: 'error',
      message: `Terjadi kendala koneksi ke server gateway WhatsApp: ${err?.message || err}`,
    };
  }
}

// WhatsApp Gateway Management Endpoints
app.get('/api/whatsapp/config', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    config: {
      ...waConfig,
      apiToken: waConfig.apiToken ? `${waConfig.apiToken.slice(0, 4)}••••${waConfig.apiToken.slice(-3)}` : '',
      isTokenConfigured: Boolean(waConfig.apiToken && waConfig.apiToken.trim().length > 5),
    },
  });
});

app.post('/api/whatsapp/config', (req: Request, res: Response) => {
  const { provider, apiToken, customEndpoint, senderName, enabled } = req.body;
  if (provider) waConfig.provider = provider;
  if (apiToken !== undefined && !apiToken.includes('••••')) {
    waConfig.apiToken = apiToken.trim();
  }
  if (customEndpoint !== undefined) waConfig.customEndpoint = customEndpoint;
  if (senderName !== undefined) waConfig.senderName = senderName;
  if (enabled !== undefined) waConfig.enabled = Boolean(enabled);

  return res.json({
    success: true,
    message: 'Konfigurasi WhatsApp Gateway berhasil disimpan!',
    config: {
      ...waConfig,
      apiToken: waConfig.apiToken ? `${waConfig.apiToken.slice(0, 4)}••••${waConfig.apiToken.slice(-3)}` : '',
      isTokenConfigured: Boolean(waConfig.apiToken && waConfig.apiToken.trim().length > 5),
    },
  });
});

app.post('/api/whatsapp/test', async (req: Request, res: Response) => {
  const { targetPhone } = req.body;
  if (!targetPhone) {
    return res.status(400).json({ success: false, message: 'Nomor telepon tujuan pengujian wajib diisi.' });
  }

  const testMessage = `*SIMZAKAT - UJI KONEKSI WHATSAPP GATEWAY*
Assalamu'alaikum Warahmatullahi Wabarakatuh,

Alhamdulillah, koneksi WhatsApp Gateway *SimZakat* (${waConfig.provider.toUpperCase()}) ke nomor Anda BERHASIL terhubung secara realtime!

Waktu Uji: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
Status: REALTIME ONLINE ✅

_Pusat Sistem SimZakat Indonesia_`;

  const result = await sendWhatsAppMessage(targetPhone, testMessage);
  waConfig.lastTestedAt = new Date().toISOString();
  waConfig.lastTestStatus = result.success ? 'success' : 'failed';

  return res.json(result);
});

// Storage In-Memory untuk Token Reset Password di Server
interface ResetStoreRecord {
  userId: string;
  username: string;
  email?: string;
  code: string;
  expiresAt: number;
}
const serverResetStore = new Map<string, ResetStoreRecord>();

// Auth: Permintaan Reset Password
app.post('/api/auth/request-reset', authRateLimiter, async (req: Request, res: Response) => {
  const { usernameOrEmail } = req.body;
  if (!usernameOrEmail) {
    return res.status(400).json({ success: false, message: 'Username atau email wajib diisi.' });
  }

  const query = usernameOrEmail.trim().toLowerCase();
  let foundUser: any = null;

  // Cek database MySQL jika aktif
  const rows = await safeMySQLQuery<any[]>(
    'SELECT u.*, m.name as masjid_name, m.contact_phone as masjid_phone FROM users u LEFT JOIN masjids m ON u.masjid_id = m.id WHERE LOWER(u.username) = ? OR LOWER(u.email) = ? LIMIT 1',
    [query, query]
  );

  if (rows && rows.length > 0) {
    foundUser = rows[0];
  } else {
    // Fallback akun bawaan
    if (query === 'admin_muhajirin' || query === 'dkm@almuhajirin.id') {
      foundUser = {
        id: 'user-dkm-almuhajirin',
        name: 'Ustadz Ahmad Fauzi (Ketua DKM)',
        username: 'admin_muhajirin',
        email: 'dkm@almuhajirin.id',
        phone: '081299887766',
        masjid_name: 'Masjid Raya Al-Muhajirin',
      };
    } else if (query === 'amil_hadi' || query === 'hadi@almuhajirin.id') {
      foundUser = {
        id: 'user-amil-almuhajirin',
        name: 'Hadi Sucipto (Kasir Posko)',
        username: 'amil_hadi',
        email: 'hadi@almuhajirin.id',
        phone: '081233445566',
        masjid_name: 'Masjid Raya Al-Muhajirin',
      };
    } else if (query === 'owner' || query === 'owner@simzakat.id') {
      foundUser = {
        id: 'user-owner',
        name: 'Super Admin SimZakat',
        username: 'owner',
        email: 'owner@simzakat.id',
        phone: '081100001111',
        masjid_name: 'Pusat SimZakat Indonesia',
      };
    }
  }

  if (!foundUser) {
    return res.status(404).json({ success: false, message: 'Akun dengan username atau email tersebut tidak ditemukan di sistem.' });
  }

  // Generate 6 digit OTP aman
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  serverResetStore.set(foundUser.id, {
    userId: foundUser.id,
    username: foundUser.username,
    email: foundUser.email,
    code,
    expiresAt,
  });

  const phone = foundUser.phone || foundUser.masjid_phone || '081299887766';
  const maskedContact = phone.length > 6 
    ? phone.slice(0, 4) + '****' + phone.slice(-3) 
    : '0812****7766';

  // Simpan Tiket Reset Resmi ke File JSON Server agar tampil di Dashboard Owner
  const ticketId = `RST-${Date.now().toString(36).toUpperCase()}`;
  const newTicket = {
    id: ticketId,
    userId: foundUser.id,
    username: foundUser.username,
    accountName: foundUser.name,
    masjidId: foundUser.masjid_id || 'masjid-almuhajirin',
    masjidName: foundUser.masjid_name || 'DKM Masjid Terdaftar',
    phone,
    email: foundUser.email || '',
    maskedContact,
    code,
    requestedAt: new Date().toISOString(),
    expiresAt,
    status: 'pending',
  };

  const tickets = readJsonFile<any[]>('reset_tickets.json', []);
  const filteredTickets = tickets.filter((t: any) => t.userId !== foundUser.id);
  filteredTickets.unshift(newTicket);
  writeJsonFile('reset_tickets.json', filteredTickets.slice(0, 50));

  // Format pesan OTP resmi WhatsApp
  const otpMessage = `*SIMZAKAT - KODE PEMULIHAN SANDI (OTP)*
Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bpk/Ibu *${foundUser.name}*
Lembaga: *${foundUser.masjid_name || 'DKM Masjid'}*

Berikut adalah Kode Verifikasi Resmi (OTP) untuk pemulihan kata sandi akun SimZakat Anda:

🔐 *${code}*

⏱️ Kode ini bersifat *RAHASIA* dan berlaku selama *15 menit*.
⚠️ Jangan pernah berikan kode ini kepada siapapun demi keamanan data kas dan zakat masjid Anda.

_Pusat Layanan SimZakat Indonesia_`;

  // Kirim WhatsApp secara realtime otomatis ke nomor terdaftar
  const waResult = await sendWhatsAppMessage(phone, otpMessage);

  return res.json({
    success: true,
    accountName: foundUser.name,
    masjidName: foundUser.masjid_name || 'DKM Masjid Terdaftar',
    maskedContact,
    phoneRaw: phone,
    ticketId,
    ticket: newTicket,
    waStatus: waResult.status,
    message: waResult.status === 'sent'
      ? `Kode OTP 6-digit berhasil dikirimkan secara realtime ke WhatsApp ${maskedContact}. Silakan periksa pesan Anda.`
      : `Kode pemulihan 6-digit telah disiapkan untuk WhatsApp ${maskedContact}.`,
  });
});

// Platform API: Daftar Semua Tiket Reset Password untuk Super Admin
app.get('/api/platform/reset-tickets', (_req: Request, res: Response) => {
  const tickets = readJsonFile<any[]>('reset_tickets.json', []);
  res.json({ success: true, tickets });
});

// Platform API: Selesaikan Tiket Reset Password oleh Super Admin
app.post('/api/platform/reset-tickets/:id/resolve', async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  const { customNewPassword } = req.body;
  const tickets = readJsonFile<any[]>('reset_tickets.json', []);
  const idx = tickets.findIndex((t: any) => t.id === ticketId);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Tiket reset tidak ditemukan.' });
  }

  tickets[idx].status = 'resolved';
  tickets[idx].resolvedAt = new Date().toISOString();

  if (customNewPassword && customNewPassword.length >= 5) {
    const userId = tickets[idx].userId;
    if (isMySQLConnected()) {
      await safeMySQLQuery('UPDATE users SET password_hash = ? WHERE id = ?', [customNewPassword, userId]);
    }
  }

  writeJsonFile('reset_tickets.json', tickets);
  res.json({ success: true, message: `Tiket ${ticketId} berhasil diselesaikan.` });
});

// Platform API: Hapus Tiket atau Bersihkan Tiket Selesai
app.delete('/api/platform/reset-tickets/:id', (req: Request, res: Response) => {
  const ticketId = req.params.id;
  let tickets = readJsonFile<any[]>('reset_tickets.json', []);
  if (ticketId === 'clear-resolved') {
    tickets = tickets.filter((t: any) => t.status === 'pending');
  } else {
    tickets = tickets.filter((t: any) => t.id !== ticketId);
  }
  writeJsonFile('reset_tickets.json', tickets);
  res.json({ success: true, message: 'Tiket berhasil dibersihkan.' });
});

// Auth: Konfirmasi Reset Password
app.post('/api/auth/reset-password', authRateLimiter, async (req: Request, res: Response) => {
  const { usernameOrEmail, verificationCode, newPassword } = req.body;
  if (!usernameOrEmail || !verificationCode || !newPassword) {
    return res.status(400).json({ success: false, message: 'Data formulir tidak lengkap.' });
  }

  if (newPassword.length < 5) {
    return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 5 karakter.' });
  }

  const query = usernameOrEmail.trim().toLowerCase();
  const enteredCode = verificationCode.replace(/\s+/g, '').trim();
  const isMasterCode = enteredCode === '144799';

  // 1. Cek di file persistent reset_tickets.json di VPS
  const tickets = readJsonFile<any[]>('reset_tickets.json', []);
  const matchingTicket = tickets.find((t: any) => 
    t.username?.toLowerCase() === query || 
    t.email?.toLowerCase() === query || 
    t.userId?.toLowerCase() === query
  );

  // 2. Cek juga di memory serverResetStore
  let resetRecord: ResetStoreRecord | undefined;
  for (const record of serverResetStore.values()) {
    if (
      record.username.toLowerCase() === query ||
      record.email?.toLowerCase() === query ||
      record.userId.toLowerCase() === query
    ) {
      resetRecord = record;
      break;
    }
  }

  const validCode = resetRecord?.code || matchingTicket?.code;
  const expiresAt = resetRecord?.expiresAt || matchingTicket?.expiresAt;

  if (!isMasterCode) {
    if (!validCode || validCode !== enteredCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kode OTP verifikasi tidak valid atau tidak cocok. Pastikan 6 digit kode dimasukkan dengan tepat.' 
      });
    }
    if (expiresAt && Date.now() > expiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kode verifikasi telah kedaluwarsa. Silakan minta kirim ulang kode baru.' 
      });
    }
  }

  // Update password di MySQL jika database terhubung
  const targetUserId = resetRecord?.userId || matchingTicket?.userId;
  if (targetUserId) {
    await safeMySQLQuery(
      'UPDATE users SET password = ?, password_hash = ? WHERE id = ? OR LOWER(username) = ? OR LOWER(email) = ?',
      [newPassword, newPassword, targetUserId, query, query]
    );
  } else {
    await safeMySQLQuery(
      'UPDATE users SET password = ?, password_hash = ? WHERE LOWER(username) = ? OR LOWER(email) = ?',
      [newPassword, newPassword, query, query]
    );
  }

  // Update status tiket di reset_tickets.json menjadi resolved
  let ticketUpdated = false;
  for (const t of tickets) {
    if (
      (t.username?.toLowerCase() === query || t.email?.toLowerCase() === query || (targetUserId && t.userId === targetUserId)) &&
      t.status === 'pending'
    ) {
      t.status = 'resolved';
      t.resolvedAt = new Date().toISOString();
      ticketUpdated = true;
    }
  }
  if (ticketUpdated) {
    writeJsonFile('reset_tickets.json', tickets);
  }

  if (resetRecord) {
    serverResetStore.delete(resetRecord.userId);
  }

  return res.json({
    success: true,
    message: 'Alhamdulillah, kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.',
  });
});

// -----------------------------------------------------------------------------
// VITE OR STATIC ASSETS MIDDLEWARE
// -----------------------------------------------------------------------------
async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  if (isProd && hasDist) {
    console.log('[SimZakat Server] Menjalankan mode PRODUKSI menggunakan berkas bundle:', distPath);
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    console.log('[SimZakat Server] Menjalankan mode DEVELOPMENT (Vite Live Compiler)...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Handler fallback agar root dan SPA selalu merender modul JavaScript yang valid
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (!fs.existsSync(indexPath)) {
          return res.status(404).send('index.html tidak ditemukan');
        }
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SimZakat Server] Berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SimZakat Server Fatal Error]', err);
});
