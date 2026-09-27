-- =============================================================================
-- SimZakat - Sistem Informasi Manajemen Zakat & Mustahiq Modern Berbasis Syariat
-- Database Schema for MySQL 8.0+ / MariaDB 10.5+
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `simzakat_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `simzakat_db`;

-- -----------------------------------------------------------------------------
-- 1. Table: masjids (Daftar Lembaga / Masjid / DKM Terdaftar)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `masjids` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Indonesia',
  `province` VARCHAR(100) DEFAULT NULL,
  `contact_phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `lead_name` VARCHAR(120) NOT NULL, -- Nama Ketua DKM / Kepala Amil
  `status` ENUM('active', 'pending_verification', 'suspended') NOT NULL DEFAULT 'active',
  `hijri_year` VARCHAR(30) NOT NULL DEFAULT '1447 H',
  `masehi_year` VARCHAR(30) NOT NULL DEFAULT '2026 M',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_masjids_status` (`status`),
  INDEX `idx_masjids_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: users (Akun Pengguna: Owner, Admin DKM, & Petugas Amil)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `masjid_id` VARCHAR(64) DEFAULT NULL, -- NULL jika Super Admin / Owner
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
CREATE TABLE IF NOT EXISTS `app_configs` (
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
-- 4. Table: muzakki_transactions (Pencatatan Penerimaan Zakat, Infaq, Fidyah)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `muzakki_transactions` (
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
CREATE TABLE IF NOT EXISTS `mustahiqs` (
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
-- 6. Table: distribution_records (Pencatatan Penyaluran Hak Zakat ke Mustahiq)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `distribution_records` (
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
-- 7. Table: activity_logs (Audit Trail Aktivitas Amil)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
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
-- 8. Table: password_resets (Pengelolaan Token Pemulihan Sandi)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_resets` (
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
-- SEED DATA AWAL (Default Pengguna & Masjid Pertama untuk Uji Coba)
-- =============================================================================

-- 1. Masjid Percontohan
INSERT INTO `masjids` (`id`, `name`, `slug`, `address`, `city`, `province`, `contact_phone`, `email`, `lead_name`, `status`, `hijri_year`, `masehi_year`) 
VALUES 
('masjid-almuhajirin', 'Masjid Raya Al-Muhajirin', 'masjid-raya-al-muhajirin', 'Jl. Barokah No. 12 Kompleks Harmoni Baru', 'Jakarta Selatan', 'DKI Jakarta', '081299887766', 'almuhajirin@simzakat.id', 'Ustadz Ahmad Fauzi, S.Pd.I', 'active', '1447 H', '2026 M'),
('masjid-arraudhah', 'Masjid Jami Ar-Raudhah', 'masjid-jami-ar-raudhah', 'Jl. Melati Raya No. 45', 'Bandung', 'Jawa Barat', '081377889900', 'arraudhah@simzakat.id', 'Drs. H. Syamsuddin', 'active', '1447 H', '2026 M')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Pengguna: Owner / Super Admin & Admin DKM
INSERT INTO `users` (`id`, `masjid_id`, `name`, `username`, `email`, `phone`, `password_hash`, `role`, `is_active`) 
VALUES 
('user-owner', NULL, 'Super Admin SimZakat', 'owner', 'owner@simzakat.id', '081100001111', 'owner123', 'owner', 1),
('user-dkm-almuhajirin', 'masjid-almuhajirin', 'Ustadz Ahmad Fauzi (Ketua DKM)', 'admin_muhajirin', 'dkm@almuhajirin.id', '081299887766', 'masjid123', 'admin_dkm', 1),
('user-amil-almuhajirin', 'masjid-almuhajirin', 'Hadi Sucipto (Amil Kasir Posko)', 'amil_hadi', 'hadi@almuhajirin.id', '081233445566', 'amil123', 'petugas_amil', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3. Konfigurasi Awal Masjid Al-Muhajirin
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
  'SK Bersama Kemenag & BAZNAS No. 1447 H / 2026 M',
  '[{"id":"tier-1","name":"Kategori I (Beras Premium: Rojolele/Mentik/Pandan Wangi)","riceType":"Pandan Wangi, Mentik Wangi, Rojolele","pricePerSoulRp":55000,"description":"Standar beras konsumsi harian keluarga kelas premium"},{"id":"tier-2","name":"Kategori II (Beras Medium Plus: Setra Ramos/IR-64 Super)","riceType":"Setra Ramos, IR 64 Premium","pricePerSoulRp":45000,"description":"Standar umum yang paling banyak dikonsumsi jamaah"},{"id":"tier-3","name":"Kategori III (Beras Standar: IR-64 Medium/Bulog Premium)","riceType":"IR 64 Medium, SPHP Premium","pricePerSoulRp":38000,"description":"Standar minimal kecukupan konsumsi masyarakat"},{"id":"tier-custom","name":"Kategori Khusus / Beras Organik Sultan","riceType":"Beras Merah Organik / Basmati / Beras Khusus","pricePerSoulRp":65000,"description":"Pilihan muzakki dengan konsumsi beras varietas khusus"}]',
  45000.00,
  1450000.00,
  18000.00,
  653.00,
  15000.00,
  2500000.00,
  14000000.00,
  30000.00
) ON DUPLICATE KEY UPDATE `organization_name`=VALUES(`organization_name`);
