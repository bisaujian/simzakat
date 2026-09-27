import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Check, 
  Wheat, 
  Coins, 
  Calendar, 
  User, 
  MapPin, 
  Download, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Receipt, 
  FileCheck,
  Scissors,
  Layers,
  Sparkles
} from 'lucide-react';
import { AppConfig, MuzakkiTransaction } from '../types/zakat';
import { formatDateIndo, formatDateTimeIndo, formatKg, formatRupiah, DOA_COLLECTION } from '../utils/helpers';
import { printElementById, exportToPdf, openPrintTab, downloadHtmlFile } from '../utils/printService';

interface ReceiptModalProps {
  transaction: MuzakkiTransaction | null;
  config: AppConfig;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  config,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  // Format state: 'compact' (Hemat Kertas 1/2 A4 / A5), 'thermal' (Roll POS), 'standard' (A4 Penuh)
  const [receiptFormat, setReceiptFormat] = useState<'compact' | 'thermal' | 'standard'>('compact');
  // Sub-option for compact: 'double' (2 rangkap dlm 1 lembar A4 dgn garis potong) or 'single' (1 slip 1/2 A4)
  const [compactMode, setCompactMode] = useState<'double' | 'single'>('double');
  
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!transaction) return null;

  const docTitle = `Kuitansi-Zakat-${transaction.receiptNumber}`;

  const printOptions = {
    isThermal: receiptFormat === 'thermal',
    isCompact: receiptFormat === 'compact',
  };

  const handlePrint = () => {
    setStatusNotice('Membuka dialog cetak...');
    printElementById('printable-receipt', docTitle);
  };

  const handleOpenTab = () => {
    setStatusNotice('Membuka halaman cetak di tab baru...');
    openPrintTab('printable-receipt', docTitle, printOptions);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setStatusNotice('Sedang mengonversi kuitansi ke format PDF...');
    try {
      const success = await exportToPdf('printable-receipt', `${docTitle}.pdf`, printOptions);
      if (success) {
        setStatusNotice('PDF Kuitansi berhasil diunduh ke perangkat Anda!');
      } else {
        setStatusNotice('Gagal membuat PDF otomatis, silakan gunakan tombol Unduh File Cetak.');
      }
    } catch (e) {
      console.error('PDF error', e);
      setStatusNotice('Terjadi kendala saat export PDF, silakan gunakan tombol Buka Tab Cetak.');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  const handleDownload = () => {
    downloadHtmlFile(
      'printable-receipt',
      docTitle,
      `Kuitansi Zakat ${transaction.receiptNumber} - ${transaction.name}`,
      printOptions
    );
    setDownloaded(true);
    setStatusNotice('Berkas HTML kuitansi siap cetak berhasil diunduh!');
    setTimeout(() => {
      setDownloaded(false);
      setStatusNotice(null), 4000;
    });
  };

  const handleCopyWhatsApp = () => {
    const isFitrah = transaction.category === 'fitrah';
    let detailText = '';

    if (isFitrah) {
      const isKombinasi = transaction.fitrahDetail?.unit === 'kombinasi';
      const isBeras = transaction.fitrahDetail?.unit === 'beras';
      if (isKombinasi) {
        detailText = `• Zakat Fitrah (${transaction.fitrahDetail?.payerCount} Jiwa Kombinasi):\n` +
          `  - Beras: ${transaction.fitrahDetail?.ricePayerCount} Jiwa (${formatKg(transaction.totalRiceKg)})\n` +
          `  - Uang Tunai: ${transaction.fitrahDetail?.moneyPayerCount} Jiwa (${formatRupiah(transaction.totalMoneyRp)})`;
      } else if (isBeras) {
        detailText = `• Zakat Fitrah: ${transaction.fitrahDetail?.payerCount} Jiwa\n• Bentuk: Beras Konsumsi (${formatKg(transaction.totalRiceKg)})`;
      } else {
        detailText = `• Zakat Fitrah: ${transaction.fitrahDetail?.payerCount} Jiwa\n• Bentuk: Uang Tunai (${formatRupiah(transaction.totalMoneyRp)})\n• Kategori: ${transaction.fitrahDetail?.skKemenagTierName || 'SK Kemenag'}`;
      }

      if (transaction.fitrahDetail?.familyMembers && transaction.fitrahDetail.familyMembers.length > 0) {
        detailText += `\n• Nama Jiwa: ${transaction.fitrahDetail.familyMembers.join(', ')}`;
      }
    } else {
      detailText = `• Zakat Maal: ${formatRupiah(transaction.totalMoneyRp)} (${transaction.notes || 'Harta / Penghasilan'})`;
    }

    const text = `*BUKTI PEMBAYARAN ZAKAT RESMI*
*${config.organizationName}*
_${config.address} • Telp: ${config.phone}_
---------------------------------------------
*No. Kuitansi:* ${transaction.receiptNumber}
*Tanggal:* ${formatDateIndo(transaction.timestamp)}
*Nama Muzakki:* ${transaction.name}
*Alamat/RT:* ${transaction.address} (${transaction.rtRw})

*RINCIAN:*
${detailText}
*Metode Bayar:* ${transaction.paymentMethod === 'tunai' ? 'Tunai (Cash)' : 'Transfer / QRIS'}
*Amil Penerima:* ${transaction.amilName}
---------------------------------------------
*DOA AMIL:*
_${DOA_COLLECTION.doaAmil.arabic}_
"${DOA_COLLECTION.doaAmil.arti}"

Jazakumullahu khairan katsiran. Semoga zakat yang ditunaikan membawa berkah dan mensucikan jiwa serta harta bapak/ibu sekalian. Aamiin.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Helper component: Ringkasan detail zakat untuk format slip ringkas
  const renderZakatItemRow = () => {
    if (transaction.category === 'fitrah') {
      const isKombinasi = transaction.fitrahDetail?.unit === 'kombinasi';
      const isBeras = transaction.fitrahDetail?.unit === 'beras';
      return (
        <div className="text-xs space-y-1">
          <div className="flex justify-between items-start font-semibold text-slate-800">
            <span>
              Zakat Fitrah ({transaction.fitrahDetail?.payerCount} Jiwa)
              {isKombinasi && <span className="text-[10px] text-teal-700 ml-1.5 font-bold">[Beras & Uang]</span>}
              {isBeras && <span className="text-[10px] text-amber-700 ml-1.5 font-bold">[Beras]</span>}
              {!isBeras && !isKombinasi && <span className="text-[10px] text-emerald-700 ml-1.5 font-bold">[Uang Tunai]</span>}
            </span>
            <div className="text-right">
              {transaction.totalRiceKg > 0 && <span className="text-amber-800 font-bold block">{formatKg(transaction.totalRiceKg)}</span>}
              {transaction.totalMoneyRp > 0 && <span className="text-emerald-800 font-bold block">{formatRupiah(transaction.totalMoneyRp)}</span>}
            </div>
          </div>
          {transaction.fitrahDetail?.familyMembers && transaction.fitrahDetail.familyMembers.length > 0 && (
            <div className="text-[10px] text-slate-500 italic truncate max-w-xl">
              Jiwa: {transaction.fitrahDetail.familyMembers.join(', ')}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="text-xs flex justify-between items-start font-semibold text-slate-800">
        <div>
          <span>Zakat Maal / Harta</span>
          {transaction.notes && <span className="text-[10px] text-slate-500 block font-normal">{transaction.notes}</span>}
        </div>
        <span className="text-emerald-800 font-bold text-sm">{formatRupiah(transaction.totalMoneyRp)}</span>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // SLIP 1 & 2 FOR COMPACT MODE (HEMAT KERTAS)
  // ---------------------------------------------------------------------------
  const renderCompactSlip = (copyLabel: string, showDivider: boolean = false) => (
    <div key={copyLabel} className={`bg-white ${showDivider ? 'pt-4 border-t-2 border-dashed border-slate-400 mt-4 relative' : ''}`}>
      {showDivider && (
        <div className="no-print absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Scissors className="w-3 h-3 text-amber-700" />
          <span>Garis Potong Kertas (1 Lembar A4 Dibagi 2)</span>
        </div>
      )}

      <div className="border border-slate-300 rounded-xl p-3.5 sm:p-4 text-slate-800 space-y-2.5">
        {/* Header Kop Mini */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-tight">
                {config.organizationName}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-wider border border-emerald-300">
                {copyLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {config.address} • Telp: {config.phone}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">No. Kuitansi</span>
            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-800">{transaction.receiptNumber}</span>
          </div>
        </div>

        {/* Row Muzakki & Tanggal */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
          <div>
            <span className="text-[10px] text-slate-500 block">Telah Diterima Dari:</span>
            <span className="font-bold text-slate-900 text-sm">{transaction.name}</span>
            <span className="text-[11px] text-slate-600 block">{transaction.address} ({transaction.rtRw})</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Waktu Transaksi:</span>
            <span className="font-medium text-slate-800 text-[11px] block">{formatDateTimeIndo(transaction.timestamp)}</span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              Metode: {transaction.paymentMethod === 'tunai' ? 'Tunai' : 'Transfer/QRIS'} (Lunas)
            </span>
          </div>
        </div>

        {/* Detail Pembayaran */}
        <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Peruntukan ZISWAF</span>
            <span>Jumlah / Nominal</span>
          </div>
          {renderZakatItemRow()}
        </div>

        {/* Doa Amil Singkat 1 Baris */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg px-3 py-1.5 text-center">
          <p className="font-arabic text-sm text-emerald-950 font-bold leading-normal">
            {DOA_COLLECTION.doaAmil.arabic}
          </p>
          <p className="text-[10px] text-emerald-800 italic mt-0.5">
            "{DOA_COLLECTION.doaAmil.arti}"
          </p>
        </div>

        {/* Tanda Tangan Ringkas Sejajar */}
        <div className="grid grid-cols-2 gap-4 pt-1 text-[11px] text-center border-t border-slate-100">
          <div>
            <span className="text-slate-400 block mb-5">Muzakki,</span>
            <span className="font-bold text-slate-800 underline uppercase">{transaction.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-5">Petugas Amil,</span>
            <span className="font-bold text-slate-800 underline uppercase">{transaction.amilName}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // THERMAL POS RECEIPT FORMAT (58mm / 80mm)
  // ---------------------------------------------------------------------------
  const renderThermalReceipt = () => (
    <div className="w-[300px] mx-auto bg-white p-3 font-mono text-[11px] text-slate-900 border border-slate-300 rounded-lg shadow-xs">
      {/* Header Struk */}
      <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
        <div className="font-bold text-xs uppercase tracking-tight">{config.organizationName}</div>
        <div className="text-[10px] text-slate-600">{config.address}</div>
        <div className="text-[10px] text-slate-600">Telp: {config.phone}</div>
        <div className="font-bold text-[10px] mt-1">*** BUKTI TERIMA ZAKAT ***</div>
      </div>

      {/* Metadata Struk */}
      <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span>NO:</span>
          <span className="font-bold">{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>WAKTU:</span>
          <span>{formatDateTimeIndo(transaction.timestamp)}</span>
        </div>
        <div className="flex justify-between">
          <span>MUZAKKI:</span>
          <span className="font-bold truncate max-w-[170px] text-right">{transaction.name}</span>
        </div>
        <div className="flex justify-between">
          <span>RT/RW:</span>
          <span>{transaction.rtRw}</span>
        </div>
      </div>

      {/* Rincian Posko */}
      <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5">
        {transaction.category === 'fitrah' ? (
          <>
            <div className="flex justify-between font-bold">
              <span>ZAKAT FITRAH</span>
              <span>{transaction.fitrahDetail?.payerCount} JIWA</span>
            </div>
            {transaction.totalRiceKg > 0 && (
              <div className="flex justify-between text-[10px]">
                <span>BERAS KONSUMSI:</span>
                <span className="font-bold">{formatKg(transaction.totalRiceKg)}</span>
              </div>
            )}
            {transaction.totalMoneyRp > 0 && (
              <div className="flex justify-between text-[10px]">
                <span>UANG TUNAI:</span>
                <span className="font-bold">{formatRupiah(transaction.totalMoneyRp)}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-between font-bold">
            <span>ZAKAT MAAL:</span>
            <span>{formatRupiah(transaction.totalMoneyRp)}</span>
          </div>
        )}
        <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
          <span>METODE:</span>
          <span className="uppercase">{transaction.paymentMethod}</span>
        </div>
      </div>

      {/* Doa Ringkas Thermal */}
      <div className="py-2 border-b border-dashed border-slate-400 text-center space-y-0.5">
        <div className="text-[10px] font-bold">DOA AMIL:</div>
        <div className="text-[9px] italic leading-tight">
          "Semoga Allah memberi pahala atas apa yang engkau berikan, menjadikannya pembersih bagimu, dan memberkahi sisa hartamu."
        </div>
      </div>

      {/* Footer Struk */}
      <div className="pt-2 text-center text-[10px] space-y-1">
        <div>Amil: {transaction.amilName}</div>
        <div className="text-[9px] text-slate-500">Simpan struk ini sebagai bukti pembayaran sah. Jazakumullahu Khairan.</div>
        <div className="text-[8px] text-slate-400 mt-1">*** SIMZAKAT POS DIGITAL ***</div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // STANDARD FORMAL A4 FULL PAGE RECEIPT
  // ---------------------------------------------------------------------------
  const renderStandardFormalReceipt = () => (
    <div className="p-6 sm:p-8 bg-white text-slate-800 space-y-4">
      {/* Top header border ornament */}
      <div className="text-center pb-4 border-b-2 border-dashed border-emerald-700/40">
        <div className="font-arabic text-xl sm:text-2xl text-emerald-800 font-bold mb-1">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
          {config.organizationName}
        </h2>
        <p className="text-xs text-slate-600">{config.address} • Telp: {config.phone}</p>
        <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
          Tanda Terima Zakat / Infaq / Sedekah • {config.hijriYear}
        </div>
      </div>

      {/* Receipt Info metadata */}
      <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-200">
        <div>
          <span className="text-slate-500 block">No. Kuitansi:</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{transaction.receiptNumber}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block">Tanggal & Waktu:</span>
          <span className="font-semibold text-slate-800">{formatDateTimeIndo(transaction.timestamp)}</span>
        </div>
      </div>

      {/* Muzakki Details */}
      <div className="py-3 space-y-2 border-b border-slate-200 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500 font-medium text-xs">Telah Diterima Dari:</span>
          <span className="col-span-2 font-bold text-slate-900">{transaction.name}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500 font-medium text-xs">No. Telepon / WA:</span>
          <span className="col-span-2 text-slate-700 text-xs">{transaction.phone || '-'}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500 font-medium text-xs">Alamat & RT/RW:</span>
          <span className="col-span-2 text-slate-700 text-xs">{transaction.address} ({transaction.rtRw})</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="py-3 border-b border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Peruntukan Zakat</span>
          <span>Jumlah / Nominal</span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-sm">
                {transaction.category === 'fitrah' ? 'Zakat Fitrah' : `Zakat ${transaction.category}`}
              </h4>
              {transaction.category === 'fitrah' && (
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  <div>
                    <span>Bentuk: <strong>{transaction.fitrahDetail?.unit === 'kombinasi' ? 'Kombinasi (Beras & Uang)' : (transaction.fitrahDetail?.unit === 'beras' ? 'Beras Konsumsi' : 'Uang Tunai')}</strong></span>
                    <span className="mx-2">•</span>
                    <span>Sebanyak: <strong>{transaction.fitrahDetail?.payerCount} Jiwa</strong></span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              {transaction.totalRiceKg > 0 && (
                <div className="text-lg font-black text-amber-700">{formatKg(transaction.totalRiceKg)}</div>
              )}
              {transaction.totalMoneyRp > 0 && (
                <div className="text-lg font-black text-emerald-800">{formatRupiah(transaction.totalMoneyRp)}</div>
              )}
            </div>
          </div>

          {transaction.category === 'fitrah' && transaction.fitrahDetail?.familyMembers && transaction.fitrahDetail.familyMembers.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Daftar Nama Jiwa yang Diniatkan:</span>
              <div className="flex flex-wrap gap-1">
                {transaction.fitrahDetail.familyMembers.map((fam, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-700">
                    {idx + 1}. {fam}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-slate-600 px-1">
          <span>Metode Pembayaran: <strong className="capitalize">{transaction.paymentMethod}</strong></span>
          <span>Status: <strong className="text-emerald-700">Lunas / Diterima Sah</strong></span>
        </div>
      </div>

      {/* Doa Amil Section */}
      <div className="my-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-center">
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-1">Doa Amil untuk Muzakki</span>
        <p className="font-arabic text-lg sm:text-xl text-emerald-950 font-bold leading-relaxed mb-1">
          {DOA_COLLECTION.doaAmil.arabic}
        </p>
        <p className="text-xs text-emerald-900 italic font-medium">"{DOA_COLLECTION.doaAmil.arti}"</p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-6 pt-2 text-xs">
        <div className="text-center">
          <p className="text-slate-500 mb-10">Muzakki,</p>
          <p className="font-bold text-slate-800 underline uppercase">{transaction.name}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 mb-10">Petugas Amil Penerima,</p>
          <p className="font-bold text-slate-800 underline uppercase">{transaction.amilName}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Panitia UPZ Masjid</p>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400">
        Bukti pembayaran zakat sah & resmi diterbitkan oleh sistem digital {config.organizationName}.
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Top bar controls */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <span className="font-bold text-sm tracking-tight">Kuitansi Zakat Digital</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                copied ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Salin teks kuitansi untuk dikirim via WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Kirim WA'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Unduh berkas PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Cetak langsung ke printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kuitansi</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition ml-1 cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Format Switcher Banner (Hemat Kertas vs Thermal vs Formal) */}
        <div className="no-print bg-slate-800/90 border-b border-slate-700 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span>Pilihan Tampilan Cetak:</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {/* Format 1: Hemat Kertas 1/2 A4 / Slip */}
            <button
              type="button"
              onClick={() => setReceiptFormat('compact')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                receiptFormat === 'compact'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Kwitansi ringkas yang sangat hemat kertas, hanya butuh separuh halaman A4"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Ringkas (Hemat Kertas 1/2 A4)</span>
            </button>

            {/* Format 2: Struk POS Thermal */}
            <button
              type="button"
              onClick={() => setReceiptFormat('thermal')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                receiptFormat === 'thermal'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Format struk kasir roll mini printer 58mm/80mm"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Struk Thermal (58/80mm)</span>
            </button>

            {/* Format 3: Standar Dokumen A4 Penuh */}
            <button
              type="button"
              onClick={() => setReceiptFormat('standard')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                receiptFormat === 'standard'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Dokumen sertifikat kuitansi formal lembar A4 utuh"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dokumen A4 Penuh</span>
            </button>
          </div>
        </div>

        {/* Sub-selector when 'compact' is chosen: Double Copy (2 Rangkap dlm 1 Lembar) vs Single Slip */}
        {receiptFormat === 'compact' && (
          <div className="no-print bg-emerald-950/40 border-b border-emerald-900/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Mode Hemat Kertas Aktif:</strong> Hasil cetak ringkas dan tidak membuang kertas kosong.
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/60 p-0.5 rounded-lg border border-emerald-700/50">
              <button
                type="button"
                onClick={() => setCompactMode('double')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  compactMode === 'double' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'
                }`}
                title="1 Lembar A4 langsung berisi 2 lembar kuitansi (Muzakki & Arsip DKM) dengan garis potong"
              >
                <Layers className="w-3 h-3" />
                <span>2 Rangkap (1 Kertas A4 Jadi 2)</span>
              </button>

              <button
                type="button"
                onClick={() => setCompactMode('single')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  compactMode === 'single' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'
                }`}
                title="Cetak 1 slip saja untuk kertas ukuran 1/2 A4 atau A5"
              >
                <span>1 Slip Saja (A5 / 1/2 A4)</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Status Notice if triggered */}
        {statusNotice && (
          <div className="no-print bg-emerald-900 text-emerald-100 text-xs px-4 py-2 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenTab}
                className="underline hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Halaman Cetak</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setStatusNotice(null)}
                className="text-emerald-300 hover:text-white ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Printable Receipt Paper Container */}
        <div 
          className="p-4 sm:p-6 overflow-y-auto bg-slate-100/70 flex-1" 
          id="printable-receipt"
        >
          {receiptFormat === 'compact' && (
            <div className="space-y-4 max-w-xl mx-auto">
              {renderCompactSlip('LEMBAR UNTUK MUZAKKI', false)}
              {compactMode === 'double' && renderCompactSlip('LEMBAR ARSIP DKM / PANITIA ZAKAT', true)}
            </div>
          )}

          {receiptFormat === 'thermal' && (
            <div className="py-2">
              {renderThermalReceipt()}
            </div>
          )}

          {receiptFormat === 'standard' && (
            <div className="max-w-xl mx-auto rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              {renderStandardFormalReceipt()}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-xs text-slate-500">
            {receiptFormat === 'compact' && compactMode === 'double' && (
              <span>Tip: Potong lembar A4 pada garis putus-putus setelah dicetak untuk membagi lembar Muzakki dan DKM.</span>
            )}
            {receiptFormat === 'compact' && compactMode === 'single' && (
              <span>Tip: Sangat pas untuk dicetak pada kertas A5 atau kertas potong separuh A4.</span>
            )}
            {receiptFormat === 'thermal' && (
              <span>Tip: Hubungkan printer thermal USB/Bluetooth posko pada PC kasir.</span>
            )}
            {receiptFormat === 'standard' && (
              <span>Tip: Cocok untuk muzakki korporat atau instansi yang memerlukan dokumen formal.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenTab}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Buka dokumen di tab baru tanpa batasan iframe"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tab Cetak</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
