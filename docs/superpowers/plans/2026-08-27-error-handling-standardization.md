# Error Handling Standardization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize error handling so every backend error shows a user-friendly Spanish message via error maps, instead of generic fallbacks.

**Architecture:** Server actions return raw `{ success, status, detail }`. A pure `findErrorMessage()` function resolves friendly messages from error maps. Components delegate all error display to `handleApiError` (toasts) or `findErrorMessage` (ErrorCards). No test runner is configured — verification is manual via `npm run build` and `npm run lint`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, React, sonner (toasts)

## Global Constraints

- No test runner configured — verify with `npm run build` + `npm run lint` after each task
- All UI text in Spanish
- `no-console` ESLint rule — only `console.warn` and `console.error` allowed
- Arrow-function components, single quotes, semicolons (ESLint-enforced)
- `isAPIErrorType` uses duck typing (`'status_code' in error && 'detail' in error`), not `instanceof`
- Every server action that is NOT login must use the `serverAction()` wrapper

---

### Task 1: Extract `findErrorMessage` as standalone utility

**Files:**
- Create: `src/errors/findErrorMessage.ts`
- Modify: `src/hooks/errors/useApiErrorHandler.ts:24-43`

**Interfaces:**
- Consumes: `ERROR_MESSAGES` from `src/errors/index.ts`, `ErrorModules` type
- Produces: `findErrorMessage(error: { status: number; detail: string }, modules: ErrorModules[]) => { title: string; message: string }` — used by `useApiErrorHandler` hook and by Home dashboard components directly

- [ ] **Step 1: Create `src/errors/findErrorMessage.ts`**

```typescript
import { ERROR_MESSAGES } from '@/errors';

export type ErrorModules = keyof typeof ERROR_MESSAGES;

interface ErrorDefinition {
  status: number;
  title: string;
  message: string;
  backendDetail?: string;
  backendDetailStartsWith?: string;
}

interface ApiError {
  status: number;
  detail: string;
}

const findErrorMessage = (error: ApiError, modules: ErrorModules[]) => {
  for (const errorModule of modules) {
    const moduleErrors = ERROR_MESSAGES[errorModule];

    for (const err of Object.values(moduleErrors) as ErrorDefinition[]) {
      if (
        err.status === error.status &&
        (err.backendDetail === error.detail ||
          (err.backendDetailStartsWith && error.detail.startsWith(err.backendDetailStartsWith)))
      ) {
        return { title: err.title, message: err.message };
      }
    }
  }

  return {
    title: 'Error inesperado',
    message: 'Ocurrió un error desconocido. Inténtalo de nuevo más tarde.',
  };
};

export default findErrorMessage;
```

- [ ] **Step 2: Update `useApiErrorHandler` to import and reuse `findErrorMessage`**

Replace the entire `findErrorMessage` function and `ErrorDefinition`/`ApiError` interfaces inside the hook. The hook should import from the new file:

```typescript
import { useRouter } from 'next/navigation';
import { logout } from '@/actions/auth';
import { ToastService } from '@/services/toast';
import findErrorMessage, { type ErrorModules } from '@/errors/findErrorMessage';

export type { ErrorModules };

export const useApiErrorHandler = () => {
  const router = useRouter();

  const handleApiError = async (error: { status: number; detail: string }, modules: ErrorModules[] = ['common']) => {
    if (error.status === 401) {
      await logout();
      router.push('/login');
      return;
    }

    const { title, message } = findErrorMessage(error, modules);
    ToastService.error(title, message);
  };

  return { handleApiError };
};
```

- [ ] **Step 3: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: No errors. Existing behavior unchanged — same function, just extracted.

- [ ] **Step 4: Commit**

```bash
git add src/errors/findErrorMessage.ts src/hooks/errors/useApiErrorHandler.ts
git commit -m "refactor: extract findErrorMessage as standalone utility from useApiErrorHandler"
```

---

### Task 2: Complete error maps

