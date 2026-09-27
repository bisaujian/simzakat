import { AppConfig, DistributionRecord, Mustahiq, MuzakkiTransaction } from '../types/zakat';
import { fiqhConfigService } from '../services/fiqhConfigService';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Memformat angka dengan pemisah ribuan titik (Indonesian standard: 1.000.000)
 */
export function formatThousands(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? Math.round(val) : parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('id-ID');
}

export function formatThousandsZero(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? Math.round(val) : parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toLocaleString('id-ID');
}

/**
 * Parsing string ber-titik menjadi number murni (e.g. "1.000.000" -> 1000000)
 */
export function parseThousands(val: string): number {
  if (!val) return 0;
  const digits = val.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Mengonversi nominal angka rupiah menjadi kalimat terbilang Bahasa Indonesia
 */
export function terbilangRupiah(nominal: number): string {
  if (!nominal || nominal <= 0) return '';
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  function convert(n: number): string {
    if (n < 12) return bilangan[n];
    if (n < 20) return convert(n - 10) + ' Belas';
    if (n < 100) return convert(Math.floor(n / 10)) + ' Puluh ' + convert(n % 10);
    if (n < 200) return 'Seratus ' + convert(n - 100);
    if (n < 1000) return convert(Math.floor(n / 100)) + ' Ratus ' + convert(n % 100);
    if (n < 2000) return 'Seribu ' + convert(n - 1000);
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Ribu ' + convert(n % 1000);
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Juta ' + convert(n % 1000000);
    if (n < 1000000000000) return convert(Math.floor(n / 1000000000)) + ' Miliar ' + convert(n % 1000000000);
    return convert(Math.floor(n / 1000000000000)) + ' Triliun ' + convert(n % 1000000000000);
  }

  return convert(Math.floor(nominal)).trim().replace(/\s+/g, ' ') + ' Rupiah';
}

export function formatKg(amount: number): string {
  return `${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Kg`;
}

export function formatDateIndo(isoOrDateStr: string): string {
  if (!isoOrDateStr) return '-';
  const d = new Date(isoOrDateStr);
  if (isNaN(d.getTime())) return isoOrDateStr;
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTimeIndo(isoString: string): string {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return `${d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
}

export function generateReceiptNumber(existingCount: number, hijriYearStr: string): string {
  const cleanYear = hijriYearStr.replace(/[^0-9]/g, '') || '1447';
  const nextNum = (existingCount + 1).toString().padStart(4, '0');
  return `ZKT-${cleanYear}-${nextNum}`;
}

export const DOA_COLLECTION = {
  get doaAmil() {
    return fiqhConfigService.getDoaCollection().doaAmil;
  },
  get niatFitrahSendiri() {
    return fiqhConfigService.getDoaCollection().niatFitrahSendiri;
  },
  get niatFitrahKeluarga() {
    return fiqhConfigService.getDoaCollection().niatFitrahKeluarga;
  },
  get niatZakatMaal() {
    return fiqhConfigService.getDoaCollection().niatZakatMaal;
  },
  get doaAmilMendoakan() {
    return fiqhConfigService.getDoaCollection().doaAmilMendoakan;
  },
  get doaSunnahNabi() {
    return fiqhConfigService.getDoaCollection().doaSunnahNabi;
  },
};

import { 
  exportMuzakkiToExcel, 
  exportMustahiqToExcel, 
  exportDistributionToExcel, 
  exportMasjidsToExcel 
} from './excelExport';

// Export helpers: Menghasilkan berkas Excel (.xls) ber-kop surat resmi, judul dokumen, border, dan footer total
export function exportMuzakkiToCSV(transactions: MuzakkiTransaction[], config: AppConfig) {
  exportMuzakkiToExcel(transactions, config);
}

export function exportMustahiqToCSV(mustahiqList: Mustahiq[], config: AppConfig) {
  exportMustahiqToExcel(mustahiqList, config);
}

export { 
  exportMuzakkiToExcel, 
  exportMustahiqToExcel, 
  exportDistributionToExcel, 
  exportMasjidsToExcel 
};
