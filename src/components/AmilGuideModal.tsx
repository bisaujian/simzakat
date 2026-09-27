import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  Printer, 
  PlusCircle, 
  CheckCircle2, 
  Users, 
  PackageCheck, 
  FileText, 
  HeartHandshake, 
  Calculator, 
  Sparkles, 
  Coins, 
  Wheat, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Send,
  Download
} from 'lucide-react';
import { AppConfig } from '../types/zakat';

interface AmilGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  masjidName?: string;
}

export const AmilGuideModal: React.FC<AmilGuideModalProps> = ({
  isOpen,
  onClose,
  config,
  masjidName = 'Masjid Al-Muhajirin'
}) => {
  const [activeTab, setActiveTab] = useState<'sop' | 'kasir' | 'asnaf' | 'laporan' | 'doa'>('sop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/50 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Buku Saku Panduan Amil Zakat
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950">
                  SOP Posko {config.hijriYear}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Petunjuk Teknis Operasional Penerimaan, Ijab Qobul &amp; Penyaluran Zakat ({masjidName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Tutup panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('sop')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sop'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. SOP &amp; Alur Posko</span>
          </button>

          <button
            onClick={() => setActiveTab('kasir')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'kasir'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>2. Input Kasir &amp; Struk</span>
          </button>

          <button
            onClick={() => setActiveTab('asnaf')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'asnaf'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>3. Penyaluran 8 Asnaf</span>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'laporan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. BAST &amp; Tutup Buku</span>
          </button>

          <button
            onClick={() => setActiveTab('doa')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'doa'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>5. Teks Akad &amp; Doa Ijab</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm">

          {/* TAB 1: SOP ALUR KERJA */}
          {activeTab === 'sop' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Standard Operating Procedure (SOP) Posko Zakat Fitrah &amp; Maal
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Panduan wajib bagi seluruh relawan dan amil yang bertugas di posko masjid selama bulan Ramadhan hingga malam takbiran.
                </p>
              </div>

              {/* Visual Flow diagram */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="font-extrabold text-emerald-950 text-xs mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  DIAGRAM ALUR LAYANAN POSKO (5 TAHAP):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black mx-auto flex items-center justify-center text-[11px] mb-1.5">1</div>
                    <div className="font-bold text-slate-800">Sambut Muzakki</div>
                    <div className="text-[10px] text-slate-500 mt-1">Salam ramah &amp; tanyakan jenis zakat (beras / uang).</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black mx-auto flex items-center justify-center text-[11px] mb-1.5">2</div>
                    <div className="font-bold text-slate-800">Input Data Kasir</div>
                    <div className="text-[10px] text-slate-500 mt-1">Ketik nama muzakki, jumlah jiwa, dan hitung nominal.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black mx-auto flex items-center justify-center text-[11px] mb-1.5">3</div>
                    <div className="font-bold text-slate-800">Ijab Qobul &amp; Doa</div>
                    <div className="text-[10px] text-slate-500 mt-1">Pandu lafal niat muzakki dan amil mendoakan berkah.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black mx-auto flex items-center justify-center text-[11px] mb-1.5">4</div>
                    <div className="font-bold text-slate-800">Cetak Bukti Struk</div>
                    <div className="text-[10px] text-slate-500 mt-1">Cetak struk thermal 58/80mm atau kirim WA instan.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black mx-auto flex items-center justify-center text-[11px] mb-1.5">5</div>
                    <div className="font-bold text-slate-800">Simpan di Gudang</div>
                    <div className="text-[10px] text-slate-500 mt-1">Beras ditata rapi di karung, uang masuk brankas posko.</div>
                  </div>
                </div>
              </div>

              {/* Checklist Perlengkapan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Perlengkapan Posko yang Wajib Disiapkan:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                    <li>Laptop / HP / Tablet yang membuka aplikasi <strong>SimZakat</strong>.</li>
                    <li>Printer Thermal 58mm atau 80mm (Bluetooth / USB) + Kertas Thermal Roll.</li>
                    <li>Timbangan duduk beras &amp; literan takar beras standar zakat.</li>
                    <li>Kotak infaq / amplop / brankas kecil uang tunai kasir.</li>
                    <li>Karung cadangan &amp; tali rafia untuk packing paket mustahiq.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Larangan &amp; Hal Penting Bagi Amil:
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside">
                    <li>Dilarang mencampurkan uang zakat fitrah dengan uang kas operasional masjid.</li>
                    <li>Beras zakat fitrah yang diterima harus beras konsumsi yang layak dan bersih.</li>
                    <li>Seluruh zakat fitrah <strong>wajib tersalurkan habis</strong> sebelum Shalat Idul Fitri dimulai.</li>
                    <li>Setiap pergantian shift amil, wajib melakukan pencocokan uang tunai dan stok beras.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INPUT KASIR & STRUK */}
          {activeTab === 'kasir' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  Petunjuk Pengisian Formulir Kasir Penerimaan
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Cara menginput data muzakki, menghitung takaran zakat, serta mencetak tanda terima.
                </p>
              </div>

              {/* Visual Mockup Antarmuka Kasir */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-3 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                  <span>MOCKUP ANTARMUKA KASIR SIMZAKAT</span>
                  <span className="text-emerald-400">STATUS: SIAP TRANSAKSI</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">1. IDENTITAS MUZAKKI</span>
                    <div className="text-white font-bold">Nama: H. Bambang Sudirman</div>
                    <div className="text-slate-300 text-xs">WhatsApp: 0812-3456-7890 | RT 04 / RW 08</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">2. RINCIAN ZAKAT FITRAH</span>
                    <div className="text-amber-300 font-bold">4 Jiwa (Bapak, Ibu, 2 Anak)</div>
                    <div className="text-emerald-400 text-xs">Pilihan: Uang Tunai = Rp 180.000 (Rp 45.000/jiwa)</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Tombol Aksi:</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold">[ Buka Teks Doa Ijab ]</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold">[ Simpan &amp; Cetak Struk ]</span>
                  </div>
                </div>
              </div>

              {/* Langkah Input Step-by-Step */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm">Langkah-Langkah Saat Melayani Muzakki:</div>
                
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-emerald-300 transition">
                  <div className="font-bold text-emerald-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
                    Pilih Tipe Pembayaran Zakat Fitrah:
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Tanyakan apakah muzakki membayar dengan <strong>Beras Fisik</strong> atau <strong>Uang Tunai</strong>.
                    Jika uang tunai, aplikasi otomatis mengalikan jumlah jiwa dengan patokan harga beras (misal: 4 jiwa &times; Rp 45.000 = Rp 180.000).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-emerald-300 transition">
                  <div className="font-bold text-emerald-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">2</span>
                    Input Zakat Maal, Fidyah, atau Infaq Sekaligus (Jika Ada):
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Muzakki sering kali ingin sekalian membayar Zakat Maal (tabungan/perniagaan) atau Infaq masjid. Anda cukup mencentang kolom terkait pada formulir yang sama tanpa perlu input dua kali.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-emerald-300 transition">
                  <div className="font-bold text-emerald-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">3</span>
                    Lafalkan Ijab Qobul Bersama:
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Klik tombol kuning <strong>"Tuntun Doa Ijab Qobul"</strong> di formulir. Bacakan doa penerimaan zakat (<em>Ajarakallahu fiima a'thoita...</em>) dan mintalah muzakki mengaminkan.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-emerald-300 transition">
                  <div className="font-bold text-emerald-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">4</span>
                    Simpan &amp; Serahkan Struk:
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Tekan <strong>"Simpan Transaksi &amp; Cetak Bukti"</strong>. Muncul popup tanda terima resmi. Klik <strong>"Cetak Struk Thermal"</strong> untuk mencetak di printer kasir, atau klik <strong>"Kirim via WhatsApp"</strong> untuk mengirimkan PDF ke ponsel muzakki.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENYALURAN 8 ASNAF */}
          {activeTab === 'asnaf' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-600" />
                  Panduan Sensus &amp; Penyaluran Zakat ke 8 Asnaf
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Aturan fiqih dan langkah pembagian zakat agar tepat sasaran, adil, dan habis sebelum Shalat Id.
                </p>
              </div>

              {/* Tabel Asnaf */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-emerald-900 text-white font-bold">
                    <tr>
                      <th className="p-2.5">Golongan Asnaf</th>
                      <th className="p-2.5">Kriteria Lapangan</th>
                      <th className="p-2.5">Bentuk Penyaluran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-emerald-900">1. Fakir</td>
                      <td className="p-2.5 text-slate-600">Tidak punya penghasilan/harta, lansia sebatang kara, sakit menahun.</td>
                      <td className="p-2.5 text-slate-800 font-semibold">Prioritas Tertinggi (Beras + Santunan Uang)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-emerald-900">2. Miskin</td>
                      <td className="p-2.5 text-slate-600">Punya penghasilan tetapi tidak mencukupi kebutuhan pokok sehari-hari.</td>
                      <td className="p-2.5 text-slate-800 font-semibold">Paket Beras Zakat Fitrah + Uang Sembako</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-emerald-900">3. Amil</td>
                      <td className="p-2.5 text-slate-600">Panitia/relawan yang sah diangkat DKM untuk mengumpulkan &amp; menyalurkan.</td>
                      <td className="p-2.5 text-slate-800 font-semibold">Hak Amil (Maksimal 1/8 atau 12.5% dari perolehan)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-emerald-900">4. Muallaf</td>
                      <td className="p-2.5 text-slate-600">Orang yang baru masuk Islam dan membutuhkan penguatan ukhuwah &amp; ekonomi.</td>
                      <td className="p-2.5 text-slate-800 font-semibold">Beras + Tali Asih Uang Tunai</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-emerald-900">5. Gharimin</td>
                      <td className="p-2.5 text-slate-600">Berhutang untuk kebutuhan darurat hidup (bukan untuk maksiat/foya-foya).</td>
                      <td className="p-2.5 text-slate-800 font-semibold">Bantuan Pelunasan Hutang Pokok</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-emerald-900">6. Fisabilillah</td>
                      <td className="p-2.5 text-slate-600">Guru ngaji TPA, marbot masjid, da'i yang berjuang di jalan dakwah Allah.</td>
                      <td className="p-2.5 text-slate-800 font-semibold">Paket Sembako + Kafalah Ramadhan</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-emerald-900">7. Ibnu Sabil</td>
                      <td className="p-2.5 text-slate-600">Musafir yang kehabisan bekal di perjalanan dalam ketaatan.</td>
                      <td className="p-2.5 text-slate-800 font-semibold">Bantuan Ongkos Perjalanan Pokok</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Fitur Kupon & Distribusi */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                <div className="font-bold text-teal-950 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-teal-700" />
                  Sistem Penyaluran Terjadwal dengan Kupon / Tanda Terima:
                </div>
                <p className="text-xs text-teal-900 leading-relaxed">
                  Pada tab <strong>"Data Mustahiq"</strong>, amil dapat mendaftarkan nama warga, RT/RW, dan kategori asnafnya. 
                  Saat hari penyaluran (H-2 atau H-1 Idul Fitri), buka tab <strong>"Distribusi Zakat"</strong>, pilih mustahiq yang hadir, lalu klik <strong>"Salurkan"</strong>. Sistem akan langsung memotong stok beras gudang dan mencetak tanda terima pembagian.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: LAPORAN & TUTUP BUKU */}
          {activeTab === 'laporan' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Laporan Pertanggungjawaban (LPJ), BAST &amp; Tutup Buku
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Menjamin transparansi 100% kepada jamaah masjid dan memudahkan audit pengurus DKM.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    Cetak Berita Acara Serah Terima (BAST):
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka tab <strong>"Laporan &amp; BAST"</strong> &rarr; klik tombol <strong>"Cetak Laporan Lengkap / BAST"</strong>. Sistem akan menyusun dokumen resmi berkop masjid yang mencakup:
                  </p>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    <li>Total Muzakki dan Jiwa Zakat Fitrah (Beras &amp; Uang).</li>
                    <li>Total Perolehan Zakat Maal, Fidyah, dan Infaq.</li>
                    <li>Rincian Penyaluran per Asnaf (Kg Beras &amp; Nominal).</li>
                    <li>Sisa Kas / Beras dan Kolom Tanda Tangan Ketua DKM, Ketua Amil, dan Saksi.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Tutup Buku Tahunan (Arsip Hijriyah):
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setelah Shalat Idul Fitri selesai dan seluruh penyaluran tuntas:
                  </p>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    <li>Buka menu <strong>"Pengaturan"</strong> &rarr; pilih <strong>"Tutup Buku &amp; Arsip Tahunan"</strong>.</li>
                    <li>Sistem akan mengunci pembukuan tahun {config.hijriYear} ke brankas arsip permanen.</li>
                    <li>Data tahun lama tetap dapat dilihat kapan saja sebagai bahan perbandingan untuk Ramadhan tahun berikutnya!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOA IJAB QOBUL */}
          {activeTab === 'doa' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Kumpulan Niat Zakat &amp; Doa Penerimaan (Ijab Qobul)
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Amil dapat membaca lafal ini langsung dari layar saat membimbing muzakki di posko.
                </p>
              </div>

              {/* Doa Amil Mendoakan Muzakki */}
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-950 text-xs uppercase tracking-wide">
                    DOA AMIL KETIKA MENERIMA ZAKAT (WAJIB DIBACA AMIL):
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                    Sunnah Muakkad
                  </span>
                </div>
                <div className="text-right font-arabic text-lg sm:text-xl text-slate-900 leading-loose py-1">
                  آجَرَكَ اللهُ فِيْمَا أَعْطَيْتَ، وَبَارَكَ فِيْمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُوْرًا
                </div>
                <div className="text-xs font-semibold text-amber-900 italic">
                  "Aajarokallahu fiimaa a'thoita, wa baaraka fiimaa abqoita, wa ja'alahu laka thohuuroo."
                </div>
                <div className="text-xs text-slate-700 pt-1 border-t border-amber-200">
                  <strong>Artinya:</strong> "Semoga Allah memberikan pahala atas apa yang telah engkau berikan, melimpahkan berkah atas apa yang masih engkau simpan, dan menjadikannya pembersih dosa bagimu."
                </div>
              </div>

              {/* Niat Muzakki Diri Sendiri */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-xs">1. Niat Zakat Fitrah untuk Diri Sendiri:</span>
                <div className="text-right font-arabic text-base sm:text-lg text-slate-900 leading-relaxed">
                  نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِيْ فَرْضًا لِلّٰهِ تَعَالَى
                </div>
                <div className="text-xs text-slate-600 italic">
                  "Nawaitu an ukhrija zakaatal fithri 'an nafsii fardhan lillaahi ta'aalaa."
                </div>
              </div>

              {/* Niat Muzakki Seluruh Keluarga */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-xs">2. Niat Zakat Fitrah untuk Diri Sendiri &amp; Seluruh Keluarga:</span>
                <div className="text-right font-arabic text-base sm:text-lg text-slate-900 leading-relaxed">
                  نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنِّيْ وَعَنْ جَمِيْعِ مَا يَلْزَمُنِيْ نَفَقَاتُهُمْ شَرْعًا فَرْضًا لِلّٰهِ تَعَالَى
                </div>
                <div className="text-xs text-slate-600 italic">
                  "Nawaitu an ukhrija zakaatal fithri 'annii wa 'an jamii'i maa yalzamunii nafaqootuhum syar'an fardhan lillaahi ta'aalaa."
                </div>
              </div>

              {/* Niat Zakat Maal */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-xs">3. Niat Zakat Maal (Harta / Tabungan):</span>
                <div className="text-right font-arabic text-base sm:text-lg text-slate-900 leading-relaxed">
                  نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِيْ فَرْضًا لِلّٰهِ تَعَالَى
                </div>
                <div className="text-xs text-slate-600 italic">
                  "Nawaitu an ukhrija zakaata maalii fardhan lillaahi ta'aalaa."
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTION */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>SOP Posko Resmi SimZakat Indonesia &bull; Ramadhan {config.hijriYear}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer shadow-md"
          >
            Mengerti &amp; Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
