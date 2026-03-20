# Pauza Admin Panel — Complete Specification

> Decision-complete specification for building the Pauza admin panel. A developer
> should be able to implement the entire application from this document without
> ambiguity.

---

## 0. Prerequisites

All tools below must be available on the developer's machine before starting.

### 0.1 Node.js (v20+)

**Check:**
```bash
node -v   # expect v20.x or v22.x
```

**Install (macOS — via Homebrew):**
```bash
brew install node@22
```

**Install (any OS — via nvm, recommended):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart terminal, then:
nvm install 22
nvm use 22
```

### 0.2 pnpm (v9+)

**Check:**
```bash
pnpm -v   # expect 9.x
```

**Install (via corepack, bundled with Node 16.13+):**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**Install (standalone):**
```bash
# macOS
brew install pnpm

# or via npm (if npm is available)
npm install -g pnpm
```

### 0.3 Git

**Check:**
```bash
git --version   # expect 2.x
```

**Install (macOS):**
```bash
xcode-select --install
# or
brew install git
```

### 0.4 Backend Server Running (for local development)

The admin panel calls the pauza-server API. Ensure it is running locally on `http://localhost:8080`.

**Check:**
```bash
curl -s http://localhost:8080/live | head -c 50
# expect: {"status":"ok", ...}
```

**Start (native):**
```bash
cd ../pauza-server
cp .env.dev.example .env.dev        # first time only
set -a; source .env.dev; set +a
go run ./cmd/migrate
go run ./cmd/server
```

**Start (Docker):**
```bash
cd ../pauza-server
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

The backend must have the `ADMIN_CORS_ORIGINS=http://localhost:5173` env var set (see `../pauza-server/docs/ENDPOINTS.md`). An admin user must be seeded:
```bash
cd ../pauza-server
go run ./cmd/seed-admin
```

### 0.5 Summary Table

| Tool     | Min Version | Check Command     | Required For           |
| -------- | ----------- | ----------------- | ---------------------- |
| Node.js  | 20.0        | `node -v`         | JS runtime             |
| pnpm     | 9.0         | `pnpm -v`         | Package management     |
| Git      | 2.0         | `git --version`   | Version control        |
| Backend  | —           | `curl localhost:8080/live` | API calls during dev |

---

## 1. Tech Stack

| Layer            | Choice                            | Version   |
| ---------------- | --------------------------------- | --------- |
| Framework        | React + TypeScript                | React 19, TS 5 |
| Build            | Vite                              | 6.x       |
| Styling          | Tailwind CSS                      | 4.x       |
| Component library| shadcn/ui                         | latest    |
| Charts           | Recharts                          | 2.x       |
| Routing          | React Router                      | 7.x (BrowserRouter) |
| Data fetching    | TanStack Query                    | 5.x       |
| HTTP client      | Native `fetch` (thin wrapper)     | —         |
| CSV export       | papaparse                         | 5.x       |
| Icons            | lucide-react                      | latest    |
| Package manager  | pnpm                              | 9.x       |
| Responsiveness   | Desktop-only (min-width 1024px)   | —         |
| Linting          | ESLint + typescript-eslint         | latest    |

### 1.1 TypeScript Strictness

The admin panel must be **strongly typed** — matching the strictness of the rest of the Pauza codebase (Go backend uses interface-based DI with zero `interface{}`; Dart mobile app runs 45+ lint rules as errors with `strict-inference: true`).

**`tsconfig.app.json` — strict compiler settings:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

**Key rules:**
- `strict: true` — enables `strictNullChecks`, `strictFunctionTypes`, `noImplicitAny`, etc.
- `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`
- `noUnusedLocals` + `noUnusedParameters` — no dead code

**ESLint (`.eslintrc.cjs`):**
```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: ['./tsconfig.app.json'] },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

**Additional dev dependencies for linting:**
```json
{
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "eslint-plugin-react-hooks": "^5.0.0"
}
```

**Typing principles:**
- No `any` — use `unknown` for truly unknown types, narrow with type guards
- All API responses are typed via interfaces in `src/types/` (see §12)
- All component props defined as `interface` (see §7)
- All `useQuery`/`useMutation` calls use explicit generics or typed `queryFn` returns
- Prefer `type` imports (`import type { ... }`) for types that are erased at runtime
- Use discriminated unions for state (e.g., `{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }`) where appropriate

---

## 2. Project Structure

```
pauza-admin-panel/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                          # ReactDOM.createRoot, providers
│   ├── routes.tsx                        # Route tree definition
│   ├── index.css                         # Tailwind v4 config + CSS variables
│   │
│   ├── api/
│   │   ├── client.ts                     # Base fetch wrapper (auth, error mapping)
│   │   └── endpoints/
│   │       ├── auth.ts                   # login()
│   │       ├── users.ts                  # listUsers(), getUserDetail()
│   │       ├── stats.ts                  # getPlatformStats()
│   │       ├── entitlements.ts           # listEntitlements(), manageEntitlement()
│   │       ├── timeseries.ts             # getUserGrowth(), getActiveUsers()
│   │       └── revenuecat.ts             # getRCOverview(), getRCChart(), getRCSubscriber()
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx             # Sidebar + TopBar + <Outlet/>
│   │   │   ├── Sidebar.tsx               # Nav links + logout
│   │   │   └── TopBar.tsx                # Page title + dark mode toggle
│   │   ├── ui/                           # shadcn/ui primitives (see §7.5)
│   │   └── shared/
│   │       ├── StatsCard.tsx
│   │       ├── DataTable.tsx
│   │       ├── TimeSeriesChart.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorAlert.tsx
│   │       ├── EmptyState.tsx
│   │       └── PaginationControls.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── AuthProvider.tsx          # AuthContext + provider
│   │   │   ├── useAuth.ts               # useAuth() hook
│   │   │   └── RequireAuth.tsx           # Route guard
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── users/
│   │   │   ├── UsersListPage.tsx
│   │   │   └── UserDetailPage.tsx
│   │   ├── entitlements/
│   │   │   └── EntitlementsListPage.tsx
│   │   └── revenue/
│   │       └── RevenuePage.tsx
│   │
│   ├── hooks/
│   │   ├── useTheme.ts                   # Dark mode toggle logic
│   │   └── useDebouncedValue.ts          # Generic debounce hook
│   │
│   ├── lib/
│   │   ├── csv.ts                        # CSV download + fetchAllPages utility
│   │   ├── format.ts                     # Number/date/duration formatters
│   │   └── constants.ts                  # Pagination defaults, time ranges, TimeRange type
│   │
│   └── types/
│       ├── api.ts                        # Shared API types (pagination, error)
│       ├── user.ts                       # User list item, user detail
│       ├── entitlement.ts                # Entitlement list item
│       ├── stats.ts                      # Platform stats, time series
│       └── revenuecat.ts                 # RC overview, chart, subscriber
│
├── index.html
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── package.json
├── pnpm-lock.yaml
├── .eslintrc.cjs                         # ESLint strict-type-checked config (see §1.1)
├── .env.development                      # VITE_API_BASE_URL=http://localhost:8080
├── .env.production                       # VITE_API_BASE_URL=https://api.pauza.dev
└── .gitignore
```

---

## 3. Color Theme & Dark Mode

### 3.1 Tailwind v4 Configuration (`src/index.css`)

Tailwind v4 uses CSS-first configuration. There is **no `tailwind.config.ts` file**. All theme customization lives in `src/index.css`.

**Inter font:** Load via `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Complete `src/index.css`:**

