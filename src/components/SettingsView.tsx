import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle2, 
  Building, 
  Coins, 
  Wheat, 
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  HelpCircle,
  Archive,
  Calendar,
  Sparkles,
  Eye,
  Printer,
  Clock
} from 'lucide-react';
import { AppConfig, DistributionRecord, Mustahiq, MuzakkiTransaction, SkKemenagTier, YearlyArchiveRecord } from '../types/zakat';
import { MasjidAccount } from '../types/auth';
import { formatRupiah, formatKg } from '../utils/helpers';
import { INITIAL_MUSTAHIQ, INITIAL_TRANSACTIONS, INITIAL_DISTRIBUTIONS, DEFAULT_CONFIG, DEFAULT_SK_TIERS } from '../utils/initialData';
import { RolloverModal, ArchiveDetailModal, DeleteArchiveModal, TutupBukuEduModal } from './YearlyArchiveModal';

interface SettingsViewProps {
  config: AppConfig;
  onSaveConfig: (updated: AppConfig) => void;
  transactions: MuzakkiTransaction[];
  mustahiqList: Mustahiq[];
  distributions: DistributionRecord[];
  archives?: YearlyArchiveRecord[];
  currentMasjid?: MasjidAccount | null;
  onOpenUploadRecModal?: () => void;
  onPerformRollover?: (params: {
    newHijriYear: string;
    newMasehiYear: string;
    closedBy: string;
    notes?: string;
    resetMustahiqQuotas: boolean;
    autoDownloadBackup: boolean;
  }) => void;
  onDeleteArchive?: (archiveId: string) => void;
  onRestoreAllData: (data: {
    config: AppConfig;
    transactions: MuzakkiTransaction[];
    mustahiqList: Mustahiq[];
    distributions: DistributionRecord[];
  }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSaveConfig,
  transactions,
  mustahiqList,
  distributions,
  archives = [],
  currentMasjid,
  onOpenUploadRecModal,
  onPerformRollover,
  onDeleteArchive,
  onRestoreAllData,
}) => {
  const [formData, setFormData] = useState<AppConfig>(() => ({
    ...config,
    skKemenagTiers: config.skKemenagTiers && config.skKemenagTiers.length > 0
      ? config.skKemenagTiers
      : DEFAULT_SK_TIERS,
    fitrahRiceOptions: config.fitrahRiceOptions && config.fitrahRiceOptions.length > 0
      ? config.fitrahRiceOptions
      : [2.5, 2.7, 2.8, 3.0, 3.5],
  }));

  React.useEffect(() => {
    setFormData(config);
  }, [config]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Multi-year Rollover & Archive state
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<YearlyArchiveRecord | null>(null);
  const [archiveToDelete, setArchiveToDelete] = useState<YearlyArchiveRecord | null>(null);
  const [showEduModal, setShowEduModal] = useState<boolean>(false);
  const [rolloverSuccessNotice, setRolloverSuccessNotice] = useState<string | null>(null);

  const handleDownloadArchiveJson = (arc: YearlyArchiveRecord) => {
    const blob = new Blob([JSON.stringify(arc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arsip_Zakat_${arc.configSnapshot.organizationName.replace(/\s+/g, '_')}_${arc.hijriYear.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteRollover = (params: {
    newHijriYear: string;
    newMasehiYear: string;
    closedBy: string;
    notes?: string;
    resetMustahiqQuotas: boolean;
    autoDownloadBackup: boolean;
  }) => {
    if (params.autoDownloadBackup) {
      const backupObj = {
        version: '2.0',
        type: 'YEARLY_ARCHIVE_SNAPSHOT',
        exportedAt: new Date().toISOString(),
        closedBy: params.closedBy,
        period: `${config.hijriYear} / ${config.masehiYear}`,
        config,
        transactions,
        mustahiqList,
        distributions,
      };
      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cadangan_Tutup_Buku_${config.organizationName.replace(/\s+/g, '_')}_${config.hijriYear.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    onPerformRollover?.(params);
    setRolloverSuccessNotice(`Alhamdulillah! Tutup buku periode ${config.hijriYear} berhasil. Posko kini siap beroperasi untuk periode ${params.newHijriYear} / ${params.newMasehiYear}!`);
    setTimeout(() => setRolloverSuccessNotice(null), 6000);
  };

  // New tier inline form state
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierRice, setNewTierRice] = useState('');
  const [newTierPrice, setNewTierPrice] = useState<number>(45000);
  const [newTierDesc, setNewTierDesc] = useState('');

  // New rice preset inline state
  const [newRicePreset, setNewRicePreset] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Tier management helpers
  const handleUpdateTierPrice = (tierId: string, price: number) => {
    const updated = formData.skKemenagTiers.map((t) =>
      t.id === tierId ? { ...t, pricePerSoulRp: price } : t
    );
    setFormData({ ...formData, skKemenagTiers: updated });
  };

  const handleUpdateTierRiceType = (tierId: string, riceType: string) => {
    const updated = formData.skKemenagTiers.map((t) =>
      t.id === tierId ? { ...t, riceType } : t
    );
    setFormData({ ...formData, skKemenagTiers: updated });
  };

  const handleDeleteTier = (tierId: string) => {
    if (formData.skKemenagTiers.length <= 1) {
      alert('Minimal harus ada 1 kategori zakat fitrah uang tunai.');
      return;
    }
    const updated = formData.skKemenagTiers.filter((t) => t.id !== tierId);
    setFormData({ ...formData, skKemenagTiers: updated });
  };

  const handleAddNewTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) {
      alert('Nama kategori wajib diisi.');
      return;
    }
    const newTier: SkKemenagTier = {
      id: `tier-${Date.now()}`,
      name: newTierName.trim(),
      riceType: newTierRice.trim() || 'Beras Konsumsi',
      pricePerSoulRp: Number(newTierPrice) || 45000,
      description: newTierDesc.trim() || undefined,
    };
    setFormData({
      ...formData,
      skKemenagTiers: [...formData.skKemenagTiers, newTier],
    });
    setNewTierName('');
    setNewTierRice('');
    setNewTierPrice(45000);
    setNewTierDesc('');
    setShowAddTierModal(false);
  };

  const handleResetTiersToDefault = () => {
    if (confirm('Kembalikan daftar kategori SK Kemenag ke 4 kategori standar?')) {
      setFormData({
        ...formData,
        skKemenagTiers: DEFAULT_SK_TIERS,
        skKemenagReference: 'SK Bersama Kemenag & BAZNAS No. 1447 H / 2026 M',
      });
    }
  };

  // Rice presets helpers
  const handleAddRicePreset = () => {
    const val = parseFloat(newRicePreset);
    if (isNaN(val) || val <= 0) {
      alert('Masukkan angka takaran Kg yang valid.');
      return;
    }
    if (formData.fitrahRiceOptions.includes(val)) {
      alert(`Takaran ${val} Kg sudah ada dalam daftar preset.`);
      return;
    }
    const sorted = [...formData.fitrahRiceOptions, val].sort((a, b) => a - b);
    setFormData({ ...formData, fitrahRiceOptions: sorted });
    setNewRicePreset('');
  };

  const handleRemoveRicePreset = (presetToRemove: number) => {
    if (formData.fitrahRiceOptions.length <= 1) {
      alert('Minimal harus menyisakan 1 pilihan takaran.');
      return;
    }
    const filtered = formData.fitrahRiceOptions.filter((r) => r !== presetToRemove);
    setFormData({ ...formData, fitrahRiceOptions: filtered });
  };

  // Backup / Restore
  const handleBackupJson = () => {
    const backupObj = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      config: formData,
      transactions,
      mustahiqList,
      distributions,
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SimZakat_${formData.organizationName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && parsed.mustahiqList && parsed.config) {
          onRestoreAllData({
            config: parsed.config,
            transactions: parsed.transactions,
            mustahiqList: parsed.mustahiqList,
            distributions: parsed.distributions || [],
          });
          setFormData(parsed.config);
          alert('Alhamdulillah! Seluruh data backup berhasil dipulihkan.');
        } else {
          alert('Format berkas backup JSON tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (confirm('Apakah Anda yakin ingin memuat ulang data contoh? Data yang baru saja ditambahkan akan digantikan oleh data sampel bawaan.')) {
      onRestoreAllData({
        config: DEFAULT_CONFIG,
        transactions: INITIAL_TRANSACTIONS,
        mustahiqList: INITIAL_MUSTAHIQ,
        distributions: INITIAL_DISTRIBUTIONS,
      });
      setFormData(DEFAULT_CONFIG);
      alert('Data telah direset ke data sampel bawaan.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan Lembaga & Standar Zakat
        </h2>
        <p className="text-slate-600 text-sm mt-0.5">
          Sesuaikan identitas masjid/DKM, variasi takaran beras zakat fitrah, dan kategori uang tunai sesuai SK Kemenag / BAZNAS.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan lembaga dan tarif zakat berhasil disimpan!</span>
        </div>
      )}

      {rolloverSuccessNotice && (
        <div className="p-4 bg-emerald-950 text-emerald-100 border border-emerald-700/60 rounded-xl text-xs font-bold flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{rolloverSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRolloverSuccessNotice(null)}
            className="text-emerald-300 hover:text-white p-1 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identitas Lembaga */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              1. Identitas Masjid / Unit Pengumpul Zakat (UPZ)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Lembaga / Masjid
              </label>
              <input
                type="text"
                required
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sub-Judul / Keterangan Lembaga
              </label>
              <input
                type="text"
                value={formData.subTitle}
                onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Hijriah
                </label>
                <input
                  type="text"
                  value={formData.hijriYear}
                  onChange={(e) => setFormData({ ...formData, hijriYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Masehi
                </label>
                <input
                  type="text"
                  value={formData.masehiYear}
                  onChange={(e) => setFormData({ ...formData, masehiYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                />
              </div>
            </div>

            {/* Quick Rollover Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-800/40">
              <div className="space-y-0.5">
                <div className="font-extrabold text-xs text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Siklus Operasional Multi-Tahun</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Ingin menutup buku Ramadan/Syawal {formData.hijriYear} dan membuka lembaran periode baru?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRolloverModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-sm transition cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Tutup Buku &amp; Buka Tahun Baru</span>
              </button>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Sekretariat Masjid / Posko Amil
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telepon / Layanan Jamaah
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Ketua Panitia Amil Zakat
              </label>
              <input
                type="text"
                value={formData.headAmil}
                onChange={(e) => setFormData({ ...formData, headAmil: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekretaris / Bendahara UPZ
              </label>
              <input
                type="text"
                value={formData.treasurerName}
                onChange={(e) => setFormData({ ...formData, treasurerName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            {/* Legalitas & Surat Rekomendasi SK DKM / Kemenag */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span className="font-extrabold text-xs text-slate-800">
                    Status Legalitas &amp; Dokumen Rekomendasi (SK DKM / Kemenag / BAZNAS)
                  </span>
                </div>
                {currentMasjid?.status === 'active' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Terverifikasi Resmi Pusat
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" />
                    Menunggu Verifikasi Super Admin
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-slate-500 font-medium text-[11px]">Berkas Dokumen Rekomendasi:</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {currentMasjid?.recommendationLetterName || 'Belum ada berkas SK / rekomendasi yang dilampirkan'}
                  </div>
                </div>

                {onOpenUploadRecModal && (
                  <button
                    type="button"
                    onClick={onOpenUploadRecModal}
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{currentMasjid?.recommendationLetterName ? 'Ganti / Unggah Ulang Berkas' : 'Unggah Surat Rekomendasi / SK'}</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                <strong className="text-slate-800">Akses Seluruh Menu:</strong> Akun dengan status <em>Menunggu Verifikasi</em> <strong>TETAP BISA MENGGUNAKAN SELURUH MENU</strong> secara 100% (Kasir Penerimaan, Data Muzakki, Mustahiq, Penyaluran 8 Asnaf, Cetak Kuitansi, dan Laporan BAST) agar pelayanan jamaah tetap berjalan lancar.
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Variasi Takaran Beras Per Jiwa */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                2. Standar & Pilihan Takaran Beras Zakat Fitrah
              </h3>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Beras Konsumsi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Takaran Beras Masjid (Kg per Jiwa)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  max="10"
                  value={formData.fitrahRiceKgPerSoul}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fitrahRiceKgPerSoul: parseFloat(e.target.value) || 2.8,
                    })
                  }
                  className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">Kg / Jiwa</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Akan otomatis terisi sebagai pilihan awal saat membuka kasir Zakat Fitrah.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilihan Cepat (Preset) di Formulir Kasir
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {formData.fitrahRiceOptions.map((preset) => (
                  <span
                    key={preset}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold"
                  >
                    <span>{preset} Kg</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRicePreset(preset)}
                      className="text-amber-600 hover:text-rose-600 ml-1"
                      title="Hapus preset ini"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 3.2"
                  value={newRicePreset}
                  onChange={(e) => setNewRicePreset(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddRicePreset}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Takaran</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              Pedoman Fiqih Takaran Beras di Indonesia:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900">
              <li><strong>2,5 Kg</strong> (atau 3,5 liter): Takaran sha' minimal standar umum di Indonesia.</li>
              <li><strong>2,7 - 2,8 Kg</strong>: Takaran <em>ihtiyath</em> (kehati-hatian) yang banyak direkomendasikan MUI & BAZNAS daerah agar terhindar dari timbangan susut.</li>
              <li><strong>3,0 Kg</strong>: Standar ketentuan BAZNAS DKI Jakarta & Mazhab Syafi'i.</li>
              <li><strong>Kustom Lebih</strong>: Kasir zakat juga memiliki tombol input manual jika muzakki membawa lebih dari 3 Kg (misal 3.5 Kg, 4 Kg, dll.) sebagai penyempurna.</li>
            </ul>
          </div>
        </div>

        {/* Card 3: Kategori Zakat Fitrah Uang Berdasarkan SK Kemenag / BAZNAS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  3. Kategori Zakat Fitrah Uang Tunai (Berdasarkan SK Kemenag)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daftar tingkatan harga beras yang dikonsumsi masyarakat sesuai Surat Keputusan Kemenag / BAZNAS.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetTiersToDefault}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Reset Default SK
              </button>
              <button
                type="button"
                onClick={() => setShowAddTierModal(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori SK</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor / Judul Dokumen Acuan SK Kemenag & BAZNAS
            </label>
            <input
              type="text"
              value={formData.skKemenagReference || ''}
              onChange={(e) => setFormData({ ...formData, skKemenagReference: e.target.value })}
              placeholder="Contoh: SK Penetapan Besaran Zakat Fitrah Kemenag Kota No. 120/2026"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Table / List of SK Categories */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Nama Kategori</th>
                  <th className="py-2.5 px-3">Jenis / Merk Beras Konsumsi</th>
                  <th className="py-2.5 px-3 w-40">Tarif (Rp / Jiwa)</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.skKemenagTiers.map((tier) => (
                  <tr key={tier.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {tier.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={tier.riceType}
                        onChange={(e) => handleUpdateTierRiceType(tier.id, e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 font-bold text-emerald-800">
                        <span>Rp</span>
                        <input
                          type="number"
                          step="1000"
                          value={tier.pricePerSoulRp}
                          onChange={(e) =>
                            handleUpdateTierPrice(tier.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 rounded border border-slate-300 text-xs font-bold text-emerald-800"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {tier.description || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(tier.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Hapus kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal / Inline Add Tier */}
          {showAddTierModal && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Tambah Kategori Zakat Fitrah SK Baru
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Kategori Khusus (Organik)"
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jenis / Merk Beras
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Beras Merah / Beras Organik"
                    value={newTierRice}
                    onChange={(e) => setNewTierRice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tarif (Rp / Jiwa)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="Misal: 60000"
                    value={newTierPrice}
                    onChange={(e) => setNewTierPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Deskripsi / Catatan SK (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Penjelasan sasaran atau ketetapan SK"
                    value={newTierDesc}
                    onChange={(e) => setNewTierDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTierModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddNewTier}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                >
                  Simpan Kategori Baru
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Parameter Nisab Emas & Fidyah */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Coins className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              4. Parameter Nisab Zakat Maal & Tarif Fidyah
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Emas Terkini (Rp / Gram)
              </label>
              <input
                type="number"
                step="10000"
                value={formData.goldPricePerGram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goldPricePerGram: parseFloat(e.target.value) || 1450000,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold"
              />
              <span className="text-[11px] text-slate-400">
                Nisab Zakat Maal (85 gram) = <strong>{formatRupiah(85 * formData.goldPricePerGram)}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarif Fidyah (Rp / Hari Puasa)
              </label>
              <input
                type="number"
                step="5000"
                value={formData.fidyahRatePerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fidyahRatePerDay: parseFloat(e.target.value) || 30000,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold"
              />
              <span className="text-[11px] text-slate-400">Setara dengan porsi makan layak sehari</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan</span>
            </button>
          </div>
        </div>
      </form>

      {/* Card 5: Backup & Pemulihan Data (Anti Hilang) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h3 className="font-bold text-slate-900 text-sm">
            5. Backup & Pemulihan Data (Anti Hilang)
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          Seluruh data muzakki, mustahiq, transaksi, dan log penyaluran tersimpan aman di browser ini. Anda dapat mengunduh berkas cadangan JSON kapan saja untuk arsip atau dipindahkan ke komputer/laptop amil lainnya.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleBackupJson}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
            title="Cadangan file JSON browser"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh Cadangan (JSON)</span>
          </button>

          <label className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Pulihkan Dari JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreJson}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetSample}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Contoh</span>
          </button>
        </div>
      </div>

      {/* Card 6: Tutup Buku Tahunan & Riwayat Arsip Lintas Tahun */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              6. Tutup Buku Tahunan &amp; Riwayat Arsip Lintas Tahun
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsRolloverModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Tutup Buku Periode {config.hijriYear}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Mekanisme tutup buku tahunan memungkinkan posko zakat masjid menggunakan aplikasi SimZakat secara terus menerus lintas generasi. Saat tutup buku dilakukan, seluruh transaksi dan log penyaluran tahun ini dibukukan aman ke arsip, sementara Master Data Mustahiq tetap dipertahankan dan kasir posko siap menyambut tahun baru dengan angka 0.
        </p>

        {/* Educational FAQ Callout for Beginners */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-emerald-950">
                Masih Awam Tentang Tutup Buku?
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                Pelajari kapan waktu yang tepat, apa yang terjadi pada data muzakki/mustahiq, dan mengapa data Anda 100% aman tanpa takut hilang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEduModal(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-300" />
            <span>Buka Panduan Amil &amp; Tanya-Jawab</span>
          </button>
        </div>

        {/* Current Active Status Widget */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Periode Operasional Aktif Saat Ini</div>
            <div className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
              <span>{config.hijriYear} / {config.masehiYear}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Sedang Berjalan</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Tercatat: <strong>{transactions.length} transaksi muzakki</strong> • <strong>{distributions.length} log penyaluran</strong> • <strong>{mustahiqList.length} mustahiq</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRolloverModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span>Tutup Buku &amp; Buka Lembaran Baru</span>
          </button>
        </div>

        {/* Archives List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Daftar Riwayat Arsip Tahun-Tahun Sebelumnya ({archives.length})</span>
            </h4>
          </div>

          {archives.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              <Archive className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
              <div className="font-semibold text-slate-600">Belum ada arsip tahunan yang ditutup.</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Saat Ramadan/Syawal periode {config.hijriYear} berakhir, klik tombol "Tutup Buku" di atas untuk membuat arsip tahunan pertama.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {archives.map((arc) => (
                <div key={arc.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        Periode {arc.hijriYear} / {arc.masehiYear}
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {arc.transactionsCount} Trx
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Ditutup: {new Date(arc.closedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                      <span>•</span>
                      <span>Oleh: <strong>{arc.closedBy}</strong></span>
                      <span>•</span>
                      <span className="text-amber-700 font-bold">{formatKg(arc.summary.totalFitrahRiceKg)}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{formatRupiah(arc.summary.totalMoneyInRp)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedArchiveDetail(arc)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Lihat LPJ, riwayat muzakki, dan penyaluran asnaf tahun ini"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lihat Rincian &amp; LPJ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadArchiveJson(arc)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
                      title="Unduh file backup JSON arsip periode ini"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {onDeleteArchive && (
                      <button
                        type="button"
                        onClick={() => setArchiveToDelete(arc)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Hapus berkas arsip ini dari daftar riwayat"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rollover Modal */}
      <RolloverModal
        isOpen={isRolloverModalOpen}
        onClose={() => setIsRolloverModalOpen(false)}
        config={config}
        transactions={transactions}
        distributions={distributions}
        mustahiqList={mustahiqList}
        onConfirmRollover={handleExecuteRollover}
      />

      {/* Archive Detail Inspection Modal */}
      <ArchiveDetailModal
        isOpen={Boolean(selectedArchiveDetail)}
        archive={selectedArchiveDetail}
        onClose={() => setSelectedArchiveDetail(null)}
        onDownloadJson={handleDownloadArchiveJson}
      />

      {/* Delete Archive Confirmation Modal */}
      <DeleteArchiveModal
        isOpen={Boolean(archiveToDelete)}
        archive={archiveToDelete}
        onClose={() => setArchiveToDelete(null)}
        onConfirmDelete={() => {
          if (archiveToDelete) {
            const periodStr = `${archiveToDelete.hijriYear} / ${archiveToDelete.masehiYear}`;
            onDeleteArchive?.(archiveToDelete.id);
            setArchiveToDelete(null);
            setRolloverSuccessNotice(`Alhamdulillah! Arsip periode ${periodStr} telah berhasil dihapus dari daftar riwayat.`);
            setTimeout(() => setRolloverSuccessNotice(null), 4000);
          }
        }}
        onDownloadBackup={handleDownloadArchiveJson}
      />

      {/* Educational Guide Modal for Beginners */}
      <TutupBukuEduModal
        isOpen={showEduModal}
        onClose={() => setShowEduModal(false)}
      />
    </div>
  );
};
