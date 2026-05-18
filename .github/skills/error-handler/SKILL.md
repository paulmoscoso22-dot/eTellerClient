---
name: error-handler
description: >
  Gestione centralizzata degli errori UI in Angular 21 per eTellerClient:
  ErrorHandlerService (mapping errori → messaggi utente), GlobalErrorHandler (errori non catturati),
  integrazione DevExtreme notify(), regole di sicurezza sui log.
applyTo: "eTellerClient/**"
---

# Error Handler — eTeller Frontend

## Architettura della Gestione Errori

```
Errore HTTP tecnico (4xx/5xx)
  └─► errorInterceptor → ErrorHandlerService.handleHttpError()

Errore di business (ResultCode non-OK in risposta 200)
  └─► Componente → gestione locale con messaggi specifici

Eccezione non catturata (runtime error)
  └─► GlobalErrorHandler → ErrorHandlerService.handleUnexpected()
```

> La separazione tra errori **tecnici** (HTTP) ed errori **di business** (ResultCode) è fondamentale:
> il componente conosce il contesto e può mostrare messaggi specifici; gli errori tecnici
> sono gestiti centralmente in modo uniforme.

---

## 1. ErrorHandlerService

**File:** `src/app/core/services/error-handler.service.ts`

**Responsabilità:** Mappa errori → messaggi utente leggibili + mostra notify DevExtreme.

### Regole di Sicurezza (OBBLIGATORIE)

- ❌ **MAI** esporre stack trace all'utente
- ❌ **MAI** mostrare messaggi di errore tecnici del server (SQL error, entity names)
- ❌ **MAI** loggare password, token o dati sensibili
- ✅ Messaggi generici per errori tecnici: `"Errore del server. Riprovare più tardi."`
- ✅ Messaggi specifici solo per errori di business noti (es. `"Credenziali non valide."`)
- ✅ `console.error` solo in `!environment.production` e solo per debugging interno

### Metodi

```typescript
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {

  // Chiamato da errorInterceptor per errori HTTP
  handleHttpError(error: HttpErrorResponse): void

  // Chiamato da GlobalErrorHandler per errori non catturati
  handleUnexpected(error: unknown): void

  // Chiamato dai componenti per errori di business
  showBusinessError(message: string): void
  showWarning(message: string): void
  showSuccess(message: string): void
}
```

### Mapping Errori → Messaggi

| Condizione | Tipo notify | Messaggio |
|---|---|---|
| `status === 401` | — | (gestito da errorInterceptor con redirect) |
| `status === 403` | `"warning"` | `"Non hai i permessi per eseguire questa operazione."` |
| `status >= 500` | `"error"` | `"Errore del server. Riprovare più tardi."` |
| `status === 0` | `"error"` | `"Impossibile raggiungere il server."` |
| Errore sconosciuto | `"error"` | `"Si è verificato un errore imprevisto."` |

---

## 2. GlobalErrorHandler

**File:** `src/app/core/services/global-error-handler.ts`

**Responsabilità:** Cattura le eccezioni JavaScript non gestite (errori runtime Angular).

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorHandlerService: ErrorHandlerService) {}

  handleError(error: unknown): void {
    // In dev: logga per debugging
    if (!environment.production) {
      console.error('[GlobalErrorHandler]', error);
    }
    // Mostra messaggio generico — MAI esporre dettagli
    this.errorHandlerService.handleUnexpected(error);
  }
}
```

**Registrazione in app.config.ts:**
```typescript
providers: [
  { provide: ErrorHandler, useClass: GlobalErrorHandler },
  // ...
]
```

---

## 3. Integrazione DevExtreme notify()

**Signature standard da usare in tutto il progetto:**
```typescript
import notify from 'devextreme/ui/notify';

notify(message: string, type: 'success' | 'warning' | 'error' | 'info', displayTime: number)
```

**Durate standard:**
| Tipo | DisplayTime |
|---|---|
| `success` | 3000ms |
| `info` | 3000ms |
| `warning` | 4000ms |
| `error` | 5000ms |

> ✅ Usare **sempre** queste durate standard — non inventare valori custom.

---

## 4. Separazione Responsabilità

| Chi gestisce | Tipo errore | Come |
|---|---|---|
| `errorInterceptor` | Errori HTTP 4xx/5xx | Redirect 401, notify 403/5xx |
| Componente (`LoginComponent`) | Errori di business (ResultCode) | Messaggio inline nel form |
| `GlobalErrorHandler` | Eccezioni runtime non catturate | Notify generico |
| `ErrorHandlerService` | Mapping + notify | Chiamato da tutti i layer sopra |
