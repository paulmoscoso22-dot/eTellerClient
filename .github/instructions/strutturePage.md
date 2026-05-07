
## Quando produci pages

- i request e i response devono essere mappati nell cartella models
- no aggiungere mai direttive *ngFor #ngIf ...
- verifica se puoi riutilizzare i componenti
- not create an interface in the paghe of component or service
- service for the method post get use subject behaviour
- the mehtod ngOnInit only call a methods

---

## 🔁 Regola Migrazione da ASP.NET Framework Vecchio

### Analisi obbligatoria prima di scrivere codice

Quando ricevi una pagina `.aspx` / `.aspx.cs` da migrare, **prima di scrivere qualsiasi codice** devi:

1. Identificare **tutti i pulsanti** presenti nella pagina vecchia (button, link button, command field).
2. Mappare ciascuno nella nuova UI Angular + DevExtreme.
3. Se un bottone richiede backend (es. Traccia, Elimina, Storico), implementarlo prima di passare al frontend.

### Mappa obbligatoria pulsanti legacy → Angular

| Pulsante legacy | Equivalente Angular / DevExtreme | Note |
|---|---|---|
| `ButtonSearch` / `Visualizza` | `dx-button` `Cerca` + `Mostra tutti` | sempre nella toolbar filtri |
| `ButtonClear` / `Reset` | `dx-button` `Reset` | svuota filtri e griglia |
| `ButtonADD` / `Aggiungi` | `dx-button` `Aggiungi` → apre popup add | abilita solo se autorizzato |
| `ButtonMod` / `Modifica` | pulsante edit ✏️ nella colonna Azioni della griglia + bottone `Salva` nel popup | abilitato solo dopo selezione |
| `ButtonTRACE` / `Traccia` | `dx-button` `Traccia` nel popup di modifica | naviga a `/trace` con `ENTNAME` e `traEntCode` |
| `ButtonDEL` / `Elimina` | pulsante 🗑️ nella colonna Azioni + popup conferma | mostrare conferma prima di eliminare |
| `CommandField ShowSelectButton` | colonna Azioni nella griglia con template | edit + trace + delete secondo la pagina |

### Regola Traccia

Il bottone `Traccia` è **sempre obbligatorio** quando è presente nel sistema legacy. Deve essere:

- Visibile nel **popup di modifica** (non in quello di inserimento).
- Facoltativamente aggiungibile anche nella colonna Azioni della griglia.
- Implementato navigando a `/trace` con:

```typescript
this.router.navigate(['/trace'], {
  queryParams: {
    ENTNAME: TABLE,       // nome tabella o costante della pagina
    traEntCode: item.id,  // codice del record selezionato
  },
});
```

```html
@if (isEditMode()) {
  <dx-button class="btn-action-trace" text="Traccia" icon="chart"
             stylingMode="outlined" (onClick)="onTrace()"></dx-button>
}
```

> ❌ **Vietato** completare una migrazione senza aver portato tutti i pulsanti del sistema legacy, incluso `Traccia`.

### Regola `constructor` / `ngOnInit`

| ❌ Vietato | ✅ Corretto |
|---|---|
| Logica o chiamate a servizi nel `constructor()` | `constructor()` **sempre vuoto** |
| Logica inline dentro `ngOnInit()` | `ngOnInit()` chiama **solo metodi privati** |
| `ngOnInit() { this.service.getAll().subscribe(...) }` | `ngOnInit() { this.loadDivise(); }` |

```typescript
// ✅ CORRETTO
constructor() {}

ngOnInit(): void {
  this.loadDivise();
  this.loadCurrencyTypes();
}

private loadDivise(): void {
  this.diviseService.getAll({ curId: null }).subscribe({
    next: data => this.divise.set(data),
    error: () => {}
  });
}

// ❌ SBAGLIATO — logica inline in ngOnInit
ngOnInit(): void {
  this.diviseService.getAll({ curId: null }).subscribe({
    next: data => this.divise.set(data),
    error: () => {}
  });
}

// ❌ SBAGLIATO — chiamate a servizi nel constructor
constructor() {
  this.diviseService.getAll({ curId: null }).subscribe(...);
}
```

### Regola Lunghezza Metodi

