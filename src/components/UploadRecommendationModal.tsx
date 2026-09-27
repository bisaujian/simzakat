import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle,
  Building2,
  Clock
} from 'lucide-react';
import { MasjidAccount } from '../types/auth';

interface UploadRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  masjid: MasjidAccount | null;
  onSaveFile: (fileName: string, fileData?: string) => void;
}

export const UploadRecommendationModal: React.FC<UploadRecommendationModalProps> = ({
  isOpen,
  onClose,
  masjid,
  onSaveFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [docNotes, setDocNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !masjid) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMsg(null);
    if (file) {
      // Limit 10MB
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran berkas maksimal 10 MB.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleDoc = (sampleName: string) => {
    setErrorMsg(null);
    setSelectedFile(null);
    setFileDataUrl('data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg==');
    setDocNotes(sampleName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const finalFileName = selectedFile?.name || docNotes.trim();
    if (!finalFileName) {
      setErrorMsg('Mohon pilih file dokumen atau masukkan nama/nomor surat rekomendasi.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      onSaveFile(finalFileName, fileDataUrl || undefined);
      setIsUploading(false);
      setSuccessMsg('Surat Rekomendasi / SK DKM berhasil diunggah. Super Admin akan meninjau dokumen ini.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Unggah Surat Rekomendasi / SK DKM</h3>
              <p className="text-xs text-emerald-300">{masjid.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Status info */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Status Saat Ini: Menunggu Verifikasi Super Admin.</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Surat Rekomendasi Kemenag, BAZNAS, atau SK Kepengurusan DKM Masjid berfungsi sebagai bukti legalitas keabsahan panitia zakat.
              </p>
            </div>
          </div>

          {/* Current file status */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Berkas Saat Ini:</span>
            <span className="font-bold text-slate-900 font-mono">
              {masjid.recommendationLetterName || 'Belum ada berkas terlampir'}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Berkas Dokumen (PDF, JPG, PNG, atau DOCX)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 text-center transition bg-slate-50/50 cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
              <div className="font-bold text-slate-700">
                {selectedFile ? selectedFile.name : 'Klik untuk memilih berkas dari komputer/HP Anda'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Format didukung: PDF, JPG, PNG, DOCX (Maksimal 10 MB)
              </p>
            </div>
          </div>

          {/* Manual document name or number if scanning is not yet available */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Atau Masukkan Nomor SK / Keterangan Dokumen
            </label>
            <input
              type="text"
              placeholder="Contoh: SK-DKM-04/BAZNAS/2026 atau Surat Rekomendasi KUA"
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
            />
          </div>

          {/* Quick Preset Buttons for Amil */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
              Opsi Cepat Simulasi Administrasi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleUseSampleDoc('SK_Kepengurusan_DKM_Tahun_1447H.pdf')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition cursor-pointer"
              >
                + Lampirkan SK DKM 1447 H
              </button>
              <button
                type="button"
                onClick={() => handleUseSampleDoc('Surat_Rekomendasi_BAZNAS_Kota.pdf')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition cursor-pointer"
              >
                + Lampirkan Rekomendasi BAZNAS
              </button>
            </div>
          </div>

          {/* Reassurance regarding Menu Access */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-900">Catatan Akses Seluruh Menu:</strong>
              <p className="mt-0.5 text-emerald-800">
                Akun yang berstatus <em>Menunggu Verifikasi</em> <strong>TETAP DAPAT MENGGUNAKAN SELURUH FITUR</strong> (Kasir Penerimaan, Buku Muzakki, Penyaluran 8 Asnaf, Cetak Kuitansi, dan Laporan BAST) tanpa ada batasan menu.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Menyimpan...' : 'Simpan Dokumen Rekomendasi'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