**Files:**
- Modify: `src/errors/auth.ts`
- Modify: `src/errors/balance.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: Complete error map entries that `findErrorMessage` will match against. These entries must have `status`, `backendDetail` (or `backendDetailStartsWith`), `title`, and `message` fields.

- [ ] **Step 1: Add `USER_NOT_FOUND` to `src/errors/auth.ts`**

Add after the `ALREADY_LOGGED_OUT` entry:

```typescript
USER_NOT_FOUND: {
  status: 404,
  backendDetail: 'User not found',
  title: 'Credenciales inválidas',
  message: 'El usuario o la contraseña son incorrectos.',
},
```

- [ ] **Step 2: Replace and expand `src/errors/balance.ts`**

Replace entire file content with:

```typescript
export const BALANCE_ERRORS = {
  TRANSACTION_NOT_FOUND: {
    status: 404,
    backendDetailStartsWith: 'Transaction with reference',
    title: 'Transacción no encontrada',
    message: 'No se encontró la transacción especificada.',
  },
  UNAUTHORIZED: {
    status: 403,
    backendDetail: 'Forbidden',
    title: 'Sin permiso',
    message: 'No tienes permiso para realizar esta acción.',
  },
  INVALID_TRANSACTION_TYPE: {
    status: 400,
    backendDetail: 'Invalid transaction type',
    title: 'Tipo de transacción inválido',
    message: 'El tipo de transacción proporcionado no es válido.',
  },
  INVALID_PAYMENT_METHOD: {
    status: 400,
    backendDetail: 'Invalid payment method',
    title: 'Método de pago inválido',
    message: 'El método de pago proporcionado no es válido.',
  },
  DESCRIPTION_TOO_LONG: {
    status: 400,
    backendDetail: 'Description must be 255 characters or fewer',
    title: 'Descripción muy larga',
    message: 'La descripción no puede superar los 255 caracteres.',
  },
  DELETE_NOT_REJECTED: {
    status: 403,
    backendDetail: 'Admins can only delete REJECTED transactions',
    title: 'Acción no permitida',
    message: 'Solo se pueden eliminar transacciones rechazadas.',
  },
  EDIT_NOT_REJECTED: {
    status: 403,
    backendDetail: 'Admins can only edit REJECTED transactions',
    title: 'Acción no permitida',
    message: 'Solo se pueden editar transacciones rechazadas.',
  },
  AUTHORIZE_STATUS_FORBIDDEN: {
    status: 403,
    backendDetail: 'Admins can only set transaction status to PENDING',
    title: 'Acción no permitida',
    message: 'Solo puedes cambiar el estado de la transacción a pendiente.',
  },
  RESUBMIT_NOT_REJECTED: {
    status: 422,
    backendDetail: 'Admins can only re-submit REJECTED transactions to PENDING',
    title: 'Acción no permitida',
    message: 'Solo se pueden reenviar transacciones rechazadas a estado pendiente.',
  },
};
```

- [ ] **Step 3: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/errors/auth.ts src/errors/balance.ts
git commit -m "feat: complete error maps with all backend error responses"
```

---

### Task 3: Standardize server actions error shape

**Files:**
- Modify: `src/actions/auth/login.ts:44-54`
- Modify: `src/helpers/handleUserAction.ts:22-28,70-77`
- Modify: `src/actions/balance/createTransaction.ts:17-21`
- Modify: `src/actions/balance/getBalanceMetrics.ts:20-27`
- Modify: `src/actions/balance/getTransactionsCount.ts:19-26`
- Modify: `src/actions/users/deleteUser.ts:24-41`
- Modify: `src/actions/users/updateUserRole.ts:28-45`

**Interfaces:**
- Consumes: `isAPIErrorType` from `src/api/errors.ts`, `serverAction` from `src/helpers/serverAction.ts`
- Produces: All actions return `{ success: false, status: number, detail: string }` on error (previously some used `message` instead of `detail`)

- [ ] **Step 1: Standardize `login.ts` catch block**

Replace lines 44-54 in `src/actions/auth/login.ts`:

```typescript
// Old:
  } catch (err: unknown) {
    if (err !== null && typeof err === 'object' && 'status_code' in err && 'detail' in err) {
      const apiErr = err as { status_code: number; detail: string };
      return { status: apiErr.status_code, detail: apiErr.detail || 'Something went wrong' };
    }
    if (err !== null && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response: { status: number; data?: { detail?: string } } };
      return { status: axiosErr.response.status, detail: axiosErr.response.data?.detail || 'Something went wrong' };
    }
    return { status: 500, detail: 'Something went wrong' };
  }
```

With:

```typescript
  } catch (err: unknown) {
    if (err !== null && typeof err === 'object' && 'status_code' in err && 'detail' in err) {
      const apiErr = err as { status_code: number; detail: string };
      return { success: false as const, status: apiErr.status_code, detail: apiErr.detail };
    }
    if (err !== null && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response: { status: number; data?: { detail?: string } } };
      return { success: false as const, status: axiosErr.response.status, detail: axiosErr.response.data?.detail ?? 'Unknown error' };
    }
    return { success: false as const, status: 500, detail: 'Unknown error' };
  }
```

