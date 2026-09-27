/**
 * GENERATOR LAPORAN & BERITA ACARA (BAST) FORMAT MICROSOFT WORD (.doc)
 * Menghasilkan dokumen Microsoft Word resmi yang rapi, ber-kop surat,
 * ber-tabel standar, dan 100% dapat diedit di MS Word, WPS Office, dan Google Docs.
 */

import { AppConfig, DistributionRecord, Mustahiq, MuzakkiTransaction, ASNAF_LABELS, AsnafType } from '../types/zakat';
import { formatDateIndo, formatKg, formatRupiah } from './helpers';

export interface ReportSummaryData {
  config: AppConfig;
  transactions: MuzakkiTransaction[];
  mustahiqList: Mustahiq[];
  distributions: DistributionRecord[];
  totalRiceInKg: number;
  totalRiceOutKg: number;
  remainingRiceKg: number;
  totalMoneyInRp: number;
  totalMoneyOutRp: number;
  remainingMoneyRp: number;
  moneyByCategory: {
    fitrah: number;
    maal: number;
    profesi: number;
    infaq: number;
    fidyah: number;
  };
  totalFitrahSouls: number;
  asnafStats: Record<string, { riceKg: number; moneyRp: number; count: number }>;
}

/**
 * Format nama sekretariat agar tidak terjadi pengulangan kata
 * Contoh: "Panitia Zakat Masjid Mujahidin" -> "Sekretariat Panitia Zakat Masjid Mujahidin"
 * Contoh: "Masjid Al-Muhajirin" -> "Sekretariat Panitia Amil Zakat Masjid Al-Muhajirin"
 */
export function getSekretariatText(orgName: string): string {
  const clean = (orgName || '').trim();
  if (/^panitia/i.test(clean)) {
    return clean;
  }
  return `Panitia Amil Zakat ${clean}`;
}

/**
 * Ekspor Berita Acara Serah Terima (BAST) ke berkas Microsoft Word (.doc)
 */