```css
@import "tailwindcss";

/* ── Class-based dark mode ── */
@custom-variant dark (&:where(.dark, .dark *));

/* ── Light theme variables ── */
:root {
  --color-primary: #800020;
  --color-on-primary: #ffffff;
  --color-primary-container: #ffffff;
  --color-on-primary-container: #800020;

  --color-surface: #ffffff;
  --color-surface-dim: #f6f4f5;
  --color-surface-bright: #ffffff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #fcfafb;
  --color-surface-container: #f8f5f6;
  --color-surface-container-high: #f3eff0;
  --color-surface-container-highest: #eee8ea;

  --color-on-surface: #171214;
  --color-on-surface-variant: #6d6470;

  --color-outline: #b0a8b2;
  --color-outline-variant: #d9d3d8;

  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #410002;

  --color-success: #2e7d32;
  --color-on-success: #ffffff;
  --color-success-container: #c8e6c9;
  --color-on-success-container: #0b2e0e;

  --color-warning: #ed8b00;
  --color-on-warning: #ffffff;
  --color-warning-container: #ffe0b2;
  --color-on-warning-container: #4b2800;
}

/* ── Dark theme variables ── */
.dark {
  --color-primary: #800020;
  --color-on-primary: #ffffff;
  --color-primary-container: #000000;
  --color-on-primary-container: #ffffff;

  --color-surface: #070607;
  --color-surface-dim: #050405;
  --color-surface-bright: #1a1718;
  --color-surface-container-lowest: #040304;
  --color-surface-container-low: #0b090a;
  --color-surface-container: #100d0e;
  --color-surface-container-high: #151112;
  --color-surface-container-highest: #1c1719;

  --color-on-surface: #f4f2f3;
  --color-on-surface-variant: #97a2b6;

  --color-outline: #2a2d33;
  --color-outline-variant: #202329;

  --color-error: #ffb4ab;
  --color-on-error: #690005;
  --color-error-container: #93000a;
  --color-on-error-container: #ffdad6;

  --color-success: #81c784;
  --color-on-success: #08310a;
  --color-success-container: #1b5e20;
  --color-on-success-container: #c8e6c9;

  --color-warning: #ffb74d;
  --color-on-warning: #3b1e00;
  --color-warning-container: #5d3a00;
  --color-on-warning-container: #ffe0b2;
}

/* ── Tailwind v4 theme registration ── */
@theme {
  /* Colors — reference CSS variables so they swap with dark mode */
  --color-primary: var(--color-primary);
  --color-on-primary: var(--color-on-primary);
  --color-primary-container: var(--color-primary-container);
  --color-on-primary-container: var(--color-on-primary-container);
  --color-surface: var(--color-surface);
  --color-surface-dim: var(--color-surface-dim);
  --color-surface-bright: var(--color-surface-bright);
  --color-surface-container-lowest: var(--color-surface-container-lowest);
  --color-surface-container-low: var(--color-surface-container-low);
  --color-surface-container: var(--color-surface-container);
  --color-surface-container-high: var(--color-surface-container-high);
  --color-surface-container-highest: var(--color-surface-container-highest);
  --color-on-surface: var(--color-on-surface);
  --color-on-surface-variant: var(--color-on-surface-variant);
  --color-outline: var(--color-outline);
  --color-outline-variant: var(--color-outline-variant);
  --color-error: var(--color-error);
  --color-on-error: var(--color-on-error);
  --color-error-container: var(--color-error-container);
  --color-on-error-container: var(--color-on-error-container);
  --color-success: var(--color-success);
  --color-on-success: var(--color-on-success);
  --color-success-container: var(--color-success-container);
  --color-on-success-container: var(--color-on-success-container);
  --color-warning: var(--color-warning);
  --color-on-warning: var(--color-on-warning);
  --color-warning-container: var(--color-warning-container);
  --color-on-warning-container: var(--color-on-warning-container);

  /* Font */
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Border radius */
  --radius: 8px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

**Usage in components:** Classes like `bg-primary`, `text-on-surface`, `border-outline-variant` work directly. Opacity modifiers work natively in Tailwind v4 (e.g., `bg-primary/10`).

### 3.3 Dark Mode Implementation

**Strategy:** Tailwind `class` mode. The `dark` class is toggled on the `<html>` element.

**`useTheme` hook** (`src/hooks/useTheme.ts`):

```ts
import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pauza-admin-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'light'; // Default to light, no system preference detection
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
```

The `useTheme` hook is called directly in `TopBar.tsx` and in `LoginPage.tsx` (both have dark mode toggles). The hook reads from `localStorage` which is singleton-safe — no `ThemeContext` or `App.tsx` wrapper needed.

---

## 4. Routes

| Route             | Page                     | Auth Required | Sidebar Shown |
| ----------------- | ------------------------ | ------------- | ------------- |
| `/login`          | `LoginPage`              | No            | No            |
| `/`               | `DashboardPage`          | Yes           | Yes           |
| `/users`          | `UsersListPage`          | Yes           | Yes           |
| `/users/:id`      | `UserDetailPage`         | Yes           | Yes           |
| `/entitlements`   | `EntitlementsListPage`   | Yes           | Yes           |
| `/revenue`        | `RevenuePage`            | Yes           | Yes           |

**Route definition** (`src/routes.tsx`):

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAuth } from './features/auth/RequireAuth';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { UsersListPage } from './features/users/UsersListPage';
import { UserDetailPage } from './features/users/UserDetailPage';
import { EntitlementsListPage } from './features/entitlements/EntitlementsListPage';
import { RevenuePage } from './features/revenue/RevenuePage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersListPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'entitlements', element: <EntitlementsListPage /> },
      { path: 'revenue', element: <RevenuePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
```

---

## 5. Layout

### 5.1 AppLayout

```
+--------+-----------------------------------------------------------+
| SIDEBAR| TOP BAR (h-14)                                            |
| (w-60) |  Page Title                           [sun/moon]  [A]     |
|        +-----------------------------------------------------------+
|        |                                                           |
| [Logo] |                                                           |
|        |            CONTENT AREA                                   |
| -----  |            (scrollable, p-6)                              |
| Dash.  |            bg: surface-container-lowest                   |
| Users  |                                                           |
| Entit. |                                                           |
| Rev.   |                                                           |
|        |                                                           |
| -----  |                                                           |
| Logout |                                                           |
+--------+-----------------------------------------------------------+
```

