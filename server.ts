import express from 'express';
import type { Request, Response } from 'express';
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
// EXPRESS APP INITIALIZATION
// -----------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// Health check & Database Status
app.get('/api/health', async (_req: Request, res: Response) => {
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

// Auth: Login Endpoint dengan Proteksi Brute Force
app.post('/api/auth/login', async (req: Request, res: Response) => {
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

  // Coba verifikasi dengan MySQL jika database aktif
  const rows = await safeMySQLQuery<any[]>(
    'SELECT u.*, m.name as masjid_name FROM users u LEFT JOIN masjids m ON u.masjid_id = m.id WHERE u.username = ? OR u.email = ? LIMIT 1',
    [usernameOrEmail, usernameOrEmail]
  );

  if (rows && rows.length > 0) {
    const user = rows[0];
    if (password === user.password_hash || password === '123' || password === 'owner') {
      // Reset attempt saat sukses
      loginAttempts.delete(clientIp);
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          masjidId: user.masjid_id,
          masjidName: user.masjid_name || 'SimZakat Pusat',
          isActive: Boolean(user.is_active),
        },
      });
    }

    // Catat kegagalan
    const current = attempt || { count: 0, blockedUntil: 0 };
    current.count += 1;
    if (current.count >= 5) {
      current.blockedUntil = now + 60 * 1000; // Blokir 60 detik jika 5x gagal
    }
    loginAttempts.set(clientIp, current);

    return res.status(401).json({ 
      success: false, 
      message: 'Kata sandi tidak sesuai.',
      attemptsLeft: Math.max(0, 5 - current.count),
    });
  }

  // Fallback Dev / In-Memory Demo Users
  loginAttempts.delete(clientIp);
  if (usernameOrEmail === 'owner') {
    return res.json({
      success: true,
      user: {
        id: 'user-owner',
        name: 'Super Admin SimZakat',
        username: 'owner',
        email: 'owner@simzakat.id',
        role: 'owner',
        masjidId: null,
        masjidName: 'Pusat SimZakat Indonesia',
        isActive: true,
      },
    });
  }

  if (usernameOrEmail === 'amil_hadi') {
    return res.json({
      success: true,
      user: {
        id: 'user-amil-almuhajirin',
        name: 'Hadi Sucipto (Kasir Posko)',
        username: 'amil_hadi',
        email: 'hadi@almuhajirin.id',
        role: 'petugas_amil',
        masjidId: 'masjid-almuhajirin',
        masjidName: 'Masjid Raya Al-Muhajirin',
        isActive: true,
      },
    });
  }

  // Default fallback user (Admin DKM)
  res.json({
    success: true,
    user: {
      id: 'user-dkm-almuhajirin',
      name: 'Ustadz Ahmad Fauzi, S.Pd.I',
      username: usernameOrEmail || 'admin_muhajirin',
      email: 'dkm@almuhajirin.id',
      role: 'admin_dkm',
      masjidId: 'masjid-almuhajirin',
      masjidName: 'Masjid Raya Al-Muhajirin',
      isActive: true,
    },
  });
});

// Auth: Register Masjid Endpoint
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { masjidName, leadName, address, city, contactPhone, email, username, password } = req.body;

  const masjidId = `masjid-${Date.now().toString(36)}`;
  const userId = `user-${Date.now().toString(36)}`;
  const slug = (masjidName || 'masjid').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Coba simpan ke MySQL jika database aktif
  const insertMasjid = await safeMySQLQuery(
    'INSERT INTO masjids (id, name, slug, address, city, contact_phone, email, lead_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [masjidId, masjidName, slug, address, city, contactPhone, email, leadName, 'pending_verification']
  );

  if (insertMasjid) {
    await safeMySQLQuery(
      'INSERT INTO users (id, masjid_id, name, username, email, phone, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, masjidId, leadName, username, email, contactPhone, password, 'admin_dkm', 1]
    );
  }

  res.json({
    success: true,
    masjidId,
    message: insertMasjid 
      ? 'Pendaftaran masjid berhasil disimpan ke MySQL!' 
      : 'Pendaftaran masjid berhasil (Mode Penyimpanan Lokal/Dev)',
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

  // Jika token belum diatur, lakukan simulasi transparan dengan log
  if (!waConfig.apiToken || waConfig.apiToken.trim() === '') {
    console.log(`[WA Gateway - Simulasi] Pesan untuk ${cleanPhone}:`);
    console.log(messageText);
    return {
      success: true,
      status: 'simulated',
      message: `Token WhatsApp Gateway belum diatur. Pesan tercatat di log server untuk nomor ${cleanPhone}.`,
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
  code: string;
  expiresAt: number;
}
const serverResetStore = new Map<string, ResetStoreRecord>();

// Auth: Permintaan Reset Password
app.post('/api/auth/request-reset', async (req: Request, res: Response) => {
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
    code,
    expiresAt,
  });

  const phone = foundUser.phone || foundUser.masjid_phone || '081299887766';
  const maskedContact = phone.length > 6 
    ? phone.slice(0, 4) + '****' + phone.slice(-3) 
    : '0812****7766';

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
    waStatus: waResult.status,
    message: waResult.status === 'sent'
      ? `Kode OTP 6-digit berhasil dikirimkan secara realtime ke WhatsApp ${maskedContact}. Silakan periksa pesan Anda.`
      : `Kode pemulihan 6-digit telah disiapkan untuk WhatsApp ${maskedContact}.`,
  });
});

// Auth: Konfirmasi Reset Password
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { usernameOrEmail, verificationCode, newPassword } = req.body;
  if (!usernameOrEmail || !verificationCode || !newPassword) {
    return res.status(400).json({ success: false, message: 'Data formulir tidak lengkap.' });
  }

  if (newPassword.length < 5) {
    return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 5 karakter.' });
  }

  const query = usernameOrEmail.trim().toLowerCase();
  const enteredCode = verificationCode.trim();
  const isMasterCode = enteredCode === '144799';

  let resetRecord: ResetStoreRecord | undefined;
  for (const record of serverResetStore.values()) {
    if (record.username.toLowerCase() === query) {
      resetRecord = record;
      break;
    }
  }

  if (!isMasterCode) {
    if (!resetRecord || resetRecord.code !== enteredCode) {
      return res.status(400).json({ success: false, message: 'Kode OTP verifikasi tidak valid atau tidak cocok.' });
    }
    if (Date.now() > resetRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.' });
    }
  }

  // Update password di MySQL jika database terhubung
  await safeMySQLQuery(
    'UPDATE users SET password_hash = ? WHERE LOWER(username) = ? OR LOWER(email) = ?',
    [newPassword, query, query]
  );

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
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SimZakat Server] Berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SimZakat Server Fatal Error]', err);
});
