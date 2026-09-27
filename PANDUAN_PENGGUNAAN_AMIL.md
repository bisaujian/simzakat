# BUKU PANDUAN PENGGUNAAN SIMZAKAT
## Panduan Resmi & Standar Operasional Prosedur (SOP) untuk Calon Amil Zakat & Pengurus DKM Masjid

---

## DAFTAR ISI
1. [Pendahuluan & Hakikat Mulia Tugas Amil](#1-pendahuluan--hakikat-mulia-tugas-amil)
2. [Kamus Istilah Pokok ZISWAF](#2-kamus-istilah-pokok-ziswaf)
3. [Persiapan Awal Sebelum Membuka Posko](#3-persiapan-awal-sebelum-membuka-posko)
4. [Diagram Alur Pelayanan Muzakki (5 Tahap)](#4-diagram-alur-pelayanan-muzakki-5-tahap)
5. [Panduan Menu Kasir Penerimaan (Lengkap dengan Tampilan Visual)](#5-panduan-menu-kasir-penerimaan-lengkap-dengan-tampilan-visual)
6. [Tata Cara Akad Ijab Qobul & Pembacaan Doa](#6-tata-cara-akad-ijab-qobul--pembacaan-doa)
7. [Panduan Cetak Struk Thermal & Bukti Digital WhatsApp](#7-panduan-cetak-struk-thermal--bukti-digital-whatsapp)
8. [Panduan Sensus & Penyaluran Zakat ke 8 Asnaf](#8-panduan-sensus--penyaluran-zakat-ke-8-asnaf)
9. [Laporan Pertanggungjawaban (LPJ), BAST & Tutup Buku](#9-laporan-pertanggungjawaban-lpj-bast--tutup-buku)
10. [Penanganan Masalah Lapangan (Troubleshooting)](#10-penanganan-masalah-lapangan-troubleshooting)

---

## 1. Pendahuluan & Hakikat Mulia Tugas Amil

Segala puji bagi Allah Subhanahu wa Ta'ala. Menjadi Amil Zakat adalah amanah syar'i yang sangat mulia sebagaimana firman Allah dalam Surah At-Taubah ayat 60, di mana amil ditetapkan sebagai salah satu dari 8 golongan yang berhak menerima bagian zakat (*asnaf*).

Aplikasi **SimZakat** diciptakan untuk membantu pengurus DKM dan panitia amil masjid mengelola zakat secara:
1. **Syar'i:** Menjaga akad ijab qobul, batasan asnaf, dan pemisahan dana zakat.
2. **Amanah & Transparan:** Setiap gram beras dan rupiah kas tercatat secara *real-time*.
3. **Cepat & Modern:** Pelayanan muzakki tidak lebih dari 1 menit per transaksi dengan struk thermal dan WhatsApp otomatis.

---

## 2. Kamus Istilah Pokok ZISWAF

* **Muzakki:** Orang atau keluarga yang mengeluarkan zakat karena telah memenuhi syarat wajib.
* **Mustahiq:** Golongan orang yang berhak menerima penyaluran zakat (terbagi dalam 8 Asnaf).
* **Zakat Fitrah:** Zakat jiwa yang wajib dikeluarkan oleh setiap muslim di bulan Ramadhan hingga sebelum Shalat Idul Fitri (berupa makanan pokok/beras seberat 2.5 kg atau 3.5 liter, atau senilai uang yang setara).
* **Zakat Maal:** Zakat atas harta simpanan/tabungan/perniagaan/emas yang telah mencapai *nishab* (setara 85 gram emas murni) dan genap tersimpan selama 1 tahun (*haul*), dengan kadar zakat 2.5%.
* **Fidyah:** Pengganti puasa bagi orang yang tidak mampu berpuasa karena udzur syar'i tetap (lansia renta, sakit menahun, ibu hamil/menyusui tertentu), dibayarkan berupa makanan pokok atau nominal setara per hari puasa yang ditinggalkan.
* **Infaq / Shodaqoh:** Harta yang diserahkan secara sukarela untuk kepentingan dakwah, kemaslahatan masjid, dan fakir miskin.

---

## 3. Persiapan Awal Sebelum Membuka Posko

Sebelum amil duduk melayani di meja kasir, Ketua Amil atau Admin DKM wajib melakukan konfigurasi awal melalui menu **"Pengaturan"**:

1. **Atur Tahun Hijriyah & Masehi:** Misal: `1447 H / 2026 M`.
2. **Tentukan Standar Takaran Beras Zakat Fitrah:**
   * Berat per Jiwa: `2.5 Kg` (sesuai fatwa MUI) atau `3.5 Liter`.
3. **Tetapkan Konversi Harga Beras per Jiwa:**
   * Contoh: Beras Tipe Standar = `Rp 45.000 / jiwa` (sesuai ketetapan BAZNAS / Kemenag setempat).
4. **Siapkan Perangkat Fisik Posko:**
   * 1 unit Laptop / Tablet / Smartphone yang membuka website SimZakat.
   * 1 unit Printer Kasir Thermal (Ukuran 58mm atau 80mm).
   * 1 unit timbangan duduk (untuk menimbang beras fitrah fisik jika muzakki membawa beras dari rumah).
   * Kotak uang kasir bersekat / amplop brankas posko.

---

## 4. Diagram Alur Pelayanan Muzakki (5 Tahap)

```
[ 1. SAMBUT MUZAKKI ] ──► Ucapkan salam, persilakan duduk, tanyakan jenis zakat
         │
         ▼
[ 2. INPUT DATA KASIR ] ──► Ketik Nama Muzakki, Jiwa, HP, & Pilihan (Beras/Uang)
         │
         ▼
[ 3. AKAD IJAB QOBUL ] ──► Pandu Niat Muzakki & Amil membacakan doa berkah
         │
         ▼
[ 4. CETAK STRUK RESMI ] ──► Cetak Struk Thermal 58/80mm & Berikan ke Muzakki
         │
         ▼
[ 5. ARSIPKAN DANA/BERAS ] ──► Beras ditata di gudang, uang masuk brankas posko
```

---

## 5. Panduan Menu Kasir Penerimaan (Lengkap dengan Tampilan Visual)

Buka menu utama **"Kasir Penerimaan"**. Berikut adalah gambaran antarmuka kasir yang akan Anda lihat di layar:

### Visual Mockup Layar Kasir SimZakat:
```
==================================================================================
  POSKO KASIR SIMZAKAT 1447 H - MASJID RAYA AL-MUHAJIRIN
==================================================================================
 [1. DATA MUZAKKI]
 Nama Lengkap : [ H. Bambang Sudirman                      ]
 Nomor WhatsApp : [ 081299887766        ]  RT/RW : [ RT 03 / RW 07 ]

 --------------------------------------------------------------------------------
 [2. ZAKAT FITRAH]
 Jumlah Jiwa  : [  4  ] Jiwa (Bapak, Ibu, 2 Anak)
 Jenis Bayar  : ( ) Beras Fisik [ 10.0 Kg / 14 Liter ]
                (*) Uang Tunai  [ Rp 180.000 ]  (Rp 45.000 x 4 Jiwa Otomatis)

 --------------------------------------------------------------------------------
 [3. PEMBAYARAN TAMBAHAN (OPSIONAL)]
 [x] Zakat Maal (Tabungan/Emas) : [ Rp 2.500.000 ]
 [ ] Fidyah Puasa               : [ Rp 0         ]
 [x] Infaq Operasional Masjid   : [ Rp   50.000  ]

 --------------------------------------------------------------------------------
 TOTAL PEMBAYARAN TUNAI : Rp 2.730.000,-
 TOTAL BERAS FISIK      : 0.0 Kg
 --------------------------------------------------------------------------------
 [ TOMBOL 1: 📖 Tuntun Doa Ijab ]   [ TOMBOL 2: 💾 Simpan & Cetak Struk (Enter) ]
==================================================================================
```

### Penjelasan Pengisian Kolom per Kolom:
1. **Nama Lengkap Muzakki:** Tuliskan nama kepala keluarga atau perwakilan muzakki.
2. **Nomor WhatsApp (Sangat Penting):** Tulis nomor HP muzakki (misal: `081299887766`). Nomor ini digunakan untuk mengirimkan bukti kuitansi digital otomatis.
3. **RT / RW / Alamat:** Catat untuk pemetaan wilayah jamaah masjid.
4. **Jumlah Jiwa:** Masukkan jumlah anggota keluarga yang dizakati (termasuk bayi yang lahir sebelum terbenam matahari di malam Idul Fitri).
5. **Pilihan Bayar (Beras vs Uang):**
   * Jika muzakki membawa beras: pilih **Beras**, timbang fisiknya, lalu masukkan berat totalnya.
   * Jika muzakki membayar uang: pilih **Uang Tunai**, sistem secara otomatis mengalikan jumlah jiwa dengan patokan harga beras masjid.
6. **Zakat Maal / Fidyah / Infaq:** Jika muzakki ingin sekaligus menyalurkan zakat maal atau infaq, centang kotak pilihan dan masukkan nominalnya tanpa perlu membuat tiket terpisah.

---

## 6. Tata Cara Akad Ijab Qobul & Pembacaan Doa

Akad ijab qobul adalah rukun penting dalam penyerahan zakat menurut mayoritas ulama agar terjadi kejelasan penyerahan amanah dari muzakki kepada amil.

### Langkah Ijab Qobul di Posko:
1. Setelah data diisi, klik tombol kuning **"Tuntun Doa Ijab Qobul"** di layar.
2. Bimbing muzakki melafalkan niat sesuai jumlah jiwa (bisa dibaca dalam hati atau diucapkan lisan):
   * **Niat Sekeluarga (Latin):**
     > *"Nawaitu an ukhrija zakaatal fithri 'annii wa 'an jamii'i maa yalzamunii nafaqootuhum syar'an fardhan lillaahi ta'aalaa."*
     > *(Artinya: "Aku berniat mengeluarkan zakat fitrah untuk diriku dan seluruh orang yang nafkahnya menjadi tanggunganku fardhu karena Allah Ta'ala.")*
3. **Amil Wajib Menjawab dengan Membacakan Doa Berikut:**
   * **Lafaz Arab:**
     <div align="right">آجَرَكَ اللهُ فِيْمَا أَعْطَيْتَ، وَبَارَكَ فِيْمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُوْرًا</div>
   * **Latin:**
     > *"Aajarokallahu fiimaa a'thoita, wa baaraka fiimaa abqoita, wa ja'alahu laka thohuuroo."*
   * **Artinya:**
     > *"Semoga Allah memberikan pahala atas apa yang telah engkau berikan, melimpahkan berkah atas apa yang masih engkau simpan, dan menjadikannya pembersih dosa bagimu."*

---

## 7. Panduan Cetak Struk Thermal & Bukti Digital WhatsApp

Begitu tombol **"Simpan & Cetak Struk"** ditekan, jendela kuitansi resmi berlogo masjid akan muncul di layar:

### Visual Mockup Struk Thermal 58mm/80mm:
```
================================
     MASJID AL-MUHAJIRIN
      POSKO ZISWAF 1447 H
  Jl. Barokah No. 12 Jakarta
================================
No. Transaksi : ZKT-1447-0892
Tanggal       : 26 Ramadhan 1447 H
Amil Petugas  : Hadi Sucipto
--------------------------------
Nama Muzakki  : H. Bambang Sudirman
Jumlah Jiwa   : 4 Jiwa
Wilayah       : RT 03 / RW 07
--------------------------------
RINCIAN ZISWAF:
* Zakat Fitrah (Uang) : Rp 180.000
* Zakat Maal          : Rp 2.500.000
* Infaq Masjid        : Rp 50.000
--------------------------------
TOTAL DITERIMA : Rp 2.730.000
BERAS DITERIMA : 0.0 Kg
--------------------------------
Doa Amil:
"Aajarokallahu fiima a'thoita.."
Semoga menjadi pembersih harta
dan penyuci jiwa sekeluarga.
================================
       Alhamdulillah & Terima Kasih
  Layanan Muzakki: 0812-9988-7766
================================
```

### Pilihan Tindakan:
* **Tombol Cetak Struk Thermal:** Langsung mencetak struk fisik ke printer mini kasir. Serahkan struk ini kepada muzakki sebagai bukti sah.
* **Tombol Kirim via WhatsApp:** Membuka pesan WhatsApp resmi berformat rapi langsung ke nomor ponsel muzakki.
* **Tombol Unduh PDF Kuitansi:** Untuk arsip dokumen digital berukuran A4 / A5.

---

## 8. Panduan Sensus & Penyaluran Zakat ke 8 Asnaf

Tugas amil tidak berhenti pada pengumpulan, melainkan wajib mendistribusikannya secara tepat sasaran kepada para mustahiq sebelum fajar Shalat Idul Fitri menyingsing.

### A. Mendaftarkan Calon Penerima (Tab "Data Mustahiq")
1. Masuk ke tab **"Data Mustahiq"**.
2. Klik **"+ Tambah Mustahiq Baru"**.
3. Masukkan data: Nama Kepala Keluarga, NIK/KK, RT/RW, dan Kategori Asnaf (Fakir / Miskin / Fisabilillah / Muallaf / dll).
4. Tentukan hak kuota bantuan: misalnya `5 Kg Beras + Uang Tunai Rp 100.000`.

### B. Eksekusi Penyaluran (Tab "Distribusi Zakat")
1. Saat warga mustahiq datang membawa kupon zakat masjid, cari nama mustahiq pada daftar.
2. Klik tombol hijau **"Salurkan Sekarang"**.
3. Sistem akan otomatis:
   * Memotong stok beras gudang secara *real-time*.
   * Mengurangi saldo kas tunai yang diserahkan.
   * Mencatat tanggal dan jam penyerahan secara permanen agar tidak terjadi pengambilan ganda (*double claim*).

---

## 9. Laporan Pertanggungjawaban (LPJ), BAST & Tutup Buku

### A. Cetak Berita Acara Serah Terima (BAST) & LPJ
Pada akhir malam takbiran setelah seluruh distribusi tuntas:
1. Masuk ke tab **"Laporan & BAST"**.
2. Anda akan disajikan neraca lengkap:
   * Total Muzakki dan Jiwa terdaftar.
   * Total Pemasukan Beras (Kg & Liter) vs Total Penyaluran Beras ke 8 Asnaf.
   * Total Pemasukan Kas Uang vs Pengeluaran Kas (Sembako & Santunan).
   * Selisih / Sisa Kas (Wajib Rp 0 atau dialihkan sesuai fatwa DKM).
3. Klik tombol **"Cetak Berita Acara Serah Terima (BAST)"**.
4. Cetak dokumen ini, lalu mintalah tanda tangan:
   * **Pihak 1:** Ketua Panitia Amil Zakat.
   * **Pihak 2:** Ketua DKM Masjid.
   * **Saksi:** Tokoh Masyarakat / Ketua RW setempat.

### B. Tutup Buku Tahunan (Arsip Hijriyah)
1. Buka menu **"Pengaturan"**.
2. Klik tombol **"Tutup Buku & Arsipkan Tahun Ini"**.
3. Seluruh data tahun 1447 H akan dibekukan ke brankas arsip permanen (*Yearly Archive*), dan aplikasi siap digunakan untuk tahun 1448 H tanpa menghapus riwayat masa lalu.

---

## 10. Penanganan Masalah Lapangan (Troubleshooting)

| Masalah Lapangan | Penyebab | Solusi Amil di Posko |
| :--- | :--- | :--- |
| **Printer thermal tidak mencetak** | Bluetooth terputus / Kertas habis / Kabel USB longgar | Periksa lampu indikator printer. Buka cover kertas, pastikan kertas thermal menghadap ke arah yang benar. Gunakan opsi *Kirim WhatsApp* sementara printer diperbaiki. |
| **Salah input nama atau jumlah jiwa** | Human error saat jam sibuk | Buka tab **"Buku Muzakki"**, cari nama muzakki, klik ikon pensil **Edit**, perbaiki angka jiwa, lalu cetak ulang struk revisi. |
| **Muzakki lupa bawa uang pas** | Nominal pecahan besar | Amil dapat mencatat uang kembalian di brankas kasir posko. |
| **Koneksi internet lambat / putus** | Sinyal seluler padat di malam takbiran | Aplikasi SimZakat memiliki fitur *offline cache*. Amil tetap bisa menginput data, mencetak struk kasir, dan data akan otomatis tersinkronisasi begitu sinyal kembali online. |
| **Lupa kata sandi akun amil / DKM** | Salah ketik password 3x | Klik **"Lupa Kata Sandi"** pada layar login. Masukkan kode OTP yang masuk ke nomor WhatsApp terdaftar, atau gunakan Master Recovery Key DKM (144799). |

---

*Dokumen ini diterbitkan oleh Pengurus Pusat SimZakat Indonesia sebagai acuan operasional resmi seluruh posko amil mitra masjid se-Indonesia.*