**Sidebar (`src/components/layout/Sidebar.tsx`):**
- Fixed width: `w-60` (240px)
- Full viewport height: `h-screen`
- Background: `bg-surface-container-low`
- Border right: `border-r border-outline-variant`
- Top section: Pauza wordmark text in primary color, `text-xl font-bold`, with "Admin" subtitle in `text-on-surface-variant text-sm`
- Navigation section: vertical list of `NavLink` items
- Each nav item: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium`
  - Default: `text-on-surface-variant hover:bg-surface-container`
  - Active: `bg-primary/10 text-primary`
- Nav items (in order):
  1. `LayoutDashboard` icon + "Dashboard" → `/` (uses `end` prop — exact match only)
  2. `Users` icon + "Users" → `/users` (no `end` — stays active on `/users/:id`)
  3. `Shield` icon + "Entitlements" → `/entitlements`
  4. `DollarSign` icon + "Revenue" → `/revenue`
- Bottom section: `LogOut` icon + "Logout" button, same styling as nav items but with `text-error` on hover
- Separator between nav and logout: `border-t border-outline-variant`

**TopBar (`src/components/layout/TopBar.tsx`):**
- Height: `h-14` (56px)
- Background: `bg-surface`
- Border bottom: `border-b border-outline-variant`
- Left: Page title in `text-lg font-semibold text-on-surface`
  - Title derived from current route path:
    - `/` → "Dashboard"
    - `/users` → "Users"
    - `/users/:id` → "User Details"
    - `/entitlements` → "Entitlements"
    - `/revenue` → "Revenue"
- Right: `flex items-center gap-3`
  - Dark mode toggle: `Sun` / `Moon` icon button (24px), `text-on-surface-variant hover:text-on-surface`
  - Admin avatar: `w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold` showing "A"

**Content area:**
- `flex-1 overflow-y-auto p-6 bg-surface-container-lowest`

---

## 6. Pages — Detailed Specifications

### 6.1 LoginPage (`/login`)

Full-screen centered layout. No sidebar or top bar.

```
+----------------------------------------------------------------------+
|                                                     [sun/moon]       |
|                                                                      |
|                                                                      |
|                    +----------------------------------+               |
|                    |                                  |               |
|                    |         Pauza                    |               |
|                    |         Admin Panel              |               |
|                    |                                  |               |
|                    |   Username                       |               |
|                    |   [____________________________] |               |
|                    |                                  |               |
|                    |   Password                       |               |
|                    |   [____________________________] |               |
|                    |                                  |               |
|                    |   [       Sign In              ] |               |
|                    |                                  |               |
|                    |   Invalid credentials            |               |
|                    |   (red text, only on error)      |               |
|                    |                                  |               |
|                    +----------------------------------+               |
|                                                                      |
+----------------------------------------------------------------------+
```

**Styling:**
- Page background: `bg-surface-container`
- Card: `bg-surface rounded-xl p-8 shadow-sm border border-outline-variant max-w-[400px] w-full`
- "Pauza" text: `text-3xl font-bold text-primary`
- "Admin Panel" text: `text-sm text-on-surface-variant mb-8`
- Input labels: `text-sm font-medium text-on-surface mb-1.5`
- Inputs: shadcn `Input` component with Pauza theme overrides
- Sign In button: `w-full bg-primary text-on-primary font-semibold py-2.5 rounded-lg hover:bg-primary/90`
- Error text: `text-sm text-error mt-4`
- Dark mode toggle: absolute positioned top-right of the page, same icon button as TopBar

**Behavior:**
- On submit: call `POST /api/v1/admin/login` with `{ username, password }`
- On success: store `access_token` in `localStorage` key `admin_token`, navigate to `/`
- On 401: show "Invalid credentials" below the button
- On network error: show "Unable to connect to server"
- On 429: show "Too many attempts. Please wait."
- Submit button shows a loading spinner while request is in flight; disabled during loading
- Password field has `type="password"`, username field has `autoFocus`

### 6.2 DashboardPage (`/`)

```
+-------------------------------------------------------------------+
| Row 1: Platform Stats (from GET /admin/stats)                     |
| +------------+ +------------+ +------------+ +------------+       |
| | Users      | | Active 30d | | Premium    | | Friends    |       |
| | [icon]     | | [icon]     | | [icon]     | | [icon]     |       |
| |   1,234    | |     891    | |     156    | |     432    |       |
| +------------+ +------------+ +------------+ +------------+       |
|                                                                   |
| +------------+ +-------------------+                              |
| | Avg Streak | | Avg Daily Focus   |                              |
| | [icon]     | | [icon]            |                              |
| |  4.2 days  | |    1h 23m         |                              |
| +------------+ +-------------------+                              |
|                                                                   |
| Row 2: Revenue Overview (from GET /admin/revenuecat/overview)     |
| +------------+ +------------+ +------------+ +------------+       |
| |   MRR      | |   ARR      | | Active     | | Active     |       |
| | [icon]     | | [icon]     | | Subs [icon]| | Trials     |       |
| |  $420.00   | | $5,040.00  | |    134     | |     12     |       |
| +------------+ +------------+ +------------+ +------------+       |
|                                                                   |
| Row 3: Charts                                                     |
| +------------------------------+ +------------------------------+ |
| | User Growth                  | | Active Users                 | |
| | [30d] [90d] [1y] [All]      | | [30d] [90d] [1y] [All]      | |
| |                              | |                              | |
| |   ~~~area chart~~~           | |   ~~~area chart~~~           | |
| |                              | |                              | |
| +------------------------------+ +------------------------------+ |
|                                                                   |
| +---------------------------------------------------------------+ |
| | Revenue Over Time                                              | |
| | [30d] [90d] [1y] [All]                                        | |
| |                                                                | |
| |   ~~~area chart (full width)~~~                                | |
| |                                                                | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

**Grid layout:**
- Stats cards row 1: `grid grid-cols-4 gap-4`
- Stats cards row 2: `grid grid-cols-4 gap-4` (two cards, spanning col 1-2)
- Revenue cards: `grid grid-cols-4 gap-4`
- Charts row: `grid grid-cols-2 gap-4`
- Revenue chart: `col-span-2` (full width)
- Vertical gap between sections: `space-y-6`

**Data sources & TanStack Query:**
- Platform stats: `useQuery({ queryKey: ['stats'], queryFn: getPlatformStats, staleTime: 60_000 })`
- RC overview: `useQuery({ queryKey: ['rc-overview'], queryFn: getRCOverview, staleTime: 300_000 })`
- User growth: `useQuery({ queryKey: ['user-growth', range], queryFn: () => getUserGrowth(range), staleTime: 120_000 })` — backend auto-selects granularity based on range
- Active users: `useQuery({ queryKey: ['active-users', range], queryFn: () => getActiveUsers(range), staleTime: 120_000 })` — same auto-granularity
- Revenue chart: `useQuery({ queryKey: ['rc-chart', 'revenue', range], queryFn: () => getRCChart('revenue', range), staleTime: 300_000 })`

**Stats card icons (from lucide-react):**
- Total Users → `Users`
- Active 30d → `Activity`
- Premium → `Crown`
- Friendships → `Heart`
- Avg Streak → `Flame`
- Avg Daily Focus → `Clock`
- MRR → `TrendingUp`
- ARR → `DollarSign`
- Active Subs → `CreditCard`
- Active Trials → `Gift`

**Stats card formatting:**
- Numbers: `formatNumber()` (e.g., "1,234")
- Currency (MRR/ARR): `formatCurrency()` (e.g., "$420.00") — values from API are in cents
- Duration (avg daily focus): `formatDuration()` (e.g., "1h 23m") — value from API is in ms
- Streak: `${value.toFixed(1)} days`

**Loading state:** Each stats card shows a `h-8 w-24 bg-surface-container-high rounded animate-pulse` skeleton for the value while loading.

**Error state:** If stats query fails, show `ErrorAlert` component in place of the cards row with "Failed to load statistics" message and a "Retry" button.

### 6.3 UsersListPage (`/users`)

