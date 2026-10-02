-- =============================================================================
-- SimZakat - Sistem Informasi Manajemen Zakat & Mustahiq Modern Berbasis Syariat
-- File: simzakat_database_phpmyadmin.sql
-- Kompatibel: phpMyAdmin 4.x / 5.x+, MySQL 5.7 / 8.0+, MariaDB 10.3+
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================
--
-- PANDUAN CARA IMPORT DI PHPMYADMIN:
-- 1. Buka phpMyAdmin di cPanel / VPS / Hosting Anda.
-- 2. Buat database baru (contoh: simzakat_db atau username_simzakat) jika belum ada.
-- 3. KLIK NAMA DATABASE TERSEBUT di menu sebelah kiri.
-- 4. Klik tab "Import" (Impor) di menu atas.
-- 5. Klik "Choose File" dan pilih file: simzakat_database_phpmyadmin.sql ini.
-- 6. Klik tombol "Go" / "Kirim" di bagian bawah.
-- 7. Selesai! Seluruh tabel dan data awal resmi langsung siap digunakan.
-- =============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+07:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Matikan pengecekan foreign key sementara saat impor
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- Hapus tabel lama jika sudah ada (mencegah error tabel duplikat saat re-import)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `yearly_archives`;
DROP TABLE IF EXISTS `distribution_records`;
DROP TABLE IF EXISTS `mustahiqs`;
DROP TABLE IF EXISTS `muzakki_transactions`;
DROP TABLE IF EXISTS `app_configs`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `masjids`;

-- -----------------------------------------------------------------------------
-- 1. Table: masjids (Lembaga / Masjid / DKM Terdaftar)
-- -----------------------------------------------------------------------------
CREATE TABLE `masjids` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Indonesia',
  `province` VARCHAR(100) DEFAULT NULL,
  `contact_phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `lead_name` VARCHAR(120) NOT NULL,
  `status` ENUM('active', 'pending_verification', 'suspended') NOT NULL DEFAULT 'active',
  `hijri_year` VARCHAR(30) NOT NULL DEFAULT '1447 H',
  `masehi_year` VARCHAR(30) NOT NULL DEFAULT '2026 M',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_masjids_status` (`status`),
  INDEX `idx_masjids_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: users (Owner, Admin DKM, & Petugas Amil)
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `masjid_id` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(120) NOT NULL,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `phone` VARCHAR(30) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('owner', 'admin_dkm', 'petugas_amil') NOT NULL DEFAULT 'petugas_amil',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`masjid_id`) REFERENCES `masjids`(`id`) ON DELETE CASCADE,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_username` (`username`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: app_configs (Pengaturan Harga Beras, SK Kemenag, & Panitia Masjid)
-- -----------------------------------------------------------------------------
CREATE TABLE `app_configs` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `masjid_id` VARCHAR(64) NOT NULL UNIQUE,
  `organization_name` VARCHAR(150) NOT NULL,
  `sub_title` VARCHAR(200) NOT NULL,
  `hijri_year` VARCHAR(30) NOT NULL DEFAULT '1447 H',
  `masehi_year` VARCHAR(30) NOT NULL DEFAULT '2026 M',
  `address` TEXT NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `head_amil` VARCHAR(120) NOT NULL,
  `treasurer_name` VARCHAR(120) NOT NULL,
  `fitrah_rice_kg_per_soul` DECIMAL(6,2) NOT NULL DEFAULT 2.80,
  `fitrah_rice_options_json` JSON NOT NULL,
  `sk_kemenag_reference` VARCHAR(200) NOT NULL DEFAULT 'SK Kemenag & BAZNAS RI No. 1447 H / 2026 M',
  `sk_kemenag_tiers_json` JSON NOT NULL,
  `fitrah_money_per_soul` DECIMAL(12,2) NOT NULL DEFAULT 45000.00,
  `gold_price_per_gram` DECIMAL(12,2) NOT NULL DEFAULT 1450000.00,
  `silver_price_per_gram` DECIMAL(12,2) NOT NULL DEFAULT 18000.00,
  `grain_harvest_nisab_kg` DECIMAL(8,2) NOT NULL DEFAULT 653.00,
  `rice_price_per_kg_for_nisab` DECIMAL(12,2) NOT NULL DEFAULT 15000.00,
  `goat_price_per_head` DECIMAL(12,2) NOT NULL DEFAULT 2500000.00,
  `cow_price_per_head` DECIMAL(12,2) NOT NULL DEFAULT 14000000.00,
  `fidyah_rate_per_day` DECIMAL(12,2) NOT NULL DEFAULT 30000.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`masjid_id`) REFERENCES `masjids`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: muzakki_transactions (Transaksi Zakat Fitrah, Maal, Infaq, Fidyah)
