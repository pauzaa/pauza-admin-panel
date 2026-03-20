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
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Architecture

React 19 + TypeScript 5 SPA with Vite 6, Tailwind CSS 4, shadcn/ui. Desktop-only admin panel (min-width 1024px) for managing the Pauza platform. Calls pauza-server API at `VITE_API_BASE_URL` (default: `http://localhost:8080`).

**Path alias**: `@/*` → `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`).

**Environment files**: `.env.development` (localhost:8080), `.env.production` (api.pauza.dev). Override locally via `.env.local` (gitignored).

### Routes

| Path | Page | Auth required |
|------|------|--------------|
| `/login` | LoginPage | No |
| `/` | DashboardPage | Yes |
| `/users` | UsersListPage | Yes |
| `/users/:id` | UserDetailPage | Yes |
| `/entitlements` | EntitlementsListPage | Yes |
| `/revenue` | RevenuePage | Yes |

Authenticated routes use `RequireAuth` guard and are wrapped in `AppLayout` (sidebar + topbar).

### Layering

- **Pages** (`src/features/`): Route-level components, data fetching via TanStack Query
- **Shared components** (`src/components/shared/`): Reusable UI (DataTable, StatsCard, TimeSeriesChart, etc.)
- **UI primitives** (`src/components/ui/`): shadcn/ui components built on `@base-ui/react` (not Radix) — do not edit directly
- **API layer** (`src/api/`): `client.ts` (fetch wrapper with auth) + per-domain endpoint functions in `endpoints/`
- **Types** (`src/types/`): API response interfaces matching backend JSON contracts
- **Utilities** (`src/lib/`): Formatters, CSV export, constants

### Key Patterns

- **Auth**: JWT stored in `localStorage` key `admin_token`. 401 responses auto-redirect to `/login` via `window.location.href`.
- **Data fetching**: TanStack Query v5 with typed query keys. QueryClient defaults: `staleTime` 30s, `gcTime` 300s, `retry` 1, `refetchOnWindowFocus` false. Per-query staleTime varies (30s lists, 60s stats, 300s revenue). See `specifications.md` §8.3 for query key conventions.
- **Theming**: Tailwind v4 uses CSS-first config — no `tailwind.config.ts`. All theme tokens are CSS variables in `src/index.css`. Class-based dark mode (`dark` on `<html>`, persisted in localStorage key `pauza-admin-theme`). Colors follow Material Design 3 naming (e.g., `surface`, `on-surface`, `primary`, `outline-variant`). Primary brand color: `#800020` (maroon/wine).
- **Strict TypeScript**: `strict: true`, `noUncheckedIndexedAccess`, no `any`. All API responses typed via interfaces in `src/types/`.

## Conventions

- Use `type` imports for types erased at runtime: `import type { ... }`
- Format numbers/dates via `src/lib/format.ts` utilities — never inline `Intl` calls
- CSV export uses `fetchAllPages` + `downloadCSV` from `src/lib/csv.ts`
- No `any` — use `unknown` and type guards for truly unknown types
- Do not put data-fetching logic in shared components — keep it in page-level components
- shadcn/ui components in `src/components/ui/` should not be edited; override via CSS variable aliases in `src/index.css`
- Toast notifications use `sonner` (not shadcn toast) — import `toast` from `sonner` directly
- Icons use `lucide-react`, charts use `recharts`

## Best Practices

### TypeScript
- All component props must be defined as `interface`, not `type`
- All `useQuery`/`useMutation` calls must use explicit generics or typed `queryFn` return types
- Use discriminated unions for state where appropriate (e.g., `{ status: 'loading' } | { status: 'error'; error: Error }`)
- Prefer narrowing with type guards over type assertions — never use `as` to silence errors
- API response types in `src/types/` must match the backend JSON contracts exactly (snake_case field names)
- Use `satisfies` over `as` when you need to validate a value conforms to a type while preserving the narrower inferred type
- Prefer `readonly` arrays/tuples for data that shouldn't be mutated (e.g., query keys, constant configs)
- Use `Record<string, never>` for empty objects, not `{}`
- Derive types from data when possible (e.g., `typeof ROUTES[number]`) rather than duplicating

