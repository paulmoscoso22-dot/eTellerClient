---
description: Convenzioni TypeScript per componenti Angular: constructor, ngOnInit, lunghezza metodi e notifiche DevExtreme
---

## Regola `constructor` / `ngOnInit`

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

---

## Regola Lunghezza Metodi

**Ogni metodo pubblico deve fare una sola cosa.** Se supera ~15 righe o contiene logica eterogenea, deve essere scomposto in metodi privati dedicati.

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

## Regola Notifiche (Insert / Update / Delete)

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
// ✅ CORRETTO — notifiche in handleSaveResult()
private handleSaveResult(result: boolean, isEdit: boolean, label: string): void {
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
}

private handleSaveError(err: any): void {
  this.isSaving.set(false);
  const msg = err.message || 'Errore durante il salvataggio';
  notify(msg, 'error', 4000);
  this.saveError.set(msg);
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
