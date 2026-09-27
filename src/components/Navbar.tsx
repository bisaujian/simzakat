import React from 'react';
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
  BookOpen
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
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Mosque Identity & App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/50 border border-emerald-400/40 flex items-center justify-center text-amber-300 font-bold shadow-inner">
              <Moon className="w-5 h-5 fill-amber-300 stroke-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-white">
                  SimZakat
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('pengaturan')}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600/90 border border-emerald-500/40 text-emerald-100 flex items-center gap-1.5 transition cursor-pointer"
                  title="Klik untuk membuka Pengaturan &amp; Riwayat Arsip Tahunan"
                >
                  <span>{config.hijriYear} / {config.masehiYear}</span>
                  {archivesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black" title={`${archivesCount} arsip tahun sebelumnya tersimpan`}>
                      {archivesCount} Arsip
                    </span>
                  )}
                </button>

                {/* User Role Badge */}
                {currentUser && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    currentUser.role === 'owner' 
                      ? 'bg-purple-500 text-white shadow-xs' 
                      : currentUser.role === 'admin_dkm' 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-teal-500 text-slate-950'
                  }`}>
                    {currentUser.role === 'owner' ? 'Owner / Super Admin' : currentUser.role === 'admin_dkm' ? 'Admin DKM' : 'Kasir Posko'}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200 truncate max-w-xs sm:max-w-md font-medium">
                {currentMasjid?.name || config.organizationName}
              </p>
            </div>
          </div>

          {/* Quick stats tickers & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              type="button"
              onClick={onOpenTreasuryModal}
              title="Klik untuk melihat rincian pemasukan dan penyaluran stok beras"
              className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer text-left group"
            >
              <Wheat className="w-3.5 h-3.5 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[9px] text-emerald-300 block uppercase font-semibold">Stok Beras</span>
                <span className="font-bold text-white text-xs">{formatKg(totalRiceStockKg)}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenTreasuryModal}
              title="Klik untuk melihat asal-usul & rincian Saldo Kas zakat (transparan)"
              className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer text-left group"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[9px] text-emerald-300 block uppercase font-semibold">Saldo Kas</span>
                <span className="font-bold text-amber-300 text-xs">{formatRupiah(totalMoneyBalanceRp)}</span>
              </div>
            </button>

            <button
              onClick={onOpenDoaModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
              title="Buka panduan lafal doa zakat"
            >
              <span className="font-arabic text-xs">دعاء</span>
              <span className="hidden md:inline">Doa</span>
            </button>

            {onOpenAmilGuide && (
              <button
                type="button"
                onClick={onOpenAmilGuide}
                className="bg-teal-700/80 hover:bg-teal-600 text-teal-100 hover:text-white border border-teal-500/40 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Buku Saku Panduan Operasional Amil Zakat &amp; SOP Posko"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden sm:inline">Panduan Amil</span>
              </button>
            )}

            {/* Infaq Dakwah button */}
            {onOpenDonationModal && (
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Donasi & Infaq Pengembangan SimZakat"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span className="hidden sm:inline">Infaq Dakwah</span>
              </button>
            )}

            <div className="h-5 w-px bg-emerald-700/60 hidden sm:block" />

            {/* Owner Switcher Button if logged in as Owner */}
            {currentUser?.role === 'owner' && onGoToOwnerDashboard && (
              <button
                type="button"
                onClick={onGoToOwnerDashboard}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Kembali ke Dashboard Super Admin Owner"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Master Owner</span>
              </button>
            )}

            {/* Landing link */}
            {onGoToLanding && (
              <button
                type="button"
                onClick={onGoToLanding}
                className="bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Halaman Depan Publik"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Beranda</span>
              </button>
            )}

            {/* Logout button */}
            {currentUser && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Keluar dari sesi posko"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Keluar</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Main Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 text-sm cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
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
