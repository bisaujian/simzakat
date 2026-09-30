import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  FileText, 
  Download, 
  Wheat, 
  Coins, 
  Users, 
  HeartHandshake, 
  CheckCircle2, 
  Building,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  Archive
} from 'lucide-react';
import { AppConfig, DistributionRecord, Mustahiq, MuzakkiTransaction, ASNAF_LABELS, AsnafType, YearlyArchiveRecord } from '../types/zakat';
import { formatDateIndo, formatKg, formatRupiah } from '../utils/helpers';
import { printElementById, exportToPdf, openPrintTab, downloadHtmlFile } from '../utils/printService';
import { exportReportsSummaryToExcel } from '../utils/excelExport';
import { exportBastToWord, exportLpjToWord, getSekretariatText } from '../utils/wordReportGenerator';

interface ReportsViewProps {
  transactions: MuzakkiTransaction[];
  mustahiqList: Mustahiq[];
  distributions: DistributionRecord[];
  config: AppConfig;
  archives?: YearlyArchiveRecord[];
  onOpenArchives?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  mustahiqList,
  distributions,
  config,
  archives = [],
  onOpenArchives,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'ringkasan' | 'bast'>('ringkasan');
  const [downloaded, setDownloaded] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Aggregations
  // 1. Beras
  const totalRiceInKg = transactions.reduce((acc, t) => acc + (t.totalRiceKg || 0), 0);
  const totalRiceOutKg = distributions.reduce((acc, d) => acc + (d.riceKg || 0), 0);
  const remainingRiceKg = totalRiceInKg - totalRiceOutKg;

  // 2. Uang
  const totalMoneyInRp = transactions.reduce((acc, t) => acc + (t.totalMoneyRp || 0), 0);
  const totalMoneyOutRp = distributions.reduce((acc, d) => acc + (d.moneyRp || 0), 0);
  const remainingMoneyRp = totalMoneyInRp - totalMoneyOutRp;

  // By Category
  const moneyByCategory = {
    fitrah: transactions.filter((t) => t.category === 'fitrah').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    maal: transactions.filter((t) => t.category === 'maal').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    profesi: transactions.filter((t) => t.category === 'profesi').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    infaq: transactions.filter((t) => t.category === 'infaq').reduce((acc, t) => acc + t.totalMoneyRp, 0),
    fidyah: transactions.filter((t) => t.category === 'fidyah').reduce((acc, t) => acc + t.totalMoneyRp, 0),
  };

  // Total Souls in Fitrah
  const totalFitrahSouls = transactions
    .filter((t) => t.category === 'fitrah')
    .reduce((acc, t) => acc + (t.fitrahDetail?.payerCount || 1), 0);

  // Distribution by Asnaf
  const asnafStats: Record<string, { riceKg: number; moneyRp: number; count: number }> = {};
  distributions.forEach((d) => {
    if (!asnafStats[d.asnaf]) {
      asnafStats[d.asnaf] = { riceKg: 0, moneyRp: 0, count: 0 };
    }
    asnafStats[d.asnaf].riceKg += d.riceKg || 0;
    asnafStats[d.asnaf].moneyRp += d.moneyRp || 0;
    asnafStats[d.asnaf].count += 1;
  });

  const getTargetId = () => (activeReportTab === 'bast' ? 'bast-document' : 'printable-report-summary');
  const getDocTitle = () => (activeReportTab === 'bast' ? `BAST-Zakat-${config.organizationName.replace(/\s+/g, '_')}-${config.hijriYear.replace(/\s+/g, '_')}` : `Laporan-Rekap-Zakat-${config.organizationName.replace(/\s+/g, '_')}-${config.hijriYear.replace(/\s+/g, '_')}`);

  const handlePrint = () => {
    setStatusNotice('Membuka dialog cetak dokumen resmi...');
    printElementById(getTargetId(), getDocTitle());
  };

