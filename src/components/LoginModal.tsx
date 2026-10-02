import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldAlert, 
  Lock, 
  HelpCircle,
  Phone,
  Eye,
  EyeOff,
  MessageCircle,
  Building2
} from 'lucide-react';
import { LoginPayload } from '../types/auth';
import { LandingPageConfig } from '../types/landing';
import { authService, landingConfigService } from '../services/apiClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>;
  onSwitchToRegister: () => void;
  landingConfig?: LandingPageConfig;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSwitchToRegister,
  landingConfig,
}) => {
  // Mode: 'login' | 'forgot_password'
  const [modalMode, setModalMode] = useState<'login' | 'forgot_password'>('login');

  // Login Form States
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Anti-Spam / Anti-Bot Security CAPTCHA
  const [captchaNum1, setCaptchaNum1] = useState(3);
  const [captchaNum2, setCaptchaNum2] = useState(5);
  const [captchaInput, setCaptchaInput] = useState('');

  // Rate Limiting & Brute Force Lockout
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Forgot Password Flow States
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotUsername, setForgotUsername] = useState('');
  const [maskedContact, setMaskedContact] = useState('');
  const [accountOwnerName, setAccountOwnerName] = useState('');
  const [accountMasjidName, setAccountMasjidName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Generate new math CAPTCHA
  const refreshCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaInput('');
  };

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshCaptcha();
      setErrorMessage(null);
      setSuccessMessage(null);
      setModalMode('login');
      setForgotStep(1);
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (lockoutRemaining > 0) {
      timer = setInterval(() => {
        setLockoutRemaining((prev) => {
          if (prev <= 1) {
            setErrorMessage(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutRemaining]);

  // Resend OTP cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle Login Submit with Anti-Bot & Brute Force Defense
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Check if user is locked out due to brute force spam
    if (lockoutRemaining > 0) {
      setErrorMessage(`Sistem dalam mode proteksi anti-spam. Silakan tunggu ${lockoutRemaining} detik lagi.`);
      return;
    }

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Mohon masukkan username/email dan kata sandi.');
      return;
    }

    // 2. Validate Anti-Bot Math CAPTCHA
    const expectedSum = captchaNum1 + captchaNum2;
    if (parseInt(captchaInput.trim(), 10) !== expectedSum) {
      setErrorMessage(`Verifikasi keamanan tidak sesuai. Berapa hasil dari ${captchaNum1} + ${captchaNum2}?`);
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await onLogin({
        usernameOrEmail: usernameOrEmail.trim(),
        password,
      });

      if (res.success) {
        // Reset failed attempts on success
        setFailedAttempts(0);
        setLockoutRemaining(0);
        onClose();
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        refreshCaptcha();

        if (nextFailed >= 3) {
          // Lockout 30 seconds after 3 failed attempts
          setLockoutRemaining(30);
          setErrorMessage(
            'Terlalu banyak percobaan gagal (3x). Sistem mengaktifkan proteksi anti-spam selama 30 detik. Silakan tunggu atau gunakan fitur "Lupa Kata Sandi".'
          );
        } else {
          setErrorMessage(
            `${res.message || 'Login gagal. Periksa username dan password Anda.'} (Sisa kesempatan: ${3 - nextFailed}x)`
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD FLOW HANDLERS
  // ---------------------------------------------------------------------------
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotUsername.trim()) {
      setErrorMessage('Masukkan username atau email akun Anda.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await authService.requestPasswordReset(forgotUsername.trim());
      if (res.success) {
        setAccountOwnerName(res.accountName || '');
        setAccountMasjidName(res.masjidName || '');
        setMaskedContact(res.maskedContact || '');
        setPhoneRaw(res.phoneRaw || '');
        setVerificationCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotStep(2);
        setResendCooldown(60);
        setSuccessMessage(
          `Kode verifikasi 6-digit telah dikirimkan ke nomor WhatsApp terdaftar (${res.maskedContact}). Silakan masukkan kode di bawah.`
        );
      } else {
        setErrorMessage(res.message || 'Akun tidak ditemukan dalam sistem.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal memproses pemulihan kata sandi.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isForgotLoading) return;
    setIsForgotLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.requestPasswordReset(forgotUsername.trim());
      if (res.success) {
        setResendCooldown(60);
        setSuccessMessage('Kode verifikasi baru berhasil dikirimkan ulang. Periksa pesan WhatsApp / SMS Anda.');
      } else {
        setErrorMessage(res.message || 'Gagal mengirim ulang kode.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengirim ulang kode.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!verificationCode.trim() || verificationCode.trim().length < 6) {
      setErrorMessage('Masukkan 6 digit kode OTP verifikasi dengan lengkap.');
      return;
    }

    if (newPassword.length < 5) {
      setErrorMessage('Kata sandi baru minimal 5 karakter demi keamanan.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok. Periksa kembali.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await authService.resetPassword({
        usernameOrEmail: forgotUsername.trim(),
        verificationCode: verificationCode.trim(),
        newPassword,
      });

      if (res.success) {
        // Return to login mode with prefilled credentials
        setUsernameOrEmail(forgotUsername.trim());
        setPassword('');
        setModalMode('login');
        setForgotStep(1);
        setSuccessMessage('Alhamdulillah! Kata sandi baru berhasil disimpan. Silakan masuk menggunakan kata sandi baru Anda.');
        refreshCaptcha();
      } else {
        setErrorMessage(res.message || 'Kode verifikasi salah atau kedaluwarsa.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mereset kata sandi.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header - Fixed & Always Visible */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-emerald-200 shrink-0">
              {modalMode === 'login' ? <LogIn className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {modalMode === 'login' ? 'Masuk ke SimZakat' : 'Pemulihan Kata Sandi'}
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 mt-0.5">
                {modalMode === 'login' 
                  ? 'Portal Keamanan Pengurus & Amil Zakat' 
                  : 'Reset kata sandi akun admin masjid'}
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

        {/* Modal Body - Scrollable internally */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 text-slate-800">

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Lockout Warning Banner */}
          {lockoutRemaining > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-black text-sm">
                {lockoutRemaining}s
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Proteksi Anti-Spam Sedang Aktif
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Tombol login dikunci sementara demi keamanan server.
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW A: LOGIN FORM */}
          {/* =================================================================== */}
          {modalMode === 'login' ? (
            <>
              {/* Login Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username atau Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: owner atau admin_muhajirin"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    disabled={isLoading || lockoutRemaining > 0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setModalMode('forgot_password');
                        setForgotUsername(usernameOrEmail);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Lupa Kata Sandi?</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi akun"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || lockoutRemaining > 0}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* VERIFIKASI KEAMANAN & ANTI-SPAM (MATH CAPTCHA) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      Verifikasi Anti-Bot Keamanan:
                    </span>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
                      title="Ganti angka verifikasi"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Acak Ulang</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 bg-emerald-900 text-emerald-100 font-mono font-black text-sm rounded-xl tracking-wider select-none shadow-xs">
                      {captchaNum1} + {captchaNum2} = ?
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="Jawaban angka"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      disabled={isLoading || lockoutRemaining > 0}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || lockoutRemaining > 0}
                  className="w-full py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm shadow-md transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isLoading 
                      ? 'Memverifikasi...' 
                      : lockoutRemaining > 0 
                      ? `Terkunci (${lockoutRemaining}s)` 
                      : 'Masuk ke Aplikasi'}
                  </span>
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-1">
                Belum mendaftarkan masjid Anda?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  Daftar Akun Baru Sekarang
                </button>
              </div>
            </>
          ) : (
            // ===================================================================
            // VIEW B: FORGOT PASSWORD FLOW
            // ===================================================================
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setModalMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Masuk</span>
              </button>

              {forgotStep === 1 ? (
                // Step 1: Input Username/Email
                <form onSubmit={handleRequestResetCode} className="space-y-3.5">
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
                    <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-700" />
                      Lupa Kata Sandi Akun Admin?
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                      Masukkan username atau email resmi masjid Anda. Sistem akan memverifikasi akun dan mengirimkan kode otorisasi 6-digit.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username atau Email Terdaftar
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: admin_muhajirin atau dkm@almuhajirin.id"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      disabled={isForgotLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isForgotLoading ? 'Memeriksa Akun...' : 'Verifikasi Akun & Minta Kode PIN'}</span>
                  </button>
                </form>
              ) : (
                // Step 2: Input Code & New Password
                <form onSubmit={handleConfirmResetPassword} className="space-y-3.5">
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/70">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Akun Terverifikasi</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-mono font-bold">
                        Aktif
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {accountOwnerName}
                      </div>
                      {accountMasjidName && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{accountMasjidName}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-emerald-900 font-medium flex items-center gap-1 pt-0.5">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        <span>Nomor WhatsApp Pemulihan: <strong className="font-mono">{maskedContact}</strong></span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/70 flex flex-col gap-1.5">
                      <div className="text-[11px] text-slate-600 leading-relaxed">
                        Kode otorisasi 6-digit telah dikirimkan ke WhatsApp Anda. Masukkan 6 digit kode tersebut di bawah untuk melanjutkan penggantian kata sandi.
                      </div>
                      {(() => {
                        const cfg = landingConfig || landingConfigService.getConfig();
                        const rawWa = (cfg.contactWhatsApp || '081299887766').replace(/[^0-9]/g, '');
                        const cleanWa = rawWa.startsWith('0') 
                          ? '62' + rawWa.slice(1) 
                          : (rawWa.startsWith('62') ? rawWa : '62' + rawWa);
                        const displayWa = cfg.contactWhatsApp || 'Super Admin';
                        return (
                          <a
                            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                              `Assalamu'alaikum Super Admin SimZakat. Saya pengurus ${accountOwnerName} (${accountMasjidName || 'DKM'}), memohon bantuan kode verifikasi reset kata sandi akun username: ${forgotUsername}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center justify-between transition cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Butuh bantuan? Chat Super Admin di WhatsApp ({displayWa})</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold underline">Hubungi &rarr;</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Kode Verifikasi Pemulihan (6 Digit)
                      </label>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isForgotLoading}
                        onClick={handleResendCode}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim Ulang Kode OTP'}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9A-Za-z]/g, '').slice(0, 6))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center font-mono font-black text-lg tracking-widest focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-slate-50 focus:bg-white transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Masukkan 6 digit angka yang diterima melalui WhatsApp / SMS resmi pengurus.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi Baru (Minimal 5 Karakter)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Masukkan kata sandi baru yang aman"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ulangi Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Ketik ulang kata sandi baru"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="flex-1 py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-emerald-200" />
                      <span>{isForgotLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
