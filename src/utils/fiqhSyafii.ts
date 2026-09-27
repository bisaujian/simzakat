/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PANDUAN LENGKAP FIQIH ZAKAT MAAL MAZHAB IMAM SYAFI'I (SYAFI'IYAH)
 * Diselaraskan dengan Ushul Fiqih, Kaidah Fiqhiyyah, Fatwa MUI, 
 * Keputusan Bahtsul Masail NU (PBNU/LAZISNU), Majelis Tarjih Muhammadiyah (LAZISMU),
 * dan Peraturan BAZNAS Republik Indonesia.
 */

import { fiqhConfigService } from '../services/fiqhConfigService';

export interface FiqhDalil {
  title: string;
  source: string;
  arabic?: string;
  terjemah: string;
  syarah: string;
}

export interface KaidahFiqihItem {
  kaidahArabic: string;
  kaidahLatin: string;
  arti: string;
  penerapanZakat: string;
  kitabRujukan: string;
}

export interface FiqhSubtypeGuide {
  id: string;
  nama: string;
  syaratUtama: string[];
  nisabDesc: string;
  kadarZakat: string;
  waktuWajib: string;
  rumusPerhitungan: string;
  fatwaRujukan: string;
}

export const KAIDAH_FIQIH_ZAKAT: KaidahFiqihItem[] = [
  {
    kaidahArabic: 'اليَقِينُ لَا يَزُولُ بِالشَّكِّ',
    kaidahLatin: 'Al-yaqiinu laa yazuulu bisy-syakk',
    arti: 'Keyakinan tidak dapat dihilangkan oleh keraguan.',
    penerapanZakat: 'Dalam Mazhab Syafi\'i, penetapan apakah suatu harta telah mencapai nisab dan telah genap haul (1 tahun hijriah) harus didasarkan pada kepastian hitungan riil, bukan estimasi atau perkiraan spekulatif.',
    kitabRujukan: 'Al-Asybah wan Nazha\'ir karya Imam As-Suyuthi'
  },
  {
    kaidahArabic: 'مَا لَا يَتِمُّ الوَاجِبُ إِلَّا بِهِ فَهُوَ وَاجِبٌ',
    kaidahLatin: 'Maa laa yatimmul waajib illaa bihi fahuwa waajib',
    arti: 'Suatu kewajiban yang tidak sempurna kecuali dengan suatu perantara, maka perantara tersebut hukumnya wajib.',
    penerapanZakat: 'Kewajiban menunaikan zakat dengan tepat menuntut amil dan muzakki melakukan pencatatan buku kas, inventarisasi stok barang dagangan, dan hisab nisab secara teliti dan akurat.',
    kitabRujukan: 'Al-Mustashfa karya Imam Al-Ghazali (Ushul Fiqih Syafi\'i)'
  },
  {
    kaidahArabic: 'الخَرَاجُ بِالضَّمَانِ',
    kaidahLatin: 'Al-kharaju bidh-dhaman',
    arti: 'Hasil (manfaat) sebanding dengan beban tanggungan/biaya.',
    penerapanZakat: 'Menjadi landasan perbedaan zakat pertanian dalam Fiqih Syafi\'i: Tanaman yang diairi air hujan alami tanpa biaya pompa dikenakan zakat 10%, sedangkan tanaman dengan irigasi berbiaya (pompa diesel/BBM) zakatnya hanya 5%.',
    kitabRujukan: 'Qawa\'idul Ahkam fi Mashalihil Anam karya Izzuddin bin Abdis Salam'
  },
  {
    kaidahArabic: 'العِبْرَةُ فِي العُقُودِ لِلمَقَاصِدِ وَالمَعَانِي لَا لِلأَلفَاظِ وَالمَبَانِي',
    kaidahLatin: 'Al-\'ibrah fil \'uquudi lil maqaashidi wal ma\'aani laa lil alfaazhi wal mabaani',
    arti: 'Yang menjadi patokan dalam akad dan muamalah adalah tujuan serta hakikat maknanya, bukan semata lafaz lahiriahnya.',
    penerapanZakat: 'Harta perniagaan (\'urudh tijarah) diukur dari niat komersial untuk diputar dan diperjualbelikan demi memperoleh keuntungan, bukan semata bentuk fisiknya.',
    kitabRujukan: 'Al-Majmu\' Syarah Al-Muhadzdzab karya Imam An-Nawawi'
  },
  {
    kaidahArabic: 'إِنَّمَا الزَّكَاةُ تُؤْخَذُ مِنْ عَيْنِ المَالِ أَوْ قِيمَتِهِ عِنْدَ الحَاجَةِ',
    kaidahLatin: 'Innamaz zakaatu tu\'khadzu min \'ainil maali aw qimatihi \'indal haajah',
    arti: 'Sesungguhnya zakat diambil dari wujud harta itu sendiri, atau boleh dengan nilainya (uang) demi kemaslahatan mustahiq.',
    penerapanZakat: 'Pendapat mu\'tamad Syafi\'i mengutamakan penyerahan sesuai jenis harta (\'ainul maal), namun Bahtsul Masail NU, Tarjih Muhammadiyah, dan Fatwa MUI membolehkan konversi ke nilai uang tunai (qimah) untuk memudahkan distribusi kepada mustahiq.',
    kitabRujukan: 'Bughyatul Mustarsyidin karya Sayyid Ba\'alawi & Fatwa MUI'
  }
];

