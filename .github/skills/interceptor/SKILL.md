---
name: interceptor
description: >
  Definisce i tre HTTP Interceptor funzionali Angular 21 del modulo auth eTellerClient:
  authInterceptor (Bearer token), logInterceptor (dev logging), errorInterceptor (gestione errori HTTP).
  Pattern HttpInterceptorFn, ordine di registrazione in app.config.ts.
applyTo: "eTellerClient/**"
---

# Interceptor — eTeller Frontend

## Principi Base

- Angular 21 usa **interceptor funzionali** (`HttpInterceptorFn`) — nessuna classe, nessun `Injectable`
- Ordine di registrazione in `app.config.ts`: **log → auth → error**
- Ogni interceptor ha una responsabilità **unica** — nessun interceptor fa due cose

---

## 1. authInterceptor

**File:** `src/app/core/interceptors/auth.interceptor.ts`

**Responsabilità:** Aggiunge il token Bearer JWT ad ogni richiesta HTTP, **tranne** le chiamate di autenticazione.

**Logica:**
```
Se la URL contiene '/api/auth/login' o '/api/auth/change-password'
  → passa la richiesta senza modifiche (nessun token)
Altrimenti
  → leggi token da AuthStore.token()
  → se token presente → aggiunge header Authorization: Bearer <token>
  → se token assente → passa la richiesta senza header (il server risponderà 401)
```

**Pattern:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const AUTH_URLS = ['/api/auth/login', '/api/auth/change-password'];

  if (AUTH_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authStore.token();
  if (!token) return next(req);

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
```

---

## 2. logInterceptor

**File:** `src/app/core/interceptors/log.interceptor.ts`

**Responsabilità:** Logga le richieste HTTP in console solo in ambiente di sviluppo.

**Regole di sicurezza:**
- ❌ **MAI** loggare il body della request (contiene password, token)
- ❌ **MAI** loggare gli header di risposta (contengono token)
- ✅ Loggare: URL, metodo HTTP, status code, tempo di risposta
- ✅ Attivo **solo** se `!environment.production`

**Pattern:**
```typescript
export const logInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.production) return next(req);

  const start = Date.now();
  console.debug(`[HTTP] ${req.method} ${req.url}`);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.debug(`[HTTP] ${req.method} ${req.url} → ${event.status} (${Date.now() - start}ms)`);
      }
    })
  );
};
```

---

## 3. errorInterceptor

**File:** `src/app/core/interceptors/error.interceptor.ts`

**Responsabilità:** Gestisce gli errori HTTP tecnici (4xx/5xx). Gli errori di **business** (es. `INVALID_CREDENTIALS` in una 200) sono gestiti dal componente, non qui.

**Logica:**
```
401 Unauthorized
  → AuthStore.reset() (cancella token e sessione)
  → Router.navigate(['/auth/login'])
  → NON mostrare notify (il redirect è sufficiente)

403 Forbidden
  → notify("Permesso negato.", "warning", 4000)

5xx Server Error
  → notify("Errore del server. Riprovare più tardi.", "error", 4000)

Errore di rete (0)
  → notify("Impossibile raggiungere il server.", "error", 4000)
```

**Pattern:**
```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore  = inject(AuthStore);
  const router     = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.reset();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        notify('Permesso negato.', 'warning', 4000);
      } else if (error.status >= 500) {
        notify('Errore del server. Riprovare più tardi.', 'error', 4000);
      } else if (error.status === 0) {
        notify('Impossibile raggiungere il server.', 'error', 4000);
      }
      return throwError(() => error);
    })
  );
};
```

---

## 4. Registrazione in app.config.ts

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        logInterceptor,    // 1° — logga prima di tutto
        authInterceptor,   // 2° — aggiunge token
        errorInterceptor   // 3° — cattura errori sulla risposta
      ])
    ),
    // ...altri provider
  ]
};
```

> ⚠️ L'ordine è fisso e non va cambiato:
> - `log` prima di `auth` — logga la request originale, non quella con il token
> - `error` per ultimo — cattura errori da tutti gli interceptor precedenti
