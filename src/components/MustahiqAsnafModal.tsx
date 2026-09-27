import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Building2, 
  FileText, 
  HeartHandshake, 
  ChevronRight,
  ChevronLeft,
  Layers,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AsnafType, ASNAF_LABELS } from '../types/zakat';
import { ASNAF_DETAILED_GUIDELINES, AsnafGuideline } from '../utils/asnafFiqhRules';
import { fiqhConfigService } from '../services/fiqhConfigService';

interface MustahiqAsnafModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAsnaf?: AsnafType;
}

const ALL_ASNAF_KEYS: AsnafType[] = [
  'fakir',
  'miskin',
  'amil',
  'mualaf',
  'riqab',
  'gharimin',
  'fisabilillah',
  'ibnu_sabil',
];

export const MustahiqAsnafModal: React.FC<MustahiqAsnafModalProps> = ({
  isOpen,
  onClose,
  initialAsnaf = 'fakir',
}) => {
  const [selectedAsnaf, setSelectedAsnaf] = useState<AsnafType>(initialAsnaf);
  const [viewMode, setViewMode] = useState<'per_asnaf' | 'semua_8_asnaf'>('per_asnaf');
  const [activeSourceTab, setActiveSourceTab] = useState<'semua' | 'dkm' | 'syafii' | 'mui' | 'nu' | 'muhammadiyah' | 'baznas'>('semua');

  // Synchronize state when initialAsnaf or modal open state changes
  useEffect(() => {
    if (initialAsnaf) {
      setSelectedAsnaf(initialAsnaf);
    }
  }, [initialAsnaf, isOpen]);

  if (!isOpen) return null;

  const currentIndex = ALL_ASNAF_KEYS.indexOf(selectedAsnaf);
  const current = ASNAF_DETAILED_GUIDELINES[selectedAsnaf];

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + ALL_ASNAF_KEYS.length) % ALL_ASNAF_KEYS.length;
    setSelectedAsnaf(ALL_ASNAF_KEYS[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % ALL_ASNAF_KEYS.length;
    setSelectedAsnaf(ALL_ASNAF_KEYS[nextIdx]);
  };

  const renderAsnafDetailCard = (item: AsnafGuideline, index: number) => {
    return (
      <div key={item.id} id={`asnaf-card-${item.id}`} className="space-y-4">
        {/* Ayat & Asnaf Main Overview */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800">
                Klasifikasi Hak Mustahiq (QS. At-Taubah: 60)
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{index + 1}. {item.title}</span>
                <span className="font-arabic text-emerald-800 text-lg">({item.arabicName})</span>
              </h4>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-semibold self-start sm:self-auto">
              Asnaf ke-{index + 1} dari 8 Golongan
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
            <p className="font-arabic text-sm text-slate-800 font-bold text-right leading-relaxed mb-1">
              {item.ayatQuran}
            </p>
            <p className="text-xs text-slate-600 italic">
              "{item.artiAyat}"
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {item.deskripsiUmum}
          </p>
        </div>

        {/* Source Tabs Filter (only in per_asnaf mode, or shows all 6 boxes) */}
        {viewMode === 'per_asnaf' && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Pilihan Kajian:</span>
            {[
              { id: 'semua', label: 'Semua Rujukan', badge: '6' },
              { id: 'dkm', label: 'Pedoman Resmi DKM', badge: 'DKM' },
              { id: 'syafii', label: "Mazhab Syafi'i", badge: 'SY' },
              { id: 'mui', label: 'Fatwa MUI', badge: 'MUI' },
              { id: 'nu', label: 'Muktamar NU', badge: 'NU' },
              { id: 'muhammadiyah', label: 'Tarjih Muhammadiyah', badge: 'TM' },
              { id: 'baznas', label: 'Pedoman BAZNAS RI', badge: 'BZ' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSourceTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSourceTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                  activeSourceTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Cards of Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card: Pedoman DKM & CMS Syariah Platform */}
          {(() => {
            const dkmGuide = fiqhConfigService.getAsnafGuideline(item.id);
            if (!dkmGuide) return null;
            if (viewMode !== 'semua_8_asnaf' && activeSourceTab !== 'semua' && activeSourceTab !== 'dkm') return null;

            return (
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl border-2 border-emerald-500/50 p-4 sm:p-5 shadow-lg space-y-3 md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                      DKM
                    </div>
                    <div>
                      <h5 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <span>Pedoman Resmi DKM & Batas Had Kifayah Lokal</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Dikelola Owner
                        </span>
                      </h5>
                      <p className="text-[10px] text-emerald-200/80">Kriteria verifikasi lapangan operasional petugas amil</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-arabic text-emerald-300 text-right">
                    {dkmGuide.arabicName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Kriteria Kelayakan Lapangan:
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {dkmGuide.kriteriaUtama}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Indikator Had Kifayah / Pendapatan:
                    </span>
                    <p className="text-slate-200 leading-relaxed font-bold">
                      {dkmGuide.indikatorKifayah}
                    </p>
                    {dkmGuide.dokumenSyarat && (
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60 mt-1">
                        <strong className="text-slate-300">Dokumen:</strong> {dkmGuide.dokumenSyarat}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 sm:col-span-2 lg:col-span-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                      Rekomendasi Alokasi & Fiqih:
                    </span>
                    <p className="text-slate-200 leading-relaxed">
                      {dkmGuide.prioritasAlokasi}
                    </p>
                    {dkmGuide.catatanFiqih && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-700/60 mt-1">
                        "{dkmGuide.catatanFiqih}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* 1. Mazhab Syafi'i */}
          {(viewMode === 'semua_8_asnaf' || activeSourceTab === 'semua' || activeSourceTab === 'syafii') && (
            <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  SY
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Kaidah Mazhab Syafi'i</h5>
                  <p className="text-[10px] text-slate-500 font-mono">{item.mazhabSyafii.referensiKitab}</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 font-medium">
                  <strong className="text-emerald-950 block mb-0.5">Definisi Mu'tamad:</strong>
                  {item.mazhabSyafii.definisi}
                </div>

                <strong className="block text-slate-800 pt-1 font-bold">Ketentuan & Syarat Khusus:</strong>
                <ul className="space-y-1.5 list-none">
                  {item.mazhabSyafii.ketentuan.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 2. Fatwa MUI */}
          {(viewMode === 'semua_8_asnaf' || activeSourceTab === 'semua' || activeSourceTab === 'mui') && (
            <div className="bg-white rounded-2xl border border-teal-300 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  MUI
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Fatwa Majelis Ulama Indonesia</h5>
                  <p className="text-[10px] text-slate-500">{item.fatwaMUI.nomorDanTahun}</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100 font-medium">
                  <strong className="text-teal-950 block mb-0.5">Ketetapan Hukum:</strong>
                  {item.fatwaMUI.ketetapanUtama}
                </div>

                <strong className="block text-slate-800 pt-1 font-bold">Panduan Operasional:</strong>
                <ul className="space-y-1.5 list-none">
                  {item.fatwaMUI.ketentuanOperasional.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. Muktamar & Bahtsul Masail NU */}
          {(viewMode === 'semua_8_asnaf' || activeSourceTab === 'semua' || activeSourceTab === 'nu') && (
            <div className="bg-white rounded-2xl border border-emerald-400 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  NU
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Keputusan Muktamar & Bahtsul Masail NU</h5>
                  <p className="text-[10px] text-slate-500">{item.muktamarNU.keputusan}</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 font-medium">
                  <strong className="text-emerald-950 block mb-0.5">Pandangan Ulama NU:</strong>
                  {item.muktamarNU.pandanganUlamaNU}
                </div>

                <strong className="block text-slate-800 pt-1 font-bold">Arahan Pentasyarufan:</strong>
                <ul className="space-y-1.5 list-none">
                  {item.muktamarNU.arahanPenyaluran.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 4. Putusan Tarjih Muhammadiyah */}
          {(viewMode === 'semua_8_asnaf' || activeSourceTab === 'semua' || activeSourceTab === 'muhammadiyah') && (
            <div className="bg-white rounded-2xl border border-blue-300 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  TM
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Putusan Tarjih & Tajdid Muhammadiyah</h5>
                  <p className="text-[10px] text-slate-500">{item.tarjihMuhammadiyah.putusan}</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 font-medium">
                  <strong className="text-blue-950 block mb-0.5">Fokus Mustadh'afin:</strong>
                  {item.tarjihMuhammadiyah.fokusUtama}
                </div>

                <strong className="block text-slate-800 pt-1 font-bold">Orientasi Program:</strong>
                <ul className="space-y-1.5 list-none">
                  {item.tarjihMuhammadiyah.orientasiProgram.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 5. Pedoman Teknis BAZNAS RI */}
          {(viewMode === 'semua_8_asnaf' || activeSourceTab === 'semua' || activeSourceTab === 'baznas') && (
            <div className="bg-white rounded-2xl border border-amber-300 p-4 sm:p-5 shadow-xs space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  BZ
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Pedoman Teknis BAZNAS RI (Badan Amil Zakat Nasional)</h5>
                  <p className="text-[10px] text-slate-500">{item.pedomanBaznas.regulasi}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <strong className="text-amber-950 block mb-1">Standar Ukuran Had Kifayah:</strong>
                  <p>{item.pedomanBaznas.indikatorKifayah}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Indikator Verifikasi Faktual Lapangan:</strong>
                  <ul className="space-y-1 list-none">
                    {item.pedomanBaznas.kriteriaVerifikasi.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-emerald-200 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Pedoman Fiqih Syar'i 8 Asnaf Mustahiq
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Kaidah Mazhab Syafi'i • Fatwa MUI • Muktamar NU • Tarjih Muhammadiyah • Pedoman BAZNAS RI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Bar: Per Asnaf vs Semua 8 Asnaf Sekaligus */}
        <div className="shrink-0 px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 w-full sm:w-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('per_asnaf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer ${
                viewMode === 'per_asnaf'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pilih Per Golongan (1 - 8)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('semua_8_asnaf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer ${
                viewMode === 'semua_8_asnaf'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tampilkan Semua Sekaligus</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full font-black">8</span>
            </button>
          </div>

          {viewMode === 'per_asnaf' && (
            <div className="flex items-center justify-between sm:justify-end gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Pindah ke asnaf sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <span className="text-xs font-extrabold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                {currentIndex + 1} / 8
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Pindah ke asnaf berikutnya"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 8 Asnaf Numbered Navigation Chips (Fully visible responsive grid with zero squishing) */}
        <div className="shrink-0 p-3 sm:p-3.5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {ALL_ASNAF_KEYS.map((key, idx) => {
              const isSelected = selectedAsnaf === key;
              const item = ASNAF_DETAILED_GUIDELINES[key];
              const shortName = item.title.split('(')[0].trim();
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedAsnaf(key);
                    if (viewMode === 'semua_8_asnaf') {
                      const el = document.getElementById(`asnaf-card-${key}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`px-2 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center text-center justify-center gap-0.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white ring-2 ring-emerald-600 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                      isSelected ? 'bg-white text-emerald-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="truncate">{shortName}</span>
                  </div>
                  <span className={`text-[10px] font-arabic truncate ${
                    isSelected ? 'text-emerald-200' : 'text-slate-400'
                  }`}>
                    {item.arabicName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-8">
          {viewMode === 'per_asnaf' ? (
            <>
              {renderAsnafDetailCard(current, currentIndex)}

              {/* Bottom Carousel Navigation */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    Asnaf {((currentIndex - 1 + 8) % 8) + 1}: {ASNAF_DETAILED_GUIDELINES[ALL_ASNAF_KEYS[(currentIndex - 1 + 8) % 8]].title.split('(')[0].trim()}
                  </span>
                </button>

                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Golongan Asnaf ke-{currentIndex + 1} dari 8
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>
                    Asnaf {((currentIndex + 1) % 8) + 1}: {ASNAF_DETAILED_GUIDELINES[ALL_ASNAF_KEYS[(currentIndex + 1) % 8]].title.split('(')[0].trim()}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-12 divide-y divide-slate-200">
              {ALL_ASNAF_KEYS.map((key, idx) => (
                <div key={key} className={idx > 0 ? 'pt-8' : ''}>
                  {renderAsnafDetailCard(ASNAF_DETAILED_GUIDELINES[key], idx)}
                </div>
              ))}
            </div>
          )}

          {/* Quick Fiqh Takeaway Box */}
          <div className="p-4 bg-emerald-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-xs text-center sm:text-left">
              <span className="font-bold text-emerald-300 block">Kepatuhan Syariah & Pertanggungjawaban Panitia:</span>
              <p className="text-slate-200 text-[11px]">
                Distribusi zakat fitrah diutamakan selesai sebelum pelaksanaan Shalat Idul Fitri bagi fakir dan miskin setempat.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
            >
              Tutup Panduan
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