export const DALIL_ZAKAT_MAAL: FiqhDalil[] = [
  {
    title: 'Perintah Pengambilan Zakat & Doa Pembersih Jiwa',
    source: 'Al-Qur\'an Surah At-Taubah [9]: 103',
    arabic: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَاتَكَ سَكَنٌ لَهُمْ ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ',
    terjemah: 'Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka dan berdoalah untuk mereka. Sesungguhnya doa kamu itu (menjadi) ketenteraman jiwa bagi mereka. Dan Allah Maha Mendengar lagi Maha Mengetahui.',
    syarah: 'Ayat ini menjadi dalil qath\'i legalitas amil memungut zakat maal dan mendoakan muzakki saat menerima zakat (dasar kesunnahkan Ijab & Qabul Amil).'
  },
  {
    title: 'Nisab Emas 20 Dinar (85 Gram) & Syarat Haul 1 Tahun',
    source: 'Hadits Riwayat Abu Dawud No. 1573 & Al-Baihaqi',
    arabic: 'فَإِذَا كَانَتْ لَكَ عِشْرُونَ دِينَارًا وَحَالَ عَلَيْهَا الْحَوْلُ فَفِيهَا نِصْفُ دِينَارٍ',
    terjemah: 'Bila kamu memiliki 20 dinar (emas) dan telah berlalu waktu satu haul (satu tahun), maka zakatnya adalah setengah dinar (2,5%).',
    syarah: '20 Dinar murni setara dengan 85 gram emas 24 karat. Menjadi patokan nisab uang tabungan, deposito, perniagaan, dan investasi modern.'
  },
  {
    title: 'Kewajiban Zakat Perniagaan (\'Urudh at-Tijarah)',
    source: 'Hadits Riwayat Abu Dawud dari Samurah bin Jundub RA',
    arabic: 'أَمَّا بَعْدُ، فَإِنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ كَانَ يَأْمُرُنَا أَنْ نُخْرِجَ الصَّدَقَةَ مِنَ الَّذِي نُعِدُّهُ لِلْبَيْعِ',
    terjemah: 'Sesungguhnya Rasulullah SAW memerintahkan kami untuk mengeluarkan zakat dari harta yang kami persiapkan untuk dijual (diperdagangkan).',
    syarah: 'Menjadi dalil wajibnya zakat atas komoditas toko, warung, distributor, grosir, dan usaha dagang.'
  },
  {
    title: 'Zakat Pertanian: Pembeda Air Hujan (10%) & Pompa Berbiaya (5%)',
    source: 'Hadits Shahih Bukhari No. 1483',
    arabic: 'فِيمَا سَقَتِ السَّمَاءُ وَالْعُيُونُ أَوْ كَانَ عَثَرِيًّا الْعُشْرُ، وَمَا سُقِيَ بِالنَّضْحِ نِصْفُ الْعُشْرِ',
    terjemah: 'Pada tanaman yang diairi oleh air hujan, mata air alami, atau tadah hujan, zakatnya sepersepuluh (10%). Dan pada tanaman yang diairi dengan penyiraman (alat angkut/pompa berbiaya), zakatnya setengah dari sepersepuluh (5%).',
    syarah: 'Nisabnya 5 wasaq (300 sha\' = 653 Kg beras / 1.350 Kg gabah kering giling). Wajib langsung saat panen tanpa syarat haul.'
  },
  {
    title: 'Zakat Rikaz (Harta Karun Purba) Seperlima (20%)',
    source: 'Hadits Shahih Bukhari No. 1499 & Muslim No. 1710',
    arabic: 'وَفِي الرِّكَازِ الْخُمُسُ',
    terjemah: 'Dan pada rikaz (harta terpendam peninggalan zaman purba yang ditemukan), zakatnya adalah seperlima (20%).',
    syarah: 'Rikaz tidak memerlukan syarat haul dan tidak disyaratkan nisab menurut mayoritas, langsung dikeluarkan 20% saat ditemukan.'
  }
];

