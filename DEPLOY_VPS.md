# Panduan Lengkap Deployment SimZakat di VPS (Ubuntu + MySQL + Nginx + PM2)

Panduan ini dirancang agar aplikasi **SimZakat** dapat langsung dijalankan di server VPS (seperti DigitalOcean, Linode, AWS EC2, IDCloudHost, Biznet Gio, Rumahweb, dll).

---

## 1. Persiapan Server VPS (Ubuntu 22.04 / 24.04 LTS)

Login ke VPS Anda via SSH:
```bash
ssh root@IP_ADDRESS_VPS_ANDA
```

Update repositori paket server:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx build-essential
```

---

## 2. Instalasi Node.js 20 LTS & PM2

Instal Node.js versi 20 LTS menggunakan NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi versi
node -v # minimal v20.x
npm -v

# Instal PM2 (Process Manager agar server selalu aktif)
sudo npm install -g pm2
```

---

## 3. Instalasi & Setup Database MySQL 8.0

Instal server MySQL:
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Amankan instalasi MySQL:
```bash
sudo mysql_secure_installation
```

Masuk ke MySQL shell:
```bash
sudo mysql -u root -p
```

Jalankan perintah SQL berikut di MySQL shell:
```sql
-- Buat database
CREATE DATABASE simzakat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus aplikasi zakat
CREATE USER 'simzakat_user'@'localhost' IDENTIFIED BY 'PasswordAmanZakat2026!';

-- Berikan hak akses penuh ke database simzakat_db
GRANT ALL PRIVILEGES ON simzakat_db.* TO 'simzakat_user'@'localhost';
FLUSH PRIVILEGES;

-- Keluar
EXIT;
```

---

## 4. Clone Repositori & Import Database

Masuk ke folder web root:
```bash
cd /var/www
git clone <URL_REPOSITORY_ANDA> simzakat
cd simzakat
```

### Import Skema Tabel & Data Awal MySQL:
```bash
mysql -u simzakat_user -p simzakat_db < schema.sql
# Masukkan password: PasswordAmanZakat2026!
```

---

## 5. Konfigurasi Environment (.env) & Build

Salin template konfigurasi:
```bash
cp .env.example .env
nano .env
```

Sesuaikan isi berkas `.env`:
```env
PORT=3000
NODE_ENV=production

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=simzakat_user
MYSQL_PASSWORD=PasswordAmanZakat2026!
MYSQL_DATABASE=simzakat_db

APP_URL=https://zakat.masjidanda.com
JWT_SECRET=rahasia_kunci_keamanan_simzakat_2026_super_aman

# INTEGRASI WHATSAPP GATEWAY (PENGIRIMAN OTP & NOTIFIKASI OTOMATIS)
WA_GATEWAY_PROVIDER=fonnte
WA_GATEWAY_TOKEN=masukkan_token_fonnte_anda
WA_GATEWAY_ENDPOINT=https://api.fonnte.com/send
WA_SENDER_NAME=SimZakat Official
```
*Simpan dengan `Ctrl + O`, tekan `Enter`, lalu keluar dengan `Ctrl + X`.*

### Instal Dependensi & Build:
```bash
npm install
npm run build
```

---

## 6. Menjalankan Aplikasi dengan PM2

Jalankan server aplikasi di latar belakang:
```bash
pm2 start server.ts --name "simzakat-app" --interpreter ./node_modules/.bin/tsx
```

Konfigurasi agar aplikasi otomatis menyala kembali saat server VPS reboot:
```bash
pm2 save
pm2 startup
# Salin dan jalankan baris perintah yang ditampilkan oleh pm2 startup
```

Untuk memantau log aplikasi:
```bash
pm2 status
pm2 logs simzakat-app
```

---

## 7. Konfigurasi Web Server Nginx (Domain & Reverse Proxy)

Buat file konfigurasi Nginx untuk domain masjid Anda:
```bash
sudo nano /etc/nginx/sites-available/simzakat
```

Isi dengan konfigurasi berikut (ganti `zakat.masjidanda.com` dengan domain Anda):
```nginx
server {
    listen 80;
    server_name zakat.masjidanda.com;

    # Meningkatkan limit upload dan timeout
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/simzakat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Pasang Sertifikat SSL Gratis (HTTPS) via Certbot

Instal Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Dapatkan sertifikat SSL otomatis:
```bash
sudo certbot --nginx -d zakat.masjidanda.com
```

Certbot akan otomatis memperbarui sertifikat SSL sebelum masa berlakunya habis.

---

## 9. Backup Database Otomatis Harian (Cron Job)

Buat skrip backup otomatis:
```bash
sudo mkdir -p /var/backups/simzakat
sudo nano /root/backup_zakat.sh
```

Isi dengan:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u simzakat_user -p'PasswordAmanZakat2026!' simzakat_db > /var/backups/simzakat/db_$DATE.sql
# Hapus backup lebih dari 30 hari
find /var/backups/simzakat/ -name "*.sql" -type f -mtime +30 -delete
```

Beri izin eksekusi dan pasang di crontab:
```bash
chmod +x /root/backup_zakat.sh
crontab -e
```
Tambahkan baris berikut di paling bawah (backup setiap jam 02.00 malam):
```cron
0 2 * * * /root/backup_zakat.sh
```

---

**Selamat! Aplikasi SimZakat Anda kini telah online dan aktif di VPS Anda dengan keamanan database MySQL terisolasi.**