```
+-------------------------------------------------------------------+
| Users                                           [Export CSV]      |
|                                                                   |
| [Search by name, email, or username...        ]                   |
|                                                                   |
| +------+------------------------------------------+---------+    |
| | User        | Email         | Username | Status | Joined  |    |
| +------+------------------------------------------+---------+    |
| | [AV] Alice  | a@b.com       | alice_j  | Active | Jan 1   | -> |
| | [AV] Bob    | b@c.com       | bob_99   | —      | Jan 2   | -> |
| | [AV] Carol  | c@d.com       | carol_x  | Active | Jan 3   | -> |
| | ...         |               |          |        |         |    |
| +------+------------------------------------------+---------+    |
|                                                                   |
| Showing 1-20 of 150           [< Prev]  Page 1 of 8  [Next >]   |
+-------------------------------------------------------------------+
```

**API:** `GET /api/v1/admin/users?page={page}&limit={limit}&search={search}`

**Search input:**
- Full-width shadcn `Input` with `Search` icon prefix
- Placeholder: "Search by name, email, or username..."
- Debounced: 300ms (use `useDebouncedValue` hook)
- On change: reset page to 1, refetch with search param

**Table columns:**

| Column   | Field                        | Width   | Render                                                                 |
| -------- | ---------------------------- | ------- | ---------------------------------------------------------------------- |
| User     | `profile_picture_url`, `name`| flex    | 32px avatar circle (image or initials fallback) + name                 |
| Email    | `email`                      | flex    | Plain text, `text-on-surface-variant`                                  |
| Username | `username`                   | 120px   | `@{username}` format, `text-on-surface-variant`                        |
| Status   | `premium_entitlement_active` | 100px   | `StatusBadge` (Active/Inactive)                                        |
| Joined   | `created_at`                 | 120px   | `formatDate()` → "Jan 1, 2025"                                        |
| (action) | —                            | 40px    | `ChevronRight` icon, entire row is clickable → `/users/:id`           |

**Avatar rendering:** If `profile_picture_url` is set, render `<img>` with `onError` fallback to initials avatar (handles broken URLs gracefully). **Initials fallback:** Split `name` by whitespace; take first character of first segment + first character of last segment (e.g., "Alice Johnson" → "AJ", "Alice" → "A"). If name is empty, use first letter of `email`. Background: `bg-primary/10`, text: `text-primary text-xs font-semibold`.

**Pagination:**
- Below table: "Showing {start}-{end} of {total}" on the left
- Previous/Next buttons on the right with current page indicator
- Previous disabled on page 1, Next disabled on last page

**CSV Export:**
- "Export CSV" button: outlined style, top-right, `Download` icon from lucide
- On click: button enters loading state (spinner replaces icon)
- Fetches all pages sequentially: `GET /admin/users?page=1&limit=100`, page=2, etc. until `page * limit >= total`
- Merges all results, calls `downloadCSV()` with columns: `id, email, name, username, premium_entitlement_active, created_at`
- Filename: `pauza_users_YYYY-MM-DD.csv`

**Empty state:** When no results (after search or initially empty): `EmptyState` component with `Users` icon + "No users found" text.

**TanStack Query:**
```ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';

const debouncedSearch = useDebouncedValue(search, 300);

useQuery({
  queryKey: ['users', { page, limit: DEFAULT_LIMIT, search: debouncedSearch }],
  queryFn: () => listUsers({ page, limit: DEFAULT_LIMIT, search: debouncedSearch }),
  staleTime: 30_000,
  placeholderData: keepPreviousData, // Prevent flash on page change
})
```

### 6.4 UserDetailPage (`/users/:id`)

```
+-------------------------------------------------------------------+
| [<- Back to Users]                                                |
|                                                                   |
| +-------------------+  +---------------------------------------+ |
| | [Avatar 64px]     |  | User Information                      | |
| | Alice Johnson     |  |                                       | |
| | @alice_j          |  | Email         alice@example.com       | |
| |                   |  | Joined        January 1, 2025         | |
| | Status: [Active]  |  | Leaderboard   Visible                 | |
| | Expires: Mar 2026 |  | Friends       12                      | |
| |                   |  | Sessions      156                     | |
| +-------------------+  | Last Session  2 hours ago             | |
|                         +---------------------------------------+ |
|                                                                   |
| Entitlement Management                                            |
| +---------------------------------------------------------------+ |
| | Current: Active (expires Mar 30, 2026)                        | |
| |                                                                | |
| | Expires At (optional):  [  date-time picker           ]       | |
| |                                                                | |
| | [  Grant Premium  ]     [  Revoke Premium  ]                  | |
| +---------------------------------------------------------------+ |
|                                                                   |
| RevenueCat Subscription  (only if revenuecat_app_user_id != null) |
| +---------------------------------------------------------------+ |
| | RC App User ID: $RCAnonymousID:abc123                         | |
| |                                                                | |
| | Entitlement    Status    Product              Expires          | |
| | premium        Active    pauza_premium_mo..   Mar 30, 2026    | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

**Back button:** `ArrowLeft` icon + "Back to Users" text, navigates to `/users`.

**Profile card (left):**
- Card: `bg-surface-container rounded-xl p-6`
- Avatar: 64px circle, same initials fallback as list page
- Name: `text-xl font-semibold text-on-surface`
- Username: `text-sm text-on-surface-variant`
- Status: `StatusBadge` driven by `is_premium` field from `UserDetail`
- Expires: `text-sm text-on-surface-variant` — shows `formatDate(current_period_end)` or "No expiry" if null
- Avatar: 64px circle. If `profile_picture_url` is set, render `<img>` with `onError` fallback to initials

**Info card (right):**
- Card: `bg-surface-container rounded-xl p-6`
- Key-value pairs in a `dl` grid: `grid grid-cols-[auto_1fr] gap-x-6 gap-y-3`
- Keys: `text-sm font-medium text-on-surface-variant`
- Values: `text-sm text-on-surface`
- Leaderboard: "Visible" (green) or "Hidden" (gray)
- Last session: `formatRelativeTime(last_session_time)` — if null, show "Never"
  - Note: `last_session_time` is epoch ms, convert to ISO string first

**Layout:** `grid grid-cols-[280px_1fr] gap-6` for the profile + info row.

**Entitlement management card:**
- Card: `bg-surface-container rounded-xl p-6`
- Current status line: "Current: Active (expires Mar 30, 2026)" or "Current: Inactive"
- `expires_at` input: HTML `<input type="datetime-local">` styled with shadcn. Optional field.
- Two action buttons side by side:
  - "Grant Premium": `bg-success text-on-success font-semibold px-6 py-2.5 rounded-lg`
  - "Revoke Premium": `bg-error text-on-error font-semibold px-6 py-2.5 rounded-lg`

**Confirmation dialog flow (uses shadcn `Dialog`):**
- Clicking "Grant Premium" opens a dialog:
  - Title: "Grant Premium"
  - Body: "Are you sure you want to grant premium access to **{name}**?" If `expires_at` is set, also show "Expires: {formatted date}".
  - Buttons: "Cancel" (outline) / "Confirm Grant" (`bg-success text-on-success`)
- Clicking "Revoke Premium" opens a dialog:
  - Title: "Revoke Premium"
  - Body: "Are you sure you want to revoke premium access from **{name}**? This action takes effect immediately."
  - Buttons: "Cancel" (outline) / "Confirm Revoke" (`bg-error text-on-error`)
- The API mutation fires only after clicking the confirm button
- Dialog closes on cancel or after successful mutation
- Confirm button shows loading spinner during mutation; disabled while in flight

**API call:** `POST /api/v1/admin/users/:id/entitlements` with `{ action: "grant"|"revoke", entitlement: "premium", expires_at?: string }`
- On success: close dialog, show success toast (`toast.success('Premium granted')` or `toast.success('Premium revoked')`), invalidate `['user', id]` and `['entitlements']` queries
- On error: show error toast (`toast.error(err.message)`)

**RevenueCat section:**
- Only rendered if `userDetail.revenuecat_app_user_id` is not null
- Fetched separately: `GET /api/v1/admin/users/:id/revenuecat`
- Shows "RC App User ID" as plain text (monospace)
- Entitlements table:
  - Columns: Entitlement ID, Status (Active/Inactive badge), Product, Purchase Date, Expires Date, Grace Period
  - Each row from `RCSubscriberDetail.entitlements[]`
- Loading: skeleton rows
- Error: inline "Could not load subscription details from RevenueCat" message (does not block the rest of the page)

**404 behavior:** If the `getUserDetail` query returns a `NOT_FOUND` error, navigate to `/users` and show `toast.error('User not found')`.

**TanStack Query:**
```ts
import { toast } from 'sonner';

