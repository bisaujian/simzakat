export interface PriceTier {
  id: string;
  label: string;
  price: number;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ComparisonRow {
  id: string;
  need: string;
  manual: string;
  digital: string;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface LandingPageConfig {
  // Top Announcement
  announcementText: string;
  announcementBadge: string;

  // Hero Section
  heroAyatArabic: string;
  heroAyatTranslation: string;
  heroAyatRef: string;
  heroHeadline: string;
  heroHeadlineHighlight: string;
  heroSubtitle: string;

  // Counter Bar / Platform Stats Labels
  statsLabel1: string;
  statsLabel2: string;
  statsLabel3: string;
  statsLabel4: string;

  // 1. Simulasi Cepat Posko (Kalkulator Interaktif)
  simulatorBadge: string;
  simulatorTitle: string;
  simulatorSubtitle: string;
  simulatorDefaultKg: number;
  simulatorTiers: PriceTier[];

  // 2. Fitur Lengkap Posko
  featuresBadge: string;
  featuresTitle: string;
  featuresSubtitle: string;
  featuresList: FeatureItem[];

  // 3. Buku Kertas Tradisional vs SimZakat Digital
  comparisonTitle: string;
  comparisonHighlight: string;
  comparisonSubtitle: string;
  comparisonHeaderNeed: string;
  comparisonHeaderManual: string;
  comparisonHeaderDigital: string;
  comparisonRows: ComparisonRow[];

  // 4. Pertanyaan Umum (FAQ)
  faqBadge: string;
  faqTitle: string;
  faqSubtitle: string;
  faqsList: FaqItem[];

  // 5. Banner & Bagian Donasi Dakwah (Sustainability)
  sustainabilityTitle: string;
  sustainabilityDescription: string;
  sustainabilityButtonText: string;
  donationTitle: string;
  donationSubtitle: string;
  donationDescription: string;
  bsiBankName: string;
  bsiAccountNumber: string;
  bsiAccountHolder: string;
  bcaBankName: string;
  bcaAccountNumber: string;
  bcaAccountHolder: string;
  showDonationOnLogin: boolean;

  // 6. Banner Bawah (Bottom CTA Banner)
  ctaBannerTitle: string;
  ctaBannerSubtitle: string;
  ctaRegisterBtnText: string;
  ctaLoginBtnText: string;

  // 7. Footer & Kontak
  footerTitle: string;
  footerDescription: string;
  footerCopyright: string;
  contactWhatsApp: string;
  contactEmail: string;
  qrisImageUrl?: string;
}

export const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
  // Top Announcement
  announcementText: 'Sistem Informasi Manajemen Zakat Standar Kemenag RI, MUI & Had Kifayah BAZNAS',
  announcementBadge: 'Dakwah Digital',

  // Hero Section
  heroAyatArabic: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا',
  heroAyatTranslation: '"Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..."',
  heroAyatRef: 'QS. At-Taubah: 103',
  heroHeadline: 'Pencatatan Zakat Lebih',
  heroHeadlineHighlight: 'Amanah, Transparan',
  heroSubtitle: 'Bantu panitia amil DKM beralih dari buku tulis manual ke sistem digital modern. Lengkap dengan kasir zakat fitrah & maal, cetak struk kasir thermal, kuitansi A4, berita acara (BAST) 1-klik, dan verifikasi 8 asnaf.',

  // Counter Bar
  statsLabel1: 'Masjid & DKM Terdaftar',
  statsLabel2: 'Muzakki Terlayani',
  statsLabel3: 'Beras Fitrah Terhimpun',
  statsLabel4: 'Dana ZISWAF Dikelola',

  // 1. Simulasi Cepat Posko
  simulatorBadge: 'Simulasi Cepat Posko',
  simulatorTitle: 'Kalkulator Zakat Fitrah Interaktif',
  simulatorSubtitle: 'Coba langsung perhitungan otomatis kewajiban beras dan uang berdasarkan jumlah jiwa jamaah.',
  simulatorDefaultKg: 2.8,
  simulatorTiers: [
    { id: 't1', label: 'Kategori I (Beras Premium: Pandan Wangi/Rojolele)', price: 55000 },
    { id: 't2', label: 'Kategori II (Beras Menengah: Setra Ramos)', price: 45000 },
    { id: 't3', label: 'Kategori III (Beras Standar: IR-64)', price: 40000 },
    { id: 't4', label: 'Kategori IV (Beras Sederhana: SPHP Bulog)', price: 35000 },
  ],

  // 2. Fitur Lengkap Posko
  featuresBadge: 'Fitur Lengkap Posko',
  featuresTitle: 'Solusi Menyeluruh untuk Amil Zakat Modern',
  featuresSubtitle: 'Didesain khusus untuk kecepatan antrean muzakki dan kehati-hatian syariah penyaluran mustahiq.',
  featuresList: [
    {
      id: 'f1',
      title: 'Kuitansi Struk Thermal & A4',
      description: 'Cetak struk kasir printer thermal (58mm/80mm), dokumen A4 resmi berlogo DKM, unduh PDF jernih, atau kirim langsung ke WhatsApp muzakki dengan 1 klik.',
      icon: 'receipt',
    },
    {
      id: 'f2',
      title: 'Panduan Fiqih 8 Asnaf Terpadu',
      description: 'Tersedia pedoman verifikasi mustahiq bersumber dari Mazhab Syafi\'i, Fatwa MUI, Muktamar NU, Tarjih Muhammadiyah, dan Had Kifayah BAZNAS RI.',
      icon: 'scale',
    },
    {
      id: 'f3',
      title: 'Kalkulator Zakat Maal & Fidyah',
      description: 'Hitung otomatis nishab dan haul emas (85g), uang tabungan, perdagangan, hasil panen pertanian (5% / 10%), peternakan, profesi, serta fidyah puasa.',
      icon: 'calculator',
    },
    {
      id: 'f4',
      title: 'Manajemen Kuota Distribusi',
      description: 'Cegah pembagian ganda dengan verifikasi NIK/KK. Pantau sisa stok beras fisik di gudang dan dana kas secara transparan dan akurat.',
      icon: 'users',
    },
    {
      id: 'f5',
      title: 'Berita Acara (BAST) 1-Klik',
      description: 'Cetak dokumen Berita Acara Serah Terima (BAST) resmi panitia lengkap dengan tanda tangan Ketua DKM, Kepala Amil, dan Bendahara untuk laporan jamaah.',
      icon: 'file-text',
    },
    {
      id: 'f6',
      title: 'Mandiri & Siap VPS MySQL',
      description: 'Dapat dideploy langsung di VPS pribadi masjid (Ubuntu 22/24) dengan database MySQL terisolasi. Data jamaah sepenuhnya aman dalam kendali DKM.',
      icon: 'database',
    },
  ],

  // 3. Buku Kertas Tradisional vs SimZakat Digital
  comparisonTitle: 'Buku Kertas Tradisional vs',
  comparisonHighlight: 'SimZakat Digital',
  comparisonSubtitle: 'Transformasi pengelolaan zakat posko agar tidak terjadi selisih kas atau antrean panjang malam takbiran.',
  comparisonHeaderNeed: 'Kebutuhan Operasional',
  comparisonHeaderManual: 'Pencatatan Buku Manual',
  comparisonHeaderDigital: 'Menggunakan SimZakat',
  comparisonRows: [
    {
      id: 'c1',
      need: 'Kecepatan Antrean Muzakki',
      manual: 'Lambat, harus hitung manual di kalkulator',
      digital: 'Instan, input jiwa langsung keluar nominal beras & uang',
    },
    {
      id: 'c2',
      need: 'Tanda Terima / Kuitansi',
      manual: 'Tulis tangan di nota rangkap sering robek/hilang',
      digital: 'Struk thermal cepat, A4 hemat kertas 2 rangkap, & kirim WA',
    },
    {
      id: 'c3',
      need: 'Rekapitulasi Beras & Kas',
      manual: 'Harus hitung ulang berjam-jam malam hari',
      digital: 'Otomatis real-time setiap detik tanpa selisih',
    },
    {
      id: 'c4',
      need: 'Pencegahan Dobel Mustahiq',
      manual: 'Sering kecolongan mustahiq ambil 2-3 kali',
      digital: 'Peringatan otomatis jika NIK/KK sudah disalurkan',
    },
    {
      id: 'c5',
      need: 'Laporan Pertanggungjawaban (LPJ)',
      manual: 'Ketik ulang di Word / Excel manual berhari-hari',
      digital: '1-Klik cetak Berita Acara (BAST) format resmi DKM',
    },
  ],

  // 4. Pertanyaan Umum (FAQ)
  faqBadge: 'Pertanyaan Umum',
  faqTitle: 'Seputar Penggunaan SimZakat',
  faqSubtitle: 'Jawaban atas pertanyaan seputar fitur, legalitas syariah, dan penggunaan aplikasi.',
  faqsList: [
    {
      id: 'faq1',
      q: 'Apakah aplikasi SimZakat ini benar-benar gratis untuk masjid kami?',
      a: 'Ya, 100% Gratis. SimZakat dibangun atas dasar khidmah dakwah agar seluruh panitia zakat masjid, musholla, dan UPZ di Indonesia memiliki sistem pencatatan yang rapi, transparan, dan sesuai syariat tanpa beban biaya langganan.',
    },
    {
      id: 'faq2',
      q: 'Apakah SimZakat bisa dicetak menggunakan printer struk kasir thermal?',
      a: 'Tentu saja! Kuitansi SimZakat mendukung cetak printer thermal posko (58mm dan 80mm), cetak formal kertas A4/A5 hemat kertas, unduh dokumen PDF beresolusi tinggi, dan pengiriman otomatis kuitansi ke WhatsApp muzakki.',
    },
    {
      id: 'faq3',
      q: 'Bagaimana penentuan nishab dan hukum 8 Asnaf mustahiq?',
      a: 'SimZakat mengintegrasikan kaidah fiqih mu\'tamad Mazhab Syafi\'i, Fatwa MUI, Muktamar NU, Tarjih Muhammadiyah, serta Had Kifayah resmi BAZNAS RI, sehingga amil di lapangan memiliki panduan jelas saat memverifikasi calon penerima zakat.',
    },
    {
      id: 'faq4',
      q: 'Apakah aplikasi ini bisa di-hosting di VPS milik masjid sendiri dengan MySQL?',
      a: 'Bisa! Repositori SimZakat sudah menyertakan berkas skema tabel MySQL lengkap (schema.sql), backend Express terintegrasi, dan panduan deployment VPS Ubuntu lengkap (DEPLOY_VPS.md).',
    },
    {
      id: 'faq5',
      q: 'Bagaimana cara mendukung kelangsungan dan biaya operasional server SimZakat?',
      a: 'Pengurus DKM atau amil yang merasa terbantu dapat menyisihkan infaq sukarela operasional (dari bagian hak amil atau kas operasional) melalui fitur Donasi Dakwah yang tersedia di dalam aplikasi.',
    },
  ],

  // 5. Infaq & Sustainability Banner
  sustainabilityTitle: '100% Gratis untuk Dakwah Masjid Indonesia',
  sustainabilityDescription: 'SimZakat didedikasikan secara cuma-cuma tanpa biaya lisensi. Untuk menjaga biaya sewa server VPS, sertifikat SSL, pemeliharaan basis data, dan pengembangan fitur baru, kami membuka kesempatan berinfaq sukarela bagi DKM atau amil yang ingin ikut berkhidmah.',
  sustainabilityButtonText: 'Salurkan Infaq Operasional SimZakat',
  donationTitle: 'Infaq Operasional SimZakat',
  donationSubtitle: 'Khidmah Dakwah & Sedekah Jariyah',
  donationDescription: 'Aplikasi SimZakat disediakan 100% Gratis tanpa biaya lisensi agar setiap masjid dan musholla dapat mengelola zakat secara amanah dan profesional.',
  bsiBankName: 'Bank Syariah Indonesia (BSI)',
  bsiAccountNumber: '7234567890',
  bsiAccountHolder: 'PENGEMBANGAN SIMZAKAT DAKWAH',
  bcaBankName: 'Bank Central Asia (BCA)',
  bcaAccountNumber: '8831234567',
  bcaAccountHolder: 'TIM OPERASIONAL SIMZAKAT',
  showDonationOnLogin: true,

  // 6. Bottom CTA Banner
  ctaBannerTitle: 'Wujudkan Posko Zakat Masjid yang Profesional & Barakah',
  ctaBannerSubtitle: 'Hanya butuh 1 menit untuk mendaftarkan masjid Anda. Langsung siap cetak kuitansi dan terima zakat jamaah.',
  ctaRegisterBtnText: 'Daftarkan Masjid Anda Sekarang',
  ctaLoginBtnText: 'Masuk Akun yang Sudah Ada',

  // 7. Footer & Kontak
  footerTitle: 'SimZakat',
  footerDescription: 'Khidmah Dakwah Amil Zakat & Mustahiq Indonesia',
  footerCopyright: 'Dibangun untuk kemaslahatan umat & transparansi ZISWAF.',
  contactWhatsApp: '0812-3456-7890',
  contactEmail: 'pengembangan@simzakat.id',
  qrisImageUrl: '',
};
