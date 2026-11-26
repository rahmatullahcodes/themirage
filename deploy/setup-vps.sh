#!/usr/bin/env bash
set -euo pipefail

# The Mirage - Hostinger Ubuntu 22.04 LTS Live Deployment Script
# Target VPS: 189.105.33.15 (srv2199443.hstgr.cloud)
# Default Domain: themirage.world
# Usage: bash setup-vps.sh [domain]

DOMAIN="${1:-themirage.world}"
VPS_IP="189.105.33.15"
APP_DIR="/var/www/the-mirage"
REPO_URL="https://github.com/rahmatullahcodes/themirage.git"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

echo "================================================================"
echo " Deploying The Mirage to Hostinger Ubuntu VPS ($VPS_IP)"
echo " Domain Configured: $DOMAIN"
echo "================================================================"

# 1. System packages & firewall
$SUDO apt-get update -y
$SUDO apt-get install -y curl git nginx ufw openssl dnsutils certbot python3-certbot-nginx

# Allow SSH + HTTP + HTTPS before enabling UFW
$SUDO ufw allow OpenSSH >/dev/null 2>&1 || $SUDO ufw allow 22/tcp
$SUDO ufw allow 80/tcp
$SUDO ufw allow 443/tcp
$SUDO ufw --force enable

# 2. Install Node.js 20 LTS if missing or older than v18
NEED_NODE=false
if ! command -v node >/dev/null 2>&1; then
  NEED_NODE=true
else
  NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_MAJOR" -lt 18 ]; then
    NEED_NODE=true
  fi
fi

if [ "$NEED_NODE" = true ]; then
  echo "[1/6] Installing Node.js 20 LTS..."
  if [ "$(id -u)" -ne 0 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi
fi
echo "Node version: $(node -v) | npm version: $(npm -v)"

# 3. Install PM2 globally
if ! command -v pm2 >/dev/null 2>&1; then
  echo "[2/6] Installing PM2..."
  $SUDO npm install -g pm2
fi

# 4. Clone or pull repository
echo "[3/6] Fetching The Mirage source code into $APP_DIR..."
$SUDO mkdir -p /var/www
CURRENT_USER="$(whoami)"
$SUDO chown -R "$CURRENT_USER:$CURRENT_USER" /var/www

if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git checkout main
  git pull origin main
else
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# 5. Configure .env if not already present
if [ ! -f "$APP_DIR/.env" ]; then
  echo "[4/6] Creating production .env..."
  JWT_SECRET_GEN=$(openssl rand -hex 32)
  cat > "$APP_DIR/.env" <<EOF
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
DATABASE_URL="postgresql://postgres:password@localhost:5432/the_mirage_db?schema=public"
JWT_SECRET="${JWT_SECRET_GEN}"
NEXT_PUBLIC_APP_URL="https://${DOMAIN}"
CREATOR_COMMISSION_PERCENT=85
PLATFORM_COMMISSION_PERCENT=15
PAYMENT_GATEWAY_ENV=sandbox
EOF
else
  echo "[4/6] Existing .env found, preserving it."
fi

# 6. Install dependencies & build production bundle
echo "[5/6] Installing npm packages & building Next.js production app..."
npm install --no-audit --no-fund
npm run build

# 7. Configure Nginx Reverse Proxy
echo "[6/6] Configuring Nginx & PM2..."
SERVER_NAMES="${DOMAIN} www.${DOMAIN} ${VPS_IP} srv2199443.hstgr.cloud _"

$SUDO tee /etc/nginx/sites-available/the-mirage >/dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name ${SERVER_NAMES};

    client_max_body_size 100M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

$SUDO rm -f /etc/nginx/sites-enabled/default
$SUDO ln -sf /etc/nginx/sites-available/the-mirage /etc/nginx/sites-enabled/the-mirage
$SUDO nginx -t
$SUDO systemctl enable nginx
$SUDO systemctl restart nginx

# Start/Reload PM2
pm2 startOrRestart "$APP_DIR/ecosystem.config.cjs" --update-env
pm2 save
$SUDO env PATH="$PATH:/usr/bin:/usr/local/bin" pm2 startup systemd -u "$CURRENT_USER" --hp "$HOME" >/dev/null 2>&1 || true

# Check DNS and automatically issue free Let's Encrypt SSL if DNS points to this VPS
RESOLVED_IP=$(dig +short "$DOMAIN" A | tail -n1 || true)
SSL_ENABLED=false
if [ "$RESOLVED_IP" = "$VPS_IP" ]; then
  echo "DNS matches $VPS_IP! Issuing Let's Encrypt HTTPS SSL certificate..."
  if $SUDO certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
    SSL_ENABLED=true
  elif $SUDO certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
    SSL_ENABLED=true
  fi
fi

sleep 2
echo ""
echo "================================================================"
echo " Health Check:"
curl -sS http://127.0.0.1/api/health || true
echo ""
echo " Direct IP URL:  http://${VPS_IP}"
echo " Hostname URL:   http://srv2199443.hstgr.cloud"
if [ "$SSL_ENABLED" = true ]; then
  echo " Live Domain:    https://${DOMAIN} (SSL Active!)"
else
  echo " Domain URL:     http://${DOMAIN} (Update A record -> ${VPS_IP}, then run:)"
  echo "   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --register-unsafely-without-email --redirect"
fi
echo "================================================================"
