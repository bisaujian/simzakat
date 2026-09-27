export type ZakatCategory = 'fitrah' | 'maal' | 'profesi' | 'infaq' | 'fidyah';

export type AsnafType = 
  | 'fakir' 
  | 'miskin' 
  | 'amil' 
  | 'mualaf' 
  | 'riqab' 
  | 'gharimin' 
  | 'fisabilillah' 
  | 'ibnu_sabil';

export interface SkKemenagTier {
  id: string;
  name: string;           // e.g. "Kategori I (Beras Premium)"
  riceType: string;       // e.g. "Pandan Wangi, Rojolele, Mentik Wangi"
  pricePerSoulRp: number; // e.g. 50000
  description?: string;
}

export interface FitrahDetail {
  payerCount: number;
  familyMembers: string[];
  unit: 'uang' | 'beras' | 'kombinasi';
  riceWeightKg: number;
  nominalRp: number;
  ratePerPerson: number;
  // Enhanced attributes:
  riceWeightPerSoulKg?: number; // e.g. 2.5, 2.8, 3.0, or custom
  skKemenagTierId?: string;     // e.g. 'tier-1', 'tier-2', 'custom'
  skKemenagTierName?: string;   // e.g. 'Kategori I (Beras Premium)'
  // Kolektif kombinasi (beras & uang dalam 1 muzakki):
  ricePayerCount?: number;      // Jumlah jiwa yang bayar beras
  moneyPayerCount?: number;     // Jumlah jiwa yang bayar uang
}

export type MaalSubtype = 
  | 'tabungan_emas'   // Nuqud: Emas, Perak, Uang Tabungan, Deposito (Nisab 85g Emas, 2.5%, Haul)
  | 'perniagaan'      // 'Urudh at-Tijarah: Stok Dagang + Kas + Piutang Lancar - Hutang Dagang (2.5%, Haul)
  | 'pertanian'       // Az-Zuru' wa Ats-Tsimar: Padi/Bahan Pangan (Nisab 653 Kg Beras, Wajib saat Panen, 5% atau 10%)
  | 'peternakan'      // Al-An'am: Kambing min 40, Sapi min 30 (Syarat Sa'imah, Haul 1 tahun)
  | 'rikaz_tambang'   // Rikaz (Harta karun purbakala 20% tanpa haul) & Ma'dan (Hasil Tambang 2.5%)
  | 'investasi'       // Saham, Reksadana, Hasil Aset Produktif (2.5%, Haul)
  | 'lainnya';

export interface MaalDetail {
  assetType: MaalSubtype;
  totalAssetRp: number;
  nominalRp: number;
  nisabMet: boolean;
  // Fiqih Syafi'i & BAZNAS/MUI/NU/Muhammadiyah attributes:
  nisabThresholdRp?: number;
  haulStatus?: 'telah_haul' | 'belum_haul' | 'saat_panen' | 'tanpa_haul';
  ratePercent?: number;          // e.g. 2.5, 5, 10, 20
  calculationNotes?: string;     // Penjelasan kaidah fiqih
  // Sub-detail untuk Pertanian:
  irrigationType?: 'hujan_sungai_10' | 'irigasi_pompa_5' | 'campuran_7_5';
  harvestWeightKg?: number;
  // Sub-detail untuk Peternakan:
  livestockType?: 'kambing' | 'sapi';
  livestockHeadCount?: number;
  livestockObligationDesc?: string;
  // Sub-detail untuk Emas & Tabungan:
  goldBarGrams?: number;         // Emas batangan/tabungan (wajib zakat)
  jewelryWornGrams?: number;     // Perhiasan mubah yang dipakai (bebas zakat menurut Syafi'i)
}

export interface ProfesiDetail {
  monthlyIncomeRp: number;
  nominalRp: number;
}

export interface InfaqDetail {
  nominalRp: number;
  allocation: 'operasional_masjid' | 'pembangunan' | 'sosial_yatim' | 'umum';
}

export interface FidyahDetail {
  daysCount: number;
  ratePerDayRp: number;
  nominalRp: number;
}

export interface MuzakkiTransaction {
  id: string;
  receiptNumber: string;
  timestamp: string; // ISO
  dateStr: string;   // YYYY-MM-DD
  name: string;
  phone: string;
  address: string;
  rtRw: string;
  category: ZakatCategory;
  fitrahDetail?: FitrahDetail;
  maalDetail?: MaalDetail;
  profesiDetail?: ProfesiDetail;
  infaqDetail?: InfaqDetail;
  fidyahDetail?: FidyahDetail;
  paymentMethod: 'tunai' | 'transfer_qris';
  amilName: string;
  notes?: string;
  // Computed quick stats
  totalMoneyRp: number;
  totalRiceKg: number;
}

