# ScheduledTasksComponent — Gestione Task Schedulati

## 📋 Overview

Componente Angular 21 standalone per la gestione completa dei task schedulati nel sistema eTeller.

**Funzionalità**:
- ✅ Listing di tutti i task con ricerca e filtri
- ✅ Creazione di nuovi task
- ✅ Modifica e visualizzazione di task esistenti
- ✅ Eliminazione di task
- ✅ Esecuzione singola one-time
- ✅ Azzeramento contatori errori
- ✅ Visualizzazione traccia di esecuzione

## 🎯 Feature: Messaggi User-Friendly

**Novità**: I messaggi di errore sono ora **chiari e comprensibili** per gli utenti finali.

```typescript
// ❌ PRIMA (Tecnico):
"FutDes non può superare 50 caratteri"

// ✅ DOPO (User-Friendly):
"❌ Descrizione: troppi caratteri (massimo 50 consentiti)
 💡 Cosa fa questo task? (max 50 caratteri, es: "Carica elenco messaggi")"
```

**Dettagli**: Vedi `USER_FRIENDLY_ERRORS.md` per documentazione completa.

## 📁 Struttura File

```
scheduled-tasks/
├── scheduled-tasks.component.ts          ← Logica, stato Signals, error handling
├── scheduled-tasks.component.html        ← Template DevExtreme
├── scheduled-tasks.component.css         ← Stili
├── scheduled-tasks-error-handling.spec.ts ← 36 test (100% pass)
├── USER_FRIENDLY_ERRORS.md               ← Documentazione error messages
└── README.md                              ← Questo file
```

## 🏗️ Architettura

### Signals
```typescript
private readonly tasks = signal<FunzioniScheduleResponse[]>([]);
readonly periodTypes = signal<IPeriodTypeResponse[]>([]);
readonly searchValue = signal<string>('');
readonly popupMode = signal<'new' | 'view' | 'edit'>('new');
```

### Services
```typescript
private readonly tabelleService = inject(TabelleService);
```

### Form Reactiva
```typescript
taskForm: FormGroup = this.fb.group({
  futId: ['', Validators.required],
  futDes: ['', Validators.required],
  // ... 20 campi totali
});
```

## 🔄 Flusso Operazioni

### 1. Creazione Task
```
User input → Form validation → buildCommand() → 
  tabelleService.insertFunzioneSchedule() → 
    ✅ Success → Close popup, reload list
    ❌ Error → Show user-friendly message
```

### 2. Modifica Task
```
Load data → Open edit popup → Form update → 
  tabelleService.updateFunzioneSchedule() → 
    ✅ Success → Close popup, reload list
    ❌ Error → Show user-friendly message
```

### 3. Eliminazione Task
```
Confirm delete → tabelleService.deleteFunzioneSchedule() → 
  ✅ Success → Reload list
  ❌ Error → Show user-friendly message
```

## 🛡️ Error Handling

### Strategie di Validazione