-- -----------------------------------------------------------------------------
CREATE TABLE `muzakki_transactions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `masjid_id` VARCHAR(64) NOT NULL,
  `receipt_number` VARCHAR(60) NOT NULL,
  `timestamp_iso` VARCHAR(50) NOT NULL,
  `date_str` DATE NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT NOT NULL,
  `rt_rw` VARCHAR(40) NOT NULL,
  `category` ENUM('fitrah', 'maal', 'profesi', 'infaq', 'fidyah') NOT NULL,
  `fitrah_detail_json` JSON DEFAULT NULL,
  `maal_detail_json` JSON DEFAULT NULL,
  `profesi_detail_json` JSON DEFAULT NULL,
  `infaq_detail_json` JSON DEFAULT NULL,
  `fidyah_detail_json` JSON DEFAULT NULL,
  `voluntary_infaq_rp` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `voluntary_infaq_allocation` VARCHAR(50) DEFAULT 'umum',
  `payment_method` ENUM('tunai', 'transfer_qris') NOT NULL DEFAULT 'tunai',
  `amil_name` VARCHAR(120) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `total_money_rp` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `total_rice_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`masjid_id`) REFERENCES `masjids`(`id`) ON DELETE CASCADE,
  INDEX `idx_trans_masjid_date` (`masjid_id`, `date_str`),
  INDEX `idx_trans_receipt` (`receipt_number`),
  INDEX `idx_trans_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table: mustahiqs (Database Mustahiq & 8 Golongan Asnaf)
-- -----------------------------------------------------------------------------
CREATE TABLE `mustahiqs` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `masjid_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `nik` VARCHAR(30) DEFAULT NULL,
  `kk_number` VARCHAR(30) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `address` TEXT NOT NULL,
  `rt_rw` VARCHAR(40) NOT NULL,
  `asnaf` ENUM('fakir', 'miskin', 'amil', 'mualaf', 'riqab', 'gharimin', 'fisabilillah', 'ibnu_sabil') NOT NULL,
  `family_members_count` INT NOT NULL DEFAULT 1,
  `priority` ENUM('sangat_mendesak', 'mendesak', 'reguler') NOT NULL DEFAULT 'mendesak',
  `status` ENUM('aktif', 'diverifikasi', 'nonaktif') NOT NULL DEFAULT 'diverifikasi',
  `notes` TEXT DEFAULT NULL,
  `total_rice_received_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_money_received_rp` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `last_distributed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`masjid_id`) REFERENCES `masjids`(`id`) ON DELETE CASCADE,
  INDEX `idx_mustahiq_masjid_asnaf` (`masjid_id`, `asnaf`),
  INDEX `idx_mustahiq_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table: distribution_records (Pencatatan Penyaluran Zakat ke Mustahiq)
