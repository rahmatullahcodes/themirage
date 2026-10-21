# The Mirage — Phase 1 Creator Subscription Web Application

> **Real People. Exclusive Content. Your World.**  
> A premium, luxury creator subscription platform built with Next.js, React, TypeScript, PostgreSQL, WebSockets/Socket.IO, and a bespoke Black-and-Gold design system.

---

## 1. Executive Summary & Revenue Architecture

The Mirage connects creators with subscribers through:
- **Public Creator Profiles & Discovery:** Search, category filters, follower counts, and previews.
- **Subscriptions & Access Control:** Monthly subscriptions with automatic access to locked posts, photos, and videos.
- **85/15 Revenue Split:**
  - **Creator:** 85%
  - **Platform:** 15%
  - *Unified Calculation Engine:* Kept completely configurable via `CREATOR_COMMISSION_PERCENT` in the backend and Admin Panel.
- **1-on-1 Real-time Text Chat:** Direct messaging between subscribers and creators powered by WebSockets / Socket.IO.
- **Personalised Paid Content Workflow:** Subscribers request custom clips/photos -> Creator quotes price -> Customer pays -> Creator delivers private content -> Content locked to purchasing user.
- **Centralized Administration & Moderation:** Real user metrics, creator verification toggles, content review queue, and transaction inspection.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS |
| **Backend & API** | Node.js + Next.js REST API Architecture + Server-side validation |
| **Real-time Messaging** | WebSockets / Socket.IO |
| **Database** | PostgreSQL 18 (`the_mirage_db`) + Prisma ORM Schema |
| **Security & Auth** | JWT + bcryptjs password hashing + Role-Based Access Control (RBAC) |
| **Design System** | Approved Black & Gold Palette (`#08080a`, `#d4af37`, `#f5d77f`, Cinzel & Inter fonts) |

---

## 3. Approved Brand Assets & Design System

The application incorporates the client-approved assets stored in `public/assets/`:
- `the_mirage_logo.png`: The official golden wave banner logo.
- `homepage_mockup_reference.jpg`: The approved homepage UI reference.

### Color Palette
- **Deep Black & Charcoal:** `#08080a`, `#0e0e14`, `#121217`, `#181820`
- **Metallic Gold Accents:** `#d4af37`, `#f5d77f`, `#aa820a`
- **Soft White & Muted Text:** `#f8f9fa`, `#cbd5e1`, `#94a3b8`, `#64748b`

---

## 4. Local Development Setup

### Prerequisites
- Node.js v18+ or v20+
- PostgreSQL running locally on port 5432

### Installation Steps

1. **Clone repository & install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**
   Ensure PostgreSQL database exists:
   ```sql
   CREATE DATABASE the_mirage_db;
   ```
   Push Prisma schema:
   ```bash
   npx prisma db push
   ```

4. **Run the Application:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. User Roles & Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Visitor** | Public access | N/A | Homepage, Creator profiles, Age Gate |
| **Subscriber** | `subscriber@themirage.vip` | `password123` | Feeds, Chat, Custom Content Vault |
| **Creator** | `creator@themirage.vip` | `password123` | Studio, Feed Upload, 85% Earnings |
| **Admin** | `admin@themirage.vip` | `password123` | Admin Panel, Moderation, 85/15 Config |

---

## 6. Key Application Routes

- `/` — Homepage matching the approved black-and-gold design mockup
- `/explore` — Creator discovery with categories (Popular, New, Fitness, Mature 18+, etc.)
- `/creators` — Creator directory
- `/creator/[handle]` — Creator public profile with Posts, Photos, Videos, and Subscription unlock
- `/chat` — 1-on-1 real-time chat with interactive custom paid content request & delivery
- `/dashboard` — Subscriber dashboard (subscriptions, purchased private content vault, transaction ledger)
- `/creator-studio` — Creator studio (earnings overview, post uploader, custom order fulfillment)
- `/admin` — Protected admin panel (user management, creator verification toggles, content moderation, 85/15 commission configuration)
- `/pricing` — 85/15 revenue share transparency & membership pricing
- `/about` — The Mirage brand story & official logo presentation

---

## 7. Automated Testing

Run the automated commission calculation test suite:
```bash
node tests/commission.test.js
```
Verifies:
- 85% creator split calculation
- 15% platform split calculation
- Rounding integrity on odd amounts ($9.99, $35.00)
- Configurable commission parameter adjustments

---

## 8. Production Deployment Guide (VPS / Cloud)

For production deployment on Ubuntu/Debian VPS or AWS/DigitalOcean:

1. **Install Node.js, PostgreSQL, and PM2:**
   ```bash
   sudo apt update && sudo apt install -y nodejs npm postgresql postgresql-contrib nginx
   sudo npm install -g pm2
   ```

2. **Configure NGINX Reverse Proxy with SSL:**
   ```nginx
   server {
       server_name themirage.vip www.themirage.vip;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Start Application with PM2:**
   ```bash
   pm2 start server.js --name "the-mirage"
   pm2 save
   pm2 startup
   ```

