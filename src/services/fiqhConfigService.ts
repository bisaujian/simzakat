import { AsnafType } from '../types/zakat';
import { FiqhPlatformConfig } from '../types/fiqh';

export const DEFAULT_FIQH_CONFIG: FiqhPlatformConfig = {
  doaAmil: {
    id: 'doa_amil',
    title: 'Doa Amil untuk Muzakki (Saat Menerima Zakat)',
    category: 'amil_menerima',
    arabic: 'آجَرَكَ اللهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ فِيْمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُورًا',
    latin: "Ajarakallāhu fīmā a'thaita, wa bāraka fīmā abqaita, wa ja'alahu laka thahūrā.",
    arti: 'Semoga Allah memberikan pahala atas apa yang telah engkau berikan, melimpahkan keberkahan atas harta yang masih engkau simpan, dan menjadikannya pembersih dosa bagimu.',
    keterangan: 'Dibaca oleh petugas kasir amil sesaat setelah menerima zakat fitrah maupun zakat maal dari muzakki (Dasar hukum: QS. At-Taubah: 103).'
  },
  niatFitrahSendiri: {
    id: 'niat_fitrah_sendiri',
    title: 'Niat Zakat Fitrah untuk Diri Sendiri',
    category: 'fitrah_sendiri',
    arabic: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِي فَرْضًا لِلَّهِ تَعَالَى',
    latin: "Nawaitu an ukhrija zakātal fithri 'an nafsī fardhal lillāhi ta'ālā.",
    arti: 'Aku niat mengeluarkan zakat fitrah untuk diriku sendiri, fardhu karena Allah Ta\'ala.',
    keterangan: 'Dilafalkan oleh muzakki saat berniat atau menyerahkan zakat fitrah perorangan.'
  },
  niatFitrahKeluarga: {
    id: 'niat_fitrah_keluarga',
    title: 'Niat Zakat Fitrah untuk Diri Sendiri dan Seluruh Keluarga',
    category: 'fitrah_keluarga',
    arabic: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنِّيْ وَعَنْ جَمِيْعِ مَا يَلْزَمُنِيْ نَفَقَاتُهُمْ شَرْعًا فَرْضًا لِلَّهِ تَعَالَى',
    latin: "Nawaitu an ukhrija zakātal fithri 'annī wa 'an jamī'i mā yalzamunī nafaqātuhum syar'an fardhal lillāhi ta'ālā.",
    arti: 'Aku niat mengeluarkan zakat fitrah untuk diriku dan seluruh orang yang nafkahnya menjadi tanggunganku, fardhu karena Allah Ta\'ala.',
    keterangan: 'Dilafalkan oleh kepala keluarga yang membayarkan zakat fitrah untuk istri, anak-anak, dan tanggungan nafkahnya.'
  },
  niatZakatMaal: {
    id: 'niat_zakat_maal',
    title: 'Niat Zakat Maal (Harta / Tabungan / Emas)',
    category: 'zakat_maal',
    arabic: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى',
    latin: "Nawaitu an ukhrija zakāta mālī fardhal lillāhi ta'ālā.",
    arti: 'Aku niat mengeluarkan zakat hartaku, fardhu karena Allah Ta\'ala.',
    keterangan: 'Dilafalkan saat menunaikan kewajiban zakat harta simpanan, emas, perdagangan, maupun investasi yang telah mencapai nishab dan haul.'
  },
  doaAmilMendoakan: {
    id: 'doa_amil_mendoakan',
    title: 'Doa Keberkahan Amil Alternatif (HR. Al-Bukhari)',
    category: 'amil_menerima',
    arabic: 'اللَّهُمَّ صَلِّ عَلَيْهِمْ وَبَارِكْ لَهُمْ فِي أَمْوَالِهِمْ وَأَنْفُسِهِمْ',
    latin: "Allāhumma shalli 'alaihim wa bārik lahum fī amwālihim wa anfusihim.",
    arti: 'Ya Allah, berilah rahmat dan berkahilah mereka dalam harta serta jiwa mereka.',
    keterangan: 'Sunnah Nabi SAW ketika kaum muslimin menyerahkan shadaqah atau zakat mereka (HR. Bukhari No. 1497).'
  },
  doaSunnahNabi: {
    id: 'doa_sunnah_nabi',
    title: 'Doa Tambahan Perlindungan Harta Bersih',
    category: 'sunnah_nabi',
    arabic: 'اللَّهُمَّ اجْعَلْهَا مَغْنَمًا وَلَا تَجْعَلْهَا مَغْرَمًا',
    latin: "Allāhummaj'alhā maghnaman wa lā taj'alhā maghramā.",
    arti: 'Ya Allah, jadikanlah zakat ini sebagai perolehan berkah (keuntungan batin) dan janganlah Engkau jadikannya sebagai beban denda/kerugian.',
    keterangan: 'Sunnah Rasulullah SAW agar zakat yang dikeluarkan bernilai ibadah dan keridhaan hati (HR. Ibnu Majah No. 1798).'
  },
  asnafGuidelines: {
    fakir: {
      id: 'fakir',
      title: 'Fakir (Al-Fuqara\')',
      arabicName: 'الفُقَرَاءِ',
      kriteriaUtama: 'Orang yang sama sekali tidak memiliki harta maupun penghasilan tetap, atau berpenghasilan tetapi hanya mencukupi kurang dari separuh (50%) kebutuhan primer harian/bulanan (makanan, tempat tinggal layak, obat rutin).',
      indikatorKifayah: 'Penghasilan < Rp 750.000 - Rp 1.000.000 / keluarga / bulan, atau di bawah 50% Had Kifayah BAZNAS daerah.',
      prioritasAlokasi: 'Prioritas tertinggi (Peringkat 1). Mendapatkan paket sembako beras fitrah utuh + santunan tunai primer.',
      catatanFiqih: 'Diutamakan lansia sebatang kara, penyandang disabilitas berat, atau keluarga tanpa pencari nafkah. Bukan dari kalangan Bani Hasyim/Muthallib.',
      dokumenSyarat: 'SKTM dari RT/RW setempat, KTP/KK, atau rekomendasi tertulis DKM masjid.'
    },
    miskin: {
      id: 'miskin',
      title: 'Miskin (Al-Masakin)',
      arabicName: 'المَسَاكِينِ',
      kriteriaUtama: 'Orang yang memiliki pekerjaan dan penghasilan, namun tidak mencukupi seluruh kebutuhan primer (hanya mencukupi 50% hingga 80% dari kebutuhan hidup layak).',
      indikatorKifayah: 'Penghasilan berada di antara 50% - 80% Had Kifayah (misal: Rp 1.000.000 - Rp 2.200.000 / bulan dengan tanggungan lebih dari 2 anak).',
      prioritasAlokasi: 'Prioritas tinggi (Peringkat 2). Alokasi paket beras zakat fitrah dan subsidi biaya pendidikan/kesehatan.',
      catatanFiqih: 'Boleh menerima zakat fitrah dan maal. Diupayakan pemberian zakat produktif jika masih dalam usia produktif.',
      dokumenSyarat: 'KTP, KK, data verifikasi amil posko lingkungan masjid.'
    },
    amil: {
      id: 'amil',
      title: 'Amil Zakat (Al-\'Amilina \'Alaiha)',
      arabicName: 'العَامِلِينَ عَلَيْهَا',
      kriteriaUtama: 'Petugas atau panitia yang ditunjuk dan diberi SK resmi oleh DKM / lembaga zakat berwenang untuk menghimpun, mengelola, mencatat, menjaga, dan menyalurkan zakat.',
      indikatorKifayah: 'Bukan muzakki wajib zakat yang mengambil bagian sendiri, melainkan hak kompensasi atas waktu dan dedikasi mengurus zakat jamaah.',
      prioritasAlokasi: 'Maksimal alokasi bagian amil adalah 1/8 (12,5%) dari total perolehan zakat sesuai ijma ulama fiqih dan regulasi BAZNAS.',
      catatanFiqih: 'Amil berhak menerima bagian zakat meskipun secara ekonomi ia adalah orang yang berkecukupan, sebagai upah kerja (ujrah mitsil).',
      dokumenSyarat: 'SK Panitia Zakat Ramadhan dari DKM / BAZNAS setempat.'
    },
    mualaf: {
      id: 'mualaf',
      title: 'Mualaf (Al-Mu\'allafati Qulubuhum)',
      arabicName: 'المُؤَلَّفَةِ قُلُوبُهُمْ',
      kriteriaUtama: 'Orang yang baru masuk Islam dan membutuhkan penguatan iman serta penopang ekonomi, atau tokoh masyarakat yang diharapkan simpati dan dukungannya terhadap dakwah Islam.',
      indikatorKifayah: 'Mualaf dalam rentang waktu adaptasi (umumnya sampai dengan 1-3 tahun setelah bersyahadat atau masih dalam pembinaan).',
      prioritasAlokasi: 'Paket sembako hari raya + tali asih pembinaan keislaman dan silaturahmi DKM.',
      catatanFiqih: 'Bertujuan untuk ta\'lif al-qulub (menjinakkan hati) agar kokoh dalam tauhid dan merasa diayomi oleh ukhuwah Islamiyah.',
      dokumenSyarat: 'Sertifikat / Surat Keterangan Memeluk Agama Islam (Syahadat).'
    },
    riqab: {
      id: 'riqab',
      title: 'Riqab (Pembebasan / Budak & Korban Perbudakan Modern)',
      arabicName: 'الرِّقَابِ',
      kriteriaUtama: 'Dalam konteks modern: Korban perdagangan manusia (human trafficking), pembebasan pekerja migran yang tertahan/teraniaya tanpa upah, atau perlindungan orang yang tertindas kebebasannya.',
      indikatorKifayah: 'Korban yang terisolasi dan memerlukan biaya pemulangan atau pendampingan hukum darurat.',
      prioritasAlokasi: 'Bantuan pemulangan ke kampung halaman, rehabilitasi trauma, atau dialihkan ke asnaf fakir/miskin jika riqab nihil.',
      catatanFiqih: 'Jika tidak ditemukan kasus riqab di lingkungan masjid, porsi alokasi dialihkan untuk memperbesar jatah fakir dan miskin.',
      dokumenSyarat: 'Laporan pengaduan atau verifikasi satgas perlindungan sosial.'
    },
    gharimin: {
      id: 'gharimin',
      title: 'Gharimin (Orang yang Terlilit Hutang)',
      arabicName: 'الغَارِمِينَ',
      kriteriaUtama: 'Orang yang menanggung beban hutang karena kebutuhan mendesak yang halal (biaya operasi rumah sakit, pendidikan darurat, atau mendamaikan sengketa masyarakat) dan tidak mampu melunasinya saat jatuh tempo.',
      indikatorKifayah: 'Hutang yang bukan akibat maksiat, judi online, atau gaya hidup konsumtif mewah.',
      prioritasAlokasi: 'Bantuan pelunasan sebagian atau seluruh hutang pokok (bukan bunga riba).',
      catatanFiqih: 'Wajib dipastikan bahwa hutang timbul demi kemaslahatan mubah/darurat dan debitur benar-benar tidak memiliki aset berlebih untuk melunasinya.',
      dokumenSyarat: 'Bukti tagihan/perjanjian hutang yang sah, surat keterangan ketidakmampuan dari pihak berwenang.'
    },
    fisabilillah: {
      id: 'fisabilillah',
      title: 'Fisabilillah (Pejuang di Jalan Allah)',
      arabicName: 'فِي سَبِيلِ اللَّهِ',
      kriteriaUtama: 'Guru ngaji TPA/TPQ sukarela, da\'i/ustadz pedalaman tanpa gaji tetap, marbot/penjaga musholla perintis, atau program syiar dakwah dan kemaslahatan umum umat Islam.',
      indikatorKifayah: 'Ustadz, guru honorer keagamaan, dan pegiat dakwah yang mencurahkan waktunya untuk kemaslahatan umat.',
      prioritasAlokasi: 'Bisyarah / insentif kesejahteraan guru ngaji dan operasional posko dakwah.',
      catatanFiqih: 'Menurut fatwa MUI No. 4/2003, fisabilillah mencakup kegiatan dakwah, pendidikan Islam, dan pemberdayaan umat.',
      dokumenSyarat: 'Rekomendasi takmir DKM, surat tugas pengajar TPA/guru honorer.'
    },
    ibnu_sabil: {
      id: 'ibnu_sabil',
      title: 'Ibnu Sabil (Musafir Kehabisan Bekal)',
      arabicName: 'ابْنِ السَّبِيلِ',
      kriteriaUtama: 'Musafir atau perantau yang sedang melakukan perjalanan ketaatan atau hal mubah (bukan maksiat) lalu kehabisan bekal/ongkos atau tertimpa musibah kehilangan di jalan.',
      indikatorKifayah: 'Tidak memiliki sisa uang tunai atau akses ke rekeningnya untuk biaya makan hari itu dan tiket perjalanan pulang.',
      prioritasAlokasi: 'Bantuan tiket transport pulang ke daerah asal + santunan bekal makan di perjalanan.',
      catatanFiqih: 'Diberikan sekadar mencukupi kebutuhan hingga sampai kembali ke rumah atau tujuan safar yang halal.',
      dokumenSyarat: 'Surat keterangan kehilangan kepolisian (bila ada) atau verifikasi amil posko.'
    }
  },
  sopConfig: {
    standarBerasFitrahKg: 2.5,
    standarBerasFitrahLiter: 3.5,
    batasWaktuPenyaluran: 'Wajib selesai didistribusikan kepada mustahiq sebelum khatib naik mimbar shalat Idul Fitri (waktu mustahab/fadhilah).',
    maksimalHakAmilPersen: 12.5,
    panduanIjabQabul: 'Petugas amil menyalami atau menatap muzakki dengan ramah, mempersilakan muzakki membaca niat zakat, amil menimbang/menerima beras atau uang, lalu amil mendoakan dengan lafal doa amil secara jelas dan khusyuk.',
    pesanKuitansiTambahan: 'Jazakumullahu khairan katsiran. Semoga zakat yang ditunaikan membawa berkah dan mensucikan jiwa serta harta bapak/ibu sekalian. Aamiin.'
  },
  lastUpdatedBy: 'Super Admin Platform',
  lastUpdatedAt: '2026-03-24T12:00:00.000Z'
};