### React
- Prefer function declarations (`function Component()`) over arrow function components for top-level components
- Use early returns for guard clauses (loading, error, empty states) at the top of render — avoid deeply nested ternaries
- Never define components inside other components — extract them to separate files or at least to module scope
- Derive state: if a value can be computed from props or other state, compute it inline — do not duplicate it with `useState`
- Use `useCallback` only when passing callbacks to memoized children or as deps of other hooks — not by default
- Use `useMemo` only for genuinely expensive computations — simple filtering/mapping of small arrays does not need it
- Avoid `useEffect` for data transformation — compute derived values in the render body
- Event handlers should be named `handle{Event}` (e.g., `handleClick`, `handleSubmit`, `handleSearchChange`)
- Prefer controlled components for form inputs in this project

### Component Structure
- One component per file; file name matches the component name (PascalCase)
- Named exports only — no default exports
- Props interface directly above the component, named `{ComponentName}Props`
- Keep components focused: if a component grows beyond ~150 lines, split it
- Order within a component file: imports → interface → component → helpers (if any, prefer moving to separate file)

### Styling (Tailwind CSS 4)
- Use Tailwind utility classes — no inline `style` attributes, no CSS modules
- Use the Pauza color tokens (`bg-surface`, `text-on-surface`, `border-outline-variant`, etc.) — never use raw hex or Tailwind palette colors (`bg-red-500`)
- Dark mode is handled automatically via CSS variables; do not add `dark:` variant classes
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- Prefer Tailwind's built-in spacing scale — avoid arbitrary values (`w-[137px]`) unless matching a design spec exactly
- Group related utilities logically: layout → sizing → spacing → typography → colors → effects (e.g., `flex items-center gap-3 px-4 py-2 text-sm font-medium text-on-surface bg-surface rounded-lg shadow-sm`)
- Use semantic token names that describe purpose, not appearance — `text-error` not `text-red-600`
- Avoid `@apply` in component-level CSS — use Tailwind utilities directly in JSX

### Data Fetching (TanStack Query v5)
- All API calls go through `src/api/client.ts` — never call `fetch` directly in components
- Query keys must be structured arrays: `['entity', params]` (e.g., `['users', { page, search }]`)
- Use `keepPreviousData` for paginated queries to prevent flash on page change
- `staleTime` must be set per query (30s for lists, 60s for stats, 300s for revenue data)
- Mutations should invalidate relevant query keys on success via `queryClient.invalidateQueries`
- Use `enabled` option to conditionally disable queries (e.g., don't fetch user detail until id is defined)
- Prefer `select` option for transforming query data over transforming in the component
- Do not destructure `useQuery` result beyond `{ data, isLoading, error }` unless needed — keep it simple

### Error Handling
- API errors are mapped to typed error objects in `client.ts` — components receive structured errors
- Use `ErrorAlert` component for displaying query errors — do not build custom error UI per page
- 401 errors auto-redirect to `/login` — do not handle auth expiry in individual components
- Use optional chaining (`?.`) for accessing nested data that might be undefined — especially with `noUncheckedIndexedAccess`
- Never silently swallow errors with empty catch blocks — at minimum log to console in development

### Performance
- Do not prematurely optimize — profile first, then optimize
- Avoid creating new object/array references in render (e.g., `style={{ color: 'red' }}` or `options={[1,2,3]}`) when passed as props to memoized children
- Use `React.lazy` + `Suspense` for route-level code splitting if bundle size becomes a concern
- Images: always include `width`/`height` or use aspect-ratio to prevent layout shift; use `loading="lazy"` for below-fold images

### File Organization
- API endpoint functions: one file per domain in `src/api/endpoints/` (e.g., `users.ts`, `stats.ts`)
- Types: one file per domain in `src/types/` — shared types (pagination, error) go in `api.ts`
- Hooks: generic reusable hooks in `src/hooks/`, feature-specific hooks stay in their feature folder
- Never import from one feature folder into another — shared code goes in `components/shared/`, `hooks/`, or `lib/`
- Barrel exports (`index.ts`) are not used in this project — import from the specific file directly
- Keep imports ordered: external packages → `@/` aliased imports → relative imports, with a blank line between groups

### Git & Workflow
- Keep commits small and focused — one logical change per commit
- Run `pnpm tsc --noEmit` before committing to catch type errors
- Run `pnpm build` to verify production builds succeed — Vite tree-shaking can surface issues not caught by tsc
- Do not commit `.env.local` or any file containing secrets

## Frontend Development

- When creating new pages or UI components, always use the `/frontend-design` skill to generate production-grade interfaces.

## Reference Documentation

- `specifications.md` — complete frontend specification (UI, components, data flow, types)
- `../pauza-server/docs/ENDPOINTS.md` — source of truth for all backend API endpoints