- [ ] **Step 2: Standardize `handleUserAction.ts`**

Change the `HandleUserActionResult` interface — replace `message?` with `detail?`:

```typescript
// Old:
interface HandleUserActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
  status?: number;
}
```

With:

```typescript
interface HandleUserActionResult {
  success: boolean;
  detail?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
  status?: number;
}
```

Change the `onError` callback (lines 70-77):

```typescript
// Old:
    (error) => {
      console.error('Error en acción de usuario:', error);
      return {
        success: false,
        status: isAPIErrorType(error) ? error.status_code : 500,
        message: isAPIErrorType(error) ? error.detail || errorMessage : errorMessage,
      };
    },
```

With:

```typescript
    (error) => {
      console.error('Error en acción de usuario:', error);
      return {
        success: false,
        status: isAPIErrorType(error) ? error.status_code : 500,
        detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
      };
    },
```

Also change the success return (line 68) — replace `message: successMessage` with `detail: successMessage`:

```typescript
// Old:
      return { success: true, message: successMessage, data: result };
```

With:

```typescript
      return { success: true, detail: successMessage, data: result };
```

- [ ] **Step 3: Standardize `createTransaction.ts`**

Replace the `onError` callback (lines 17-21):

```typescript
// Old:
    (error) => ({
      success: false as const,
      status: isAPIErrorType(error) ? error.status_code : 500,
      message: isAPIErrorType(error) ? error.detail : 'Error al crear la transacción.',
    }),
```

With:

```typescript
    (error) => ({
      success: false as const,
      status: isAPIErrorType(error) ? error.status_code : 500,
      detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
    }),
```

- [ ] **Step 4: Standardize `getBalanceMetrics.ts`**

Replace the `onError` callback (lines 20-27):

```typescript
// Old:
    (error) => {
      console.error('Error fetching balance metrics:', error);
      return {
        success: false as const,
        status: isAPIErrorType(error) ? error.status_code : 500,
        message: 'Error al obtener las métricas del balance, intente más tarde.',
      };
    },
```

With:

```typescript
    (error) => ({
      success: false as const,
      status: isAPIErrorType(error) ? error.status_code : 500,
      detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
    }),
```

Also update the return type on line 13. Change `{ success: false; message: string; status?: number }` to `{ success: false; detail: string; status?: number }`:

```typescript
// Old:
): Promise<{ success: true; data: BalanceMetricsSimple } | { success: false; message: string; status?: number }> {
```

With:

```typescript
): Promise<{ success: true; data: BalanceMetricsSimple } | { success: false; detail: string; status?: number }> {
```

- [ ] **Step 5: Standardize `getTransactionsCount.ts`**

Replace the `onError` callback (lines 19-26):

```typescript
// Old:
    (error) => {
      console.error('Error fetching transactions count:', error);
      return {
        success: false as const,
        status: isAPIErrorType(error) ? error.status_code : 500,
        message: 'Error al obtener el conteo de transacciones, intente más tarde.',
      };
    },
```

With:

```typescript
    (error) => ({
      success: false as const,
      status: isAPIErrorType(error) ? error.status_code : 500,
      detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
    }),
```

Also update the return type on line 12. Change `{ success: false; message: string; status?: number }` to `{ success: false; detail: string; status?: number }`:

```typescript
// Old:
): Promise<{ success: true; data: TransactionCount } | { success: false; message: string; status?: number }> {
```

With:

```typescript
): Promise<{ success: true; data: TransactionCount } | { success: false; detail: string; status?: number }> {
```

- [ ] **Step 6: Clean up `deleteUser.ts`**

Replace lines 24-41:

```typescript
// Old:
  } catch (error: unknown) {
    console.error('Error deleting user:', error);

    if (error instanceof APIError || error instanceof APIRequestFailed) {
      return {
        success: false,
        status: error.status_code,
        detail: error.detail || 'Error al eliminar el usuario.',
      };
    }

    const message = error instanceof Error ? error.message : 'Error al eliminar el usuario.';
    return {
      success: false,
      status: 500,
      detail: message,
    };
  }
```

With:

```typescript
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      status: isAPIErrorType(error) ? error.status_code : 500,
      detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
    };
  }
```

Also update imports at top of file. Replace:

