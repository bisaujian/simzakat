import { AsnafType } from '../types/zakat';

export interface AsnafGuideline {
  id: AsnafType;
  title: string;
  arabicName: string;
  ayatQuran: string;
  artiAyat: string;
  deskripsiUmum: string;
  mazhabSyafii: {
    definisi: string;
    ketentuan: string[];
    referensiKitab: string;
  };
  fatwaMUI: {
    nomorDanTahun: string;
    ketetapanUtama: string;
    ketentuanOperasional: string[];
  };
  muktamarNU: {
    keputusan: string;
    pandanganUlamaNU: string;
    arahanPenyaluran: string[];
  };
  tarjihMuhammadiyah: {
    putusan: string;
    fokusUtama: string;
    orientasiProgram: string[];
  };
  pedomanBaznas: {
    regulasi: string;
    indikatorKifayah: string;
    kriteriaVerifikasi: string[];
  };
}

export const ASNAF_DETAILED_GUIDELINES: Record<AsnafType, AsnafGuideline> = {
  fakir: {
    id: 'fakir',
    title: 'Fakir (Al-Fuqara\')',
    arabicName: 'الفُقَرَاءِ',
    ayatQuran: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ...',
    artiAyat: 'Sesungguhnya zakat itu hanyalah untuk orang-orang fakir, orang miskin... (QS. At-Taubah: 60)',
    deskripsiUmum: 'Orang yang sama sekali tidak memiliki harta maupun pekerjaan, atau memiliki harta/penghasilan tetapi hanya mencukupi kurang dari separuh (50%) kebutuhan primer hariannya.',
    mazhabSyafii: {
      definisi: 'Man la mala lahu wa la kasba, aw lahu malun aw kasbun la yaqa\'u mauqi\'an min kifayatihi (kurang dari 50% kecukupan). Contoh: Kebutuhan hidup layak per hari Rp 50.000, ia hanya berpenghasilan Rp 15.000 - Rp 20.000, atau nihil.',
      ketentuan: [
        'Tidak memiliki sanak kerabat yang wajib menafkahinya.',
        'Bukan dari kalangan Bani Hasyim dan Bani Muthallib (Ahlul Bait).',
        'Diberikan zakat hingga mencapai batas kecukupan usia wajar (kifayatul umr) atau diberikan modal kerja dan alat usaha yang menghasilkan kecukupan mandiri.',
        'Mendapat porsi prioritas tertinggi di antara seluruh asnaf.'
      ],
      referensiKitab: 'Fathul Qarib Al-Mujib hal. 42; Al-Majmu\' Syarah Al-Muhadzdzab Juz 6 hal. 190; Tuhfatul Muhtaj Juz 7 hal. 145.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Keputusan Ijtima Ulama Komisi Fatwa se-Indonesia IV (2012) & Fatwa MUI No. 4/2003',
      ketetapanUtama: 'Fakir adalah individu/keluarga yang tidak memiliki daya beli untuk kebutuhan dasar (pangan, tempat bernaung, pakaian, obat darurat).',
      ketentuanOperasional: [
        'Diprioritaskan pemenuhan bantuan konsumtif langsung pangan berkualitas (Zakat Fitrah berupa beras/makanan pokok).',
        'Penyelamatan gizi buruk, lansia sebatang kara, penyandang disabilitas berat.',
        'Boleh diberikan bantuan tunai berkelanjutan selama kondisi fakirnya belum terangkat.'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Bahtsul Masail Muktamar NU ke-28 Yogyakarta & Muktamar ke-34 Lampung',
      pandanganUlamaNU: 'Kefakiran dinilai dari hajah ashliyyah (kebutuhan primer riil). Penyaluran zakat fitrah harus menjamin mustahiq fakir dapat berhari raya Idul Fitri dalam keadaan kenyang dan gembira tanpa perlu meminta-minta.',
      arahanPenyaluran: [
        'Pemberian hak Zakat Fitrah beras minimal 1 paket keluarga mencukupi kebutuhan hari raya dan hari-hari setelahnya.',
        'Pemberdayaan dengan zakat produktif bila mustahiq masih memiliki usia produktif dan keahlian kerja.'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Pedoman ZIS & Fiqih Mustadh\'afin PP Muhammadiyah',
      fokusUtama: 'Mustadh\'afin ekonomi tingkat rentan ekstrim tanpa aset penopang.',
      orientasiProgram: [
        'Pemberian paket sembako beras langsung (Direct Charity).',
        'Integrasi layanan kesehatan gratis klinik PKU/Lazismu.',
        'Pendampingan sosial-psikologis untuk keluarga mustahiq.'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS RI No. 3 Tahun 2018 (Pasal 4) & Keputusan Ketua BAZNAS tentang Had Kifayah',
      indikatorKifayah: 'Pendapatan riil kepala keluarga di bawah 50% dari standar Had Kifayah BAZNAS per kapita per bulan (misal Had Kifayah Rp 3.000.000/KK, penghasilan di bawah Rp 1.500.000).',
      kriteriaVerifikasi: [
        'Survey faktual tempat tinggal (dinding bilik/lantai tanah/kontrakan menunggak).',
        'Ketiadaan aset produktif bernilai ekonomis.',
        'Terdaftar dalam Data Terpadu Kesejahteraan Sosial (DTKS) / Surat Keterangan Tidak Mampu (SKTM).'
      ]
    }
  },

  miskin: {
    id: 'miskin',
    title: 'Miskin (Al-Masakin)',
    arabicName: 'المَسَاكِينِ',
    ayatQuran: '...وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا...',
    artiAyat: '...dan orang-orang miskin, dan para amil yang mengurusnya... (QS. At-Taubah: 60)',
    deskripsiUmum: 'Orang yang memiliki mata pencaharian halal atau harta, dan mampu mencukupi separuh (50%) atau lebih kebutuhan pokoknya, namun belum mencapai kecukupan penuh (100%).',
    mazhabSyafii: {
      definisi: 'Man qadara \'ala ma yaqa\'u mauqi\'an min kifayatihi wa la yakfihi (mencapai 50% s.d. 99% kecukupan). Contoh: Kebutuhan primer layak sebulan Rp 3.000.000, penghasilannya hanya Rp 1.600.000 - Rp 2.400.000.',
      ketentuan: [
        'Memiliki pekerjaan tetap / serabutan yang halal namun upahnya di bawah standar kebutuhan pokok keluarga.',
        'Boleh menerima zakat untuk menutupi selisih kekurangan hidup layaknya.',
        'Dianjurkan diberikan modal usaha atau alat pertukangan/perdagangan yang menutup kekurangan tersebut selamanya.'
      ],
      referensiKitab: 'Minhajut Thalibin lil Imam An-Nawawi; Fathul Wahhab Syarah Manhajuth Thullab Juz 2 hal. 32.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Fatwa MUI No. 4 Tahun 2003 tentang Pendayagunaan Zakat untuk Kepentingan Produktif',
      ketetapanUtama: 'Miskin adalah pekerja/keluarga yang terus mengalami defisit pendapatan terhadap pengeluaran kebutuhan dasar wajar.',
      ketentuanOperasional: [
        'Penyaluran zakat fitrah beras untuk menopang ketahanan pangan keluarga.',
        'Zakat maal disalurkan dalam bentuk beasiswa anak sekolah, subsidi iuran BPJS, dan modal usaha mikro.'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Muktamar NU ke-29 Cipasung & Muktamar NU ke-30 Kediri',
      pandanganUlamaNU: 'Boleh mentasharrufkan (menyalurkan) zakat kepada kaum miskin dalam bentuk modal bergulir atau peralatan kerja, asalkan dengan akad tamlik (kepemilikan sah) kepada mustahiq.',
      arahanPenyaluran: [
        'Pemberian santunan sembako berkala.',
        'Penyediaan beasiswa santri dhuafa di pesantren-pesantren NU.'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Keputusan Muktamar Tarjih Muhammadiyah tentang Pendayagunaan Zakat Produktif',
      fokusUtama: 'Pemberdayaan kaum pekerja informal berpenghasilan rendah agar mandiri dan naik kelas menjadi muzakki (Transformasi Mustahiq to Muzakki).',
      orientasiProgram: [
        'Bantuan modal bergulir usaha mikro binaan Qaryah Thayyibah.',
        'Pelatihan vokasi dan keahlian kerja pemuda dhuafa.'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS No. 3 Tahun 2018 (Pasal 5)',
      indikatorKifayah: 'Pendapatan berada di kisaran 50% hingga 100% dari standar Had Kifayah daerah per kapita.',
      kriteriaVerifikasi: [
        'Pekerja informal/buruh/petani penggarap/pedagang asongan.',
        'Jumlah tanggungan keluarga besar dengan rasio beban tanggungan tinggi.',
        'Tidak memiliki tabungan darurat yang memadai.'
      ]
    }
  },

  amil: {
    id: 'amil',
    title: 'Amil Zakat (Al-\'Amilina \'Alaiha)',
    arabicName: 'العَامِلِينَ عَلَيْهَا',
    ayatQuran: '...وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ...',
    artiAyat: '...dan para amil yang mengurusnya, dan para mualaf yang dibujuk hatinya... (QS. At-Taubah: 60)',
    deskripsiUmum: 'Personil atau panitia yang diangkat resmi oleh penguasa/lembaga berwenang untuk menghimpun, mengelola, menjaga, mencatat, dan mendistribusikan zakat.',
    mazhabSyafii: {
      definisi: 'Kullu man yastaghilu fi jam\'iz-zakat wa kitayatiha wa hisabiha wa qismatiha bi idzni al-Imam (seluruh petugas yang bekerja dalam pengumpulan, pembukuan, hisab, dan pembagian zakat atas izin resmi).',
      ketentuan: [
        'Syarat amil: Muslim, mukallaf (baligh & berakal), merdeka, adil (terpercaya/tidak fasik), dan memahami fiqih zakat.',
        'Bukan dari keluarga Nabi SAW (Bani Hasyim & Bani Muthallib).',
        'Hak amil adalah upah standar kerja (Ujratul Mitsil) atas jerih payahnya, bukan sedekah kemiskinan (berhak menerima walau amil tersebut kaya).',
        'Maksimal alokasi bagian amil adalah 1/8 (12,5%) jika kedelapan asnaf lengkap terpenuhi.'
      ],
      referensiKitab: 'Kifayatul Akhyar Juz 1 hal. 195; Al-Umm karya Imam Asy-Syafi\'i Juz 2 hal. 61.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Fatwa MUI No. 8 Tahun 2011 tentang Amil Zakat',
      ketetapanUtama: 'Amil syar\'i adalah institusi/badan yang dibentuk atau dikukuhkan oleh pemerintah (BAZNAS, LAZ, atau Unit Pengumpul Zakat / UPZ DKM Masjid ber-SK).',
      ketentuanOperasional: [
        'Panitia Zakat Fitrah di masjid berstatus Amil atau Wakil Muzakki sesuai SK penugasan resmi.',
        'Hak amil diambil maksimal 1/8 (12,5%) dari zakat yang dihimpun, digunakan untuk honor operasional petugas amil di lapangan.',
        'Dana amil dilarang dialihkan untuk kepentingan pribadi di luar penugasan zakat.'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Muktamar NU ke-28 & Bahtsul Masail Pengurus Wilayah NU Jawa Timur',
      pandanganUlamaNU: 'Panitia zakat masjid yang dibentuk atas musyawarah ta\'mir masjid dan diakui pemerintah desa/kelurahan berhak mendapatkan porsi amil zakat fitrah sebagai ganti jerih payah (ujrah amil) menjaga dan menakar beras malam hari raya.',
      arahanPenyaluran: [
        'Diberikan bagian beras zakat fitrah yang wajar untuk konsumsi panitia amil.',
        'Operasional pencetakan kupon, kuitansi, dan transportasi karung beras.'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Pedoman Tata Kelola LAZISMU PP Muhammadiyah',
      fokusUtama: 'Profesionalisme, akuntabilitas publik, dan audit keuangan syariah berkala.',
      orientasiProgram: [
        'Standardisasi kompetensi amil (Sertifikasi Amil BNSP).',
        'Digitalisasi sistem kasir dan pencatatan transaksi kuitansi transparan.'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS No. 1 Tahun 2018 tentang Pengelolaan Hak Amil',
      indikatorKifayah: 'Alokasi maksimal hak amil adalah 12,5% dari total penerimaan zakat (termasuk Zakat Fitrah dan Zakat Maal).',
      kriteriaVerifikasi: [
        'Memiliki SK Kepanitiaan Amil dari DKM Masjid atau UPZ BAZNAS Kecamatan.',
        'Membuat Berita Acara Serah Terima (BAST) dan laporan pertanggungjawaban terbuka kepada jamaah.'
      ]
    }
  },

  mualaf: {
    id: 'mualaf',
    title: 'Mualaf (Al-Mu\'allafatu Qulubuhum)',
    arabicName: 'المُؤَلَّفَةِ قُلُوبُهُمْ',
    ayatQuran: '...وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ...',
    artiAyat: '...dan orang-orang yang dibujuk hatinya, dan untuk (memerdekakan) hamba sahaya... (QS. At-Taubah: 60)',
    deskripsiUmum: 'Orang yang baru masuk Islam agar semakin kokoh imannya, atau tokoh/orang yang diharapkan keislamannya dan pembelaannya bagi kemaslahatan kaum muslimin.',
    mazhabSyafii: {
      definisi: 'Terbagi 4 kategori dalam Mazhab Syafi\'i: (1) Baru masuk Islam dengan niat yang masih lemah; (2) Baru masuk Islam berkedudukan terpandang di kaumnya; (3) Muslim penjaga perbatasan wilayah Islam; (4) Tokoh muslim yang ditaati untuk membantu menagih zakat orang enggan.',
      ketentuan: [
        'Dalam Mazhab Syafi\'i, mualaf non-muslim tidak berhak menerima zakat (hanya muslim baru atau muslim pelindung).',
        'Pemberian zakat bertujuan menguatkan keimanan dan memikat hati kerabatnya.',
        'Boleh diberikan zakat fitrah maupun zakat maal.'
      ],
      referensiKitab: 'Nihayatul Muhtaj Ila Syarhil Minhaj Juz 6 hal. 155; Fathul Mu\'in hal. 62.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Fatwa MUI tentang Pendayagunaan Zakat untuk Pembinaan Mualaf',
      ketetapanUtama: 'Mualaf berhak mendapatkan pendampingan rohani dan advokasi ekonomi secara berkesinambungan pasca-ikrar syahadat.',
      ketentuanOperasional: [
        'Bantuan biaya hidup darurat jika diusir dari keluarga asal atau kehilangan pekerjaan karena masuk Islam.',
        'Biaya bimbingan aqidah, iqra, dan fiqih ibadah dasar.',
        'Advokasi hukum perlindungan identitas kependudukan.'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Muktamar NU ke-32 Makassar',
      pandanganUlamaNU: 'Mualaf harus dirangkul dalam majelis taklim dan pondok pesantren agar terhindar dari pemurtadan kembali akibat faktor ekonomi rentan.',
      arahanPenyaluran: [
        'Pemberian paket sembako beras zakat fitrah di lingkungan komunitas mualaf.',
        'Beasiswa pendidikan anak mualaf.'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Pedoman Majelis Tabligh & Lazismu PP Muhammadiyah',
      fokusUtama: 'Pusat Pembinaan Mualaf Terpadu (Mualaf Learning Center).',
      orientasiProgram: [
        'Santunan kemandirian ekonomi pasca-syahadat.',
        'Paket perlengkapan shalat, Al-Qur\'an, dan buku tuntunan ibadah praktis.'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS No. 3 Tahun 2018 (Pasal 6)',
      indikatorKifayah: 'Orang yang baru masuk Islam kurang dari 3 tahun (atau lebih jika masih membutuhkan penguatan aqidah dan kemandirian ekonomi).',
      kriteriaVerifikasi: [
        'Surat Keterangan Masuk Islam (Piagam Syahadat dari KUA / DKM / Pengadilan Agama).',
        'Dokumentasi verifikasi pembinaan aktif di masjid setempat.'
      ]
    }
  },

  riqab: {
    id: 'riqab',
    title: 'Riqab (Fir-Riqab / Pembebasan)',
    arabicName: 'فِي الرِّقَابِ',
    ayatQuran: '...وَفِي الرِّقَابِ وَالْغَارِمِينَ...',
    artiAyat: '...dan untuk (memerdekakan) hamba sahaya, untuk (membebaskan) orang yang berutang... (QS. At-Taubah: 60)',
    deskripsiUmum: 'Hamba sahaya yang mencicil kemerdekaannya, atau dalam konteks modern diperluas untuk pembebasan manusia dari perbudakan, eksploitasi perdagangan orang, dan buruh migran yang tertindas.',
    mazhabSyafii: {
      definisi: 'Al-Mukatabun al-ladzina katabu sadatuhum \'ala amwalin ma\'lumatin (budak mukatab yang berakad kemerdekaan dengan tuannya).',
      ketentuan: [
        'Zakat diberikan kepada mukatab muslim untuk melunasi cicilan pembebasan dirinya.',
        'Jika tidak ada budak mukatab di suatu masa/wilayah, bagian riqab dialihkan ke asnaf lain yang ada.'
      ],
      referensiKitab: 'Raudhatut Thalibin karya Imam An-Nawawi Juz 2 hal. 312; Al-Hawi Al-Kabir Juz 8 hal. 520.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Keputusan Ijtima Ulama Komisi Fatwa se-Indonesia IV (2012) tentang Riqab Kontemporer',
      ketetapanUtama: 'Asnaf Riqab mencakup pembebasan korban perdagangan orang (human trafficking), buruh migran muslim yang disandera atau dipidana tanpa pembelaan di luar negeri, dan pekerja yang mengalami eksploitasi fisik/perbudakan modern.',
      ketentuanOperasional: [
        'Penyediaan dana bantuan hukum dan biaya pemulangan (repatriasi) TKI/TKW bermasalah ke tanah air.',
        'Rehabilitasi korban eksploitasi tenaga kerja perempuan dan anak.'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Bahtsul Masail Pengurus Besar Nahdlatul Ulama (PBNU)',
      pandanganUlamaNU: 'Meskipun budak fisik formal telah dihapuskan dunia internasional, illat hukum pembebasan martabat manusia dari belenggu kedhaliman tetap relevan diaplikasikan pada perlindungan buruh tertindas.',
      arahanPenyaluran: [
        'Bantuan kemanusiaan darurat untuk tenaga kerja yang ditahan paspornya tanpa upah.',
        'Advokasi hak-hak korban tindak pidana perdagangan orang (TPPO).'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Tafsir Kontekstual Asnaf Muktamar Tarjih Muhammadiyah',
      fokusUtama: 'Pembebasan dari segala bentuk belenggu modern: human trafficking, penindasan kerja, dan kejahatan kemanusiaan.',
      orientasiProgram: [
        'Shelter perlindungan pekerja migran rentan.',
        'Advokasi hukum buruh kontrak tertindas.'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS No. 3 Tahun 2018 (Pasal 7)',
      indikatorKifayah: 'WNI/Muslim korban perdagangan orang, perbudakan modern, atau pekerja migran yang terancam keselamatan jiwanya di luar negeri.',
      kriteriaVerifikasi: [
        'Surat rekomendasi BP2MI, Kementerian Luar Negeri, atau KBRI setempat.',
        'Ketiadaan kemampuan finansial keluarga untuk biaya pemulangan.'
      ]
    }
  },

  gharimin: {
    id: 'gharimin',
    title: 'Gharimin (Al-Gharimina)',
    arabicName: 'الغَارِمِينَ',
    ayatQuran: '...وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ...',
    artiAyat: '...untuk (membebaskan) orang yang berutang, untuk jalan Allah... (QS. At-Taubah: 60)',
    deskripsiUmum: 'Orang yang terlilit hutang karena perkara mubah/kebaikan untuk kebutuhan pokok yang mendesak atau untuk mendamaikan sengketa masyarakat, dan tidak mampu melunasinya.',
    mazhabSyafii: {
      definisi: 'Terbagi 3 kategori: (1) Gharim li ishlahi dzatil bain (berhutang demi mendamaikan konflik dua kubu masyarakat - boleh menerima zakat walau ia kaya); (2) Gharim li hamalah (menanggung utang orang lain); (3) Gharim li nafsihi (berhutang untuk kebutuhan pokok diri/keluarga yang mubah).',
      ketentuan: [
        'Bukan hutang untuk maksiat (seperti judi, foya-foya, miras, zina, atau spekulasi riba).',
        'Hutang telah jatuh tempo dan debitur tidak memiliki harta surplus untuk melunasinya.',
        'Pembayaran dapat diserahkan langsung kepada pihak pemberi pinjaman (kreditur) atau kepada si gharim.'
      ],
      referensiKitab: 'Al-Majmu\' Syarah Al-Muhadzdzab Juz 6 hal. 205; I\'anatut Thalibin Juz 2 hal. 190.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Fatwa MUI tentang Penyaluran Zakat untuk Pelunasan Hutang (Gharimin)',
      ketetapanUtama: 'Diutamakan bagi keluarga dhuafa yang terjerat hutang biaya rawat inap rumah sakit darurat, tunggakan SPP ijazah tertahan, atau terancam sita rumah tinggal satu-satunya.',
      ketentuanOperasional: [
        'Bantuan pelunasan darurat jeratan rentenir / pinjol ilegal demi menyelamatkan martabat dan keselamatan jiwa.',
        'Verifikasi bukti tagihan resmi dari instansi terkait (bukan klaim sepihak).'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Muktamar NU ke-31 Boyolali & Munas Alim Ulama NU',
      pandanganUlamaNU: 'Amil berhak membayarkan zakat langsung kepada pihak yang berpiutang atas nama mustahiq gharim, agar kepastian pelunasan hutang terjamin syar\'i.',
      arahanPenyaluran: [
        'Penebusan ijazah santri/siswa dhuafa yang tertahan di sekolah.',
        'Pelunasan biaya operasi/pengobatan darurat keluarga miskin.'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Pedoman Penyelamatan Korban Rentenir PP Muhammadiyah',
      fokusUtama: 'Penyelamatan masyarakat dari jerat rentenir dan lintah darat berbasis riba keji.',
      orientasiProgram: [
        'Program "Bebas Rentenir" melalui konversi ke pinjaman kebajikan (Qardhul Hasan).',
        'Bimbingan perencanaan keuangan keluarga sakinah.'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS No. 3 Tahun 2018 (Pasal 8)',
      indikatorKifayah: 'Orang yang memiliki hutang sah yang jatuh tempo untuk kebutuhan dasar darurat dan tidak memiliki aset penutup hutang.',
      kriteriaVerifikasi: [
        'Surat tagihan / kuitansi hutang resmi (Rumah Sakit / Sekolah / Lembaga Keuangan Mikro).',
        'Surat pernyataan bukan hutang konsumtif gaya hidup bermewah-mewah.'
      ]
    }
  },

  fisabilillah: {
    id: 'fisabilillah',
    title: 'Fisabilillah (Fi Sabilillah)',
    arabicName: 'فِي سَبِيلِ اللَّهِ',
    ayatQuran: '...وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ فَرِيضَةً مِنَ اللَّهِ...',
    artiAyat: '...untuk jalan Allah, dan untuk orang yang sedang dalam perjalanan, sebagai kewajiban dari Allah... (QS. At-Taubah: 60)',
    deskripsiUmum: 'Pihak yang berjuang menegakkan risalah dan kebaikan Islam, membina dakwah, pendidikan Islam, kaderisasi ulama, dan menjaga kehormatan kaum muslimin.',
    mazhabSyafii: {
      definisi: 'Al-Ghuzat al-mutathawwi\'ah al-ladzina la dhiwana lahum (pasukan sukarela pembela Islam yang tidak mendapatkan gaji tetap dari kas negara).',
      ketentuan: [
        'Menurut qaul masyhur Mazhab Syafi\'i, dibatasi pada personil jihad sukarela untuk persenjataan, perbekalan, dan nafkah keluarganya.',
        'Sebagian ulama Syafi\'iyah muta\'akhirin (seperti dikutip Al-Qaffal dan Fakhruddin Ar-Razi) memperluas cakupan pada setiap sarana penopang kelangsungan agama Allah (Thariqul Khair).',
        'Muzakki tidak boleh mengklaim pengeluaran pribadi sebagai zakat tanpa penyaluran yang sah.'
      ],
      referensiKitab: 'Tuhfatul Muhtaj Juz 7 hal. 160; Mughni Al-Muhtaj Juz 3 hal. 118; Tafsir Al-Kabir Mafatihul Ghaib Juz 16 hal. 116.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Fatwa MUI No. 4 Tahun 2003 & Keputusan Fatwa Ijtima Ulama Komisi Fatwa se-Indonesia',
      ketetapanUtama: 'Makna Fi Sabilillah dalam konteks kekinian mencakup: (1) Aktivitas dakwah Islamiyah di daerah pedalaman/terpencil/perbatasan; (2) Pembangunan sarana pendidikan Islam; (3) Beasiswa kader ulama; (4) Media penyiaran dakwah; (5) Penanggulangan bencana dan kemaslahatan umum umat non-komersial.',
      ketentuanOperasional: [
        'Santunan kafalah guru ngaji, ustadz TPQ, marbot, dan da\'i perintis.',
        'Bantuan sarana belajar pondok pesantren dan madrasah diniyah dhuafa.',
        'Operasional mitigasi bencana tim medis kemanusiaan di medan bencana.'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Muktamar NU ke-29 Cipasung & Muktamar NU ke-30 Kediri',
      pandanganUlamaNU: 'Pemberian zakat untuk fi sabilillah dapat dialokasikan bagi para pejuang ilmu agama (Thalabatul Ilmi) yang mendedikasikan hidupnya untuk tholabul ilmi syar\'i di pesantren salafiyah.',
      arahanPenyaluran: [
        'Bantuan kitab kuning dan biaya makan santri penghafal Al-Qur\'an.',
        'Insentif pembina majelis taklim dan imam rawatib di daerah minoritas.'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Keputusan Muktamar Tarjih Muhammadiyah tentang Konsep Fi Sabilillah',
      fokusUtama: 'Gerakan dakwah pencerahan, pembelaan kaum tertindas, dan penguatan amal usaha sosial-pendidikan.',
      orientasiProgram: [
        'Kafalah da\'i daerah 3T (Terdepan, Terluar, Tertinggal).',
        'Bantuan penanggulangan kebencanaan Muhammadiyah Disaster Management Center (MDMC).'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS No. 3 Tahun 2018 (Pasal 9)',
      indikatorKifayah: 'Orang atau badan/lembaga yang berjuang di jalan Allah untuk kemaslahatan umat Islam dan keutuhan NKRI.',
      kriteriaVerifikasi: [
        'Guru ngaji tradisional, penyuluh agama non-PNS, dai perintis daerah rawan aqidah.',
        'Pengajuan proposal program dakwah/pendidikan yang telah diverifikasi kelayakan dampaknya.'
      ]
    }
  },

  ibnu_sabil: {
    id: 'ibnu_sabil',
    title: 'Ibnu Sabil (Ibnus-Sabil / Musafir)',
    arabicName: 'ابْنِ السَّبِيلِ',
    ayatQuran: '...وَابْنِ السَّبِيلِ فَرِيضَةً مِنَ اللَّهِ وَاللَّهُ عَلِيمٌ حَكِيمٌ',
    artiAyat: '...dan untuk orang yang sedang dalam perjalanan, sebagai kewajiban dari Allah. Allah Maha Mengetahui, Mahabijaksana. (QS. At-Taubah: 60)',
    deskripsiUmum: 'Musafir yang kehabisan bekal dalam perjalanan yang bertujuan mubah (bukan maksiat), yang membutuhkan biaya transportasi dan pangan untuk melanjutkan perjalanan atau kembali ke tempat asalnya.',
    mazhabSyafii: {
      definisi: 'Al-Musafiru al-ladzi yaqtha\'u baladan ghaira baladihi wa laisa ma\'ahu ma yahtaaju ilaihi (musafir yang melintasi suatu negeri dan tidak memiliki bekal mencukupi).',
      ketentuan: [
        'Safar (perjalanan) bukan untuk tujuan maksiat (misal perjalanan silaturahmi, mencari nafkah, menuntut ilmu, berobat, haji/umrah).',
        'Tidak memiliki akses uang tunai di tempat terlantar tersebut (walaupun di kampung asalnya ia orang mampu/berharta).',
        'Diberikan sekadar biaya perjalanan (ongkos tiket angkutan) dan makan minum wajar hingga sampai ke tujuannya.'
      ],
      referensiKitab: 'Al-Majmu\' Syarah Al-Muhadzdzab Juz 6 hal. 215; Fathul Qarib Al-Mujib hal. 43.'
    },
    fatwaMUI: {
      nomorDanTahun: 'Fatwa Komisi Fatwa MUI tentang Penyaluran Zakat untuk Musafir Terlantar',
      ketetapanUtama: 'Mencakup santri/mahasiswa perantauan yang terputus kiriman biaya hidup, korban kecopetan/kehilangan dompet di perjalanan, dan pengungsi darurat musibah.',
      ketentuanOperasional: [
        'Bantuan tiket transportasi pulang ke kampung halaman (kereta/bus/kapal).',
        'Uang saku makan darurat selama transit di perjalanan.'
      ]
    },
    muktamarNU: {
      keputusan: 'Keputusan Bahtsul Masail Nahdlatul Ulama',
      pandanganUlamaNU: 'Amil masjid terminal/stasiun/pelabuhan sangat dianjurkan menyisihkan pos khusus Ibnu Sabil untuk menolong musafir muslim yang kehabisan uang saku.',
      arahanPenyaluran: [
        'Voucher konsumsi warung makan sekitar masjid.',
        'Penyediaan ruang singgah/istirahat darurat.'
      ]
    },
    tarjihMuhammadiyah: {
      putusan: 'Pedoman Layanan Kemanusiaan Lazismu',
      fokusUtama: 'Bantuan darurat musafir terlantar di kantor layanan Lazismu se-Indonesia.',
      orientasiProgram: [
        'Tiket perjalanan darurat bagi korban penipuan kerja luar daerah.',
        'Santunan hidup sementara bagi perantau sakit.'
      ]
    },
    pedomanBaznas: {
      regulasi: 'Peraturan BAZNAS No. 3 Tahun 2018 (Pasal 10)',
      indikatorKifayah: 'Orang yang sedang dalam perjalanan legal dan terputus bekalnya tanpa sarana akses finansial darurat.',
      kriteriaVerifikasi: [
        'Surat Tanda Penerimaan Laporan Kehilangan dari Kepolisian (jika kecopetan/terlantar).',
        'Tiket resmi rute kepulangan yang dibelikan langsung oleh amil.'
      ]
    }
  }
};