**Frontend**:
- Validazione form in tempo reale
- Validazione orari (HH:MM:SS)
- Validazione range (start < end)
- Logica condizionale (se FutAutatt, allora FutPeriod obbligatorio)
- ✅ **Normalizzazione path futNamedll**: backslash (`\`) → forward slash (`/`)
  - Risolve errori 400 durante deserializzazione JSON in ASP.NET
  - Esempio: `C:\eTeller\messaggi\file.dll` → `C:/eTeller/messaggi/file.dll`

**Backend**:
- FluentValidation sul backend (API eTeller)
- Ritorna errori dettagliati (422 Unprocessable Entity)

**User-Friendly Conversion**:
```typescript
private buildUserFriendlyError(fieldName: string, originalMessage: string): string {
  // Converte "FutDes non può superare 50 caratteri"
  // in "❌ Descrizione: troppi caratteri (massimo 50 consentiti)
  //     💡 Cosa fa questo task? (max 50 caratteri, es: ...)"
}
```

## 📦 Modelli TypeScript

```typescript
// Richiesta
interface InsertFunzioneScheduleCommand {
  traUser: string;
  traStation: string;
  futId: string;
  futDes: string;
  futFunname: string;
  futTimeout: number;
  futAutatt: boolean;
  // ... altri 14 campi
}

// Risposta
interface FunzioniScheduleResponse {
  futId: string;
  futDes: string;
  futFunname: string;
  futTimeout: number;
  futAutatt: boolean;
  futActive: boolean;
  futOffline: boolean;
  // ... altri campi
}
```

## 🎨 DevExtreme Components

- **DxDataGrid**: Listing task con sorting/paging
- **DxForm**: Form fields di creazione/modifica
- **DxButton**: Azioni (crea, modifica, elimina, esegui)
- **DxPopup**: Modal per dettagli
- **DxCheckBox**: Boolean fields
- **DxSelectBox**: Dropdown (periodo, ...)
- **DxNumberBox**: Campi numerici (timeout, period)
- **DxTextBox**: Campi testo

**Notifiche**: `notify()` da `devextreme/ui/notify`

## 🧪 Test

### Coverage
```
36 test cases
100% pass rate
Coverage:
  ✅ Validazione (400/422 errors)
  ✅ Autorizzazione (401/403)
  ✅ Server errors (500)
  ✅ User-friendly messages
  ✅ Edge cases
```

### Esecuzione
```bash
npx vitest run src/app/features/manager/tabelle/pages/scheduled-tasks/scheduled-tasks-error-handling.spec.ts
```

## 🚀 Performance

- **Lazy loading**: Componente lazy-loaded nella feature manager
- **Signals**: Uso minimo di subscriptions
- **OnPush**: Change detection OnPush (possibile ottimizzazione futura)
- **Memory leak prevention**: `takeUntilDestroyed()` su tutti gli observables

## 🌍 Internazionalizzazione

**Attualmente**: Solo italiano hardcoded

**Pronto per**: Transloco (`@jsverse/transloco`)
```typescript
// Futuro:
label: this.translate.instant('scheduled-tasks.futId.label')
hint: this.translate.instant('scheduled-tasks.futId.hint')
```

## 📝 Metodi Pubblici

### Popup Management
```typescript
openNewPopup(): void
openViewPopup(data: FunzioniScheduleResponse): void
openEditPopup(data: FunzioniScheduleResponse): void
onTableAction(action: string, data: FunzioniScheduleResponse): void
closePopup(): void
```

### CRUD Operations
```typescript
onSubmit(): void        // Crea nuovo task
onUpdate(): void        // Modifica task
onDelete(data): void    // Elimina task
```

### Special Operations
```typescript
onOneTimeRun(): void        // Esecuzione singola
onResetErrors(): void       // Azzera contatori errori
```

### Utility
```typescript
onSearchChanged(e): void
onRefresh(): void
onTraceFromRow(data): void
onTrace(): void
```

## 🔐 Security

✅ **CSRF**: Nessun rischio (API RESTful con token JWT)  
✅ **XSS**: Template sicuro (no innerHTML, no sanitize richiesto)  
✅ **SQL Injection**: Backend usa parametri SP  
✅ **Input Validation**: Frontend + backend validation

## 📊 Campi Supportati (17)

| Campo | Tipo | Label | Obbligatorio | Max Lunghezza |
|-------|------|-------|-------------|----------------|
| FutId | string | ID del Task | ✅ | 20 |
| FutDes | string | Descrizione | ✅ | 50 |
| FutFunname | string | Nome Funzione | ✅ | 50 |
| FutScriptname | string | Script Name | ✅ | 50 |
| FutTimeout | number | Timeout (ms) | ✅ | - |
| FutStart | string | Orario Inizio | ❌ | 8 |
| FutEnd | string | Orario Fine | ❌ | 8 |
| FutPeriodtyp | string | Tipo Periodo | ❌ | 1 |
| FutPeriod | number | Ogni Quanti Periodi | ❌ | - |
| FutNamedll | string | Percorso DLL | ❌ | 100 |
| FutClassname | string | Nome Classe | ❌ | 100 |
| FutErrcount | number | Conteggio Errori | ❌ | - |
| FutActive | boolean | Task Attivo | ❌ | - |
| FutOffline | boolean | Modalità Offline | ❌ | - |
| FutAutatt | boolean | Schedulazione Auto | ❌ | - |
| FutTrace | boolean | Tracciamento | ❌ | - |
| FutHosval | boolean | Validazione Host | ❌ | - |

## 🔗 Dipendenze

**Angular Core**:
- `@angular/core`
- `@angular/forms`
- `@angular/router`
- `@angular/common`

**Third-party**:
- `devextreme` — UI components
- `devextreme-angular` — Angular integration
- `rxjs` — Reactive programming

**Internal**:
- `TabelleService` — API calls
- `AuthStore` — User context
- `SempioneXxxComponent` — Shared UI components

## 📖 Documentazione Correlata

- **Error Handling**: `USER_FRIENDLY_ERRORS.md`
- **Implementation**: `/IMPLEMENTATION_SUMMARY.md`
- **Visual Examples**: `/VISUAL_EXAMPLES.md`
- **Backend API**: eTeller.Api (porta 5000)
- **Auth API**: eTeller.Auth.Api (porta 52944)

## 🛠️ Sviluppo Locale

### Build
```bash
cd eTellerClient
npm install
npx ng build --configuration development
```

### Test
```bash
npx vitest run
```

### Serve
```bash
npx ng serve
# Open http://localhost:4200
# Navigate to /manager/tabelle/scheduled-tasks
```

## 🐛 Known Issues

- ✅ **RISOLTO**: Errore 400 su futNamedll con backslash (26-05-2026)
  - **Causa**: Backslash nel path DLL non serializzabili correttamente in JSON
  - **Soluzione**: Normalizzazione backslash → forward slash in `buildCommand()`
  - **Commit**: Path normalization in InsertFunzioneScheduleCommand
- ❌ Nessun altro issue noto

## 📈 Roadmap

- [ ] Internazionalizzazione (Transloco)
- [ ] Highlight visuale dei campi con errore
- [ ] Bulk operations (elimina multipli)
- [ ] Export CSV dei task
- [ ] Configurazione timeout per sessione utente
- [ ] Dashboard statistiche esecuzioni

## 👨‍💻 Autore

**@angular-developer** — Frontend specialist  
**Data**: 26 Maggio 2026  
**Version**: 1.0.0-user-friendly-errors

---

**Happy Coding!** 🚀
