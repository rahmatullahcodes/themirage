#!/usr/bin/env bash
set -euo pipefail

# Installs PayRam alongside The Mirage on the SAME Ubuntu VPS (189.105.33.15)
# without touching existing ports 80/443 or themirage.world.
# Binds PayRam container strictly to 127.0.0.1:8090 and attaches HTTPS at pay.themirage.world.

PAYRAM_DOMAIN="${1:-pay.themirage.world}"
PAYRAM_DIR="/opt/payram"
MIRAGE_DIR="/var/www/the-mirage"
ENV_FILE="${PAYRAM_DIR}/.env"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

echo "================================================================"
echo " Installing PayRam Gateway on $PAYRAM_DOMAIN (127.0.0.1:8090)"
echo "================================================================"

# 1. Install Docker if not already installed
if ! command -v docker >/dev/null 2>&1; then
  echo "[1/5] Installing Docker..."
  $SUDO apt-get update -y
  $SUDO apt-get install -y docker.io openssl nginx certbot python3-certbot-nginx
  $SUDO systemctl enable --now docker
else
  echo "[1/5] Docker already installed: $(docker --version)"
fi

# 2. Ensure persistent PayRam directories & persistent AES_KEY / DB password
echo "[2/5] Preparing $PAYRAM_DIR persistent storage & secrets..."
$SUDO mkdir -p "${PAYRAM_DIR}/data" "${PAYRAM_DIR}/logs" "${PAYRAM_DIR}/pgdata"

if [ ! -f "$ENV_FILE" ]; then
  AES_KEY_GEN="$(openssl rand -hex 32)"
  PG_PASS_GEN="$(openssl rand -hex 16)"
  $SUDO tee "$ENV_FILE" >/dev/null <<EOF
AES_KEY=${AES_KEY_GEN}
SSL_CERT_PATH=
BLOCKCHAIN_NETWORK_TYPE=mainnet
SERVER=PRODUCTION
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=payram
POSTGRES_USERNAME=payram
POSTGRES_PASSWORD=${PG_PASS_GEN}
POSTGRES_SSLMODE=prefer
EOF
  $SUDO chmod 600 "$ENV_FILE"
  echo "Generated new PayRam vault secrets at $ENV_FILE (keep this file backed up!)."
else
  echo "Using existing $ENV_FILE (preserving AES_KEY)."
fi

# 3. Pull and launch PayRam container bound strictly to loopback port 8090
echo "[3/5] Pulling and starting payramapp/payram:latest..."
$SUDO docker pull payramapp/payram:latest

if $SUDO docker ps -a --format '{{.Names}}' | grep -qx 'payram'; then
  $SUDO docker rm -f payram
fi

$SUDO docker run -d \
  --name payram \
  --restart unless-stopped \
  --publish 127.0.0.1:8090:80 \
  --env-file "$ENV_FILE" \
  -v "${PAYRAM_DIR}/data:/root/payram" \
  -v "${PAYRAM_DIR}/logs:/var/log" \
  -v "${PAYRAM_DIR}/pgdata:/var/lib/payram/db/postgres" \
  payramapp/payram:latest

# 4. Configure Nginx Reverse Proxy for pay.themirage.world
echo "[4/5] Configuring Nginx for ${PAYRAM_DOMAIN}..."
$SUDO tee /etc/nginx/sites-available/pay-themirage >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;

    server_name ${PAYRAM_DOMAIN};

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 90s;
        proxy_send_timeout 90s;
    }
}
EOF

$SUDO ln -sf /etc/nginx/sites-available/pay-themirage /etc/nginx/sites-enabled/pay-themirage
$SUDO nginx -t
$SUDO systemctl reload nginx

# 5. Provision HTTPS SSL Certificate via Let's Encrypt
echo "[5/5] Enabling HTTPS SSL for ${PAYRAM_DOMAIN}..."
$SUDO certbot --nginx -d "${PAYRAM_DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect || \
  echo "Certbot prompt skipped or needs manual run: sudo certbot --nginx -d ${PAYRAM_DOMAIN}"

echo "================================================================"
echo " PayRam Setup Complete!"
echo " 1. Open: https://${PAYRAM_DOMAIN}/signup"
echo " 2. Create PayRam Admin account & set Site URL: https://${PAYRAM_DOMAIN}"
echo " 3. Set Webhook URL in PayRam: https://themirage.world/api/webhooks/payram"
echo " 4. Copy API-Key into https://themirage.world/admin -> Profile & Commission"
echo "================================================================"
