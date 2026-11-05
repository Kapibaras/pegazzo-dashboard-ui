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

| Context                               | Handler                                                  | Behavior                                                    |
| ------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------- |
| Server Actions                        | `serverAction()` wrapper (`src/helpers/serverAction.ts`) | Detects `SESSION_EXPIRED` → `redirect('/api/auth/signout')` |
| SSR layout (`(dashboard)/layout.tsx`) | try/catch around `getCachedUser`                         | Detects `SESSION_EXPIRED` → `redirect('/api/auth/signout')` |
| CSR (`SingletonAPIClient`)            | `useApiErrorHandler`                                     | On 401 → calls `logout()` + `router.push('/login')`         |

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

## Typography System (MANDATORY)

Single source of truth: `@utility typo-*` in `src/app/globals.css`. **Every piece of text in new or modified UI MUST use one of these tokens for size/weight/line-height.** Do not invent ad hoc text styles.

| Token                       | Size / weight           | Role                                                       |
| --------------------------- | ----------------------- | ---------------------------------------------------------- |
| `typo-title`                | 27px (31px `md+`) / 700 | Page `h1`                                                  |
| `typo-subtitle`             | 20px / 600              | Section, card, dialog and sheet titles; main nav           |
| `typo-text`                 | 18px / 400              | Body text (also the `body` default)                        |
| `typo-bold-text`            | 18px / 600              | Emphasis, table headers, list/card item names              |
| `typo-sm-text`              | 16px / 400              | Secondary text, dense table cells, helper text             |
| `typo-label`                | 16px / 500              | Form labels, detail labels, tabs                           |
| `typo-button`               | 17px / 700              | Text of buttons (primary actions, dialogs, forms)          |
| `typo-nav` / `typo-nav-sub` | 22px / 600, 19px / 500  | Sidebar items and sub-items                                |
| `typo-caption`              | 14px / 400              | Hints, badges, small errors (**minimum allowed size**)     |
| `typo-overline`             | 14px / 600 uppercase    | Micro-labels (detail-sheet field names, calendar weekdays) |
| `typo-numbers`              | 18px / 500 mono         | Inline numeric values                                      |
| `typo-kpi` / `typo-kpi-sm`  | 35px / 27px, 600 mono   | Headline / secondary KPI figures                           |

Rules:

- **Forbidden** in feature components: `text-xs…text-9xl` (except decorative display text such as the 404), `text-[..px|rem]`, stacking a `typo-*` with a size/weight class, `font-bold`/`font-semibold`/`font-medium` as a substitute for a token (inline `font-semibold` emphasis on a `<span>` inside a sentence is the only exception), `font-mono` (use `font-numbers`).
- Colors: `text-carbon-500` primary, `text-carbon-300` secondary/muted (AA contrast). `text-carbon-200` only for placeholders, disabled state and decorative icons — **never** for informational text. `--muted-foreground` is mapped to `carbon-300`.
- Form controls (`Input`, `Textarea`, `SelectTrigger`) use `typo-text` at every breakpoint (no `md:` size override, which would clash with `fieldClass`); every form field must go through `fieldClass`/`TEXTAREA_CLASS`/`searchFieldClass` in `src/lib/formField.ts`. Labels use `typo-label text-carbon-500`.
- `src/components/ui/*` primitives already follow this scale; when adding a new shadcn component, align its text classes to it before using it.
- Missing a role? Add a new `@utility typo-*` in `globals.css` and document it in this table — don't use one-off classes.

## PR Conventions

- Branch must be rebased with `main` before merging.
- Ticket reference format: `PGZ-#`.
