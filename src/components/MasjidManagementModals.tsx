import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  ArrowUpRight, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Save, 
  Plus, 
  Coins, 
  Wheat, 
  Users, 
  ShieldCheck,
  Check,
  FileText,
  Download,
  FileCheck
} from 'lucide-react';
import { MasjidAccount } from '../types/auth';
import { formatKg, formatRupiah } from '../utils/helpers';
import { generateSuratRekomendasiWord } from '../utils/wordTemplateGenerator';

// =============================================================================
// 1. MODAL DETAIL & KONTAK MASJID
// =============================================================================
interface MasjidDetailModalProps {
  isOpen: boolean;
  masjid: MasjidAccount | null;
  onClose: () => void;
  onOpenPosko: (masjid: MasjidAccount) => void;
  onUpdateStatus: (masjidId: string, status: 'active' | 'pending_verification' | 'suspended') => void;
  onEdit: (masjid: MasjidAccount) => void;
}

export const MasjidDetailModal: React.FC<MasjidDetailModalProps> = ({
  isOpen,
  masjid,
  onClose,
  onOpenPosko,
  onUpdateStatus,
  onEdit,
}) => {
  if (!isOpen || !masjid) return null;

  // Format phone for direct WhatsApp link (e.g. 0812... -> 62812...)
  const cleanPhone = masjid.contactPhone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const waGreeting = encodeURIComponent(
    `Assalamu'alaikum Warahmatullahi Wabarakatuh, Ustadz/Bapak ${masjid.leadName}.\n\nKami dari Administrator Platform SimZakat Pusat ingin mengonfirmasi terkait posko zakat ${masjid.name}.`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waGreeting}`;

  const totalDana = (masjid.totalFitrahCashRp || 0) + (masjid.totalMaalRp || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-slate-950/70 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white">{masjid.name}</h3>
                {masjid.status === 'active' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aktif
                  </span>
                )}
                {masjid.status === 'pending_verification' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                    <Clock className="w-3 h-3 text-amber-400" /> Menunggu Verifikasi
                  </span>
                )}
                {masjid.status === 'suspended' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-[10px]">
                    <AlertTriangle className="w-3 h-3 text-rose-400" /> Ditangguhkan
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{masjid.city}, {masjid.province || 'Indonesia'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          
          {/* Quick Actions Row */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-sm">Operasional & Posko Zakat</div>
              <div className="text-[11px] text-slate-400">Masuk sebagai pengurus DKM untuk melihat data kasir amil masjid ini</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPosko(masjid);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition cursor-pointer"
              >
                <span>Buka Posko Masjid</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(masjid);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Quick Status Switcher */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">Ubah Status Akun Lembaga:</span>
              <span className="text-[11px] text-slate-400 font-mono">ID: {masjid.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateStatus(masjid.id, 'active')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                  masjid.status === 'active'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-600/50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aktif (Verified)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(masjid.id, 'pending_verification')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                  masjid.status === 'pending_verification'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-600/50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Verifikasi</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(masjid.id, 'suspended')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                  masjid.status === 'suspended'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-600/50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Ditangguhkan (Suspend)</span>
              </button>
            </div>
          </div>

          {/* Contact & Legal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Pengurus & Kontak DKM
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400">Ketua DKM / Penanggung Jawab</div>
                    <div className="font-bold text-white text-xs">{masjid.leadName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-400">Nomor Telepon / WhatsApp</div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-bold font-mono text-emerald-400 text-xs">{masjid.contactPhone}</span>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400">Email Resmi DKM</div>
                    <div className="font-mono text-slate-300 text-xs">{masjid.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Alamat & Periode Hijriyah
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400">Alamat Lengkap</div>
                    <div className="text-slate-200 text-xs leading-relaxed">{masjid.address}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{masjid.city}, {masjid.province || 'Indonesia'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400">Tahun Zakat Aktif & Terdaftar</div>
                    <div className="text-slate-200 text-xs font-bold">
                      {masjid.hijriYear || '1447 H'} / {masjid.masehiYear || '2026 M'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Bergabung: {new Date(masjid.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* PEDOMAN & CHECKLIST KRITERIA KHUSUS VERIFIKASI (STANDAR BAZNAS & UU NO. 23/2011) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-xs">
                  5 Kriteria Khusus Verifikasi Lembaga (SOP Regulasi BAZNAS &amp; Kemenag)
                </span>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">Pedoman Super Admin</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">1. Keberadaan Fisik &amp; Domisili Lembaga:</span>
                  <span className="text-slate-400 ml-1">Masjid/mushalla memiliki bangunan fisik dan domisili riil di {masjid.city}, {masjid.province || 'Indonesia'} (bukan fiktif).</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">2. Legalitas Kepengurusan DKM / UPZ:</span>
                  <span className="text-slate-400 ml-1">Memiliki SK DKM sah dari Kelurahan/KUA/Kemenag atau SK Unit Pengumpul Zakat (UPZ) resmi dari BAZNAS Kabupaten/Kota.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">3. Identitas Penanggung Jawab &amp; No. WhatsApp Aktif:</span>
                  <span className="text-slate-400 ml-1">Ketua DKM / Amil ({masjid.leadName}) dapat dihubungi melalui nomor resmi {masjid.contactPhone}.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">4. Rekening Resmi Atas Nama Lembaga (Bukan Pribadi):</span>
                  <span className="text-slate-400 ml-1">Penerimaan zakat/infaq via transfer dan QRIS wajib menggunakan rekening atas nama Masjid/DKM demi menjaga amanah umat.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">5. Kepatuhan Fiqih Penyaluran 8 Asnaf:</span>
                  <span className="text-slate-400 ml-1">Lembaga berkomitmen menyalurkan zakat fitrah &amp; maal hanya kepada golongan 8 asnaf yang berhak (QS. At-Taubah: 60) dan tidak dialihkan.</span>
                </div>
              </div>
            </div>

            {/* DOKUMEN REKOMENDASI / SK PENUGASAN DKM */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Status Berkas Surat Rekomendasi:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    generateSuratRekomendasiWord({
                      namaMasjid: masjid.name,
                      alamatMasjid: masjid.address,
                      kotaMasjid: masjid.city,
                      namaKetuaDkm: masjid.leadName,
                      nomorHpKetua: masjid.contactPhone,
                      namaPetugasAmil: masjid.leadName,
                      tahunHijriyah: masjid.hijriYear,
                      tahunMasehi: masjid.masehiYear,
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Unduh draft surat rekomendasi Word khusus masjid ini untuk dikirimkan ke pengurus DKM"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh Template Word (.doc)</span>
                </button>
              </div>

              {masjid.recommendationLetterName ? (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-[11px] truncate">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold truncate">{masjid.recommendationLetterName}</span>
                  </div>
                  {masjid.recommendationLetterData && (
                    <a
                      href={masjid.recommendationLetterData}
                      download={masjid.recommendationLetterName}
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh Berkas</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  Belum ada berkas rekomendasi terunggah. Anda dapat mengirimkan template Word di atas kepada Ketua DKM melalui WhatsApp untuk diisi dan dicap resmi.
                </div>
              )}
            </div>
          </div>

          {/* ZISWAF Statistics Box */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-3">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Statistik Penghimpunan ZISWAF 1447 H</span>
              <span className="text-emerald-400 font-bold">{masjid.totalTransactions || 0} Transaksi</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Jiwa Muzakki</div>
                <div className="font-black text-base text-emerald-400 mt-1">{masjid.totalMuzakkiSouls || 0} Jiwa</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Beras Fitrah</div>
                <div className="font-black text-base text-amber-400 mt-1">{formatKg(masjid.totalFitrahRiceKg || 0)}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Total Kas Masuk</div>
                <div className="font-black text-sm text-teal-300 mt-1">{formatRupiah(totalDana)}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Mustahiq Terdata</div>
                <div className="font-black text-base text-purple-400 mt-1">{masjid.totalMustahiqCount || 0} Orang</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

// =============================================================================
// 2. MODAL EDIT DATA MASJID
// =============================================================================
interface MasjidEditModalProps {
  isOpen: boolean;
  masjid: MasjidAccount | null;
  onClose: () => void;
  onSave: (updated: Partial<MasjidAccount> & { id: string }) => void;
}

export const MasjidEditModal: React.FC<MasjidEditModalProps> = ({
  isOpen,
  masjid,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    leadName: '',
    contactPhone: '',
    email: '',
    city: '',
    province: '',
    address: '',
    status: 'active' as 'active' | 'pending_verification' | 'suspended',
  });

  useEffect(() => {
    if (masjid) {
      setFormData({
        name: masjid.name || '',
        leadName: masjid.leadName || '',
        contactPhone: masjid.contactPhone || '',
        email: masjid.email || '',
        city: masjid.city || '',
        province: masjid.province || '',
        address: masjid.address || '',
        status: masjid.status || 'active',
      });
    }
  }, [masjid]);

  if (!isOpen || !masjid) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: masjid.id,
      name: formData.name,
      leadName: formData.leadName,
      contactPhone: formData.contactPhone,
      email: formData.email,
      city: formData.city,
      province: formData.province,
      address: formData.address,
      status: formData.status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="p-6 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Edit Data Lembaga Masjid</h3>
              <p className="text-xs text-slate-400">ID: {masjid.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div>
            <label className="block font-bold text-slate-300 mb-1">Nama Masjid / Lembaga *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Ketua DKM / Penanggung Jawab *</label>
              <input
                type="text"
                required
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="text"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Email Resmi</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Status Aktivasi Akun</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
              >
                <option value="active">Aktif (Verified)</option>
                <option value="pending_verification">Menunggu Verifikasi</option>
                <option value="suspended">Ditangguhkan (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Kota / Kabupaten *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Provinsi</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

// =============================================================================
// 3. MODAL DAFTARKAN MASJID BARU
// =============================================================================
interface MasjidAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newMasjid: Omit<MasjidAccount, 'id'>) => void;
}

export const MasjidAddModal: React.FC<MasjidAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    leadName: '',
    contactPhone: '',
    email: '',
    city: '',
    province: 'Jawa Barat',
    address: '',
    status: 'active' as 'active' | 'pending_verification' | 'suspended',
    hijriYear: '1447 H',
    masehiYear: '2026 M',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    onAdd({
      name: formData.name,
      slug,
      leadName: formData.leadName,
      contactPhone: formData.contactPhone,
      email: formData.email,
      city: formData.city,
      province: formData.province,
      address: formData.address,
      status: formData.status,
      hijriYear: formData.hijriYear,
      masehiYear: formData.masehiYear,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="p-6 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Daftarkan Lembaga / Masjid Baru</h3>
              <p className="text-xs text-slate-400">Pendaftaran langsung oleh Super Admin (Owner)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div>
            <label className="block font-bold text-slate-300 mb-1">Nama Masjid / Yayasan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Masjid Jami' Al-Ikhlas"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Ketua DKM / Amil *</label>
              <input
                type="text"
                required
                placeholder="Nama Ustadz / Ketua Panitia"
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Nomor WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="081234567890"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Email Resmi</label>
              <input
                type="email"
                required
                placeholder="dkm@masjid.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Status Awal</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
              >
                <option value="active">Langsung Aktif (Verified)</option>
                <option value="pending_verification">Menunggu Verifikasi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Kota / Kabupaten *</label>
              <input
                type="text"
                required
                placeholder="Bandung, Jakarta, Surabaya, dll"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Provinsi</label>
              <input
                type="text"
                placeholder="Jawa Barat"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Alamat Lengkap</label>
            <textarea
              rows={2}
              placeholder="Jl. Raya Utama No. 123..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Lembaga</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

// =============================================================================
// 4. MODAL KONFIRMASI AKSI (SUSPEND / RESET / DELETE)
// =============================================================================
interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: 'rose' | 'emerald' | 'purple' | 'amber';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  confirmColor = 'rose',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const colorStyles = {
    rose: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 text-white',
    purple: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30 text-white',
    amber: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 text-white',
  }[confirmColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">{title}</h3>
            <p className="text-xs text-slate-400">Konfirmasi Tindakan Manajemen</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 font-bold rounded-xl text-xs shadow-lg transition cursor-pointer ${colorStyles}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
