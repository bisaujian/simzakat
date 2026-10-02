import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Download, 
  Server, 
  LogOut, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  MapPin,
  Phone,
  Calendar,
  Sparkles,
  FileCode,
  Globe,
  Save,
  RotateCcw,
  Heart,
  MessageCircle,
  CreditCard,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  Layers,
  Scale,
  Calculator,
  Receipt,
  FileText,
  Wheat,
  QrCode,
  Upload,
  BookOpen,
  Eye,
  EyeOff,
  Edit,
  PenSquare,
  ArrowUpDown,
  FileSpreadsheet,
  XCircle,
  X,
  Edit3,
  KeyRound,
  Lock
} from 'lucide-react';
import { MasjidAccount, PasswordResetTicket, UserAccount, WhatsAppGatewayConfig } from '../types/auth';
import { LandingPageConfig, DEFAULT_LANDING_CONFIG, PriceTier, FeatureItem, ComparisonRow, FaqItem } from '../types/landing';
import { authService, landingConfigService, ownerService, whatsappService } from '../services/apiClient';
import { OwnerFiqhSettings } from './OwnerFiqhSettings';
import { 
  MasjidDetailModal, 
  MasjidEditModal, 
  MasjidAddModal, 
  ConfirmActionModal 
} from './MasjidManagementModals';
import { formatKg, formatRupiah } from '../utils/helpers';
import { exportMasjidsToExcel } from '../utils/excelExport';

