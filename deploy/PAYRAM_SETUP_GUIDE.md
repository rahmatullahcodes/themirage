# PayRam Live Crypto Gateway Setup Guide for `themirage.world`

The Mirage now includes full native **PayRam (`pay.themirage.world`)** integration for **Subscriptions**, **Pay-Per-View Unlocks**, and **Custom Content Requests**, plus an Admin Panel control center under **Settings -> PayRam Self-Hosted Crypto Gateway**.

---

## 1. Domain & DNS Configuration

Add DNS `A` records in your domain registrar (e.g. Hostinger DNS Zone for `themirage.world`):

- `@` (`themirage.world`) -> Your Mirage VPS IP (`189.105.33.15`)
- `www` (`www.themirage.world`) -> `189.105.33.15`
- `pay` (`pay.themirage.world`) ->
  - **Dedicated PayRam VPS (Recommended):** Point `pay` to your second VPS IP (Ubuntu 22.04 LTS, min 2 vCPU / 4 GB RAM / 50 GB SSD).
  - **Single VPS (Shared Host):** Point `pay` to `189.105.33.15` (requires >= 6-8 GB RAM total) and proxy behind host Nginx using `deploy/nginx-payram-same-vps.conf`.

---

## 2. Installing PayRam

### Option A: Dedicated PayRam VPS (Simplest)
```bash
ssh root@YOUR_PAYRAM_VPS_IP
/bin/bash -c "$(curl -fsSL https://payram.com/setup_payram.sh) --mainnet"
```
Follow prompts, enter domain `pay.themirage.world`, allow SSL setup via Let's Encrypt, then open `https://pay.themirage.world/signup`.

### Option B: Same VPS Behind Host Nginx (`deploy/nginx-payram-same-vps.conf`)
Run PayRam mapped to loopback `127.0.0.1:8090` so it does not collide with Nginx ports `80/443`, then enable Nginx + SSL:
```bash
sudo cp /var/www/the-mirage/deploy/nginx-payram-same-vps.conf /etc/nginx/sites-available/pay-themirage
sudo ln -sf /etc/nginx/sites-available/pay-themirage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pay.themirage.world
```

---

## 3. Enabling Live Crypto Payments in The Mirage

1. Log in to **https://pay.themirage.world** -> Developer / Project Settings -> copy your **API-Key**.
2. In PayRam Dashboard, set your **Webhook URL** to:
   ```text
   https://themirage.world/api/webhooks/payram
   ```
3. Log in to **https://themirage.world/admin** -> **Profile & Commission** tab -> **PayRam Self-Hosted Crypto Gateway**:
   - **Gateway Mode:** `AUTO` (or `PAYRAM`)
   - **PayRam Server URL:** `https://pay.themirage.world`
   - **PayRam Project API-Key:** paste your PayRam API-Key
   - Click **Save PayRam Gateway Settings**, then **Test PayRam Server**.

*(Alternatively, set `PAYRAM_BASE_URL="https://pay.themirage.world"` and `PAYRAM_API_KEY="..."` in `/var/www/the-mirage/.env` and run `pm2 restart all`.)*