// User detail
useQuery({ queryKey: ['user', id], queryFn: () => getUserDetail(id), staleTime: 30_000 })

// RC subscriber (conditional)
useQuery({
  queryKey: ['rc-subscriber', id],
  queryFn: () => getRCSubscriber(id),
  staleTime: 60_000,
  enabled: !!userDetail?.revenuecat_app_user_id,
})

// Entitlement mutation
useMutation({
  mutationFn: (params: ManageEntitlementParams) => manageEntitlement(id, params),
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ['user', id] });
    // Prefix match — invalidates all entitlement list pages (intentional)
    queryClient.invalidateQueries({ queryKey: ['entitlements'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    toast.success(variables.action === 'grant' ? 'Premium granted' : 'Premium revoked');
  },
  onError: (err) => {
    toast.error(err instanceof Error ? err.message : 'An error occurred');
  },
})
```

### 6.5 EntitlementsListPage (`/entitlements`)

```
+-------------------------------------------------------------------+
| Entitlements                                    [Export CSV]      |
|                                                                   |
| Status:  [All]  [Active]  [Inactive]                              |
|                                                                   |
| +----------+-----------+----------+--------+-----------+---------+|
| | Email    | Username  | Type     | Active | Expires   | Updated ||
| +----------+-----------+----------+--------+-----------+---------+|
| | a@b.com  | alice_j   | premium  | [Yes]  | Mar 2026  | 2h ago  ||
| | b@c.com  | bob_99    | premium  | [No]   | Expired   | 1d ago  ||
| | ...      |           |          |        |           |         ||
| +----------+-----------+----------+--------+-----------+---------+|
|                                                                   |
| Showing 1-20 of 50             [< Prev]  Page 1 of 3  [Next >]  |
+-------------------------------------------------------------------+
```

**API:** `GET /api/v1/admin/entitlements?page={page}&limit={limit}&entitlement=premium&is_active={filter}`

**Filter control:**
- Segmented button group (3 options): "All", "Active", "Inactive"
- Styling: `inline-flex rounded-lg border border-outline-variant overflow-hidden`
  - Each segment: `px-4 py-2 text-sm font-medium`
  - Default: `bg-surface text-on-surface-variant`
  - Active: `bg-primary text-on-primary`
- "All" selected by default (no `is_active` param sent)
- "Active" sends `is_active=true`, "Inactive" sends `is_active=false`
- Changing filter resets page to 1

**Table columns:**

| Column    | Field                | Render                                                      |
| --------- | -------------------- | ----------------------------------------------------------- |
| Email     | `email`              | Plain text                                                  |
| Username  | `username`           | `@{username}`                                               |
| Type      | `entitlement`        | Capitalized ("Premium")                                     |
| Active    | `is_active`          | `StatusBadge`                                               |
| Expires   | `current_period_end` | `formatDate()`, "Indefinite" if null, "Expired" if past     |
| Updated   | `updated_at`         | `formatRelativeTime()`                                      |
| (action)  | `user_id`            | `ChevronRight` → `/users/:user_id`                         |

**CSV Export:** Same pattern as users list. Columns: `user_id, email, username, entitlement, is_active, current_period_end, updated_at`. Filename: `pauza_entitlements_YYYY-MM-DD.csv`.

**TanStack Query:**
```ts
useQuery({
  queryKey: ['entitlements', { page, limit: DEFAULT_LIMIT, isActive: filter }],
  queryFn: () => listEntitlements({ page, limit: DEFAULT_LIMIT, entitlement: 'premium', is_active: filter }),
  staleTime: 30_000,
  placeholderData: keepPreviousData,
})
```

### 6.6 RevenuePage (`/revenue`)

```
+-------------------------------------------------------------------+
| Revenue                                                           |
|                                                                   |
| Overview (from RevenueCat)                                        |
| +------------+ +------------+ +------------+ +------------+       |
| |   MRR      | |   ARR      | | Active     | | Active     |       |
| | [icon]     | | [icon]     | | Subs       | | Trials     |       |
| |  $420.00   | | $5,040.00  | |    134     | |     12     |       |
| +------------+ +------------+ +------------+ +------------+       |
|                                                                   |
| Revenue Over Time                                                 |
| [30d] [90d] [1y] [All]                                          |
| +---------------------------------------------------------------+ |
| |                                                                | |
| |   ~~~area chart~~~                                             | |
| |                                                                | |
| +---------------------------------------------------------------+ |
|                                                                   |
| New Subscriptions Over Time                                       |
| [30d] [90d] [1y] [All]                                          |
| +---------------------------------------------------------------+ |
| |                                                                | |
| |   ~~~area chart~~~                                             | |
| |                                                                | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

**Data sources:**
- Overview cards: same `['rc-overview']` query as dashboard (shared cache)
- Revenue chart: `['rc-chart', 'revenue', range]` with `staleTime: 300_000`
- New customers chart: `['rc-chart', 'customers_new', range]` with `staleTime: 300_000`

Each chart has its own independent time range selector (default: `30d`). Changing one does not affect the other.

**Note:** The overview cards here are identical to those on the Dashboard. TanStack Query deduplicates the request automatically since they share the same query key.

---

## 7. Component Specifications

### 7.1 StatsCard

**Props:**
```ts
interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  formatAs?: 'number' | 'currency' | 'duration' | 'decimal';
  suffix?: string;
  isLoading?: boolean;
}
```

**Render:**
```
+---------------------------+
| [icon]                    |
| {label}                   |
| {formatted value}         |
+---------------------------+
```

- Container: `bg-surface-container rounded-xl p-5 border border-outline-variant/50`
- Icon: `w-5 h-5 text-on-surface-variant mb-2`
- Label: `text-sm text-on-surface-variant mb-1`
- Value: `text-2xl font-bold text-on-surface`
- Loading skeleton: `h-8 w-24 bg-surface-container-high rounded animate-pulse`

