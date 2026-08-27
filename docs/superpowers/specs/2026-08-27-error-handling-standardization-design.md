# Error Handling Standardization

## Problem

Server actions return generic error messages ("Error inesperado", "Something went wrong", hardcoded Spanish strings) regardless of the actual backend error. Error maps exist in `src/errors/` with user-friendly Spanish messages but are rarely consulted. Users see unhelpful messages that don't tell them what went wrong or what to do.

## Design Decisions

- **Matching happens on the client** — server actions return raw `{ success, status, detail }` from the backend. Components pass `{ status, detail }` to `useApiErrorHandler` which resolves the friendly message via error maps.
- **Direct service calls stay as-is** — components calling services directly (e.g. `AutorizacionesView.tsx`) keep their try-catch pattern but standardize error extraction using `isAPIErrorType`.
- **Login action stays special** — no `serverAction()` wrapper (pre-auth), but standardized to return `{ success: false, status, detail }`. Component delegates to `handleApiError(['auth'])`.
- **ErrorCard for dashboards** — `HomeDashboard` and `HomeAdminDashboard` keep the ErrorCard pattern (persistent, with retry) but resolve friendly messages from error maps before displaying.
- **Fallback unchanged** — `useApiErrorHandler` keeps its generic "Error inesperado" fallback for unmapped errors (infra 500s). With complete maps, only genuinely unexpected errors hit this.

## Changes

### 1. Server Actions — Standardize Error Shape

All actions return `{ success: false, status: number, detail: string }` on error.

**Files:**

| File | Change |
|------|--------|
| `src/actions/auth/login.ts` | Standardize catch to always return `{ success: false, status, detail }` |
| `src/helpers/handleUserAction.ts` | Change `message: error.detail \|\| errorMessage` → `detail: error.detail \|\| 'Unknown error'` |
| `src/actions/balance/createTransaction.ts` | Change `message:` → `detail:`, remove hardcoded Spanish string |
| `src/actions/balance/getBalanceMetrics.ts` | Change `message:` → `detail:`, remove hardcoded Spanish string |
| `src/actions/balance/getTransactionsCount.ts` | Change `message:` → `detail:`, remove hardcoded Spanish string |
| `src/actions/users/deleteUser.ts` | Already returns `detail` — clean up fallback strings |
| `src/actions/users/updateUserRole.ts` | Already returns `detail` — clean up fallback strings |

### 2. Error Maps — Complete Coverage

All backend error responses mapped to user-friendly Spanish messages.

**`src/errors/auth.ts`** — add:

```typescript
USER_NOT_FOUND: {
  status: 404,
  backendDetail: 'User not found',
  title: 'Credenciales inválidas',
  message: 'El usuario o la contraseña son incorrectos.',
}
```

**`src/errors/balance.ts`** — add 7 entries, fix 1:

```typescript
// FIX: change backendDetail → backendDetailStartsWith (dynamic reference in string)
TRANSACTION_NOT_FOUND: {
  status: 404,
  backendDetailStartsWith: 'Transaction with reference',
  title: 'Transacción no encontrada',
  message: 'No se encontró la transacción especificada.',
}

// NEW entries:
INVALID_TRANSACTION_TYPE: {
  status: 400,
  backendDetail: 'Invalid transaction type',
  title: 'Tipo de transacción inválido',
  message: 'El tipo de transacción proporcionado no es válido.',
}
INVALID_PAYMENT_METHOD: {
  status: 400,
  backendDetail: 'Invalid payment method',
  title: 'Método de pago inválido',
  message: 'El método de pago proporcionado no es válido.',
}
DESCRIPTION_TOO_LONG: {
  status: 400,
  backendDetail: 'Description must be 255 characters or fewer',
  title: 'Descripción muy larga',
  message: 'La descripción no puede superar los 255 caracteres.',
}
DELETE_NOT_REJECTED: {
  status: 403,
  backendDetail: 'Admins can only delete REJECTED transactions',
  title: 'Acción no permitida',
  message: 'Solo se pueden eliminar transacciones rechazadas.',
}
EDIT_NOT_REJECTED: {
  status: 403,
  backendDetail: 'Admins can only edit REJECTED transactions',
  title: 'Acción no permitida',
  message: 'Solo se pueden editar transacciones rechazadas.',
}
AUTHORIZE_STATUS_FORBIDDEN: {
  status: 403,
  backendDetail: 'Admins can only set transaction status to PENDING',
  title: 'Acción no permitida',
  message: 'Solo puedes cambiar el estado de la transacción a pendiente.',
}
RESUBMIT_NOT_REJECTED: {
  status: 422,
  backendDetail: 'Admins can only re-submit REJECTED transactions to PENDING',
  title: 'Acción no permitida',
  message: 'Solo se pueden reenviar transacciones rechazadas a estado pendiente.',
}
```

