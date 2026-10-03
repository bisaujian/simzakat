#!/bin/bash
# ==============================================================================
# Skrip Update & Deploy Otomatis SimZakat via GitHub di VPS
# Cara pakai di VPS:
#   cd /var/www/simzakat
#   bash deploy.sh
# ==============================================================================

set -e

echo "🛡️ [1/4] Mencadangkan direktori data sebelum update..."
if [ -d "data" ]; then
  mkdir -p backups
  cp -r data "backups/data-backup-$(date +%Y%m%d%H%M%S)"
fi

echo "🚀 [2/4] Mengambil pembaruan terbaru dari GitHub..."
git fetch origin
git reset --hard origin/main

echo "📦 [3/4] Menginstal dependensi & build aset client..."
npm install
npm run build

echo "🔄 [4/4] Memuat ulang proses di PM2..."
if pm2 list | grep -q "simzakat-app"; then
  pm2 restart simzakat-app --update-env
else
  pm2 start server.ts --name "simzakat-app" --interpreter ./node_modules/.bin/tsx
  pm2 save
fi

echo "✅ Alhamdulillah! Deployment SimZakat berhasil diperbarui dengan aman!"
pm2 status simzakat-app