**Format logic:**
- `'number'` (default): `formatNumber(value)` → "1,234"
- `'currency'`: `formatCurrency(value)` → "$420.00" (input in cents)
- `'duration'`: `formatDuration(value)` → "1h 23m" (input in ms)
- `'decimal'`: `${value.toFixed(1)}${suffix ? ` ${suffix}` : ''}` (e.g., streak card passes `suffix="days"` → "4.2 days")

### 7.2 DataTable

**Props:**
```ts
interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination: { page: number; limit: number; total: number };
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onExportCSV?: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
}
```

**Structure:**
- Top bar: search input (left) + CSV export button (right) — only if respective props provided
- shadcn `Table` with `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- Table header: `bg-surface-container-high text-on-surface-variant text-xs font-semibold uppercase tracking-wider`
- Table rows: `border-b border-outline-variant/50 hover:bg-surface-container transition-colors cursor-pointer` (if `onRowClick`)
- Table cells: `text-sm text-on-surface py-3 px-4`
- Loading overlay: semi-transparent `bg-surface/60` with centered `LoadingSpinner`
- Empty state: `EmptyState` component spanning full table width
- Bottom: `PaginationControls`

### 7.3 TimeSeriesChart

**Props:**
```ts
interface TimeSeriesChartProps {
  data: Array<{ date: string; value: number }>;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  title: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  isLoading?: boolean;
  color?: string; // CSS color, defaults to primary
}
```

**Render:**
- Card container: `bg-surface-container rounded-xl p-5 border border-outline-variant/50`
- Title: `text-base font-semibold text-on-surface mb-1`
- Range selector below title: 4 buttons (`30d`, `90d`, `1y`, `All`)
  - Same segmented style as entitlements filter
- Chart area: Recharts `ResponsiveContainer` height 280px
  - `AreaChart` with single `Area`
  - `XAxis`: `dataKey="date"`, `tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }}`
    - Date formatting: For 30d show "Jan 1", for 90d show "Jan 1", for 1y show "Jan", for All show "2024"
    - Tick formatter implementation:
      ```ts
      // XAxis tick formatter — used as tickFormatter prop
      function formatXAxisDate(dateStr: string, range: TimeRange): string {
        const d = new Date(dateStr);
        if (range === 'all') return d.getFullYear().toString();
        if (range === '1y') return d.toLocaleDateString('en-US', { month: 'short' });
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      ```
  - `YAxis`: same tick style, formatter from prop
  - `CartesianGrid`: `stroke="var(--color-outline-variant)"`, `strokeDasharray="3 3"`
  - `Area`: `type="monotone"`, `fill="color-mix(in srgb, var(--color-primary) 10%, transparent)"`, `stroke="var(--color-primary)"`, `strokeWidth={2}`
  - `Tooltip`: custom component with `bg-surface-container-high rounded-lg p-3 border border-outline-variant shadow-md`
    - Date in `text-xs text-on-surface-variant`
    - Value in `text-sm font-semibold text-on-surface`
- Loading: skeleton rectangle matching chart dimensions

### 7.4 StatusBadge

**Props:**
```ts
interface StatusBadgeProps {
  active: boolean;
}
```

**Render:**
- Active: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success` — text "Active"
- Inactive: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-on-surface-variant/10 text-on-surface-variant` — text "Inactive"

### 7.5 shadcn/ui Components to Install

Install these shadcn/ui components (via `npx shadcn@latest add <name>`):

> **Note:** Toast notifications use `sonner` directly (already in dependencies), not the shadcn toast component. Do not install the shadcn `toast` component.

- `button` — Used everywhere for actions
- `input` — Login form, search bars
- `card` — Stats cards, page sections
- `table` — DataTable rendering
- `badge` — StatusBadge base
- `dialog` — Confirmation dialogs (entitlement management)
- `skeleton` — Loading states
- `separator` — Sidebar dividers
- `tooltip` — Icon button hover hints

After installation, add CSS variable aliases in `src/index.css` that map shadcn's default variable names (`--background`, `--foreground`, `--primary`, `--primary-foreground`, etc.) to Pauza's color system variables. For example:
```css
:root {
  --background: var(--color-surface);
  --foreground: var(--color-on-surface);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-on-primary);
  --muted: var(--color-surface-container);
  --muted-foreground: var(--color-on-surface-variant);
  --border: var(--color-outline-variant);
  --input: var(--color-outline-variant);
  --ring: var(--color-primary);
  --destructive: var(--color-error);
  --destructive-foreground: var(--color-on-error);
}
```
This avoids editing individual shadcn component files while ensuring they use the Pauza color system.

### 7.6 LoadingSpinner

**Props:** `{ size?: 'sm' | 'md' | 'lg' }` — defaults to `'md'`

**Render:** An animated spinner using `Loader2` icon from lucide-react with `animate-spin` class.
- `sm`: `w-4 h-4`
- `md`: `w-6 h-6`
- `lg`: `w-8 h-8`
- Color: `text-primary`

### 7.7 ErrorAlert

**Props:** `{ message: string; onRetry?: () => void }`

**Render:**
- Container: `bg-error-container rounded-lg p-4 flex items-center gap-3`
- `AlertTriangle` icon: `w-5 h-5 text-on-error-container`
- Message: `text-sm text-on-error-container flex-1`
- Retry button (if `onRetry`): `text-sm font-medium text-on-error-container underline hover:no-underline`

### 7.8 EmptyState

**Props:** `{ icon: LucideIcon; title: string; description?: string }`

**Render:**
- Centered container: `flex flex-col items-center justify-center py-12`
- Icon: `w-12 h-12 text-on-surface-variant/40 mb-4`
- Title: `text-base font-medium text-on-surface-variant mb-1`
- Description: `text-sm text-on-surface-variant/70`

### 7.9 PaginationControls

**Props:**
```ts
interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}
```

**Render:**
```
Showing 1-20 of 150                    [< Prev]  Page 1 of 8  [Next >]
```

- Left text: `text-sm text-on-surface-variant`
- Buttons: shadcn `Button` variant `outline`, size `sm`
- `ChevronLeft` / `ChevronRight` icons on buttons
- Page indicator: `text-sm text-on-surface`
- Previous disabled when `page === 1`, Next disabled when `page * limit >= total`

---

## 8. State Management

### 8.1 Auth Context

**File:** `src/features/auth/AuthProvider.tsx`

```ts
interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**Implementation:**
- On mount: read `admin_token` from `localStorage`
- `login()`: call `POST /api/v1/admin/login`, store token in state + `localStorage`
- `logout()`: clear token from state + `localStorage`, redirect via `window.location.href = '/login'` (not `useNavigate`, since AuthProvider is outside RouterProvider)
- Expose via `useAuth()` hook

**RequireAuth** (`src/features/auth/RequireAuth.tsx`):
- Reads `isAuthenticated` from `useAuth()`
- If false: `<Navigate to="/login" replace />`
- If true: render `children`

### 8.2 TanStack Query Configuration