export const PANDUAN_MAAL_SYAFII: FiqhSubtypeGuide[] = [
  {
    id: 'tabungan_emas',
    nama: 'Zakat Emas, Perak & Tabungan / Deposito (Nuqud)',
    syaratUtama: [
      'Kepemilikan penuh (Al-Milk at-Tamm)',
      'Mencapai nisab 85 gram emas murni atau 595 gram perak',
      'Telah berlalu 1 tahun hijriah (Haul) sejak mencapai nisab',
      'Bebas dari kebutuhan pokok mendesak'
    ],
    nisabDesc: '85 Gram Emas Murni (24 Karat) atau setara nilai uang pasar saat jatuh tempo',
    kadarZakat: '2,5% (1/40) untuk tahun Hijriah (atau 2,577% jika pembukuan Masehi)',
    waktuWajib: 'Setelah genap 1 haul (1 tahun)',
    rumusPerhitungan: 'Total Saldo Mengendap (Tabungan + Deposito + Giro + Emas Batangan Investasi) × 2,5%',
    fatwaRujukan: 'Kitab Fathul Qorib & Al-Majmu\', Fatwa MUI No. 3/2003, BAZNAS RI'
  },
  {
    id: 'perhiasan_mubah',
    nama: 'Kaidah Perhiasan Wanita (Al-Huliyy al-Mubah) dalam Syafi\'iyah',
    syaratUtama: [
      'Perhiasan emas/perak yang lazim dipakai untuk berhias yang mubah',
      'Tidak berlebihan (tidak melampaui kebiasaan masyarakat / \'urf, umumnya di bawah 100 gram)',
      'Bukan berupa bejana, patung, atau emas batangan simpanan'
    ],
    nisabDesc: 'TIDAK WAJIB ZAKAT menurut qaul mu\'tamad Mazhab Syafi\'i ("Laisa fil huliyyi zakat")',
    kadarZakat: '0% (Kecuali jika diniatkan investasi/simpanan atau jumlahnya melampaui \'urf)',
    waktuWajib: 'Bebas Zakat',
    rumusPerhitungan: 'Perhiasan yang rutin dipakai perempuan dikecualikan dari perhitungan zakat maal',
    fatwaRujukan: 'Kitab Al-Umm Imam Syafi\'i, Kifayatul Akhyar, Bughyatul Mustarsyidin'
  },
  {
    id: 'perniagaan',
    nama: 'Zakat Perniagaan / Perdagangan (\'Urudh at-Tijarah)',
    syaratUtama: [
      'Niat berdagang (Niyyatut tijarah) saat memperoleh barang komoditas',
      'Modal diputar dari usaha halal',
      'Berjalan genap 1 tahun (Haul) sejak modal pertama kali diputar',
      'Nilai aset lancar pada akhir haul mencapai nisab 85 gram emas'
    ],
    nisabDesc: 'Setara 85 Gram Emas Murni dihitung pada akhir haul',
    kadarZakat: '2,5% (1/40)',
    waktuWajib: 'Setiap tutup tahun buku perniagaan (1 tahun haul)',
    rumusPerhitungan: '((Stok Barang Dagangan Harga Pasar + Uang Kas/Bank Usaha + Piutang Lancar) - Hutang Usaha Jatuh Tempo) × 2,5%',
    fatwaRujukan: 'Kitab Minhajut Thalibin Imam Nawawi, Keputusan Muktamar NU, BAZNAS RI'
  },
  {
    id: 'pertanian',
    nama: 'Zakat Pertanian & Tanaman Makanan Pokok (Az-Zuru\')',
    syaratUtama: [
      'Makanan pokok yang mengenyangkan dan tahan disimpan (Qut Mudhdhakhar: Padi, Jagung, Gandum)',
      'Ditanam oleh manusia (bukan tumbuh liar)',
      'Mencapai nisab 5 Wasaq (300 Sha\') saat panen',
      'TIDAK disyaratkan haul (wajib langsung saat panen)'
    ],
    nisabDesc: '5 Wasaq = 653 Kg Beras Bersih (atau 1.323 - 1.350 Kg Gabah Kering Giling / GKG)',
    kadarZakat: '10% (Air hujan/sungai alami tanpa biaya) | 5% (Irigasi pompa berbayar/BBM) | 7,5% (Campuran seimbang)',
    waktuWajib: 'Langsung pada hari panen (QS Al-An\'am: 141)',
    rumusPerhitungan: 'Hasil Panen Bersih (Kg atau dikonversi ke Rupiah) × (10% atau 5%)',
    fatwaRujukan: 'Kitab Fathul Wahhab, Keputusan Bahtsul Masail PBNU, BAZNAS RI'
  },
  {
    id: 'peternakan',
    nama: 'Zakat Hewan Ternak (Al-An\'am: Kambing & Sapi)',
    syaratUtama: [
      'As-Sa\'imah (Digembalakan di padang rumput bebas tanpa beban biaya pakan dominan)',
      'Ghairu \'Aamilah (Bukan hewan pekerja pembajak sawah atau pengangkut beban)',
      'Mencapai nisab dan telah genap 1 tahun haul'
    ],
    nisabDesc: 'Kambing/Domba: Minimal 40 Ekor | Sapi/Kerbau: Minimal 30 Ekor',
    kadarZakat: '40-120 Kambing = 1 ekor kambing | 30-39 Sapi = 1 ekor tabi\' (sapi jantan/betina 1 th)',
    waktuWajib: 'Genap 1 haul (1 tahun)',
    rumusPerhitungan: 'Sesuai tabel bertingkat syar\'i (dapat diserahkan hewannya atau dikonversi ke rupiah seharga hewan)',
    fatwaRujukan: 'Shahih Bukhari (Surat Abu Bakar RA), Kitab Kifayatul Akhyar'
  },
  {
    id: 'rikaz_tambang',
    nama: 'Zakat Rikaz (Harta Karun Purba) & Ma\'dan (Hasil Tambang)',
    syaratUtama: [
      'Rikaz: Harta temuan peninggalan zaman jahiliyah/kuno terpendam di tanah tak bertuan',
      'Ma\'dan: Hasil tambang emas/perak yang diekstraksi dari bumi'
    ],
    nisabDesc: 'Rikaz: Tanpa nisab / Nisab emas | Ma\'dan: Nisab 85g emas',
    kadarZakat: 'Rikaz: 20% (Seperlima / Al-Khums) | Ma\'dan: 2,5%',
    waktuWajib: 'Seketika saat ditemukan/diperoleh tanpa menunggu haul',
    rumusPerhitungan: 'Nilai Temuan Rikaz × 20%',
    fatwaRujukan: 'Kitab Al-Majmu\' Syarah Al-Muhadzdzab'
  },
  {
    id: 'profesi',
    nama: 'Zakat Penghasilan / Profesi (Al-Mal Al-Mustafad)',
    syaratUtama: [
      'Penghasilan halal dari keahlian profesional (gaji, honorarium, dividen, jasa dokter/arsitek/pejabat)',
      'Mencapai nisab 85 gram emas per tahun (atau dibagi bulanan: ~7,08 gram emas / bulan)',
      'Dikeluarkan saat menerima penghasilan (Qiyas Syabah pada waktu panen pertanian & kadar emas)'
    ],
    nisabDesc: 'Setara 85 Gram Emas per tahun (Bulanan: 85g × Harga Emas ÷ 12)',
    kadarZakat: '2,5%',
    waktuWajib: 'Tiap bulan saat menerima gaji atau diakumulasi setahun',
    rumusPerhitungan: 'Total Penghasilan Bersih (atau Bruto sesuai kehati-hatian) × 2,5%',
    fatwaRujukan: 'Fatwa MUI No. 3/2003, Keputusan Muktamar NU ke-30 (1999), Majelis Tarjih Muhammadiyah'
  }
];

export const DOA_ZAKAT_MAAL = {
  get doaMuzakki() {
    const d = fiqhConfigService.getDoaCollection().niatZakatMaal;
    return {
      arabic: d.arabic,
      latin: d.latin,
      arti: d.arti,
    };
  },
  get doaAmilMendoakan() {
    const d = fiqhConfigService.getDoaCollection().doaAmil;
    return {
      arabic: d.arabic,
      latin: d.latin,
      arti: d.arti,
    };
  },
  get doaSunnahNabi() {
    const d = fiqhConfigService.getDoaCollection().doaSunnahNabi;
    return {
      arabic: d.arabic,
      latin: d.latin,
      arti: d.arti,
    };
  },
};