```typescript
import { APIError, APIRequestFailed } from '@/api/errors';
```

With:

```typescript
import isAPIErrorType from '@/api/errors';
```

- [ ] **Step 7: Clean up `updateUserRole.ts`**

Replace lines 28-45:

```typescript
// Old:
  } catch (error: unknown) {
    console.error('Error updating user role:', error);

    if (error instanceof APIError || error instanceof APIRequestFailed) {
      return {
        success: false,
        status: error.status_code,
        detail: error.detail || 'Error actualizando el rol.',
      };
    }

    return {
      success: false,
      status: 500,
      detail: error instanceof Error ? error.message : 'Error inesperado al actualizar el rol.',
    };
  }
```

With:

```typescript
  } catch (error: unknown) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      status: isAPIErrorType(error) ? error.status_code : 500,
      detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
    };
  }
```

Also update imports at top of file. Replace:

```typescript
import { APIError, APIRequestFailed } from '@/api/errors';
```

With:

```typescript
import isAPIErrorType from '@/api/errors';
```

- [ ] **Step 8: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: Build will FAIL because components still reference `result.message` — that's expected and fixed in Task 4.

If build fails on the `result.message` references, that confirms the type changes propagated correctly. Proceed to Task 4.

- [ ] **Step 9: Commit**

```bash
git add src/actions/auth/login.ts src/helpers/handleUserAction.ts src/actions/balance/createTransaction.ts src/actions/balance/getBalanceMetrics.ts src/actions/balance/getTransactionsCount.ts src/actions/users/deleteUser.ts src/actions/users/updateUserRole.ts
git commit -m "refactor: standardize server actions to return { success, status, detail }"
```

---

### Task 4: Update components to use standardized error shape

**Files:**
- Modify: `src/components/auth/AuthLogin.tsx:1-2,12-13,40-45`
- Modify: `src/components/users/UserForm.tsx:97-105`
- Modify: `src/components/balance/transactions/TransactionForm.tsx:129-135,148-158,163-180,183-197`
- Modify: `src/components/balance/transactions/TransactionDetailSheet.tsx:96-101`
- Modify: `src/components/balance/autorizaciones/AutorizacionesView.tsx:56-61,89-103,106-120,127-143`
- Modify: `src/components/home/HomeDashboard.tsx:1,6,31,53-57,78`
- Modify: `src/components/home/HomeAdminDashboard.tsx:1,6,13,45-51,78`
- Modify: `src/components/users/AlertDeleteUser.tsx:36-42`
- Modify: `src/components/users/table/ChangeRoleInput.tsx:37-43`

**Interfaces:**
- Consumes: `findErrorMessage` from `src/errors/findErrorMessage.ts`, `isAPIErrorType` from `src/api/errors.ts`, standardized `{ success, status, detail }` from all server actions
- Produces: Correct error display — toasts for action errors, ErrorCard for dashboard load errors

- [ ] **Step 1: Update `AuthLogin.tsx`**

Remove the `AUTH_ERRORS` and `ToastService` imports (lines 12-13), add import for `isAPIErrorType`. The component no longer needs them directly — `handleApiError` does the matching.

Replace imports:

```typescript
// Old:
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { AUTH_ERRORS } from '@/errors/auth';
import { ToastService } from '@/services/toast';
```

With:

```typescript
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
```

Replace the error handling block (lines 40-45):

```typescript
// Old:
    if ('status' in result && !result.success) {
      if (result.status === 401 || result.status === 404) {
        ToastService.error(AUTH_ERRORS.INVALID_CREDENTIALS.title, AUTH_ERRORS.INVALID_CREDENTIALS.message);
      } else {
        handleApiError({ status: result.status || 500, detail: result.detail || 'Something went wrong' }, ['auth']);
      }
    } else {
```

With:

```typescript
    if ('status' in result && !result.success) {
      handleApiError({ status: result.status, detail: result.detail }, ['auth']);
    } else {
```

- [ ] **Step 2: Update `UserForm.tsx`**

Replace the error handling block (lines 97-105):

```typescript
// Old:
    if (!result.success) {
      handleApiError(
        {
          status: result.status || 500,
          detail: result.message || 'Error en la acción del usuario.',
        },
        ['users', 'common'],
      );
      return;
    }
```

With:

```typescript
    if (!result.success) {
      handleApiError(
        {
          status: result.status || 500,
          detail: result.detail || 'Unknown error',
        },
        ['users', 'common'],
      );
      return;
    }
```

