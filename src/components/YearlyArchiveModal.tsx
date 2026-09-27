import React, { useState } from 'react';
import { 
  Archive, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Eye, 
  RotateCcw, 
  Trash2, 
  FileText, 
  Users, 
  Wheat, 
  Coins, 
  X, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Search,
  Printer
} from 'lucide-react';
import { AppConfig, DistributionRecord, Mustahiq, MuzakkiTransaction, YearlyArchiveRecord } from '../types/zakat';
import { formatKg, formatRupiah } from '../utils/helpers';
import { printElementById } from '../utils/printService';

// =============================================================================
// 1. MODAL TUTUP BUKU TAHUNAN & BUKA PERIODE BARU (ANNUAL ROLLOVER MODAL)
// =============================================================================
interface RolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  transactions: MuzakkiTransaction[];
  distributions: DistributionRecord[];
  mustahiqList: Mustahiq[];
  onConfirmRollover: (params: {
    newHijriYear: string;
    newMasehiYear: string;
    closedBy: string;
    notes?: string;
    resetMustahiqQuotas: boolean;
    autoDownloadBackup: boolean;
  }) => void;
}

export const RolloverModal: React.FC<RolloverModalProps> = ({
  isOpen,
  onClose,
  config,
  transactions,
  distributions,
  mustahiqList,
  onConfirmRollover,
}) => {
  // Compute smart defaults for next year (e.g. 1447 H -> 1448 H, 2026 M -> 2027 M)
  const currentHijriNum = parseInt(config.hijriYear.replace(/\D/g, ''), 10) || 1447;
  const currentMasehiNum = parseInt(config.masehiYear.replace(/\D/g, ''), 10) || 2026;

  const [newHijriYear, setNewHijriYear] = useState<string>(`${currentHijriNum + 1} H`);
  const [newMasehiYear, setNewMasehiYear] = useState<string>(`${currentMasehiNum + 1} M`);
  const [closedBy, setClosedBy] = useState<string>(config.headAmil || 'Ketua Panitia Amil Zakat');
  const [notes, setNotes] = useState<string>(
    `Tutup buku resmi operasional zakat ${config.organizationName} periode ${config.hijriYear} / ${config.masehiYear}. Seluruh amanah muzakki telah disalurkan.`
  );
  const [resetMustahiqQuotas, setResetMustahiqQuotas] = useState<boolean>(true);
  const [autoDownloadBackup, setAutoDownloadBackup] = useState<boolean>(true);
  const [confirmStep, setConfirmStep] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalRiceInKg = transactions.reduce((acc, t) => acc + (t.totalRiceKg || 0), 0);
  const totalMoneyInRp = transactions.reduce((acc, t) => acc + (t.totalMoneyRp || 0), 0);
  const totalSouls = transactions.reduce((acc, t) => acc + (t.fitrahDetail?.payerCount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    onConfirmRollover({
      newHijriYear: newHijriYear.trim() || `${currentHijriNum + 1} H`,
      newMasehiYear: newMasehiYear.trim() || `${currentMasehiNum + 1} M`,
      closedBy: closedBy.trim() || config.headAmil,
      notes: notes.trim(),
      resetMustahiqQuotas,
      autoDownloadBackup,
    });
    setConfirmStep(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Tutup Buku &amp; Buka Tahun Baru</h3>
              <p className="text-xs text-emerald-300">
                Arsipkan Periode {config.hijriYear} / {config.masehiYear} &amp; Sambut Lembaran Baru
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              title="Pelajari panduan & tanya-jawab tutup buku"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Panduan Amil</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Friendly Info Banner for Beginners */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-[11px] font-medium">
                Masih awam dengan proses ini? Tenang, <strong>data tidak akan hilang</strong> dan akan diarsipkan aman.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="underline font-bold text-[11px] text-emerald-800 hover:text-emerald-950 shrink-0 cursor-pointer"
            >
              Baca Panduan →
            </button>
          </div>
          
          {/* Active Period Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Periode yang Akan Ditutup:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                {config.hijriYear} / {config.masehiYear}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500">Muzakki</div>
                <div className="font-black text-slate-900 mt-0.5">{transactions.length} Trx ({totalSouls} Jiwa)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500">Beras Masuk</div>
                <div className="font-black text-amber-700 mt-0.5">{formatKg(totalRiceInKg)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500">Kas Uang Masuk</div>
                <div className="font-black text-emerald-700 mt-0.5">{formatRupiah(totalMoneyInRp)}</div>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Data di atas akan dibukukan secara permanen ke <strong>Riwayat Arsip Lintas Tahun</strong>. Seluruh riwayat transaksi, kuitansi, dan Berita Acara (BAST) tetap dapat dibuka dan dicetak kapan saja.
            </p>
          </div>

          {!confirmStep ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tahun Hijriyah Baru *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHijriYear}
                    onChange={(e) => setNewHijriYear(e.target.value)}
                    placeholder="Contoh: 1448 H"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tahun Masehi Baru *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMasehiYear}
                    onChange={(e) => setNewMasehiYear(e.target.value)}
                    placeholder="Contoh: 2027 M"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Amil / Penanggung Jawab Penutup Buku *
                </label>
                <input
                  type="text"
                  required
                  value={closedBy}
                  onChange={(e) => setClosedBy(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan / Keterangan Penutupan Buku (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  placeholder="Keterangan penutupan buku posko zakat..."
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetMustahiqQuotas}
                    onChange={(e) => setResetMustahiqQuotas(e.target.checked)}
                    className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Pertahankan Master Data Mustahiq ({mustahiqList.length} warga)
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Nama warga, NIK, alamat, RT/RW, dan asnaf tetap aman di database. Kuota penerimaan beras &amp; uang mustahiq di-reset ke 0 untuk siap disalurkan kembali pada tahun baru.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDownloadBackup}
                    onChange={(e) => setAutoDownloadBackup(e.target.checked)}
                    className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Unduh Otomatis Salinan Arsip (JSON) ke Komputer
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Mengunduh berkas lengkap cadangan arsip tahun {config.hijriYear} untuk disimpan di flashdisk atau Google Drive DKM.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            /* Confirmation Step */
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Konfirmasi Akhir Penutupan Buku</span>
              </div>
              <p className="text-amber-900 leading-relaxed text-xs">
                Apakah Anda yakin ingin menyelesaikan tutup buku periode <strong>{config.hijriYear} / {config.masehiYear}</strong> dan membuka periode operasional baru <strong>{newHijriYear} / {newMasehiYear}</strong>?
              </p>
              <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-1">
                <li>Seluruh {transactions.length} transaksi kasir dan {distributions.length} log penyaluran akan dipindahkan ke Arsip Riwayat.</li>
                <li>Halaman kasir posko dan stok gudang akan dimulai bersih dari angka 0.</li>
                <li>Data mustahiq tetap tersimpan dengan kuota baru.</li>
              </ul>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            {confirmStep ? (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmStep(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Kembali Cek Data
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ya, Bismillah Tutup Buku Sekarang</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition cursor-pointer"
                >
                  <span>Lanjutkan Penutupan Buku</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <TutupBukuEduModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

// =============================================================================
// 2. MODAL INSPEKSI RINCIAN ARSIP (DETAIL MULTI-YEAR ARCHIVE MODAL)
// =============================================================================
interface ArchiveDetailModalProps {
  isOpen: boolean;
  archive: YearlyArchiveRecord | null;
  onClose: () => void;
  onDownloadJson: (archive: YearlyArchiveRecord) => void;
}

export const ArchiveDetailModal: React.FC<ArchiveDetailModalProps> = ({
  isOpen,
  archive,
  onClose,
  onDownloadJson,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'muzakki' | 'penyaluran'>('ringkasan');
  const [searchMuzakki, setSearchMuzakki] = useState<string>('');

  if (!isOpen || !archive) return null;

  const filteredMuzakki = archive.transactions.filter(
    (t) =>
      t.name.toLowerCase().includes(searchMuzakki.toLowerCase()) ||
      t.receiptNumber.toLowerCase().includes(searchMuzakki.toLowerCase()) ||
      (t.phone && t.phone.includes(searchMuzakki))
  );

  const handlePrintLPJ = () => {
    printElementById('archive-lpj-print-content', `LPJ-Arsip-Zakat-${archive.hijriYear.replace(/\s+/g, '_')}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-lg">
                  Arsip Resmi ZISWAF Periode {archive.hijriYear} / {archive.masehiYear}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  Status: Terbukukan
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ditutup pada {new Date(archive.closedAt).toLocaleDateString('id-ID', { dateStyle: 'full' })} oleh <strong>{archive.closedBy}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadJson(archive)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh berkas JSON arsip ini"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ringkasan'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Neraca &amp; LPJ Resmi</span>
          </button>

          <button
            onClick={() => setActiveTab('muzakki')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'muzakki'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Riwayat Muzakki ({archive.transactionsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('penyaluran')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'penyaluran'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wheat className="w-4 h-4" />
            <span>Riwayat Penyaluran ({archive.distributionsCount})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-900 text-xs space-y-6">
          
          {/* TAB 1: RINGKASAN & LPJ */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Laporan Pertanggungjawaban (LPJ) Zakat Fitrah &amp; Maal
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Rekapitulasi resmi yang telah disahkan saat penutupan buku tahunan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintLPJ}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak LPJ Arsip Ini</span>
                </button>
              </div>

              {/* Printable LPJ container */}
              <div id="archive-lpj-print-content" className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
                <div className="text-center pb-4 border-b border-slate-200">
                  <div className="font-bold text-lg uppercase text-slate-900">{archive.configSnapshot.organizationName}</div>
                  <div className="text-xs text-slate-600">{archive.configSnapshot.subTitle} • {archive.configSnapshot.address}</div>
                  <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                    LAPORAN RESMI ZISWAF PERIODE {archive.hijriYear} / {archive.masehiYear}
                  </div>
                </div>

                {/* 2-Pillar Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Beras */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-amber-800 text-xs flex items-center gap-1.5">
                      <Wheat className="w-4 h-4" />
                      <span>Pilar Komoditas Beras</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Penerimaan Beras Fitrah:</span>
                      <span className="font-black text-amber-700">{formatKg(archive.summary.totalFitrahRiceKg)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Penyaluran Beras ke Asnaf:</span>
                      <span className="font-black text-slate-800">{formatKg(archive.summary.totalDistributedRiceKg)}</span>
                    </div>
                    <div className="flex justify-between py-1 font-bold text-emerald-700">
                      <span>Status Salur Beras:</span>
                      <span>
                        {archive.summary.totalDistributedRiceKg >= archive.summary.totalFitrahRiceKg 
                          ? '✓ 100% Tuntas Tersalurkan' 
                          : `${formatKg(archive.summary.totalDistributedRiceKg)} tersalur`}
                      </span>
                    </div>
                  </div>

                  {/* Kas Uang */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                      <Coins className="w-4 h-4" />
                      <span>Pilar Kas Keuangan ZISWAF</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Zakat Fitrah Uang:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(archive.summary.totalFitrahCashRp)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Zakat Maal &amp; Profesi:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(archive.summary.totalMaalRp)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Infaq, Sedekah &amp; Fidyah:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(archive.summary.totalInfaqRp + archive.summary.totalFidyahRp)}</span>
                    </div>
                    <div className="flex justify-between py-1 font-black text-emerald-800 border-t border-slate-200 pt-1.5">
                      <span>Total Kas Masuk:</span>
                      <span>{formatRupiah(archive.summary.totalMoneyInRp)}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Summary Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">Total Transaksi</div>
                    <div className="font-black text-slate-900 mt-1">{archive.summary.totalTransactions} Trx</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">Jiwa Muzakki</div>
                    <div className="font-black text-emerald-700 mt-1">{archive.summary.totalSouls} Jiwa</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">Mustahiq Terlayani</div>
                    <div className="font-black text-purple-700 mt-1">{archive.summary.totalMustahiqServed} Asnaf</div>
                  </div>
                </div>

                {/* Signature box */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-[11px]">
                  <div>
                    <p className="text-slate-500 mb-12">Bendahara / Sekretaris Panitia,</p>
                    <p className="font-bold underline uppercase">{archive.configSnapshot.treasurerName || 'Ust. Muhammad Ridwan'}</p>
                    <p className="text-[10px] text-slate-400">Panitia Zakat {archive.hijriYear}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-12">Ketua Panitia Amil Zakat,</p>
                    <p className="font-bold underline uppercase">{archive.closedBy}</p>
                    <p className="text-[10px] text-slate-400">DKM / UPZ {archive.configSnapshot.organizationName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MUZAKKI RIWAYAT */}
          {activeTab === 'muzakki' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchMuzakki}
                    onChange={(e) => setSearchMuzakki(e.target.value)}
                    placeholder="Cari nama muzakki / no kuitansi..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div className="text-slate-500 text-[11px] font-semibold">
                  Menampilkan {filteredMuzakki.length} dari {archive.transactions.length} muzakki
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No. Resi &amp; Tanggal</th>
                      <th className="py-2.5 px-3">Nama Muzakki</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-right">Beras</th>
                      <th className="py-2.5 px-3 text-right">Nominal Uang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMuzakki.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Tidak ditemukan riwayat muzakki yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredMuzakki.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-slate-800">{m.receiptNumber}</span>
                            <div className="text-[10px] text-slate-400">{m.dateStr}</div>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {m.name}
                            {m.fitrahDetail && (
                              <span className="text-[10px] text-slate-500 ml-1">({m.fitrahDetail.payerCount} jiwa)</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {m.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-amber-700">
                            {m.totalRiceKg > 0 ? `${m.totalRiceKg} Kg` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">
                            {m.totalMoneyRp > 0 ? formatRupiah(m.totalMoneyRp) : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PENYALURAN ASNAF */}
          {activeTab === 'penyaluran' && (
            <div className="space-y-4">
              <div className="text-slate-600 font-semibold text-xs">
                Total {archive.distributions.length} transaksi penyaluran ke Asnaf tercatat pada periode ini.
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Nama Penerima &amp; Wilayah</th>
                      <th className="py-2.5 px-3">Asnaf</th>
                      <th className="py-2.5 px-3 text-right">Beras</th>
                      <th className="py-2.5 px-3 text-right">Uang</th>
                      <th className="py-2.5 px-3">Petugas Amil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {archive.distributions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Tidak ada log penyaluran di arsip ini.
                        </td>
                      </tr>
                    ) : (
                      archive.distributions.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{d.dateStr}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-slate-800">{d.mustahiqName}</span>
                            <div className="text-[10px] text-slate-400">RT/RW: {d.rtRw}</div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                              {d.asnaf}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-amber-700">
                            {d.riceKg > 0 ? `${d.riceKg} Kg` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">
                            {d.moneyRp > 0 ? formatRupiah(d.moneyRp) : '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{d.distributorAmil}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            ID Arsip: <span className="font-mono">{archive.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

// =============================================================================
// 3. MODAL KONFIRMASI HAPUS ARSIP (IN-APP DELETE CONFIRMATION MODAL)
// =============================================================================
export interface DeleteArchiveModalProps {
  isOpen: boolean;
  archive: YearlyArchiveRecord | null;
  onClose: () => void;
  onConfirmDelete: () => void;
  onDownloadBackup: (archive: YearlyArchiveRecord) => void;
}

export const DeleteArchiveModal: React.FC<DeleteArchiveModalProps> = ({
  isOpen,
  archive,
  onClose,
  onConfirmDelete,
  onDownloadBackup,
}) => {
  if (!isOpen || !archive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-rose-950">Hapus Arsip Tahunan?</h3>
            <p className="text-xs text-rose-700 font-semibold">
              Periode {archive.hijriYear} / {archive.masehiYear}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <p className="leading-relaxed">
            Anda akan menghapus berkas arsip resmi periode <strong className="text-slate-900 font-bold">{archive.hijriYear} / {archive.masehiYear}</strong> yang berisi:
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-medium text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Muzakki Tercatat:</span>
              <span className="font-bold text-slate-800">{archive.transactionsCount} transaksi ({archive.summary.totalSouls} jiwa)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Beras:</span>
              <span className="font-bold text-amber-700">{formatKg(archive.summary.totalFitrahRiceKg)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Kas Uang:</span>
              <span className="font-bold text-emerald-700">{formatRupiah(archive.summary.totalMoneyInRp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Log Penyaluran:</span>
              <span className="font-bold text-slate-800">{archive.distributionsCount} penerima</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Disarankan untuk mengunduh salinan berkas cadangan (JSON) terlebih dahulu sebelum menghapus arsip ini dari daftar riwayat.
            </span>
          </div>

          <button
            type="button"
            onClick={() => onDownloadBackup(archive)}
            className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer text-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Unduh Cadangan JSON Arsip Ini Dulu</span>
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus Arsip Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 4. MODAL EDUKASI & PANDUAN TUTUP BUKU BAGI AMIL PEMULA / AWAM
// =============================================================================
export interface TutupBukuEduModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutupBukuEduModal: React.FC<TutupBukuEduModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Apa itu fitur "Tutup Buku Tahunan"?',
      a: 'Tutup buku adalah proses pembukuan resmi di akhir masa operasional posko zakat (biasanya setelah salat Idul Fitri atau di akhir bulan Syawal). Fitur ini merangkum seluruh transaksi muzakki, kuitansi, neraca beras, kas uang, dan penyaluran asnaf tahun ini ke dalam "Buku Arsip", lalu mengosongkan kasir aktif agar siap menyambut Ramadan tahun berikutnya.',
      icon: Archive,
      badge: 'Definisi',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    },
    {
      q: 'Kapan waktu yang tepat menekan tombol Tutup Buku?',
      a: 'Tutup buku HANYA dilakukan satu kali dalam setahun. Lakukan setelah seluruh amanah zakat fitrah & zakat maal telah 100% tuntas disalurkan kepada 8 Asnaf mustahiq dan Berita Acara (BAST) telah ditandatangani oleh panitia.',
      icon: Clock,
      badge: 'Waktu Pelaksanaan',
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    },
    {
      q: 'Apakah data Muzakki, uang, dan kuitansi tahun ini akan hilang?',
      a: 'TIDAK SAMA SEKALI! Seluruh data muzakki, nama pembayar, nomor kuitansi, dan nominal tersimpan utuh di menu "Riwayat Arsip Lintas Tahun". Panitia DKM atau auditor dapat membuka, mencari nama warga, dan mencetak ulang LPJ atau BAST tahun lalu kapan saja.',
      icon: ShieldCheck,
      badge: 'Keamanan Data',
      color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    },
    {
      q: 'Bagaimana dengan Data Warga Mustahiq (Fakir, Miskin, dsb)?',
      a: 'Data Master Warga (Nama, NIK, No. KK, Alamat, RT/RW, dan Golongan Asnaf) TETAP TERSIMPAN UTUH. Sistem hanya me-reset angka penerimaan beras & uang mereka kembali ke 0 kg / Rp 0. Manfaatnya: panitia tidak perlu repot mendata ulang ratusan mustahiq dari awal di tahun depan!',
      icon: Users,
      badge: 'Data Mustahiq',
      color: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    },
    {
      q: 'Apa yang terjadi pada halaman Kasir dan Stok Gudang?',
      a: 'Halaman Kasir Penerimaan dan neraca stok gudang akan dimulai bersih dari angka 0 (nol). Ini memastikan pembukuan kasir tahun baru tidak tercampur dengan transaksi Ramadan tahun lalu.',
      icon: Wheat,
      badge: 'Kasir & Gudang',
      color: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
    },
    {
      q: 'Bagaimana jika tarif zakat atau harga beras tahun depan naik?',
      a: 'Sangat mudah! Setelah periode baru dibuka (misal: 1448 H / 2027 M), buka menu Pengaturan dan sesuaikan tarif SK Kemenag/BAZNAS terbaru serta harga patokan emas yang berlaku di tahun tersebut.',
      icon: Coins,
      badge: 'Penyesuaian Tarif',
      color: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Panduan &amp; Tanya-Jawab Tutup Buku</h3>
              <p className="text-xs text-emerald-300">
                Penjelasan ramah &amp; praktis untuk amil, panitia zakat, dan pengurus DKM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body FAQs */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="leading-relaxed">
              <strong>SimZakat dirancang untuk digunakan selamanya</strong> lintas periode kepengurusan. Anda tidak perlu takut kehilangan data karena sistem memiliki perlindungan arsip otomatis.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${f.color}`}>
                      {f.badge}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {f.q}
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {f.a}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Ada pertanyaan fiqih/teknis lainnya? Hubungi tim support DKM.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
          >
            Saya Paham, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};

