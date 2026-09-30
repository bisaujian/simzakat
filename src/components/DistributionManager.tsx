import React, { useState } from 'react';
import { 
  PackageCheck, 
  Wheat, 
  Coins, 
  Plus, 
  Send, 
  UserCheck, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AppConfig, DistributionRecord, Mustahiq } from '../types/zakat';
import { formatDateTimeIndo, formatKg, formatRupiah, exportDistributionToExcel } from '../utils/helpers';

interface DistributionManagerProps {
  distributions: DistributionRecord[];
  mustahiqList: Mustahiq[];
  config: AppConfig;
  totalRiceStockKg: number;
  totalMoneyBalanceRp: number;
  onSaveDistribution: (record: DistributionRecord) => void;
  onDeleteDistribution: (id: string) => void;
  preselectedMustahiq?: Mustahiq | null;
  onClearPreselected?: () => void;
}

export const DistributionManager: React.FC<DistributionManagerProps> = ({
  distributions,
  mustahiqList,
  config,
  totalRiceStockKg,
  totalMoneyBalanceRp,
  onSaveDistribution,
  onDeleteDistribution,
  preselectedMustahiq,
  onClearPreselected,
}) => {
  const [selectedMustahiqId, setSelectedMustahiqId] = useState<string>(
    preselectedMustahiq?.id || (mustahiqList[0]?.id || '')
  );
  const [riceKg, setRiceKg] = useState<number>(5);
  const [moneyRp, setMoneyRp] = useState<number>(150000);
  const [packageDescription, setPackageDescription] = useState('Paket Beras 5 Kg + Santunan Sembako');
  const [distributorAmil, setDistributorAmil] = useState(config.headAmil || 'Petugas Amil');
  const [notes, setNotes] = useState('Diserahkan langsung dengan tanda terima.');

  // If preselectedMustahiq changes
  React.useEffect(() => {
    if (preselectedMustahiq) {
      setSelectedMustahiqId(preselectedMustahiq.id);
    }
  }, [preselectedMustahiq]);

  const selectedMustahiq = mustahiqList.find((m) => m.id === selectedMustahiqId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMustahiq) {
      alert('Pilih penerima mustahiq terlebih dahulu.');
      return;
    }

    if (riceKg <= 0 && moneyRp <= 0) {
      alert('Masukkan jumlah beras atau uang yang disalurkan.');
      return;
    }

    const newRecord: DistributionRecord = {
      id: `dist-${Date.now()}`,
      dateStr: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      mustahiqId: selectedMustahiq.id,
      mustahiqName: selectedMustahiq.name,
      asnaf: selectedMustahiq.asnaf,
      rtRw: selectedMustahiq.rtRw,
      riceKg: riceKg || 0,
      moneyRp: moneyRp || 0,
      packageDescription,
      distributorAmil,
      notes,
    };

    onSaveDistribution(newRecord);

    if (onClearPreselected) onClearPreselected();
    alert(`Alhamdulillah! Penyaluran zakat kepada ${selectedMustahiq.name} berhasil dicatat.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Warehouse Stock */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Penyaluran & Distribusi Zakat ke Mustahiq
          </h2>
          <p className="text-slate-600 text-sm mt-0.5">
            Kontrol stok logistik beras di posko dan penyaluran dana zakat kepada hak 8 asnaf.
          </p>
        </div>
      </div>

      {/* Stock Tickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-200 font-semibold block">
              Sisa Stok Beras di Posko / Gudang
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1">
              {formatKg(totalRiceStockKg)}
            </div>
            <span className="text-xs text-amber-100 mt-1 block">
              Siap dikemas dan disalurkan sebelum Shalat Idul Fitri
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Wheat className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold block">
              Sisa Saldo Kas Dana Zakat
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1">
              {formatRupiah(totalMoneyBalanceRp)}
            </div>
            <span className="text-xs text-emerald-100 mt-1 block">
              Tersedia untuk santunan uang tunai mustahiq
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Coins className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Distribution Form & Recent Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Catat Distribusi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Send className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Form Serah Terima Zakat
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Mustahiq Penerima <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedMustahiqId}
                onChange={(e) => setSelectedMustahiqId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white font-medium"
              >
                {mustahiqList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.asnaf.toUpperCase()} - {m.rtRw})
                  </option>
                ))}
              </select>
            </div>

            {selectedMustahiq && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Asnaf: {selectedMustahiq.asnaf.toUpperCase()}</span>
                  <span>{selectedMustahiq.familyMembersCount} Jiwa</span>
                </div>
                <p className="text-slate-600">{selectedMustahiq.address} ({selectedMustahiq.rtRw})</p>
                <div className="text-[11px] text-emerald-700 font-medium pt-1">
                  Sebelumnya telah menerima: {formatKg(selectedMustahiq.totalRiceReceivedKg)} & {formatRupiah(selectedMustahiq.totalMoneyReceivedRp)}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beras Diserahkan (Kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={riceKg}
                    onChange={(e) => setRiceKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-amber-800"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">Kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uang Santunan (Rp)
                </label>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  value={moneyRp}
                  onChange={(e) => setMoneyRp(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Paket
              </label>
              <input
                type="text"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="Misal: Paket Beras 5 Kg + Uang Tunai"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petugas Amil Penyalur
              </label>
              <input
                type="text"
                value={distributorAmil}
                onChange={(e) => setDistributorAmil(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Penyerahan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Penyaluran Zakat</span>
            </button>
          </form>
        </div>

        {/* Right 2 cols: Log History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Riwayat Distribusi Zakat ({distributions.length} Penyerahan)
              </h3>
            </div>
            {distributions.length > 0 && (
              <button
                type="button"
                onClick={() => exportDistributionToExcel(distributions, config)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Unduh rekapitulasi data penyaluran ke berkas Excel berformat rapi"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ekspor Excel (.xls)</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {distributions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Belum ada data riwayat penyaluran zakat.
              </div>
            ) : (
              <>
                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="py-3 px-3">Waktu</th>
                        <th className="py-3 px-3">Nama Mustahiq</th>
                        <th className="py-3 px-3">Asnaf / RT</th>
                        <th className="py-3 px-3 text-right">Beras</th>
                        <th className="py-3 px-3 text-right">Uang</th>
                        <th className="py-3 px-3">Amil Penyalur</th>
                        <th className="py-3 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {distributions.map((dist) => (
                        <tr key={dist.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                            {dist.dateStr}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {dist.mustahiqName}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold uppercase text-emerald-800 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
                              {dist.asnaf}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">{dist.rtRw}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-amber-800 whitespace-nowrap">
                            {dist.riceKg > 0 ? formatKg(dist.riceKg) : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">
                            {dist.moneyRp > 0 ? formatRupiah(dist.moneyRp) : '-'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-[11px]">
                            {dist.distributorAmil}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan distribusi untuk ${dist.mustahiqName}?`)) {
                                  onDeleteDistribution(dist.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Hapus Catatan Penyaluran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards List (< md) */}
                <div className="md:hidden divide-y divide-slate-100">
                  {distributions.map((dist) => (
                    <div key={dist.id} className="p-3.5 space-y-2 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold uppercase text-emerald-800 text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              {dist.asnaf}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">{dist.rtRw}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5">{dist.mustahiqName}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{dist.dateStr}</span>
                      </div>

                      {dist.packageDescription && (
                        <p className="text-xs text-slate-600 italic bg-slate-50 px-2 py-1 rounded">
                          {dist.packageDescription}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {dist.riceKg > 0 && (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {formatKg(dist.riceKg)}
                            </span>
                          )}
                          {dist.moneyRp > 0 && (
                            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {formatRupiah(dist.moneyRp)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Oleh: {dist.distributorAmil}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan distribusi untuk ${dist.mustahiqName}?`)) {
                                onDeleteDistribution(dist.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