const FIQH_CONFIG_STORAGE_KEY = 'simzakat_fiqh_platform_config';

export const fiqhConfigService = {
  getConfig(): FiqhPlatformConfig {
    try {
      const stored = localStorage.getItem(FIQH_CONFIG_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_FIQH_CONFIG;
      }
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_FIQH_CONFIG,
        ...parsed,
        doaAmil: { ...DEFAULT_FIQH_CONFIG.doaAmil, ...(parsed.doaAmil || {}) },
        niatFitrahSendiri: { ...DEFAULT_FIQH_CONFIG.niatFitrahSendiri, ...(parsed.niatFitrahSendiri || {}) },
        niatFitrahKeluarga: { ...DEFAULT_FIQH_CONFIG.niatFitrahKeluarga, ...(parsed.niatFitrahKeluarga || {}) },
        niatZakatMaal: { ...DEFAULT_FIQH_CONFIG.niatZakatMaal, ...(parsed.niatZakatMaal || {}) },
        doaAmilMendoakan: { ...DEFAULT_FIQH_CONFIG.doaAmilMendoakan, ...(parsed.doaAmilMendoakan || {}) },
        doaSunnahNabi: { ...DEFAULT_FIQH_CONFIG.doaSunnahNabi, ...(parsed.doaSunnahNabi || {}) },
        asnafGuidelines: {
          ...DEFAULT_FIQH_CONFIG.asnafGuidelines,
          ...(parsed.asnafGuidelines || {})
        },
        sopConfig: {
          ...DEFAULT_FIQH_CONFIG.sopConfig,
          ...(parsed.sopConfig || {})
        }
      };
    } catch {
      return DEFAULT_FIQH_CONFIG;
    }
  },

  saveConfig(cfg: FiqhPlatformConfig, updatedByName: string = 'Super Admin'): void {
    const updated: FiqhPlatformConfig = {
      ...cfg,
      lastUpdatedBy: updatedByName,
      lastUpdatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(FIQH_CONFIG_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('fiqh-config-changed', { detail: updated }));
    } catch (e) {
      console.error('Failed to save fiqh config to localStorage', e);
    }
  },

  resetConfig(): FiqhPlatformConfig {
    try {
      localStorage.setItem(FIQH_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_FIQH_CONFIG));
      window.dispatchEvent(new CustomEvent('fiqh-config-changed', { detail: DEFAULT_FIQH_CONFIG }));
    } catch (e) {
      console.error('Failed to reset fiqh config', e);
    }
    return DEFAULT_FIQH_CONFIG;
  },

  getDoaCollection() {
    const cfg = this.getConfig();
    return {
      doaAmil: cfg.doaAmil,
      niatFitrahSendiri: cfg.niatFitrahSendiri,
      niatFitrahKeluarga: cfg.niatFitrahKeluarga,
      niatZakatMaal: cfg.niatZakatMaal,
      doaAmilMendoakan: cfg.doaAmilMendoakan,
      doaSunnahNabi: cfg.doaSunnahNabi
    };
  },

  getAsnafGuideline(type: AsnafType) {
    const cfg = this.getConfig();
    return cfg.asnafGuidelines[type] || DEFAULT_FIQH_CONFIG.asnafGuidelines[type];
  }
};
