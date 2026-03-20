# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Install dependencies
pnpm install

# Start dev server (requires backend running on localhost:8080)
pnpm dev                    # http://localhost:5173

# Type-check
pnpm tsc --noEmit

# Lint
pnpm eslint src/ --ext .ts,.tsx

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Architecture

React 19 + TypeScript 5 SPA with Vite 6, Tailwind CSS 4, shadcn/ui. Desktop-only admin panel (min-width 1024px) for managing the Pauza platform. Calls pauza-server API at `VITE_API_BASE_URL` (default: `http://localhost:8080`).

### Layering

- **Pages** (`src/features/`): Route-level components, data fetching via TanStack Query
- **Shared components** (`src/components/shared/`): Reusable UI (DataTable, StatsCard, TimeSeriesChart, etc.)
- **UI primitives** (`src/components/ui/`): shadcn/ui components — do not edit directly
- **API layer** (`src/api/`): `client.ts` (fetch wrapper with auth) + per-domain endpoint functions in `endpoints/`
- **Types** (`src/types/`): API response interfaces matching backend JSON contracts
- **Utilities** (`src/lib/`): Formatters, CSV export, constants

### Key Patterns

- **Auth**: JWT stored in `localStorage` key `admin_token`. 401 responses auto-redirect to `/login` via `window.location.href`.
- **Data fetching**: TanStack Query v5 with typed query keys. `staleTime` varies by endpoint (30s–300s). See `specifications.md` §8.3 for query key conventions.
- **Theming**: CSS variables in `src/index.css`, class-based dark mode (`dark` on `<html>`). Colors follow Material Design 3 naming (e.g., `surface`, `on-surface`, `primary`, `outline-variant`).
- **Strict TypeScript**: `strict: true`, `noUncheckedIndexedAccess`, no `any`. All API responses typed via interfaces in `src/types/`.

## Conventions

- Use `type` imports for types erased at runtime: `import type { ... }`
- Format numbers/dates via `src/lib/format.ts` utilities — never inline `Intl` calls
- CSV export uses `fetchAllPages` + `downloadCSV` from `src/lib/csv.ts`
- No `any` — use `unknown` and type guards for truly unknown types
- Do not put data-fetching logic in shared components — keep it in page-level components
- shadcn/ui components in `src/components/ui/` should not be edited; override via CSS variable aliases in `src/index.css`

## Reference Documentation

- `specifications.md` — complete frontend specification (UI, components, data flow, types)
- `../pauza-server/docs/ENDPOINTS.md` — source of truth for all backend API endpoints