- [ ] **Step 3: Update `TransactionForm.tsx` — create mode (lines 129-135)**

Replace:

```typescript
// Old:
      const result = await createTransactionAction(toCreatePayload(values as CreateTransactionFormValues));
      if (!result.success) {
        handleApiError({ status: result.status || 500, detail: result.message || 'Error al crear la transacción.' }, [
          'balance',
          'common',
        ]);
        return;
      }
```

With:

```typescript
      const result = await createTransactionAction(toCreatePayload(values as CreateTransactionFormValues));
      if (!result.success) {
        handleApiError({ status: result.status || 500, detail: result.detail || 'Unknown error' }, [
          'balance',
          'common',
        ]);
        return;
      }
```

- [ ] **Step 4: Update `TransactionForm.tsx` — all try-catch blocks**

Add `isAPIErrorType` import at top of file:

```typescript
import isAPIErrorType from '@/api/errors';
```

Replace the catch block in `onSubmit` edit mode (lines 151-157):

```typescript
// Old:
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al actualizar la transacción.' },
        ['balance', 'common'],
      );
      return;
    }
```

With:

```typescript
    } catch (err) {
      if (isAPIErrorType(err)) {
        handleApiError({ status: err.status_code, detail: err.detail }, ['balance', 'common']);
      } else {
        handleApiError({ status: 500, detail: 'Unknown error' }, ['balance', 'common']);
      }
      return;
    }
```

Replace the catch block in `handleSaveOnly` (lines 172-177):

```typescript
// Old:
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al actualizar la transacción.' },
        ['balance', 'common'],
      );
    }
```

With:

```typescript
    } catch (err) {
      if (isAPIErrorType(err)) {
        handleApiError({ status: err.status_code, detail: err.detail }, ['balance', 'common']);
      } else {
        handleApiError({ status: 500, detail: 'Unknown error' }, ['balance', 'common']);
      }
    }
```

Replace the catch block in `handleSaveAndResubmit` (lines 189-196):

```typescript
// Old:
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al actualizar la transacción.' },
        ['balance', 'common'],
      );
      setIsSavingFromDialog(false);
      return;
    }
```

With:

```typescript
    } catch (err) {
      if (isAPIErrorType(err)) {
        handleApiError({ status: err.status_code, detail: err.detail }, ['balance', 'common']);
      } else {
        handleApiError({ status: 500, detail: 'Unknown error' }, ['balance', 'common']);
      }
      setIsSavingFromDialog(false);
      return;
    }
```

- [ ] **Step 5: Update `TransactionDetailSheet.tsx`**

Add `isAPIErrorType` import at top of file:

```typescript
import isAPIErrorType from '@/api/errors';
```

Replace the catch block in `handleDelete` (lines 96-101):

```typescript
// Old:
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError({ status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al eliminar.' }, [
        'balance',
        'common',
      ]);
    }
```

With:

```typescript
    } catch (err) {
      if (isAPIErrorType(err)) {
        handleApiError({ status: err.status_code, detail: err.detail }, ['balance', 'common']);
      } else {
        handleApiError({ status: 500, detail: 'Unknown error' }, ['balance', 'common']);
      }
    }
```

- [ ] **Step 6: Update `AutorizacionesView.tsx`**

Add `isAPIErrorType` import at top of file:

```typescript
import isAPIErrorType from '@/api/errors';
```

Replace the catch in `fetchPending` (lines 56-61):

```typescript
// Old:
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      setState({
        status: 'error',
        message: apiErr?.detail ?? 'No se pudieron cargar las transacciones pendientes.',
      });
    }
```

With:

```typescript
    } catch (err) {
      if (isAPIErrorType(err)) {
        const { message } = findErrorMessage({ status: err.status_code, detail: err.detail }, ['balance', 'common']);
        setState({ status: 'error', message });
      } else {
        setState({ status: 'error', message: 'Ocurrió un error desconocido. Inténtalo de nuevo más tarde.' });
      }
    }
```

Also add import at top:

```typescript
import findErrorMessage from '@/errors/findErrorMessage';
```

Replace all three action catch blocks (`handleApprove` lines 95-100, `handleReject` lines 112-118, `handleRejectDelete` lines 134-139) with the same pattern. Example for `handleApprove`:

```typescript
// Old:
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? `No se pudo aprobar ${reference}.` },
        ['balance', 'common'],
      );
    }
```

With:

