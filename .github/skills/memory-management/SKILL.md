---
name: memory-management
description: >
  Regole e pattern per prevenire memory leak in Angular 21 (eTellerClient):
  takeUntilDestroyed, DestroyRef, cleanup degli effects, componenti dinamici, timer.
  Letto obbligatoriamente da agent-refactor (applica pattern) e agent-angular-tester (verifica cleanup).
applyTo: "eTellerClient/**"
---

# Memory Management — Prevenzione Memory Leak Angular 21

## Checklist Obbligatoria (da applicare a ogni componente/servizio)

- [ ] Ogni Observable sottoscritto manualmente usa `takeUntilDestroyed()`
- [ ] Ogni `effect()` con side effect esterni ha la funzione di cleanup
- [ ] Ogni componente dinamico è distrutto esplicitamente
- [ ] Ogni `setInterval`/`setTimeout` è salvato in variabile e cancellato
- [ ] Ogni event listener su `window`/`document` è rimosso al destroy
- [ ] Gli interceptor usano `finalize()` o `catchError()` che non blocca lo stream

---

## 1. Observable — Pattern `takeUntilDestroyed`

**Regola:** Ogni `subscribe()` manuale in un componente DEVE usare `takeUntilDestroyed()`.

```typescript
// ✅ Corretto — Angular 21
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

@Component({...})
export class LoginComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.router.events.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => { ... });
  }
}
```

```typescript
// ❌ Sbagliato — memory leak
ngOnInit(): void {
  this.router.events.subscribe(event => { ... }); // non si unsub mai
}
```

**Alternativa preferita** — evita il subscribe manuale del tutto:
```typescript
// ✅ Meglio ancora — usa async pipe nel template
readonly events$ = this.router.events;
// nel template: *ngIf="events$ | async as event"
```

---

## 2. Signals `effect()` — Cleanup Side Effect

**Regola:** Se un `effect()` crea risorse esterne (timer, subscription, listener), deve usare `onCleanup`.

```typescript
// ✅ Corretto
effect((onCleanup) => {
  const subscription = someExternalObservable.subscribe();
  onCleanup(() => subscription.unsubscribe());
});

// ❌ Sbagliato — la subscription sopravvive al destroy
effect(() => {
  someExternalObservable.subscribe(); // leak
});
```

---

## 3. Componenti Dinamici (Dialog, Overlay)

**Regola:** Ogni componente creato con `ViewContainerRef.createComponent()` DEVE essere distrutto esplicitamente quando non più necessario.

```typescript
// ✅ Corretto — ForceLoginComponent (dialog)
private dialogRef?: ComponentRef<ForceLoginComponent>;

openForceLoginDialog(): void {
  this.dialogRef = this.viewContainerRef.createComponent(ForceLoginComponent);
}

closeDialog(): void {
  this.dialogRef?.destroy();  // OBBLIGATORIO
  this.dialogRef = undefined;
}

ngOnDestroy(): void {
  this.dialogRef?.destroy();  // safety net
}
```

---

## 4. Timer — setInterval / setTimeout

**Regola:** Ogni timer DEVE essere salvato in una variabile e cancellato al destroy.

```typescript
// ✅ Corretto
private refreshTimer?: ReturnType<typeof setInterval>;

ngOnInit(): void {
  this.refreshTimer = setInterval(() => this.checkToken(), 60_000);
}

ngOnDestroy(): void {
  if (this.refreshTimer) {
    clearInterval(this.refreshTimer);
  }
}
```

---

## 5. Event Listener su window/document

**Regola:** Ogni event listener aggiunto manualmente DEVE essere rimosso al destroy.

```typescript
// ✅ Corretto
private destroyRef = inject(DestroyRef);

ngOnInit(): void {
  const handler = (e: KeyboardEvent) => { ... };
  window.addEventListener('keydown', handler);

  this.destroyRef.onDestroy(() => {
    window.removeEventListener('keydown', handler);
  });
}
```

---

## 6. Interceptor — Stream RxJS

**Regola:** Gli interceptor non devono mai bloccare lo stream in caso di errore. Usare sempre `catchError` che ritorna `throwError`.

```typescript
// ✅ Corretto — lo stream continua a esistere per i prossimi subscriber
return next(req).pipe(
  catchError((error: HttpErrorResponse) => {
    // gestisci errore
    return throwError(() => error); // propaga, non swallows
  })
);

// ❌ Sbagliato — swallowing errors causa comportamenti imprevedibili
return next(req).pipe(
  catchError(() => of(null)) // non fare mai questo
);
```

---

## 7. Verifica nei Test (agent-angular-tester)

Per ogni componente, includere un test esplicito di cleanup:

```typescript
it('should unsubscribe on destroy', () => {
  const unsubSpy = jest.spyOn(component['destroyRef'], 'onDestroy');
  fixture.destroy();
  // Verifica che il componente non abbia subscription attive
  expect(component['subscription']?.closed).toBe(true);
});

it('should destroy dynamic component on close', () => {
  component.openForceLoginDialog();
  const destroySpy = jest.spyOn(component['dialogRef']!, 'destroy');
  component.closeDialog();
  expect(destroySpy).toHaveBeenCalled();
});
```
