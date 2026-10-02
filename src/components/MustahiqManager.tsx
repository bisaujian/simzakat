import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  UserCheck, 
  Package, 
  Coins, 
  Wheat, 
  Info, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Send,
  BookOpen,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { AppConfig, AsnafType, ASNAF_LABELS, Mustahiq } from '../types/zakat';
import { formatKg, formatRupiah, exportMustahiqToCSV } from '../utils/helpers';
import { MustahiqAsnafModal } from './MustahiqAsnafModal';

interface MustahiqManagerProps {
  mustahiqList: Mustahiq[];
  config: AppConfig;
  onSaveMustahiq: (m: Mustahiq) => void;
  onDeleteMustahiq: (id: string) => void;
  onQuickDistribute: (mustahiq: Mustahiq) => void;
}

// Rangkuman praktis 8 Asnaf yang ringkas, mudah dipahami, dan langsung aplikatif di lapangan
const ASNAF_PRACTICAL_GUIDELINES: Record<AsnafType, {
  number: number;
  label: string;
  arabicName: string;
  shortRule: string;
  hadKifayahThreshold: string;
  fieldChecks: string[];
  allocationFocus: string;
  badgeColor: string;
  lightBg: string;
  borderAccent: string;
}> = {
  fakir: {
    number: 1,
    label: 'Fakir',
    arabicName: 'الفُقَرَاءِ',
    shortRule: 'Tidak berpenghasilan/aset, atau penghasilan hanya mencukupi < 50% Had Kifayah kebutuhan pokok.',
    hadKifayahThreshold: 'Pendapatan per kapita di bawah standar Had Kifayah BAZNAS (< Rp 1.500.000/jiwa/bln).',
    fieldChecks: [
      'Nihil sumber nafkah tetap / tidak memiliki tabungan & aset bernilai',
      'Bukan keluarga yang wajib dinafkahi muzakki & bukan Ahlul Bait',
      'Lansia sebatang kara, penyandang difabel berat, atau miskin kronis'
    ],
    allocationFocus: 'Prioritas tertinggi pembagian beras Zakat Fitrah & santunan konsumtif pangan.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    lightBg: 'bg-rose-50/60',
    borderAccent: 'border-rose-200'
  },
  miskin: {
    number: 2,
    label: 'Miskin',
    arabicName: 'المَسَاكِينِ',
    shortRule: 'Memiliki penghasilan/pekerjaan namun hanya mencukupi 50% s/d 90% kebutuhan pokok harian.',
    hadKifayahThreshold: 'Total penghasilan riil keluarga masih defisit dibandingkan biaya kebutuhan primer wajar.',
    fieldChecks: [
      'Bekerja (buruh harian/pedagang kecil/ojek) tapi pendapatan pas-pasan',
      'Memiliki tanggungan anak sekolah atau beban biaya tempat tinggal',
      'Kerap mengalami kekurangan untuk membeli sembako di akhir bulan'
    ],
    allocationFocus: 'Beras fitrah pangan keluarga & bantuan pelengkap penunjang kehidupan.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    lightBg: 'bg-amber-50/60',
    borderAccent: 'border-amber-200'
  },
  amil: {
    number: 3,
    label: 'Amil Zakat',
    arabicName: 'العَامِلِينَ عَلَيْهَا',
    shortRule: 'Panitia/petugas yang ditugaskan resmi mengumpulkan, mencatat, mengelola, dan mendistribusikan zakat.',
    hadKifayahThreshold: 'Alokasi hak amil maksimal 1/8 (12,5%) dari total perolehan zakat.',
    fieldChecks: [
      'Ditetapkan sah melalui SK Panitia Zakat DKM Masjid atau BAZNAS',
      'Amanah, tertib pembukuan kasir & pelaporan berita acara penyaluran',
      'Diberikan sebagai imbalan ujrah mitsil (upah kerja) atas jerih payah'
    ],
    allocationFocus: 'Ujrah operasional kepanitiaan amil zakat.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    lightBg: 'bg-emerald-50/60',
    borderAccent: 'border-emerald-200'
  },
  mualaf: {
    number: 4,
    label: 'Mualaf',
    arabicName: 'المُؤَلَّفَةِ قُلُوبُهُمْ',
    shortRule: 'Orang yang baru masuk Islam atau yang masih rentan membutuhkan penguatan iman dan adaptasi sosial.',
    hadKifayahThreshold: 'Hak santunan tali asih untuk ketenteraman hati dan pendampingan sosial-keagamaan.',
    fieldChecks: [
      'Baru memeluk Islam (fase adaptasi keyakinan & pembinaan aqidah)',
      'Mengalami kerentanan ekonomi/sosial akibat kepindahan agama',
      'Mendukung keteguhan keimanan, ukhuwah, dan bimbingan keislaman'
    ],
    allocationFocus: 'Paket beras pangan keluarga & tali asih penguatan ukhuwah.',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    lightBg: 'bg-sky-50/60',
    borderAccent: 'border-sky-200'
  },
  riqab: {
    number: 5,
    label: 'Riqab',
    arabicName: 'الرِّقَابِ',
    shortRule: 'Pembebasan dari jeratan eksploitasi kerja paksa, tindak pidana perdagangan orang, atau diskriminasi.',
    hadKifayahThreshold: 'Bantuan pembebasan dan perlindungan harkat martabat kemanusiaan.',
    fieldChecks: [
      'Korban tindak perdagangan orang (human trafficking) / penyanderaan',
      'Pekerja terlantar di luar kemampuan yang terancam keselamatannya',
      'Prioritas dialokasikan jika teridentifikasi kasus darurat kemanusiaan'
    ],
    allocationFocus: 'Advokasi hukum, perlindungan, dan pemulangan darurat.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    lightBg: 'bg-purple-50/60',
    borderAccent: 'border-purple-200'
  },
  gharimin: {
    number: 6,
    label: 'Gharimin',
    arabicName: 'الغَارِمِينَ',
    shortRule: 'Orang yang terbelit hutang untuk kebutuhan primer mubah keluarga atau mendamaikan perselisihan.',
    hadKifayahThreshold: 'Hutang jatuh tempo dan peminjam tidak memiliki sisa harta untuk melunasi.',
    fieldChecks: [
      'Hutang murni untuk kebutuhan pokok darurat (pangan, berobat, sekolah anak)',
      'Bukan hutang karena judi, pinjaman konsumtif foya-foya, atau maksiat',
      'Disalurkan langsung kepada pihak kreditor/pemberi pinjaman'
    ],
    allocationFocus: 'Bantuan penyelesaian tanggungan hutang pokok darurat.',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    lightBg: 'bg-orange-50/60',
    borderAccent: 'border-orange-200'
  },
  fisabilillah: {
    number: 7,
    label: 'Fisabilillah',
    arabicName: 'فِي سَبِيلِ اللَّهِ',
    shortRule: 'Pihak yang berjuang menegakkan syiar Islam, dakwah, guru ngaji, marbot masjid, dan pendidikan agama.',
    hadKifayahThreshold: 'Mendukung keberlanjutan dakwah dan syiar Islam di lingkungan warga.',
    fieldChecks: [
      'Guru ngaji TPA, ustadz/ustadzah madrasah swasta non-PNS/sertifikasi',
      'Marbot dan pengurus ibadah harian masjid lingkungan setempat',
      'Aktivis dakwah yang mendedikasikan waktu demi kemaslahatan umat'
    ],
    allocationFocus: 'Insentif kehormatan beras pangan & dana apresiasi dakwah.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    lightBg: 'bg-teal-50/60',
    borderAccent: 'border-teal-200'
  },
  ibnu_sabil: {
    number: 8,
    label: 'Ibnu Sabil',
    arabicName: 'ابْنِ السَّبِيلِ',
    shortRule: 'Musafir yang kehabisan ongkos/bekal dalam perjalanan ketaatan atau urusan yang mubah.',
    hadKifayahThreshold: 'Diberikan secukupnya ongkos tiket perjalanan pulang dan bekal konsumsi wajar.',
    fieldChecks: [
      'Sedang dalam perjalanan mubah (bukan perjalanan kemaksiatan)',
      'Kehabisan bekal di perjalanan dan terputus akses ke sumber uang sendiri',
      'Cukup diberikan bantuan tiket perjalanan pulang & konsumsi darurat'
    ],
    allocationFocus: 'Tiket perjalanan pulang & konsumsi darurat musafir.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    lightBg: 'bg-indigo-50/60',
    borderAccent: 'border-indigo-200'
  }
};

