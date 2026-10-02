import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Trash2, 
  Wheat, 
  Coins, 
  Users, 
  Calendar,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { AppConfig, MuzakkiTransaction, ZakatCategory } from '../types/zakat';
import { formatDateIndo, formatKg, formatRupiah, exportMuzakkiToCSV } from '../utils/helpers';

interface MuzakkiListProps {
  transactions: MuzakkiTransaction[];
  config: AppConfig;
  onViewReceipt: (tx: MuzakkiTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNavigateToKasir: () => void;
}

export const MuzakkiList: React.FC<MuzakkiListProps> = ({
  transactions,
  config,
  onViewReceipt,
  onDeleteTransaction,
  onNavigateToKasir,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rtFilter, setRtFilter] = useState<string>('all');

  // Unique RTs
  const availableRts = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.rtRw) set.add(t.rtRw);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    const s = (searchQuery || '').trim().toLowerCase();
    return transactions.filter((tx) => {
      if (!tx) return false;
      const matchSearch =
        !s ||
        (tx.name || '').toLowerCase().includes(s) ||
        (tx.receiptNumber || '').toLowerCase().includes(s) ||
        (tx.address || '').toLowerCase().includes(s) ||
        (tx.phone || '').toLowerCase().includes(s) ||
        (tx.notes ? tx.notes.toLowerCase().includes(s) : false);

      const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchRt = rtFilter === 'all' || tx.rtRw === rtFilter;

      return matchSearch && matchCategory && matchRt;
    });
  }, [transactions, searchQuery, categoryFilter, rtFilter]);

  // Aggregate stats of filtered transactions
  const totalFilteredMoney = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + (curr.totalMoneyRp || 0), 0);
  }, [filtered]);

  const totalFilteredRice = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + (curr.totalRiceKg || 0), 0);
  }, [filtered]);

  const totalFilteredSouls = useMemo(() => {
    return filtered.reduce((acc, curr) => {
      if (curr.category === 'fitrah' && curr.fitrahDetail) {
        return acc + (curr.fitrahDetail.payerCount || 1);
      }
      return acc;
    }, 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary Cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Buku Catatan Penerimaan Muzakki
          </h2>
          <p className="text-slate-600 text-sm mt-0.5">
            Daftar lengkap seluruh muzakki yang telah menyalurkan zakat, infaq, dan fidyah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMuzakkiToCSV(filtered, config)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
            title="Unduh seluruh catatan penerimaan muzakki ke berkas Excel (.xls) ber-kop resmi"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xls)</span>
          </button>

          <button
            onClick={onNavigateToKasir}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Muzakki</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">
              Total Muzakki Terdata
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {filtered.length} Transaksi
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              {totalFilteredSouls > 0 ? `(${totalFilteredSouls} jiwa zakat fitrah)` : ''}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">
              Total Penerimaan Uang
            </span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">
              {formatRupiah(totalFilteredMoney)}
            </span>
            <span className="text-[11px] text-slate-500">Tunai & Transfer</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">
              Total Penerimaan Beras
            </span>
            <span className="text-xl font-bold text-amber-700 mt-1 block">
              {formatKg(totalFilteredRice)}
            </span>
            <span className="text-[11px] text-slate-500">Zakat Fitrah Beras</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Wheat className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama muzakki, no kuitansi, alamat, atau no WA..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium outline-hidden"
          >
            <option value="all">Semua Jenis Zakat</option>
            <option value="fitrah">Zakat Fitrah</option>
            <option value="maal">Zakat Maal</option>
            <option value="profesi">Zakat Profesi</option>
            <option value="infaq">Infaq / Sedekah</option>
            <option value="fidyah">Fidyah</option>
          </select>

          <select
            value={rtFilter}
            onChange={(e) => setRtFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium outline-hidden"
          >
            <option value="all">Semua Wilayah / Asal Jamaah</option>
            {availableRts.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table & Cards of Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold">Tidak ada data transaksi yang sesuai filter.</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No. Kuitansi</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Nama Muzakki</th>
                    <th className="py-3 px-4">Alamat / RT</th>
                    <th className="py-3 px-4">Jenis Zakat</th>
                    <th className="py-3 px-4 text-right">Beras (Kg)</th>
                    <th className="py-3 px-4 text-right">Uang (Rp)</th>
                    <th className="py-3 px-4">Amil</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {tx.receiptNumber}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {tx.dateStr}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tx.name}</div>
                        {tx.phone && tx.phone !== '-' && (
                          <div className="text-[11px] text-slate-500">{tx.phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[140px]">
                          {tx.address}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {tx.rtRw}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.category === 'fitrah'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.category === 'maal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.category === 'profesi'
                              ? 'bg-sky-100 text-sky-800'
                              : tx.category === 'fidyah'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {tx.category}
                        </span>
                        {tx.category === 'fitrah' && tx.fitrahDetail && (
                          <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                            <div>
                              <strong>{tx.fitrahDetail.payerCount} Jiwa</strong> ({tx.fitrahDetail.unit === 'kombinasi' ? 'Beras & Uang' : (tx.fitrahDetail.unit === 'beras' ? 'Beras' : 'Uang')})
                            </div>
                            <div className="text-slate-400 font-medium">
                              {tx.fitrahDetail.unit === 'kombinasi' ? (
                                <span>{tx.fitrahDetail.ricePayerCount || 0} Jiwa Beras + {tx.fitrahDetail.moneyPayerCount || 0} Jiwa Uang</span>
                              ) : tx.fitrahDetail.unit === 'beras' ? (
                                `@ ${tx.fitrahDetail.riceWeightPerSoulKg || tx.fitrahDetail.ratePerPerson || 2.8} Kg`
                              ) : (
                                `${tx.fitrahDetail.skKemenagTierName ? tx.fitrahDetail.skKemenagTierName.split('(')[0].trim() : 'SK Kemenag'}`
                              )}
                            </div>
                          </div>
                        )}
                        {tx.category === 'maal' && tx.maalDetail && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-emerald-800 capitalize">
                              {(tx.maalDetail.assetType || 'maal').replace('_', ' ')}
                            </span>
                            {tx.maalDetail.ratePercent && (
                              <span className="text-slate-400 ml-1">({tx.maalDetail.ratePercent}%)</span>
                            )}
                            {tx.maalDetail.harvestWeightKg && (
                              <div className="text-amber-700 font-medium">Panen: {formatKg(tx.maalDetail.harvestWeightKg)}</div>
                            )}
                            {tx.maalDetail.livestockHeadCount && (
                              <div className="text-emerald-700 font-medium">{tx.maalDetail.livestockHeadCount} ekor</div>
                            )}
                          </div>
                        )}
                        {Boolean(tx.voluntaryInfaqRp && tx.voluntaryInfaqRp > 0) && (
                          <div className="mt-1">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-semibold">
                              + Infaq: {formatRupiah(tx.voluntaryInfaqRp!)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-800">
                        {tx.totalRiceKg > 0 ? formatKg(tx.totalRiceKg) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800 whitespace-nowrap">
                        {tx.totalMoneyRp > 0 ? (
                          <div>
                            <div>{formatRupiah(tx.totalMoneyRp)}</div>
                            {Boolean(tx.voluntaryInfaqRp && tx.voluntaryInfaqRp > 0) && (
                              <div className="text-[10px] text-rose-600 font-medium">
                                (Inc. Infaq {formatRupiah(tx.voluntaryInfaqRp!)})
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {tx.amilName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewReceipt(tx)}
                            title="Cetak Kuitansi"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus transaksi ${tx.receiptNumber} a.n ${tx.name}?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title="Hapus"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((tx) => (
                <div key={tx.id} className="p-3.5 sm:p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                          {tx.receiptNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.category === 'fitrah'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.category === 'maal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.category === 'profesi'
                              ? 'bg-sky-100 text-sky-800'
                              : tx.category === 'fidyah'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {tx.category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {tx.rtRw}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{tx.name}</h4>
                      {tx.phone && tx.phone !== '-' && (
                        <p className="text-[11px] text-slate-500">{tx.phone}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">{tx.dateStr}</span>
                      <span className="text-[10px] text-slate-500">Amil: {tx.amilName}</span>
                    </div>
                  </div>

                  {/* Address */}
                  {tx.address && (
                    <p className="text-xs text-slate-600 line-clamp-1">
                      <span className="text-slate-400">Alamat:</span> {tx.address}
                    </p>
                  )}

                  {/* Detail Zakat Specifics */}
                  {tx.category === 'fitrah' && tx.fitrahDetail && (
                    <div className="text-xs text-slate-600 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 flex items-center justify-between">
                      <span>
                        <strong>{tx.fitrahDetail.payerCount} Jiwa</strong> ({tx.fitrahDetail.unit === 'kombinasi' ? 'Beras & Uang' : (tx.fitrahDetail.unit === 'beras' ? 'Beras' : 'Uang')})
                      </span>
                      {tx.fitrahDetail.unit === 'kombinasi' && (
                        <span className="text-[10px] text-amber-900 font-semibold">
                          {tx.fitrahDetail.ricePayerCount}B / {tx.fitrahDetail.moneyPayerCount}U
                        </span>
                      )}
                    </div>
                  )}

                  {/* Voluntary infaq highlight if any */}
                  {Boolean(tx.voluntaryInfaqRp && tx.voluntaryInfaqRp > 0) && (
                    <div className="text-xs bg-rose-50 p-2 rounded-lg border border-rose-200 text-rose-800 flex items-center justify-between font-semibold">
                      <span>+ Infaq Suka Rela:</span>
                      <span className="font-bold">{formatRupiah(tx.voluntaryInfaqRp!)}</span>
                    </div>
                  )}

                  {/* Amount and Action buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="space-y-0.5">
                      {tx.totalRiceKg > 0 && (
                        <div className="text-sm font-bold text-amber-800">
                          {formatKg(tx.totalRiceKg)} <span className="text-[11px] font-normal text-slate-500">Beras</span>
                        </div>
                      )}
                      {tx.totalMoneyRp > 0 && (
                        <div className="text-sm font-black text-emerald-800">
                          {formatRupiah(tx.totalMoneyRp)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus transaksi ${tx.receiptNumber} a.n ${tx.name}?`)) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
  );
};
