import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  Wheat, 
  Briefcase, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Calendar,
  BookOpen,
  Scale,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AppConfig, MuzakkiTransaction, MaalSubtype } from '../types/zakat';
import { formatKg, formatRupiah } from '../utils/helpers';
import { RupiahInput } from './common/RupiahInput';
import { 
  KAIDAH_FIQIH_ZAKAT, 
  DALIL_ZAKAT_MAAL, 
  PANDUAN_MAAL_SYAFII, 
  DOA_ZAKAT_MAAL 
} from '../utils/fiqhSyafii';

interface ZakatCalculatorProps {
  config: AppConfig;
  onApplyToKasir: (prefillData: Partial<MuzakkiTransaction>) => void;
}

export const ZakatCalculator: React.FC<ZakatCalculatorProps> = ({
  config,
  onApplyToKasir,
}) => {
  const [activeTab, setActiveTab] = useState<'fitrah' | 'maal' | 'profesi' | 'fidyah' | 'fiqh'>('maal');

  // Fitrah state
  const [fitrahSouls, setFitrahSouls] = useState<number>(4);
  const [fitrahMode, setFitrahMode] = useState<'uang' | 'beras'>('uang');

  // Fitrah: rice kg options
  const defaultRiceKg = config.fitrahRiceKgPerSoul || 2.8;
  const [selectedRiceKg, setSelectedRiceKg] = useState<number>(defaultRiceKg);
  const ricePresets = config.fitrahRiceOptions || [2.5, 2.7, 2.8, 3.0, 3.5];

  // Fitrah: SK Kemenag tiers options
  const availableTiers = config.skKemenagTiers && config.skKemenagTiers.length > 0
    ? config.skKemenagTiers
    : [
        { id: 'tier-1', name: 'Kategori I (Premium)', riceType: 'Pandan Wangi, Rojolele', pricePerSoulRp: 55000 },
        { id: 'tier-2', name: 'Kategori II (Menengah Atas)', riceType: 'Setra Ramos, C4', pricePerSoulRp: 45000 },
        { id: 'tier-3', name: 'Kategori III (Medium)', riceType: 'IR-64, Bulog Premium', pricePerSoulRp: 40000 },
        { id: 'tier-4', name: 'Kategori IV (Sederhana)', riceType: 'Beras SPHP', pricePerSoulRp: 35000 },
      ];
  const [selectedTierId, setSelectedTierId] = useState<string>(
    availableTiers[1]?.id || availableTiers[0]?.id || 'tier-1'
  );
  const selectedTier = availableTiers.find((t) => t.id === selectedTierId) || availableTiers[0];
  const activeMoneyRate = selectedTier ? selectedTier.pricePerSoulRp : (config.fitrahMoneyPerSoul || 45000);

  // ==========================================
  // ZAKAT MAAL: MAZHAB SYAFI'I COMPREHENSIVE
  // ==========================================
  const [maalSubTab, setMaalSubTab] = useState<
    'nuqud' | 'tijarah' | 'zuru' | 'anam' | 'rikaz'
  >('nuqud');

  // 1. Nuqud (Emas, Perak & Tabungan)
  const [cashSavings, setCashSavings] = useState<number>(100000000);
  const [goldGrams, setGoldGrams] = useState<number>(0); // Emas batangan/investasi
  const [jewelryWornGrams, setJewelryWornGrams] = useState<number>(0); // Perhiasan dipakai (bebas zakat Syafi'i)
  const [nuqudDebt, setNuqudDebt] = useState<number>(0);
  const [isNuqudHaul, setIsNuqudHaul] = useState<boolean>(true);

  // 2. Perniagaan ('Urudh at-Tijarah)
  const [tradeGoodsVal, setTradeGoodsVal] = useState<number>(150000000); // Stok barang dagang harga pasar akhir haul
  const [tradeCashVal, setTradeCashVal] = useState<number>(25000000); // Kas & rekening dagang
  const [tradeReceivableVal, setTradeReceivableVal] = useState<number>(10000000); // Piutang lancar
  const [tradePayableVal, setTradePayableVal] = useState<number>(30000000); // Hutang dagang jatuh tempo
  const [isTradeHaul, setIsTradeHaul] = useState<boolean>(true);

  // 3. Pertanian (Az-Zuru' wa Ats-Tsimar)
  const [harvestWeightKg, setHarvestWeightKg] = useState<number>(1500); // Kg gabah atau beras
  const [grainType, setGrainType] = useState<'beras' | 'gabah'>('gabah');
  const [irrigationType, setIrrigationType] = useState<'hujan_10' | 'pompa_5' | 'campuran_7_5'>('pompa_5');
  const [grainPricePerKg, setGrainPricePerKg] = useState<number>(7500); // Harga gabah/kg atau beras/kg

  // 4. Peternakan (Al-An'am)
  const [livestockType, setLivestockType] = useState<'kambing' | 'sapi'>('kambing');
  const [livestockHeadCount, setLivestockHeadCount] = useState<number>(45);
  const [isSaimah, setIsSaimah] = useState<boolean>(true); // Digembalakan bebas
  const [isGhairuAamilah, setIsGhairuAamilah] = useState<boolean>(true); // Bukan hewan pekerja

  // 5. Rikaz & Tambang (Ma'dan)
  const [rikazCategory, setRikazCategory] = useState<'rikaz' | 'tambang'>('rikaz');
  const [rikazValuationRp, setRikazValuationRp] = useState<number>(50000000);

  // ==========================================
  // PROFESI & FIDYAH
  // ==========================================
  const [salaryMonthly, setSalaryMonthly] = useState<number>(12000000);
  const [otherIncomeMonthly, setOtherIncomeMonthly] = useState<number>(0);
  const [basicExpensesMonthly, setBasicExpensesMonthly] = useState<number>(0);
  const [fidyahDays, setFidyahDays] = useState<number>(14);

  // ==========================================
  // CALCULATIONS (SYAFI'I & BAZNAS STANDARD)
  // ==========================================
  // Standard nisab values
  const nisabGoldRp = 85 * config.goldPricePerGram; // 85 gram emas 24k
  const monthlyGoldNisabRp = Math.round(nisabGoldRp / 12); // ~7.08g emas / bulan

  // 1. Fitrah
  const fitrahTotalRice = Math.round(fitrahSouls * selectedRiceKg * 100) / 100;
  const fitrahTotalMoney = fitrahSouls * activeMoneyRate;

  // 2. Maal Calculations per Sub-Type
  // Nuqud: Emas Batangan Wajib + Tabungan Kas - Hutang
  const goldAssetRp = goldGrams * config.goldPricePerGram;
  const netNuqudAssets = Math.max(0, cashSavings + goldAssetRp - nuqudDebt);
  const isNuqudNisabMet = netNuqudAssets >= nisabGoldRp;
  const nuqudZakatDueRp = (isNuqudNisabMet && isNuqudHaul) ? Math.round(netNuqudAssets * 0.025) : 0;

  // Tijarah: (Stok + Kas + Piutang) - Hutang
  const netTradeAssets = Math.max(0, (tradeGoodsVal + tradeCashVal + tradeReceivableVal) - tradePayableVal);
  const isTradeNisabMet = netTradeAssets >= nisabGoldRp;
  const tradeZakatDueRp = (isTradeNisabMet && isTradeHaul) ? Math.round(netTradeAssets * 0.025) : 0;

  // Pertanian: Nisab 5 Wasaq = 653 Kg Beras Bersih atau 1.350 Kg Gabah (GKG)
  const agricultureNisabKg = grainType === 'beras' ? 653 : 1350;
  const isAgricultureNisabMet = harvestWeightKg >= agricultureNisabKg;
  const agricultureRate = irrigationType === 'hujan_10' ? 0.10 : irrigationType === 'pompa_5' ? 0.05 : 0.075;
  const agricultureZakatKg = isAgricultureNisabMet ? Math.round(harvestWeightKg * agricultureRate * 100) / 100 : 0;
  const agricultureZakatRp = Math.round(agricultureZakatKg * grainPricePerKg);

  // Peternakan: Syarat Sa'imah & Ghairu Aamilah
  let livestockDueDesc = 'Belum mencapai nisab';
  let livestockDueCount = 0;
  let isLivestockNisabMet = false;
  let livestockZakatEquivalentRp = 0;
  const goatPrice = config.goatPricePerHead || 2500000;
  const cowPrice = config.cowPricePerHead || 14000000;

  if (isSaimah && isGhairuAamilah) {
    if (livestockType === 'kambing') {
      if (livestockHeadCount >= 40) {
        isLivestockNisabMet = true;
        if (livestockHeadCount <= 120) {
          livestockDueDesc = '1 ekor kambing (jadza\'ah 1 th / tsaniyyah 2 th)';
          livestockDueCount = 1;
        } else if (livestockHeadCount <= 200) {
          livestockDueDesc = '2 ekor kambing';
          livestockDueCount = 2;
        } else if (livestockHeadCount <= 399) {
          livestockDueDesc = '3 ekor kambing';
          livestockDueCount = 3;
        } else {
          const hundreds = Math.floor(livestockHeadCount / 100);
          livestockDueDesc = `${hundreds} ekor kambing (tiap 100 ekor +1 kambing)`;
          livestockDueCount = hundreds;
        }
        livestockZakatEquivalentRp = livestockDueCount * goatPrice;
      }
    } else {
      // Sapi
      if (livestockHeadCount >= 30) {
        isLivestockNisabMet = true;
        if (livestockHeadCount < 40) {
          livestockDueDesc = '1 ekor tabi\' (anak sapi 1 tahun)';
          livestockDueCount = 1;
          livestockZakatEquivalentRp = cowPrice * 0.7;
        } else if (livestockHeadCount < 60) {
          livestockDueDesc = '1 ekor musinnah (sapi betina 2 tahun)';
          livestockDueCount = 1;
          livestockZakatEquivalentRp = cowPrice;
        } else {
          const tabis = Math.floor(livestockHeadCount / 30);
          livestockDueDesc = `${tabis} ekor tabi' (tiap kelipatan 30 = 1 tabi', kelipatan 40 = 1 musinnah)`;
          livestockDueCount = tabis;
          livestockZakatEquivalentRp = tabis * (cowPrice * 0.75);
        }
      }
    }
  }

  // Rikaz & Tambang
  const rikazRate = rikazCategory === 'rikaz' ? 0.20 : 0.025; // 20% vs 2.5%
  const isRikazNisabMet = rikazCategory === 'rikaz' ? true : rikazValuationRp >= nisabGoldRp;
  const rikazZakatDueRp = isRikazNisabMet ? Math.round(rikazValuationRp * rikazRate) : 0;

  // 3. Profesi
  const netIncomeMonthly = Math.max(0, salaryMonthly + otherIncomeMonthly - basicExpensesMonthly);
  const isProfesiNisabMet = netIncomeMonthly >= monthlyGoldNisabRp;
  const profesiZakatMonthly = isProfesiNisabMet ? Math.round(netIncomeMonthly * 0.025) : 0;
  const profesiZakatYearly = profesiZakatMonthly * 12;

  // 4. Fidyah
  const fidyahTotalRp = fidyahDays * config.fidyahRatePerDay;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Kalkulator & Panduan Fiqih Zakat Maal</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Mazhab Syafi'i & BAZNAS
                </span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Hisab nisab, haul, dan kadar zakat terverifikasi sesuai kaidah Syafi'iyah, Fatwa MUI, NU, & Muhammadiyah.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-xs">
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-900 font-semibold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nisab 85g Emas: <strong>{formatRupiah(nisabGoldRp)}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            (Harga emas acuan: {formatRupiah(config.goldPricePerGram)} / gr)
          </span>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'maal', label: 'Zakat Maal (Kaidah Syafi\'i)', icon: Coins },
          { id: 'fitrah', label: 'Zakat Fitrah', icon: Wheat },
          { id: 'profesi', label: 'Zakat Penghasilan / Profesi', icon: Briefcase },
          { id: 'fidyah', label: 'Fidyah Puasa', icon: Calendar },
          { id: 'fiqh', label: '📖 Kaidah Fiqih & Dalil Syar\'i', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* TAB: ZAKAT MAAL LENGKAP MAZHAB SYAFI'I */}
      {/* ========================================================== */}
      {activeTab === 'maal' && (
        <div className="space-y-6">
          {/* Sub-Tabs Zakat Maal Syafi'iyah */}
          <div className="bg-slate-100/80 p-1.5 rounded-xl flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: 'nuqud', label: '1. Tabungan & Emas/Perak' },
              { id: 'tijarah', label: '2. Perniagaan / Dagang (\'Urudh Tijarah)' },
              { id: 'zuru', label: '3. Pertanian & Panen (Az-Zuru\')' },
              { id: 'anam', label: '4. Peternakan (Al-An\'am)' },
              { id: 'rikaz', label: '5. Rikaz (Karun 20%) & Tambang' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setMaalSubTab(st.id as any)}
                className={`px-3 py-2 rounded-lg transition cursor-pointer ${
                  maalSubTab === st.id
                    ? 'bg-white text-emerald-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* SubTab 1: Nuqud (Emas, Perak, Tabungan, Deposito) */}
          {maalSubTab === 'nuqud' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Zakat Uang, Simpanan & Emas (Nuqud & Ats-Tsaman)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Nisab setara 85 gram emas murni. Wajib haul 1 tahun Hijriah. Kadar 2,5%.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                    Qaul Mu'tamad Syafi'i
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Uang Tabungan / Deposito / Giro / Kas Tunai
                    </label>
                    <RupiahInput
                      value={cashSavings}
                      onChange={setCashSavings}
                      placeholder="0"
                      showTerbilang={true}
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Total saldo uang mengendap halal milik penuh</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Emas Batangan / Dinar Simpanan (Gram)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={goldGrams || ''}
                      onChange={(e) => setGoldGrams(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
                    />
                    <span className="text-[11px] text-slate-400">
                      Senilai {formatRupiah(goldAssetRp)} (@ {formatRupiah(config.goldPricePerGram)}/gr)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hutang Jatuh Tempo / Cicilan Pokok Mendesak
                    </label>
                    <RupiahInput
                      value={nuqudDebt}
                      onChange={setNuqudDebt}
                      placeholder="0"
                      className="text-rose-700 font-semibold"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Pengurang aset likuid mendesak (BAZNAS / MUI)</span>
                  </div>
                </div>

                {/* Shafi'i Special Jurisprudence Notice: Al-Huliyy al-Mubah */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Kaidah Emas Perhiasan Wanita (Al-Huliyy al-Mubah) Mazhab Syafi'i:</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Dalam *qaul mu'tamad* Mazhab Syafi'i: <strong>Perhiasan emas/perak yang lazim dipakai untuk berhias yang mubah BEBAS DARI ZAKAT</strong> (*"Laisa fil huliyyi zakat"*). 
                    Perhiasan hanya wajib dizakati jika diniatkan semata untuk investasi/timbunan (*kanz*) atau jumlahnya melampaui batas kewajaran (*israf / tabarruj* di atas kebiasaan *'urf*).
                  </p>
                </div>

                {/* Haul Checkbox */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="nuqudHaul"
                    checked={isNuqudHaul}
                    onChange={(e) => setIsNuqudHaul(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="nuqudHaul" className="text-xs text-slate-700 cursor-pointer">
                    <strong>Telah Berlalu 1 Tahun Hijriah (Haul):</strong> Harta di atas telah mengendap dan dimiliki secara sempurna selama 12 bulan komariah.
                  </label>
                </div>
              </div>

              {/* Result Summary Card Nuqud */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block">
                    Hisab Zakat Tabungan & Emas
                  </span>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Total Harta Bersih:</span>
                      <span className="font-bold text-white">{formatRupiah(netNuqudAssets)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Batas Nisab 85g Emas:</span>
                      <span className="font-bold text-amber-300">{formatRupiah(nisabGoldRp)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Status Nisab:</span>
                      <span className={`font-bold ${isNuqudNisabMet ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isNuqudNisabMet ? '✓ Mencapai Nisab' : '✗ Belum Mencapai Nisab'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Status Haul (1 Th):</span>
                      <span className="font-bold text-white">
                        {isNuqudHaul ? '✓ Genap 1 Tahun' : 'Belum Haul'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white/10 rounded-xl">
                    <span className="text-xs text-emerald-200 block">Kewajiban Zakat Maal (2.5%):</span>
                    <div className="text-3xl font-black text-amber-300 mt-1">
                      {formatRupiah(nuqudZakatDueRp)}
                    </div>
                    <span className="text-[11px] text-emerald-200 mt-1 block">
                      {nuqudZakatDueRp > 0 ? 'Fardhu ditunaikan kepada mustahiq' : 'Belum wajib zakat'}
                    </span>
                  </div>
                </div>

                <button
                  disabled={nuqudZakatDueRp <= 0}
                  onClick={() => {
                    onApplyToKasir({
                      category: 'maal',
                      maalDetail: {
                        assetType: 'tabungan_emas',
                        totalAssetRp: netNuqudAssets,
                        nominalRp: nuqudZakatDueRp,
                        nisabMet: isNuqudNisabMet,
                        nisabThresholdRp: nisabGoldRp,
                        haulStatus: isNuqudHaul ? 'telah_haul' : 'belum_haul',
                        ratePercent: 2.5,
                        calculationNotes: `Zakat Tabungan & Emas (Kadar 2.5%, Nisab 85g Emas = ${formatRupiah(nisabGoldRp)})`,
                      },
                    });
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Gunakan Hasil Ini di Kasir Zakat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SubTab 2: Perniagaan ('Urudh at-Tijarah) */}
          {maalSubTab === 'tijarah' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Zakat Perniagaan / Usaha Dagang ('Urudh at-Tijarah)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Sesuai rumus Imam Nawawi (*Al-Majmu'*) & BAZNAS: (Stok Dagang + Kas + Piutang Lancar) - Hutang Jatuh Tempo.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-semibold">
                    Kadar 2,5% (Haul)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nilai Stok Barang Dagangan Akhir Haul
                    </label>
                    <RupiahInput
                      value={tradeGoodsVal}
                      onChange={setTradeGoodsVal}
                      placeholder="0"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Dinilai berdasarkan <em>si'rul waqt</em> (harga pasar grosir saat ini)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Uang Kas & Saldo Rekening Usaha
                    </label>
                    <RupiahInput
                      value={tradeCashVal}
                      onChange={setTradeCashVal}
                      placeholder="0"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Likuiditas uang kas operasional toko/kantor</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Piutang Lancar yang Diharapkan Cair
                    </label>
                    <RupiahInput
                      value={tradeReceivableVal}
                      onChange={setTradeReceivableVal}
                      placeholder="0"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Piutang konsumen yang tertagih (*marjuwwul ada'*)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hutang Usaha Jatuh Tempo
                    </label>
                    <RupiahInput
                      value={tradePayableVal}
                      onChange={setTradePayableVal}
                      placeholder="0"
                      className="text-rose-700 font-semibold"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Hutang ke supplier/distributor yang jatuh tempo</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-700" />
                    Kaidah Fiqih Syafi'i untuk Harta Tetap Perniagaan:
                  </p>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Aset tetap operasional seperti etalase, rak toko, gedung ruko, kendaraan operasional, dan mesin pabrik <strong>TIDAK DIHITUNG ZAKAT</strong>. Yang dihitung hanyalah modal kerja lancar (barang yang diperjualbelikan demi laba).
                  </p>
                </div>
              </div>

              {/* Result Summary Card Tijarah */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block">
                    Hisab Zakat Perniagaan
                  </span>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Aset Lancar Bersih:</span>
                      <span className="font-bold text-white">{formatRupiah(netTradeAssets)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Nisab 85g Emas:</span>
                      <span className="font-bold text-amber-300">{formatRupiah(nisabGoldRp)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Status Nisab:</span>
                      <span className={`font-bold ${isTradeNisabMet ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isTradeNisabMet ? '✓ Mencapai Nisab' : '✗ Belum Mencapai Nisab'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white/10 rounded-xl">
                    <span className="text-xs text-emerald-200 block">Zakat Perniagaan (2.5%):</span>
                    <div className="text-3xl font-black text-amber-300 mt-1">
                      {formatRupiah(tradeZakatDueRp)}
                    </div>
                  </div>
                </div>

                <button
                  disabled={tradeZakatDueRp <= 0}
                  onClick={() => {
                    onApplyToKasir({
                      category: 'maal',
                      maalDetail: {
                        assetType: 'perniagaan',
                        totalAssetRp: netTradeAssets,
                        nominalRp: tradeZakatDueRp,
                        nisabMet: isTradeNisabMet,
                        nisabThresholdRp: nisabGoldRp,
                        haulStatus: 'telah_haul',
                        ratePercent: 2.5,
                        calculationNotes: `Zakat Perniagaan/Tijarah 2.5% (Aset Lancar Bersih: ${formatRupiah(netTradeAssets)})`,
                      },
                    });
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Gunakan Hasil Ini di Kasir Zakat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SubTab 3: Pertanian & Hasil Panen (Az-Zuru') */}
          {maalSubTab === 'zuru' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Zakat Pertanian & Tanaman Pangan (Az-Zuru' wa Ats-Tsimar)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Nisab 5 Wasaq (653 Kg Beras / 1.350 Kg Gabah GKG). Dikeluarkan saat panen (tanpa haul).
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-semibold">
                    Wajib Saat Panen
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Komoditas Panen Pokok
                    </label>
                    <select
                      value={grainType}
                      onChange={(e) => setGrainType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                    >
                      <option value="gabah">Gabah Kering Giling (GKG) - Nisab 1.350 Kg</option>
                      <option value="beras">Beras Bersih Dikupas - Nisab 653 Kg (5 Wasaq)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Hasil Panen Bersih (Kg)
                    </label>
                    <input
                      type="number"
                      value={harvestWeightKg || ''}
                      onChange={(e) => setHarvestWeightKg(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-amber-900"
                    />
                    <span className="text-[11px] text-slate-400">
                      Nisab: {agricultureNisabKg} Kg ({harvestWeightKg >= agricultureNisabKg ? '✓ Telah Memenuhi Nisab' : '✗ Kurang dari Nisab'})
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sumber Air & Jenis Pengairan (Kaidah Al-Kharaj bidh-Dhaman)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: 'hujan_10',
                          label: 'Tadah Hujan / Alami (10%)',
                          desc: 'Diairi air hujan / sungai alami tanpa biaya pompa BBM/listrik',
                        },
                        {
                          id: 'pompa_5',
                          label: 'Irigasi Pompa / Berbiaya (5%)',
                          desc: 'Memerlukan biaya solar, genset pompa, atau iuran air berbayar',
                        },
                        {
                          id: 'campuran_7_5',
                          label: 'Campuran Berimbang (7,5%)',
                          desc: 'Sebagian air hujan alami dan sebagian pompa berbayar',
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setIrrigationType(item.id as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                            irrigationType === item.id
                              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">{item.label}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Taksiran Nilai Jual per Kg
                    </label>
                    <RupiahInput
                      value={grainPricePerKg}
                      onChange={setGrainPricePerKg}
                      placeholder="0"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Untuk opsi penunaian dalam bentuk uang tunai</span>
                  </div>
                </div>
              </div>

              {/* Result Summary Card Agriculture */}
              <div className="bg-gradient-to-br from-amber-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block">
                    Hisab Zakat Pertanian (Panen)
                  </span>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-amber-200">Hasil Panen:</span>
                      <span className="font-bold text-white">{formatKg(harvestWeightKg)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-amber-200">Kadar Pengairan:</span>
                      <span className="font-bold text-white">{(agricultureRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-amber-200">Kewajiban Beras/Gabah:</span>
                      <span className="font-bold text-amber-300">{formatKg(agricultureZakatKg)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white/10 rounded-xl">
                    <span className="text-xs text-amber-200 block">Jika Ditunaikan Uang Tunai:</span>
                    <div className="text-3xl font-black text-amber-300 mt-1">
                      {formatRupiah(agricultureZakatRp)}
                    </div>
                    <span className="text-[11px] text-amber-200 mt-1 block">
                      Atau serahkan <strong>{formatKg(agricultureZakatKg)}</strong> wujud hasil panen
                    </span>
                  </div>
                </div>

                <button
                  disabled={agricultureZakatRp <= 0}
                  onClick={() => {
                    onApplyToKasir({
                      category: 'maal',
                      totalRiceKg: grainType === 'beras' ? agricultureZakatKg : 0,
                      maalDetail: {
                        assetType: 'pertanian',
                        totalAssetRp: harvestWeightKg * grainPricePerKg,
                        nominalRp: agricultureZakatRp,
                        nisabMet: isAgricultureNisabMet,
                        haulStatus: 'saat_panen',
                        ratePercent: agricultureRate * 100,
                        irrigationType: irrigationType === 'hujan_10' ? 'hujan_sungai_10' : irrigationType === 'pompa_5' ? 'irigasi_pompa_5' : 'campuran_7_5',
                        harvestWeightKg: harvestWeightKg,
                        calculationNotes: `Zakat Pertanian ${grainType} ${formatKg(harvestWeightKg)} kadar ${(agricultureRate * 100)}% (wajib saat panen)`,
                      },
                    });
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Gunakan Hasil Ini di Kasir Zakat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SubTab 4: Peternakan (Al-An'am) */}
          {maalSubTab === 'anam' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Zakat Hewan Ternak (Al-An'am: Kambing / Domba & Sapi / Kerbau)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Berdasarkan ketetapan hadits Shahih Bukhari dari surat Abu Bakar RA.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                    Syarat Sa'imah & Haul
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Hewan Ternak
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLivestockType('kambing');
                          if (livestockHeadCount < 40) setLivestockHeadCount(40);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          livestockType === 'kambing'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        Kambing / Domba (Nisab 40)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLivestockType('sapi');
                          if (livestockHeadCount < 30) setLivestockHeadCount(30);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          livestockType === 'sapi'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        Sapi / Kerbau (Nisab 30)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jumlah Populasi Ternak (Ekor)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={livestockHeadCount || ''}
                      onChange={(e) => setLivestockHeadCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-900"
                    />
                  </div>

                  {/* Shafi'i Specific Condition Checklist */}
                  <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      Syarat Fiqih Syafi'i untuk Zakat Hewan Ternak:
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSaimah}
                        onChange={(e) => setIsSaimah(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span><strong>As-Sa'imah:</strong> Digembalakan di padang rumput bebas tanpa beban biaya pakan yang dominan selama setahun.</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGhairuAamilah}
                        onChange={(e) => setIsGhairuAamilah(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span><strong>Ghairu 'Aamilah:</strong> Bukan hewan pekerja (bukan sapi pembajak sawah atau penarik gerobak).</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Result Summary Card Livestock */}
              <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block">
                    Ketetapan Zakat Ternak
                  </span>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Populasi:</span>
                      <span className="font-bold text-white">{livestockHeadCount} Ekor ({livestockType})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-emerald-200">Kewajiban Hewan:</span>
                      <span className="font-bold text-amber-300 text-right">{livestockDueDesc}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white/10 rounded-xl">
                    <span className="text-xs text-emerald-200 block">Jika Ditunaikan Nilai Uang (Qimah):</span>
                    <div className="text-2xl font-black text-amber-300 mt-1">
                      {formatRupiah(livestockZakatEquivalentRp)}
                    </div>
                    <span className="text-[11px] text-emerald-200 mt-1 block">
                      Sesuai taksiran harga pasar hewan setempat
                    </span>
                  </div>
                </div>

                <button
                  disabled={livestockZakatEquivalentRp <= 0}
                  onClick={() => {
                    onApplyToKasir({
                      category: 'maal',
                      maalDetail: {
                        assetType: 'peternakan',
                        totalAssetRp: livestockHeadCount * (livestockType === 'kambing' ? goatPrice : cowPrice),
                        nominalRp: livestockZakatEquivalentRp,
                        nisabMet: isLivestockNisabMet,
                        haulStatus: 'telah_haul',
                        ratePercent: 2.5,
                        livestockType: livestockType,
                        livestockHeadCount: livestockHeadCount,
                        livestockObligationDesc: livestockDueDesc,
                        calculationNotes: `Zakat Peternakan ${livestockHeadCount} ekor ${livestockType} = ${livestockDueDesc}`,
                      },
                    });
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Gunakan Hasil Ini di Kasir Zakat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SubTab 5: Rikaz & Tambang */}
          {maalSubTab === 'rikaz' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Zakat Rikaz (Harta Karun Purba) & Hasil Tambang (Ma'dan)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Rikaz dikenakan zakat 20% (Al-Khums) tanpa syarat haul seketika ditemukan.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-semibold">
                    HR Bukhari & Muslim
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kategori Temuan / Hasil
                    </label>
                    <select
                      value={rikazCategory}
                      onChange={(e) => setRikazCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                    >
                      <option value="rikaz">Rikaz (Harta Karun Zaman Jahiliyah/Kuno) - Kadar 20%</option>
                      <option value="tambang">Ma'dan (Hasil Tambang Emas/Perak) - Kadar 2,5%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nilai Taksiran Harta Temuan
                    </label>
                    <RupiahInput
                      value={rikazValuationRp}
                      onChange={setRikazValuationRp}
                      placeholder="0"
                      showTerbilang={true}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-1">
                  <p className="font-bold">Dalil Shahih Hadits Rikaz:</p>
                  <p className="font-arabic text-base text-purple-950 font-bold">وَفِي الرِّكَازِ الْخُمُسُ</p>
                  <p className="text-[11px] text-purple-900 italic">
                    "Dan pada rikaz (harta terpendam peninggalan masa lalu yang ditemukan), zakatnya adalah seperlima (20%)." (HR. Bukhari No. 1499 & Muslim No. 1710).
                  </p>
                </div>
              </div>

              {/* Result Summary Card Rikaz */}
              <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-purple-300 font-semibold block">
                    Hisab Zakat Rikaz
                  </span>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-purple-200">Nilai Temuan:</span>
                      <span className="font-bold text-white">{formatRupiah(rikazValuationRp)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-purple-200">Kadar Syar'i:</span>
                      <span className="font-bold text-amber-300">{(rikazRate * 100)}%</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white/10 rounded-xl">
                    <span className="text-xs text-purple-200 block">Zakat Wajib Dikeluarkan:</span>
                    <div className="text-3xl font-black text-amber-300 mt-1">
                      {formatRupiah(rikazZakatDueRp)}
                    </div>
                  </div>
                </div>

                <button
                  disabled={rikazZakatDueRp <= 0}
                  onClick={() => {
                    onApplyToKasir({
                      category: 'maal',
                      maalDetail: {
                        assetType: 'rikaz_tambang',
                        totalAssetRp: rikazValuationRp,
                        nominalRp: rikazZakatDueRp,
                        nisabMet: isRikazNisabMet,
                        haulStatus: 'tanpa_haul',
                        ratePercent: rikazRate * 100,
                        calculationNotes: `Zakat ${rikazCategory === 'rikaz' ? 'Rikaz 20% (Al-Khums)' : 'Tambang 2.5%'} saat ditemukan`,
                      },
                    });
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Gunakan Hasil Ini di Kasir Zakat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB: ZAKAT FITRAH */}
      {/* ========================================================== */}
      {activeTab === 'fitrah' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Parameter Zakat Fitrah</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Jiwa yang Dikeluarkan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={fitrahSouls}
                  onChange={(e) => setFitrahSouls(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold"
                />
                <span className="text-xs text-slate-500">Jiwa (Anggota Keluarga / Tanggungan)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bentuk Penunaian
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFitrahMode('uang')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    fitrahMode === 'uang'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Uang Tunai (SK Kemenag)
                </button>
                <button
                  type="button"
                  onClick={() => setFitrahMode('beras')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    fitrahMode === 'beras'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Beras Makanan Pokok (Kg)
                </button>
              </div>
            </div>

            {fitrahMode === 'beras' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilihan Takaran Beras Per Jiwa
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ricePresets.map((kg) => (
                    <button
                      key={kg}
                      type="button"
                      onClick={() => setSelectedRiceKg(kg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedRiceKg === kg
                          ? 'bg-amber-700 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {kg} Kg
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Kategori Harga Beras (SK Kemenag)
                </label>
                <div className="space-y-1.5">
                  {availableTiers.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer text-xs transition flex items-center justify-between ${
                        selectedTierId === tier.id
                          ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <span>{tier.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{tier.riceType}</span>
                      </div>
                      <span className="font-bold text-emerald-800">{formatRupiah(tier.pricePerSoulRp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result Card Fitrah */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block">
                Hasil Perhitungan Zakat Fitrah
              </span>
              <div className="mt-4 p-4 bg-white/10 rounded-xl">
                <span className="text-xs text-emerald-200 block">Kewajiban Zakat ({fitrahSouls} Jiwa):</span>
                {fitrahMode === 'beras' ? (
                  <div className="text-3xl font-black text-amber-300 mt-1">
                    {formatKg(fitrahTotalRice)}
                  </div>
                ) : (
                  <div className="text-3xl font-black text-white mt-1">
                    {formatRupiah(fitrahTotalMoney)}
                  </div>
                )}
                <span className="text-xs text-emerald-200 mt-1 block">
                  {fitrahMode === 'beras' ? `Setara takaran ${selectedRiceKg} Kg/jiwa` : `Sesuai ${selectedTier?.name}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onApplyToKasir({
                  category: 'fitrah',
                  fitrahDetail: {
                    payerCount: fitrahSouls,
                    familyMembers: Array(fitrahSouls).fill(''),
                    unit: fitrahMode,
                    riceWeightKg: fitrahMode === 'beras' ? fitrahTotalRice : 0,
                    nominalRp: fitrahMode === 'uang' ? fitrahTotalMoney : 0,
                    ratePerPerson: fitrahMode === 'beras' ? selectedRiceKg : activeMoneyRate,
                    riceWeightPerSoulKg: fitrahMode === 'beras' ? selectedRiceKg : undefined,
                    skKemenagTierId: fitrahMode === 'uang' ? selectedTierId : undefined,
                    skKemenagTierName: fitrahMode === 'uang' ? selectedTier?.name : undefined,
                  },
                });
              }}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <span>Gunakan Hasil Ini di Kasir Zakat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB: PROFESI */}
      {/* ========================================================== */}
      {activeTab === 'profesi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Zakat Penghasilan / Gaji Bulanan</h3>
            <p className="text-[11px] text-slate-500">
              Fatwa MUI No. 3/2003 & Muktamar NU: Nisab bulanan setara 7,08 gram emas ({formatRupiah(monthlyGoldNisabRp)}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gaji Pokok / Penghasilan Bulanan
              </label>
              <RupiahInput
                value={salaryMonthly}
                onChange={setSalaryMonthly}
                placeholder="0"
                showTerbilang={true}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bonus / Tunjangan / Pendapatan Lain
              </label>
              <RupiahInput
                value={otherIncomeMonthly}
                onChange={setOtherIncomeMonthly}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kebutuhan Pokok Mendesak / Cicilan Pokok
              </label>
              <RupiahInput
                value={basicExpensesMonthly}
                onChange={setBasicExpensesMonthly}
                placeholder="0"
                className="text-slate-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Pengurang jika memilih metode penghasilan neto</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold block">
                Hasil Zakat Profesi
              </span>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-sky-200">Penghasilan Bersih Bulanan:</span>
                  <span className="font-bold text-white">{formatRupiah(netIncomeMonthly)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-sky-200">Nisab Emas Bulanan:</span>
                  <span className="font-bold text-amber-300">{formatRupiah(monthlyGoldNisabRp)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-sky-200">Status Kewajiban:</span>
                  <span className={`font-bold ${isProfesiNisabMet ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {isProfesiNisabMet ? '✓ Wajib Zakat (2.5%)' : 'Belum Mencapai Nisab'}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white/10 rounded-xl">
                <span className="text-xs text-sky-200 block">Zakat Ditunaikan Per Bulan:</span>
                <div className="text-3xl font-black text-amber-300 mt-1">
                  {formatRupiah(profesiZakatMonthly)}
                </div>
                <span className="text-xs text-sky-200 mt-1 block">
                  Setara {formatRupiah(profesiZakatYearly)} / tahun
                </span>
              </div>
            </div>

            <button
              disabled={profesiZakatMonthly <= 0}
              onClick={() => {
                onApplyToKasir({
                  category: 'profesi',
                  profesiDetail: {
                    monthlyIncomeRp: netIncomeMonthly,
                    nominalRp: profesiZakatMonthly,
                  },
                });
              }}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <span>Gunakan Hasil Ini di Kasir Zakat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB: FIDYAH */}
      {/* ========================================================== */}
      {activeTab === 'fidyah' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Fidyah Puasa Ramadhan</h3>
            <p className="text-[11px] text-slate-500">
              Untuk lansia renta atau sakit menahun yang tidak mampu mengganti puasa dengan qadha.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Hari Puasa yang Ditinggalkan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={fidyahDays}
                  onChange={(e) => setFidyahDays(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold"
                />
                <span className="text-xs text-slate-500">Hari</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarif Fidyah per Hari (Porsi Makanan Layak)
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-800">
                {formatRupiah(config.fidyahRatePerDay)} / hari
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-slate-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-purple-300 font-semibold block">
                Total Fidyah
              </span>
              <div className="mt-4 p-4 bg-white/10 rounded-xl">
                <span className="text-xs text-purple-200 block">Kewajiban Pembayaran ({fidyahDays} Hari):</span>
                <div className="text-3xl font-black text-amber-300 mt-1">
                  {formatRupiah(fidyahTotalRp)}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onApplyToKasir({
                  category: 'fidyah',
                  fidyahDetail: {
                    daysCount: fidyahDays,
                    ratePerDayRp: config.fidyahRatePerDay,
                    nominalRp: fidyahTotalRp,
                  },
                });
              }}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <span>Gunakan Hasil Ini di Kasir Zakat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB: KAIDAH FIQIH SYAFI'I, USHUL FIQIH & DALIL */}
      {/* ========================================================== */}
      {activeTab === 'fiqh' && (
        <div className="space-y-6">
          {/* Card 1: 5 Kaidah Fiqih Zakat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Scale className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Kaidah Fiqhiyyah dalam Pengelolaan Zakat Maal (Mazhab Syafi'i)
                </h3>
                <p className="text-xs text-slate-500">
                  Prinsip ushul dan kaidah hukum yang menjadi pijakan para fukaha Syafi'iyah, ulama NU & Muhammadiyah.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KAIDAH_FIQIH_ZAKAT.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Kaidah {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 italic">{item.kitabRujukan}</span>
                  </div>
                  <div className="font-arabic text-lg text-emerald-950 font-bold text-right pt-1">
                    {item.kaidahArabic}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 italic">
                    "{item.kaidahLatin}"
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                    <strong>Artinya:</strong> {item.arti}
                  </div>
                  <div className="text-[11px] text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 leading-relaxed">
                    <strong>Penerapan Zakat:</strong> {item.penerapanZakat}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Dalil-Dalil Shahih Al-Qur'an & As-Sunnah */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Dalil-Dalil Qath'i Zakat Maal dalam Al-Qur'an & Hadits
                </h3>
                <p className="text-xs text-slate-500">
                  Landasan nash syar'i kewajiban zakat nuqud, perniagaan, pertanian, dan rikaz.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {DALIL_ZAKAT_MAAL.map((dalil, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{dalil.title}</h4>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {dalil.source}
                    </span>
                  </div>
                  {dalil.arabic && (
                    <p className="font-arabic text-lg text-slate-900 font-bold text-right leading-loose py-1">
                      {dalil.arabic}
                    </p>
                  )}
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                    "{dalil.terjemah}"
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Syarah Fiqih:</strong> {dalil.syarah}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Fatwa MUI, Keputusan NU & Muhammadiyah */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Sinergi Fatwa MUI, Ormas Islam (NU & Muhammadiyah), dan BAZNAS
                </h3>
                <p className="text-xs text-slate-500">
                  Keselarasan fikih zakat nusantara dalam bingkai regulasi Republik Indonesia.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 space-y-1.5">
                <span className="font-bold text-emerald-900 uppercase block">1. Nahdlatul Ulama (NU)</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Berdasarkan Keputusan Bahtsul Masail LBM PBNU & Muktamar NU ke-30 (1999): Zakat profesi diqiyaskan pada *al-maal al-mustafad*, nisab setara 85g emas, dan boleh dikonversi ke nilai rupiah (*qimah*) untuk memudahkan maslahat kaum dhuafa.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-sky-50/50 space-y-1.5">
                <span className="font-bold text-sky-900 uppercase block">2. Majelis Ulama Indonesia (MUI)</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Fatwa MUI No. 3 Tahun 2003: Penghasilan dari profesi wajib dizakati sebesar 2,5% jika mencapai nisab emas 85 gram per tahun (atau dibagi 12 bulan secara proporsional), baik dari bruto maupun setelah dipotong kebutuhan pokok.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/50 space-y-1.5">
                <span className="font-bold text-amber-900 uppercase block">3. Muhammadiyah & BAZNAS</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Majelis Tarjih Muhammadiyah & Peraturan BAZNAS RI: Zakat maal dan perniagaan dihitung atas aset lancar bersih setelah dikurangi hutang jatuh tempo. Zakat pertanian dihitung saat panen dengan hisab nisab 653 Kg beras bersih.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