export const MustahiqManager: React.FC<MustahiqManagerProps> = ({
  mustahiqList,
  config,
  onSaveMustahiq,
  onDeleteMustahiq,
  onQuickDistribute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [asnafFilter, setAsnafFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fiqh 8 Asnaf Guideline Modal State
  const [isAsnafModalOpen, setIsAsnafModalOpen] = useState(false);
  const [selectedGuidelineAsnaf, setSelectedGuidelineAsnaf] = useState<AsnafType>('fakir');

  // Form State
  const [formName, setFormName] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formKk, setFormKk] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRtRw, setFormRtRw] = useState('RT 01 / RW 07');
  const [formAsnaf, setFormAsnaf] = useState<AsnafType>('fakir');
  const [formFamilyCount, setFormFamilyCount] = useState<number>(3);
  const [formPriority, setFormPriority] = useState<'sangat_mendesak' | 'mendesak' | 'reguler'>('sangat_mendesak');
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormNik('');
    setFormKk('');
    setFormPhone('');
    setFormAddress('');
    setFormRtRw('RT 01 / RW 07');
    setFormAsnaf('fakir');
    setFormFamilyCount(3);
    setFormPriority('sangat_mendesak');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (m: Mustahiq) => {
    setEditingId(m.id);
    setFormName(m.name);
    setFormNik(m.nik || '');
    setFormKk(m.kkNumber || '');
    setFormPhone(m.phone || '');
    setFormAddress(m.address);
    setFormRtRw(m.rtRw);
    setFormAsnaf(m.asnaf);
    setFormFamilyCount(m.familyMembersCount);
    setFormPriority(m.priority);
    setFormNotes(m.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama Mustahiq wajib diisi.');
      return;
    }

    const targetId = editingId || `mst-${Date.now()}`;
    const existing = mustahiqList.find((m) => m.id === targetId);

    const saved: Mustahiq = {
      id: targetId,
      name: formName.trim(),
      nik: formNik.trim(),
      kkNumber: formKk.trim(),
      phone: formPhone.trim(),
      address: formAddress.trim() || 'Lingkungan DKM',
      rtRw: formRtRw,
      asnaf: formAsnaf,
      familyMembersCount: formFamilyCount,
      priority: formPriority,
      status: 'aktif',
      notes: formNotes.trim(),
      totalRiceReceivedKg: existing?.totalRiceReceivedKg || 0,
      totalMoneyReceivedRp: existing?.totalMoneyReceivedRp || 0,
      lastDistributedAt: existing?.lastDistributedAt,
    };

    onSaveMustahiq(saved);
    setIsModalOpen(false);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    const s = (searchQuery || '').trim().toLowerCase();
    return mustahiqList.filter((m) => {
      if (!m) return false;
      const matchSearch =
        !s ||
        (m.name || '').toLowerCase().includes(s) ||
        (m.address || '').toLowerCase().includes(s) ||
        (m.rtRw || '').toLowerCase().includes(s) ||
        (m.nik ? m.nik.includes(searchQuery) : false) ||
        (m.notes ? m.notes.toLowerCase().includes(s) : false);

      const matchAsnaf = asnafFilter === 'all' || m.asnaf === asnafFilter;
      const matchPriority = priorityFilter === 'all' || m.priority === priorityFilter;

      return matchSearch && matchAsnaf && matchPriority;
    });
  }, [mustahiqList, searchQuery, asnafFilter, priorityFilter]);

  // Asnaf counts
  const asnafCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mustahiqList.forEach((m) => {
      counts[m.asnaf] = (counts[m.asnaf] || 0) + 1;
    });
    return counts;
  }, [mustahiqList]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Database Mustahiq (8 Golongan Asnaf)
          </h2>
          <p className="text-slate-600 text-sm mt-0.5">
            Pendataan terpadu mustahiq penerima hak zakat sesuai ketentuan syariat Islam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedGuidelineAsnaf(asnafFilter !== 'all' ? (asnafFilter as AsnafType) : 'fakir');
              setIsAsnafModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Kriteria Syar'i 8 Asnaf</span>
          </button>

          <button
            onClick={() => exportMustahiqToCSV(filteredList, config)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
            title="Unduh seluruh data mustahiq 8 asnaf ke berkas Excel (.xls) ber-kop resmi"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xls)</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mustahiq</span>
          </button>
        </div>
      </div>

      {/* 8 Asnaf Quick Filters / Badges + 'Semua' Option (Scrollable on mobile) */}
      <div className="flex overflow-x-auto gap-2 pb-1.5 sm:pb-0 sm:grid sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 no-scrollbar">
        {/* Card 0: Semua Asnaf */}
        <button
          type="button"
          onClick={() => setAsnafFilter('all')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-w-[130px] sm:min-w-0 shrink-0 ${
            asnafFilter === 'all'
              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Semua Asnaf</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                mustahiqList.length > 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {mustahiqList.length}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-1">Total seluruh data</div>
        </button>

        {/* Cards 1 to 8: Asnaf Badges */}
        {(Object.keys(ASNAF_LABELS) as AsnafType[]).map((key, idx) => {
          const item = ASNAF_LABELS[key];
          const count = asnafCounts[key] || 0;
          const isSelected = asnafFilter === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (isSelected) {
                  setAsnafFilter('all');
                } else {
                  setAsnafFilter(key);
                  setSelectedGuidelineAsnaf(key);
                }
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-w-[130px] sm:min-w-0 shrink-0 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono">{idx + 1}.</span>
                  {item.label}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    count > 0 ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-1">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Ringkas & Praktis: Asnaf Criteria / Field Verification Guide */}
      {asnafFilter === 'all' ? (
        /* Slim, Friendly Bar when looking at All Mustahiq */
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-slate-900 font-bold">Panduan Verifikasi Syar'i:</strong> Klik salah satu tombol Asnaf di atas untuk memfilter data & melihat kriteria praktis lapangan, atau buka pedoman fiqih mu'tamad 8 golongan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedGuidelineAsnaf('fakir');
              setIsAsnafModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Buka Referensi Syar'i 8 Asnaf</span>
          </button>
        </div>
      ) : (
        /* Compact, Practical 1-Card Guide for Selected Asnaf */
        (() => {
          const asnafKey = asnafFilter as AsnafType;
          const info = ASNAF_PRACTICAL_GUIDELINES[asnafKey];
          if (!info) return null;

          return (
            <div className={`rounded-2xl border p-4 sm:p-5 ${info.lightBg} ${info.borderAccent} shadow-2xs space-y-3 transition-all animate-in fade-in duration-150`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${info.badgeColor} border`}>
                    {info.number}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Kriteria Lapangan: {info.label}
                      </h4>
                      <span className="font-arabic text-emerald-900 font-bold text-sm">
                        ({info.arabicName})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/90 border border-slate-300 text-slate-700">
                        Asnaf ke-{info.number} dari 8 Mustahiq
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      {info.shortRule}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGuidelineAsnaf(asnafKey);
                      setIsAsnafModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Buka kajian kitab Mazhab Syafi'i, Fatwa MUI, NU, Muhammadiyah, dan Had Kifayah BAZNAS lengkap"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Rujukan Fiqih & Dalil Lengkap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAsnafFilter('all')}
                    className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    title="Tampilkan semua mustahiq"
                  >
                    ✕ Tutup Filter
                  </button>
                </div>
              </div>

              {/* 3 Practical Field Verification Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                {info.fieldChecks.map((check, i) => (
                  <div key={i} className="p-2.5 bg-white/95 rounded-xl border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-medium leading-relaxed">{check}</span>
                  </div>
                ))}
              </div>

              {/* Bottom indicator strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] bg-white/80 px-3.5 py-2 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span><strong>Had Kifayah / Ambang Batas:</strong> {info.hadKifayahThreshold}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Fokus Penyaluran:</strong> {info.allocationFocus}</span>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama mustahiq, NIK, alamat, RT/RW, atau catatan..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium outline-hidden"
          >
            <option value="all">Semua Prioritas</option>
            <option value="sangat_mendesak">Sangat Mendesak</option>
            <option value="mendesak">Mendesak</option>
            <option value="reguler">Reguler</option>
          </select>

          {asnafFilter !== 'all' && (
            <button
              onClick={() => setAsnafFilter('all')}
              className="px-2.5 py-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg font-medium hover:bg-rose-100"
            >
              Hapus Filter Asnaf ✕
            </button>
          )}
        </div>
      </div>

      {/* Mustahiq Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <HeartHandshake className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Belum ada mustahiq terdaftar sesuai kriteria.</p>
            <button
              onClick={openAddModal}
              className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              + Daftarkan Mustahiq Baru
            </button>
          </div>
        ) : (
          filteredList.map((m) => {
            const asnafMeta = ASNAF_LABELS[m.asnaf];
            const hasReceived = m.totalRiceReceivedKg > 0 || m.totalMoneyReceivedRp > 0;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuidelineAsnaf(m.asnaf);
                        setIsAsnafModalOpen(true);
                      }}
                      title={`Klik untuk melihat kriteria Fiqih Asnaf ${asnafMeta.label}`}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border transition cursor-pointer hover:opacity-85 ${asnafMeta.color}`}
                    >
                      {asnafMeta.label} ⓘ
                    </button>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        m.priority === 'sangat_mendesak'
                          ? 'bg-rose-100 text-rose-800'
                          : m.priority === 'mendesak'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.priority === 'sangat_mendesak'
                        ? 'Sangat Mendesak'
                        : m.priority === 'mendesak'
                        ? 'Mendesak'
                        : 'Reguler'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{m.name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {m.address} <span className="font-semibold text-slate-700">({m.rtRw})</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Tanggungan:</span>
                      <span className="font-semibold text-slate-800">{m.familyMembersCount} Jiwa</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Kontak:</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {m.phone || '-'}
                      </span>
                    </div>
                  </div>

                  {m.notes && (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                      "{m.notes}"
                    </div>
                  )}

                  {/* Distribution status */}
                  <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-emerald-900 font-semibold text-[11px]">
                      <span>Bantuan Diterima:</span>
                      <span>{hasReceived ? 'Sudah Menerima' : 'Belum Tersalurkan'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-amber-800 flex items-center gap-1">
                        <Wheat className="w-3 h-3" /> {formatKg(m.totalRiceReceivedKg)}
                      </span>
                      <span className="text-emerald-800 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> {formatRupiah(m.totalMoneyReceivedRp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(m)}
                      title="Edit Data"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus mustahiq ${m.name}?`)) {
                          onDeleteMustahiq(m.id);
                        }
                      }}
                      title="Hapus"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onQuickDistribute(m)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Salurkan Zakat</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Mustahiq */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingId ? 'Edit Data Mustahiq' : 'Daftarkan Mustahiq Baru (8 Asnaf)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Mustahiq <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Bpk. Sutarman"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Golongan Asnaf <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuidelineAsnaf(formAsnaf);
                        setIsAsnafModalOpen(true);
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Kaidah Syar'i</span>
                    </button>
                  </div>
                  <select
                    value={formAsnaf}
                    onChange={(e) => setFormAsnaf(e.target.value as AsnafType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    {(Object.keys(ASNAF_LABELS) as AsnafType[]).map((k) => (
                      <option key={k} value={k}>
                        {ASNAF_LABELS[k].label} - {ASNAF_LABELS[k].desc.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Prioritas Bantuan
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option value="sangat_mendesak">Sangat Mendesak (Darurat)</option>
                    <option value="mendesak">Mendesak</option>
                    <option value="reguler">Reguler / Rutin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Jiwa Tanggungan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formFamilyCount}
                    onChange={(e) => setFormFamilyCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK KTP (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formNik}
                    onChange={(e) => setFormNik(e.target.value)}
                    placeholder="16 digit NIK"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wilayah RT / RW
                  </label>
                  <input
                    type="text"
                    value={formRtRw}
                    onChange={(e) => setFormRtRw(e.target.value)}
                    placeholder="RT 01 / RW 07"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Tempat Tinggal
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Nama gang / jalan / nomor rumah"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Khusus / Hasil Survey
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contoh: Lansia sebatang kara, tanggungan anak sekolah, sakit menahun..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Simpan Data Mustahiq
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fiqh 8 Asnaf Modal */}
      <MustahiqAsnafModal
        isOpen={isAsnafModalOpen}
        onClose={() => setIsAsnafModalOpen(false)}
        initialAsnaf={selectedGuidelineAsnaf}
      />
    </div>
  );
};
