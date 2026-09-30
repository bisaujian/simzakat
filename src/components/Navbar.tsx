import React, { useState } from 'react';
import { 
  PlusCircle, 
  Users, 
  HeartHandshake, 
  PackageCheck, 
  Calculator, 
  BarChart3, 
  Settings, 
  Moon, 
  Coins, 
  Wheat,
  ShieldCheck,
  Building2,
  LogOut,
  Home,
  Heart,
  BookOpen,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { AppConfig } from '../types/zakat';
import { UserAccount, MasjidAccount } from '../types/auth';
import { formatKg, formatRupiah } from '../utils/helpers';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: AppConfig;
  totalMuzakkiCount: number;
  totalRiceStockKg: number;
  totalMoneyBalanceRp: number;
  onOpenDoaModal: () => void;
  onOpenAmilGuide?: () => void;
  onOpenTreasuryModal?: () => void;
  onOpenDonationModal?: () => void;
  currentUser?: UserAccount | null;
  currentMasjid?: MasjidAccount | null;
  archivesCount?: number;
  onLogout?: () => void;
  onGoToLanding?: () => void;
  onGoToOwnerDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  totalMuzakkiCount,
  totalRiceStockKg,
  totalMoneyBalanceRp,
  onOpenDoaModal,
  onOpenAmilGuide,
  onOpenTreasuryModal,
  onOpenDonationModal,
  currentUser,
  currentMasjid,
  archivesCount = 0,
  onLogout,
  onGoToLanding,
  onGoToOwnerDashboard,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'kasir', label: 'Kasir Penerimaan', icon: PlusCircle, badge: 'Input' },
    { id: 'muzakki', label: 'Buku Muzakki', icon: Users, badge: totalMuzakkiCount },
    { id: 'mustahiq', label: 'Data Mustahiq', icon: HeartHandshake, badge: '8 Asnaf' },
    { id: 'penyaluran', label: 'Distribusi Zakat', icon: PackageCheck },
    { id: 'kalkulator', label: 'Kalkulator Zakat', icon: Calculator },
    { id: 'laporan', label: 'Laporan & BAST', icon: BarChart3 },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-emerald-100 shadow-xs sticky top-0 z-30 no-print">
      {/* Top Banner / Mosque identity & User Session */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Mosque Identity & App Name */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600/50 border border-emerald-400/40 flex items-center justify-center text-amber-300 font-bold shadow-inner shrink-0">
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-300 stroke-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                  SimZakat
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('pengaturan')}
                  className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600/90 border border-emerald-500/40 text-emerald-100 flex items-center gap-1 transition cursor-pointer shrink-0"
                  title="Klik untuk membuka Pengaturan &amp; Riwayat Arsip Tahunan"
                >
                  <span>{config.hijriYear}</span>
                  {archivesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black" title={`${archivesCount} arsip tahun sebelumnya tersimpan`}>
                      {archivesCount}
                    </span>
                  )}
                </button>

                {/* User Role Badge */}
                {currentUser && (
                  <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                    currentUser.role === 'owner' 
                      ? 'bg-purple-500 text-white shadow-xs' 
                      : currentUser.role === 'admin_dkm' 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-teal-500 text-slate-950'
                  }`}>
                    {currentUser.role === 'owner' ? 'Owner' : currentUser.role === 'admin_dkm' ? 'Admin' : 'Kasir'}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200 truncate font-medium">
                {currentMasjid?.name || config.organizationName}
              </p>
            </div>
          </div>

          {/* Quick stats tickers & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs shrink-0">
            {/* Stok Beras Quick Badge */}
            <button
              type="button"
              onClick={onOpenTreasuryModal}
              title="Klik untuk melihat rincian pemasukan dan penyaluran stok beras"
              className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 sm:gap-2 transition cursor-pointer text-left group"
            >
              <Wheat className="w-3.5 h-3.5 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[8px] sm:text-[9px] text-emerald-300 block uppercase font-semibold leading-none">Beras</span>
                <span className="font-bold text-white text-[11px] sm:text-xs leading-tight">{formatKg(totalRiceStockKg)}</span>
              </div>
            </button>

            {/* Saldo Kas Quick Badge */}
            <button
              type="button"
              onClick={onOpenTreasuryModal}
              title="Klik untuk melihat asal-usul & rincian Saldo Kas zakat (transparan)"
              className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 sm:gap-2 transition cursor-pointer text-left group"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[8px] sm:text-[9px] text-emerald-300 block uppercase font-semibold leading-none">Kas</span>
                <span className="font-bold text-amber-300 text-[11px] sm:text-xs leading-tight">{formatRupiah(totalMoneyBalanceRp)}</span>
              </div>
            </button>

            {/* Doa Quick Button */}
            <button
              onClick={onOpenDoaModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
              title="Buka panduan lafal doa zakat"
            >
              <span className="font-arabic text-xs">دعاء</span>
              <span className="hidden sm:inline">Doa</span>
            </button>

            {/* Desktop Only Extra Action Buttons */}
            {onOpenAmilGuide && (
              <button
                type="button"
                onClick={onOpenAmilGuide}
                className="hidden md:flex bg-teal-700/80 hover:bg-teal-600 text-teal-100 hover:text-white border border-teal-500/40 font-semibold px-2.5 py-1.5 rounded-lg text-xs items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Buku Saku Panduan Operasional Amil Zakat &amp; SOP Posko"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-300" />
                <span>Panduan Amil</span>
              </button>
            )}

            {/* Infaq Dakwah button */}
            {onOpenDonationModal && (
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="hidden md:flex bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 transition cursor-pointer"
                title="Donasi & Infaq Pengembangan SimZakat"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>Infaq Dakwah</span>
              </button>
            )}

            {/* Owner Switcher Button if logged in as Owner */}
            {currentUser?.role === 'owner' && onGoToOwnerDashboard && (
              <button
                type="button"
                onClick={onGoToOwnerDashboard}
                className="hidden lg:flex bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Kembali ke Dashboard Super Admin Owner"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Owner</span>
              </button>
            )}

            {/* Landing link */}
            {onGoToLanding && (
              <button
                type="button"
                onClick={onGoToLanding}
                className="hidden xl:flex bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold items-center gap-1 transition cursor-pointer"
                title="Halaman Depan Publik"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </button>
            )}

            {/* Logout button desktop */}
            {currentUser && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="hidden md:flex bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold items-center gap-1 transition cursor-pointer"
                title="Keluar dari sesi posko"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button (< md) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-emerald-800/90 text-emerald-100 hover:text-white hover:bg-emerald-700 transition cursor-pointer"
              aria-label="Menu Posko Tambahan"
              title="Menu Tambahan"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for secondary tools */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-2 pb-1 border-t border-emerald-800/70 mt-2 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {onOpenAmilGuide && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAmilGuide();
                  }}
                  className="bg-teal-800/70 hover:bg-teal-700 p-2 rounded-lg flex items-center gap-1.5 text-teal-100 text-left font-medium cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span className="truncate">Panduan Amil</span>
                </button>
              )}

              {onOpenDonationModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDonationModal();
                  }}
                  className="bg-rose-900/60 hover:bg-rose-800 p-2 rounded-lg flex items-center gap-1.5 text-rose-200 text-left font-medium cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />
                  <span className="truncate">Infaq Dakwah</span>
                </button>
              )}

              {currentUser?.role === 'owner' && onGoToOwnerDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onGoToOwnerDashboard();
                  }}
                  className="bg-purple-900/60 hover:bg-purple-800 p-2 rounded-lg flex items-center gap-1.5 text-purple-200 text-left font-bold cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Master Owner</span>
                </button>
              )}

              {onGoToLanding && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onGoToLanding();
                  }}
                  className="bg-emerald-950/70 hover:bg-emerald-900 p-2 rounded-lg flex items-center gap-1.5 text-emerald-200 text-left font-medium cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Beranda Depan</span>
                </button>
              )}
            </div>

            {currentUser && onLogout && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full mt-1 bg-rose-950/90 hover:bg-rose-900 border border-rose-800/60 text-rose-200 p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar dari Posko</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation tabs */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 sm:py-2.5 no-scrollbar text-xs sm:text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 text-xs sm:text-sm cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      isActive
                        ? 'bg-emerald-900/60 text-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
