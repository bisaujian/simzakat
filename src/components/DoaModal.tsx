import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { fiqhConfigService } from '../services/fiqhConfigService';
import { FiqhPlatformConfig } from '../types/fiqh';

interface DoaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoaModal: React.FC<DoaModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<FiqhPlatformConfig>(() => fiqhConfigService.getConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(fiqhConfigService.getConfig());
    };
    window.addEventListener('fiqh-config-changed', handleUpdate);
    return () => window.removeEventListener('fiqh-config-changed', handleUpdate);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Panduan Doa & Niat Ijab Qabul Zakat</h3>
              <p className="text-[11px] text-emerald-200">Standar Fiqih ZISWAF & Pedoman Resmi Amil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list of prayers */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Ayat Al-Quran */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="font-arabic text-xl text-emerald-950 font-bold mb-1 leading-relaxed">
              خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَاتَكَ سَكَنٌ لَهُمْ
            </p>
            <p className="text-xs text-emerald-800 italic">
              "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan menyucikan mereka dan berdoalah untuk mereka. Sesungguhnya doa kamu itu (menjadi) ketenteraman jiwa bagi mereka." (QS. At-Taubah: 103)
            </p>
          </div>

          {/* 1. Doa Amil Penerima Zakat */}
          <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                1. Dibaca Amil Saat Menerima Zakat (Ijab Qabul)
              </span>
              <span className="text-xs text-slate-400 font-arabic text-sm">دعاء الآخذ</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{config.doaAmil.title}</h4>
            <p className="font-arabic text-2xl text-emerald-950 font-bold text-right leading-loose py-1">
              {config.doaAmil.arabic}
            </p>
            <p className="text-xs font-semibold text-slate-700 italic">
              Latin: {config.doaAmil.latin}
            </p>
            <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-emerald-100">
              Artinya: "{config.doaAmil.arti}"
            </p>
            {config.doaAmil.keterangan && (
              <p className="text-[11px] text-slate-500 italic mt-1">{config.doaAmil.keterangan}</p>
            )}
          </div>

          {/* 2. Niat Fitrah Diri Sendiri */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                2. Niat Muzakki (Diri Sendiri)
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{config.niatFitrahSendiri.title}</h4>
            <p className="font-arabic text-xl text-slate-900 font-bold text-right leading-loose py-1">
              {config.niatFitrahSendiri.arabic}
            </p>
            <p className="text-xs font-semibold text-slate-700 italic">
              Latin: {config.niatFitrahSendiri.latin}
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Artinya: "{config.niatFitrahSendiri.arti}"
            </p>
          </div>

          {/* 3. Niat Fitrah Keluarga */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                3. Niat Muzakki (Kepala Keluarga & Tanggungan)
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{config.niatFitrahKeluarga.title}</h4>
            <p className="font-arabic text-xl text-slate-900 font-bold text-right leading-loose py-1">
              {config.niatFitrahKeluarga.arabic}
            </p>
            <p className="text-xs font-semibold text-slate-700 italic">
              Latin: {config.niatFitrahKeluarga.latin}
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Artinya: "{config.niatFitrahKeluarga.arti}"
            </p>
          </div>

          {/* 4. Niat Zakat Maal */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                4. Niat Zakat Harta (Maal)
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{config.niatZakatMaal.title}</h4>
            <p className="font-arabic text-xl text-slate-900 font-bold text-right leading-loose py-1">
              {config.niatZakatMaal.arabic}
            </p>
            <p className="text-xs font-semibold text-slate-700 italic">
              Latin: {config.niatZakatMaal.latin}
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Artinya: "{config.niatZakatMaal.arti}"
            </p>
          </div>

          {/* 5. Doa Amil Keberkahan Alternatif */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                5. Doa Keberkahan Amil Alternatif
              </span>
              <span className="text-xs text-slate-400 font-arabic text-sm">دعاء البركة</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{config.doaAmilMendoakan.title}</h4>
            <p className="font-arabic text-xl text-teal-950 font-bold text-right leading-loose py-1">
              {config.doaAmilMendoakan.arabic}
            </p>
            <p className="text-xs font-semibold text-slate-700 italic">
              Latin: {config.doaAmilMendoakan.latin}
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Artinya: "{config.doaAmilMendoakan.arti}"
            </p>
            {config.doaAmilMendoakan.keterangan && (
              <p className="text-[11px] text-slate-500 italic">{config.doaAmilMendoakan.keterangan}</p>
            )}
          </div>

          {/* 6. Doa Sunnah Perlindungan Harta */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                6. Doa Perlindungan Harta Bersih
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{config.doaSunnahNabi.title}</h4>
            <p className="font-arabic text-xl text-indigo-950 font-bold text-right leading-loose py-1">
              {config.doaSunnahNabi.arabic}
            </p>
            <p className="text-xs font-semibold text-slate-700 italic">
              Latin: {config.doaSunnahNabi.latin}
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Artinya: "{config.doaSunnahNabi.arti}"
            </p>
          </div>

          {/* Catatan Admin / Owner */}
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-start gap-2 text-xs text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Keterangan Pengelolaan Fiqih:</span> Seluruh teks doa, transliterasi Latin, terjemahan, dan rujukan hadits di atas dapat diperbarui dan dikelola kapan saja oleh Super Admin / Owner melalui menu <strong>"Pedoman Fiqih, Doa & Kriteria Asnaf"</strong> di Dashboard Owner.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Tutup Panduan Doa
          </button>
        </div>
      </div>
    </div>
  );
};