**Ogni metodo pubblico deve fare una sola cosa.** Se supera ~15 righe o contiene logica eterogenea (validazione + costruzione dati + chiamata HTTP + gestione risposta), deve essere scomposto in metodi privati dedicati.

| ❌ Vietato | ✅ Corretto |
|---|---|
| Un metodo `save()` con validazione, build payload, chiamata API e gestione risposta | `save()` coordina: `validateForm()`, `buildPayload()`, `handleResult()`, `handleError()` |
| Metodo pubblico > ~15 righe | Metodo pubblico che delega a privati di ~5-10 righe ciascuno |
| Logica mista nello stesso metodo | Una responsabilità per metodo |

```typescript
// ✅ CORRETTO — save() è un coordinatore puro
save(): void {
  if (!this.validateSaveForm()) return;

  const payload = this.buildPayload();
  const isEdit = this.isEditMode();
  const label = `${payload.fieldA} / ${payload.fieldB}`;

  this.isSaving.set(true);
  this.saveError.set(null);

  const obs = isEdit ? this.service.update(payload) : this.service.insert(payload);

  obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next: (result: boolean) => this.handleSaveResult(result, isEdit, label),
    error: (err: any) => this.handleSaveError(err),
  });
}

private validateSaveForm(): boolean { /* solo validazione */ }
private buildPayload(): IXxxRequest { /* solo costruzione dati */ }
private handleSaveResult(result: boolean, isEdit: boolean, label: string): void { /* solo risposta */ }
private handleSaveError(err: any): void { /* solo errore */ }

// ❌ SBAGLIATO — save() fa tutto in un unico blocco
save(): void {
  const v = this.form.value;
  if (!v.fieldA) { this.error.set('...'); return; }
  const payload = { fieldA: v.fieldA.trim(), ... };
  this.service.insert(payload).subscribe({
    next: r => { this.isSaving.set(false); notify(...); this.search(); },
    error: err => { this.isSaving.set(false); notify(...); }
  });
}
```

---

### Regola Notifiche (Insert / Update / Delete)

```typescript
import notify from 'devextreme/ui/notify';
```

| Evento | Tipo | Durata |
|---|---|---|
| Inserimento riuscito | `'success'` | 3000 ms |
| Aggiornamento riuscito | `'success'` | 3000 ms |
| Eliminazione riuscita | `'success'` | 3000 ms |
| Operazione fallita (result = false) | `'error'` | 4000 ms |
| Errore HTTP | `'error'` | 4000 ms |

```typescript
// ✅ CORRETTO — notifiche in save()
save(): void {
  const isEdit = this.isEditMode();
  const label = `${payload.fieldA} / ${payload.fieldB}`;

  obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next: (result: boolean) => {
      this.isSaving.set(false);
      if (result) {
        this.isFormPopupVisible = false;
        notify(
          isEdit
            ? `Record "${label}" aggiornato con successo`
            : `Record "${label}" inserito con successo`,
          'success',
          3000
        );
        this.search();
      } else {
        notify('Operazione non riuscita. Verificare i dati inseriti.', 'error', 4000);
        this.saveError.set('Operazione non riuscita.');
      }
    },
    error: (err: any) => {
      this.isSaving.set(false);
      const msg = err.message || 'Errore durante il salvataggio';
      notify(msg, 'error', 4000);
      this.saveError.set(msg);
    }
  });
}

// ✅ CORRETTO — notifiche in delete()
delete(id: any): void {
  this.service.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next: (result: boolean) => {
      if (result) {
        notify('Record eliminato con successo', 'success', 3000);
        this.search();
      } else {
        notify('Eliminazione non riuscita.', 'error', 4000);
      }
    },
    error: (err: any) => {
      notify(err.message || 'Errore durante l\'eliminazione', 'error', 4000);
    }
  });
}
```

> ❌ **Vietato** completare un'operazione CUD senza chiamare `notify()`.

---

## 📐 Convenzioni Naming Interfacce TypeScript

### Prefisso obbligatorio `I`
**Tutte** le interfacce TypeScript devono iniziare con la lettera `I` maiuscola.

| ❌ Vietato | ✅ Corretto |
|---|---|
| `CorsiRequest` | `ICorsiRequest` |
| `DivisaResponse` | `IDivisaResponse` |
| `CurrencyCouple` | `ICurrencyCouple` |