**In `src/main.tsx`:**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 300_000, // 5 min — evict unused query cache entries
    },
  },
});
```

### 8.3 Query Key Conventions

| Query Key                                        | Endpoint                              | staleTime |
| ------------------------------------------------ | ------------------------------------- | --------- |
| `['stats']`                                      | `GET /admin/stats`                    | 60s       |
| `['users', { page, limit, search }]`             | `GET /admin/users`                    | 30s       |
| `['user', id]`                                   | `GET /admin/users/:id`                | 30s       |
| `['entitlements', { page, limit, isActive }]`    | `GET /admin/entitlements`             | 30s       |
| `['user-growth', range]`                         | `GET /admin/stats/user-growth`        | 120s      |
| `['active-users', range]`                        | `GET /admin/stats/active-users`       | 120s      |
| `['rc-overview']`                                | `GET /admin/revenuecat/overview`      | 300s      |
| `['rc-chart', chartName, range]`                 | `GET /admin/revenuecat/charts/:name`  | 300s      |
| `['rc-subscriber', userId]`                      | `GET /admin/users/:id/revenuecat`     | 60s       |

### 8.4 Mutations

| Mutation                  | Endpoint                                  | onSuccess Invalidations                      |
| ------------------------- | ----------------------------------------- | -------------------------------------------- |
| `manageEntitlement`       | `POST /admin/users/:id/entitlements`      | `['user', id]`, `['entitlements']`, `['stats']` |

---

## 9. API Integration

### 9.1 API Client (`src/api/client.ts`)

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let redirecting = false;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('admin_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    if (!redirecting) {
      redirecting = true;
      window.location.href = '/login';
    }
    throw new ApiError('UNAUTHORIZED', 'Session expired');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.message ?? 'An unexpected error occurred',
      body?.error?.details?.fields,
    );
  }

  return res.json();
}
```

### 9.2 Endpoint Functions

**`src/api/endpoints/auth.ts`:**
```ts
export function login(username: string, password: string) {
  return apiFetch<{ access_token: string }>('/api/v1/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
```

**`src/api/endpoints/users.ts`:**
```ts
export function listUsers(params: { page: number; limit: number; search?: string }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.search) qs.set('search', params.search);
  return apiFetch<ListUsersResponse>(`/api/v1/admin/users?${qs}`);
}

export function getUserDetail(id: string) {
  return apiFetch<UserDetail>(`/api/v1/admin/users/${encodeURIComponent(id)}`);
}
```

**`src/api/endpoints/stats.ts`:**
```ts
export function getPlatformStats() {
  return apiFetch<PlatformStats>('/api/v1/admin/stats');
}
```

**`src/api/endpoints/entitlements.ts`:**
```ts
export function listEntitlements(params: {
  page: number;
  limit: number;
  entitlement?: string;
  is_active?: boolean;
}) {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.entitlement) qs.set('entitlement', params.entitlement);
  if (params.is_active !== undefined) {
    qs.set('is_active', String(params.is_active));
  }
  return apiFetch<ListEntitlementsResponse>(`/api/v1/admin/entitlements?${qs}`);
}

export function manageEntitlement(
  userId: string,
  params: { action: 'grant' | 'revoke'; entitlement: string; expires_at?: string },
) {
  return apiFetch<{ message: string }>(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/entitlements`,
    { method: 'POST', body: JSON.stringify(params) },
  );
}
```

**`src/api/endpoints/timeseries.ts`:**
```ts
import type { TimeRange } from '../../lib/constants';
import type { TimeSeriesResponse } from '../../types/stats';

export function getUserGrowth(range: TimeRange) {
  return apiFetch<TimeSeriesResponse>(`/api/v1/admin/stats/user-growth?range=${range}`);
}

export function getActiveUsers(range: TimeRange) {
  return apiFetch<TimeSeriesResponse>(`/api/v1/admin/stats/active-users?range=${range}`);
}
```

> **Note:** `TimeRange` is defined in `src/lib/constants.ts` (the canonical location). The backend auto-selects `granularity` based on `range`, so the frontend does not send it. Mapping: `30d` → `day`, `90d` → `week`, `1y` → `month`, `all` → `month`. Invalid explicit granularity values return 422.

**`src/api/endpoints/revenuecat.ts`:**
```ts
import type { TimeRange } from '../../lib/constants';
import type { RCOverview, RCChartResponse, RCSubscriberDetail } from '../../types/revenuecat';

export function getRCOverview() {
  return apiFetch<RCOverview>('/api/v1/admin/revenuecat/overview');
}

export function getRCChart(chartName: string, range: TimeRange) {
  return apiFetch<RCChartResponse>(
    `/api/v1/admin/revenuecat/charts/${encodeURIComponent(chartName)}?range=${range}`,
  );
}

