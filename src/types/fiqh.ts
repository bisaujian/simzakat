import { AsnafType } from './zakat';

export interface DoaItem {
  id: string;
  title: string;
  category: 'amil_menerima' | 'fitrah_sendiri' | 'fitrah_keluarga' | 'zakat_maal' | 'doa_muzakki' | 'sunnah_nabi';
  arabic: string;
  latin: string;
  arti: string;
  keterangan?: string;
}

export interface AsnafCustomGuideline {
  id: AsnafType;
  title: string;
  arabicName: string;
  kriteriaUtama: string;
  indikatorKifayah: string;
  prioritasAlokasi: string;
  catatanFiqih: string;
  dokumenSyarat?: string;
}

export interface SopZakatConfig {
  standarBerasFitrahKg: number;
  standarBerasFitrahLiter: number;
  batasWaktuPenyaluran: string;
  maksimalHakAmilPersen: number;
  panduanIjabQabul: string;
  pesanKuitansiTambahan: string;
}

export interface FiqhPlatformConfig {
  doaAmil: DoaItem;
  niatFitrahSendiri: DoaItem;
  niatFitrahKeluarga: DoaItem;
  niatZakatMaal: DoaItem;
  doaAmilMendoakan: DoaItem;
  doaSunnahNabi: DoaItem;
  asnafGuidelines: Record<AsnafType, AsnafCustomGuideline>;
  sopConfig: SopZakatConfig;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}
