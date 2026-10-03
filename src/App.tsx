/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TransactionForm } from './components/TransactionForm';
import { MuzakkiList } from './components/MuzakkiList';
import { MustahiqManager } from './components/MustahiqManager';
import { DistributionManager } from './components/DistributionManager';
import { ZakatCalculator } from './components/ZakatCalculator';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { DoaModal } from './components/DoaModal';
import { CashTreasuryModal } from './components/CashTreasuryModal';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { DonationModal } from './components/DonationModal';
import { UploadRecommendationModal } from './components/UploadRecommendationModal';
import { AmilGuideModal } from './components/AmilGuideModal';

import { AppConfig, DistributionRecord, Mustahiq, MuzakkiTransaction, YearlyArchiveRecord } from './types/zakat';
import { AuthSession, LoginPayload, MasjidAccount, RegisterMasjidPayload, UserAccount } from './types/auth';
import { LandingPageConfig } from './types/landing';
import { authService, ownerService, masjidDataService, landingConfigService, initSeedData } from './services/apiClient';
import { fiqhConfigService } from './services/fiqhConfigService';

export default function App() {
  // Initialize seed data and sync with server VPS on first mount
  useEffect(() => {
    initSeedData();
    landingConfigService.fetchServerConfig().then((cfg) => {
      setLandingConfig(cfg);
    });
    ownerService.syncFromServer().then((ms) => {
      setOwnerMasjids(ms);
    });
    fiqhConfigService.fetchServerConfig();
  }, []);

  // Landing Page & Infaq dynamic config
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(() => landingConfigService.getConfig());

  // 1. Authentication & Session State
  const [session, setSession] = useState<AuthSession>(() => authService.getCurrentSession());
  const [viewMode, setViewMode] = useState<'landing' | 'app' | 'owner'>(() => {
    const current = authService.getCurrentSession();
    if (current.isAuthenticated && current.user) {
      return current.user.role === 'owner' ? 'owner' : 'app';
    }
    return 'landing';
  });

  // Modals for Auth & Dakwah Donation
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Owner Masjids list state for live reactivity (declared at top level)
  const [ownerMasjids, setOwnerMasjids] = useState<MasjidAccount[]>(() => ownerService.getAllMasjids());
  const refreshOwnerMasjids = () => {
    setOwnerMasjids(ownerService.getAllMasjids());
  };

  // Sync owner masjids if viewMode changes to owner
  useEffect(() => {
    if (viewMode === 'owner') {
      refreshOwnerMasjids();
    }
  }, [viewMode]);

  // Active Masjid (Defaults to first demo masjid or user's assigned masjid)
  const [currentMasjid, setCurrentMasjid] = useState<MasjidAccount | null>(() => {
    const s = authService.getCurrentSession();
    if (s.currentMasjid) return s.currentMasjid;
    const masjids = ownerService.getAllMasjids();
    return masjids[0] || null;
  });

  const activeMasjidId = currentMasjid?.id || 'masjid-almuhajirin';

  // 2. Active Masjid's Scoped Data
  const [config, setConfig] = useState<AppConfig>(() => masjidDataService.getConfig(activeMasjidId));
  const [transactions, setTransactions] = useState<MuzakkiTransaction[]>(() => masjidDataService.getTransactions(activeMasjidId));
  const [mustahiqList, setMustahiqList] = useState<Mustahiq[]>(() => masjidDataService.getMustahiqs(activeMasjidId));
  const [distributions, setDistributions] = useState<DistributionRecord[]>(() => masjidDataService.getDistributions(activeMasjidId));
  const [archives, setArchives] = useState<YearlyArchiveRecord[]>(() => masjidDataService.getArchives(activeMasjidId));

  // Reload data when active masjid changes
  useEffect(() => {
    if (currentMasjid) {
      setConfig(masjidDataService.getConfig(currentMasjid.id));
      setTransactions(masjidDataService.getTransactions(currentMasjid.id));
      setMustahiqList(masjidDataService.getMustahiqs(currentMasjid.id));
      setDistributions(masjidDataService.getDistributions(currentMasjid.id));
      setArchives(masjidDataService.getArchives(currentMasjid.id));
    }
  }, [currentMasjid?.id]);

  // Sync data to localStorage service whenever it updates
  useEffect(() => {
    if (activeMasjidId) {
      masjidDataService.saveConfig(activeMasjidId, config);
    }
  }, [config, activeMasjidId]);

  useEffect(() => {
    if (activeMasjidId) {
      masjidDataService.saveTransactions(activeMasjidId, transactions);
    }
  }, [transactions, activeMasjidId]);

  useEffect(() => {
    if (activeMasjidId) {
      masjidDataService.saveMustahiqs(activeMasjidId, mustahiqList);
    }
  }, [mustahiqList, activeMasjidId]);

  useEffect(() => {
    if (activeMasjidId) {
      masjidDataService.saveDistributions(activeMasjidId, distributions);
    }
  }, [distributions, activeMasjidId]);

  // 3. Posko UI State
  const [activeTab, setActiveTab] = useState<string>('kasir');
  const [activeReceipt, setActiveReceipt] = useState<MuzakkiTransaction | null>(null);
  const [isDoaModalOpen, setIsDoaModalOpen] = useState<boolean>(false);
  const [isAmilGuideModalOpen, setIsAmilGuideModalOpen] = useState<boolean>(false);
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState<boolean>(false);
  const [isUploadRecModalOpen, setIsUploadRecModalOpen] = useState<boolean>(false);
  const [calculatorPrefill, setCalculatorPrefill] = useState<Partial<MuzakkiTransaction> | null>(null);
  const [preselectedMustahiq, setPreselectedMustahiq] = useState<Mustahiq | null>(null);

  // Recommendation letter upload handler
  const handleSaveRecommendationDoc = (fileName: string, fileData?: string) => {
    if (!currentMasjid) return;
    const res = authService.updateMasjidRecommendationDoc(currentMasjid.id, fileName, fileData);
    if (res.success && res.updatedMasjid) {
      setCurrentMasjid(res.updatedMasjid);
      refreshOwnerMasjids();
    }
  };

  // Global Inventory & Treasury Calculations
  const totalRiceInKg = useMemo(() => transactions.reduce((acc, t) => acc + (t.totalRiceKg || 0), 0), [transactions]);
  const totalRiceOutKg = useMemo(() => distributions.reduce((acc, d) => acc + (d.riceKg || 0), 0), [distributions]);
  const totalRiceStockKg = Math.max(0, totalRiceInKg - totalRiceOutKg);

  const totalMoneyInRp = useMemo(() => transactions.reduce((acc, t) => acc + (t.totalMoneyRp || 0), 0), [transactions]);
  const totalMoneyOutRp = useMemo(() => distributions.reduce((acc, d) => acc + (d.moneyRp || 0), 0), [distributions]);
  const totalMoneyBalanceRp = Math.max(0, totalMoneyInRp - totalMoneyOutRp);

  // Auth Handlers
  const handleLogin = async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    if (res.success && res.session) {
      setSession(res.session);
      if (res.session.currentMasjid) {
        setCurrentMasjid(res.session.currentMasjid);
      }
      if (res.session.user?.role === 'owner') {
        setViewMode('owner');
      } else {
        setViewMode('app');
        // Tampilkan modal Infaq Operasional kepada amil/DKM saat login jika diaktifkan
        if (landingConfig.showDonationOnLogin) {
          setIsDonationModalOpen(true);
        }
      }
      // Also notify backend API (non-blocking)
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
    return res;
  };

  const handleRegister = async (payload: RegisterMasjidPayload) => {
    const res = await authService.registerMasjid(payload);
    if (res.success && res.session) {
      setSession(res.session);
      if (res.session.currentMasjid) {
        setCurrentMasjid(res.session.currentMasjid);
      }
      setViewMode('app');
      // Sambut pengguna baru dengan ajakan infaq sukarela dakwah jika diaktifkan
      if (landingConfig.showDonationOnLogin) {
        setIsDonationModalOpen(true);
      }
    }
    return res;
  };

  const handleLogout = () => {
    authService.clearSession();
    setSession({ user: null, currentMasjid: null, isAuthenticated: false });
    setViewMode('landing');
  };

  const handleExploreDemo = async () => {
    await handleLogin({ usernameOrEmail: 'admin_muhajirin', password: '123' });
    setViewMode('app');
  };

  // Posko Business Logic Handlers
  const handleSaveTransaction = (newTx: MuzakkiTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setActiveReceipt(newTx);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveMustahiq = (saved: Mustahiq) => {
    setMustahiqList((prev) => {
      const idx = prev.findIndex((m) => m.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteMustahiq = (id: string) => {
    setMustahiqList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveDistribution = (record: DistributionRecord) => {
    setDistributions((prev) => [record, ...prev]);
    setMustahiqList((prev) =>
      prev.map((m) => {
        if (m.id === record.mustahiqId) {
          return {
            ...m,
            totalRiceReceivedKg: (m.totalRiceReceivedKg || 0) + record.riceKg,
            totalMoneyReceivedRp: (m.totalMoneyReceivedRp || 0) + record.moneyRp,
            lastDistributedAt: record.dateStr,
          };
        }
        return m;
      })
    );
  };

  const handleDeleteDistribution = (id: string) => {
    const target = distributions.find((d) => d.id === id);
    if (target) {
      setMustahiqList((prev) =>
        prev.map((m) => {
          if (m.id === target.mustahiqId) {
            return {
              ...m,
              totalRiceReceivedKg: Math.max(0, (m.totalRiceReceivedKg || 0) - target.riceKg),
              totalMoneyReceivedRp: Math.max(0, (m.totalMoneyReceivedRp || 0) - target.moneyRp),
            };
          }
          return m;
        })
      );
    }
    setDistributions((prev) => prev.filter((d) => d.id !== id));
  };

  const handleQuickDistribute = (mustahiq: Mustahiq) => {
    setPreselectedMustahiq(mustahiq);
    setActiveTab('penyaluran');
  };

  const handleApplyFromCalculator = (prefillData: Partial<MuzakkiTransaction>) => {
    setCalculatorPrefill(prefillData);
    setActiveTab('kasir');
  };

  const handleRestoreAllData = (data: {
    config: AppConfig;
    transactions: MuzakkiTransaction[];
    mustahiqList: Mustahiq[];
    distributions: DistributionRecord[];
  }) => {
    setConfig(data.config);
    setTransactions(data.transactions);
    setMustahiqList(data.mustahiqList);
    setDistributions(data.distributions);
  };

  const handlePerformRollover = (params: {
    newHijriYear: string;
    newMasehiYear: string;
    closedBy: string;
    notes?: string;
    resetMustahiqQuotas: boolean;
  }) => {
    const res = masjidDataService.closeYearAndRollover(activeMasjidId, params);
    setTransactions([]);
    setDistributions([]);
    setConfig(res.newConfig);
    setMustahiqList(res.newMustahiqs);
    setArchives(masjidDataService.getArchives(activeMasjidId));
    setCurrentMasjid((prev) => prev ? { ...prev, hijriYear: params.newHijriYear, masehiYear: params.newMasehiYear } : prev);
    refreshOwnerMasjids();
  };

  const handleDeleteArchive = (archiveId: string) => {
    masjidDataService.deleteArchive(activeMasjidId, archiveId);
    setArchives(masjidDataService.getArchives(activeMasjidId));
  };

  // ---------------------------------------------------------------------------
  // VIEW 1: LANDING PAGE
  // ---------------------------------------------------------------------------
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onExploreDemo={handleExploreDemo}
          onOpenDonationModal={() => setIsDonationModalOpen(true)}
          masjidsList={ownerService.getAllMasjids()}
          landingConfig={landingConfig}
        />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
          landingConfig={landingConfig}
        />

        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterSuccess={handleRegister}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />

        <DonationModal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          masjidName={currentMasjid?.name}
          landingConfig={landingConfig}
        />
      </>
    );
  }

  // VIEW 2: SUPER ADMIN / OWNER DASHBOARD
  // ---------------------------------------------------------------------------
  if (viewMode === 'owner' && session.user) {
    return (
      <>
        <OwnerDashboard
          currentUser={session.user}
          masjidsList={ownerMasjids}
          onSelectMasjidToManage={(masjid) => {
            setCurrentMasjid(masjid);
            setViewMode('app');
          }}
          onUpdateMasjidStatus={(masjidId, status) => {
            ownerService.updateMasjidStatus(masjidId, status);
            setOwnerMasjids(ownerService.getAllMasjids());
            setCurrentMasjid((prev) => prev && prev.id === masjidId ? { ...prev, status } : prev);
          }}
          onUpdateMasjid={(updated) => {
            ownerService.updateMasjid(updated);
            refreshOwnerMasjids();
          }}
          onCreateMasjid={(newM) => {
            const res = ownerService.createMasjid(newM);
            refreshOwnerMasjids();
            return res;
          }}
          onDeleteMasjid={(masjidId) => {
            ownerService.deleteMasjid(masjidId);
            refreshOwnerMasjids();
          }}
          onResetMasjidData={(masjidId) => {
            ownerService.resetMasjidData(masjidId);
            refreshOwnerMasjids();
          }}
          onLogout={handleLogout}
          onGoToLanding={() => setViewMode('landing')}
          landingConfig={landingConfig}
          onUpdateLandingConfig={(newCfg) => {
            setLandingConfig(newCfg);
            landingConfigService.saveConfig(newCfg);
          }}
        />

        <DonationModal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          masjidName="SimZakat Pusat"
          landingConfig={landingConfig}
        />
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 3: OPERATIONAL ZAKAT POSKO (DKM & AMIL)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      {/* Navigation Header with Role & Masjid Identity */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        totalMuzakkiCount={transactions.length}
        totalRiceStockKg={totalRiceStockKg}
        totalMoneyBalanceRp={totalMoneyBalanceRp}
        onOpenDoaModal={() => setIsDoaModalOpen(true)}
        onOpenAmilGuide={() => setIsAmilGuideModalOpen(true)}
        onOpenTreasuryModal={() => setIsTreasuryModalOpen(true)}
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
        currentUser={session.user}
        currentMasjid={currentMasjid}
        archivesCount={archives.length}
        onLogout={handleLogout}
        onGoToLanding={() => setViewMode('landing')}
        onGoToOwnerDashboard={session.user?.role === 'owner' ? () => setViewMode('owner') : undefined}
      />

      {/* PENDING VERIFICATION STATUS BANNER */}
      {currentMasjid?.status === 'pending_verification' && (
        <div className="bg-amber-500/10 border-b border-amber-300 text-amber-950 px-4 py-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0">
                Menunggu Verifikasi
              </span>
              <p className="leading-snug">
                Akun posko <strong className="font-bold">{currentMasjid.name}</strong> sedang dalam status <strong>Menunggu Verifikasi Super Admin</strong>.{' '}
                {currentMasjid.recommendationLetterName ? (
                  <span className="text-emerald-800 font-bold">
                    (Berkas Terlampir: {currentMasjid.recommendationLetterName})
                  </span>
                ) : (
                  <span className="text-amber-800 font-medium">
                    (Belum mengunggah Surat Rekomendasi / SK DKM)
                  </span>
                )}
                . Anda <strong>tetap dapat menggunakan seluruh menu aplikasi</strong> (Kasir, Data Muzakki, Mustahiq, Penyaluran 8 Asnaf, Cetak Kuitansi, dan Laporan BAST) tanpa batasan operasional.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadRecModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>{currentMasjid.recommendationLetterName ? '📄 Ganti / Unggah Ulang SK' : '📄 Unggah Surat Rekomendasi / SK DKM'}</span>
              </button>

              {session.user?.role === 'owner' ? (
                <button
                  type="button"
                  onClick={() => setViewMode('owner')}
                  className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shrink-0 cursor-pointer transition shadow-xs"
                >
                  Panel Owner: Verifikasi Lembaga Ini →
                </button>
              ) : (
                <span className="text-[11px] text-amber-800 font-medium">
                  Persetujuan resmi oleh Super Admin Pusat
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUSPENDED WARNING (If status is suspended and not owner) */}
      {currentMasjid?.status === 'suspended' && session.user?.role !== 'owner' ? (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-lg">
              !
            </div>
            <h3 className="text-xl font-black text-rose-900">
              Operasional Posko Ditangguhkan (Suspended)
            </h3>
            <p className="text-sm text-rose-800 leading-relaxed">
              Akun masjid <strong className="font-bold">{currentMasjid.name}</strong> saat ini dinonaktifkan sementara oleh <strong>Super Admin SimZakat Pusat</strong> demi menjaga transparansi, kepatuhan syar'i, atau keperluan klarifikasi legalitas.
            </p>
            <p className="text-xs text-rose-700">
              Silakan hubungi administrator pusat melalui WhatsApp untuk pengaktifan kembali.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Keluar dari Akun
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Main Content Area */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {activeTab === 'kasir' && (
          <TransactionForm
            config={config}
            transactionsCount={transactions.length}
            onSaveTransaction={handleSaveTransaction}
            onOpenDoaModal={() => setIsDoaModalOpen(true)}
            initialPrefill={calculatorPrefill}
            onClearPrefill={() => setCalculatorPrefill(null)}
          />
        )}

        {activeTab === 'muzakki' && (
          <MuzakkiList
            transactions={transactions}
            config={config}
            onViewReceipt={(tx) => setActiveReceipt(tx)}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigateToKasir={() => setActiveTab('kasir')}
          />
        )}

        {activeTab === 'mustahiq' && (
          <MustahiqManager
            mustahiqList={mustahiqList}
            config={config}
            onSaveMustahiq={handleSaveMustahiq}
            onDeleteMustahiq={handleDeleteMustahiq}
            onQuickDistribute={handleQuickDistribute}
          />
        )}

        {activeTab === 'penyaluran' && (
          <DistributionManager
            distributions={distributions}
            mustahiqList={mustahiqList}
            config={config}
            totalRiceStockKg={totalRiceStockKg}
            totalMoneyBalanceRp={totalMoneyBalanceRp}
            onSaveDistribution={handleSaveDistribution}
            onDeleteDistribution={handleDeleteDistribution}
            preselectedMustahiq={preselectedMustahiq}
            onClearPreselected={() => setPreselectedMustahiq(null)}
          />
        )}

        {activeTab === 'kalkulator' && (
          <ZakatCalculator
            config={config}
            onApplyToKasir={handleApplyFromCalculator}
          />
        )}

        {activeTab === 'laporan' && (
          <ReportsView
            transactions={transactions}
            mustahiqList={mustahiqList}
            distributions={distributions}
            config={config}
            archives={archives}
            onOpenArchives={() => setActiveTab('pengaturan')}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsView
            config={config}
            onSaveConfig={setConfig}
            transactions={transactions}
            mustahiqList={mustahiqList}
            distributions={distributions}
            archives={archives}
            currentMasjid={currentMasjid}
            onOpenUploadRecModal={() => setIsUploadRecModalOpen(true)}
            onPerformRollover={handlePerformRollover}
            onDeleteArchive={handleDeleteArchive}
            onRestoreAllData={handleRestoreAllData}
          />
        )}
      </main>
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-5 pb-20 md:pb-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {config.organizationName} • Tahun {config.hijriYear} / {config.masehiYear}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDonationModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <DonationModalIcon />
              <span>Infaq Pengembangan SimZakat</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReceiptModal
        transaction={activeReceipt}
        config={config}
        onClose={() => setActiveReceipt(null)}
      />

      <DoaModal
        isOpen={isDoaModalOpen}
        onClose={() => setIsDoaModalOpen(false)}
      />

      <CashTreasuryModal
        isOpen={isTreasuryModalOpen}
        onClose={() => setIsTreasuryModalOpen(false)}
        transactions={transactions}
        distributions={distributions}
        config={config}
        onNavigateTab={(tabId) => setActiveTab(tabId)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
        landingConfig={landingConfig}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegister}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Dakwah & Operational Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        masjidName={currentMasjid?.name}
        landingConfig={landingConfig}
      />

      {/* Upload Recommendation Letter / SK DKM Modal */}
      <UploadRecommendationModal
        isOpen={isUploadRecModalOpen}
        onClose={() => setIsUploadRecModalOpen(false)}
        masjid={currentMasjid}
        onSaveFile={handleSaveRecommendationDoc}
      />

      {/* Buku Saku Panduan Amil & Pengurus Modal */}
      <AmilGuideModal
        isOpen={isAmilGuideModalOpen}
        onClose={() => setIsAmilGuideModalOpen(false)}
        config={config}
        masjidName={currentMasjid?.name}
      />
    </div>
  );
}

// Small helper icon for footer
function DonationModalIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-rose-500 fill-rose-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}
