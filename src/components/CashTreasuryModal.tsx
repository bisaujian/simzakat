import React from 'react';
import { 
  X, 
  Coins, 
  Wheat, 
  ArrowDownLeft, 
  ArrowUpRight, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  Calculator,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { AppConfig, MuzakkiTransaction, DistributionRecord } from '../types/zakat';
import { formatKg, formatRupiah } from '../utils/helpers';

interface CashTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: MuzakkiTransaction[];
  distributions: DistributionRecord[];
  config: AppConfig;
  onNavigateTab: (tabId: string) => void;
}

export const CashTreasuryModal: React.FC<CashTreasuryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  distributions,
  config,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  // 1. Money Aggregations
  const totalMoneyInRp = transactions.reduce((acc, t) => acc + (t.totalMoneyRp || 0), 0);
  const totalMoneyOutRp = distributions.reduce((acc, d) => acc + (d.moneyRp || 0), 0);
  const remainingMoneyRp = Math.max(0, totalMoneyInRp - totalMoneyOutRp);

  // Categorized Money In
  const moneyByCategory: Record<string, { total: number; count: number }> = {
    fitrah: { total: 0, count: 0 },
    maal: { total: 0, count: 0 },
    profesi: { total: 0, count: 0 },
    fidyah: { total: 0, count: 0 },
    infaq: { total: 0, count: 0 },
  };

  transactions.forEach((t) => {
    if (moneyByCategory[t.category]) {
      moneyByCategory[t.category].total += t.totalMoneyRp || 0;
      if ((t.totalMoneyRp || 0) > 0) {
        moneyByCategory[t.category].count += 1;
      }
    }
  });

  const fitrahSoulsPaidInMoney = transactions
    .filter((t) => t.category === 'fitrah' && t.totalMoneyRp > 0)
    .reduce((acc, t) => acc + (t.fitrahDetail?.moneyPayerCount || t.fitrahDetail?.payerCount || 1), 0);

  // 2. Rice Aggregations
  const totalRiceInKg = transactions.reduce((acc, t) => acc + (t.totalRiceKg || 0), 0);
  const totalRiceOutKg = distributions.reduce((acc, d) => acc + (d.riceKg || 0), 0);
  const remainingRiceKg = Math.max(0, totalRiceInKg - totalRiceOutKg);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Asal-Usul & Rincian Saldo Kas Zakat
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-bold">
                  Transparan & Real-Time
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {config.organizationName} • Tahun {config.hijriYear} / {config.masehiYear}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Formula Explanation Banner */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Dari Mana Nilai Saldo Kas Diperoleh?</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              <strong>Saldo Kas Zakat</strong> dihitung secara otomatis dan akurat dengan rumus pembukuan:
            </p>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs sm:text-sm font-mono font-bold text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <span className="text-emerald-800">
                Saldo Kas = Total Penerimaan Uang (Muzakki) - Total Penyaluran Kas (Mustahiq)
              </span>
              <span className="text-amber-800 shrink-0 font-bold">
                {formatRupiah(remainingMoneyRp)}
              </span>
            </div>
          </div>

          {/* 2 Main Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kas Masuk (Inflow) */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  1. Total Kas Masuk (Penerimaan)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {transactions.length} Transaksi
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {formatRupiah(totalMoneyInRp)}
              </div>
              <p className="text-[11px] text-slate-500">
                Diperoleh dari pencatatan muzakki di menu <strong>Kasir Transaksi</strong>.
              </p>
            </div>

            {/* Kas Keluar (Outflow) */}
            <div className="bg-white rounded-2xl border-2 border-amber-500/30 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-amber-600" />
                  2. Total Kas Keluar (Penyaluran)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  {distributions.length} Penyaluran
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {formatRupiah(totalMoneyOutRp)}
              </div>
              <p className="text-[11px] text-slate-500">
                Dicatat saat amil mendistribusikan uang ke Mustahiq di menu <strong>Penyaluran</strong>.
              </p>
            </div>
          </div>

          {/* Breakdown Sumber Penerimaan Kas Masuk */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-700 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Rincian Sumber Dana Kas Masuk Berdasarkan Jenis Zakat</span>
            </h4>

            <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 text-xs">
              {/* Fitrah Uang */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Zakat Fitrah (Uang Tunai)</strong>
                  <span className="text-slate-500 text-[11px]">
                    Dari {fitrahSoulsPaidInMoney} jiwa muzakki yang membayar via uang/kombinasi ({moneyByCategory.fitrah.count} transaksi)
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatRupiah(moneyByCategory.fitrah.total)}
                </span>
              </div>

              {/* Maal */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Zakat Maal (Harta Kekayaan)</strong>
                  <span className="text-slate-500 text-[11px]">
                    Tabungan, emas, perniagaan, hasil panen & investasi ({moneyByCategory.maal.count} transaksi)
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatRupiah(moneyByCategory.maal.total)}
                </span>
              </div>

              {/* Profesi */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Zakat Profesi (Penghasilan)</strong>
                  <span className="text-slate-500 text-[11px]">
                    Gaji bulanan atau honor profesi ({moneyByCategory.profesi.count} transaksi)
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatRupiah(moneyByCategory.profesi.total)}
                </span>
              </div>

              {/* Fidyah */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Fidyah & Kaffarah Puasa</strong>
                  <span className="text-slate-500 text-[11px]">
                    Kompensasi puasa yang ditunaikan dalam uang ({moneyByCategory.fidyah.count} transaksi)
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatRupiah(moneyByCategory.fidyah.total)}
                </span>
              </div>

              {/* Infaq */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Infaq & Sedekah Terikat/Umum</strong>
                  <span className="text-slate-500 text-[11px]">
                    Sumbangan infaq sukarela muzakki ({moneyByCategory.infaq.count} transaksi)
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatRupiah(moneyByCategory.infaq.total)}
                </span>
              </div>

              {/* Total Kas Masuk */}
              <div className="p-3 bg-emerald-50 flex items-center justify-between font-bold">
                <span className="text-emerald-950">TOTAL KAS MASUK</span>
                <span className="text-emerald-800 text-base">{formatRupiah(totalMoneyInRp)}</span>
              </div>
            </div>
          </div>

          {/* Sisa Bersih dan Komoditas Beras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Saldo Kas Zakat Sisa */}
            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold block">
                Sisa Saldo Kas Dana Zakat
              </span>
              <div className="text-2xl font-black text-amber-300">
                {formatRupiah(remainingMoneyRp)}
              </div>
              <p className="text-[11px] text-emerald-200/80 pt-1">
                Tersedia di kas panitia untuk siap disalurkan ke mustahiq atau disimpan sebagai cadangan kas amanah.
              </p>
            </div>

            {/* Beras Komoditas Info */}
            <div className="p-4 bg-amber-950 text-white rounded-2xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5" />
                Sisa Stok Beras di Gudang
              </span>
              <div className="text-2xl font-black text-amber-300">
                {formatKg(remainingRiceKg)}
              </div>
              <p className="text-[11px] text-amber-200/80 pt-1">
                Dari penerimaan {formatKg(totalRiceInKg)} dikurangi {formatKg(totalRiceOutKg)} yang telah disalurkan.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Shortcuts */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateTab('kasir');
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Kasir Muzakki</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateTab('penyaluran');
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Penyaluran</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateTab('laporan');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Lihat Laporan Lengkap</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
