# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pegazzo Dashboard UI — a Next.js 15 (App Router) management dashboard for a fleet vehicle management company. Communicates with a backend monolith API. The entire UI is in **Spanish**.

## Commands

```bash
npm run dev       # Dev server (Turbopack)
npm run build     # Production build
npm run lint      # ESLint
npm run format    # Prettier
```

No test runner is configured.

## Architecture

### Layers (request flow)

1. **Pages** (`src/app/`) — Next.js App Router, file-system routing. Route group `(dashboard)` wraps authenticated pages with sidebar + header layout.
2. **Server Actions** (`src/actions/`) — `'use server'` functions. Validate with Zod → instantiate `ScopedAPIClient` → call service → return `{ success, message, data, errors }` → `revalidatePath()`/`revalidateTag()`.
3. **Services** (`src/services/`) — Classes extending `AbstractAPIService`. Receive an `APIClientBase` via constructor. Encapsulate API endpoint calls.
4. **API Clients** (`src/api/clients/`) — `ScopedAPIClient` (SSR, per-request with forwarded cookies) and `SingletonAPIClient` (CSR, browser singleton). Both wrap axios with typed HTTP methods.

### Auth

Dual session: backend httpOnly cookies (`access_token`, `refresh_token`, CSRF tokens) + a Next.js `session` JWT (signed with `NEXT_SESSION_SECRET`, 1h expiry). Middleware (`src/middleware.ts`) verifies the session JWT on all non-public routes; unauthenticated → redirect to `/login`. 401 responses trigger automatic token refresh via interceptor in `AbstractAPIService`.

### Key Patterns

- **Forms**: `react-hook-form` + Zod schemas (`src/lib/schemas/`) + shadcn/ui `Form` components. Submit converts to `FormData` and calls a Server Action.
- **Error handling**: Domain error maps in `src/errors/` keyed by HTTP status + backend `detail`. `useApiErrorHandler` hook maps errors to `ToastService` (sonner) notifications.
- **Role-based access**: Three roles — `propietario`, `administrador`, `empleado`. Navigation routes in `src/data/navigation.ts` define `allowed: Role[]` arrays.
- **State**: No global state library. `UserProvider` context for current user; local `useState` otherwise. `@tanstack/react-table` for table state.
- **API endpoints**: All target `/internal/*` paths on the backend.

### Session Expiration & Auth Error Handling

Token refresh is handled automatically by `AbstractAPIService` (Axios response interceptor). If refresh fails, it throws `APIRequestFailed('Session expired', 401, 'SESSION_EXPIRED')`. Session expiration is handled in one place per context — **never add per-action 401 checks**:

| Context | Handler | Behavior |
|---|---|---|
| Server Actions | `serverAction()` wrapper (`src/helpers/serverAction.ts`) | Detects `SESSION_EXPIRED` → `redirect('/api/auth/signout')` |
| SSR layout (`(dashboard)/layout.tsx`) | try/catch around `getCachedUser` | Detects `SESSION_EXPIRED` → `redirect('/api/auth/signout')` |
| CSR (`SingletonAPIClient`) | `useApiErrorHandler` | On 401 → calls `logout()` + `router.push('/login')` |

**Every new server action must use the `serverAction` wrapper:**

```typescript
export default async function myAction(input: MyInput) {
  return serverAction(
    async () => {
      const cookies = await getCookiesServer();
      const result = await new MyService(new ScopedAPIClient(cookies)).doSomething(input);
      return { success: true as const, data: result };
    },
    (error) => ({
      success: false as const,
      status: isAPIErrorType(error) ? error.status_code : 500,
      message: isAPIErrorType(error) ? error.detail : 'Error inesperado.',
    }),
  );
}
```

`/api/auth/signout` (Route Handler) clears the `session` cookie and redirects to `/login`. 401s from forbidden resource access (non-session errors) are **not** caught by the wrapper and propagate normally to the client.

### Environment Variables

```bash
MONOLITH_API_BASE_URL=   # Backend API (default: http://localhost:8000), accessed as ${URL}/pegazzo
NEXT_SESSION_SECRET=     # Secret for session JWT signing/verification
NODE_ENV=development
```

## Code Conventions

- **Arrow-function components** (enforced by ESLint).
- `'use client'` / `'use server'` directives explicit; Server Components by default.
- Path alias `@/` → `src/`.
- Single quotes, semicolons, camelCase (all ESLint-enforced).
- `no-console` — only `console.warn` and `console.error` allowed.
- `cn()` from `src/lib/utils.ts` for conditional Tailwind class merging.
- shadcn/ui primitives live in `src/components/ui/` (style: `new-york`, icons: `lucide-react`).
- Feature components in `src/components/<feature>/`, common layout in `src/components/common/`.
- Each feature directory re-exports via `index.ts`.
- Prettier: `printWidth: 120`, `singleQuote: true`, `semi: true`, `prettier-plugin-tailwindcss`.

## PR Conventions

- Branch must be rebased with `main` before merging.
- Ticket reference format: `PGZ-#`.