  const handleOpenTab = () => {
    setStatusNotice('Membuka dokumen siap cetak di tab baru...');
    openPrintTab(getTargetId(), getDocTitle());
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setStatusNotice('Sedang mengonversi laporan ke format PDF...');
    try {
      const success = await exportToPdf(getTargetId(), `${getDocTitle()}.pdf`);
      if (success) {
        setStatusNotice('PDF Laporan berhasil diunduh ke perangkat Anda!');
      } else {
        setStatusNotice('Gagal membuat PDF otomatis, silakan gunakan tombol Unduh File Cetak.');
      }
    } catch (e) {
      console.error('PDF error', e);
      setStatusNotice('Terjadi kendala saat export PDF, silakan gunakan Buka Tab Cetak.');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  const handleDownload = () => {
    downloadHtmlFile(getTargetId(), getDocTitle(), getDocTitle());
    setDownloaded(true);
    setStatusNotice('Berkas HTML laporan berhasil diunduh!');
    setTimeout(() => {
      setDownloaded(false);
      setStatusNotice(null);
    }, 4000);
  };

  const handleExportExcel = () => {
    exportReportsSummaryToExcel(transactions, mustahiqList, distributions, config);
    setStatusNotice('Alhamdulillah! Laporan rekapitulasi kas dan neraca ZISWAF berhasil diunduh dalam format Excel (.xls)!');
    setTimeout(() => setStatusNotice(null), 5000);
  };

  const handleExportWord = (forcedType?: 'bast' | 'lpj') => {
    const summaryData = {
      config,
      transactions,
      mustahiqList,
      distributions,
      totalRiceInKg,
      totalRiceOutKg,
      remainingRiceKg,
      totalMoneyInRp,
      totalMoneyOutRp,
      remainingMoneyRp,
      moneyByCategory,
      totalFitrahSouls,
      asnafStats,
    };

    const targetType = forcedType || activeReportTab;
    if (targetType === 'bast') {
      exportBastToWord(summaryData);
      setStatusNotice('Alhamdulillah! Berita Acara (BAST) berhasil diekspor ke Microsoft Word (.doc). Berkas siap dibuka & diedit bebas di Word/WPS/Google Docs!');
    } else {
      exportLpjToWord(summaryData);
      setStatusNotice('Alhamdulillah! Laporan Pertanggungjawaban (LPJ) berhasil diekspor ke Microsoft Word (.doc). Berkas siap dibuka & diedit bebas di Word/WPS/Google Docs!');
    }
    setTimeout(() => setStatusNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan &amp; Berita Acara (BAST) Zakat
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Pertanggungjawaban keuangan, logistik komoditas beras, dan serah terima resmi panitia amil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Control */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-0.5 flex">
            <button
              onClick={() => setActiveReportTab('ringkasan')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeReportTab === 'ringkasan'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekapitulasi Lengkap
            </button>
            <button
              onClick={() => setActiveReportTab('bast')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeReportTab === 'bast'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Berita Acara (BAST)
            </button>
            {archives.length > 0 && onOpenArchives && (
              <button
                type="button"
                onClick={onOpenArchives}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-emerald-800 hover:bg-slate-200/60 flex items-center gap-1 transition cursor-pointer"
                title="Buka daftar riwayat arsip LPJ & BAST tahun-tahun sebelumnya"
              >
                <Archive className="w-3.5 h-3.5 text-emerald-700" />
                <span>Arsip ({archives.length})</span>
              </button>
            )}
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Unduh seluruh rekapitulasi kas dan neraca ZISWAF ke format Excel (.xls)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel (.xls)</span>
          </button>

          <button
            onClick={() => handleExportWord()}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title={`Unduh ${activeReportTab === 'bast' ? 'Berita Acara (BAST)' : 'Laporan LPJ Rekapitulasi'} ke Microsoft Word (.doc)`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Word (.doc)</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Unduh laporan dalam format PDF resmi"
          >
            <FileText className="w-3.5 h-3.5 text-rose-700" />
            <span>{isExportingPdf ? 'Membuat...' : 'PDF'}</span>
          </button>

          <button
            onClick={handleOpenTab}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Buka dokumen di tab baru (bebas batas iframe)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Tab Cetak</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="Buka dialog cetak printer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-100" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Live Status Notice */}
      {statusNotice && (
        <div className="no-print bg-emerald-900 text-emerald-100 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenTab}
              className="underline hover:text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Buka di Tab Baru</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setStatusNotice(null)}
              className="text-emerald-300 hover:text-white ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: REKAPITULASI RINGKASAN */}
      {activeReportTab === 'ringkasan' && (
        <div id="printable-report-summary" className="space-y-6 max-w-4xl mx-auto">
          {/* Header Kop Surat Resmi Rekapitulasi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs">
            <div className="font-arabic text-2xl text-emerald-800 font-bold mb-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
              {config.organizationName}
            </h1>
            <p className="text-sm font-semibold text-slate-700">{config.subTitle}</p>
            <p className="text-xs text-slate-500 mt-1">{config.address} • Kontak: {config.phone}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
                LAPORAN PERTANGGUNGJAWABAN (LPJ) &amp; REKAPITULASI ZISWAF
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                Tahun Operasional: {config.hijriYear} / {config.masehiYear} • Periode Penutupan Posko Zakat
              </p>
            </div>
          </div>

          {/* Main 2-Pillar Balance Sheet: Beras & Uang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commodity Rice Pillar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Wheat className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Rekapitulasi Beras (Zakat Fitrah)
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Beras Masuk (Penerimaan):</span>
                  <span className="font-bold text-amber-800 text-base">{formatKg(totalRiceInKg)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Beras Tersalurkan:</span>
                  <span className="font-bold text-slate-700 text-base">{formatKg(totalRiceOutKg)}</span>
                </div>
                <div className="flex justify-between py-3 px-3 bg-amber-50 rounded-xl border border-amber-200 text-base">
                  <span className="font-bold text-amber-950">Sisa Stok Beras di Gudang:</span>
                  <span className="font-black text-amber-900">{formatKg(remainingRiceKg)}</span>
                </div>
              </div>
            </div>

            {/* Financial Money Pillar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Rekapitulasi Dana Kas (Semua Zakat)
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Kas Masuk (Penerimaan):</span>
                  <span className="font-bold text-emerald-800 text-base">{formatRupiah(totalMoneyInRp)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Kas Tersalurkan:</span>
                  <span className="font-bold text-slate-700 text-base">{formatRupiah(totalMoneyOutRp)}</span>
                </div>
                <div className="flex justify-between py-3 px-3 bg-emerald-50 rounded-xl border border-emerald-200 text-base">
                  <span className="font-bold text-emerald-950">Sisa Saldo Kas Zakat:</span>
                  <span className="font-black text-emerald-900">{formatRupiah(remainingMoneyRp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown by Category */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Rincian Kas Masuk Berdasarkan Jenis Zakat & Infaq
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Fitrah (Uang)</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {formatRupiah(moneyByCategory.fitrah)}
                </span>
                <span className="text-[10px] text-slate-500">{totalFitrahSouls} total jiwa</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Zakat Maal</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {formatRupiah(moneyByCategory.maal)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Zakat Profesi</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {formatRupiah(moneyByCategory.profesi)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Infaq / Sedekah</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {formatRupiah(moneyByCategory.infaq)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Fidyah</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {formatRupiah(moneyByCategory.fidyah)}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown by 8 Asnaf */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Distribusi Penyaluran Hak 8 Asnaf
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Golongan Asnaf</th>
                    <th className="py-3 px-4">Penerima Terdaftar</th>
                    <th className="py-3 px-4">Frekuensi Penyaluran</th>
                    <th className="py-3 px-4 text-right">Beras Tersalurkan</th>
                    <th className="py-3 px-4 text-right">Uang Tersalurkan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(Object.keys(ASNAF_LABELS) as AsnafType[]).map((key) => {
                    const meta = ASNAF_LABELS[key];
                    const registeredCount = mustahiqList.filter((m) => m.asnaf === key).length;
                    const stat = asnafStats[key] || { riceKg: 0, moneyRp: 0, count: 0 };

                    return (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{registeredCount} Orang</td>
                        <td className="py-3 px-4 text-slate-600">{stat.count} Kali Serah</td>
                        <td className="py-3 px-4 text-right font-bold text-amber-800">
                          {stat.riceKg > 0 ? formatKg(stat.riceKg) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-800">
                          {stat.moneyRp > 0 ? formatRupiah(stat.moneyRp) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formal Signatures Grid for Rekapitulasi LPJ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
              <div className="text-center">
                <p className="text-slate-500 mb-16">Sekretaris / Bendahara Panitia Zakat,</p>
                <p className="font-bold text-slate-900 underline uppercase">{config.treasurerName || 'Ust. Muhammad Ridwan'}</p>
                <p className="text-[11px] text-slate-500">Bendahara / Panitia Zakat</p>
              </div>

              <div className="text-center">
                <p className="text-slate-500 mb-16">Ketua Panitia Amil Zakat,</p>
                <p className="font-bold text-slate-900 underline uppercase">{config.headAmil || 'H. Ahmad Syarifuddin'}</p>
                <p className="text-[11px] text-slate-500">Ketua Panitia Zakat / DKM</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BERITA ACARA SERAH TERIMA (BAST RESMI SIAP CETAK) */}
      {activeReportTab === 'bast' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto text-slate-800" id="bast-document">
          {/* Header Kop Surat */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="font-arabic text-2xl text-emerald-800 font-bold mb-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
              {config.organizationName}
            </h1>
            <p className="text-sm font-semibold text-slate-700">{config.subTitle}</p>
            <p className="text-xs text-slate-500 mt-1">{config.address} • Kontak: {config.phone}</p>
          </div>

          {/* Title BAST */}
          <div className="text-center py-6">
            <h2 className="text-base sm:text-lg font-bold uppercase underline tracking-wider text-slate-900">
              BERITA ACARA PENERIMAAN DAN PENYALURAN ZAKAT
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-mono">
              Nomor: BAST/UPZ-{config.hijriYear.replace(/\s+/g, '')}/{new Date().getFullYear()}/001
            </p>
          </div>

          {/* Narrative Body */}
          <div className="text-xs sm:text-sm space-y-4 leading-relaxed text-slate-800">
            <p>
              Pada hari ini, <strong>{formatDateIndo(new Date().toISOString())}</strong>, bertempat di Sekretariat <strong>{getSekretariatText(config.organizationName)}</strong>, telah dilaksanakan rekapitulasi penutupan penerimaan dan penyaluran Zakat Fitrah, Zakat Maal, Infaq, Sedekah, dan Fidyah tahun <strong>{config.hijriYear} / {config.masehiYear}</strong> dengan rincian sebagai berikut:
            </p>

            {/* Table Summary in BAST */}
            <div className="border border-slate-300 rounded-lg overflow-hidden my-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Uraian Komoditas & Dana</th>
                    <th className="p-2.5 text-right">Penerimaan</th>
                    <th className="p-2.5 text-right">Penyaluran</th>
                    <th className="p-2.5 text-right">Sisa Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-medium">Beras Zakat Fitrah</td>
                    <td className="p-2.5 text-right font-bold text-amber-800">{formatKg(totalRiceInKg)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-700">{formatKg(totalRiceOutKg)}</td>
                    <td className="p-2.5 text-right font-black text-amber-900">{formatKg(remainingRiceKg)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Dana Kas Uang Zakat (Semua Kategori)</td>
                    <td className="p-2.5 text-right font-bold text-emerald-800">{formatRupiah(totalMoneyInRp)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-700">{formatRupiah(totalMoneyOutRp)}</td>
                    <td className="p-2.5 text-right font-black text-emerald-900">{formatRupiah(remainingMoneyRp)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Adapun jumlah Muzakki terdata sebanyak <strong>{transactions.length} muzakki/transaksi</strong> (dengan rincian zakat fitrah sebanyak <strong>{totalFitrahSouls} jiwa</strong>), dan telah didistribusikan kepada <strong>{mustahiqList.length} orang Mustahiq</strong> yang berhak sesuai dengan 8 Golongan Asnaf di wilayah binaan.
            </p>

            <p>
              Demikian Berita Acara ini dibuat dengan sebenar-benarnya dalam keadaan sadar dan penuh rasa tanggung jawab serta amanah di hadapan Allah Subhanahu wa Ta'ala.
            </p>
          </div>

          {/* Formal Signatures Grid */}
          <div className="grid grid-cols-2 gap-8 pt-12 text-xs">
            <div className="text-center">
              <p className="text-slate-500 mb-16">Sekretaris / Bendahara Panitia Zakat,</p>
              <p className="font-bold text-slate-900 underline uppercase">{config.treasurerName || 'Ust. Muhammad Ridwan'}</p>
              <p className="text-[11px] text-slate-500">Bendahara / Panitia Zakat</p>
            </div>

            <div className="text-center">
              <p className="text-slate-500 mb-16">Ketua Panitia Amil Zakat,</p>
              <p className="font-bold text-slate-900 underline uppercase">{config.headAmil || 'H. Ahmad Syarifuddin'}</p>
              <p className="text-[11px] text-slate-500">Ketua Panitia Zakat / DKM</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