### Suffisso per tipo di interfaccia
- Interfacce che rappresentano **dati ricevuti dall'API** → suffisso `Response` → es. `ICorsoResponse`
- Interfacce che rappresentano **dati inviati all'API** → suffisso `Request` → es. `ICorsiRequest`

### File dedicato per feature
Ogni area funzionale deve avere il proprio file `<feature>.models.ts` nella cartella `models/`.
Non inserire mai interfacce di una feature in un file `models/` di un'altra feature.

| ❌ Vietato | ✅ Corretto |
|---|---|
| `ICorso`, `CorsiRequest` in `divisa.models.ts` | `ICorsoResponse`, `ICorsiRequest` in `corso.models.ts` |
| Interfacce miste di feature diverse nello stesso file | Un file per feature: `divisa.models.ts`, `corso.models.ts`, ... |

## 📁 Architettura Progetto (Folder Structure)
Ogni nuova funzionalità deve seguire rigorosamente la struttura a cartelle esistente in `src/app/`:

### 1. Features (Logica di Business)
Le funzionalità sono raggruppate in `features/`. Ogni feature deve contenere:
- **components/**: Componenti riutilizzabili specifici della feature.
- **models/**: Interfacce e tipi TypeScript.
- **pages/**: I componenti principali che fungono da intere pagine (es. `funzioni.component.ts`).
- **services/**: Servizi per la comunicazione API specifici per la feature.

### 2. Core & Domain
- **core/**: Singleton, interceptor, guard e servizi globali.
- **domain/**: Classi di dominio e logiche di business trasversali.

### 3. Shared
- Componenti UI comuni (pulsanti, tabelle, modali) e pipe riutilizzabili.

## 🛠️ Regole di Implementazione Angular 18+
- **Signals**: Usa i Signals per la gestione dello stato reattivo nei componenti.
- **Standalone**: Tutti i componenti devono essere `standalone: true`.
- **Zoneless**: Scrivi codice compatibile con il futuro cambio a zoneless (evita logiche dipendenti da `zone.js`).
- **Styles**: Usa Tailwind CSS all'interno del file `.html` o classi SCSS locali nel file `.css` della pagina.

---

### Regola Migrazione Pulsanti da ASPX

Prima di implementare qualsiasi pagina Angular, **leggere obbligatoriamente il file `.aspx` e il relativo `.aspx.cs`** della pagina equivalente nel progetto `eTeller2022`. Identificare **tutti i pulsanti** presenti e mapparne il comportamento nella nuova pagina.

#### Pulsanti tipici da migrare

| Pulsante ASPX | Equivalente Angular | Note |
|---|---|---|
| `ButtonSearch` / `ButtonVisualizza` | `btn-cerca` in toolbar | Esegue `search()` |
| `ButtonADD` / `Aggiungi` | `btn-add` in toolbar + popup insert | Apre popup in modalità inserimento |
| `ButtonMod` / `Modifica` | `action-btn--edit` in griglia | Apre popup in modalità modifica |
| `ButtonTRACE` / `Traccia` | `action-btn--trace` in griglia | Naviga a `/trace` con `ENTNAME` + `traEntCode` |
| `ButtonClear` / `Reset Form` | `btn-reset` in toolbar | Esegue `resetFilters()` |
| `ButtonDEL` / `Elimina` | `action-btn--delete` in griglia | Esegue `delete()` con confirm |

#### Pulsante Traccia — pattern obbligatorio

Ogni pagina che nel vecchio ASPX aveva `ButtonTRACE` **deve** includere il pulsante Traccia nella colonna azioni della griglia:

```typescript
// Nel component TS — iniettare Router
private readonly router = inject(Router);

openTrace(item: IXxxItemResponse): void {
  this.router.navigate(['/trace'], {
    queryParams: {
      ENTNAME: NOME_TABELLA,   // es. 'ST_TRACE_FUNCTION'
      traEntCode: item.id,
    }
  });
}
```

```html
<!-- Nella colonna azioni della griglia -->
<button class="action-btn action-btn--trace" title="Traccia" (click)="openTrace(cell.data)">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
</button>
```

> ❌ **Vietato** migrare una pagina senza aver verificato tutti i pulsanti del `.aspx` originale.