export function exportBastToWord(data: ReportSummaryData) {
  const { config, transactions, mustahiqList, totalRiceInKg, totalRiceOutKg, remainingRiceKg, totalMoneyInRp, totalMoneyOutRp, remainingMoneyRp, totalFitrahSouls } = data;

  const tanggalStr = formatDateIndo(new Date().toISOString());
  const tahunHijriClean = config.hijriYear.replace(/\s+/g, '');
  const tahunMasehi = new Date().getFullYear();
  const nomorBast = `BAST/UPZ-${tahunHijriClean}/${tahunMasehi}/001`;
  const sekretariatText = getSekretariatText(config.organizationName);

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Berita Acara Penerimaan dan Penyaluran Zakat</title>
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
      margin: 2.5cm 2.0cm 2.5cm 2.0cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11.5pt;
      line-height: 1.45;
      color: #000000;
    }
    .kop-header {
      text-align: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .bismillah {
      font-family: 'Traditional Arabic', 'Amiri', 'Times New Roman', serif;
      font-size: 18pt;
      margin-bottom: 4px;
    }
    .org-title {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .org-sub {
      font-size: 11pt;
      font-weight: bold;
      color: #333333;
      margin: 2px 0;
    }
    .org-address {
      font-size: 9.5pt;
      color: #555555;
      margin: 0;
    }
    .doc-title-box {
      text-align: center;
      margin: 18px 0;
    }
    .doc-title {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
      margin: 0;
    }
    .doc-number {
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      margin-top: 4px;
    }
    p {
      text-align: justify;
      margin: 8px 0;
      text-indent: 28px;
    }
    .no-indent {
      text-indent: 0;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 10.5pt;
    }
    table.data-table th {
      border: 1px solid #000000;
      background-color: #f2f2f2;
      padding: 7px 9px;
      font-weight: bold;
    }
    table.data-table td {
      border: 1px solid #000000;
      padding: 6px 9px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    
    table.sig-table {
      width: 100%;
      border: none;
      margin-top: 36px;
      border-collapse: collapse;
      font-size: 11pt;
    }
    table.sig-table td {
      border: none;
      padding: 0;
      vertical-align: top;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- KOP SURAT RESMI -->
  <div class="kop-header">
    <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <div class="org-title">${config.organizationName}</div>
    <div class="org-sub">${config.subTitle}</div>
    <div class="org-address">${config.address} • Kontak: ${config.phone}</div>
  </div>

  <!-- JUDUL DOKUMEN -->
  <div class="doc-title-box">
    <div class="doc-title">BERITA ACARA PENERIMAAN DAN PENYALURAN ZAKAT</div>
    <div class="doc-number">Nomor: ${nomorBast}</div>
  </div>

  <!-- ISI BERITA ACARA -->
  <p>
    Pada hari ini, <strong>${tanggalStr}</strong>, bertempat di Sekretariat <strong>${sekretariatText}</strong>, telah dilaksanakan rekapitulasi penutupan penerimaan dan penyaluran Zakat Fitrah, Zakat Maal, Infaq, Sedekah, dan Fidyah tahun <strong>${config.hijriYear} / ${config.masehiYear}</strong> dengan rincian sebagai berikut:
  </p>

  <!-- TABEL REKAPITULASI BAST -->
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 45%; text-align: left;">Uraian Komoditas & Dana</th>
        <th style="width: 18%; text-align: right;">Penerimaan</th>
        <th style="width: 18%; text-align: right;">Penyaluran</th>
        <th style="width: 19%; text-align: right;">Sisa Saldo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Beras Zakat Fitrah</td>
        <td class="text-right font-bold">${formatKg(totalRiceInKg)}</td>
        <td class="text-right">${formatKg(totalRiceOutKg)}</td>
        <td class="text-right font-bold">${formatKg(remainingRiceKg)}</td>
      </tr>
      <tr>
        <td class="font-bold">Dana Kas Uang Zakat (Semua Kategori)</td>
        <td class="text-right font-bold">${formatRupiah(totalMoneyInRp)}</td>
        <td class="text-right">${formatRupiah(totalMoneyOutRp)}</td>
        <td class="text-right font-bold">${formatRupiah(remainingMoneyRp)}</td>
      </tr>
    </tbody>
  </table>

  <p>
    Adapun jumlah Muzakki terdata sebanyak <strong>${transactions.length} muzakki/transaksi</strong> (dengan rincian zakat fitrah sebanyak <strong>${totalFitrahSouls} jiwa</strong>), dan telah didistribusikan kepada <strong>${mustahiqList.length} orang Mustahiq</strong> yang berhak sesuai dengan 8 Golongan Asnaf di wilayah binaan.
  </p>

  <p>
    Demikian Berita Acara ini dibuat dengan sebenar-benarnya dalam keadaan sadar dan penuh rasa tanggung jawab serta amanah di hadapan Allah Subhanahu wa Ta'ala.
  </p>

  <!-- TANDA TANGAN RESMI -->
  <table class="sig-table">
    <tr>
      <td style="width: 50%;">
        Sekretaris / Bendahara Panitia Zakat,<br/><br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${config.treasurerName || 'Ust. Muhammad Ridwan'}</strong><br/>
        <em>Bendahara / Panitia Zakat</em>
      </td>
      <td style="width: 50%;">
        Dibuat di Sekretariat,<br/>
        Pada tanggal: ${tanggalStr}<br/>
        Ketua Panitia Amil Zakat,<br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${config.headAmil || 'H. Ahmad Syarifuddin'}</strong><br/>
        <em>Ketua Panitia Zakat / DKM</em>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  downloadWordFile(
    wordContent,
    `BAST_Zakat_${safeFileName(config.organizationName)}_${tahunHijriClean}.doc`
  );
}

/**
 * Ekspor Laporan Pertanggungjawaban (LPJ) & Rekapitulasi ZISWAF ke berkas Microsoft Word (.doc)
 */
export function exportLpjToWord(data: ReportSummaryData) {
  const { config, transactions, mustahiqList, distributions, totalRiceInKg, totalRiceOutKg, remainingRiceKg, totalMoneyInRp, totalMoneyOutRp, remainingMoneyRp, moneyByCategory, totalFitrahSouls, asnafStats } = data;

  const tanggalStr = formatDateIndo(new Date().toISOString());
  const tahunHijriClean = config.hijriYear.replace(/\s+/g, '');

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Laporan Pertanggungjawaban ZISWAF</title>
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
      margin: 2.0cm 2.0cm 2.0cm 2.0cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000000;
    }
    .kop-header {
      text-align: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .bismillah {
      font-family: 'Traditional Arabic', 'Amiri', 'Times New Roman', serif;
      font-size: 16pt;
      margin-bottom: 4px;
    }
    .org-title {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0;
    }
    .org-sub {
      font-size: 10.5pt;
      font-weight: bold;
      color: #333333;
      margin: 2px 0;
    }
    .org-address {
      font-size: 9pt;
      color: #555555;
    }
    .doc-title-box {
      text-align: center;
      margin: 14px 0;
    }
    .doc-title {
      font-size: 12.5pt;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
    }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 14px;
      margin-bottom: 4px;
      text-transform: uppercase;
      color: #1a4d2e;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px 0;
      font-size: 10pt;
    }
    table.data-table th {
      border: 1px solid #000000;
      background-color: #f2f2f2;
      padding: 6px 8px;
      font-weight: bold;
    }
    table.data-table td {
      border: 1px solid #000000;
      padding: 5px 8px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    
    table.sig-table {
      width: 100%;
      border: none;
      margin-top: 28px;
      border-collapse: collapse;
      font-size: 10.5pt;
    }
    table.sig-table td {
      border: none;
      padding: 0;
      vertical-align: top;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- KOP SURAT RESMI -->
  <div class="kop-header">
    <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <div class="org-title">${config.organizationName}</div>
    <div class="org-sub">${config.subTitle}</div>
    <div class="org-address">${config.address} • Kontak: ${config.phone}</div>
  </div>

  <!-- JUDUL DOKUMEN -->
  <div class="doc-title-box">
    <div class="doc-title">LAPORAN PERTANGGUNGJAWABAN (LPJ) & REKAPITULASI ZISWAF</div>
    <div>Tahun Operasional: ${config.hijriYear} / ${config.masehiYear}</div>
  </div>

  <!-- 1. NERACA KAS DAN KOMODITAS UTAMA -->
  <div class="section-title">I. Neraca Rekapitulasi Komoditas Beras & Kas Keuangan</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 34%; text-align: left;">Pilar Transaksi</th>
        <th style="width: 22%; text-align: right;">Total Penerimaan</th>
        <th style="width: 22%; text-align: right;">Total Penyaluran</th>
        <th style="width: 22%; text-align: right;">Sisa Saldo Kas / Stok</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Logistik Beras (Zakat Fitrah)</td>
        <td class="text-right font-bold">${formatKg(totalRiceInKg)}</td>
        <td class="text-right">${formatKg(totalRiceOutKg)}</td>
        <td class="text-right font-bold">${formatKg(remainingRiceKg)}</td>
      </tr>
      <tr>
        <td class="font-bold">Dana Kas Uang ZISWAF</td>
        <td class="text-right font-bold">${formatRupiah(totalMoneyInRp)}</td>
        <td class="text-right">${formatRupiah(totalMoneyOutRp)}</td>
        <td class="text-right font-bold">${formatRupiah(remainingMoneyRp)}</td>
      </tr>
    </tbody>
  </table>

  <!-- 2. RINCIAN PER KATEGORI -->
  <div class="section-title">II. Rincian Penerimaan Dana Berdasarkan Jenis Zakat & Infaq</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 8%; text-align: center;">No</th>
        <th style="width: 42%; text-align: left;">Kategori Zakat / Penerimaan</th>
        <th style="width: 25%; text-align: center;">Keterangan Jiwa / Transaksi</th>
        <th style="width: 25%; text-align: right;">Jumlah Dana Masuk</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td class="font-bold">Zakat Fitrah (Uang Tunai / Transfer)</td>
        <td class="text-center">${totalFitrahSouls} Jiwa</td>
        <td class="text-right font-bold">${formatRupiah(moneyByCategory.fitrah)}</td>
      </tr>
      <tr>
        <td class="text-center">2</td>
        <td>Zakat Maal (Harta, Tabungan, Emas, Usaha)</td>
        <td class="text-center">-</td>
        <td class="text-right font-bold">${formatRupiah(moneyByCategory.maal)}</td>
      </tr>
      <tr>
        <td class="text-center">3</td>
        <td>Zakat Profesi / Penghasilan Bulanan</td>
        <td class="text-center">-</td>
        <td class="text-right font-bold">${formatRupiah(moneyByCategory.profesi)}</td>
      </tr>
      <tr>
        <td class="text-center">4</td>
        <td>Infaq &amp; Sedekah Terikat / Bebas</td>
        <td class="text-center">-</td>
        <td class="text-right font-bold">${formatRupiah(moneyByCategory.infaq)}</td>
      </tr>
      <tr>
        <td class="text-center">5</td>
        <td>Fidyah (Hutang Puasa)</td>
        <td class="text-center">-</td>
        <td class="text-right font-bold">${formatRupiah(moneyByCategory.fidyah)}</td>
      </tr>
      <tr style="background-color: #f7f7f7;">
        <td colspan="3" class="text-right font-bold">TOTAL PENERIMAAN DANA KAS:</td>
        <td class="text-right font-bold">${formatRupiah(totalMoneyInRp)}</td>
      </tr>
    </tbody>
  </table>

  <!-- 3. PENYALURAN 8 ASNAF -->
  <div class="section-title">III. Rincian Distribusi Hak Penyaluran 8 Golongan Asnaf</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 28%; text-align: left;">Golongan Asnaf</th>
        <th style="width: 18%; text-align: center;">Mustahiq Terdata</th>
        <th style="width: 18%; text-align: center;">Frekuensi Serah</th>
        <th style="width: 18%; text-align: right;">Beras Disalurkan</th>
        <th style="width: 18%; text-align: right;">Uang Disalurkan</th>
      </tr>
    </thead>
    <tbody>
      ${(Object.keys(ASNAF_LABELS) as AsnafType[]).map((key) => {
        const meta = ASNAF_LABELS[key];
        const registeredCount = mustahiqList.filter((m) => m.asnaf === key).length;
        const stat = asnafStats[key] || { riceKg: 0, moneyRp: 0, count: 0 };
        return `
        <tr>
          <td class="font-bold">${meta.label}</td>
          <td class="text-center">${registeredCount} Orang</td>
          <td class="text-center">${stat.count} Kali</td>
          <td class="text-right">${stat.riceKg > 0 ? formatKg(stat.riceKg) : '-'}</td>
          <td class="text-right">${stat.moneyRp > 0 ? formatRupiah(stat.moneyRp) : '-'}</td>
        </tr>
        `;
      }).join('')}
      <tr style="background-color: #f7f7f7;">
        <td colspan="3" class="text-right font-bold">TOTAL PENYALURAN TEREALISASI:</td>
        <td class="text-right font-bold">${formatKg(totalRiceOutKg)}</td>
        <td class="text-right font-bold">${formatRupiah(totalMoneyOutRp)}</td>
      </tr>
    </tbody>
  </table>

  <!-- TANDA TANGAN RESMI -->
  <table class="sig-table">
    <tr>
      <td style="width: 50%;">
        Sekretaris / Bendahara Panitia Zakat,<br/><br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${config.treasurerName || 'Ust. Muhammad Ridwan'}</strong><br/>
        <em>Bendahara / Panitia Zakat</em>
      </td>
      <td style="width: 50%;">
        Dibuat di Sekretariat,<br/>
        Pada tanggal: ${tanggalStr}<br/>
        Ketua Panitia Amil Zakat,<br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${config.headAmil || 'H. Ahmad Syarifuddin'}</strong><br/>
        <em>Ketua Panitia Zakat / DKM</em>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  downloadWordFile(
    wordContent,
    `LPJ_Rekapitulasi_ZISWAF_${safeFileName(config.organizationName)}_${tahunHijriClean}.doc`
  );
}

function safeFileName(str: string): string {
  return (str || 'Lembaga').replace(/[^a-zA-Z0-9]/g, '_');
}

function downloadWordFile(content: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + content], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
