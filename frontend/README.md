# Open ERP — Frontend

Next.js 16 application with the Open ERP neon dark theme.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Alerts:** SweetAlert2
- **Auth:** JWT + OAuth 2.0 (Google, Microsoft 365)

## Getting Started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/auth/      # Login/Register with tabs
│   ├── dashboard/         # Dashboard with sidebar layout
│   └── page.tsx           # Landing page
├── components/
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Landing footer with tech stack
│   ├── AuthTabs.tsx       # Auth forms with OAuth buttons
│   ├── Sidebar.tsx        # Collapsible dashboard sidebar
│   └── DashboardHeader.tsx # Dashboard top bar
├── contexts/
│   └── AuthContext.tsx     # Auth state management
└── lib/
    └── api.ts             # HTTP client
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Login/Register tabs |
| `/dashboard` | Dashboard with stats |
| `/dashboard/products` | Product management |
| `/dashboard/customers` | Customer management |
| `/dashboard/sales` | Sales and invoices |
| `/dashboard/settings` | User settings |

## Design System

- **Theme:** Neon cyan/blue dark mode (VS Code inspired)
- **Effects:** Glassmorphism, glow shadows, gradient orbs, animated marquee
- **Components:** Glass cards, cyan pills, neon inputs, gradient buttons
