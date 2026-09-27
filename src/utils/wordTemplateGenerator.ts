/**
 * GENERATOR TEMPLATE SURAT REKOMENDASI PENGGUNAAN SIMZAKAT (.doc / Word)
 * Menghasilkan berkas template dokumen Microsoft Word resmi yang dapat diedit langsung
 * oleh pengurus DKM / Panitia Amil Zakat.
 */

export interface SuratRekomendasiData {
  namaMasjid?: string;
  alamatMasjid?: string;
  kotaMasjid?: string;
  namaKetuaDkm?: string;
  nomorHpKetua?: string;
  namaPetugasAmil?: string;
  jabatanPetugas?: string;
  nomorHpPetugas?: string;
  tahunHijriyah?: string;
  tahunMasehi?: string;
}

export function generateSuratRekomendasiWord(data: SuratRekomendasiData = {}) {
  const namaMasjid = data.namaMasjid || '[ NAMA MASJID / MUSHALLA / LEMBAGA ]';
  const alamat = data.alamatMasjid || '[ Alamat Lengkap Masjid, Jalan, RT/RW, Kelurahan ]';
  const kota = data.kotaMasjid || '[ Kota / Kabupaten ]';
  const ketua = data.namaKetuaDkm || '[ Nama Ketua DKM / Penanggung Jawab ]';
  const amil = data.namaPetugasAmil || '[ Nama Petugas Amil / Admin yang Didaftarkan ]';
  const jabatan = data.jabatanPetugas || 'Sekretaris / Petugas Kasir Amil Zakat';
  const hpAmil = data.nomorHpPetugas || '[ Nomor WhatsApp Petugas ]';
  const hijri = data.tahunHijriyah || '1447 H';
  const masehi = data.tahunMasehi || '2026 M';
  const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Surat Rekomendasi Penggunaan SimZakat</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 21.0cm 29.7cm; /* A4 */
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #000000;
    }
    .kop-surat {
      text-align: center;
      border-bottom: 3px double #000000;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .kop-instansi {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .kop-masjid {
      font-size: 16pt;
      font-weight: bold;
      color: #064e3b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .kop-alamat {
      font-size: 10pt;
      font-style: italic;
    }
    .judul-surat {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .nomor-surat {
      text-align: center;
      font-size: 11pt;
      margin-bottom: 24px;
    }
    p {
      text-align: justify;
      margin-bottom: 12px;
      text-indent: 36pt;
    }
    .no-indent {
      text-indent: 0;
    }
    table.data-table {
      width: 100%;
      margin: 12px 0 16px 36pt;
      border-collapse: collapse;
    }
    table.data-table td {
      padding: 4px 6px;
      vertical-align: top;
      font-size: 12pt;
    }
    .tanda-tangan-table {
      width: 100%;
      margin-top: 40px;
      border-collapse: collapse;
    }
    .tanda-tangan-table td {
      vertical-align: top;
      text-align: center;
      font-size: 12pt;
    }
    .materai-box {
      border: 1px dashed #64748b;
      padding: 6px 12px;
      font-size: 9pt;
      color: #475569;
      display: inline-block;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>

  <!-- KOP SURAT RESMI -->
  <div class="kop-surat">
    <div class="kop-instansi">DEWAN KEMAKMURAN MASJID (DKM) / UNIT PENGUMPUL ZAKAT (UPZ)</div>
    <div class="kop-masjid">${namaMasjid}</div>
    <div class="kop-alamat">${alamat} &bull; ${kota}</div>
  </div>

  <!-- JUDUL SURAT -->
  <div class="judul-surat">SURAT REKOMENDASI DAN PENUGASAN OPERATOR SISTEM</div>
  <div class="nomor-surat">Nomor: _____ / DKM-UPZ / SR-SZ / ${hijri}</div>

  <!-- ISI SURAT -->
  <p class="no-indent">
    Yang bertanda tangan di bawah ini:
  </p>

  <table class="data-table">
    <tr>
      <td style="width: 180px;">Nama Penanggung Jawab</td>
      <td style="width: 15px;">:</td>
      <td><strong>${ketua}</strong></td>
    </tr>
    <tr>
      <td>Jabatan</td>
      <td>:</td>
      <td>Ketua DKM / Ketua Panitia Amil Zakat</td>
    </tr>
    <tr>
      <td>Nama Masjid / Lembaga</td>
      <td>:</td>
      <td><strong>${namaMasjid}</strong></td>
    </tr>
    <tr>
      <td>Alamat Domisili</td>
      <td>:</td>
      <td>${alamat}, ${kota}</td>
    </tr>
  </table>

  <p class="no-indent">
    Dengan ini memberikan <strong>REKOMENDASI DAN MANDAT RESMI</strong> kepada petugas di bawah ini:
  </p>

  <table class="data-table">
    <tr>
      <td style="width: 180px;">Nama Petugas / Amil</td>
      <td style="width: 15px;">:</td>
      <td><strong>${amil}</strong></td>
    </tr>
    <tr>
      <td>Jabatan / Peran</td>
      <td>:</td>
      <td>${jabatan}</td>
    </tr>
    <tr>
      <td>Nomor WhatsApp / HP</td>
      <td>:</td>
      <td>${hpAmil}</td>
    </tr>
  </table>

  <p>
    Untuk bertindak sebagai <strong>Administrator / Operator Resmi Posko Zakat</strong> pada aplikasi <em>SimZakat (Sistem Manajemen Digital Amil Zakat)</em> untuk periode Ramadhan dan Idul Fitri <strong>${hijri} / ${masehi}</strong>, dengan kewenangan menginput data transaksi muzakki, menerbitkan tanda terima kuitansi sah, mendata penerima hak 8 Asnaf (mustahiq), serta mencatat penyaluran zakat fitrah dan zakat maal sesuai kaidah Syariat Islam.
  </p>

  <p>
    Pengurus DKM dan Panitia Amil menjamin bahwa seluruh dana dan komoditas zakat yang terhimpun melalui posko ini dikelola secara transparan, amanah, dan disalurkan seutuhnya kepada 8 golongan Asnaf yang berhak sesuai ketentuan Al-Qur'an Surah At-Taubah ayat 60 serta Undang-Undang Republik Indonesia Nomor 23 Tahun 2011 tentang Pengelolaan Zakat.
  </p>

  <p>
    Demikian Surat Rekomendasi dan Penugasan ini dibuat dengan sebenarnya dalam keadaan sadar dan bertanggung jawab untuk dipergunakan sebagaimana mestinya sebagai syarat verifikasi kelembagaan pada platform SimZakat.
  </p>

  <!-- BLOK TANDA TANGAN -->
  <table class="tanda-tangan-table">
    <tr>
      <td style="width: 50%;">
        Petugas yang Ditugaskan / Penerima Mandat,<br/><br/><br/><br/><br/>
        <strong>( ${amil} )</strong><br/>
        <em>Petugas Amil / Admin</em>
      </td>
      <td style="width: 50%;">
        Dibuat di: ${kota}<br/>
        Pada tanggal: ${tanggalHariIni}<br/><br/>
        <div class="materai-box">Materai Rp 10.000 &amp; Cap DKM</div><br/><br/>
        <strong>( ${ketua} )</strong><br/>
        <em>Ketua DKM / Penanggung Jawab</em>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  // Buat berkas Word .doc
  const blob = new Blob(['\uFEFF' + wordContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeMasjid = (data.namaMasjid || 'Masjid').replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Surat_Rekomendasi_SimZakat_${safeMasjid}_${hijri.replace(/\s+/g, '')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
