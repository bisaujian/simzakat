import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Download, 
  Upload, 
  FileCheck 
} from 'lucide-react';
import { RegisterMasjidPayload } from '../types/auth';
import { generateSuratRekomendasiWord } from '../utils/wordTemplateGenerator';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (payload: RegisterMasjidPayload) => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [masjidName, setMasjidName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [province, setProvince] = useState('DKI Jakarta');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hijriYear, setHijriYear] = useState('1447 H');
  const [masehiYear, setMasehiYear] = useState('2026 M');

  // Dokumen Rekomendasi & Legalitas DKM
  const [recommendationFileName, setRecommendationFileName] = useState('');
  const [recommendationFileData, setRecommendationFileData] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    generateSuratRekomendasiWord({
      namaMasjid: masjidName || 'Masjid Al-Muhajirin',
      alamatMasjid: address || 'Jl. Utama',
      kotaMasjid: city,
      namaKetuaDkm: leadName || 'Ustadz Ahmad Fauzi',
      nomorHpKetua: contactPhone || '081234567890',
      namaPetugasAmil: leadName || 'Petugas Amil',
      tahunHijriyah: hijriYear,
      tahunMasehi: masehiYear,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecommendationFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setRecommendationFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!masjidName.trim() || !leadName.trim() || !contactPhone.trim() || !username.trim() || !password.trim()) {
      setErrorMessage('Mohon lengkapi semua kolom wajib bertanda bintang (*).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Kata sandi minimal 4 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await onRegisterSuccess({
        masjidName,
        leadName,
        address: address || `Jl. Utama ${city}`,
        city,
        province,
        contactPhone,
        email: email || `${username}@simzakat.id`,
        username,
        password,
        hijriYear,
        masehiYear,
        recommendationLetterName: recommendationFileName || undefined,
        recommendationLetterData: recommendationFileData || undefined,
      });

      if (res.success) {
        setSuccessMessage('Alhamdulillah! Akun Masjid Anda berhasil didaftarkan. Mengalihkan ke Posko Amil...');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Gagal mendaftarkan akun masjid.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header - Fixed & Always Visible */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-emerald-200 shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black tracking-tight leading-tight">
                Pendaftaran Akun Masjid &amp; Posko Amil
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 mt-0.5">
                Mulai kelola Zakat Fitrah, Maal &amp; Mustahiq secara digital &amp; terpercaya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable internally */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-7 space-y-5 text-slate-800">
          
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Data Masjid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> 1. Informasi Lembaga / Masjid / DKM
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Masjid / Musholla / UPZ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Masjid Raya Al-Barokah"
                  value={masjidName}
                  onChange={(e) => setMasjidName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota / Kabupaten <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bandung"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jawa Barat"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Masjid / Posko
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Barokah No. 12 RT 04/RW 02 Kelurahan Suka Maju"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Penanggung Jawab & Akun Login */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 2. Penanggung Jawab & Akun Login (Admin DKM)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Ketua DKM / Kepala Amil <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadz Ahmad Fauzi"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081234567890"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Lembaga / Pribadi
                </label>
                <input
                  type="email"
                  placeholder="dkm@masjid.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: dkm_barokah"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 4 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi di atas"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Surat Rekomendasi & Legalitas UPZ/DKM */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" /> 3. Surat Rekomendasi &amp; Mandat DKM (Diprioritaskan)
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Sebagai syarat verifikasi resmi keabsahan panitia zakat (Standar BAZNAS &amp; UU Zakat No. 23/2011).
                </p>
              </div>

              {/* Tombol Unduh Template Word */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-center"
                title="Unduh draft resmi Microsoft Word (.doc) yang dapat langsung diedit nama masjid dan pengurusnya"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Word (.doc)</span>
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200/90 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Unggah Surat Rekomendasi / SK DKM yang Telah Ditandatangani &amp; Dicap:
              </label>

              <div className="flex items-center gap-3">
                <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>{recommendationFileName ? 'Ganti Berkas' : 'Pilih Berkas (PDF/DOC/Foto)'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {recommendationFileName ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex-1 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{recommendationFileName}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Belum ada berkas dipilih (bisa disusulkan setelah mendaftar).
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Mendaftarkan Akun...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Daftarkan Masjid Sekarang</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            Sudah memiliki akun terdaftar?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
            >
              Masuk ke Posko Amil di Sini
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