interface OwnerDashboardProps {
  currentUser: UserAccount;
  masjidsList: MasjidAccount[];
  onSelectMasjidToManage: (masjid: MasjidAccount) => void;
  onUpdateMasjidStatus: (masjidId: string, status: 'active' | 'pending_verification' | 'suspended') => void;
  onUpdateMasjid?: (updated: Partial<MasjidAccount> & { id: string }) => void;
  onCreateMasjid?: (newMasjid: Omit<MasjidAccount, 'id'>) => MasjidAccount;
  onDeleteMasjid?: (masjidId: string) => void;
  onResetMasjidData?: (masjidId: string) => void;
  onLogout: () => void;
  onGoToLanding: () => void;
  landingConfig?: LandingPageConfig;
  onUpdateLandingConfig?: (config: LandingPageConfig) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  masjidsList,
  onSelectMasjidToManage,
  onUpdateMasjidStatus,
  onUpdateMasjid,
  onCreateMasjid,
  onDeleteMasjid,
  onResetMasjidData,
  onLogout,
  onGoToLanding,
  landingConfig,
  onUpdateLandingConfig,
}) => {
  // Local state for masjids to enable instant reactivity and synchronization
  const [masjids, setMasjids] = useState<MasjidAccount[]>(() => masjidsList);

  React.useEffect(() => {
    setMasjids(masjidsList);
  }, [masjidsList]);

  const refreshMasjids = () => {
    const list = ownerService.getAllMasjids();
    setMasjids(list);
  };

  // Toast feedback state
  const [toastNotice, setToastNotice] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastNotice({ type, message });
    setTimeout(() => {
      setToastNotice((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Modal states for masjid management
  const [detailModalMasjid, setDetailModalMasjid] = useState<MasjidAccount | null>(null);
  const [editModalMasjid, setEditModalMasjid] = useState<MasjidAccount | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: 'rose' | 'emerald' | 'purple' | 'amber';
    onConfirm: () => void;
  } | null>(null);

  const [sortBy, setSortBy] = useState<'name' | 'ziswaf' | 'souls' | 'recent' | 'status'>('name');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_verification' | 'suspended'>('all');
  const [activeTab, setActiveTab] = useState<'masjids' | 'landing_settings' | 'fiqh_guidelines' | 'database_server' | 'security_settings'>('masjids');
  
  // Owner Password Change States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  const handleChangeOwnerPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (!oldPassword.trim()) {
      setPasswordErrorMsg('Mohon masukkan kata sandi saat ini.');
      return;
    }
    if (newPassword.length < 5) {
      setPasswordErrorMsg('Kata sandi baru minimal 5 karakter demi keamanan.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Konfirmasi kata sandi baru tidak cocok. Periksa kembali.');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      const res = authService.updateUserPassword(
        currentUser.id || currentUser.username,
        oldPassword,
        newPassword
      );
      setIsChangingPassword(false);
      if (res.success) {
        setPasswordSuccessMsg(res.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Kata sandi Owner berhasil diperbarui!', 'success');
      } else {
        setPasswordErrorMsg(res.message);
      }
    }, 300);
  };

  // Reset Tickets State for Super Admin / Owner
  const [resetTickets, setResetTickets] = useState<PasswordResetTicket[]>(() => ownerService.getResetTickets());
  const [isRefreshingTickets, setIsRefreshingTickets] = useState(false);

  const refreshResetTickets = (isManual = false) => {
    if (isManual) setIsRefreshingTickets(true);
    ownerService.fetchResetTicketsFromServer().then((tickets) => {
      setResetTickets(tickets);
    }).catch(() => {
      setResetTickets(ownerService.getResetTickets());
    }).finally(() => {
      if (isManual) {
        setTimeout(() => setIsRefreshingTickets(false), 400);
      }
    });
  };

  // Sync tickets on mount and whenever tab changes, plus auto-refresh every 5s on security tab
  React.useEffect(() => {
    refreshResetTickets();

    if (activeTab === 'security_settings') {
      const interval = setInterval(() => {
        refreshResetTickets(false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const [ticketFilter, setTicketFilter] = useState<'pending' | 'resolved' | 'all'>('pending');

  const handleResolveTicket = (ticketId: string) => {
    const res = ownerService.resolveResetTicket(ticketId);
    if (res.success) {
      showToast(res.message, 'success');
      refreshResetTickets();
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    ownerService.deleteResetTicket(ticketId);
    showToast('Tiket antrean berhasil dihapus.', 'info');
    refreshResetTickets();
  };

  const handleClearResolvedTickets = () => {
    if (confirm('Bersihkan seluruh riwayat tiket yang sudah selesai digunakan?')) {
      ownerService.deleteResetTicket('clear-resolved');
      showToast('Seluruh riwayat tiket selesai telah dibersihkan.', 'success');
      refreshResetTickets();
    }
  };

  // WhatsApp Gateway Management States
  const [waConfig, setWaConfig] = useState<WhatsAppGatewayConfig>({
    enabled: true,
    provider: 'fonnte',
    apiToken: '',
    customEndpoint: 'https://api.fonnte.com/send',
    senderName: 'SimZakat Official',
  });
  const [waProvider, setWaProvider] = useState<'fonnte' | 'wablas' | 'starsender' | 'waha' | 'custom'>('fonnte');
  const [waToken, setWaToken] = useState('');
  const [waEndpoint, setWaEndpoint] = useState('https://api.fonnte.com/send');
  const [waSenderName, setWaSenderName] = useState('SimZakat Official');
  const [waEnabled, setWaEnabled] = useState(true);
  const [isSavingWa, setIsSavingWa] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [waTestPhone, setWaTestPhone] = useState('081299887766');
  const [waTestResult, setWaTestResult] = useState<{ success: boolean; message: string; status?: string } | null>(null);

  useEffect(() => {
    whatsappService.getConfig().then((cfg) => {
      setWaConfig(cfg);
      setWaProvider(cfg.provider || 'fonnte');
      setWaToken(cfg.apiToken || '');
      setWaEndpoint(cfg.customEndpoint || (cfg.provider === 'wablas' ? 'https://phone.wablas.com/api/send-message' : 'https://api.fonnte.com/send'));
      setWaSenderName(cfg.senderName || 'SimZakat Official');
      setWaEnabled(cfg.enabled !== false);
    });
  }, []);

  const handleSaveWaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWa(true);
    const res = await whatsappService.saveConfig({
      provider: waProvider,
      apiToken: waToken,
      customEndpoint: waEndpoint,
      senderName: waSenderName,
      enabled: waEnabled,
    });
    setIsSavingWa(false);
    if (res.success) {
      setWaConfig(res.config);
      showToast('Pengaturan WhatsApp Gateway berhasil disimpan!', 'success');
    }
  };

  const handleTestWa = async () => {
    if (!waTestPhone.trim()) {
      showToast('Masukkan nomor WhatsApp tujuan uji coba.', 'error');
      return;
    }
    setIsTestingWa(true);
    setWaTestResult(null);
    const res = await whatsappService.testConnection(waTestPhone);
    setIsTestingWa(false);
    setWaTestResult(res);
    if (res.success) {
      showToast('Alhamdulillah, pesan uji coba WhatsApp berhasil dikirim!', 'success');
    } else {
      showToast('Uji kirim gagal: ' + res.message, 'error');
    }
  };
  
  // Status and management handlers
  const handleUpdateStatus = (
    masjidId: string, 
    newStatus: 'active' | 'pending_verification' | 'suspended',
    masjidName?: string
  ) => {
    // 1. Instantly update local state for immediate reactive UI
    setMasjids((prev) => prev.map((m) => m.id === masjidId ? { ...m, status: newStatus } : m));

    // 2. Persist to storage
    ownerService.updateMasjidStatus(masjidId, newStatus);

    // 3. Notify parent component
    onUpdateMasjidStatus(masjidId, newStatus);

    // 4. Update detail or edit modal states if currently open for this masjid
    setDetailModalMasjid((prev) => prev && prev.id === masjidId ? { ...prev, status: newStatus } : prev);
    setEditModalMasjid((prev) => prev && prev.id === masjidId ? { ...prev, status: newStatus } : prev);
    
    const statusLabels = {
      active: 'diverifikasi & AKTIF',
      suspended: 'DITANGGUHKAN (Suspended)',
      pending_verification: 'diubah statusnya menjadi MENUNGGU VERIFIKASI',
    };
    showToast(`Status ${masjidName || 'lembaga'} berhasil ${statusLabels[newStatus]}!`, newStatus === 'suspended' ? 'info' : 'success');
  };

  const handleSaveEditMasjid = (updated: Partial<MasjidAccount> & { id: string }) => {
    setMasjids((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
    ownerService.updateMasjid(updated);
    onUpdateMasjid?.(updated);
    if (updated.status) {
      onUpdateMasjidStatus(updated.id, updated.status);
    }
    showToast(`Perubahan data lembaga "${updated.name || 'masjid'}" berhasil disimpan!`, 'success');
  };

  const handleSaveNewMasjid = (newM: Omit<MasjidAccount, 'id'>) => {
    const created = ownerService.createMasjid(newM);
    onCreateMasjid?.(newM);
    refreshMasjids();
    showToast(`Lembaga baru "${created.name}" (${created.city}) berhasil didaftarkan!`, 'success');
  };

  const handleConfirmDelete = (m: MasjidAccount) => {
    setConfirmModal({
      isOpen: true,
      title: `Hapus Lembaga ${m.name}?`,
      message: `Apakah Anda yakin ingin menghapus akun ${m.name} (${m.city})? Seluruh data riwayat transaksi posko dan mustahiq akan dibersihkan dari database sistem. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Lembaga',
      confirmColor: 'rose',
      onConfirm: () => {
        ownerService.deleteMasjid(m.id);
        onDeleteMasjid?.(m.id);
        refreshMasjids();
        showToast(`Akun lembaga ${m.name} telah berhasil dihapus dari sistem.`, 'info');
      },
    });
  };

  const handleConfirmResetData = (m: MasjidAccount) => {
    setConfirmModal({
      isOpen: true,
      title: `Reset Data ZISWAF ${m.name}?`,
      message: `Apakah Anda ingin mereset seluruh transaksi zakat fitrah, maal, dan distribusi mustahiq di posko ${m.name} menjadi 0 (bersih)? Akun pengurus dan profil masjid tetap aktif.`,
      confirmText: 'Ya, Bersihkan Data Transaksi',
      confirmColor: 'amber',
      onConfirm: () => {
        ownerService.resetMasjidData(m.id);
        onResetMasjidData?.(m.id);
        refreshMasjids();
        showToast(`Data transaksi zakat posko ${m.name} telah di-reset menjadi 0.`, 'info');
      },
    });
  };

  const handleExportExcel = () => {
    exportMasjidsToExcel(masjids, currentUser);
    showToast('Data rekapitulasi seluruh lembaga berhasil diekspor ke Excel (.xls) ber-kop resmi!', 'success');
  };
  
  // Landing Page CMS Form state
  const [landingForm, setLandingForm] = useState<LandingPageConfig>(() => landingConfig || landingConfigService.getConfig());
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [landingSubTab, setLandingSubTab] = useState<'hero' | 'simulator' | 'features' | 'comparison' | 'faqs' | 'banners_infaq'>('hero');

  // Keep landingForm synchronized when server landingConfig arrives or updates
  React.useEffect(() => {
    if (landingConfig) {
      setLandingForm(landingConfig);
    }
  }, [landingConfig]);

  const handleSaveLandingConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    landingConfigService.saveConfig(landingForm);
    onUpdateLandingConfig?.(landingForm);
    setSaveSuccessNotice(true);
    showToast('Alhamdulillah! Perubahan Landing Page berhasil disimpan permanen ke server VPS.', 'success');
    setTimeout(() => setSaveSuccessNotice(false), 5000);
  };

  const handleResetLandingConfig = () => {
    if (window.confirm('Kembalikan seluruh teks landing page ke pengaturan bawaan (default)?')) {
      setLandingForm(DEFAULT_LANDING_CONFIG);
      landingConfigService.saveConfig(DEFAULT_LANDING_CONFIG);
      onUpdateLandingConfig?.(DEFAULT_LANDING_CONFIG);
      setSaveSuccessNotice(true);
      showToast('Pengaturan landing page dikembalikan ke standar awal.', 'info');
      setTimeout(() => setSaveSuccessNotice(false), 4000);
    }
  };

  // Tier handlers
  const handleAddTier = () => {
    const currentTiers = landingForm.simulatorTiers || [];
    const newTier: PriceTier = {
      id: 'tier_' + Date.now(),
      label: `Kategori Baru (${currentTiers.length + 1})`,
      price: 45000,
    };
    setLandingForm({
      ...landingForm,
      simulatorTiers: [...currentTiers, newTier],
    });
  };

  const handleUpdateTier = (id: string, field: 'label' | 'price', value: string | number) => {
    setLandingForm({
      ...landingForm,
      simulatorTiers: (landingForm.simulatorTiers || []).map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  const handleRemoveTier = (id: string) => {
    const currentTiers = landingForm.simulatorTiers || [];
    if (currentTiers.length <= 1) {
      alert('Minimal harus ada 1 kategori nilai beras.');
      return;
    }
    setLandingForm({
      ...landingForm,
      simulatorTiers: currentTiers.filter((t) => t.id !== id),
    });
  };

  // Feature handlers
  const handleAddFeature = () => {
    const currentFeatures = landingForm.featuresList || [];
    const newFeature: FeatureItem = {
      id: 'f_' + Date.now(),
      title: 'Fitur Unggulan Baru',
      description: 'Jelaskan manfaat praktis dari fitur ini bagi amil zakat atau panitia masjid...',
      icon: 'sparkles',
    };
    setLandingForm({
      ...landingForm,
      featuresList: [...currentFeatures, newFeature],
    });
  };

  const handleUpdateFeature = (id: string, field: 'title' | 'description' | 'icon', value: string) => {
    setLandingForm({
      ...landingForm,
      featuresList: (landingForm.featuresList || []).map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      ),
    });
  };

  const handleRemoveFeature = (id: string) => {
    const currentFeatures = landingForm.featuresList || [];
    if (currentFeatures.length <= 1) {
      alert('Minimal harus ada 1 fitur yang ditampilkan.');
      return;
    }
    setLandingForm({
      ...landingForm,
      featuresList: currentFeatures.filter((f) => f.id !== id),
    });
  };

  // Comparison handlers
  const handleAddComparison = () => {
    const currentRows = landingForm.comparisonRows || [];
    const newRow: ComparisonRow = {
      id: 'c_' + Date.now(),
      need: 'Aspek Kebutuhan Baru',
      manual: 'Kendala pada sistem pencatatan buku lama...',
      digital: 'Solusi cepat dan otomatis dengan SimZakat...',
    };
    setLandingForm({
      ...landingForm,
      comparisonRows: [...currentRows, newRow],
    });
  };

  const handleUpdateComparison = (id: string, field: 'need' | 'manual' | 'digital', value: string) => {
    setLandingForm({
      ...landingForm,
      comparisonRows: (landingForm.comparisonRows || []).map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    });
  };

  const handleRemoveComparison = (id: string) => {
    const currentRows = landingForm.comparisonRows || [];
    if (currentRows.length <= 1) {
      alert('Minimal harus ada 1 baris perbandingan.');
      return;
    }
    setLandingForm({
      ...landingForm,
      comparisonRows: currentRows.filter((c) => c.id !== id),
    });
  };

  // FAQ handlers
  const handleAddFaq = () => {
    const currentFaqs = landingForm.faqsList || [];
    const newFaq: FaqItem = {
      id: 'faq_' + Date.now(),
      q: 'Pertanyaan baru mengenai SimZakat?',
      a: 'Tuliskan jawaban yang ramah dan solutif untuk amil...',
    };
    setLandingForm({
      ...landingForm,
      faqsList: [...currentFaqs, newFaq],
    });
  };

  const handleUpdateFaq = (id: string, field: 'q' | 'a', value: string) => {
    setLandingForm({
      ...landingForm,
      faqsList: (landingForm.faqsList || []).map((faq) =>
        faq.id === id ? { ...faq, [field]: value } : faq
      ),
    });
  };

  const handleRemoveFaq = (id: string) => {
    const currentFaqs = landingForm.faqsList || [];
    if (currentFaqs.length <= 1) {
      alert('Minimal harus ada 1 pertanyaan FAQ.');
      return;
    }
    setLandingForm({
      ...landingForm,
      faqsList: currentFaqs.filter((faq) => faq.id !== id),
    });
  };

  // QRIS Handlers
  const handleQRISUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar (maksimal 2 MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLandingForm((prev) => ({
        ...prev,
        qrisImageUrl: base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQRIS = () => {
    setLandingForm((prev) => ({
      ...prev,
      qrisImageUrl: '',
    }));
  };

  // Filtered and sorted masjids from reactive local state
  const filteredMasjids = masjids
    .filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.province && m.province.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.address && m.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.contactPhone.includes(searchTerm) ||
        (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'ziswaf') {
        const totalA = (a.totalFitrahCashRp || 0) + (a.totalMaalRp || 0);
        const totalB = (b.totalFitrahCashRp || 0) + (b.totalMaalRp || 0);
        return totalB - totalA;
      }
      if (sortBy === 'souls') {
        return (b.totalMuzakkiSouls || 0) - (a.totalMuzakkiSouls || 0);
      }
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  // Calculate platform totals
  const totalMasjids = masjids.length;
  const activeCount = masjids.filter((m) => m.status === 'active').length;
  const pendingCount = masjids.filter((m) => m.status === 'pending_verification').length;
  const suspendedCount = masjids.filter((m) => m.status === 'suspended').length;
  const totalSouls = masjids.reduce((acc, m) => acc + (m.totalMuzakkiSouls || 0), 0);
  const totalRiceKg = masjids.reduce((acc, m) => acc + (m.totalFitrahRiceKg || 0), 0);
  const totalFitrahCashRp = masjids.reduce((acc, m) => acc + (m.totalFitrahCashRp || 0), 0);
  const totalMaalRp = masjids.reduce((acc, m) => acc + (m.totalMaalRp || 0), 0);
  const totalZiswafRp = totalFitrahCashRp + totalMaalRp;

  const handleDownloadSQL = () => {
    window.open('/api/export-sql', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">Sim<span className="text-purple-400">Zakat</span> Master</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase tracking-wider border border-purple-400/30">
                  Owner Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">Pusat Kendali Seluruh Masjid & Database Indonesia</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onGoToLanding}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Halaman Depan
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="hidden md:flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
                <div className="text-[11px] text-purple-400 font-mono">@{currentUser.username}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('security_settings')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'security_settings'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:bg-purple-900/50'
              }`}
              title="Ganti Kata Sandi Akun Owner"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Ganti Sandi</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Keluar Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Dynamic Action Toast Feedback */}
        {toastNotice && (
          <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-2xl transition-all duration-300 border ${
            toastNotice.type === 'success' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' 
              : toastNotice.type === 'error'
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
              : 'bg-amber-500/20 border-amber-500/50 text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {toastNotice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span>{toastNotice.message}</span>
            </div>
            <button 
              onClick={() => setToastNotice(null)} 
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Welcome Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-800/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ringkasan Eksekutif Nasional ZISWAF 1447 H / 2026 M</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Selamat Datang, Administrator Platform
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Anda memiliki kendali penuh atas verifikasi lembaga masjid/DKM, pengawasan data penerimaan zakat nasional, skema tabel MySQL, serta deployment VPS.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadSQL}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer"
                title="Unduh skema schema.sql untuk import ke MySQL VPS"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Schema SQL MySQL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Platform Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Masjid Terdaftar</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalMasjids}</div>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className="text-emerald-400 font-bold">{activeCount} Aktif</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">{pendingCount} Menunggu Verifikasi</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Jiwa Muzakki Tercatat</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{totalSouls} Jiwa</div>
            <div className="text-[11px] text-slate-400 mt-2">Dari seluruh posko se-Indonesia</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Beras Terkumpul</span>
              <span className="text-amber-400 font-bold text-xs">Beras Fitrah</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{formatKg(totalRiceKg)}</div>
            <div className="text-[11px] text-slate-400 mt-2">Stok beras siap salur ke 8 Asnaf</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Kas ZISWAF Masuk</span>
              <span className="text-teal-400 font-bold text-xs">Uang Tunai</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300">{formatRupiah(totalZiswafRp)}</div>
            <div className="text-[11px] text-slate-400 mt-2">Fitrah Tunai + Maal + Infaq</div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('masjids')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'masjids'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manajemen Lembaga & Masjid ({masjidsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('landing_settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'landing_settings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Pengaturan Landing Page & Infaq</span>
          </button>

          <button
            onClick={() => setActiveTab('fiqh_guidelines')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'fiqh_guidelines'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Pedoman Fiqih, Doa & Kriteria Asnaf</span>
          </button>

          <button
            onClick={() => setActiveTab('database_server')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'database_server'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Koneksi MySQL & Panduan VPS</span>
          </button>

          <button
            onClick={() => setActiveTab('security_settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'security_settings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Keamanan Akun & Sandi Owner</span>
          </button>
        </div>

        {/* TAB 1: Masjids Management */}
        {activeTab === 'masjids' && (
          <div className="space-y-4">
            
            {/* Top Toolbar: Filter, Search, Sort & Action Buttons */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              
              <div className="flex flex-col sm:flex-row gap-2.5 items-center flex-1">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, kota, kontak, atau ketua..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-medium focus:outline-hidden focus:border-purple-500 w-full sm:w-auto cursor-pointer"
                  >
                    <option value="name">Urutkan: Nama Lembaga (A-Z)</option>
                    <option value="ziswaf">Urutkan: ZISWAF Terbanyak</option>
                    <option value="souls">Urutkan: Jiwa Muzakki Terbanyak</option>
                    <option value="recent">Urutkan: Paling Baru Terdaftar</option>
                    <option value="status">Urutkan: Berdasarkan Status</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons: Add Masjid & Export CSV */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  title="Unduh rekapitulasi data seluruh lembaga masjid ke Excel (.xls) ber-kop resmi"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Ekspor Excel (.xls)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                  title="Daftarkan lembaga masjid baru langsung dari Dashboard Owner"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Daftarkan Lembaga Baru</span>
                </button>
              </div>

            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/80'
                }`}
              >
                <span>Semua Lembaga</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{totalMasjids}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-emerald-300 border border-slate-700/80'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aktif (Verified)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{activeCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('pending_verification')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'pending_verification'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-amber-300 border border-slate-700/80'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Menunggu Verifikasi</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{pendingCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'suspended'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-rose-300 border border-slate-700/80'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Ditangguhkan (Suspended)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{suspendedCount}</span>
              </button>
            </div>

            {/* Masjids Table */}
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/80 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/95 text-slate-400 font-bold border-b border-slate-700/80 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Nama Lembaga & Wilayah</th>
                      <th className="py-3.5 px-4">Pengurus DKM & Kontak</th>
                      <th className="py-3.5 px-4 text-center">Status & Aksi Status Cepat</th>
                      <th className="py-3.5 px-4 text-right">Akumulasi ZISWAF 1447 H</th>
                      <th className="py-3.5 px-4 text-center min-w-[200px]">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredMasjids.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <div className="font-semibold text-slate-400">Tidak ada data lembaga yang sesuai kriteria pencarian.</div>
                          <div className="text-[11px] text-slate-500 mt-1">Coba ubah kata kunci atau klik tombol "+ Daftarkan Lembaga Baru" di atas.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredMasjids.map((m) => {
                        const totalDana = (m.totalFitrahCashRp || 0) + (m.totalMaalRp || 0);

                        // WA URL for direct chat
                        const cleanPhone = m.contactPhone.replace(/[^0-9]/g, '');
                        const waNumber = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
                        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Assalamu'alaikum, kami dari SimZakat Pusat mengonfirmasi posko ${m.name}.`)}`;

                        return (
                          <tr key={m.id} className="hover:bg-slate-800/50 transition">
                            {/* Masjid & Lokasi */}
                            <td className="py-4 px-4 align-top">
                              <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                <span>{m.name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{m.city}, {m.province || 'Indonesia'}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5 line-clamp-1">{m.address}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
                                <span>Terdaftar: {new Date(m.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                              </div>
                            </td>

                            {/* Ketua & Kontak */}
                            <td className="py-4 px-4 align-top">
                              <div className="font-semibold text-slate-200">{m.leadName}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-mono text-emerald-400 font-bold">{m.contactPhone}</span>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 transition"
                                  title="Chat WhatsApp pengurus"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{m.email}</div>
                            </td>

                            {/* Status & Aksi Status Cepat */}
                            <td className="py-4 px-4 align-top text-center min-w-[170px]">
                              {/* Status Badge */}
                              <div className="mb-2">
                                {m.status === 'active' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Aktif (Verified)
                                  </span>
                                )}
                                {m.status === 'pending_verification' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Menunggu Verifikasi
                                  </span>
                                )}
                                {m.status === 'suspended' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-[10px]">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Ditangguhkan
                                  </span>
                                )}
                              </div>

                              {/* Interactive Direct Dropdown Selector */}
                              <div className="mb-2">
                                <select
                                  value={m.status}
                                  onChange={(e) => handleUpdateStatus(m.id, e.target.value as any, m.name)}
                                  className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer appearance-none text-center outline-hidden ${
                                    m.status === 'active'
                                      ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-200 hover:border-emerald-400'
                                      : m.status === 'pending_verification'
                                      ? 'bg-amber-950/80 border-amber-600/70 text-amber-200 hover:border-amber-400'
                                      : 'bg-rose-950/80 border-rose-600/70 text-rose-200 hover:border-rose-400'
                                  }`}
                                  title="Pilih langsung status untuk mengubah status lembaga ini"
                                >
                                  <option value="active" className="bg-slate-900 text-emerald-300">✓ Aktif (Verified)</option>
                                  <option value="pending_verification" className="bg-slate-900 text-amber-300">⏳ Menunggu Verifikasi</option>
                                  <option value="suspended" className="bg-slate-900 text-rose-300">⚠ Ditangguhkan (Suspend)</option>
                                </select>
                              </div>

                              {/* Interactive Quick Status Action Buttons */}
                              <div className="flex flex-wrap items-center justify-center gap-1">
                                {m.status === 'pending_verification' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(m.id, 'active', m.name)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                                      title="Setujui dan aktifkan lembaga ini"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Setujui</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(m.id, 'suspended', m.name)}
                                      className="px-2 py-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold rounded-lg text-[10px] transition cursor-pointer"
                                      title="Tolak permohonan pendaftaran"
                                    >
                                      <span>Tolak</span>
                                    </button>
                                  </>
                                )}

                                {m.status === 'active' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(m.id, 'suspended', m.name)}
                                      className="px-2 py-0.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold rounded-lg text-[10px] transition cursor-pointer"
                                      title="Tangguhkan sementara posko masjid ini"
                                    >
                                      <span>Suspend</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(m.id, 'pending_verification', m.name)}
                                      className="px-2 py-0.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold rounded-lg text-[10px] transition cursor-pointer"
                                      title="Kembalikan status ke Menunggu Verifikasi"
                                    >
                                      <span>Set Pending</span>
                                    </button>
                                  </>
                                )}

                                {m.status === 'suspended' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(m.id, 'active', m.name)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                                      title="Pulihkan dan aktifkan kembali akun lembaga"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Pulihkan</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(m.id, 'pending_verification', m.name)}
                                      className="px-2 py-1 bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold rounded-lg text-[10px] transition cursor-pointer"
                                      title="Ubah status ke Menunggu Verifikasi"
                                    >
                                      <span>Set Pending</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Akumulasi ZISWAF */}
                            <td className="py-4 px-4 align-top text-right">
                              <div className="font-extrabold text-amber-400">{formatKg(m.totalFitrahRiceKg || 0)}</div>
                              <div className="text-[11px] text-teal-300 font-medium">{formatRupiah(totalDana)}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {m.totalTransactions || 0} transaksi ({m.totalMuzakkiSouls || 0} jiwa)
                              </div>
                              <div className="text-[10px] text-purple-300 font-semibold mt-0.5">
                                {m.totalMustahiqCount || 0} Mustahiq Terdata
                              </div>
                            </td>

                            {/* Aksi Manajemen Lengkap */}
                            <td className="py-4 px-4 align-top">
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                
                                {/* Tombol Utama: Buka Posko */}
                                <button
                                  type="button"
                                  onClick={() => onSelectMasjidToManage(m)}
                                  className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center justify-center gap-1.5 shadow-sm shadow-purple-600/30 cursor-pointer"
                                  title="Masuk sebagai DKM dan kelola operasional posko masjid ini"
                                >
                                  <span>Buka Posko</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>

                                {/* Tombol Sekunder: Detail & Edit */}
                                <div className="grid grid-cols-2 gap-1.5 w-full">
                                  <button
                                    type="button"
                                    onClick={() => setDetailModalMasjid(m)}
                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                    title="Lihat detail lengkap, kontak, dan statistik posko"
                                  >
                                    <Eye className="w-3 h-3 text-indigo-400" />
                                    <span>Detail</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setEditModalMasjid(m)}
                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-750 text-sky-300 border border-sky-500/30 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                    title="Edit data profil lembaga masjid"
                                  >
                                    <Edit3 className="w-3 h-3 text-sky-400" />
                                    <span>Edit</span>
                                  </button>
                                </div>

                                {/* Menu Tindakan Tambahan: Reset Transaksi & Hapus */}
                                <div className="flex items-center justify-center gap-2 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmResetData(m)}
                                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer transition"
                                    title="Reset seluruh transaksi zakat posko ini menjadi 0 (bersih)"
                                  >
                                    Reset Transaksi
                                  </button>
                                  <span className="text-slate-600">•</span>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelete(m)}
                                    className="text-[10px] text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer transition"
                                    title="Hapus lembaga ini dari database SimZakat"
                                  >
                                    Hapus
                                  </button>
                                </div>

                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Summary */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                <div>
                  Menampilkan <strong className="text-white">{filteredMasjids.length}</strong> dari <strong className="text-white">{masjids.length}</strong> lembaga terdaftar di seluruh Indonesia
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Total Jiwa Terkumpul: <strong className="text-emerald-400">{totalSouls} Jiwa</strong></span>
                  <span>Total Kas Masuk: <strong className="text-teal-300">{formatRupiah(totalZiswafRp)}</strong></span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Pengaturan Landing Page & Donasi CMS */}
        {activeTab === 'landing_settings' && (
          <div className="space-y-6">
            
            {/* Top Info Banner & Notification */}
            {saveSuccessNotice && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-200 flex items-center justify-between text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 font-bold">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Pengaturan Landing Page & Infaq Operasional berhasil disimpan dan langsung aktif di sistem!</span>
                </div>
                <button
                  type="button"
                  onClick={onGoToLanding}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  Lihat Beranda →
                </button>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <span>Manajemen Konten Halaman Depan (Landing Page CMS)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ubah teks promosi, pengumuman, ayat Al-Qur'an, rekening infaq pengembang, dan kontak tanpa perlu mengubah kode sumber.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveLandingConfig()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer"
                  title="Simpan seluruh perubahan ke server VPS & MySQL"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetLandingConfig}
                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Kembalikan semua teks ke default awal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={onGoToLanding}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Tampilan Live</span>
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation for Landing CMS */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setLandingSubTab('hero')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  landingSubTab === 'hero'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bilah Atas, Ayat & Hero</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingSubTab('simulator')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  landingSubTab === 'simulator'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>1. Simulasi Cepat Posko</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingSubTab('features')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  landingSubTab === 'features'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Fitur Lengkap Posko</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingSubTab('comparison')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  landingSubTab === 'comparison'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>3. Buku Kertas vs SimZakat</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingSubTab('faqs')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  landingSubTab === 'faqs'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>4. Pertanyaan Umum (FAQ)</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingSubTab('banners_infaq')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  landingSubTab === 'banners_infaq'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>5. Banner Infaq, CTA & Footer</span>
              </button>
            </div>

            {/* Main Settings Form */}
            <form onSubmit={handleSaveLandingConfig} className="space-y-6">
              
              {/* SUBTAB 1: HEADER, AYAT & HERO */}
              {landingSubTab === 'hero' && (
                <div className="space-y-6">
                  {/* Section: Top Announcement Bar */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Bilah Pengumuman Atas (Top Announcement Bar)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Badge Label
                        </label>
                        <input
                          type="text"
                          value={landingForm.announcementBadge}
                          onChange={(e) => setLandingForm({ ...landingForm, announcementBadge: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                          placeholder="Misal: Dakwah Digital"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Teks Isi Pengumuman
                        </label>
                        <input
                          type="text"
                          value={landingForm.announcementText}
                          onChange={(e) => setLandingForm({ ...landingForm, announcementText: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                          placeholder="Misal: Sistem Informasi Manajemen Zakat Standar Kemenag RI, MUI & Had Kifayah BAZNAS"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Ayat Al-Qur'an & Terjemahan */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Ayat Al-Qur'an & Terjemahan (Hero Header Card)</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Lafal Ayat Arab
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={landingForm.heroAyatArabic}
                          onChange={(e) => setLandingForm({ ...landingForm, heroAyatArabic: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-arabic text-xl text-right focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Terjemahan Bahasa Indonesia
                          </label>
                          <input
                            type="text"
                            value={landingForm.heroAyatTranslation}
                            onChange={(e) => setLandingForm({ ...landingForm, heroAyatTranslation: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Referensi Surat
                          </label>
                          <input
                            type="text"
                            value={landingForm.heroAyatRef}
                            onChange={(e) => setLandingForm({ ...landingForm, heroAyatRef: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                            placeholder="Misal: QS. At-Taubah: 103"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Hero Headline & Subtitle */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <FileCode className="w-4 h-4 text-teal-400" />
                      <span>Headline Utama & Deskripsi Pengenalan</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Kalimat Depan Judul
                        </label>
                        <input
                          type="text"
                          value={landingForm.heroHeadline}
                          onChange={(e) => setLandingForm({ ...landingForm, heroHeadline: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                          placeholder="Pencatatan Zakat Lebih"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Kata Kunci Highlight (Warna Gradasi)
                        </label>
                        <input
                          type="text"
                          value={landingForm.heroHeadlineHighlight}
                          onChange={(e) => setLandingForm({ ...landingForm, heroHeadlineHighlight: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                          placeholder="Amanah, Transparan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Paragraf Deskripsi / Subtitle Hero
                      </label>
                      <textarea
                        rows={3}
                        value={landingForm.heroSubtitle}
                        onChange={(e) => setLandingForm({ ...landingForm, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Section: Counter Bar Labels */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <Users className="w-4 h-4 text-sky-400" />
                      <span>Label Statistik Counter Bar (Dihitung Real-time dari Database)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Label Kolom 1 (Masjid)</label>
                        <input
                          type="text"
                          value={landingForm.statsLabel1}
                          onChange={(e) => setLandingForm({ ...landingForm, statsLabel1: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Label Kolom 2 (Muzakki)</label>
                        <input
                          type="text"
                          value={landingForm.statsLabel2}
                          onChange={(e) => setLandingForm({ ...landingForm, statsLabel2: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Label Kolom 3 (Beras)</label>
                        <input
                          type="text"
                          value={landingForm.statsLabel3}
                          onChange={(e) => setLandingForm({ ...landingForm, statsLabel3: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Label Kolom 4 (Dana Kas)</label>
                        <input
                          type="text"
                          value={landingForm.statsLabel4}
                          onChange={(e) => setLandingForm({ ...landingForm, statsLabel4: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: 1. SIMULASI CEPAT POSKO */}
              {landingSubTab === 'simulator' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      <span>Pengaturan Widget Simulasi Cepat Posko (Kalkulator Zakat Fitrah)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Badge Section
                        </label>
                        <input
                          type="text"
                          value={landingForm.simulatorBadge}
                          onChange={(e) => setLandingForm({ ...landingForm, simulatorBadge: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Judul Section
                        </label>
                        <input
                          type="text"
                          value={landingForm.simulatorTitle}
                          onChange={(e) => setLandingForm({ ...landingForm, simulatorTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Subtitle / Deskripsi Pendukung
                        </label>
                        <input
                          type="text"
                          value={landingForm.simulatorSubtitle}
                          onChange={(e) => setLandingForm({ ...landingForm, simulatorSubtitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Standar Takaran Beras (Kg / Jiwa)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={landingForm.simulatorDefaultKg}
                          onChange={(e) => setLandingForm({ ...landingForm, simulatorDefaultKg: parseFloat(e.target.value) || 2.8 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Tiers List */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Wheat className="w-4 h-4 text-amber-400" />
                          <span>Pilihan Kategori Nilai Beras (SK Kemenag / BAZNAS)</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Daftar pilihan harga beras per jiwa yang muncul pada kalkulator landing page.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddTier}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Kategori</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(landingForm.simulatorTiers || []).map((tier, idx) => (
                        <div
                          key={tier.id}
                          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 flex flex-col sm:flex-row items-center gap-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>

                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              value={tier.label}
                              onChange={(e) => handleUpdateTier(tier.id, 'label', e.target.value)}
                              placeholder="Nama Kategori & Jenis Beras"
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                            />
                          </div>

                          <div className="w-full sm:w-48 flex items-center gap-2">
                            <span className="text-xs text-slate-400">Rp</span>
                            <input
                              type="number"
                              step="1000"
                              value={tier.price}
                              onChange={(e) => handleUpdateTier(tier.id, 'price', parseInt(e.target.value, 10) || 0)}
                              placeholder="Harga"
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-xs"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveTier(tier.id)}
                            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                            title="Hapus Kategori Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: 2. FITUR LENGKAP POSKO */}
              {landingSubTab === 'features' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>Header Bagian "Fitur Lengkap Posko"</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Badge Section
                        </label>
                        <input
                          type="text"
                          value={landingForm.featuresBadge}
                          onChange={(e) => setLandingForm({ ...landingForm, featuresBadge: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Judul Utama Fitur
                        </label>
                        <input
                          type="text"
                          value={landingForm.featuresTitle}
                          onChange={(e) => setLandingForm({ ...landingForm, featuresTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Subtitle Deskripsi
                      </label>
                      <input
                        type="text"
                        value={landingForm.featuresSubtitle}
                        onChange={(e) => setLandingForm({ ...landingForm, featuresSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Features Cards Editor */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Daftar Kartu Fitur Unggulan (Total: {(landingForm.featuresList || []).length})</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ubah judul, pilihan ikon, dan penjelasan keunggulan aplikasi.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Kartu Fitur</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(landingForm.featuresList || []).map((feature, idx) => (
                        <div
                          key={feature.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-purple-400">
                              Kartu #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(feature.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                              title="Hapus Kartu Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] text-slate-400 mb-1">Judul Fitur</label>
                              <input
                                type="text"
                                value={feature.title}
                                onChange={(e) => handleUpdateFeature(feature.id, 'title', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Ikon Simbol</label>
                              <select
                                value={feature.icon}
                                onChange={(e) => handleUpdateFeature(feature.id, 'icon', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 text-xs font-semibold"
                              >
                                <option value="receipt">receipt (Struk/Kuitansi)</option>
                                <option value="scale">scale (Timbangan/Syariah)</option>
                                <option value="calculator">calculator (Hitung)</option>
                                <option value="users">users (Jamaah/Mustahiq)</option>
                                <option value="file-text">file-text (BAST/LPJ)</option>
                                <option value="database">database (MySQL/VPS)</option>
                                <option value="shield">shield (Amanah/Verifikasi)</option>
                                <option value="heart">heart (Infaq/Dakwah)</option>
                                <option value="printer">printer (Thermal Print)</option>
                                <option value="share">share (WhatsApp)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Deskripsi Singkat Fitur</label>
                            <textarea
                              rows={2}
                              value={feature.description}
                              onChange={(e) => handleUpdateFeature(feature.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: 3. BUKU KERTAS VS SIMZAKAT */}
              {landingSubTab === 'comparison' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span>Header Tabel Perbandingan "Buku Kertas vs SimZakat"</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Teks Judul Awal
                        </label>
                        <input
                          type="text"
                          value={landingForm.comparisonTitle}
                          onChange={(e) => setLandingForm({ ...landingForm, comparisonTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          placeholder="Buku Kertas Tradisional vs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Teks Kata Kunci Highlight (Warna Hijau)
                        </label>
                        <input
                          type="text"
                          value={landingForm.comparisonHighlight}
                          onChange={(e) => setLandingForm({ ...landingForm, comparisonHighlight: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs"
                          placeholder="SimZakat Digital"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Subtitle Penjelasan Perbandingan
                      </label>
                      <input
                        type="text"
                        value={landingForm.comparisonSubtitle}
                        onChange={(e) => setLandingForm({ ...landingForm, comparisonSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Header Kolom 1 (Aspek)</label>
                        <input
                          type="text"
                          value={landingForm.comparisonHeaderNeed}
                          onChange={(e) => setLandingForm({ ...landingForm, comparisonHeaderNeed: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Header Kolom 2 (Buku Manual)</label>
                        <input
                          type="text"
                          value={landingForm.comparisonHeaderManual}
                          onChange={(e) => setLandingForm({ ...landingForm, comparisonHeaderManual: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-rose-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Header Kolom 3 (SimZakat)</label>
                        <input
                          type="text"
                          value={landingForm.comparisonHeaderDigital}
                          onChange={(e) => setLandingForm({ ...landingForm, comparisonHeaderDigital: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comparison Rows List */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Scale className="w-4 h-4 text-emerald-400" />
                          <span>Baris Poin Perbandingan (Total: {(landingForm.comparisonRows || []).length})</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tampilkan kontras antara kesulitan buku manual vs keunggulan SimZakat.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddComparison}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Poin</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(landingForm.comparisonRows || []).map((row, idx) => (
                        <div
                          key={row.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-400">Poin Perbandingan #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveComparison(row.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                              title="Hapus Poin Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Kebutuhan / Aspek</label>
                              <input
                                type="text"
                                value={row.need}
                                onChange={(e) => handleUpdateComparison(row.id, 'need', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-rose-400 mb-1">Kendala Buku Manual (Merah)</label>
                              <input
                                type="text"
                                value={row.manual}
                                onChange={(e) => handleUpdateComparison(row.id, 'manual', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-rose-500/30 text-rose-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-emerald-400 mb-1">Solusi SimZakat Digital (Hijau)</label>
                              <input
                                type="text"
                                value={row.digital}
                                onChange={(e) => handleUpdateComparison(row.id, 'digital', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-200 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: 4. PERTANYAAN UMUM (FAQ) */}
              {landingSubTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Header Bagian "Pertanyaan Umum" (FAQ)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Badge Section
                        </label>
                        <input
                          type="text"
                          value={landingForm.faqBadge}
                          onChange={(e) => setLandingForm({ ...landingForm, faqBadge: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Judul Utama FAQ
                        </label>
                        <input
                          type="text"
                          value={landingForm.faqTitle}
                          onChange={(e) => setLandingForm({ ...landingForm, faqTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Subtitle FAQ (Opsional)
                      </label>
                      <input
                        type="text"
                        value={landingForm.faqSubtitle}
                        onChange={(e) => setLandingForm({ ...landingForm, faqSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* FAQ Items List */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-emerald-400" />
                          <span>Daftar Pertanyaan & Jawaban (Total: {(landingForm.faqsList || []).length})</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Pertanyaan yang sering diajukan oleh DKM, amil posko, dan muzakki.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pertanyaan</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(landingForm.faqsList || []).map((faq, idx) => (
                        <div
                          key={faq.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-400">Pertanyaan #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFaq(faq.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                              title="Hapus Pertanyaan Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Pertanyaan (Q)</label>
                            <input
                              type="text"
                              value={faq.q}
                              onChange={(e) => handleUpdateFaq(faq.id, 'q', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Jawaban & Penjelasan (A)</label>
                            <textarea
                              rows={3}
                              value={faq.a}
                              onChange={(e) => handleUpdateFaq(faq.id, 'a', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 6: 5. BANNER INFAQ, CTA & FOOTER */}
              {landingSubTab === 'banners_infaq' && (
                <div className="space-y-6">
                  {/* Sustainability Section Banner */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                      <span>Banner Bagian Infaq Dakwah & Sustainability (100% Gratis)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Judul Banner Dakwah
                        </label>
                        <input
                          type="text"
                          value={landingForm.sustainabilityTitle}
                          onChange={(e) => setLandingForm({ ...landingForm, sustainabilityTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Teks Tombol Infaq
                        </label>
                        <input
                          type="text"
                          value={landingForm.sustainabilityButtonText}
                          onChange={(e) => setLandingForm({ ...landingForm, sustainabilityButtonText: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Deskripsi Ajakan Khidmah & Infaq Operasional (Di Halaman Beranda)
                      </label>
                      <textarea
                        rows={2}
                        value={landingForm.sustainabilityDescription}
                        onChange={(e) => setLandingForm({ ...landingForm, sustainabilityDescription: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    {/* Section Khusus: Konten Dialog Pop-Up Infaq Operasional */}
                    <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-4">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs border-b border-purple-800/40 pb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Kustomisasi Teks Dialog Pop-Up Infaq Donasi (Donation Modal)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Badge Atas Dialog
                          </label>
                          <input
                            type="text"
                            value={landingForm.donationSubtitle || ''}
                            placeholder="KHIDMAH DAKWAH & SEDEKAH JARIYAH"
                            onChange={(e) => setLandingForm({ ...landingForm, donationSubtitle: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Judul Utama Dialog
                          </label>
                          <input
                            type="text"
                            value={landingForm.donationTitle || ''}
                            placeholder="Infaq Operasional SimZakat"
                            onChange={(e) => setLandingForm({ ...landingForm, donationTitle: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Teks Sapaan & Penjelasan Aplikasi</span>
                          <span className="text-[10px] text-emerald-400 font-normal">
                            * Nama masjid otomatis disisipkan di awal: "Ahlan wa Sahlan, Pengurus [Nama Masjid]. "
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          value={landingForm.donationDescription || ''}
                          placeholder="Aplikasi SimZakat disediakan 100% Gratis tanpa biaya lisensi agar setiap masjid dan musholla dapat mengelola zakat secara amanah dan profesional."
                          onChange={(e) => setLandingForm({ ...landingForm, donationDescription: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Judul Kotak Penjelasan
                          </label>
                          <input
                            type="text"
                            value={landingForm.donationReasonTitle || ''}
                            placeholder="Mengapa Infaq Pengembangan Ini Dibutuhkan?"
                            onChange={(e) => setLandingForm({ ...landingForm, donationReasonTitle: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Isi Penjelasan Kotak Hijau
                          </label>
                          <textarea
                            rows={2}
                            value={landingForm.donationReasonText || ''}
                            placeholder="Untuk menjaga kelangsungan sistem, penyediaan server VPS berkecepatan tinggi, pemeliharaan basis data MySQL, sertifikat keamanan SSL, dan pembaruan fiqih zakat berkala. Amil dapat menyisihkan donasi sukarela ini dari bagian hak amil / infaq operasional masjid sesuai kerelaan."
                            onChange={(e) => setLandingForm({ ...landingForm, donationReasonText: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bank Accounts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Bank 1: BSI */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-3">
                        <div className="flex items-center justify-between text-teal-400 font-bold text-xs">
                          <span>Rekening 1: Syariah (BSI)</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">Utama</span>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nama Bank</label>
                          <input
                            type="text"
                            value={landingForm.bsiBankName}
                            onChange={(e) => setLandingForm({ ...landingForm, bsiBankName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nomor Rekening</label>
                          <input
                            type="text"
                            value={landingForm.bsiAccountNumber}
                            onChange={(e) => setLandingForm({ ...landingForm, bsiAccountNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Atas Nama (Rekening)</label>
                          <input
                            type="text"
                            value={landingForm.bsiAccountHolder}
                            onChange={(e) => setLandingForm({ ...landingForm, bsiAccountHolder: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      {/* Bank 2: BCA */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-3">
                        <div className="flex items-center justify-between text-blue-400 font-bold text-xs">
                          <span>Rekening 2: Transfer Bank (BCA)</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Konvensional</span>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nama Bank</label>
                          <input
                            type="text"
                            value={landingForm.bcaBankName}
                            onChange={(e) => setLandingForm({ ...landingForm, bcaBankName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nomor Rekening</label>
                          <input
                            type="text"
                            value={landingForm.bcaAccountNumber}
                            onChange={(e) => setLandingForm({ ...landingForm, bcaAccountNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Atas Nama (Rekening)</label>
                          <input
                            type="text"
                            value={landingForm.bcaAccountHolder}
                            onChange={(e) => setLandingForm({ ...landingForm, bcaAccountHolder: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* QRIS Upload & Image Setting */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <span>QRIS Donasi Resmi (Scan Semua E-Wallet & Mobile Banking)</span>
                              {landingForm.qrisImageUrl && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                  Aktif
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Upload gambar barcode QRIS (PNG/JPG) yang akan tampil di modal pop-up donasi saat memilih "Tampilkan QRIS".
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* Preview Box */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center">
                          <div className="w-48 h-48 rounded-2xl bg-white p-3 border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center overflow-hidden shadow-lg relative group">
                            {landingForm.qrisImageUrl ? (
                              <>
                                <img
                                  src={landingForm.qrisImageUrl}
                                  alt="Preview QRIS"
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={handleRemoveQRIS}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-3 text-slate-400 flex flex-col items-center gap-2">
                                <QrCode className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                                <div className="text-[11px] font-bold text-slate-600">
                                  Belum Ada Gambar QRIS
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  Format JPG/PNG (Maks. 2MB)
                                </span>
                              </div>
                            )}
                          </div>
                          {landingForm.qrisImageUrl && (
                            <span className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              QRIS Siap Ditampilkan
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="md:col-span-8 space-y-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                              1. Upload File Gambar QRIS (Rekomendasi)
                            </label>
                            <div className="flex flex-wrap items-center gap-3">
                              <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30">
                                <Upload className="w-4 h-4" />
                                <span>{landingForm.qrisImageUrl ? 'Ganti File Gambar QRIS...' : 'Pilih File Gambar QRIS...'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleQRISUpload}
                                  className="hidden"
                                />
                              </label>

                              {landingForm.qrisImageUrl && (
                                <button
                                  type="button"
                                  onClick={handleRemoveQRIS}
                                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-400 border border-slate-700 hover:border-rose-700/50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Hapus QRIS</span>
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5">
                              Pilih barcode QRIS dari HP atau laptop Anda. Berkas akan otomatis disimpan secara langsung.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800">
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              2. Atau Masukkan URL Gambar QRIS Online
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={landingForm.qrisImageUrl || ''}
                                onChange={(e) => setLandingForm({ ...landingForm, qrisImageUrl: e.target.value })}
                                placeholder="https://contoh-domain.com/qris-donasi.png"
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Popup upon login */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={landingForm.showDonationOnLogin}
                          onChange={(e) => setLandingForm({ ...landingForm, showDonationOnLogin: e.target.checked })}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-600 bg-slate-800"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-white block">Tampilkan Dialog Ajakan Infaq Otomatis Saat Admin DKM / Amil Login</span>
                          <span className="text-slate-400 text-[11px]">Amil dapat menutupnya secara bebas tanpa batasan akses posko apapun.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Bottom CTA Banner */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Banner Ajakan Bawah (Bottom Call-to-Action)</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Judul Banner CTA
                        </label>
                        <input
                          type="text"
                          value={landingForm.ctaBannerTitle}
                          onChange={(e) => setLandingForm({ ...landingForm, ctaBannerTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Subtitle Banner CTA
                        </label>
                        <input
                          type="text"
                          value={landingForm.ctaBannerSubtitle}
                          onChange={(e) => setLandingForm({ ...landingForm, ctaBannerSubtitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Teks Tombol Daftar Masjid
                          </label>
                          <input
                            type="text"
                            value={landingForm.ctaRegisterBtnText}
                            onChange={(e) => setLandingForm({ ...landingForm, ctaRegisterBtnText: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Teks Tombol Masuk Akun
                          </label>
                          <input
                            type="text"
                            value={landingForm.ctaLoginBtnText}
                            onChange={(e) => setLandingForm({ ...landingForm, ctaLoginBtnText: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Contacts */}
                  <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-slate-700/80 pb-3">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Footer & Kontak Layanan Pengembang</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Nama Brand Footer
                        </label>
                        <input
                          type="text"
                          value={landingForm.footerTitle}
                          onChange={(e) => setLandingForm({ ...landingForm, footerTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Deskripsi Footer
                        </label>
                        <input
                          type="text"
                          value={landingForm.footerDescription}
                          onChange={(e) => setLandingForm({ ...landingForm, footerDescription: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Teks Copyright Footer
                        </label>
                        <input
                          type="text"
                          value={landingForm.footerCopyright}
                          onChange={(e) => setLandingForm({ ...landingForm, footerCopyright: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Nomor WhatsApp Layanan
                        </label>
                        <input
                          type="text"
                          value={landingForm.contactWhatsApp}
                          onChange={(e) => setLandingForm({ ...landingForm, contactWhatsApp: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Email Layanan Pengembang
                        </label>
                        <input
                          type="email"
                          value={landingForm.contactEmail}
                          onChange={(e) => setLandingForm({ ...landingForm, contactEmail: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg sticky bottom-4 z-20">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Semua perubahan disimpan ke database CMS & langsung aktif saat diklik Simpan.</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onGoToLanding}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Halaman Beranda</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Seluruh Pengaturan</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        )}

        {/* TAB 3: Database & Server VPS Details */}
        {activeTab === 'database_server' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: MySQL Schema & Architecture */}
            <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Arsitektur Database MySQL 8.0</h3>
                  <p className="text-xs text-slate-400">File skema resmi: schema.sql (InnoDB, UTF-8 MB4)</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>Skema database dirancang modular dengan 7 tabel terelasi penuh:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">masjids</strong>: ID, Nama, Slug, Alamat, Kota, Kontak, Status Aktivasi</li>
                  <li><strong className="text-slate-200">users</strong>: Akun Owner, Admin DKM, Petugas Amil, Role, Hash Password</li>
                  <li><strong className="text-slate-200">app_configs</strong>: Konfigurasi SK Kemenag, Harga Emas/Perak, Susunan Panitia</li>
                  <li><strong className="text-slate-200">muzakki_transactions</strong>: Transaksi Fitrah, Maal, Infaq, Metode Bayar</li>
                  <li><strong className="text-slate-200">mustahiqs</strong>: Basis data 8 Asnaf, NIK, KK, Alamat, Status Verifikasi</li>
                  <li><strong className="text-slate-200">distribution_records</strong>: Serah terima hak mustahiq & sisa kuota beras</li>
                  <li><strong className="text-slate-200">activity_logs</strong>: Audit trail aktivitas operasional amil</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleDownloadSQL}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File schema.sql</span>
                </button>
              </div>
            </div>

            {/* Card 2: VPS Deployment Checklist */}
            <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Panduan Singkat VPS</h3>
                  <p className="text-xs text-slate-400">Ubuntu 22.04/24.04 LTS + Nginx + PM2</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 space-y-1.5 overflow-x-auto">
                <div># 1. Import Database di VPS:</div>
                <div className="text-slate-300">mysql -u simzakat_user -p simzakat_db &lt; schema.sql</div>
                <div className="pt-1"># 2. Build & Jalankan via PM2:</div>
                <div className="text-slate-300">npm install &amp;&amp; npm run build</div>
                <div className="text-slate-300">pm2 start server.ts --name "simzakat-app" --interpreter ./node_modules/.bin/tsx</div>
                <div className="pt-1"># 3. Setup SSL Gratis Let's Encrypt:</div>
                <div className="text-slate-300">sudo certbot --nginx -d zakat.masjidanda.com</div>
              </div>

              <p className="text-xs text-slate-400">
                Dokumentasi lengkap dan terperinci telah tersedia di berkas <code className="text-purple-300 font-mono">DEPLOY_VPS.md</code> pada akar direktori proyek.
              </p>
            </div>

          </div>
        )}

        {/* TAB 4: Fiqh Guidelines & Asnaf CMS */}
        {activeTab === 'fiqh_guidelines' && (
          <OwnerFiqhSettings currentUser={currentUser} />
        )}

        {/* TAB 5: Security & Owner Password Settings */}
        {activeTab === 'security_settings' && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-purple-800/40 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
                    <KeyRound className="w-3.5 h-3.5 text-purple-300" />
                    <span>Keamanan Sistem & Otentikasi Owner</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Pengaturan Sandi Super Admin (Owner)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Perbarui kata sandi akun Owner secara berkala. Begitu Anda mengganti kata sandi bawaan, hanya Anda yang mengetahui kata sandi baru yang dapat masuk ke Dashboard Owner ini.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/50 text-xs space-y-1.5 shrink-0">
                  <div className="text-purple-300 font-extrabold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Tingkat Hak Akses:</span>
                  </div>
                  <div className="font-bold text-white text-sm">Super Admin / Owner Platform</div>
                  <div className="text-[11px] text-purple-200/80">Otoritas Penuh Database Seluruh Masjid</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form Ganti Password */}
              <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>Formulir Perubahan Kata Sandi Owner</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Karakter minimal: 5
                  </span>
                </div>

                {passwordErrorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}

                {passwordSuccessMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{passwordSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleChangeOwnerPassword} className="space-y-4">
                  {/* Kata Sandi Lama */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Kata Sandi Saat Ini (Lama)
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        placeholder="Masukkan kata sandi saat ini"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      (Bagi akun baru atau belum pernah diubah, kata sandi bawaan adalah: <code className="text-purple-400 font-mono">owner</code>)
                    </p>
                  </div>

                  {/* Kata Sandi Baru */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 5 karakter (kombinasi huruf & angka disarankan)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Ulangi Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan kembali kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden transition"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordErrorMsg(null);
                        setPasswordSuccessMsg(null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      Batal / Reset Input
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isChangingPassword ? 'Menyimpan Sandi Baru...' : 'Simpan Perubahan Kata Sandi'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Info & Keamanan Akun */}
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs pb-2 border-b border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Informasi Akun Owner Saat Ini</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Nama Lengkap:</span>
                      <strong className="text-white font-semibold">{currentUser.name}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Username:</span>
                      <strong className="text-purple-400 font-mono">@{currentUser.username}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Email Terdaftar:</span>
                      <strong className="text-white font-mono">{currentUser.email || 'adminbisaujin@gmail.com'}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Status Akun:</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        ● Aktif & Terlindungi
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-2">
                  <div className="font-extrabold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Petunjuk Keamanan:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300 leading-relaxed">
                    <li>Gunakan kata sandi unik yang tidak digunakan di layanan lain.</li>
                    <li>Jangan membagikan kredensial login kepada pihak manapun selain tim pengurus resmi.</li>
                    <li>Popup login di halaman depan tidak lagi menampilkan petunjuk sandi, sehingga keamanan akun Anda tetap terjaga.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* WHATSAPP GATEWAY INTEGRATION CARD */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        Integrasi WhatsApp Gateway (Pengiriman OTP Otomatis &amp; Real-Time)
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        waConfig.apiToken ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {waConfig.apiToken ? '● Terhubung Real-Time' : '○ Belum Dikonfigurasi'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Otomatisasi pengiriman pesan WhatsApp OTP ke nomor pengurus dan tanda terima zakat muzakki secara instan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Form Konfigurasi */}
                <form onSubmit={handleSaveWaConfig} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
                  <div className="font-bold text-xs text-white flex items-center justify-between">
                    <span>Pengaturan Koneksi Gateway</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] text-slate-400">Aktifkan Layanan:</span>
                      <input
                        type="checkbox"
                        checked={waEnabled}
                        onChange={(e) => setWaEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Pilihan Provider WhatsApp Gateway
                    </label>
                    <select
                      value={waProvider}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setWaProvider(val);
                        if (val === 'fonnte') setWaEndpoint('https://api.fonnte.com/send');
                        else if (val === 'wablas') setWaEndpoint('https://phone.wablas.com/api/send-message');
                        else if (val === 'starsender') setWaEndpoint('https://starsender.online/api/sendText');
                        else if (val === 'waha') setWaEndpoint('http://localhost:3000/api/sendText');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      <option value="fonnte">Fonnte (Rekomendasi Indonesia - Ada Kuota Gratis &amp; Sangat Mudah)</option>
                      <option value="wablas">Wablas (WhatsApp Bisnis Indonesia)</option>
                      <option value="starsender">Starsender (Gateway Pesan Massal)</option>
                      <option value="waha">WAHA / Self-Hosted VPS (Docker Gratis di Server Anda)</option>
                      <option value="custom">Custom Webhook Endpoint</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      API Token / Authorization Key
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan Token API (misal dari fonnte.com)"
                      value={waToken}
                      onChange={(e) => setWaToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Daftar di <strong>fonnte.com</strong> &rarr; scan nomor WhatsApp posko Anda &rarr; salin API Token ke sini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={waEndpoint}
                        onChange={(e) => setWaEndpoint(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nama Pengirim (Sender Tag)
                      </label>
                      <input
                        type="text"
                        value={waSenderName}
                        onChange={(e) => setWaSenderName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingWa}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingWa ? 'Menyimpan...' : 'Simpan Pengaturan Gateway WhatsApp'}</span>
                  </button>
                </form>

                {/* Uji Kirim Realtime Langsung */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Uji Kirim WhatsApp Real-Time</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Ketikkan nomor WhatsApp pribadi Anda (misal: 081299887766) dan tekan tombol uji untuk memverifikasi bahwa server langsung mengirimkan pesan detik itu juga ke HP Anda.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nomor HP WhatsApp Tujuan Uji Coba:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="0812xxxxxxxx"
                          value={waTestPhone}
                          onChange={(e) => setWaTestPhone(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                        />
                        <button
                          type="button"
                          disabled={isTestingWa}
                          onClick={handleTestWa}
                          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTestingWa ? 'animate-spin' : ''}`} />
                          <span>{isTestingWa ? 'Mengirim...' : 'Kirim Uji Coba'}</span>
                        </button>
                      </div>
                    </div>

                    {waTestResult && (
                      <div className={`p-3 rounded-xl text-xs border ${
                        waTestResult.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-rose-950/40 border-rose-800 text-rose-200'
                      }`}>
                        <div className="font-bold mb-0.5">
                          {waTestResult.success ? '✅ Berhasil Terkirim Real-Time!' : '⚠️ Respon Gateway:'}
                        </div>
                        <p className="text-[11px] leading-relaxed">{waTestResult.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-bold text-slate-300">💡 Panduan untuk VPS Produksi:</div>
                    <p className="leading-relaxed">
                      Anda juga dapat menyetel token ini secara permanen di berkas <code>.env</code> server VPS dengan variabel <code>WA_GATEWAY_TOKEN=token_anda</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Permintaan Reset Sandi DKM &amp; Petugas Masjid ({resetTickets.filter(t => t.status === 'pending').length} Menunggu)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Pantau dan verifikasi permintaan reset kata sandi resmi dari seluruh pengurus masjid di Indonesia.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => refreshResetTickets(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Segarkan daftar tiket permintaan reset kata sandi dari server VPS"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTickets ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>Segarkan Data</span>
                  </button>
                </div>
              </div>

              {/* Master Recovery Info Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-300">Master Recovery Override Key VPS: </strong>
                  <code className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40">144799</code>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Hanya Super Admin yang mengetahui kode ini. Jika pengurus masjid tidak dapat menerima SMS/WhatsApp, Anda dapat mendiktekan PIN di bawah atau menggunakan master key ini untuk mereset akun mereka.
                  </p>
                </div>
              </div>

              {/* Tab Filter & Quick Actions */}
              {(() => {
                const pendingTickets = resetTickets.filter((t) => t.status === 'pending');
                const resolvedTickets = resetTickets.filter((t) => t.status === 'resolved');
                const displayedTickets = ticketFilter === 'pending'
                  ? pendingTickets
                  : ticketFilter === 'resolved'
                  ? resolvedTickets
                  : resetTickets;

                return (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setTicketFilter('pending')}
                          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                            ticketFilter === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>Antrean Aktif</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            pendingTickets.length > 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {pendingTickets.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTicketFilter('resolved')}
                          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                            ticketFilter === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>Riwayat Selesai</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400 font-bold">
                            {resolvedTickets.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTicketFilter('all')}
                          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                            ticketFilter === 'all'
                              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>Semua ({resetTickets.length})</span>
                        </button>
                      </div>

                      {resolvedTickets.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearResolvedTickets}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-rose-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Bersihkan riwayat tiket yang sudah selesai digunakan"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Bersihkan Riwayat ({resolvedTickets.length})</span>
                        </button>
                      )}
                    </div>

                    {displayedTickets.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                        <div className="font-bold text-slate-300">
                          {ticketFilter === 'pending'
                            ? 'Tidak Ada Antrean Menunggu'
                            : ticketFilter === 'resolved'
                            ? 'Belum Ada Riwayat Selesai'
                            : 'Tidak Ada Tiket Reset Sandi'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {ticketFilter === 'pending'
                            ? resolvedTickets.length > 0
                              ? `Seluruh permintaan reset sebelumnya telah selesai digunakan (${resolvedTickets.length} tiket). Anda dapat mengeceknya di tab "Riwayat Selesai".`
                              : 'Seluruh pengurus masjid dapat login dengan lancar. Jika ada yang menekan tombol lupa sandi, tiket akan muncul di sini secara seketika.'
                            : 'Daftar riwayat tiket akan tercatat di sini.'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                        {displayedTickets.map((ticket) => {
                          const isPending = ticket.status === 'pending';
                          return (
                            <div key={ticket.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-purple-400 font-bold px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800">
                                    {ticket.id}
                                  </span>
                                  <span className="font-bold text-white text-sm">
                                    {ticket.accountName}
                                  </span>
                                  <span className="text-slate-400 font-mono">
                                    (@{ticket.username})
                                  </span>
                                  {isPending ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                      Menunggu Verifikasi
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                      Selesai
                                    </span>
                                  )}
                                </div>

                                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span>Lembaga: <strong className="text-slate-300">{ticket.masjidName || 'DKM'}</strong></span>
                                  <span>WA: <strong className="text-slate-300 font-mono">{ticket.phone}</strong></span>
                                  <span>Diajukan: {new Date(ticket.requestedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <div className="px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5">
                                  <span className="text-[10px] text-purple-400 font-sans">Kode OTP:</span>
                                  <strong className="text-white text-sm tracking-wider">{ticket.code}</strong>
                                </div>

                                {isPending ? (
                                  <>
                                    <a
                                      href={`https://wa.me/${ticket.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(
                                        `Assalamu'alaikum ${ticket.accountName}. Kode verifikasi resmi pemulihan kata sandi SimZakat masjid Anda adalah: ${ticket.code}. Berlaku 15 menit. Jaga kerahasiaan kode ini.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                      title="Kirim kode OTP langsung ke WhatsApp pengurus"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>Kirim WA ke Pengurus</span>
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => handleResolveTicket(ticket.id)}
                                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                                      title="Tandai tiket ini sudah selesai"
                                    >
                                      Tandai Selesai
                                    </button>
                                  </>
                                ) : (
                                  <span className="px-2.5 py-1 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
                                    Sudah Digunakan
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTicket(ticket.id)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                                  title="Hapus tiket ini dari daftar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 4 INTERACTIVE MANAGEMENT MODALS */}
      {/* ========================================================================= */}

      {/* 1. Modal Detail Profil & Kontak Lembaga */}
      <MasjidDetailModal
        isOpen={Boolean(detailModalMasjid)}
        masjid={detailModalMasjid}
        onClose={() => setDetailModalMasjid(null)}
        onOpenPosko={(m) => onSelectMasjidToManage(m)}
        onUpdateStatus={(id, st) => handleUpdateStatus(id, st, detailModalMasjid?.name)}
        onEdit={(m) => {
          setDetailModalMasjid(null);
          setEditModalMasjid(m);
        }}
      />

      {/* 2. Modal Edit Data Lembaga */}
      <MasjidEditModal
        isOpen={Boolean(editModalMasjid)}
        masjid={editModalMasjid}
        onClose={() => setEditModalMasjid(null)}
        onSave={handleSaveEditMasjid}
      />

      {/* 3. Modal Daftarkan Lembaga Baru */}
      <MasjidAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleSaveNewMasjid}
      />

      {/* 4. Modal Konfirmasi Tindakan Manajemen (Suspend / Reset / Delete) */}
      <ConfirmActionModal
        isOpen={Boolean(confirmModal?.isOpen)}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        confirmText={confirmModal?.confirmText}
        confirmColor={confirmModal?.confirmColor}
        onConfirm={() => confirmModal?.onConfirm()}
        onClose={() => setConfirmModal(null)}
      />

    </div>
  );
};