**`src/errors/user.ts`** — already complete, no changes needed.

### 3. Components — Delegate to `handleApiError`

| Component | Change |
|-----------|--------|
| `src/components/auth/AuthLogin.tsx` | Remove manual `if (status === 401 \|\| 404)`. Pass everything to `handleApiError({ status, detail }, ['auth'])` |
| `src/components/users/UserForm.tsx` | Change `result.message` → `result.detail` |
| `src/components/balance/transactions/TransactionForm.tsx` (create) | Change `result.message` → `result.detail`, pass to `handleApiError(['balance', 'common'])` |
| `src/components/balance/transactions/TransactionForm.tsx` (edit catches) | Use `isAPIErrorType(err)` instead of `err as { status_code?: number }` |
| `src/components/balance/transactions/TransactionDetailSheet.tsx` | Use `isAPIErrorType(err)` instead of manual cast |
| `src/components/balance/autorizaciones/AutorizacionesView.tsx` | Use `isAPIErrorType(err)` in all catch blocks |
| `src/components/home/HomeDashboard.tsx` | Resolve friendly message from error maps before passing to ErrorCard |
| `src/components/home/HomeAdminDashboard.tsx` | Resolve friendly message from error maps before passing to ErrorCard |

### 4. `useApiErrorHandler` — Extract `findErrorMessage`

Fallback stays as "Error inesperado". The hook benefits from complete error maps without code changes to its matching logic.

**One structural change**: Extract `findErrorMessage` from the hook into a standalone pure function (e.g. `src/errors/findErrorMessage.ts`). This lets `HomeDashboard` and `HomeAdminDashboard` resolve friendly messages for their ErrorCard without going through the hook (which would trigger a toast). The hook itself imports and reuses this extracted function — no duplication.

### 5. Type Updates

`HandleUserActionResult` in `handleUserAction.ts` changes its `message?` field to `detail?` to match the standardized shape. Components consuming this result update accordingly.

## Backend Error Reference

### Auth (POST /pegazzo/internal/auth/login)

| Status | Detail | Frontend Message |
|--------|--------|-----------------|
| 401 | "Invalid credentials" | "El usuario o la contraseña son incorrectos." |
| 404 | "User not found" | "El usuario o la contraseña son incorrectos." |
| 500 | Various infra errors | "Error inesperado" (fallback) |

### Users (/pegazzo/internal/user/*)

| Status | Detail | Frontend Message |
|--------|--------|-----------------|
| 400 | "Username already exists" | "El nombre de usuario ya está registrado." |
| 400 | "Invalid role provided" | "El rol proporcionado no es válido." |
| 401 | "Invalid credentials" | "La contraseña proporcionada es incorrecta." |
| 403 | "Forbidden role provided" | "No tienes permisos para asignar este rol." |
| 404 | "User not found" | "No se encontró un usuario con el nombre proporcionado." |
| 404 | "Role not found" | "El rol especificado no existe en el sistema." |

### Balance (/pegazzo/management/balance/*)

| Status | Detail | Frontend Message |
|--------|--------|-----------------|
| 400 | "Invalid transaction type" | "El tipo de transacción proporcionado no es válido." |
| 400 | "Invalid payment method" | "El método de pago proporcionado no es válido." |
| 400 | "Description must be 255 characters or fewer" | "La descripción no puede superar los 255 caracteres." |
| 403 | "Admins can only delete REJECTED transactions" | "Solo se pueden eliminar transacciones rechazadas." |
| 403 | "Admins can only edit REJECTED transactions" | "Solo se pueden editar transacciones rechazadas." |
| 403 | "Admins can only set transaction status to PENDING" | "Solo puedes cambiar el estado a pendiente." |
| 403 | "Forbidden" | "No tienes permiso para realizar esta acción." |
| 404 | "Transaction with reference '...' was not found" | "No se encontró la transacción especificada." |
| 422 | "Admins can only re-submit REJECTED transactions to PENDING" | "Solo se pueden reenviar transacciones rechazadas." |
