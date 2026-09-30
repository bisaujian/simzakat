import React, { useState } from 'react';
import { 
  Coins, 
  Wheat, 
  User, 
  Phone, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Receipt, 
  Sparkles, 
  CreditCard, 
  Banknote,
  BookOpen,
  ArrowRight,
  Scale,
  HeartHandshake,
  ShieldCheck,
  Info
} from 'lucide-react';
import { AppConfig, MuzakkiTransaction, ZakatCategory, MaalSubtype } from '../types/zakat';
import { formatKg, formatRupiah, formatThousands, generateReceiptNumber } from '../utils/helpers';
import { DOA_ZAKAT_MAAL, PANDUAN_MAAL_SYAFII } from '../utils/fiqhSyafii';
import { RupiahInput } from './common/RupiahInput';

interface TransactionFormProps {
  config: AppConfig;
  transactionsCount: number;
  onSaveTransaction: (tx: MuzakkiTransaction) => void;
  onOpenDoaModal: () => void;
  initialPrefill?: Partial<MuzakkiTransaction> | null;
  onClearPrefill?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  config,
  transactionsCount,
  onSaveTransaction,
  onOpenDoaModal,
  initialPrefill,
  onClearPrefill,
}) => {
  // Form State
  const [category, setCategory] = useState<ZakatCategory>(initialPrefill?.category || 'fitrah');
  const [name, setName] = useState(initialPrefill?.name || '');
  const [phone, setPhone] = useState(initialPrefill?.phone || '');
  const [address, setAddress] = useState(initialPrefill?.address || '');
  const [rtRw, setRtRw] = useState(initialPrefill?.rtRw || 'Jamaah Masjid');
  const [customRtRw, setCustomRtRw] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer_qris'>('tunai');
  const [amilName, setAmilName] = useState(config.headAmil || 'Petugas Amil');
  const [notes, setNotes] = useState(initialPrefill?.notes || '');

  // Fitrah Specific State
  const [fitrahUnit, setFitrahUnit] = useState<'uang' | 'beras' | 'kombinasi'>(
    initialPrefill?.fitrahDetail?.unit || 'uang'
  );
  const [payerCount, setPayerCount] = useState<number>(
    initialPrefill?.fitrahDetail?.payerCount || 1
  );
  const [familyMembers, setFamilyMembers] = useState<string[]>(
    initialPrefill?.fitrahDetail?.familyMembers || ['']
  );

  // Kombinasi Split State (Beras & Uang Bersamaan dalam 1 Muzakki)
  const initialRicePayer = initialPrefill?.fitrahDetail?.ricePayerCount !== undefined
    ? initialPrefill.fitrahDetail.ricePayerCount
    : 1;
  const initialMoneyPayer = initialPrefill?.fitrahDetail?.moneyPayerCount !== undefined
    ? initialPrefill.fitrahDetail.moneyPayerCount
    : Math.max(0, (initialPrefill?.fitrahDetail?.payerCount || 1) - initialRicePayer);
  const [ricePayerCount, setRicePayerCount] = useState<number>(initialRicePayer);
  const [moneyPayerCount, setMoneyPayerCount] = useState<number>(initialMoneyPayer);

  // Fitrah: Variasi Takaran Beras Per Jiwa (2.5, 2.8, 3.0, custom)
  const defaultRiceKg = config.fitrahRiceKgPerSoul || 2.8;
  const initialRiceKg = initialPrefill?.fitrahDetail?.riceWeightPerSoulKg || defaultRiceKg;
  const [riceKgPerSoul, setRiceKgPerSoul] = useState<number>(initialRiceKg);
  const [isCustomRice, setIsCustomRice] = useState<boolean>(
    !((config.fitrahRiceOptions || [2.5, 2.7, 2.8, 3.0, 3.5]).includes(initialRiceKg))
  );
  const [customRiceInput, setCustomRiceInput] = useState<string>(
    initialRiceKg.toString()
  );

  // Fitrah: Variasi Kategori Uang Tunai Berdasarkan SK Kemenag
  const defaultTiers = config.skKemenagTiers && config.skKemenagTiers.length > 0 
    ? config.skKemenagTiers 
    : [];
  const initialTierId = initialPrefill?.fitrahDetail?.skKemenagTierId || defaultTiers[1]?.id || defaultTiers[0]?.id || 'custom';
  const [selectedTierId, setSelectedTierId] = useState<string>(initialTierId);
  const [customMoneyPerSoul, setCustomMoneyPerSoul] = useState<number>(
    initialPrefill?.fitrahDetail?.ratePerPerson || config.fitrahMoneyPerSoul || 45000
  );

  // Maal Specific State (Kaidah Fiqih Syafi'iyah & BAZNAS)
  const [maalAssetType, setMaalAssetType] = useState<MaalSubtype>(
    (initialPrefill?.maalDetail?.assetType as MaalSubtype) || 'tabungan_emas'
  );
  const [maalTotalAsset, setMaalTotalAsset] = useState<number>(
    initialPrefill?.maalDetail?.totalAssetRp || 100000000
  );
  const [maalCustomNominal, setMaalCustomNominal] = useState<number>(
    initialPrefill?.maalDetail?.nominalRp || 0
  );

  // Subtype 1: Tabungan & Emas
  const [maalSavings, setMaalSavings] = useState<number>(
    initialPrefill?.maalDetail?.assetType === 'tabungan_emas' ? (initialPrefill.maalDetail.totalAssetRp || 100000000) : 100000000
  );
  const [maalGoldGrams, setMaalGoldGrams] = useState<number>(
    initialPrefill?.maalDetail?.goldBarGrams || 0
  );
  const [maalDebt, setMaalDebt] = useState<number>(0);
  const [maalHasHaul, setMaalHasHaul] = useState<boolean>(true);

  // Subtype 2: Perniagaan ('Urudh at-Tijarah)
  const [tradeGoods, setTradeGoods] = useState<number>(150000000);
  const [tradeCash, setTradeCash] = useState<number>(25000000);
  const [tradeReceivable, setTradeReceivable] = useState<number>(10000000);
  const [tradePayable, setTradePayable] = useState<number>(30000000);

  // Subtype 3: Pertanian (Az-Zuru')
  const [agriGrainType, setAgriGrainType] = useState<'beras' | 'gabah'>('gabah');
  const [agriHarvestKg, setAgriHarvestKg] = useState<number>(
    initialPrefill?.maalDetail?.harvestWeightKg || 1500
  );
  const [agriIrrigation, setAgriIrrigation] = useState<'hujan_sungai_10' | 'irigasi_pompa_5' | 'campuran_7_5'>(
    initialPrefill?.maalDetail?.irrigationType || 'irigasi_pompa_5'
  );
  const [agriGrainPrice, setAgriGrainPrice] = useState<number>(7500);
  const [agriPayMode, setAgriPayMode] = useState<'uang' | 'beras'>(
    initialPrefill?.totalRiceKg && initialPrefill.totalRiceKg > 0 ? 'beras' : 'uang'
  );

  // Subtype 4: Peternakan (Al-An'am)
  const [livestockType, setLivestockType] = useState<'kambing' | 'sapi'>(
    initialPrefill?.maalDetail?.livestockType || 'kambing'
  );
  const [livestockCount, setLivestockCount] = useState<number>(
    initialPrefill?.maalDetail?.livestockHeadCount || 45
  );
  const [livestockIsSaimah, setLivestockIsSaimah] = useState<boolean>(true);
  const [livestockIsGhairuAamilah, setLivestockIsGhairuAamilah] = useState<boolean>(true);

  // Subtype 5: Rikaz & Tambang
  const [rikazType, setRikazType] = useState<'rikaz' | 'tambang'>('rikaz');
  const [rikazValuation, setRikazValuation] = useState<number>(50000000);

  // Profesi Specific State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(
    initialPrefill?.profesiDetail?.monthlyIncomeRp || 0
  );

  // Infaq Specific State
  const [infaqNominal, setInfaqNominal] = useState<number>(
    initialPrefill?.infaqDetail?.nominalRp || 50000
  );
  const [infaqAllocation, setInfaqAllocation] = useState<'operasional_masjid' | 'pembangunan' | 'sosial_yatim' | 'umum'>('operasional_masjid');

  // Voluntary Infaq Tambahan (Infaq Suka Rela Tambahan Muzakki - Kustom / Bisa Masukan Sendiri)
  const [includeVoluntaryInfaq, setIncludeVoluntaryInfaq] = useState<boolean>(
    Boolean(initialPrefill?.voluntaryInfaqRp && initialPrefill.voluntaryInfaqRp > 0)
  );
  const [voluntaryInfaqNominal, setVoluntaryInfaqNominal] = useState<number>(
    initialPrefill?.voluntaryInfaqRp || 20000
  );
  const [voluntaryInfaqAllocation, setVoluntaryInfaqAllocation] = useState<
    'operasional_masjid' | 'pembangunan' | 'sosial_yatim' | 'umum'
  >(initialPrefill?.voluntaryInfaqAllocation || 'operasional_masjid');

  // Fidyah Specific State
  const [fidyahDays, setFidyahDays] = useState<number>(
    initialPrefill?.fidyahDetail?.daysCount || 7
  );

  // Family members list handlers
  const handlePayerCountChange = (newCount: number) => {
    const val = Math.max(1, Math.min(25, newCount));
    setPayerCount(val);
    const updated = [...familyMembers];
    if (val > updated.length) {
      for (let i = updated.length; i < val; i++) {
        updated.push('');
      }
    } else if (val < updated.length) {
      updated.splice(val);
    }
    setFamilyMembers(updated);

    // Rebalance kombinasi split if needed
    if (fitrahUnit === 'kombinasi') {
      if (ricePayerCount + moneyPayerCount !== val) {
        const half = Math.ceil(val / 2);
        setRicePayerCount(half);
        setMoneyPayerCount(val - half);
      }
    }
  };

  const handleRicePayerCountChange = (val: number) => {
    const clampedRice = Math.max(0, Math.min(payerCount, val));
    setRicePayerCount(clampedRice);
    setMoneyPayerCount(payerCount - clampedRice);
  };

  const handleMoneyPayerCountChange = (val: number) => {
    const clampedMoney = Math.max(0, Math.min(payerCount, val));
    setMoneyPayerCount(clampedMoney);
    setRicePayerCount(payerCount - clampedMoney);
  };

  const handleFamilyNameChange = (index: number, val: string) => {
    const updated = [...familyMembers];
    updated[index] = val;
    setFamilyMembers(updated);
  };

  // Calculations
  const availableRicePresets = config.fitrahRiceOptions && config.fitrahRiceOptions.length > 0
    ? config.fitrahRiceOptions
    : [2.5, 2.7, 2.8, 3.0, 3.5];

  const effectiveRiceKgPerSoul = isCustomRice
    ? (parseFloat(customRiceInput) || 0)
    : riceKgPerSoul;

  const availableTiers = config.skKemenagTiers && config.skKemenagTiers.length > 0
    ? config.skKemenagTiers
    : [
        { id: 'tier-1', name: 'Kategori I (Beras Super / Premium)', riceType: 'Pandan Wangi, Rojolele, Mentik', pricePerSoulRp: 55000 },
        { id: 'tier-2', name: 'Kategori II (Beras Menengah Atas)', riceType: 'Setra Ramos, C4, Ramos Bandung', pricePerSoulRp: 45000 },
        { id: 'tier-3', name: 'Kategori III (Beras Standar / Medium)', riceType: 'IR-64, Beras Bulog Premium', pricePerSoulRp: 40000 },
        { id: 'tier-4', name: 'Kategori IV (Beras Sederhana / SPHP)', riceType: 'Beras SPHP / Medium Bulog', pricePerSoulRp: 35000 },
      ];

  const currentTier = availableTiers.find((t) => t.id === selectedTierId);
  const effectiveMoneyPerSoul = selectedTierId === 'custom'
    ? customMoneyPerSoul
    : (currentTier ? currentTier.pricePerSoulRp : config.fitrahMoneyPerSoul || 45000);

  const calculatedRiceKg = fitrahUnit === 'beras'
    ? Math.round(payerCount * effectiveRiceKgPerSoul * 100) / 100
    : (fitrahUnit === 'kombinasi' ? Math.round(ricePayerCount * effectiveRiceKgPerSoul * 100) / 100 : 0);

  const calculatedFitrahRp = fitrahUnit === 'uang'
    ? payerCount * effectiveMoneyPerSoul
    : (fitrahUnit === 'kombinasi' ? moneyPayerCount * effectiveMoneyPerSoul : 0);
  
  // Maal Nisab (85g emas) & Dynamic Calculations
  const nisabGoldRp = 85 * config.goldPricePerGram;

  let computedMaalAssetRp = 0;
  let computedMaalDueRp = 0;
  let computedMaalDueRiceKg = 0;
  let computedMaalNisabMet = false;
  let computedRatePercent = 2.5;
  let computedMaalNotes = '';
  let computedLivestockDesc = '';

  if (maalAssetType === 'tabungan_emas') {
    computedMaalAssetRp = Math.max(0, maalSavings + (maalGoldGrams * config.goldPricePerGram) - maalDebt);
    computedMaalNisabMet = computedMaalAssetRp >= nisabGoldRp;
    computedRatePercent = 2.5;
    computedMaalDueRp = (computedMaalNisabMet && maalHasHaul) ? Math.round(computedMaalAssetRp * 0.025) : 0;
    computedMaalNotes = `Tabungan & Emas (Nisab: 85g Emas = ${formatRupiah(nisabGoldRp)})`;
  } else if (maalAssetType === 'perniagaan') {
    computedMaalAssetRp = Math.max(0, (tradeGoods + tradeCash + tradeReceivable) - tradePayable);
    computedMaalNisabMet = computedMaalAssetRp >= nisabGoldRp;
    computedRatePercent = 2.5;
    computedMaalDueRp = computedMaalNisabMet ? Math.round(computedMaalAssetRp * 0.025) : 0;
    computedMaalNotes = `Perniagaan/Tijarah 2.5% (Aset Lancar Bersih: ${formatRupiah(computedMaalAssetRp)})`;
  } else if (maalAssetType === 'pertanian') {
    const agriNisabKg = agriGrainType === 'beras' ? 653 : 1350;
    computedMaalNisabMet = agriHarvestKg >= agriNisabKg;
    computedRatePercent = agriIrrigation === 'hujan_sungai_10' ? 10 : agriIrrigation === 'irigasi_pompa_5' ? 5 : 7.5;
    const dueKg = computedMaalNisabMet ? Math.round(agriHarvestKg * (computedRatePercent / 100) * 100) / 100 : 0;
    computedMaalAssetRp = agriHarvestKg * agriGrainPrice;
    if (agriPayMode === 'beras' && agriGrainType === 'beras') {
      computedMaalDueRiceKg = dueKg;
      computedMaalDueRp = 0;
    } else {
      computedMaalDueRp = Math.round(dueKg * agriGrainPrice);
    }
    computedMaalNotes = `Pertanian ${agriGrainType} ${formatKg(agriHarvestKg)} kadar ${computedRatePercent}%`;
  } else if (maalAssetType === 'peternakan') {
    const goatPrice = config.goatPricePerHead || 2500000;
    const cowPrice = config.cowPricePerHead || 14000000;
    if (livestockIsSaimah && livestockIsGhairuAamilah) {
      if (livestockType === 'kambing' && livestockCount >= 40) {
        computedMaalNisabMet = true;
        const count = livestockCount <= 120 ? 1 : livestockCount <= 200 ? 2 : livestockCount <= 399 ? 3 : Math.floor(livestockCount / 100);
        computedLivestockDesc = `${count} ekor kambing`;
        computedMaalDueRp = count * goatPrice;
      } else if (livestockType === 'sapi' && livestockCount >= 30) {
        computedMaalNisabMet = true;
        const count = livestockCount < 40 ? 1 : livestockCount < 60 ? 1 : Math.floor(livestockCount / 30);
        computedLivestockDesc = livestockCount < 40 ? '1 ekor tabi\'' : livestockCount < 60 ? '1 ekor musinnah' : `${count} ekor tabi'`;
        computedMaalDueRp = livestockCount < 40 ? cowPrice * 0.7 : livestockCount < 60 ? cowPrice : count * (cowPrice * 0.75);
      }
    }
    computedMaalAssetRp = livestockCount * (livestockType === 'kambing' ? goatPrice : cowPrice);
    computedMaalNotes = `Peternakan ${livestockCount} ekor ${livestockType}: ${computedLivestockDesc || 'Belum nisab'}`;
  } else if (maalAssetType === 'rikaz_tambang') {
    computedRatePercent = rikazType === 'rikaz' ? 20 : 2.5;
    computedMaalAssetRp = rikazValuation;
    computedMaalNisabMet = rikazType === 'rikaz' ? true : rikazValuation >= nisabGoldRp;
    computedMaalDueRp = computedMaalNisabMet ? Math.round(rikazValuation * (computedRatePercent / 100)) : 0;
    computedMaalNotes = `${rikazType === 'rikaz' ? 'Rikaz (Al-Khums 20%)' : 'Tambang 2.5%'}`;
  } else {
    computedMaalAssetRp = maalTotalAsset;
    computedMaalNisabMet = maalTotalAsset >= nisabGoldRp;
    computedRatePercent = 2.5;
    computedMaalDueRp = maalCustomNominal > 0 ? maalCustomNominal : Math.round(maalTotalAsset * 0.025);
    computedMaalNotes = `Zakat Maal Lainnya (2.5%)`;
  }

  const effectiveMaalNominalRp = maalCustomNominal > 0 ? maalCustomNominal : computedMaalDueRp;

  // Profesi (2.5%)
  const profesiCalculatedRp = Math.round(monthlyIncome * 0.025);

  // Fidyah
  const fidyahCalculatedRp = fidyahDays * config.fidyahRatePerDay;

  // Final summary amounts for current selection
  let baseMoneyRp = 0;
  let finalRiceKg = 0;

  if (category === 'fitrah') {
    if (fitrahUnit === 'uang') {
      baseMoneyRp = calculatedFitrahRp;
      finalRiceKg = 0;
    } else if (fitrahUnit === 'beras') {
      finalRiceKg = calculatedRiceKg;
      baseMoneyRp = 0;
    } else if (fitrahUnit === 'kombinasi') {
      finalRiceKg = calculatedRiceKg;
      baseMoneyRp = calculatedFitrahRp;
    }
  } else if (category === 'maal') {
    if (maalAssetType === 'pertanian' && agriPayMode === 'beras') {
      finalRiceKg = computedMaalDueRiceKg;
      baseMoneyRp = 0;
    } else {
      baseMoneyRp = effectiveMaalNominalRp;
    }
  } else if (category === 'profesi') {
    baseMoneyRp = profesiCalculatedRp;
  } else if (category === 'infaq') {
    baseMoneyRp = infaqNominal;
  } else if (category === 'fidyah') {
    baseMoneyRp = fidyahCalculatedRp;
  }

  const addedInfaqRp = (category !== 'infaq' && includeVoluntaryInfaq) ? (voluntaryInfaqNominal || 0) : 0;
  const finalMoneyRp = baseMoneyRp + addedInfaqRp;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Silakan masukkan nama muzakki terlebih dahulu.');
      return;
    }

    if (category === 'fitrah') {
      if (fitrahUnit === 'beras' && effectiveRiceKgPerSoul <= 0) {
        alert('Silakan tentukan takaran beras per jiwa yang valid (lebih dari 0 Kg).');
        return;
      }
      if (fitrahUnit === 'uang' && effectiveMoneyPerSoul <= 0) {
        alert('Silakan pilih kategori zakat fitrah uang atau isi nominal yang valid.');
        return;
      }
      if (fitrahUnit === 'kombinasi') {
        if (ricePayerCount <= 0 && moneyPayerCount <= 0) {
          alert('Silakan tentukan alokasi jiwa untuk beras dan uang.');
          return;
        }
        if (ricePayerCount > 0 && effectiveRiceKgPerSoul <= 0) {
          alert('Silakan tentukan takaran beras per jiwa yang valid.');
          return;
        }
        if (moneyPayerCount > 0 && effectiveMoneyPerSoul <= 0) {
          alert('Silakan pilih kategori zakat fitrah uang atau isi nominal yang valid.');
          return;
        }
      }
    }

    const receiptNum = generateReceiptNumber(transactionsCount, config.hijriYear);
    const resolvedRtRw =
      rtRw === 'custom' || rtRw === 'custom_jamaah' || rtRw === 'custom_luar'
        ? (customRtRw.trim() || 'Jamaah Masjid')
        : rtRw;

    const newTx: MuzakkiTransaction = {
      id: `tx-${Date.now()}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().split('T')[0],
      name: name.trim(),
      phone: phone.trim() || '-',
      address: address.trim() || 'Dalam Wilayah DKM',
      rtRw: resolvedRtRw,
      category,
      voluntaryInfaqRp: (category !== 'infaq' && includeVoluntaryInfaq) ? (voluntaryInfaqNominal || 0) : 0,
      voluntaryInfaqAllocation: (category !== 'infaq' && includeVoluntaryInfaq) ? voluntaryInfaqAllocation : undefined,
      paymentMethod,
      amilName: amilName.trim() || config.headAmil,
      notes: notes.trim(),
      totalMoneyRp: finalMoneyRp,
      totalRiceKg: finalRiceKg,
    };

    if (category === 'fitrah') {
      const cleanNames = familyMembers.filter((n) => n.trim().length > 0);
      const tierName = selectedTierId === 'custom'
        ? `Kustom (${formatRupiah(effectiveMoneyPerSoul)}/jiwa)`
        : (currentTier?.name || 'Sesuai SK Kemenag');

      newTx.fitrahDetail = {
        payerCount,
        familyMembers: cleanNames.length > 0 ? cleanNames : [name],
        unit: fitrahUnit,
        riceWeightKg: finalRiceKg,
        nominalRp: finalMoneyRp,
        ratePerPerson: fitrahUnit === 'beras' ? effectiveRiceKgPerSoul : effectiveMoneyPerSoul,
        riceWeightPerSoulKg: effectiveRiceKgPerSoul,
        skKemenagTierId: selectedTierId,
        skKemenagTierName: tierName,
        ricePayerCount: fitrahUnit === 'kombinasi' ? ricePayerCount : (fitrahUnit === 'beras' ? payerCount : 0),
        moneyPayerCount: fitrahUnit === 'kombinasi' ? moneyPayerCount : (fitrahUnit === 'uang' ? payerCount : 0),
      };
    } else if (category === 'maal') {
      newTx.maalDetail = {
        assetType: maalAssetType,
        totalAssetRp: computedMaalAssetRp,
        nominalRp: finalMoneyRp,
        nisabMet: computedMaalNisabMet,
        nisabThresholdRp: maalAssetType === 'pertanian' ? (agriGrainType === 'beras' ? 653 : 1350) * agriGrainPrice : nisabGoldRp,
        haulStatus: maalAssetType === 'pertanian' ? 'saat_panen' : (maalAssetType === 'rikaz_tambang' ? 'tanpa_haul' : (maalHasHaul ? 'telah_haul' : 'belum_haul')),
        ratePercent: computedRatePercent,
        calculationNotes: computedMaalNotes,
        irrigationType: maalAssetType === 'pertanian' ? agriIrrigation : undefined,
        harvestWeightKg: maalAssetType === 'pertanian' ? agriHarvestKg : undefined,
        livestockType: maalAssetType === 'peternakan' ? livestockType : undefined,
        livestockHeadCount: maalAssetType === 'peternakan' ? livestockCount : undefined,
        livestockObligationDesc: maalAssetType === 'peternakan' ? computedLivestockDesc : undefined,
        goldBarGrams: maalAssetType === 'tabungan_emas' ? maalGoldGrams : undefined,
      };
    } else if (category === 'profesi') {
      newTx.profesiDetail = {
        monthlyIncomeRp: monthlyIncome,
        nominalRp: finalMoneyRp,
      };
    } else if (category === 'infaq') {
      newTx.infaqDetail = {
        nominalRp: finalMoneyRp,
        allocation: infaqAllocation,
      };
    } else if (category === 'fidyah') {
      newTx.fidyahDetail = {
        daysCount: fidyahDays,
        ratePerDayRp: config.fidyahRatePerDay,
        nominalRp: finalMoneyRp,
      };
    }

    onSaveTransaction(newTx);

    // Reset some fields for next entry
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setPayerCount(1);
    setFamilyMembers(['']);
    setMaalTotalAsset(0);
    setMaalCustomNominal(0);
    setMonthlyIncome(0);
    setIncludeVoluntaryInfaq(false);
    setVoluntaryInfaqNominal(20000);
    if (onClearPrefill) onClearPrefill();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 border border-emerald-400/30 text-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Kasir Zakat Cepat & Praktis
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Input Penerimaan Zakat, Infaq & Fidyah
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Catat data muzakki secara instan, otomatis menghitung jumlah zakat, doa ijab qabul amil, dan langsung cetak kuitansi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenDoaModal}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm flex items-center gap-2 transition"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Panduan Doa Amil</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Category Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              1. Pilih Jenis Penerimaan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'fitrah', label: 'Zakat Fitrah', sub: 'Beras / Uang' },
                { id: 'maal', label: 'Zakat Maal', sub: 'Harta / Emas' },
                { id: 'profesi', label: 'Zakat Profesi', sub: 'Gaji Bulanan' },
                { id: 'infaq', label: 'Infaq/Sedekah', sub: 'Masjid/Yatim' },
                { id: 'fidyah', label: 'Fidyah', sub: 'Hutang Puasa' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id as ZakatCategory)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    category === item.id
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Muzakki Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Data Muzakki (Pemberi Zakat)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Muzakki / Kepala Keluarga <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (familyMembers.length > 0 && familyMembers[0] === '') {
                        setFamilyMembers([e.target.value, ...familyMembers.slice(1)]);
                      }
                    }}
                    placeholder="Contoh: Bpk. H. Hendra Gunawan"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  No. WhatsApp / HP (Untuk Bukti Digital)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alamat / Jalan / Blok Rumah
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Merpati No. 4"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Wilayah / Asal Jamaah
                  </label>
                  <span className="text-[10px] text-slate-400">Pilih Kategori</span>
                </div>

                {/* Tombol Cepat: Jamaah Masjid vs Luar Lingkungan */}
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRtRw('Jamaah Masjid');
                      setCustomRtRw('');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                      rtRw.startsWith('Jamaah Masjid') || rtRw.startsWith('RT') || rtRw === 'custom_jamaah'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🕌 Jamaah Masjid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRtRw('Luar Lingkungan / Jamaah Tamu');
                      setCustomRtRw('');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                      rtRw.startsWith('Luar Lingkungan') || rtRw.startsWith('Jamaah Musafir') || rtRw.startsWith('Donatur Online') || rtRw === 'custom_luar'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-1 ring-amber-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🚗 Luar Lingkungan / Tamu</span>
                  </button>
                </div>

                {/* Dropdown Kategori Wilayah / Asal Jamaah */}
                <select
                  value={rtRw}
                  onChange={(e) => setRtRw(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm outline-hidden bg-white font-medium"
                >
                  <option value="Jamaah Masjid">🕌 Jamaah Masjid</option>
                  <option value="Luar Lingkungan / Jamaah Tamu">🚗 Luar Lingkungan / Jamaah Tamu</option>
                  <option value="custom">+ Tulis RT / RW / Keterangan Khusus...</option>
                </select>

                {(rtRw === 'custom' || rtRw === 'custom_jamaah' || rtRw === 'custom_luar') && (
                  <input
                    type="text"
                    value={customRtRw}
                    onChange={(e) => setCustomRtRw(e.target.value)}
                    placeholder="Tulis RT / RW / Dusun / Keterangan asal muzakki..."
                    className="mt-2 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    autoFocus
                  />
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Specific Category Fields */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                3. Detail Pembayaran {category.toUpperCase()}
              </label>
            </div>

            {/* A. FITRAH */}
            {category === 'fitrah' && (
              <div className="space-y-4">
                {/* 1. Toggle Bentuk Zakat */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Bentuk Zakat Fitrah:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFitrahUnit('uang')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        fitrahUnit === 'uang'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" /> Uang Tunai
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitrahUnit('beras')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        fitrahUnit === 'beras'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Wheat className="w-3.5 h-3.5" /> Beras Makanan Pokok
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFitrahUnit('kombinasi');
                        if (ricePayerCount + moneyPayerCount !== payerCount || (ricePayerCount === 0 && moneyPayerCount === 0)) {
                          const half = Math.ceil(payerCount / 2);
                          setRicePayerCount(half);
                          setMoneyPayerCount(payerCount - half);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        fitrahUnit === 'kombinasi'
                          ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-500'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Kombinasi (Beras & Uang Bersamaan)
                    </button>
                  </div>
                </div>

                {/* 1.1 Jika Kombinasi: Panel Pembagian Jiwa (Beras vs Uang) */}
                {fitrahUnit === 'kombinasi' && (
                  <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-teal-700" />
                          Alokasi Jiwa: Sebagian Beras & Sebagian Uang Tunai
                        </h4>
                        <p className="text-[11px] text-teal-800">
                          Catat dalam 1 transaksi kuitansi kolektif untuk muzakki keluarga yang membayar menggunakan dua jenis komoditas.
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-teal-200 text-teal-950 rounded-lg whitespace-nowrap">
                        Total: {payerCount} Jiwa
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Jiwa Beras */}
                      <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Wheat className="w-4 h-4 text-amber-600" />
                            Jiwa Bayar Beras
                          </span>
                          <span className="text-xs font-black text-amber-800">
                            {formatKg(calculatedRiceKg)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRicePayerCountChange(ricePayerCount - 1)}
                            className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={payerCount}
                            value={ricePayerCount}
                            onChange={(e) => handleRicePayerCountChange(parseInt(e.target.value) || 0)}
                            className="w-16 text-center py-1 font-bold text-slate-800 text-sm border border-amber-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRicePayerCountChange(ricePayerCount + 1)}
                            className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-xs text-slate-600 font-medium ml-1">
                            Jiwa (@ {effectiveRiceKgPerSoul} Kg)
                          </span>
                        </div>
                      </div>

                      {/* Jiwa Uang */}
                      <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-emerald-600" />
                            Jiwa Bayar Uang Tunai
                          </span>
                          <span className="text-xs font-black text-emerald-800">
                            {formatRupiah(calculatedFitrahRp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoneyPayerCountChange(moneyPayerCount - 1)}
                            className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={payerCount}
                            value={moneyPayerCount}
                            onChange={(e) => handleMoneyPayerCountChange(parseInt(e.target.value) || 0)}
                            className="w-16 text-center py-1 font-bold text-slate-800 text-sm border border-emerald-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleMoneyPayerCountChange(moneyPayerCount + 1)}
                            className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-xs text-slate-600 font-medium ml-1">
                            Jiwa (@ {formatRupiah(effectiveMoneyPerSoul)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {ricePayerCount + moneyPayerCount !== payerCount && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                        <span>⚠️ Total alokasi ({ricePayerCount + moneyPayerCount} jiwa) belum sama dengan jumlah tanggungan ({payerCount} jiwa).</span>
                        <button
                          type="button"
                          onClick={() => {
                            const half = Math.ceil(payerCount / 2);
                            setRicePayerCount(half);
                            setMoneyPayerCount(payerCount - half);
                          }}
                          className="px-2 py-1 bg-rose-700 text-white rounded text-[11px] font-bold"
                        >
                          Seimbangkan Otomatis
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Sub-Form: Jika BERAS atau KOMBINASI */}
                {(fitrahUnit === 'beras' || fitrahUnit === 'kombinasi') && (
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Wheat className="w-4 h-4 text-amber-700" />
                        Pilihan Takaran Beras Per Jiwa {fitrahUnit === 'kombinasi' ? `(Untuk ${ricePayerCount} Jiwa Beras)` : ''}:
                      </label>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Dipilih: <strong>{effectiveRiceKgPerSoul} Kg / Jiwa</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {availableRicePresets.map((preset) => {
                        const isSelected = !isCustomRice && riceKgPerSoul === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setIsCustomRice(false);
                              setRiceKgPerSoul(preset);
                              setCustomRiceInput(preset.toString());
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                                : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                            }`}
                          >
                            <span>{preset} Kg</span>
                            {preset === 2.5 && <span className="text-[10px] font-normal opacity-85">(Standar)</span>}
                            {preset === 2.8 && <span className="text-[10px] font-normal opacity-85">(Ihtiyath)</span>}
                            {preset === 3.0 && <span className="text-[10px] font-normal opacity-85">(DKI/Ormas)</span>}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setIsCustomRice(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isCustomRice
                            ? 'bg-amber-700 text-white shadow-xs ring-2 ring-amber-500'
                            : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        + Kustom Lebih ({isCustomRice ? `${effectiveRiceKgPerSoul} Kg` : 'Input Kg'})
                      </button>
                    </div>

                    {isCustomRice && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-amber-950 font-medium">Masukkan Takaran Bebas:</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.5"
                          max="20"
                          value={customRiceInput}
                          onChange={(e) => {
                            setCustomRiceInput(e.target.value);
                            const parsed = parseFloat(e.target.value);
                            if (!isNaN(parsed)) setRiceKgPerSoul(parsed);
                          }}
                          className="w-24 px-2.5 py-1 rounded-md border border-amber-400 bg-white text-xs font-bold text-slate-800"
                        />
                        <span className="text-xs font-bold text-amber-900">Kg / Jiwa</span>
                        <span className="text-[11px] text-amber-700 italic ml-2">
                          (Contoh: 2.7, 3.2, 3.5, 4.0 Kg jika muzakki melebihkan takaran)
                        </span>
                      </div>
                    )}

                    <div className="text-[11px] text-amber-900/90 bg-amber-100/60 p-2 rounded-lg border border-amber-200">
                      💡 <strong>Catatan Fiqih Amil:</strong> Standar umum 1 sha' = 2,5 Kg (atau 3,5 liter beras). Sebagian besar BAZNAS kabupaten/kota & ormas menetapkan 2,7 - 2,8 Kg sebagai bentuk <em>ihtiyath</em> (kehati-hatian) agar tidak kurang, dan 3,0 Kg untuk Mazhab Syafi'i (BAZNAS DKI). Jika muzakki membawa lebih, sisanya dicatat sebagai sedekah penyempurna.
                    </div>
                  </div>
                )}

                {/* 3. Sub-Form: Jika UANG TUNAI atau KOMBINASI */}
                {(fitrahUnit === 'uang' || fitrahUnit === 'kombinasi') && (
                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-emerald-700" />
                          Kategori Harga Beras SK Kemenag & BAZNAS {fitrahUnit === 'kombinasi' ? `(Untuk ${moneyPayerCount} Jiwa Uang)` : ''}:
                        </label>
                        <p className="text-[11px] text-emerald-800">
                          Pilih kategori sesuai dengan jenis beras makanan pokok yang biasa dikonsumsi keluarga muzakki.
                        </p>
                      </div>
                      {config.skKemenagReference && (
                        <span className="inline-block px-2.5 py-1 bg-emerald-200 text-emerald-950 font-semibold rounded-md text-[10px] whitespace-nowrap">
                          {config.skKemenagReference}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {availableTiers.map((tier) => {
                        const isSelected = selectedTierId === tier.id;
                        return (
                          <div
                            key={tier.id}
                            onClick={() => setSelectedTierId(tier.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition text-left relative ${
                              isSelected
                                ? 'bg-white border-emerald-600 ring-2 ring-emerald-500 shadow-xs'
                                : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                                  isSelected ? 'text-emerald-800' : 'text-slate-600'
                                }`}>
                                  {tier.name}
                                </span>
                                <div className="text-sm font-black text-slate-900 mt-0.5">
                                  {formatRupiah(tier.pricePerSoulRp)}{' '}
                                  <span className="text-[11px] font-normal text-slate-500">/ jiwa</span>
                                </div>
                              </div>
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedTierId(tier.id)}
                                className="accent-emerald-600 mt-1 cursor-pointer"
                              />
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                              <strong>Jenis Beras:</strong> {tier.riceType}
                            </div>
                            {tier.description && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5">
                                {tier.description}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Custom Category Card with RupiahInput */}
                      <div
                        onClick={() => setSelectedTierId('custom')}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                          selectedTierId === 'custom'
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-500 shadow-xs'
                            : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                              Kategori Kustom / Beras Khusus
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Untuk beras merah/organik/impor atau ketetapan khusus
                            </span>
                          </div>
                          <input
                            type="radio"
                            checked={selectedTierId === 'custom'}
                            onChange={() => setSelectedTierId('custom')}
                            className="accent-emerald-600 mt-1 cursor-pointer"
                          />
                        </div>

                        {selectedTierId === 'custom' && (
                          <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                            <RupiahInput
                              value={customMoneyPerSoul}
                              onChange={setCustomMoneyPerSoul}
                              placeholder="Ketik tarif rupiah..."
                              showTerbilang={false}
                              className="py-1.5 text-xs font-bold"
                            />
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Format otomatis titik ribuan per jiwa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Jumlah Jiwa & Real-time Subtotal */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Jumlah Jiwa (Tanggungan)
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden w-full max-w-[160px]">
                      <button
                        type="button"
                        onClick={() => handlePayerCountChange(payerCount - 1)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={payerCount}
                        onChange={(e) => handlePayerCountChange(parseInt(e.target.value) || 1)}
                        className="w-full text-center py-2 font-bold text-slate-800 text-sm outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handlePayerCountChange(payerCount + 1)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className={`sm:col-span-2 rounded-xl p-3 flex items-center justify-between border ${
                    fitrahUnit === 'kombinasi'
                      ? 'bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border-teal-300'
                      : fitrahUnit === 'beras'
                      ? 'bg-amber-50/80 border-amber-300'
                      : 'bg-emerald-50/80 border-emerald-300'
                  }`}>
                    <div>
                      <span className="text-xs text-slate-600 font-medium block">
                        Total {fitrahUnit === 'kombinasi' ? 'Zakat Kolektif (Beras & Uang)' : (fitrahUnit === 'beras' ? 'Beras Diserahkan' : 'Uang Zakat Fitrah')}
                      </span>
                      {fitrahUnit === 'kombinasi' ? (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                          <span className="text-lg font-black text-amber-900">
                            {formatKg(calculatedRiceKg)}
                          </span>
                          <span className="text-slate-400 font-bold">+</span>
                          <span className="text-lg font-black text-emerald-900">
                            {formatRupiah(calculatedFitrahRp)}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-xl font-black ${
                          fitrahUnit === 'beras' ? 'text-amber-800' : 'text-emerald-900'
                        }`}>
                          {fitrahUnit === 'beras'
                            ? formatKg(calculatedRiceKg)
                            : formatRupiah(calculatedFitrahRp)}
                        </span>
                      )}
                      
                      {fitrahUnit === 'uang' && (
                        <span className="text-[11px] text-emerald-700 block font-medium">
                          {selectedTierId === 'custom' ? 'Kategori Kustom' : currentTier?.name}
                        </span>
                      )}
                      {fitrahUnit === 'kombinasi' && (
                        <span className="text-[11px] text-teal-800 block font-medium">
                          {ricePayerCount} Jiwa Beras + {moneyPayerCount} Jiwa Uang ({payerCount} Jiwa Total)
                        </span>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-500 font-medium">
                      {fitrahUnit === 'kombinasi' ? (
                        <>
                          <div>Beras: {ricePayerCount} jiwa × {effectiveRiceKgPerSoul} Kg</div>
                          <div>Uang: {moneyPayerCount} jiwa × {formatRupiah(effectiveMoneyPerSoul)}</div>
                        </>
                      ) : (
                        <div>{payerCount} jiwa × {fitrahUnit === 'beras' ? `${effectiveRiceKgPerSoul} Kg` : formatRupiah(effectiveMoneyPerSoul)}</div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">Otomatis Terkalkulasi</div>
                    </div>
                  </div>
                </div>

                {/* 5. Names of family members */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Nama-Nama Jiwa yang Dizakati ({payerCount} Orang):
                    </label>
                    <span className="text-[11px] text-slate-500 italic">
                      Dicetak pada Kuitansi Bukti Zakat
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {familyMembers.map((famName, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                        <input
                          type="text"
                          value={famName}
                          onChange={(e) => handleFamilyNameChange(idx, e.target.value)}
                          placeholder={idx === 0 ? 'Nama Kepala Keluarga' : `Anggota Keluarga ${idx + 1}`}
                          className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-300 text-xs focus:border-emerald-500 outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* B. MAAL (MAZHAB SYAFI'I COMPREHENSIVE) */}
            {category === 'maal' && (
              <div className="space-y-5">
                {/* 1. Subtype Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-700" />
                      Pilih Klasifikasi Harta Maal (Fiqih Syafi'iyah & BAZNAS):
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      Nisab Emas: {formatRupiah(nisabGoldRp)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'tabungan_emas', label: '1. Tabungan & Emas', sub: 'Nuqud (Kadar 2.5%)' },
                      { id: 'perniagaan', label: '2. Perniagaan / Usaha', sub: '\'Urudh at-Tijarah (2.5%)' },
                      { id: 'pertanian', label: '3. Pertanian (Panen)', sub: 'Az-Zuru\' (5% / 10%)' },
                      { id: 'peternakan', label: '4. Hewan Ternak', sub: 'Al-An\'am (Kambing/Sapi)' },
                      { id: 'rikaz_tambang', label: '5. Rikaz & Tambang', sub: 'Temuan Karun (20%)' },
                      { id: 'investasi', label: '6. Saham / Investasi', sub: 'Pasar Modal (2.5%)' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setMaalAssetType(item.id as MaalSubtype);
                          setMaalCustomNominal(0);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          maalAssetType === item.id
                            ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="text-xs truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-form 1: Tabungan & Emas */}
                {maalAssetType === 'tabungan_emas' && (
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
                    <span className="text-xs font-bold text-emerald-950 block">
                      Parameter Uang Tabungan, Deposito & Emas Simpanan
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Saldo Tabungan / Kas / Deposito
                        </label>
                        <RupiahInput
                          value={maalSavings}
                          onChange={setMaalSavings}
                          placeholder="0"
                          showTerbilang={true}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Emas Batangan / Dinar Simpanan (Gram)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={maalGoldGrams || ''}
                          onChange={(e) => setMaalGoldGrams(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
                        />
                        <span className="text-[10px] text-slate-500">
                          {maalGoldGrams > 0 ? `Setara ${formatRupiah(maalGoldGrams * config.goldPricePerGram)}` : 'Emas murni simpanan'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hutang Pokok Jatuh Tempo / Cicilan Mendesak
                        </label>
                        <RupiahInput
                          value={maalDebt}
                          onChange={setMaalDebt}
                          placeholder="0"
                          className="text-rose-700 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-[11px] text-amber-950">
                      💡 <strong>Kaidah Mazhab Syafi'i (Al-Huliyy al-Mubah):</strong> Emas perhiasan wanita yang biasa dipakai sehari-hari <strong>bebas dari zakat</strong>. Hanya emas batangan, koin dinar simpanan, atau perhiasan berlebihan di luar kelaziman yang dihitung zakatnya.
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-700 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maalHasHaul}
                        onChange={(e) => setMaalHasHaul(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Harta telah genap dimiliki selama 1 tahun Hijriah (Haul)</span>
                    </label>
                  </div>
                )}

                {/* Sub-form 2: Perniagaan */}
                {maalAssetType === 'perniagaan' && (
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
                    <span className="text-xs font-bold text-emerald-950 block">
                      Hisab Harta Usaha Dagang ('Urudh at-Tijarah)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nilai Stok Barang Dagangan Akhir Haul
                        </label>
                        <RupiahInput
                          value={tradeGoods}
                          onChange={setTradeGoods}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Uang Kas & Saldo Rekening Usaha
                        </label>
                        <RupiahInput
                          value={tradeCash}
                          onChange={setTradeCash}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Piutang Lancar yang Tertagih
                        </label>
                        <RupiahInput
                          value={tradeReceivable}
                          onChange={setTradeReceivable}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hutang Usaha Jatuh Tempo
                        </label>
                        <RupiahInput
                          value={tradePayable}
                          onChange={setTradePayable}
                          placeholder="0"
                          className="text-rose-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form 3: Pertanian */}
                {maalAssetType === 'pertanian' && (
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                    <span className="text-xs font-bold text-amber-950 block">
                      Hisab Zakat Hasil Pertanian & Panen (Az-Zuru')
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Bentuk Hasil Panen
                        </label>
                        <select
                          value={agriGrainType}
                          onChange={(e) => setAgriGrainType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                        >
                          <option value="gabah">Gabah Kering Giling (GKG) - Nisab 1.350 Kg</option>
                          <option value="beras">Beras Dikupas - Nisab 653 Kg (5 Wasaq)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Total Hasil Panen Bersih (Kg)
                        </label>
                        <input
                          type="number"
                          value={agriHarvestKg || ''}
                          onChange={(e) => setAgriHarvestKg(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-amber-900 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Jenis Pengairan Sawah:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'hujan_sungai_10', label: 'Air Hujan / Sungai (10%)' },
                            { id: 'irigasi_pompa_5', label: 'Pompa Berbayar / BBM (5%)' },
                            { id: 'campuran_7_5', label: 'Campuran (7.5%)' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setAgriIrrigation(item.id as any)}
                              className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer ${
                                agriIrrigation === item.id
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Pilihan Bentuk Penyerahan:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAgriPayMode('uang')}
                            className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                              agriPayMode === 'uang' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700'
                            }`}
                          >
                            Uang Tunai (Rp)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAgriPayMode('beras')}
                            className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                              agriPayMode === 'beras' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700'
                            }`}
                          >
                            Wujud Beras (Kg)
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Taksiran Harga per Kg
                        </label>
                        <RupiahInput
                          value={agriGrainPrice}
                          onChange={setAgriGrainPrice}
                          placeholder="Contoh: 14.000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form 4: Peternakan */}
                {maalAssetType === 'peternakan' && (
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
                    <span className="text-xs font-bold text-emerald-950 block">
                      Zakat Hewan Ternak (Al-An'am: Sa'imah & Ghairu 'Aamilah)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Jenis Hewan
                        </label>
                        <select
                          value={livestockType}
                          onChange={(e) => setLivestockType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                        >
                          <option value="kambing">Kambing / Domba (Nisab 40 ekor)</option>
                          <option value="sapi">Sapi / Kerbau (Nisab 30 ekor)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Jumlah Ekor Ternak
                        </label>
                        <input
                          type="number"
                          value={livestockCount || ''}
                          onChange={(e) => setLivestockCount(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                        <strong>Kewajiban Syar'i:</strong> {computedLivestockDesc || 'Belum mencapai nisab'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form 5: Rikaz & Tambang */}
                {maalAssetType === 'rikaz_tambang' && (
                  <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-3">
                    <span className="text-xs font-bold text-purple-950 block">
                      Zakat Rikaz (Harta Karun Purba) & Hasil Tambang
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Klasifikasi Temuan
                        </label>
                        <select
                          value={rikazType}
                          onChange={(e) => setRikazType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                        >
                          <option value="rikaz">Rikaz (Harta Karun Temuan) - Kadar 20%</option>
                          <option value="tambang">Hasil Tambang Logam Mulia - Kadar 2.5%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nilai Taksiran Harta
                        </label>
                        <RupiahInput
                          value={rikazValuation}
                          onChange={setRikazValuation}
                          placeholder="0"
                          showTerbilang={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form 6: Investasi / Lainnya */}
                {maalAssetType === 'investasi' && (
                  <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-3">
                    <span className="text-xs font-bold text-sky-950 block">
                      Zakat Saham & Portofolio Investasi
                    </span>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Total Nilai Portofolio Bersih yang Telah Haul
                      </label>
                      <RupiahInput
                        value={maalTotalAsset}
                        onChange={setMaalTotalAsset}
                        placeholder="0"
                        showTerbilang={true}
                      />
                    </div>
                  </div>
                )}

                {/* Calculated summary banner for Maal */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-emerald-800 font-semibold block">
                      Status Fiqih Syar'i:
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        computedMaalNisabMet ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {computedMaalNisabMet ? '✓ Mencapai Nisab' : '✗ Di Bawah Nisab'}
                      </span>
                      <span className="text-xs text-slate-600">
                        Kadar: <strong>{computedRatePercent}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Kewajiban Zakat Terhitung:</span>
                    <span className="text-lg font-black text-emerald-900">
                      {maalAssetType === 'pertanian' && agriPayMode === 'beras'
                        ? formatKg(computedMaalDueRiceKg)
                        : formatRupiah(computedMaalDueRp)}
                    </span>
                  </div>
                </div>

                {/* Final nominal input (Allows custom override) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Nominal Zakat Maal yang Diserahkan (Rp)
                    </label>
                    <span className="text-[11px] text-slate-500 italic">
                      Dapat disesuaikan / dibulatkan
                    </span>
                  </div>
                  <RupiahInput
                    value={maalCustomNominal || (maalAssetType === 'pertanian' && agriPayMode === 'beras' ? 0 : computedMaalDueRp)}
                    onChange={setMaalCustomNominal}
                    placeholder="Nominal Zakat (Rp)"
                    className="border-2 border-emerald-500 font-bold text-emerald-950 text-base"
                    showTerbilang={true}
                  />
                </div>

                {/* Lafadz Ijab & Qabul Box */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-700" />
                      Lafadz Ijab Qabul Zakat Maal (Mazhab Syafi'i):
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Niat Muzakki:</span>
                    <p className="font-arabic text-sm text-slate-900 font-bold text-right pt-0.5">
                      {DOA_ZAKAT_MAAL.doaMuzakki.arabic}
                    </p>
                    <p className="text-[11px] text-slate-600 italic">"{DOA_ZAKAT_MAAL.doaMuzakki.arti}"</p>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-emerald-700 block text-[10px] uppercase font-semibold">Doa Amil Penerima:</span>
                    <p className="font-arabic text-sm text-emerald-950 font-bold text-right pt-0.5">
                      {DOA_ZAKAT_MAAL.doaAmilMendoakan.arabic}
                    </p>
                    <p className="text-[11px] text-emerald-900 italic">"{DOA_ZAKAT_MAAL.doaAmilMendoakan.arti}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* C. PROFESI */}
            {category === 'profesi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Penghasilan / Gaji Bulanan
                  </label>
                  <RupiahInput
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    placeholder="Contoh: 10.000.000"
                    showTerbilang={true}
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-800 font-medium block">
                      Kadar Zakat Profesi (2.5%)
                    </span>
                    <span className="text-lg font-bold text-emerald-900">
                      {formatRupiah(profesiCalculatedRp)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">Dipotong setiap terima penghasilan</span>
                </div>
              </div>
            )}

            {/* D. INFAQ */}
            {category === 'infaq' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Peruntukan / Alokasi Infaq
                    </label>
                    <select
                      value={infaqAllocation}
                      onChange={(e) => setInfaqAllocation(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                    >
                      <option value="operasional_masjid">Operasional Masjid & Amil</option>
                      <option value="pembangunan">Renovasi / Pembangunan Masjid</option>
                      <option value="sosial_yatim">Santunan Yatim & Dhuafa</option>
                      <option value="umum">Infaq / Sedekah Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nominal Infaq / Sedekah
                    </label>
                    <RupiahInput
                      value={infaqNominal}
                      onChange={setInfaqNominal}
                      placeholder="Contoh: 100.000"
                      className="border-2 border-emerald-500 font-bold text-emerald-950 text-base"
                      showTerbilang={true}
                    />
                  </div>
                </div>

                {/* Quick nominal buttons & increments */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">Nominal Pilihan:</span>
                    {[20000, 50000, 100000, 250000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInfaqNominal(amt)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition cursor-pointer ${
                          infaqNominal === amt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Tambah Nominal:</span>
                    {[10000, 25000, 50000, 100000].map((addAmt) => (
                      <button
                        key={addAmt}
                        type="button"
                        onClick={() => setInfaqNominal((prev) => (prev || 0) + addAmt)}
                        className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-medium border border-slate-200 cursor-pointer transition"
                      >
                        +{formatThousands(addAmt)}
                      </button>
                    ))}
                    {infaqNominal > 0 && (
                      <button
                        type="button"
                        onClick={() => setInfaqNominal(0)}
                        className="px-2 py-0.5 text-[11px] text-rose-600 hover:bg-rose-50 rounded font-medium cursor-pointer"
                      >
                        Reset (0)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* E. FIDYAH */}
            {category === 'fidyah' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Jumlah Hari Puasa Ditinggalkan
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={fidyahDays}
                        onChange={(e) => setFidyahDays(parseInt(e.target.value) || 1)}
                        className="w-24 px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 text-sm"
                      />
                      <span className="text-xs text-slate-600">Hari</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-xs text-amber-800 font-medium block">
                      Total Fidyah (Standar {formatRupiah(config.fidyahRatePerDay)}/hari)
                    </span>
                    <span className="text-lg font-bold text-amber-950">
                      {formatRupiah(fidyahCalculatedRp)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Tambahan Infaq / Sedekah Suka Rela (Kustom / Bisa Masukan Sendiri) */}
          {category !== 'infaq' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      4. Infaq / Sedekah Suka Rela Tambahan (Opsional)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Muzakki dapat menyertakan infaq seikhlasnya (nominal bebas / bisa kustom sendiri).
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={includeVoluntaryInfaq}
                    onChange={(e) => setIncludeVoluntaryInfaq(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {includeVoluntaryInfaq && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Peruntukan Infaq Sukarela:
                      </label>
                      <select
                        value={voluntaryInfaqAllocation}
                        onChange={(e) => setVoluntaryInfaqAllocation(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                      >
                        <option value="operasional_masjid">Kas Operasional Masjid &amp; Amil</option>
                        <option value="sosial_yatim">Santunan Anak Yatim &amp; Dhuafa</option>
                        <option value="pembangunan">Renovasi &amp; Pembangunan Sarana Masjid</option>
                        <option value="umum">Infaq &amp; Sedekah Umum (Kemaslahatan Umat)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Nominal Infaq Sukarela (Rp):
                        </label>
                        <span className="text-[10px] text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-rose-200">
                          Bisa Masukkan Bebas
                        </span>
                      </div>
                      <RupiahInput
                        value={voluntaryInfaqNominal}
                        onChange={setVoluntaryInfaqNominal}
                        placeholder="Contoh: 20.000"
                        className="border-2 border-rose-400 font-bold text-slate-900 text-sm"
                        showTerbilang={true}
                      />
                    </div>
                  </div>

                  {/* Preset quick buttons & chips */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium mr-1">Pilihan Cepat:</span>
                      {[10000, 20000, 50000, 100000, 250000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setVoluntaryInfaqNominal(amt)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition cursor-pointer ${
                            voluntaryInfaqNominal === amt
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-rose-50'
                          }`}
                        >
                          {formatRupiah(amt)}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Tambah Kustom:</span>
                      {[5000, 10000, 25000, 50000].map((addAmt) => (
                        <button
                          key={addAmt}
                          type="button"
                          onClick={() => setVoluntaryInfaqNominal((prev) => (prev || 0) + addAmt)}
                          className="px-2 py-0.5 text-[11px] bg-white hover:bg-rose-100 text-rose-800 rounded font-medium border border-rose-200 cursor-pointer transition"
                        >
                          +{formatThousands(addAmt)}
                        </button>
                      ))}
                      {voluntaryInfaqNominal > 0 && (
                        <button
                          type="button"
                          onClick={() => setVoluntaryInfaqNominal(0)}
                          className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-rose-600 rounded font-medium cursor-pointer"
                        >
                          Kosongkan (0)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 5: Payment method & Amil note */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                5. Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tunai')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'tunai'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Tunai (Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer_qris')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'transfer_qris'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Transfer / QRIS</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                6. Petugas Amil Penerima
              </label>
              <input
                type="text"
                value={amilName}
                onChange={(e) => setAmilName(e.target.value)}
                placeholder="Nama Petugas Amil"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Beras merk Rojo Lele / Sedekah diniatkan untuk almarhum orang tua"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Ijab Qabul Checkout */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-900 space-y-4 sm:space-y-5 sticky top-24">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold block">
                Ringkasan Transaksi
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {category === 'fitrah' ? 'Zakat Fitrah' : category.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-300">
                No. Kuitansi Berikutnya:{' '}
                <span className="font-mono text-amber-300">
                  {generateReceiptNumber(transactionsCount, config.hijriYear)}
                </span>
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Muzakki:</span>
                <span className="font-semibold text-white truncate max-w-[150px]">
                  {name || '(Belum diisi)'}
                </span>
              </div>

              {category === 'fitrah' && (
                <>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Jumlah Jiwa:</span>
                    <span className="font-semibold text-amber-300">{payerCount} Jiwa</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Bentuk & Tarif:</span>
                    <span className="font-semibold text-white text-right text-xs">
                      {fitrahUnit === 'beras' 
                        ? `Beras (${effectiveRiceKgPerSoul} Kg/jiwa)` 
                        : `${selectedTierId === 'custom' ? 'Kustom' : (currentTier?.name || 'SK Kemenag')} (${formatRupiah(effectiveMoneyPerSoul)}/jiwa)`}
                    </span>
                  </div>
                </>
              )}

              {category === 'maal' && (
                <>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Klasifikasi Maal:</span>
                    <span className="font-semibold text-amber-300 text-right capitalize">
                      {maalAssetType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Status Nisab:</span>
                    <span className={`text-xs font-bold ${computedMaalNisabMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {computedMaalNisabMet ? 'Mencapai Nisab' : 'Di Bawah Nisab'} ({computedRatePercent}%)
                    </span>
                  </div>
                  {maalAssetType === 'pertanian' && (
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Hasil Panen:</span>
                      <span className="font-semibold text-white">{formatKg(agriHarvestKg)} ({agriGrainType})</span>
                    </div>
                  )}
                  {maalAssetType === 'peternakan' && (
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Ternak:</span>
                      <span className="font-semibold text-white">{livestockCount} ekor {livestockType}</span>
                    </div>
                  )}
                </>
              )}

              {/* Rincian Zakat Pokok & Infaq Sukarela Tambahan jika aktif */}
              {includeVoluntaryInfaq && addedInfaqRp > 0 && category !== 'infaq' && (
                <>
                  <div className="flex justify-between py-1 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Zakat Pokok:</span>
                    <span className="font-semibold text-emerald-300">
                      {baseMoneyRp > 0 ? formatRupiah(baseMoneyRp) : (finalRiceKg > 0 ? `${formatKg(finalRiceKg)} Beras` : 'Rp 0')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10 text-xs">
                    <span className="text-rose-300 flex items-center gap-1 font-semibold">
                      <HeartHandshake className="w-3 h-3 text-rose-400" />
                      Infaq Sukarela:
                    </span>
                    <span className="font-bold text-rose-300">
                      +{formatRupiah(addedInfaqRp)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Metode:</span>
                <span className="font-medium text-emerald-300 capitalize">
                  {paymentMethod.replace('_', ' ')}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl p-4 mt-4">
                <span className="text-xs text-slate-300 block mb-1">Total Yang Diterima Amil:</span>
                {finalRiceKg > 0 && (
                  <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5">
                    <Wheat className="w-6 h-6" /> {formatKg(finalRiceKg)}
                  </div>
                )}
                {finalMoneyRp > 0 && (
                  <div className="text-2xl font-black text-emerald-300 flex items-center gap-1.5">
                    <Coins className="w-6 h-6" /> {formatRupiah(finalMoneyRp)}
                  </div>
                )}
                {finalRiceKg === 0 && finalMoneyRp === 0 && (
                  <div className="text-lg font-bold text-slate-400">Rp 0</div>
                )}
              </div>
            </div>

            {/* Quick Prayer Preview */}
            <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-xl p-3 text-xs">
              <span className="text-amber-300 font-semibold block text-[11px] uppercase tracking-wide">
                Lafal Doa Amil:
              </span>
              <p className="font-arabic text-base text-right text-emerald-100 my-1 leading-relaxed">
                آجَرَكَ اللهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ فِيْمَا أَبْقَيْتَ
              </p>
              <p className="text-[10px] text-slate-300 italic">
                "Semoga Allah memberikan pahala atas apa yang telah engkau berikan..."
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-150 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>Simpan & Buka Kuitansi</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Mobile Fixed Floating Action Bar for Fast Touch Entry */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-emerald-900/80 px-4 py-3 text-white shadow-2xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
              Total Diterima Amil
            </span>
            <div className="flex items-center gap-1.5 truncate">
              {finalRiceKg > 0 && (
                <span className="text-amber-400 font-black text-xs sm:text-sm">
                  {formatKg(finalRiceKg)}
                </span>
              )}
              {finalRiceKg > 0 && finalMoneyRp > 0 && <span className="text-slate-500 text-xs">+</span>}
              {finalMoneyRp > 0 && (
                <span className="text-emerald-400 font-black text-xs sm:text-sm">
                  {formatRupiah(finalMoneyRp)}
                </span>
              )}
              {finalRiceKg === 0 && finalMoneyRp === 0 && (
                <span className="text-slate-400 text-xs">Rp 0</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan &amp; Kuitansi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