-- -----------------------------------------------------------------------------
CREATE TABLE `distribution_records` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `masjid_id` VARCHAR(64) NOT NULL,
  `date_str` DATE NOT NULL,
  `timestamp_iso` VARCHAR(50) NOT NULL,
  `mustahiq_id` VARCHAR(64) NOT NULL,
  `mustahiq_name` VARCHAR(150) NOT NULL,
  `asnaf` ENUM('fakir', 'miskin', 'amil', 'mualaf', 'riqab', 'gharimin', 'fisabilillah', 'ibnu_sabil') NOT NULL,
  `rt_rw` VARCHAR(40) NOT NULL,
  `rice_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `money_rp` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `package_description` VARCHAR(255) DEFAULT NULL,
  `distributor_amil` VARCHAR(120) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`masjid_id`) REFERENCES `masjids`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mustahiq_id`) REFERENCES `mustahiqs`(`id`) ON DELETE CASCADE,
  INDEX `idx_dist_masjid_date` (`masjid_id`, `date_str`),
  INDEX `idx_dist_asnaf` (`asnaf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Table: yearly_archives (Arsip Tutup Buku LPJ Tahunan Multi-Tahun)
-- -----------------------------------------------------------------------------
CREATE TABLE `yearly_archives` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `masjid_id` VARCHAR(64) NOT NULL,
  `hijri_year` VARCHAR(30) NOT NULL,
  `masehi_year` VARCHAR(30) NOT NULL,
  `closed_at` VARCHAR(50) NOT NULL,
  `closed_by` VARCHAR(120) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `total_muzakki_count` INT NOT NULL DEFAULT 0,
  `total_rice_received_kg` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_rice_distributed_kg` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `remaining_rice_kg` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_money_received_rp` DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  `total_money_distributed_rp` DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  `remaining_money_rp` DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  `total_mustahiq_count` INT NOT NULL DEFAULT 0,
  `total_distributions_count` INT NOT NULL DEFAULT 0,
  `config_snapshot_json` JSON NOT NULL,
  `transactions_backup_json` LONGTEXT DEFAULT NULL,
  `mustahiqs_backup_json` LONGTEXT DEFAULT NULL,
  `distributions_backup_json` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`masjid_id`) REFERENCES `masjids`(`id`) ON DELETE CASCADE,
  INDEX `idx_archive_masjid_year` (`masjid_id`, `hijri_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Table: activity_logs (Audit Trail Aktivitas Amil)
-- -----------------------------------------------------------------------------
CREATE TABLE `activity_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `masjid_id` VARCHAR(64) DEFAULT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `action` VARCHAR(80) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_logs_masjid` (`masjid_id`),
  INDEX `idx_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. Table: password_resets (Pengelolaan Token Pemulihan Sandi)
-- -----------------------------------------------------------------------------
CREATE TABLE `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `token_code` VARCHAR(64) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_reset_code` (`token_code`),
  INDEX `idx_reset_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA AWAL (Data Default Resmi Siap Pakai)
-- =============================================================================

-- 1. Insert Masjid Percontohan
INSERT INTO `masjids` (`id`, `name`, `slug`, `address`, `city`, `province`, `contact_phone`, `email`, `lead_name`, `status`, `hijri_year`, `masehi_year`) VALUES
('masjid-almuhajirin', 'Masjid Raya Al-Muhajirin', 'masjid-raya-al-muhajirin', 'Jl. Barokah No. 12 Kompleks Harmoni Baru, RT 03/RW 08', 'Jakarta Selatan', 'DKI Jakarta', '081299887766', 'almuhajirin@simzakat.id', 'Ustadz Ahmad Fauzi, S.Pd.I', 'active', '1447 H', '2026 M'),
('masjid-arraudhah', 'Masjid Jami Ar-Raudhah', 'masjid-jami-ar-raudhah', 'Jl. Melati Raya No. 45', 'Bandung', 'Jawa Barat', '081377889900', 'arraudhah@simzakat.id', 'Drs. H. Syamsuddin', 'active', '1447 H', '2026 M');

-- 2. Insert User Login (Password: owner123 / masjid123 / amil123)
INSERT INTO `users` (`id`, `masjid_id`, `name`, `username`, `email`, `phone`, `password_hash`, `role`, `is_active`) VALUES
('user-owner', NULL, 'Super Admin SimZakat', 'owner', 'owner@simzakat.id', '081100001111', 'owner123', 'owner', 1),
('user-dkm-almuhajirin', 'masjid-almuhajirin', 'Ustadz Ahmad Fauzi (Ketua DKM)', 'admin_muhajirin', 'dkm@almuhajirin.id', '081299887766', 'masjid123', 'admin_dkm', 1),
('user-amil-almuhajirin', 'masjid-almuhajirin', 'Hadi Sucipto (Amil Kasir Posko)', 'amil_hadi', 'hadi@almuhajirin.id', '081233445566', 'amil123', 'petugas_amil', 1);

-- 3. Insert Pengaturan Lengkap Masjid Al-Muhajirin
INSERT INTO `app_configs` (
  `id`, `masjid_id`, `organization_name`, `sub_title`, `hijri_year`, `masehi_year`, 
  `address`, `phone`, `head_amil`, `treasurer_name`, 
  `fitrah_rice_kg_per_soul`, `fitrah_rice_options_json`, 
  `sk_kemenag_reference`, `sk_kemenag_tiers_json`, 
  `fitrah_money_per_soul`, `gold_price_per_gram`, `silver_price_per_gram`, 
  `grain_harvest_nisab_kg`, `rice_price_per_kg_for_nisab`, 
  `goat_price_per_head`, `cow_price_per_head`, `fidyah_rate_per_day`
) VALUES (
  'cfg-almuhajirin',
  'masjid-almuhajirin',
  'Panitia ZISWAF Masjid Raya Al-Muhajirin',
  'Badan Pengelola Amil Zakat, Infaq, Shadaqah & Wakaf Lingkungan RW 08',
  '1447 H',
  '2026 M',
  'Jl. Barokah No. 12 Kompleks Harmoni Baru, RT 03/RW 08, Kel. Kebayoran Lama, Jakarta Selatan',
  '0812-9988-7766',
  'Ustadz Ahmad Fauzi, S.Pd.I',
  'H. Rahmat Hidayat, SE',
  2.80,
  '[2.5, 2.7, 2.8, 3.0, 3.5]',
  'SK Bersama Kemenag & BAZNAS RI No. 1447 H / 2026 M',
  '[{"id":"tier-1","name":"Kategori I (Beras Premium: Rojolele/Mentik/Pandan Wangi)","riceType":"Pandan Wangi, Mentik Wangi, Rojolele","pricePerSoulRp":55000,"description":"Standar beras konsumsi harian keluarga kelas premium"},{"id":"tier-2","name":"Kategori II (Beras Medium Plus: Setra Ramos/IR-64 Super)","riceType":"Setra Ramos, IR 64 Premium","pricePerSoulRp":45000,"description":"Standar umum yang paling banyak dikonsumsi jamaah"},{"id":"tier-3","name":"Kategori III (Beras Standar: IR-64 Medium/Bulog Premium)","riceType":"IR 64 Medium, SPHP Premium","pricePerSoulRp":38000,"description":"Standar minimal kecukupan konsumsi masyarakat"},{"id":"tier-custom","name":"Kategori Khusus / Beras Organik Sultan","riceType":"Beras Merah Organik / Basmati / Beras Khusus","pricePerSoulRp":65000,"description":"Pilihan muzakki dengan konsumsi beras varietas khusus"}]',
  45000.00,
  1450000.00,
  18000.00,
  653.00,
  15000.00,
  2500000.00,
  14000000.00,
  30000.00
);

-- 4. Insert Data Mustahiq Awal (8 Asnaf)
INSERT INTO `mustahiqs` (`id`, `masjid_id`, `name`, `nik`, `kk_number`, `phone`, `address`, `rt_rw`, `asnaf`, `family_members_count`, `priority`, `status`, `notes`, `total_rice_received_kg`, `total_money_received_rp`) VALUES
('mst-1', 'masjid-almuhajirin', 'Mbah Sutini', '3174019901500001', '3174019901500000', '081233445501', 'Gang Musholla No. 4B', 'RT 01 / RW 08', 'fakir', 1, 'sangat_mendesak', 'aktif', 'Lansia sebatang kara, tidak memiliki mata pencaharian tetap.', 5.00, 200000.00),
('mst-2', 'masjid-almuhajirin', 'Pak Joko Santoso', '3174018805720002', '3174018805720000', '081233445502', 'Jl. Melati II No. 15', 'RT 02 / RW 08', 'miskin', 4, 'sangat_mendesak', 'aktif', 'Buruh harian lepas, menanggung 3 orang anak sekolah.', 10.00, 300000.00),
('mst-3', 'masjid-almuhajirin', 'Ibu Aminah', '3174017709800003', '3174017709800000', '081233445503', 'Gang Sawo No. 8', 'RT 03 / RW 08', 'gharimin', 3, 'mendesak', 'aktif', 'Janda terlilit utang biaya pengobatan alm. suami di RS.', 5.00, 500000.00),
('mst-4', 'masjid-almuhajirin', 'Ustadz Danu Setiawan', '3174018503850004', '3174018503850000', '081233445504', 'Kompleks Masjid Blok D', 'RT 03 / RW 08', 'fisabilillah', 3, 'reguler', 'aktif', 'Guru ngaji TPQ anak-anak masjid & marbot.', 10.00, 400000.00);

-- 5. Insert Contoh Transaksi Muzakki Pertama (dengan Infaq Suka Rela)
INSERT INTO `muzakki_transactions` (
  `id`, `masjid_id`, `receipt_number`, `timestamp_iso`, `date_str`, 
  `name`, `phone`, `address`, `rt_rw`, `category`, 
  `fitrah_detail_json`, `voluntary_infaq_rp`, `voluntary_infaq_allocation`, 
  `payment_method`, `amil_name`, `notes`, `total_money_rp`, `total_rice_kg`
) VALUES
(
  'tx-sample-01',
  'masjid-almuhajirin',
  'ZK-1447-0001',
  '2026-03-20T10:15:00.000Z',
  '2026-03-20',
  'H. Hendra Gunawan',
  '081299881122',
  'Jl. Flamboyan No. 10',
  'RT 01 / RW 08',
  'fitrah',
  '{"unit":"uang","payerCount":4,"ratePerPerson":45000,"familyMembers":["H. Hendra","Hj. Ratna","Ahmad Zaki","Aisyah Putri"],"skKemenagTierName":"Kategori II (Beras Medium Plus)"}',
  50000.00,
  'operasional_masjid',
  'tunai',
  'Hadi Sucipto',
  'Titipan doa berkah untuk sekeluarga',
  230000.00,
  0.00
),
(
  'tx-sample-02',
  'masjid-almuhajirin',
  'ZK-1447-0002',
  '2026-03-20T11:00:00.000Z',
  '2026-03-20',
  'Ibu Hj. Suryani',
  '081388776655',
  'Jl. Mawar No. 3',
  'RT 02 / RW 08',
  'fitrah',
  '{"unit":"beras","payerCount":2,"riceWeightPerSoulKg":2.8,"familyMembers":["Hj. Suryani","Fajar Siddiq"]}',
  20000.00,
  'sosial_yatim',
  'tunai',
  'Hadi Sucipto',
  'Beras Pandan Wangi super',
  20000.00,
  5.60
);

-- 6. Insert Contoh Penyaluran Pertama
INSERT INTO `distribution_records` (
  `id`, `masjid_id`, `date_str`, `timestamp_iso`, `mustahiq_id`, `mustahiq_name`, 
  `asnaf`, `rt_rw`, `rice_kg`, `money_rp`, `package_description`, `distributor_amil`, `notes`
) VALUES
(
  'dist-sample-01',
  'masjid-almuhajirin',
  '2026-03-21',
  '2026-03-21T09:00:00.000Z',
  'mst-1',
  'Mbah Sutini',
  'fakir',
  'RT 01 / RW 08',
  5.00,
  200000.00,
  'Paket Sembako Beras 5 Kg + Santunan Uang Tunai Rp 200.000',
  'Hadi Sucipto',
  'Diserahkan langsung ke kediaman mustahiq'
);

-- Kembalikan pengecekan foreign key
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- =============================================================================
-- SELESAI: Database SimZakat telah berhasil di-import ke phpMyAdmin!
-- Akun Login Bawaan:
-- - Owner / Super Admin : username: owner            | password: owner123
-- - Admin DKM           : username: admin_muhajirin  | password: masjid123
-- - Petugas Amil Kasir  : username: amil_hadi        | password: amil123
-- =============================================================================
