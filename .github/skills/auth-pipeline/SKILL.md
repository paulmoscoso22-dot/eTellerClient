---
name: auth-pipeline
description: >
  Definisce il flusso E2E di autenticazione Angular 21 → eTeller.Auth.Api: sequenza chiamate,
  mappa ResultCode → azione frontend, contratto TypeScript (ILoginRequest, ILoginResponse, IUserSession),
  struttura AuthStore con Signals. Riferimento obbligatorio per agent-auth-angular.
applyTo: "eTellerClient/**"
---

# Auth Pipeline — eTeller Frontend

## 1. Flusso End-to-End

```
LoginComponent
  └─► AuthService.login(request)
        └─► HttpClient POST /api/auth/login
              └─► [authInterceptor] skippa (è /login, nessun Bearer)
              └─► [logInterceptor] logga URL + metodo (solo dev, no body)
              └─► [errorInterceptor] cattura errori HTTP tecnici
                    └─► API Response (LoginVm)
                          └─► AuthService mappa ResultCode → azione
                                └─► OK → AuthStore.set(...) → Router /main
                                └─► altri → gestione specifica (vedi §3)
```

---

## 2. Contratto TypeScript

### ILoginRequest
```typescript
export interface ILoginRequest {
  userId: string;
  password: string;
  traStation: string;    // IP client — viene aggiunto dal servizio, non dal form
  forceLogin?: boolean;  // default false
}
```

### ILoginResponse
```typescript
export interface ILoginResponse {
  resultCode: string;
  message?: string;
  token?: string;        // JWT — presente solo se resultCode === 'OK'
  requiresPasswordChange?: boolean;
  userAlreadyLogged?: boolean;
  sessionId?: string;
}
```

### IUserSession (dati estratti dal JWT per AuthStore)
```typescript
export interface IUserSession {
  userId: string;        // claim: sub
  name: string;          // claim: name
  branchId: string;      // claim: branch_id
  language: string;      // claim: language
  canUseTeller: boolean; // claim: can_use_teller
  cashDeskId?: string;   // claim: cash_desk_id
  sessionId: string;     // claim: session_id
  tokenExpiry: number;   // claim: exp (Unix timestamp)
}
```

### IChangePasswordRequest
```typescript
export interface IChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  traStation: string;
}
```

### IChangePasswordResponse
```typescript
export interface IChangePasswordResponse {
  resultCode: string;    // OK | INVALID_CURRENT_PASSWORD | HISTORY_VIOLATION | ERROR
  message?: string;
}
```

---

## 3. Mappa ResultCode → Azione Angular

| ResultCode | HTTP Status | Azione Frontend |
|---|---|---|
| `OK` | 200 | `AuthStore.set(session)` → `Router.navigate(['/main'])` |
| `INVALID_CREDENTIALS` | 401 | Mostra `"Credenziali non valide."` nel form (messaggio generico — non differenziare) |
| `USER_BLOCKED` | 401 | `notify("Account bloccato. Contattare l'amministratore.", "warning", 4000)` |
| `USER_DISABLED` | 401 | `notify("Account non abilitato.", "warning", 4000)` |
| `PASSWORD_EXPIRED` | 200 | `Router.navigate(['/auth/change-password'], { queryParams: { reason: 'expired' } })` |
| `MUST_CHANGE_PASSWORD` | 200 | `Router.navigate(['/auth/change-password'], { queryParams: { reason: 'required' } })` |
| `USER_ALREADY_LOGGED` | 200 | Apre `ForceLoginComponent` (dialog) con opzione conferma |
| `CASH_DESK_BUSY` | 200 | `notify("Cassa già occupata.", "warning", 4000)` |
| `ERROR` | 500 | `notify("Errore del server. Riprovare.", "error", 4000)` |

> ⚠️ **Anti user-enumeration**: `INVALID_CREDENTIALS` e `USER_NOT_FOUND` devono mostrare **lo stesso
> messaggio** all'utente: `"Credenziali non valide."` — mai rivelare se lo userId esiste.

---

## 4. AuthStore — Struttura Signals

```typescript
// src/app/core/auth/auth.store.ts
export class AuthStore {
  // Stato
  readonly token         = signal<string | null>(null);
  readonly currentUser   = signal<IUserSession | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null);
  readonly roles         = computed(() => ({
    canUseTeller: this.currentUser()?.canUseTeller ?? false
  }));

  // Metodi
  set(token: string, session: IUserSession): void
  reset(): void   // logout pulito — azzera tutto
}
```

---

## 5. Routing Auth

```typescript
// app.routes.ts
{
  path: 'auth',
  loadChildren: () => import('./auth/auth.routes').then(r => r.AUTH_ROUTES)
  // Nessun guard — accessibile senza token
},
{
  path: '',
  canActivate: [AuthGuard],
  loadChildren: () => import('./main/main.routes').then(r => r.MAIN_ROUTES)
}
```

---

## 6. Endpoint API (eTeller.Auth.Api)

| Metodo | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/login` | `ILoginRequest` | `ILoginResponse` |
| POST | `/api/auth/force-login` | `ILoginRequest` (forceLogin=true) | `ILoginResponse` |
| POST | `/api/auth/logout` | `{ sessionId, userId, traStation }` | `{ resultCode }` |
| POST | `/api/auth/change-password` | `IChangePasswordRequest` | `IChangePasswordResponse` |
