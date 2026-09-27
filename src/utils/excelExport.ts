/**
 * SIMZAKAT EXCEL & SPREADSHEET EXPORT SERVICE
 * Menghasilkan berkas Excel (.xls) dan CSV berformat rapi, ber-kop surat resmi lembaga,
 * dilengkapi judul dokumen, metadata waktu, ringkasan akumulasi, border rapi, dan footer total.
 */

import { AppConfig, DistributionRecord, Mustahiq, MuzakkiTransaction, ASNAF_LABELS, AsnafType } from '../types/zakat';
import { MasjidAccount, UserAccount } from '../types/auth';
import { formatKg, formatRupiah } from './helpers';

// Helper formatting date
function getExportTimestamp(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

/**
 * Mengunduh dokumen dalam format Excel HTML/XML (.xls).
 * Format ini secara otomatis dibuka oleh Microsoft Excel, Google Sheets, dan LibreOffice Calc
 * dengan mempertahankan warna header, font tebal, garis border, dan tata letak sel yang rapi.
 */
function downloadStyledExcel(htmlTableContent: string, fileName: string) {
  const excelTemplate = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:x="urn:schemas-microsoft-com:office:excel" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Laporan SimZakat</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th { background-color: #047857; color: #ffffff; font-weight: bold; border: 1px solid #065f46; padding: 10px 8px; text-align: center; vertical-align: middle; }
    th.owner-th { background-color: #5b21b6; color: #ffffff; border: 1px solid #4c1d95; }
    td { border: 1px solid #cbd5e1; padding: 7px 8px; vertical-align: middle; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: bold; }
    .header-title { font-size: 16pt; font-weight: bold; color: #064e3b; text-align: center; }
    .header-subtitle { font-size: 12pt; font-weight: bold; color: #334155; text-align: center; }
    .header-meta { font-size: 10pt; color: #64748b; text-align: center; font-style: italic; }
    .summary-card { background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px 12px; font-weight: bold; }
    .summary-card-owner { background-color: #f5f3ff; border: 1px solid #ddd6fe; padding: 8px 12px; font-weight: bold; }
    .footer-total { background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; }
    .zebra-even { background-color: #f8fafc; }
    .badge-active { background-color: #d1fae5; color: #065f46; font-weight: bold; }
    .badge-pending { background-color: #fef3c7; color: #92400e; font-weight: bold; }
    .badge-suspended { background-color: #ffe4e6; color: #9f1239; font-weight: bold; }
  </style>
</head>
<body>
  ${htmlTableContent}
</body>
</html>
  `;

  const blob = new Blob(['\uFEFF' + excelTemplate], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.xls') ? fileName : `${fileName}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =============================================================================
// 1. EKSPOR TRANSAKSI MUZAKKI (UNTUK PETUGAS / AMIL)
// =============================================================================
export function exportMuzakkiToExcel(transactions: MuzakkiTransaction[], config: AppConfig) {
  const timestamp = getExportTimestamp();

  // Hitung akumulasi ringkasan
  const totalJiwa = transactions
    .filter((t) => t.category === 'fitrah')
    .reduce((acc, t) => acc + (t.fitrahDetail?.payerCount || 1), 0);
  const totalBerasKg = transactions.reduce((acc, t) => acc + (t.totalRiceKg || 0), 0);
  const totalUangRp = transactions.reduce((acc, t) => acc + (t.totalMoneyRp || 0), 0);

  const rowsHtml = transactions.map((t, index) => {
    const isFitrah = t.category === 'fitrah';
    const jiwa = isFitrah ? t.fitrahDetail?.payerCount || 1 : '-';
    const family = isFitrah && t.fitrahDetail?.familyMembers ? t.fitrahDetail.familyMembers.join('; ') : '-';
    const bentuk = isFitrah ? (t.fitrahDetail?.unit === 'beras' ? 'Beras' : 'Uang Tunai') : '-';
    const zebra = index % 2 === 1 ? 'zebra-even' : '';

    return `
      <tr class="${zebra}">
        <td class="text-center">${index + 1}</td>
        <td class="text-center bold">${t.receiptNumber}</td>
        <td class="text-center">${t.dateStr}</td>
        <td class="bold">${t.name}</td>
        <td class="text-center">${t.phone || '-'}</td>
        <td>${t.address}</td>
        <td class="text-center">${t.rtRw || '-'}</td>
        <td class="text-center bold">${t.category.toUpperCase()}</td>
        <td class="text-center">${bentuk}</td>
        <td class="text-center bold">${jiwa}</td>
        <td>${family}</td>
        <td class="text-right bold">${t.totalRiceKg > 0 ? t.totalRiceKg.toFixed(1) + ' Kg' : '-'}</td>
        <td class="text-right bold">${t.totalMoneyRp > 0 ? formatRupiah(t.totalMoneyRp) : '-'}</td>
        <td class="text-center">${t.paymentMethod.toUpperCase()}</td>
        <td>${t.amilName}</td>
        <td>${t.notes || '-'}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!-- HEADER RESMI LAPORAN -->
    <table>
      <tr>
        <td colspan="16" class="header-title">BUKU CATATAN PENERIMAAN ZAKAT (MUZAKKI)</td>
      </tr>
      <tr>
        <td colspan="16" class="header-subtitle">${config.organizationName.toUpperCase()}</td>
      </tr>
      <tr>
        <td colspan="16" class="header-meta">
          Tahun Operasional: ${config.hijriYear} / ${config.masehiYear} &bull; Waktu Ekspor: ${timestamp}
        </td>
      </tr>
      <tr>
        <td colspan="16" class="text-center">${config.address} &bull; Kontak Panitia: ${config.phone || '-'}</td>
      </tr>
      <tr><td colspan="16" style="border:none; height:12px;"></td></tr>
      
      <!-- KOTAK RINGKASAN EKSEKUTIF -->
      <tr>
        <td colspan="4" class="summary-card text-center">TOTAL TRANSAKSI: <br/><span style="font-size:14pt;">${transactions.length} Transaksi</span></td>
        <td colspan="4" class="summary-card text-center">TOTAL JIWA FITRAH: <br/><span style="font-size:14pt;">${totalJiwa} Jiwa</span></td>
        <td colspan="4" class="summary-card text-center">TOTAL BERAS TERKUMPUL: <br/><span style="font-size:14pt;">${formatKg(totalBerasKg)}</span></td>
        <td colspan="4" class="summary-card text-center">TOTAL DANA TUNAI/KAS: <br/><span style="font-size:14pt;">${formatRupiah(totalUangRp)}</span></td>
      </tr>
      <tr><td colspan="16" style="border:none; height:12px;"></td></tr>
    </table>

    <!-- TABEL DATA UTAMA -->
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">No</th>
          <th>No. Kuitansi</th>
          <th>Tanggal</th>
          <th>Nama Muzakki</th>
          <th>No. Telepon / WA</th>
          <th>Alamat Domisili</th>
          <th>RT/RW</th>
          <th>Kategori</th>
          <th>Bentuk</th>
          <th>Jiwa</th>
          <th>Anggota Keluarga</th>
          <th>Beras (Kg)</th>
          <th>Uang (Rp)</th>
          <th>Metode</th>
          <th>Petugas Amil</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr class="footer-total">
          <td colspan="9" class="text-right bold">TOTAL KESELURUHAN</td>
          <td class="text-center bold">${totalJiwa}</td>
          <td></td>
          <td class="text-right bold">${totalBerasKg.toFixed(1)} Kg</td>
          <td class="text-right bold">${formatRupiah(totalUangRp)}</td>
          <td colspan="3"></td>
        </tr>
      </tfoot>
    </table>

    <!-- TANDA TANGAN / PENGESAHAN AMIL -->
    <table style="margin-top: 30px; border: none;">
      <tr style="border: none;">
        <td colspan="8" style="border: none; text-align: center; vertical-align: top;">
          Mengetahui,<br/>
          <strong>Ketua DKM / Penanggung Jawab</strong><br/><br/><br/><br/>
          ( ___________________________ )
        </td>
        <td colspan="8" style="border: none; text-align: center; vertical-align: top;">
          ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}<br/>
          <strong>Bendahara / Petugas Amil Kasir</strong><br/><br/><br/><br/>
          ( ${config.treasurerName || '___________________________'} )
        </td>
      </tr>
    </table>
  `;

  const fileName = `Buku_Muzakki_${config.organizationName.replace(/\s+/g, '_')}_${config.hijriYear.replace(/\s+/g, '_')}`;
  downloadStyledExcel(htmlContent, fileName);
}

// =============================================================================
// 2. EKSPOR DATA MUSTAHIQ 8 ASNAF (UNTUK PETUGAS / AMIL)
// =============================================================================
export function exportMustahiqToExcel(mustahiqList: Mustahiq[], config: AppConfig) {
  const timestamp = getExportTimestamp();

  const totalJiwa = mustahiqList.reduce((acc, m) => acc + (m.familyMembersCount || 1), 0);
  const totalBerasDiterima = mustahiqList.reduce((acc, m) => acc + (m.totalRiceReceivedKg || 0), 0);
  const totalUangDiterima = mustahiqList.reduce((acc, m) => acc + (m.totalMoneyReceivedRp || 0), 0);

  const rowsHtml = mustahiqList.map((m, index) => {
    const asnafInfo = ASNAF_LABELS[m.asnaf];
    const zebra = index % 2 === 1 ? 'zebra-even' : '';

    return `
      <tr class="${zebra}">
        <td class="text-center">${index + 1}</td>
        <td class="text-center bold">${m.id}</td>
        <td class="bold">${m.name}</td>
        <td class="text-center bold">${asnafInfo?.label || m.asnaf.toUpperCase()}</td>
        <td class="text-center bold">${m.familyMembersCount || 1} Jiwa</td>
        <td>${m.address}</td>
        <td class="text-center">${m.rtRw || '-'}</td>
        <td class="text-center">${m.phone || '-'}</td>
        <td class="text-center bold">${m.priority.toUpperCase()}</td>
        <td class="text-center">${m.status === 'diverifikasi' ? 'TERVERIFIKASI' : m.status.toUpperCase()}</td>
        <td class="text-right bold">${m.totalRiceReceivedKg > 0 ? m.totalRiceReceivedKg.toFixed(1) + ' Kg' : '-'}</td>
        <td class="text-right bold">${m.totalMoneyReceivedRp > 0 ? formatRupiah(m.totalMoneyReceivedRp) : '-'}</td>
        <td class="text-center">${m.lastDistributedAt || 'Belum Disalurkan'}</td>
        <td>${m.notes || '-'}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <table>
      <tr>
        <td colspan="14" class="header-title">BUKU DATA INDUK MUSTAHIQ 8 ASNAF</td>
      </tr>
      <tr>
        <td colspan="14" class="header-subtitle">${config.organizationName.toUpperCase()}</td>
      </tr>
      <tr>
        <td colspan="14" class="header-meta">
          Periode Zakat: ${config.hijriYear} / ${config.masehiYear} &bull; Waktu Ekspor: ${timestamp}
        </td>
      </tr>
      <tr>
        <td colspan="14" class="text-center">${config.address} &bull; Kontak: ${config.phone || '-'}</td>
      </tr>
      <tr><td colspan="14" style="border:none; height:12px;"></td></tr>
      
      <!-- RINGKASAN MUSTAHIQ -->
      <tr>
        <td colspan="4" class="summary-card text-center">TOTAL MUSTAHIQ TERDATA:<br/><span style="font-size:14pt;">${mustahiqList.length} Orang</span></td>
        <td colspan="3" class="summary-card text-center">TOTAL JIWA TANGGUNGAN:<br/><span style="font-size:14pt;">${totalJiwa} Jiwa</span></td>
        <td colspan="4" class="summary-card text-center">TOTAL BERAS TERSALUR:<br/><span style="font-size:14pt;">${formatKg(totalBerasDiterima)}</span></td>
        <td colspan="3" class="summary-card text-center">TOTAL UANG TERSALUR:<br/><span style="font-size:14pt;">${formatRupiah(totalUangDiterima)}</span></td>
      </tr>
      <tr><td colspan="14" style="border:none; height:12px;"></td></tr>
    </table>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">No</th>
          <th>ID Mustahiq</th>
          <th>Nama Lengkap</th>
          <th>Golongan 8 Asnaf</th>
          <th>Tanggungan</th>
          <th>Alamat Domisili</th>
          <th>RT/RW</th>
          <th>No. WhatsApp/HP</th>
          <th>Prioritas</th>
          <th>Status Verifikasi</th>
          <th>Beras Diterima (Kg)</th>
          <th>Uang Diterima (Rp)</th>
          <th>Penyaluran Terakhir</th>
          <th>Catatan Kelayakan / Survey</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr class="footer-total">
          <td colspan="4" class="text-right bold">TOTAL AKUMULASI</td>
          <td class="text-center bold">${totalJiwa} Jiwa</td>
          <td colspan="5"></td>
          <td class="text-right bold">${totalBerasDiterima.toFixed(1)} Kg</td>
          <td class="text-right bold">${formatRupiah(totalUangDiterima)}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>

    <!-- TANDA TANGAN -->
    <table style="margin-top: 30px; border: none;">
      <tr style="border: none;">
        <td colspan="7" style="border: none; text-align: center; vertical-align: top;">
          Mengetahui,<br/>
          <strong>Ketua DKM / Ketua Panitia Amil</strong><br/><br/><br/><br/>
          ( ___________________________ )
        </td>
        <td colspan="7" style="border: none; text-align: center; vertical-align: top;">
          ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}<br/>
          <strong>Koordinator Tim Survey &amp; Distribusi</strong><br/><br/><br/><br/>
          ( ___________________________ )
        </td>
      </tr>
    </table>
  `;

  const fileName = `Data_Mustahiq_${config.organizationName.replace(/\s+/g, '_')}_${config.hijriYear.replace(/\s+/g, '_')}`;
  downloadStyledExcel(htmlContent, fileName);
}

// =============================================================================
// 3. EKSPOR LAPORAN PENYALURAN DISTRIBUSI (UNTUK PETUGAS / AMIL)
// =============================================================================
export function exportDistributionToExcel(distributions: DistributionRecord[], config: AppConfig) {
  const timestamp = getExportTimestamp();

  const totalBeras = distributions.reduce((acc, d) => acc + (d.riceKg || 0), 0);
  const totalUang = distributions.reduce((acc, d) => acc + (d.moneyRp || 0), 0);

  const rowsHtml = distributions.map((d, index) => {
    const asnafInfo = ASNAF_LABELS[d.asnaf];
    const zebra = index % 2 === 1 ? 'zebra-even' : '';

    return `
      <tr class="${zebra}">
        <td class="text-center">${index + 1}</td>
        <td class="text-center bold">${d.id}</td>
        <td class="text-center">${d.dateStr}</td>
        <td class="bold">${d.mustahiqName}</td>
        <td class="text-center bold">${asnafInfo?.label || d.asnaf.toUpperCase()}</td>
        <td class="text-center">${d.rtRw || '-'}</td>
        <td class="text-right bold">${d.riceKg > 0 ? d.riceKg.toFixed(1) + ' Kg' : '-'}</td>
        <td class="text-right bold">${d.moneyRp > 0 ? formatRupiah(d.moneyRp) : '-'}</td>
        <td>${d.packageDescription || '-'}</td>
        <td>${d.distributorAmil}</td>
        <td>${d.notes || '-'}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <table>
      <tr>
        <td colspan="11" class="header-title">LAPORAN BUKTI PENYALURAN &amp; DISTRIBUSI ZISWAF</td>
      </tr>
      <tr>
        <td colspan="11" class="header-subtitle">${config.organizationName.toUpperCase()}</td>
      </tr>
      <tr>
        <td colspan="11" class="header-meta">
          Tahun Zakat: ${config.hijriYear} / ${config.masehiYear} &bull; Waktu Ekspor: ${timestamp}
        </td>
      </tr>
      <tr>
        <td colspan="11" class="text-center">${config.address} &bull; Kontak: ${config.phone || '-'}</td>
      </tr>
      <tr><td colspan="11" style="border:none; height:12px;"></td></tr>
      
      <!-- KOTAK TOTAL DISTRIBUSI -->
      <tr>
        <td colspan="3" class="summary-card text-center">TOTAL PENYALURAN:<br/><span style="font-size:14pt;">${distributions.length} Penyerahan</span></td>
        <td colspan="4" class="summary-card text-center">TOTAL BERAS TERSALURKAN:<br/><span style="font-size:14pt;">${formatKg(totalBeras)}</span></td>
        <td colspan="4" class="summary-card text-center">TOTAL UANG KAS TERSALURKAN:<br/><span style="font-size:14pt;">${formatRupiah(totalUang)}</span></td>
      </tr>
      <tr><td colspan="11" style="border:none; height:12px;"></td></tr>
    </table>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">No</th>
          <th>ID Distribusi</th>
          <th>Tanggal</th>
          <th>Nama Penerima Mustahiq</th>
          <th>Golongan Asnaf</th>
          <th>RT/RW</th>
          <th>Beras (Kg)</th>
          <th>Uang (Rp)</th>
          <th>Paket Sembako / Bantuan</th>
          <th>Petugas Amil Penyalur</th>
          <th>Catatan / Keterangan</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr class="footer-total">
          <td colspan="6" class="text-right bold">TOTAL PENYALURAN TERCATAT</td>
          <td class="text-right bold">${totalBeras.toFixed(1)} Kg</td>
          <td class="text-right bold">${formatRupiah(totalUang)}</td>
          <td colspan="3"></td>
        </tr>
      </tfoot>
    </table>

    <!-- TANDA TANGAN -->
    <table style="margin-top: 30px; border: none;">
      <tr style="border: none;">
        <td colspan="6" style="border: none; text-align: center; vertical-align: top;">
          Mengetahui,<br/>
          <strong>Ketua DKM / Ketua Amil</strong><br/><br/><br/><br/>
          ( ${config.headAmil || '___________________________'} )
        </td>
        <td colspan="5" style="border: none; text-align: center; vertical-align: top;">
          ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}<br/>
          <strong>Petugas Amil Pelaksana Distribusi</strong><br/><br/><br/><br/>
          ( ___________________________ )
        </td>
      </tr>
    </table>
  `;

  const fileName = `Laporan_Distribusi_${config.organizationName.replace(/\s+/g, '_')}_${config.hijriYear.replace(/\s+/g, '_')}`;
  downloadStyledExcel(htmlContent, fileName);
}

// =============================================================================
// 4. EKSPOR REKAPITULASI NASIONAL LEMBAGA MASJID (UNTUK SUPER ADMIN / OWNER)
// =============================================================================
export function exportMasjidsToExcel(masjids: MasjidAccount[], currentUser: UserAccount) {
  const timestamp = getExportTimestamp();

  // Akumulasi statistik platform nasional
  const totalMasjids = masjids.length;
  const activeCount = masjids.filter((m) => m.status === 'active').length;
  const pendingCount = masjids.filter((m) => m.status === 'pending_verification').length;
  const suspendedCount = masjids.filter((m) => m.status === 'suspended').length;
  
  const totalMuzakkiSouls = masjids.reduce((acc, m) => acc + (m.totalMuzakkiSouls || 0), 0);
  const totalBerasKg = masjids.reduce((acc, m) => acc + (m.totalFitrahRiceKg || 0), 0);
  const totalFitrahCashRp = masjids.reduce((acc, m) => acc + (m.totalFitrahCashRp || 0), 0);
  const totalMaalRp = masjids.reduce((acc, m) => acc + (m.totalMaalRp || 0), 0);
  const totalKasZiswaf = totalFitrahCashRp + totalMaalRp;
  const totalMustahiq = masjids.reduce((acc, m) => acc + (m.totalMustahiqCount || 0), 0);
  const totalTransaksi = masjids.reduce((acc, m) => acc + (m.totalTransactions || 0), 0);

  const rowsHtml = masjids.map((m, index) => {
    const totalDana = (m.totalFitrahCashRp || 0) + (m.totalMaalRp || 0);
    const zebra = index % 2 === 1 ? 'zebra-even' : '';
    
    let statusClass = 'badge-active';
    let statusText = 'AKTIF (VERIFIED)';
    if (m.status === 'pending_verification') {
      statusClass = 'badge-pending';
      statusText = 'MENUNGGU VERIFIKASI';
    } else if (m.status === 'suspended') {
      statusClass = 'badge-suspended';
      statusText = 'DITANGGUHKAN';
    }

    return `
      <tr class="${zebra}">
        <td class="text-center">${index + 1}</td>
        <td class="bold">${m.name}</td>
        <td class="text-center ${statusClass}">${statusText}</td>
        <td>${m.city}</td>
        <td>${m.province || 'Indonesia'}</td>
        <td>${m.address}</td>
        <td class="bold">${m.leadName}</td>
        <td class="text-center">${m.contactPhone}</td>
        <td>${m.email}</td>
        <td class="text-center">${new Date(m.createdAt).toLocaleDateString('id-ID')}</td>
        <td class="text-center bold">${m.totalTransactions || 0}</td>
        <td class="text-center bold">${m.totalMuzakkiSouls || 0} Jiwa</td>
        <td class="text-right bold">${(m.totalFitrahRiceKg || 0).toFixed(1)} Kg</td>
        <td class="text-right">${formatRupiah(m.totalFitrahCashRp || 0)}</td>
        <td class="text-right">${formatRupiah(m.totalMaalRp || 0)}</td>
        <td class="text-right bold">${formatRupiah(totalDana)}</td>
        <td class="text-center bold">${m.totalMustahiqCount || 0} Orang</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <table>
      <tr>
        <td colspan="17" class="header-title" style="color: #4c1d95;">REKAPITULASI NASIONAL DATA LEMBAGA MASJID &amp; PENGHIMPUNAN ZISWAF</td>
      </tr>
      <tr>
        <td colspan="17" class="header-subtitle">SIMZAKAT PLATFORM &bull; SISTEM MANAJEMEN DIGITAL AMIL ZAKAT INDONESIA</td>
      </tr>
      <tr>
        <td colspan="17" class="header-meta">
          Waktu Laporan: ${timestamp} &bull; Operator: ${currentUser.name} (@${currentUser.username})
        </td>
      </tr>
      <tr><td colspan="17" style="border:none; height:12px;"></td></tr>
      
      <!-- STATISTIK NASIONAL DI EXCEL -->
      <tr>
        <td colspan="4" class="summary-card-owner text-center">TOTAL LEMBAGA:<br/><span style="font-size:14pt;">${totalMasjids} Masjid</span><br/><span style="font-size:9pt; color:#4c1d95;">(${activeCount} Aktif &bull; ${pendingCount} Pending &bull; ${suspendedCount} Suspended)</span></td>
        <td colspan="4" class="summary-card-owner text-center">TOTAL MUZAKKI NASIONAL:<br/><span style="font-size:14pt;">${totalMuzakkiSouls} Jiwa</span><br/><span style="font-size:9pt; color:#4c1d95;">(${totalTransaksi} Transaksi)</span></td>
        <td colspan="4" class="summary-card-owner text-center">TOTAL BERAS FITRAH:<br/><span style="font-size:14pt;">${formatKg(totalBerasKg)}</span><br/><span style="font-size:9pt; color:#4c1d95;">(Stok Nasional)</span></td>
        <td colspan="5" class="summary-card-owner text-center">TOTAL KAS DANA ZISWAF:<br/><span style="font-size:14pt;">${formatRupiah(totalKasZiswaf)}</span><br/><span style="font-size:9pt; color:#4c1d95;">(${totalMustahiq} Mustahiq Terdata)</span></td>
      </tr>
      <tr><td colspan="17" style="border:none; height:12px;"></td></tr>
    </table>

    <table>
      <thead>
        <tr>
          <th class="owner-th" style="width: 40px;">No</th>
          <th class="owner-th">Nama Lembaga Masjid</th>
          <th class="owner-th">Status Akun</th>
          <th class="owner-th">Kota/Kabupaten</th>
          <th class="owner-th">Provinsi</th>
          <th class="owner-th">Alamat Lengkap</th>
          <th class="owner-th">Ketua DKM / Amil</th>
          <th class="owner-th">No. WhatsApp / HP</th>
          <th class="owner-th">Email Resmi</th>
          <th class="owner-th">Terdaftar</th>
          <th class="owner-th">Transaksi</th>
          <th class="owner-th">Jiwa Muzakki</th>
          <th class="owner-th">Beras Fitrah (Kg)</th>
          <th class="owner-th">Kas Fitrah (Rp)</th>
          <th class="owner-th">Kas Maal (Rp)</th>
          <th class="owner-th">Total Dana (Rp)</th>
          <th class="owner-th">Mustahiq</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr class="footer-total">
          <td colspan="10" class="text-right bold">TOTAL REKAPITULASI NASIONAL</td>
          <td class="text-center bold">${totalTransaksi}</td>
          <td class="text-center bold">${totalMuzakkiSouls} Jiwa</td>
          <td class="text-right bold">${totalBerasKg.toFixed(1)} Kg</td>
          <td class="text-right bold">${formatRupiah(totalFitrahCashRp)}</td>
          <td class="text-right bold">${formatRupiah(totalMaalRp)}</td>
          <td class="text-right bold">${formatRupiah(totalKasZiswaf)}</td>
          <td class="text-center bold">${totalMustahiq} Orang</td>
        </tr>
      </tfoot>
    </table>

    <!-- TANDA TANGAN OWNER -->
    <table style="margin-top: 30px; border: none;">
      <tr style="border: none;">
        <td colspan="17" style="border: none; text-align: right; vertical-align: top;">
          Jakarta, ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}<br/>
          <strong>Administrator Platform SimZakat Indonesia</strong><br/><br/><br/><br/>
          <strong>${currentUser.name}</strong><br/>
          <span style="font-size:9pt; color:#64748b;">Super Admin &bull; Sistem Zakat Nasional</span>
        </td>
      </tr>
    </table>
  `;

  const fileName = `Rekap_Nasional_Lembaga_SimZakat_${new Date().toISOString().split('T')[0]}`;
  downloadStyledExcel(htmlContent, fileName);
}

// =============================================================================
// 5. EKSPOR LAPORAN REKAPITULASI KAS & NERACA ZISWAF (UNTUK DKM & AMIL)
// =============================================================================
export function exportReportsSummaryToExcel(
  transactions: MuzakkiTransaction[],
  mustahiqList: Mustahiq[],
  distributions: DistributionRecord[],
  config: AppConfig
) {
  const timestamp = getExportTimestamp();

  // 1. Akumulasi Penerimaan
  const totalRiceInKg = transactions.reduce((acc, t) => acc + (t.totalRiceKg || 0), 0);
  const totalMoneyInRp = transactions.reduce((acc, t) => acc + (t.totalMoneyRp || 0), 0);
  const totalFitrahSouls = transactions
    .filter((t) => t.category === 'fitrah')
    .reduce((acc, t) => acc + (t.fitrahDetail?.payerCount || 1), 0);

  // Penerimaan per kategori
  const catMoney = {
    fitrah: transactions.filter((t) => t.category === 'fitrah').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    maal: transactions.filter((t) => t.category === 'maal').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    profesi: transactions.filter((t) => t.category === 'profesi').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    infaq: transactions.filter((t) => t.category === 'infaq').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    fidyah: transactions.filter((t) => t.category === 'fidyah').reduce((acc, t) => acc + t.totalMoneyRp, 0),
  };

  // 2. Akumulasi Penyaluran
  const totalRiceOutKg = distributions.reduce((acc, d) => acc + (d.riceKg || 0), 0);
  const totalMoneyOutRp = distributions.reduce((acc, d) => acc + (d.moneyRp || 0), 0);

  // 3. Saldo Sisa
  const remainingRiceKg = totalRiceInKg - totalRiceOutKg;
  const remainingMoneyRp = totalMoneyInRp - totalMoneyOutRp;

  // Breakdown Asnaf
  const asnafData: Record<string, { riceKg: number; moneyRp: number; count: number }> = {};
  distributions.forEach((d) => {
    if (!asnafData[d.asnaf]) {
      asnafData[d.asnaf] = { riceKg: 0, moneyRp: 0, count: 0 };
    }
    asnafData[d.asnaf].riceKg += d.riceKg || 0;
    asnafData[d.asnaf].moneyRp += d.moneyRp || 0;
    asnafData[d.asnaf].count += 1;
  });

  const htmlContent = `
    <table>
      <tr>
        <td colspan="6" class="header-title">LAPORAN REKAPITULASI KAS &amp; NERACA ZISWAF</td>
      </tr>
      <tr>
        <td colspan="6" class="header-subtitle">${config.organizationName.toUpperCase()}</td>
      </tr>
      <tr>
        <td colspan="6" class="header-meta">
          Tahun Operasional: ${config.hijriYear} / ${config.masehiYear} &bull; Dicetak: ${timestamp}
        </td>
      </tr>
      <tr>
        <td colspan="6" class="text-center">${config.address} &bull; Kontak: ${config.phone || '-'}</td>
      </tr>
      <tr><td colspan="6" style="border:none; height:12px;"></td></tr>
      
      <!-- KOTAK NERACA SALDO -->
      <tr>
        <td colspan="2" class="summary-card text-center">TOTAL PENERIMAAN BERAS:<br/><span style="font-size:14pt;">${formatKg(totalRiceInKg)}</span></td>
        <td colspan="2" class="summary-card text-center">TOTAL BERAS TERSALUR:<br/><span style="font-size:14pt;">${formatKg(totalRiceOutKg)}</span></td>
        <td colspan="2" class="summary-card text-center" style="background-color:#fef9c3;">SISA STOK BERAS:<br/><span style="font-size:14pt; color:#854d0e;">${formatKg(remainingRiceKg)}</span></td>
      </tr>
      <tr>
        <td colspan="2" class="summary-card text-center">TOTAL PENERIMAAN KAS:<br/><span style="font-size:14pt;">${formatRupiah(totalMoneyInRp)}</span></td>
        <td colspan="2" class="summary-card text-center">TOTAL KAS TERSALUR:<br/><span style="font-size:14pt;">${formatRupiah(totalMoneyOutRp)}</span></td>
        <td colspan="2" class="summary-card text-center" style="background-color:#fef9c3;">SISA SALDO KAS:<br/><span style="font-size:14pt; color:#854d0e;">${formatRupiah(remainingMoneyRp)}</span></td>
      </tr>
      <tr><td colspan="6" style="border:none; height:16px;"></td></tr>
    </table>

    <!-- TABEL 1: RINCIAN PENERIMAAN BERDASARKAN KATEGORI -->
    <table>
      <thead>
        <tr>
          <th colspan="4" style="background-color:#065f46; text-align:left; font-size:12pt;">
            A. RINCIAN PENERIMAAN ZISWAF DARI MUZAKKI (${transactions.length} Transaksi &bull; ${totalFitrahSouls} Jiwa)
          </th>
        </tr>
        <tr>
          <th style="width:40px;">No</th>
          <th>Kategori Penerimaan</th>
          <th>Rincian Logistik Beras</th>
          <th>Nominal Kas Tunai (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">1</td>
          <td class="bold">Zakat Fitrah</td>
          <td class="text-right bold">${totalRiceInKg.toFixed(1)} Kg (${totalFitrahSouls} Jiwa)</td>
          <td class="text-right bold">${formatRupiah(catMoney.fitrah)}</td>
        </tr>
        <tr class="zebra-even">
          <td class="text-center">2</td>
          <td class="bold">Zakat Maal (Harta/Simpanan)</td>
          <td class="text-right">-</td>
          <td class="text-right bold">${formatRupiah(catMoney.maal)}</td>
        </tr>
        <tr>
          <td class="text-center">3</td>
          <td class="bold">Zakat Penghasilan / Profesi</td>
          <td class="text-right">-</td>
          <td class="text-right bold">${formatRupiah(catMoney.profesi)}</td>
        </tr>
        <tr class="zebra-even">
          <td class="text-center">4</td>
          <td class="bold">Fidyah &amp; Kaffarah</td>
          <td class="text-right">-</td>
          <td class="text-right bold">${formatRupiah(catMoney.fidyah)}</td>
        </tr>
        <tr>
          <td class="text-center">5</td>
          <td class="bold">Infaq &amp; Sedekah Operasional</td>
          <td class="text-right">-</td>
          <td class="text-right bold">${formatRupiah(catMoney.infaq)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="footer-total">
          <td colspan="2" class="text-right bold">TOTAL PENERIMAAN ZISWAF MASUK</td>
          <td class="text-right bold">${totalRiceInKg.toFixed(1)} Kg</td>
          <td class="text-right bold">${formatRupiah(totalMoneyInRp)}</td>
        </tr>
      </tfoot>
    </table>

    <table style="border:none; height:16px;"><tr><td></td></tr></table>

    <!-- TABEL 2: RINCIAN PENYALURAN HAK 8 ASNAF -->
    <table>
      <thead>
        <tr>
          <th colspan="5" style="background-color:#0f766e; text-align:left; font-size:12pt;">
            B. RINCIAN PENYALURAN HAK 8 ASNAF (${distributions.length} Penyerahan Terdata)
          </th>
        </tr>
        <tr>
          <th style="width:40px;">No</th>
          <th>Golongan 8 Asnaf</th>
          <th>Frekuensi Penyerahan</th>
          <th>Beras Disalurkan (Kg)</th>
          <th>Dana Kas Disalurkan (Rp)</th>
        </tr>
      </thead>
      <tbody>
        ${(Object.keys(ASNAF_LABELS) as AsnafType[]).map((asnafKey, idx) => {
          const info = ASNAF_LABELS[asnafKey];
          const st = asnafData[asnafKey] || { riceKg: 0, moneyRp: 0, count: 0 };
          const zebra = idx % 2 === 1 ? 'zebra-even' : '';
          return `
            <tr class="${zebra}">
              <td class="text-center">${idx + 1}</td>
              <td class="bold">${info.label}</td>
              <td class="text-center">${st.count} Kali</td>
              <td class="text-right bold">${st.riceKg > 0 ? st.riceKg.toFixed(1) + ' Kg' : '-'}</td>
              <td class="text-right bold">${st.moneyRp > 0 ? formatRupiah(st.moneyRp) : '-'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
      <tfoot>
        <tr class="footer-total">
          <td colspan="2" class="text-right bold">TOTAL PENYALURAN TERCATAT</td>
          <td class="text-center bold">${distributions.length} Kali</td>
          <td class="text-right bold">${totalRiceOutKg.toFixed(1)} Kg</td>
          <td class="text-right bold">${formatRupiah(totalMoneyOutRp)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- TANDA TANGAN REKAPITULASI RESMI -->
    <table style="margin-top: 35px; border: none;">
      <tr style="border: none;">
        <td colspan="3" style="border: none; text-align: center; vertical-align: top;">
          Mengetahui &amp; Menyetujui,<br/>
          <strong>Ketua DKM / Pengurus Posko</strong><br/><br/><br/><br/>
          ( ${config.headAmil || '___________________________'} )
        </td>
        <td colspan="3" style="border: none; text-align: center; vertical-align: top;">
          ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}<br/>
          <strong>Bendahara / Koordinator Amil Zakat</strong><br/><br/><br/><br/>
          ( ${config.treasurerName || '___________________________'} )
        </td>
      </tr>
    </table>
  `;

  const fileName = `Rekapitulasi_Kas_ZISWAF_${config.organizationName.replace(/\s+/g, '_')}_${config.hijriYear.replace(/\s+/g, '_')}`;
  downloadStyledExcel(htmlContent, fileName);
}
