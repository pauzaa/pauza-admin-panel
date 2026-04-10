# Pauza Admin Panel

A desktop-only admin dashboard SPA for managing the Pauza platform — a digital wellbeing and focus app. Built with React 19, TypeScript 5, Vite 6, Tailwind CSS 4, and shadcn/ui.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Type Checking & Linting](#type-checking--linting)
- [Testing](#testing)
- [Production Build](#production-build)
- [Architecture Notes](#architecture-notes)

---

## Overview

The Pauza Admin Panel provides internal tooling to:

- View platform-wide stats (active users, revenue, subscriptions)
- Browse and search the user list
- Inspect individual user profiles, their subscription entitlements, and RevenueCat data
- Manually grant or revoke premium entitlements
- View revenue and subscription breakdown charts
- Export data as CSV

The panel is **desktop-only** (minimum viewport width: 1024px) and talks to the Pauza backend API.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Node.js

The project requires **Node.js 20 or later**.

```bash
# Check your version
node -v

# Install via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20

# Or download directly from https://nodejs.org
```

### pnpm

This project uses **pnpm** as its package manager (not npm or yarn).

```bash
# Install pnpm via npm
npm install -g pnpm

# Or via the standalone installer
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Verify installation
pnpm -v
```

### Pauza Backend API

The admin panel requires the **pauza-server** backend running locally on port `8080`. Without it, all data fetching will fail. The backend depends on:

- **Go 1.25+** — [https://go.dev/dl/](https://go.dev/dl/)
- **PostgreSQL 15+** — running and accessible
- **Redis 7+** — running and accessible

```bash
# Start the backend (from the pauza-server directory)
cd ../pauza-server
go run ./cmd/server
```

---

## Installation

Clone the repository and install dependencies:

```bash
# Navigate to the admin panel directory
cd pauza-admin-panel

# Install dependencies
pnpm install
```

---

## Environment Setup

The app uses environment files to configure the API base URL:

| File | Used when | Default API URL |
|------|-----------|-----------------|
| `.env.development` | `pnpm dev` | `http://localhost:8080` |
| `.env.production` | `pnpm build` | `https://api.pauza.dev` |
| `.env.local` | Always (overrides above) | *(your override)* |

`.env.local` is gitignored and takes precedence over all other env files. Use it for local overrides:

```bash
# .env.local (create this file if needed)
VITE_API_BASE_URL=http://localhost:8080
```

You do not need to create `.env.local` for standard local development — the `.env.development` defaults work out of the box.

---

## Running the App

### Development server

```bash
pnpm dev
```

Opens at **http://localhost:5173**. Requires the backend API to be running on port `8080`.

Log in with valid admin credentials. The JWT token is stored in `localStorage` under the key `admin_token`.

### Preview production build locally

```bash
pnpm build
pnpm preview
```

---

## Project Structure

```
src/
├── api/
│   ├── client.ts              # Fetch wrapper with auth headers and error mapping
│   └── endpoints/             # Per-domain API functions (users, stats, auth, …)
├── components/
│   ├── shared/                # Reusable UI (DataTable, StatsCard, TimeSeriesChart, …)
│   └── ui/                    # shadcn/ui primitives — do not edit directly
├── features/
│   ├── auth/                  # Login page, AuthProvider, RequireAuth guard
│   ├── dashboard/             # DashboardPage
│   ├── entitlements/          # EntitlementsListPage
│   ├── revenue/               # RevenuePage
│   └── users/                 # UsersListPage, UserDetailPage, sub-cards
├── hooks/                     # Generic reusable hooks (useTheme, useDebouncedValue, …)
├── lib/                       # Utilities: format.ts, csv.ts, utils.ts, constants.ts
├── types/                     # TypeScript interfaces mirroring backend JSON contracts
├── App.tsx                    # Router root
├── main.tsx                   # React entry point
└── index.css                  # Tailwind v4 CSS-first config + theme tokens
```

---

## Pages & Routes

| Route | Page | Auth required | Description |
|-------|------|:---:|-------------|
| `/login` | LoginPage | No | Admin email/password login |
| `/` | DashboardPage | Yes | Platform-wide stats overview |
| `/users` | UsersListPage | Yes | Searchable paginated user list |
| `/users/:id` | UserDetailPage | Yes | User profile, entitlements, RevenueCat data |
| `/entitlements` | EntitlementsListPage | Yes | All active entitlement records |
| `/revenue` | RevenuePage | Yes | Revenue charts and subscription breakdown |

Authenticated routes are wrapped in `AppLayout` (sidebar + topbar). Unauthenticated access redirects to `/login`. A 401 response from the API also auto-redirects to `/login`.

---

## Type Checking & Linting

```bash
# TypeScript type check (no emit)
pnpm tsc --noEmit

# ESLint
pnpm lint
```

The project uses `strict: true` and `noUncheckedIndexedAccess`. There should be zero type errors before committing.

---

## Testing

The admin panel does not currently have a dedicated unit or integration test suite. Verification is done via:

```bash
# 1. Type checking
pnpm tsc --noEmit

# 2. Linting
pnpm lint

# 3. Production build (catches tree-shaking and module resolution issues)
pnpm build
```

Run all three before raising a pull request or merging changes.

---

## Production Build

```bash
pnpm build
```

This runs `tsc --noEmit` first (will abort on type errors), then bundles with Vite into `dist/`. The output is a static SPA ready to be served by any CDN or static host.

---

## Architecture Notes

### Authentication

JWT-based. On login, the token is stored in `localStorage` as `admin_token` and attached to every API request via the `Authorization: Bearer` header. Tokens expire and trigger an auto-redirect to `/login`.

### Data Fetching

All server state is managed by **TanStack Query v5**. API calls go exclusively through `src/api/client.ts` — components never call `fetch` directly. Query stale times:

- Lists: 30 seconds
- Stats: 60 seconds
- Revenue data: 300 seconds

### Theming

Dark mode is supported via CSS variables. Toggle state is persisted in `localStorage` under `pauza-admin-theme`. The primary brand color is `#800020` (maroon/wine), following Material Design 3 naming conventions (`surface`, `on-surface`, `primary`, `outline-variant`, etc.).

### Key Dependencies

| Package | Role |
|---------|------|
| `react` 19 | UI framework |
| `vite` 6 | Build tool and dev server |
| `tailwindcss` 4 | Utility-first CSS (CSS-first config, no `tailwind.config.ts`) |
| `@tanstack/react-query` 5 | Server state and caching |
| `react-router-dom` 7 | Client-side routing |
| `recharts` | Charts and data visualizations |
| `lucide-react` | Icon library |
| `sonner` | Toast notifications |
| `papaparse` | CSV export |
| `@base-ui/react` | Accessible UI primitives (used by shadcn/ui components) |
