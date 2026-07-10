# Open ERP

<p align="center">
  <strong>Open-source Enterprise Resource Planning system</strong>
  <br />
  Built with NestJS • Next.js • React • Tailwind CSS • PostgreSQL
  <br />
  Neon dark theme • Glassmorphism • OAuth ready
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-v11-E0234E?style=flat&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js-v16-000000?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-v19-61DAFB?style=flat&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker" alt="Docker" />
</p>

---

## ✨ Features

- **Dashboard** — Real-time stats, recent sales, and performance metrics
- **Products** — Full CRUD with stock tracking and status management
- **Customers** — Customer registry with purchase history
- **Sales** — Invoice creation, payment tracking, status management
- **Authentication** — JWT-based auth with email/password + OAuth (Google, Microsoft 365)
- **Responsive** — Fully responsive with collapsible sidebar and mobile support
- **Dark Theme** — Neon cyan/blue design system with glassmorphism effects

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | NestJS 11, TypeORM, Passport.js |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT, Google OAuth 2.0, Microsoft OAuth 2.0 |
| **DevOps** | Docker, Docker Compose |
| **Design** | Glassmorphism, Neon cyan/blue theme, SweetAlert2 |

## 🚀 Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/ErickGBR/run-mvp.git
cd run-mvp

# Create environment file
cp .env.example .env

# Start all services
docker compose up --build -d
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api

## 🔧 Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🔐 OAuth Configuration

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
5. Copy your Client ID and Client Secret to `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### Microsoft 365 OAuth *(Coming Soon)*
Microsoft 365 login is coming soon. Stay tuned.

## 📁 Project Structure

```
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Auth module (JWT + OAuth strategies)
│   │   ├── users/          # Users module
│   │   ├── products/       # Products CRUD
│   │   ├── customers/      # Customers CRUD
│   │   ├── sales/          # Sales module
│   │   └── dashboard/      # Dashboard stats
│   └── package.json
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/            # Pages (landing, auth, dashboard)
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # Auth context
│   │   └── lib/            # API client
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `openerp_db` | 5432 | PostgreSQL database |
| `openerp_api` | 3001 | NestJS REST API |
| `openerp_frontend` | 3000 | Next.js frontend |

## 📸 Screenshots & Demos

<div align="center">

### 🎬 Interactive Demos

| Feature | GIF Demo |
|---------|----------|
| **Landing Page Scroll** | ![Landing Scroll](screenshots/landing-scroll.gif) |
| **Auth Tab Switching** | ![Auth Tabs](screenshots/auth-tabs.gif) |
| **Dashboard Navigation** | ![Dashboard Nav](screenshots/dashboard-nav.gif) |

### Landing Page

![Hero Section](screenshots/landing-hero.png)
*Hero section with gradient effects and floating orbs*

![Features Section](screenshots/landing-features.png)
*Feature cards with glassmorphism design*

![Download & Install](screenshots/landing-download.png)
*Docker and Ubuntu installation options*

### Authentication

![Login Page](screenshots/login-page.png)
*Login page with neon dark theme*

### Blog

![Blog Listing](screenshots/blog-page.png)
*Blog with glassmorphism cards and tag system*

### Dashboard

![Dashboard Overview](screenshots/dashboard-overview.png)
*Main dashboard with key metrics and recent activity*

![Products Management](screenshots/dashboard-products.png)
*Product listing with CRUD operations and stock tracking*

![Customer Registry](screenshots/dashboard-customers.png)
*Customer management with purchase history*

![Sales & Invoices](screenshots/dashboard-sales.png)
*Sales management with invoice creation and payment tracking*

![Settings & Profile](screenshots/dashboard-settings.png)
*User settings and profile management*

</div>

## 👨‍💻 Author

**Erick Burgos** — [GitHub](https://github.com/ErickGBR)

## 📄 License

This project is open-source. Feel free to use, modify, and distribute.