```typescript
    } catch (err) {
      if (isAPIErrorType(err)) {
        handleApiError({ status: err.status_code, detail: err.detail }, ['balance', 'common']);
      } else {
        handleApiError({ status: 500, detail: 'Unknown error' }, ['balance', 'common']);
      }
    }
```

Apply the same replacement pattern for `handleReject` and `handleRejectDelete` catch blocks — same structure, just remove the manual cast and use `isAPIErrorType`.

- [ ] **Step 7: Update `HomeDashboard.tsx`**

Add import for `findErrorMessage`:

```typescript
import findErrorMessage from '@/errors/findErrorMessage';
```

Update the `State` type — change `message` to store both `title` and `message`:

```typescript
// Old:
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: BalanceMetricsSimple };
```

With:

```typescript
type State =
  | { status: 'loading' }
  | { status: 'error'; title: string; message: string }
  | { status: 'success'; data: BalanceMetricsSimple };
```

Update the error branch in `fetchMetrics` (lines 55-57):

```typescript
// Old:
    if (metricsResult.success) {
      setState({ status: 'success', data: metricsResult.data });
    } else {
      setState({ status: 'error', message: metricsResult.message });
    }
```

With:

```typescript
    if (metricsResult.success) {
      setState({ status: 'success', data: metricsResult.data });
    } else {
      const resolved = findErrorMessage(
        { status: metricsResult.status || 500, detail: metricsResult.detail || 'Unknown error' },
        ['balance', 'common'],
      );
      setState({ status: 'error', title: resolved.title, message: resolved.message });
    }
```

Update the ErrorCard render (line 78):

```typescript
// Old:
        <ErrorCard title="No pudimos cargar tu resumen" message={state.message} onRetry={fetchMetrics} />
```

With:

```typescript
        <ErrorCard title={state.title} message={state.message} onRetry={fetchMetrics} />
```

- [ ] **Step 8: Update `HomeAdminDashboard.tsx`**

Add import for `findErrorMessage`:

```typescript
import findErrorMessage from '@/errors/findErrorMessage';
```

Update the `CountsState` type:

```typescript
// Old:
type CountsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pending: number; rejected: number };
```

With:

```typescript
type CountsState =
  | { status: 'loading' }
  | { status: 'error'; title: string; message: string }
  | { status: 'success'; pending: number; rejected: number };
```

Update the error branches in `fetchCounts` (lines 45-52):

```typescript
// Old:
    if (!pendingRes.success) {
      setState({ status: 'error', message: pendingRes.message });
      return;
    }
    if (!rejectedRes.success) {
      setState({ status: 'error', message: rejectedRes.message });
      return;
    }
```

With:

```typescript
    if (!pendingRes.success) {
      const resolved = findErrorMessage(
        { status: pendingRes.status || 500, detail: pendingRes.detail || 'Unknown error' },
        ['balance', 'common'],
      );
      setState({ status: 'error', title: resolved.title, message: resolved.message });
      return;
    }
    if (!rejectedRes.success) {
      const resolved = findErrorMessage(
        { status: rejectedRes.status || 500, detail: rejectedRes.detail || 'Unknown error' },
        ['balance', 'common'],
      );
      setState({ status: 'error', title: resolved.title, message: resolved.message });
      return;
    }
```

Update the ErrorCard render (line 78):

```typescript
// Old:
        <ErrorCard title="No pudimos cargar tu resumen" message={state.message} onRetry={fetchCounts} />
```

With:

```typescript
        <ErrorCard title={state.title} message={state.message} onRetry={fetchCounts} />
```

- [ ] **Step 9: Verify `AlertDeleteUser.tsx` and `ChangeRoleInput.tsx`**

These components already use `result.detail` — no changes needed. Verify they still compile correctly.

`AlertDeleteUser.tsx` line 39 uses `result.detail` — correct.
`ChangeRoleInput.tsx` line 40 uses `result.detail` — correct.

- [ ] **Step 10: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: Clean build, no errors. All error paths now resolve friendly messages.

- [ ] **Step 11: Commit**

```bash
git add src/components/auth/AuthLogin.tsx src/components/users/UserForm.tsx src/components/balance/transactions/TransactionForm.tsx src/components/balance/transactions/TransactionDetailSheet.tsx src/components/balance/autorizaciones/AutorizacionesView.tsx src/components/home/HomeDashboard.tsx src/components/home/HomeAdminDashboard.tsx
git commit -m "feat: standardize component error handling to use error maps via handleApiError and findErrorMessage"
```
