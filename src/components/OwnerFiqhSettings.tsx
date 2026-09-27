import React, { useState } from 'react';
import { 
  BookOpen, 
  Save, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Scale, 
  Check, 
  Users, 
  FileText, 
  Wheat, 
  HeartHandshake, 
  Info, 
  AlertCircle 
} from 'lucide-react';
import { UserAccount } from '../types/auth';
import { AsnafType } from '../types/zakat';
import { FiqhPlatformConfig, DoaItem, AsnafCustomGuideline } from '../types/fiqh';
import { fiqhConfigService } from '../services/fiqhConfigService';

interface OwnerFiqhSettingsProps {
  currentUser: UserAccount;
}

const ASNAF_ITEMS: { id: AsnafType; label: string; number: number; badgeColor: string }[] = [
  { id: 'fakir', label: "Fakir (Al-Fuqara')", number: 1, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { id: 'miskin', label: 'Miskin (Al-Masakin)', number: 2, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'amil', label: "Amil (Al-'Amilina)", number: 3, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'mualaf', label: 'Mualaf (Muallafah)', number: 4, badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  { id: 'riqab', label: 'Riqab (Hamba Sahaya)', number: 5, badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { id: 'gharimin', label: 'Gharimin (Berhutang)', number: 6, badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'fisabilillah', label: 'Fisabilillah (Dakwah)', number: 7, badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { id: 'ibnu_sabil', label: 'Ibnu Sabil (Musafir)', number: 8, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
];

export const OwnerFiqhSettings: React.FC<OwnerFiqhSettingsProps> = ({ currentUser }) => {
  const [form, setForm] = useState<FiqhPlatformConfig>(() => fiqhConfigService.getConfig());
  const [subTab, setSubTab] = useState<'doa' | 'asnaf' | 'sop'>('doa');
  const [selectedAsnafKey, setSelectedAsnafKey] = useState<AsnafType>('fakir');
  const [selectedDoaKey, setSelectedDoaKey] = useState<
    'doaAmil' | 'niatFitrahSendiri' | 'niatFitrahKeluarga' | 'niatZakatMaal' | 'doaAmilMendoakan' | 'doaSunnahNabi'
  >('doaAmil');
  const [saveNotice, setSaveNotice] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    fiqhConfigService.saveConfig(form, currentUser.name || 'Owner SimZakat');
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 4000);
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan seluruh teks panduan doa amil, niat zakat, dan kriteria 8 asnaf ke pengaturan bawaan (default syar\'i)?')) {
      const reset = fiqhConfigService.resetConfig();
      setForm(reset);
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 4000);
    }
  };

  // Helper updater for doa items
  const updateDoaItem = (key: typeof selectedDoaKey, field: keyof DoaItem, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Helper updater for asnaf item
  const updateAsnafItem = (asnafId: AsnafType, field: keyof AsnafCustomGuideline, value: string) => {
    setForm((prev) => ({
      ...prev,
      asnafGuidelines: {
        ...prev.asnafGuidelines,
        [asnafId]: {
          ...prev.asnafGuidelines[asnafId],
          [field]: value
        }
      }
    }));
  };

  const currentDoa = form[selectedDoaKey];
  const currentAsnaf = form.asnafGuidelines[selectedAsnafKey] || {
    id: selectedAsnafKey,
    title: '',
    arabicName: '',
    kriteriaUtama: '',
    indikatorKifayah: '',
    prioritasAlokasi: '',
    catatanFiqih: '',
    dokumenSyarat: ''
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Pedoman Fiqih, Doa Amil & Kriteria 8 Asnaf
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                Pusat CMS Syariah
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
              Konten yang Anda perbarui di sini akan <strong>otomatis disinkronkan</strong> ke seluruh dashboard Admin DKM, modal doa kasir posko zakat, kriteria verifikasi mustahiq di lapangan, dan kuitansi cetak / WA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Kembalikan ke standar Fiqih default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Fiqih</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 animate-in fade-in duration-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Berhasil Disimpan!</span> Seluruh pedoman doa amil, niat zakat, kriteria 8 asnaf, dan SOP telah diperbarui serta disinkronkan ke seluruh sistem dan kasir posko.
          </div>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'doa', label: '1. Doa Ijab Qabul & Niat Amil / Muzakki', icon: HeartHandshake },
          { id: 'asnaf', label: '2. Kriteria & Indikator 8 Asnaf (Verifikasi)', icon: Users },
          { id: 'sop', label: '3. SOP Fiqih, Takaran Beras & Kebijakan DKM', icon: Wheat },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: DOA & NIAT AMIL / MUZAKKI */}
      {subTab === 'doa' && (
        <div className="space-y-6">
          {/* Doa Selection Bar */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'doaAmil', label: 'Doa Amil Penerima Zakat', category: 'Amil Ijab Qabul' },
              { id: 'niatFitrahSendiri', label: 'Niat Fitrah Diri Sendiri', category: 'Muzakki Pribadi' },
              { id: 'niatFitrahKeluarga', label: 'Niat Fitrah Sekeluarga', category: 'Kepala Keluarga' },
              { id: 'niatZakatMaal', label: 'Niat Zakat Maal (Harta)', category: 'Zakat Maal' },
              { id: 'doaAmilMendoakan', label: 'Doa Keberkahan Amil Alternatif', category: 'HR. Bukhari' },
              { id: 'doaSunnahNabi', label: 'Doa Perlindungan Harta Bersih', category: 'Sunnah Nabi' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDoaKey(d.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border text-left cursor-pointer flex flex-col ${
                  selectedDoaKey === d.id
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-500 font-normal">{d.category}</span>
                <span className="font-bold">{d.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Form */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Form Pengeditan Doa</h3>
                  <p className="text-xs text-slate-400">Sesuaikan teks Arab, transliterasi Latin, dan terjemahan bahasa Indonesia.</p>
                </div>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  ID: {currentDoa.id}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Judul Doa / Niat
                </label>
                <input
                  type="text"
                  value={currentDoa.title}
                  onChange={(e) => updateDoaItem(selectedDoaKey, 'title', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-emerald-400">
                    Teks Lafadz Arab (dengan harakat lengkap)
                  </label>
                  <span className="text-[11px] text-slate-400">RTL Arabic Script</span>
                </div>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={currentDoa.arabic}
                  onChange={(e) => updateDoaItem(selectedDoaKey, 'arabic', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl font-arabic text-xl text-emerald-200 focus:outline-hidden focus:border-emerald-400 leading-relaxed text-right"
                  placeholder="أدخل النص العربي مع الحركات..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Transliterasi Latin / Cara Baca
                </label>
                <textarea
                  rows={2}
                  value={currentDoa.latin}
                  onChange={(e) => updateDoaItem(selectedDoaKey, 'latin', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 italic focus:outline-hidden focus:border-emerald-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Arti / Terjemahan Bahasa Indonesia
                </label>
                <textarea
                  rows={3}
                  value={currentDoa.arti}
                  onChange={(e) => updateDoaItem(selectedDoaKey, 'arti', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Keterangan & Rujukan Dalil / Hadits (Opsional)
                </label>
                <input
                  type="text"
                  value={currentDoa.keterangan || ''}
                  onChange={(e) => updateDoaItem(selectedDoaKey, 'keterangan', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-400 focus:outline-hidden focus:border-emerald-500"
                  placeholder="Contoh: Dasar kesunnahkan Ijab Qabul QS. At-Taubah: 103"
                />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Preview Tampilan di Dashboard Petugas Amil & Kuitansi</span>
                </div>

                {/* Simulated Doa Card */}
                <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-md space-y-3 text-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Ijab Qabul Petugas Posko
                    </span>
                    <span className="text-[11px] font-arabic text-emerald-900">مباشر</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs">
                    {currentDoa.title || 'Judul Doa'}
                  </h4>

                  <p className="font-arabic text-xl text-emerald-950 font-bold text-right leading-loose py-1 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/80">
                    {currentDoa.arabic || 'Teks Arab belum diisi...'}
                  </p>

                  <p className="text-xs font-semibold text-slate-700 italic">
                    Latin: {currentDoa.latin || 'Transliterasi Latin...'}
                  </p>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Artinya: "{currentDoa.arti || 'Arti doa...'}"
                  </p>

                  {currentDoa.keterangan && (
                    <p className="text-[10px] text-slate-500 italic">
                      Rujukan: {currentDoa.keterangan}
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                    <span>Dampak Perubahan Doa Amil:</span>
                  </div>
                  <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                    <li>Kuitansi cetak A4 & slip thermal otomatis memuat teks doa amil yang baru.</li>
                    <li>Teks WA kuitansi otomatis membagikan doa ini kepada muzakki.</li>
                    <li>Dialog popup ijab qabul kasir posko langsung memuat lafal ini.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: KRITERIA & INDIKATOR 8 ASNAF */}
      {subTab === 'asnaf' && (
        <div className="space-y-6">
          {/* Asnaf Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ASNAF_ITEMS.map((item) => {
              const isSelected = selectedAsnafKey === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedAsnafKey(item.id)}
                  className={`p-3 rounded-2xl text-left transition border cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/60 shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${item.badgeColor} border`}>
                    {item.number}
                  </span>
                  <div className="truncate">
                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Form */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Pengaturan Kriteria Asnaf: {currentAsnaf.title || selectedAsnafKey}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Tentukan kriteria kelayakan di lapangan, indikator Had Kifayah, dan rekomendasi alokasi.</p>
                </div>
                <span className="text-xs font-arabic text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-base">
                  {currentAsnaf.arabicName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Label Asnaf
                  </label>
                  <input
                    type="text"
                    value={currentAsnaf.title}
                    onChange={(e) => updateAsnafItem(selectedAsnafKey, 'title', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Arab Asnaf
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={currentAsnaf.arabicName}
                    onChange={(e) => updateAsnafItem(selectedAsnafKey, 'arabicName', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl font-arabic text-sm text-emerald-300 focus:outline-hidden focus:border-emerald-500 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kriteria Utama Lapangan & Syarat Mustahiq
                </label>
                <textarea
                  rows={3}
                  value={currentAsnaf.kriteriaUtama}
                  onChange={(e) => updateAsnafItem(selectedAsnafKey, 'kriteriaUtama', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                  placeholder="Contoh: Orang yang tidak memiliki pekerjaan atau penghasilannya < 50% kebutuhan pokok..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Indikator Had Kifayah / Batas Pendapatan Lokal
                </label>
                <input
                  type="text"
                  value={currentAsnaf.indikatorKifayah}
                  onChange={(e) => updateAsnafItem(selectedAsnafKey, 'indikatorKifayah', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-300 focus:outline-hidden focus:border-emerald-500"
                  placeholder="Contoh: Penghasilan < Rp 1.000.000 / keluarga / bulan atau < Had Kifayah BAZNAS"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Prioritas Alokasi & Rekomendasi Porsi Penyaluran
                </label>
                <textarea
                  rows={2}
                  value={currentAsnaf.prioritasAlokasi}
                  onChange={(e) => updateAsnafItem(selectedAsnafKey, 'prioritasAlokasi', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                  placeholder="Contoh: Prioritas Peringkat 1. Diberikan paket beras fitrah 10kg + santunan tunai..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Dokumen / Bukti Syarat Verifikasi Petugas
                </label>
                <input
                  type="text"
                  value={currentAsnaf.dokumenSyarat || ''}
                  onChange={(e) => updateAsnafItem(selectedAsnafKey, 'dokumenSyarat', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-emerald-500"
                  placeholder="Contoh: SKTM dari RT/RW, fotokopi KK/KTP, rekomendasi pengurus DKM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Catatan Fiqih & Rujukan Fatwa Tambahan
                </label>
                <textarea
                  rows={2}
                  value={currentAsnaf.catatanFiqih}
                  onChange={(e) => updateAsnafItem(selectedAsnafKey, 'catatanFiqih', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-400 focus:outline-hidden focus:border-emerald-500"
                  placeholder="Contoh: Rujukan Kitab Fathul Qarib, Fatwa MUI No. 4/2003..."
                />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Preview Kartu Panduan Petugas Mustahiq</span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-3 text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Verifikasi Lapangan Mustahiq
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {currentAsnaf.title || selectedAsnafKey}
                      </h4>
                    </div>
                    <span className="font-arabic text-emerald-800 text-lg font-bold">
                      {currentAsnaf.arabicName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Kriteria Kelayakan:</span>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-medium">
                      {currentAsnaf.kriteriaUtama || 'Belum diisi...'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Batas Had Kifayah:</span>
                    <span className="text-emerald-950 font-bold">{currentAsnaf.indikatorKifayah || '-'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Rekomendasi Alokasi:</span>
                    <p className="text-xs text-slate-600 mt-0.5">{currentAsnaf.prioritasAlokasi || '-'}</p>
                  </div>

                  {currentAsnaf.dokumenSyarat && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">Syarat Berkas:</span> {currentAsnaf.dokumenSyarat}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sinkronisasi Otomatis:</span>
                  </div>
                  <p className="text-[11px]">
                    Kriteria ini langsung menjadi acuan bagi amil ketika memfilter, menyeleksi mustahiq, dan mencetak Berita Acara Serah Terima (BAST).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SOP FIQIH & KEBIJAKAN DKM */}
      {subTab === 'sop' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-400" />
              <span>SOP Fiqih, Takaran Beras & Regulasi DKM</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Aturan takaran zakat fitrah daerah, alokasi hak amil, dan panduan adab ijab qabul amil zakat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Standar Takaran Beras Fitrah (Kg / Jiwa)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="4"
                  value={form.sopConfig.standarBerasFitrahKg}
                  onChange={(e) => setForm({
                    ...form,
                    sopConfig: {
                      ...form.sopConfig,
                      standarBerasFitrahKg: parseFloat(e.target.value) || 2.5
                    }
                  })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 pr-12 font-bold"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Kg</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Sesuai Fatwa MUI & SK BAZNAS (2.5 kg atau 2.7 - 3.0 kg ikhtiyath)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Standar Takaran Beras Fitrah (Liter / Jiwa)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="5"
                  value={form.sopConfig.standarBerasFitrahLiter}
                  onChange={(e) => setForm({
                    ...form,
                    sopConfig: {
                      ...form.sopConfig,
                      standarBerasFitrahLiter: parseFloat(e.target.value) || 3.5
                    }
                  })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 pr-14 font-bold"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Liter</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Konversi 1 sha' gandum/beras (3.5 liter)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Maksimal Porsi Hak Bagian Amil (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="25"
                  value={form.sopConfig.maksimalHakAmilPersen}
                  onChange={(e) => setForm({
                    ...form,
                    sopConfig: {
                      ...form.sopConfig,
                      maksimalHakAmilPersen: parseFloat(e.target.value) || 12.5
                    }
                  })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 pr-10 font-bold text-amber-300"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Batas 1/8 (12.5%) total penghimpunan zakat</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Batas Waktu Penyaluran Zakat Fitrah (Waktu Fadhilah / Mustahab)
            </label>
            <input
              type="text"
              value={form.sopConfig.batasWaktuPenyaluran}
              onChange={(e) => setForm({
                ...form,
                sopConfig: {
                  ...form.sopConfig,
                  batasWaktuPenyaluran: e.target.value
                }
              })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Panduan Adab Ijab Qabul untuk Petugas Amil Posko
            </label>
            <textarea
              rows={3}
              value={form.sopConfig.panduanIjabQabul}
              onChange={(e) => setForm({
                ...form,
                sopConfig: {
                  ...form.sopConfig,
                  panduanIjabQabul: e.target.value
                }
              })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Pesan Doa Penutup pada Kuitansi Digital & WhatsApp Muzakki
            </label>
            <textarea
              rows={2}
              value={form.sopConfig.pesanKuitansiTambahan}
              onChange={(e) => setForm({
                ...form,
                sopConfig: {
                  ...form.sopConfig,
                  pesanKuitansiTambahan: e.target.value
                }
              })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan Fiqih & SOP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
