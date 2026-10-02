import React, { useState } from 'react';
import { 
  Heart, 
  X, 
  Copy, 
  Check, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  HelpCircle, 
  MessageCircle,
  Plus,
  RotateCcw
} from 'lucide-react';
import { LandingPageConfig } from '../types/landing';
import { landingConfigService } from '../services/apiClient';
import { formatRupiah, formatThousands, parseThousands, terbilangRupiah } from '../utils/helpers';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  masjidName?: string;
  landingConfig?: LandingPageConfig;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  masjidName,
  landingConfig,
}) => {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedNominal, setSelectedNominal] = useState<number | null>(100000);
  const [customInputStr, setCustomInputStr] = useState<string>('100.000');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [showQRIS, setShowQRIS] = useState<boolean>(false);

  const cfg = landingConfig || landingConfigService.getConfig();

  if (!isOpen) return null;

  const handleCopy = (text: string, bankId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankId);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handlePresetSelect = (nominal: number) => {
    setSelectedNominal(nominal);
    setCustomInputStr(formatThousands(nominal));
    setIsCustomMode(false);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseThousands(rawVal);
    setSelectedNominal(parsed > 0 ? parsed : null);
    setCustomInputStr(parsed > 0 ? formatThousands(parsed) : '');
    setIsCustomMode(true);
  };

  const handleAddQuickAmount = (amount: number) => {
    const current = selectedNominal || 0;
    const nextVal = current + amount;
    setSelectedNominal(nextVal);
    setCustomInputStr(formatThousands(nextVal));
    setIsCustomMode(true);
  };

  const handleResetAmount = () => {
    setSelectedNominal(50000);
    setCustomInputStr(formatThousands(50000));
    setIsCustomMode(false);
  };

  const donationAccounts = [
    {
      id: 'bsi',
      bankName: cfg.bsiBankName || 'Bank Syariah Indonesia (BSI)',
      accountNumber: cfg.bsiAccountNumber || '7234567890',
      accountHolder: cfg.bsiAccountHolder || 'PENGEMBANGAN SIMZAKAT DAKWAH',
      color: 'border-teal-500 bg-teal-50/50',
      badge: 'Utama (Syariah)',
    },
    {
      id: 'bca',
      bankName: cfg.bcaBankName || 'Bank Central Asia (BCA)',
      accountNumber: cfg.bcaAccountNumber || '8831234567',
      accountHolder: cfg.bcaAccountHolder || 'TIM OPERASIONAL SIMZAKAT',
      color: 'border-blue-500 bg-blue-50/50',
      badge: 'Transfer Bank',
    },
  ];

  const handleConfirmWA = () => {
    const phone = (cfg.contactWhatsApp || '081234567890').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? `62${phone.slice(1)}` : phone;
    const nominalText = selectedNominal && selectedNominal > 0 ? formatRupiah(selectedNominal) : 'Sukarela';
    const text = `Assalamu'alaikum Admin Pengembang SimZakat. Kami dari ${masjidName || 'Panitia Zakat'} ingin konfirmasi infaq dakwah sukarela sebesar ${nominalText} untuk operasional server & pengembangan SimZakat. Jazakumullah khairan.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header with Warm Islamic Emerald Gradient - Fixed */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-6 relative overflow-hidden border-b border-white/10 z-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 stroke-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
                  {cfg.donationSubtitle || 'Khidmah Dakwah & Sedekah Jariyah'}
                </div>
                <h3 className="text-base sm:text-xl font-black tracking-tight text-white mt-1 leading-tight">
                  {cfg.donationTitle || 'Infaq Operasional SimZakat'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
              title="Tutup dialog"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-2 sm:mt-2.5 leading-relaxed relative z-10">
            {masjidName ? `Ahlan wa Sahlan, Pengurus ${masjidName}. ` : 'Ahlan wa Sahlan. '}
            {cfg.donationDescription || 'Aplikasi SimZakat disediakan 100% Gratis tanpa biaya lisensi agar setiap masjid dan musholla dapat mengelola zakat secara amanah dan profesional.'}
          </p>
        </div>

        {/* Content Body - Scrollable internally */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5 text-slate-800">
          
          {/* Mission & Purpose Note */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 space-y-1.5 sm:space-y-2">
            <div className="font-extrabold flex items-center gap-2 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{cfg.donationReasonTitle || 'Mengapa Infaq Pengembangan Ini Dibutuhkan?'}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px] sm:text-[11.5px]">
              {cfg.donationReasonText || 'Untuk menjaga kelangsungan sistem, penyediaan server VPS berkecepatan tinggi, pemeliharaan basis data MySQL, sertifikat keamanan SSL, dan pembaruan fiqih zakat berkala. Amil dapat menyisihkan donasi sukarela ini dari bagian hak amil / infaq operasional masjid sesuai kerelaan.'}
            </p>
          </div>

          {/* Nominal Selection: Preset & Custom Input */}
          <div className="space-y-2.5 p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Pilih atau Masukkan Nominal Infaq Sukarela:
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                Bebas &amp; Seikhlasnya
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {[25000, 50000, 100000, 250000, 500000].map((nominal) => {
                const isSelected = !isCustomMode && selectedNominal === nominal;
                return (
                  <button
                    key={nominal}
                    type="button"
                    onClick={() => handlePresetSelect(nominal)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Rp {(nominal / 1000).toLocaleString('id-ID')}rb
                  </button>
                );
              })}
            </div>

            {/* Custom Input (Bisa Masukan Sendiri Bebas) */}
            <div className="pt-1.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span>Atau Masukkan Nominal Kustom Sendiri:</span>
                </span>
                {isCustomMode && (
                  <button
                    type="button"
                    onClick={handleResetAmount}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                  Rp
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customInputStr}
                  onChange={handleCustomInputChange}
                  placeholder="Ketik nominal bebas (contoh: 75.000)"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm sm:text-base font-extrabold transition outline-hidden ${
                    isCustomMode
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-white text-emerald-950'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>

              {/* Quick Increment Chips for Mobile & Quick Taps */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-medium mr-1">Tambah Cepat:</span>
                {[10000, 25000, 50000, 100000].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleAddQuickAmount(inc)}
                    className="px-2 py-0.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 transition cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5 text-emerald-600" />
                    <span>{(inc / 1000)}rb</span>
                  </button>
                ))}
              </div>

              {/* Terbilang & Summary Display */}
              {selectedNominal && selectedNominal > 0 ? (
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Infaq yang akan disalurkan:</span>
                    <span className="font-black text-emerald-900 text-sm">{formatRupiah(selectedNominal)}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 italic mt-0.5">
                    "{terbilangRupiah(selectedNominal)}"
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-amber-700 italic">
                  * Silakan masukkan nominal infaq sukarela seikhlasnya.
                </div>
              )}
            </div>
          </div>

          {/* Bank Accounts & QRIS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Nomor Rekening Donasi Resmi:</span>
              <button
                type="button"
                onClick={() => setShowQRIS(!showQRIS)}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQRIS ? 'Tampilkan Rekening' : 'Tampilkan QRIS'}</span>
              </button>
            </div>

            {!showQRIS ? (
              <div className="space-y-2">
                {donationAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border ${acc.color} flex items-center justify-between gap-2.5 sm:gap-3`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">{acc.bankName}</span>
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold bg-white text-slate-700 border border-slate-200">
                          {acc.badge}
                        </span>
                      </div>
                      <div className="font-mono text-sm sm:text-base font-bold text-emerald-900 tracking-wider">
                        {acc.accountNumber}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase truncate">
                        a.n. {acc.accountHolder}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(acc.accountNumber, acc.id)}
                      className="px-2.5 sm:px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-2xs shrink-0 cursor-pointer"
                      title="Salin nomor rekening"
                    >
                      {copiedBank === acc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 text-center space-y-3">
                <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center justify-center shadow-md overflow-hidden relative">
                  {cfg.qrisImageUrl ? (
                    <img 
                      src={cfg.qrisImageUrl} 
                      alt="QRIS Donasi SimZakat" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-3">
                      <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-700" />
                      <span className="text-xs font-bold text-slate-700">Scan QRIS Nasional</span>
                      <span className="text-[10px] text-slate-500">QRIS Resmi SimZakat</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] sm:text-xs font-bold text-slate-800">
                    Mendukung BSI Mobile, BCA, Livin Mandiri, GoPay, OVO, Dana &amp; ShopeePay
                  </div>
                  {cfg.qrisImageUrl ? (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Buka aplikasi mobile banking atau e-wallet Anda, lalu arahkan kamera ke barcode QRIS di atas.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500">
                      (Gambar QRIS kustom dapat diunggah melalui <strong>Dashboard Owner &gt; Pengaturan Landing &amp; Infaq</strong>)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reassurance text */}
          <div className="text-[11px] text-slate-500 text-center pt-0.5">
            Infaq ini bersifat <strong>sukarela (tidak mengikat)</strong>. Seluruh fitur utama SimZakat tetap dapat digunakan tanpa batasan apapun.
          </div>

          {/* Action Button to Continue to Posko & WA Confirmation */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lanjutkan ke Posko Zakat</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {cfg.contactWhatsApp && (
              <button
                type="button"
                onClick={handleConfirmWA}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>Konfirmasi Infaq via WhatsApp ({cfg.contactWhatsApp})</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