export interface Mustahiq {
  id: string;
  name: string;
  nik?: string;
  kkNumber?: string;
  phone?: string;
  address: string;
  rtRw: string;
  asnaf: AsnafType;
  familyMembersCount: number;
  priority: 'sangat_mendesak' | 'mendesak' | 'reguler';
  status: 'aktif' | 'diverifikasi' | 'nonaktif';
  notes?: string;
  totalRiceReceivedKg: number;
  totalMoneyReceivedRp: number;
  lastDistributedAt?: string;
}

export interface DistributionRecord {
  id: string;
  dateStr: string;
  timestamp: string;
  mustahiqId: string;
  mustahiqName: string;
  asnaf: AsnafType;
  rtRw: string;
  riceKg: number;
  moneyRp: number;
  packageDescription?: string;
  distributorAmil: string;
  notes?: string;
}

export interface YearlyArchiveRecord {
  id: string;
  hijriYear: string;
  masehiYear: string;
  closedAt: string; // ISO
  closedBy: string;
  notes?: string;
  configSnapshot: AppConfig;
  transactionsCount: number;
  distributionsCount: number;
  mustahiqCount: number;
  transactions: MuzakkiTransaction[];
  distributions: DistributionRecord[];
  mustahiqSnapshot: Mustahiq[];
  summary: {
    totalTransactions: number;
    totalSouls: number;
    totalFitrahRiceKg: number;
    totalFitrahCashRp: number;
    totalMaalRp: number;
    totalInfaqRp: number;
    totalFidyahRp: number;
    totalMoneyInRp: number;
    totalDistributedRiceKg: number;
    totalDistributedMoneyRp: number;
    totalMustahiqServed: number;
  };
}

export interface AppConfig {
  organizationName: string;
  subTitle: string;
  hijriYear: string;
  masehiYear: string;
  address: string;
  phone: string;
  headAmil: string;
  treasurerName: string;
  // Fitrah Beras settings
  fitrahRiceKgPerSoul: number;    // default e.g. 2.8 or 2.5
  fitrahRiceOptions: number[];    // presets e.g. [2.5, 2.7, 2.8, 3.0, 3.5]
  // Fitrah Uang (SK Kemenag) settings
  skKemenagReference: string;     // e.g. "SK Kemenag & BAZNAS No. 1447 H / 2026 M"
  skKemenagTiers: SkKemenagTier[];
  fitrahMoneyPerSoul: number;     // default tier price (fallback e.g. 45000)
  goldPricePerGram: number;       // e.g. 1450000 -> nisab 85g = 123.250.000
  silverPricePerGram?: number;     // e.g. 18000 -> nisab 595g = 10.710.000
  grainHarvestNisabKg?: number;    // e.g. 653 Kg Beras (5 Wasaq)
  ricePricePerKgForNisab?: number; // e.g. 15000
  goatPricePerHead?: number;       // e.g. 2500000
  cowPricePerHead?: number;        // e.g. 14000000
  fidyahRatePerDay: number;       // e.g. 30000
}

export const ASNAF_LABELS: Record<AsnafType, { label: string; desc: string; color: string }> = {
  fakir: {
    label: 'Fakir',
    desc: 'Tidak memiliki harta dan penghasilan untuk kebutuhan pokok',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  miskin: {
    label: 'Miskin',
    desc: 'Memiliki penghasilan tapi tidak mencukupi kebutuhan pokok',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  amil: {
    label: 'Amil Zakat',
    desc: 'Pengurus/panitia yang bertugas mengumpulkan & mendistribusikan zakat',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  mualaf: {
    label: 'Mualaf',
    desc: 'Orang yang baru masuk Islam atau dikuatkan imannya',
    color: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  riqab: {
    label: 'Riqab',
    desc: 'Pembebasan hamba sahaya / perlindungan kemanusiaan',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  gharimin: {
    label: 'Gharimin',
    desc: 'Orang yang berhutang untuk kemaslahatan mubah & tidak mampu bayar',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  fisabilillah: {
    label: 'Fisabilillah',
    desc: 'Pihak yang berjuang di jalan Allah / dakwah / pendidikan Islam',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  ibnu_sabil: {
    label: 'Ibnu Sabil',
    desc: 'Musafir yang kehabisan bekal dalam perjalanan ketaatan',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
};
