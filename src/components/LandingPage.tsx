import React, { useState } from 'react';
import { 
  Building2, 
  Receipt, 
  Scale, 
  Calculator, 
  FileText, 
  Users, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Heart,
  HelpCircle,
  ShieldCheck,
  Check,
  X as XIcon,
  Coins,
  Wheat,
  Share2,
  Printer,
  MessageCircle,
  LogIn
} from 'lucide-react';
import { MasjidAccount } from '../types/auth';
import { LandingPageConfig } from '../types/landing';
import { landingConfigService } from '../services/apiClient';
import { formatKg, formatRupiah } from '../utils/helpers';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onExploreDemo: () => void;
  onOpenDonationModal?: () => void;
  masjidsList: MasjidAccount[];
  landingConfig?: LandingPageConfig;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onExploreDemo,
  onOpenDonationModal,
  masjidsList,
  landingConfig
}) => {
  const cfg = landingConfig || landingConfigService.getConfig();

  // Price tier default selection
  const defaultTierPrice = cfg.simulatorTiers?.[1]?.price || cfg.simulatorTiers?.[0]?.price || 45000;

  // Interactive mini calculator states for landing page preview
  const [calcSoulCount, setCalcSoulCount] = useState<number>(4);
  const [calcPricePerSoul, setCalcPricePerSoul] = useState<number>(defaultTierPrice);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Platform stats
  const totalMasjids = masjidsList.length;
  const totalTransactions = masjidsList.reduce((acc, m) => acc + (m.totalTransactions || 0), 0);
  const totalRiceKg = masjidsList.reduce((acc, m) => acc + (m.totalFitrahRiceKg || 0), 0);
  const totalDana = masjidsList.reduce((acc, m) => acc + (m.totalFitrahCashRp || 0) + (m.totalMaalRp || 0), 0);

  const defaultKg = cfg.simulatorDefaultKg || 2.8;
  const calculatedRiceKg = calcSoulCount * defaultKg;
  const calculatedCashRp = calcSoulCount * calcPricePerSoul;

  // Dynamic faqs list
  const faqs = cfg.faqsList && cfg.faqsList.length > 0 ? cfg.faqsList : [
    {
      id: 'faq1',
      q: 'Apakah aplikasi SimZakat ini benar-benar gratis untuk masjid kami?',
      a: 'Ya, 100% Gratis. SimZakat dibangun atas dasar khidmah dakwah agar seluruh panitia zakat masjid, musholla, dan UPZ di Indonesia memiliki sistem pencatatan yang rapi, transparan, dan sesuai syariat tanpa beban biaya langganan.'
    }
  ];

  // Helper for rendering feature card icons
  const renderFeatureIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'receipt':
        return <Receipt className="w-6 h-6" />;
      case 'scale':
        return <Scale className="w-6 h-6" />;
      case 'calculator':
        return <Calculator className="w-6 h-6" />;
      case 'users':
        return <Users className="w-6 h-6" />;
      case 'file-text':
        return <FileText className="w-6 h-6" />;
      case 'database':
        return <Database className="w-6 h-6" />;
      case 'shield':
        return <ShieldCheck className="w-6 h-6" />;
      case 'heart':
        return <Heart className="w-6 h-6" />;
      case 'share':
        return <Share2 className="w-6 h-6" />;
      case 'printer':
        return <Printer className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const featureThemes = [
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* 1. TOP ANNOUNCEMENT BAR (Clean & Spiritual) */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
              {cfg.announcementBadge || 'Dakwah Digital'}
            </span>
            <span className="text-emerald-100 font-medium">
              {cfg.announcementText || 'Sistem Informasi Manajemen Zakat Standar Kemenag RI, MUI & Had Kifayah BAZNAS'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-emerald-200">
            {onOpenDonationModal && (
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>Infaq Operasional</span>
              </button>
            )}
            <span className="text-emerald-400">|</span>
            <span>Tahun 1447 H / 2026 M</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">SimZakat</span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                  DKM v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Sistem Manajemen Zakat Fitrah & Maal Terpadu
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2.5">
            {onOpenDonationModal && (
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Dukung biaya server & operasional pengembang"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span className="hidden sm:inline">Infaq Dakwah</span>
              </button>
            )}

            <button
              onClick={onExploreDemo}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Jelajahi simulasi posko zakat tanpa login"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Coba Demo Posko</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl text-slate-700 hover:text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Masuk ke Sistem</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Daftarkan Masjid</span>
            </button>
          </div>

        </div>
      </header>

      {/* 3. HERO SECTION (Spiritual, Elegant, & Islamic) */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-24 bg-gradient-to-b from-emerald-50/60 via-slate-50/40 to-slate-50">
        
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          
          {/* Ayat Al-Qur'an Header Card */}
          <div className="inline-block max-w-3xl mx-auto mb-8 p-4 sm:p-6 rounded-3xl bg-white/90 border border-emerald-100 shadow-sm backdrop-blur-xs">
            <div className="text-xl sm:text-2xl font-arabic text-emerald-900 leading-loose" dir="rtl">
              {cfg.heroAyatArabic || 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا'}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 italic">
              {cfg.heroAyatTranslation || '"Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..."'}
            </p>
            <span className="text-[11px] font-bold text-emerald-700 mt-1 block uppercase tracking-wider">
              {cfg.heroAyatRef || 'QS. At-Taubah: 103'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            {cfg.heroHeadline || 'Pencatatan Zakat Lebih'}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700">
              {cfg.heroHeadlineHighlight || 'Amanah, Transparan'}
            </span>
            <br />
            <span>& Sesuai Syariat Islam</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            {cfg.heroSubtitle || 'Bantu panitia amil DKM beralih dari buku tulis manual ke sistem digital modern. Lengkap dengan kasir zakat fitrah & maal, cetak struk kasir thermal, kuitansi A4, berita acara (BAST) 1-klik, dan verifikasi 8 asnaf.'}
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-700/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Building2 className="w-5 h-5" />
              <span>Daftarkan Masjid (Gratis)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Coba Demo Posko (Simulasi)</span>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          </div>

          {/* Counter Bar (Platform Stats) */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-800">{totalMasjids}+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{cfg.statsLabel1 || 'Masjid & DKM Terdaftar'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-teal-800">{totalTransactions}+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{cfg.statsLabel2 || 'Muzakki Terlayani'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-700">{formatKg(totalRiceKg)}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{cfg.statsLabel3 || 'Beras Fitrah Terhimpun'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{formatRupiah(totalDana)}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{cfg.statsLabel4 || 'Dana ZISWAF Dikelola'}</div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE MINI SIMULATOR WIDGET (1. Simulasi Cepat Posko) */}
      <section className="py-14 bg-white border-b border-emerald-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {cfg.simulatorBadge || 'Simulasi Cepat Posko'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {cfg.simulatorTitle || 'Kalkulator Zakat Fitrah Interaktif'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {cfg.simulatorSubtitle || 'Coba langsung perhitungan otomatis kewajiban beras dan uang berdasarkan jumlah jiwa jamaah.'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Jumlah Jiwa Muzakki:</span>
                    <span className="text-emerald-800 text-sm font-black">{calcSoulCount} Jiwa</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={calcSoulCount}
                    onChange={(e) => setCalcSoulCount(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 Jiwa (Sendiri)</span>
                    <span>5 Jiwa</span>
                    <span>10 Jiwa</span>
                    <span>15 Jiwa (Keluarga Besar)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilihan Nilai Beras (SK Kemenag / BAZNAS):
                  </label>
                  <select
                    value={calcPricePerSoul}
                    onChange={(e) => setCalcPricePerSoul(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  >
                    {(cfg.simulatorTiers && cfg.simulatorTiers.length > 0 ? cfg.simulatorTiers : [
                      { id: 't1', label: 'Kategori I (Beras Premium)', price: 55000 },
                      { id: 't2', label: 'Kategori II (Beras Menengah)', price: 45000 },
                      { id: 't3', label: 'Kategori III (Beras Standar)', price: 40000 },
                    ]).map((tier) => (
                      <option key={tier.id} value={tier.price}>
                        {tier.label} - {formatRupiah(tier.price)} / jiwa
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result Preview Box */}
              <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-2xs space-y-3.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Hasil Perhitungan Standar ({defaultKg} Kg/Jiwa):
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-950">Jika Bayar Beras:</span>
                  </div>
                  <span className="text-base font-black text-amber-800">{formatKg(calculatedRiceKg)}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">Jika Bayar Uang:</span>
                  </div>
                  <span className="text-base font-black text-emerald-800">{formatRupiah(calculatedCashRp)}</span>
                </div>

                <button
                  type="button"
                  onClick={onExploreDemo}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Coba Input Transaksi Ini di Posko Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. 2. FITUR LENGKAP POSKO (DYNAMIC) */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              {cfg.featuresBadge || 'Fitur Lengkap Posko'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {cfg.featuresTitle || 'Solusi Menyeluruh untuk Amil Zakat Modern'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {cfg.featuresSubtitle || 'Didesain khusus untuk kecepatan antrean muzakki dan kehati-hatian syariah penyaluran mustahiq.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(cfg.featuresList && cfg.featuresList.length > 0 ? cfg.featuresList : []).map((feature, idx) => {
              const theme = featureThemes[idx % featureThemes.length];
              return (
                <div 
                  key={feature.id || idx} 
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-500/50 hover:shadow-md transition duration-200"
                >
                  <div className={`w-12 h-12 rounded-2xl ${theme.bg} border ${theme.border} flex items-center justify-center ${theme.text} mb-4`}>
                    {renderFeatureIcon(feature.icon)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. 3. COMPARISON: BUKU KERTAS TRADISIONAL VS SIMZAKAT DIGITAL (DYNAMIC) */}
      <section className="py-16 bg-white border-y border-emerald-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {cfg.comparisonTitle || 'Buku Kertas Tradisional vs'}{' '}
              <span className="text-emerald-700">{cfg.comparisonHighlight || 'SimZakat Digital'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {cfg.comparisonSubtitle || 'Transformasi pengelolaan zakat posko agar tidak terjadi selisih kas atau antrean panjang malam takbiran.'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">{cfg.comparisonHeaderNeed || 'Kebutuhan Operasional'}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-rose-700 bg-rose-50/50">{cfg.comparisonHeaderManual || 'Pencatatan Buku Manual'}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-emerald-800 bg-emerald-50/70">{cfg.comparisonHeaderDigital || 'Menggunakan SimZakat'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(cfg.comparisonRows && cfg.comparisonRows.length > 0 ? cfg.comparisonRows : []).map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">{row.need}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-rose-600 bg-rose-50/20">{row.manual}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-emerald-700 font-semibold bg-emerald-50/30">{row.digital}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. DAKWAH & SUSTAINABILITY SECTION (Donasi Pengembangan) */}
      <section className="py-16 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <Heart className="w-6 h-6 fill-rose-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {cfg.sustainabilityTitle || '100% Gratis untuk Dakwah Masjid Indonesia'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
            {cfg.sustainabilityDescription || 'SimZakat didedikasikan secara cuma-cuma tanpa biaya lisensi. Untuk menjaga biaya sewa server VPS, sertifikat SSL, pemeliharaan basis data, dan pengembangan fitur baru, kami membuka kesempatan berinfaq sukarela bagi DKM atau amil yang ingin ikut berkhidmah.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onOpenDonationModal && (
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>{cfg.sustainabilityButtonText || 'Salurkan Infaq Operasional SimZakat'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenRegister}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition cursor-pointer"
            >
              Mulai Daftar Masjid Sekarang
            </button>
          </div>

        </div>
      </section>

      {/* 8. 4. FAQ ACCORDION SECTION (PERTANYAAN UMUM DYNAMIC) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              {cfg.faqBadge || 'Pertanyaan Umum'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {cfg.faqTitle || 'Seputar Penggunaan SimZakat'}
            </h2>
            {cfg.faqSubtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {cfg.faqSubtitle}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full py-4 px-5 text-left text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-emerald-700 shrink-0 transition-transform ${
                      activeFaq === idx ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. BOTTOM CTA BANNER (DYNAMIC) */}
      <section className="py-14 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black">
            {cfg.ctaBannerTitle || 'Wujudkan Posko Zakat Masjid yang Profesional & Barakah'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-lg mx-auto">
            {cfg.ctaBannerSubtitle || 'Hanya butuh 1 menit untuk mendaftarkan masjid Anda. Langsung siap cetak kuitansi dan terima zakat jamaah.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="px-7 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer"
            >
              {cfg.ctaRegisterBtnText || 'Daftarkan Masjid Anda Sekarang'}
            </button>
            <button
              onClick={onOpenLogin}
              className="px-6 py-3.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-600 text-white font-bold text-xs transition cursor-pointer"
            >
              {cfg.ctaLoginBtnText || 'Masuk Akun yang Sudah Ada'}
            </button>
          </div>
        </div>
      </section>

      {/* 10. CLEAN FOOTER (DYNAMIC) */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">{cfg.footerTitle || 'SimZakat'}</span> — {cfg.footerDescription || 'Khidmah Dakwah Amil Zakat & Mustahiq Indonesia'}
          </div>
          <div className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} {cfg.footerTitle || 'SimZakat'}. {cfg.footerCopyright || 'Dibangun untuk kemaslahatan umat & transparansi ZISWAF.'}
          </div>
        </div>
      </footer>

    </div>
  );
};