export function getRCSubscriber(userId: string) {
  return apiFetch<RCSubscriberDetail>(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/revenuecat`,
  );
}
```

---

## 10. CSV Export

### 10.1 Utility (`src/lib/csv.ts`)

```ts
import Papa from 'papaparse';

export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
```

### 10.2 Fetch-All Pattern (`src/lib/csv.ts`)

Defined in `src/lib/csv.ts` alongside `downloadCSV`. Used in both UsersListPage and EntitlementsListPage for CSV export.

```ts
async function fetchAllPages<TResponse, TItem>(
  fetchPage: (page: number) => Promise<TResponse>,
  extract: (response: TResponse) => { items: TItem[]; total: number },
): Promise<TItem[]> {
  const LIMIT = 100;
  const firstPage = await fetchPage(1);
  const { items, total } = extract(firstPage);
  const allData = [...items];
  const totalPages = Math.ceil(total / LIMIT);

  for (let page = 2; page <= totalPages; page++) {
    const result = await fetchPage(page);
    allData.push(...extract(result).items);
  }

  return allData;
}
```

**Call site examples:**
```ts
// UsersListPage
const users = await fetchAllPages(
  (page) => listUsers({ page, limit: 100 }),
  (r) => ({ items: r.users, total: r.pagination.total }),
);

// EntitlementsListPage
const entitlements = await fetchAllPages(
  (page) => listEntitlements({ page, limit: 100, entitlement: 'premium' }),
  (r) => ({ items: r.entitlements, total: r.pagination.total }),
);
```

The "Export CSV" button calls `fetchAllPages`, then calls `downloadCSV()`.

> **Note:** `fetchAllPages` fetches pages sequentially (not in parallel) to avoid overwhelming the backend. For large datasets this may feel slow — acceptable tradeoff for an admin tool with a loading spinner on the export button.

---

## 11. Error Handling

### 11.1 API Error Code → UI Treatment

| `error.code`            | HTTP | UI Treatment                                                   |
| ----------------------- | ---- | -------------------------------------------------------------- |
| `UNAUTHORIZED`          | 401  | Auto-redirect to `/login` (handled in `client.ts`)             |
| `FORBIDDEN`             | 403  | Inline `ErrorAlert`: "You don't have permission"               |
| `NOT_FOUND`             | 404  | Navigate to parent list + error toast (e.g., `/users` + "User not found") |
| `VALIDATION_ERROR`      | 422  | Per-field errors below inputs (login), or toast for actions     |
| `RATE_LIMITED`           | 429  | Toast: "Too many requests. Please try again shortly."          |
| `CONFLICT`              | 409  | Toast with specific conflict message from API                  |
| `INTERNAL_ERROR`        | 500  | Inline `ErrorAlert`: "Something went wrong. Please try again." |
| Network failure         | —    | Banner: "Unable to reach the server. Check your connection."   |

### 11.2 Toast Notifications

Use `sonner` (recommended shadcn toast integration):
- Success: green accent, auto-dismiss after 3 seconds
- Error: red accent, auto-dismiss after 5 seconds
- Positioned: top-right

### 11.3 Page-Level Error Boundaries

Each page wraps query-dependent content in a React error boundary (using TanStack Query's `QueryErrorResetBoundary`):
- On error: render `ErrorAlert` with "Something went wrong" + "Retry" button
- Retry calls `reset()` from the boundary to refetch

---

## 12. TypeScript Types

### 12.1 Shared API Types (`src/types/api.ts`)

```ts
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: {
      fields: Record<string, string>;
    };
  };
}
```

### 12.2 User Types (`src/types/user.ts`)

```ts
import type { PaginationResponse } from './api';

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  username: string;
  profile_picture_url: string | null;
  premium_entitlement_active: boolean;
  created_at: string; // RFC 3339
}

export interface ListUsersResponse {
  users: UserListItem[];
  pagination: PaginationResponse;
}

export interface UserDetail {
  id: string;
  email: string;
  name: string;
  username: string;
  profile_picture_url: string | null;
  leaderboard_visible: boolean;
  created_at: string; // RFC 3339
  is_premium: boolean;
  current_period_end: string | null; // RFC 3339
  revenuecat_app_user_id: string | null;
  friend_count: number;
  total_sessions: number;
  last_session_time: number | null; // epoch ms
}
```

### 12.3 Entitlement Types (`src/types/entitlement.ts`)

```ts
import type { PaginationResponse } from './api';

export interface EntitlementListItem {
  user_id: string;
  email: string;
  username: string;
  entitlement: string;
  is_active: boolean;
  current_period_end: string | null; // RFC 3339
  updated_at: string; // RFC 3339
}

export interface ListEntitlementsResponse {
  entitlements: EntitlementListItem[];
  pagination: PaginationResponse;
}

export interface ManageEntitlementRequest {
  action: 'grant' | 'revoke';
  entitlement: 'premium';
  expires_at?: string; // RFC 3339, must be in the future
}

export interface ManageEntitlementResponse {
  message: string;
}
```

### 12.4 Stats Types (`src/types/stats.ts`)

```ts
export interface PlatformStats {
  total_users: number;
  active_users_30d: number;
  users_with_premium_entitlement: number;
  total_friendships: number;
  avg_streak_days: number;
  avg_daily_focus_time_ms: number;
}

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface TimeSeriesResponse {
  data: TimeSeriesPoint[];
  granularity: 'day' | 'week' | 'month';
}
```

### 12.5 RevenueCat Types (`src/types/revenuecat.ts`)

```ts
export interface RCOverview {
  mrr: number;              // cents (integer)
  arr: number;              // cents (integer)
  active_subscribers: number;
  active_trials: number;
}

export interface RCChartPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface RCChartResponse {
  name: string;
  data: RCChartPoint[];
}

export interface RCSubscriberEntitlement {
  entitlement_id: string;
  is_active: boolean;
  product_identifier: string;
  purchase_date: string; // RFC 3339 — always present (EntitlementObj.PurchaseDate is non-pointer in RC models)
  expires_date: string | null;  // RFC 3339 — null for lifetime entitlements
  grace_period_expires_date: string | null; // RFC 3339
}

export interface RCSubscriberDetail {
  app_user_id: string;
  entitlements: RCSubscriberEntitlement[];
}
```

---

## 13. Formatting Utilities (`src/lib/format.ts`)

```ts
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatRelativeTime(isoOrEpochMs: string | number): string {
  const date = typeof isoOrEpochMs === 'number'
    ? new Date(isoOrEpochMs)
    : new Date(isoOrEpochMs);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date.toISOString());
}
```

---

## 14. Constants (`src/lib/constants.ts`)

```ts
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const EXPORT_LIMIT = 100;
export const SEARCH_DEBOUNCE_MS = 300;

export const TIME_RANGES = ['30d', '90d', '1y', 'all'] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '30d': '30 Days',
  '90d': '90 Days',
  '1y': '1 Year',
  all: 'All Time',
};
```

---

## 15. Debounce Hook (`src/hooks/useDebouncedValue.ts`)

```ts
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

---

## 16. Environment Variables

**`.env.development`:**
```
VITE_API_BASE_URL=http://localhost:8080
```

**`.env.production`:**
```
VITE_API_BASE_URL=https://api.pauza.dev
```

Access in code via `import.meta.env.VITE_API_BASE_URL`.

---

## 17. Entry Point (`src/main.tsx`)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthProvider';
import { Toaster } from 'sonner';
import { router } from './routes';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 300_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

> **Note:** `Toaster` is a sibling to `RouterProvider`, both inside `AuthProvider` but outside the router tree. This works because `sonner` manages its own DOM portal. Any toast calls (e.g., `toast.error` on user-not-found redirect in `UserDetailPage`) must fire **before** the navigation call, since the toast instance is independent of the router.

---

## 18. Vite Configuration (`vite.config.ts`)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
```

---

## 19. Package Dependencies

**dependencies:**
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.0.0",
  "@tanstack/react-query": "^5.0.0",
  "recharts": "^2.15.0",
  "papaparse": "^5.4.0",
  "lucide-react": "^0.460.0",
  "sonner": "^1.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.6.0"
}
```

**devDependencies:**
```json
{
  "typescript": "^5.7.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "@types/papaparse": "^5.3.0",
  "@vitejs/plugin-react": "^4.3.0",
  "vite": "^6.0.0",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.0.0",
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "eslint-plugin-react-hooks": "^5.0.0"
}
```

> **Note:** Tailwind v4 with `@tailwindcss/vite` handles PostCSS and autoprefixer internally — no separate `postcss` or `autoprefixer` packages needed.

---

## 20. Development Workflow

```bash
# Initial setup
pnpm create vite pauza-admin-panel --template react-ts
cd pauza-admin-panel
pnpm install

# Add dependencies
pnpm add react-router-dom @tanstack/react-query recharts papaparse lucide-react sonner clsx tailwind-merge
pnpm add -D @types/papaparse tailwindcss @tailwindcss/vite eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input card table badge dialog skeleton separator tooltip

# Type-check and lint
pnpm tsc --noEmit           # type-check entire project
pnpm eslint src/ --ext .ts,.tsx   # lint — must pass with zero errors

# Start dev server
pnpm dev
```

---

## 21. Verification Checklist

After implementation, verify:

1. **Login flow:** Login with valid credentials → token stored → redirect to dashboard. Invalid credentials → error shown. Expired token → auto-redirect to login.
2. **Dashboard:** All 10 stats cards load and display formatted values. Charts render with correct data. Time range selector changes chart data.
3. **Users list:** Search filters results (debounced). Pagination works. CSV export downloads all users. Row click navigates to detail.
4. **User detail:** All fields displayed correctly. Grant/revoke premium works. Success toast shown. RevenueCat section loads when applicable.
5. **Entitlements list:** Filter by active/inactive works. Pagination works. CSV export works. Row click navigates to user detail.
6. **Revenue page:** RC overview cards show formatted currency. Revenue and new subs charts render.
7. **Dark mode:** Toggle switches all colors correctly. Preference persists across page reloads.
8. **Error handling:** 401 redirects to login. 429 shows toast. 500 shows error alert with retry. Network failure shows connection banner.
9. **Type safety:** `pnpm tsc --noEmit` passes with zero errors. `pnpm eslint src/` passes with zero errors. No `any` types anywhere in the codebase.
