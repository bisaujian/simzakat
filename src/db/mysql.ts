import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

let pool: Pool | null = null;
let isMySQLEnabled = false;
let isConnectionTested = false;

/**
 * Mendapatkan pool koneksi MySQL jika tersedia dan server aktif.
 * Jika MySQL belum diinstal/dijalankan (misal di preview dev), fungsi ini akan
 * beralih secara anggun (graceful fallback) tanpa melempar error ECONNREFUSED.
 */
export async function getActiveMySQLPool(): Promise<Pool | null> {
  // Hanya inisialisasi jika variabel host MySQL didefinisikan secara eksplisit
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

    // Uji koneksi dengan ping cepat
    const conn = await tempPool.getConnection();
    await conn.ping();
    conn.release();

    pool = tempPool;
    isMySQLEnabled = true;
    isConnectionTested = true;
    console.log(`[Database] Berhasil terhubung ke MySQL Server: ${host}:${port}/${database}`);
    return pool;
  } catch (_err) {
    // Tangani error koneksi seperti ECONNREFUSED secara elegan tanpa mengotori log
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
    // Jika koneksi terputus saat query, nonaktifkan pool sementara
    isMySQLEnabled = false;
    pool = null;
    return null;
  }
}

export function isMySQLConnected(): boolean {
  return isMySQLEnabled && pool !== null;
}
