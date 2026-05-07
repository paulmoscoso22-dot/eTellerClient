---
description: Regole obbligatorie per la migrazione di pagine ASP.NET Framework verso Angular 21 + DevExtreme (pulsanti, Traccia, ngOnInit, colonne griglia)
---

## 🔁 Regola Migrazione da ASP.NET Framework Vecchio

### Analisi obbligatoria prima di scrivere codice

Quando ricevi una pagina `.aspx` / `.aspx.cs` da migrare, **prima di scrivere qualsiasi codice** devi:

1. Identificare **tutti i pulsanti** presenti nella pagina vecchia (button, link button, command field).
2. Mappare ciascuno nella nuova UI Angular + DevExtreme.
3. Se un bottone richiede backend (es. Traccia, Elimina, Storico), implementarlo prima di passare al frontend.

---

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

> ❌ **Vietato** completare una migrazione senza aver portato tutti i pulsanti del sistema legacy, incluso `Traccia`.

---

### Regola Traccia

Il bottone `Traccia` è **sempre obbligatorio** quando è presente nel sistema legacy. Deve essere:

- Visibile nel **popup di modifica** (non in quello di inserimento).
- Implementato navigando a `/trace` con:

```typescript
// Nel componente TS
private readonly router = inject(Router);

onTrace(): void {
  this.router.navigate(['/trace'], {
    queryParams: {
      ENTNAME: TABLE,        // costante della pagina, es. 'ST_TABLENAME'
      traEntCode: this.selectedId(),
    },
  });
}
```

```html
<!-- Nel popup di modifica -->
@if (isEditMode()) {
  <dx-button
    class="btn-action-trace"
    text="Traccia"
    icon="chart"
    stylingMode="outlined"
    (onClick)="onTrace()">
  </dx-button>
}
```

---

### Regola `ngOnInit()` obbligatorio nella migrazione

Ogni componente migrato **deve sempre implementare `ngOnInit()`**. Il metodo deve:

- Essere **sempre presente** nella classe del componente (non ometterlo mai).
- Chiamare `this.showAll()` in modo che la griglia sia **già popolata all'apertura**, come il `Page_Load` del vecchio sistema.

```typescript
// ✅ CORRETTO
ngOnInit(): void {
  this.showAll();
}

showAll(): void {
  this.filterForm.reset({ id: null, des: null });
  this.search();
}

// ❌ SBAGLIATO — ngOnInit assente → griglia vuota all'apertura
```

> ❌ **Vietato** consegnare una migrazione senza `ngOnInit()` o con la griglia vuota all'apertura.

---

### Regola Colonne Griglia: fedeltà al sistema legacy

Le colonne della `dx-data-grid` **devono corrispondere esattamente** alle colonne del `GridView` della pagina `.aspx` vecchia. Non aggiungere né rimuovere colonne.

**Procedura obbligatoria:**

1. Identificare ogni `<asp:BoundField>` e `<asp:TemplateField>` nel `GridView` legacy.
2. Mapparli 1:1 come `<dxi-column>` nella nuova griglia.
3. Mantenere lo stesso `HeaderText` → `caption`, stesso `DataField` adattato al camelCase.
4. La colonna **Azioni** sostituisce il `CommandField ShowSelectButton`.

| Elemento legacy | Equivalente Angular |
|---|---|
| `<asp:BoundField DataField="ID" HeaderText="ID">` | `<dxi-column dataField="id" caption="ID">` |
| `<asp:BoundField DataField="DES" HeaderText="Descrizione">` | `<dxi-column dataField="des" caption="Descrizione">` |
| `<asp:CommandField ShowSelectButton="True" SelectText="Scegli">` | colonna Azioni con cellTemplate (edit + trace) |

```html
<!-- ✅ CORRETTO — colonne identiche al legacy GridView -->
<dxi-column dataField="id"  caption="ID"          alignment="right" [width]="100" dataType="number"></dxi-column>
<dxi-column dataField="des" caption="Descrizione" alignment="left"></dxi-column>
<dxi-column caption="Azioni" [width]="90" cellTemplate="actionsTemplate" [allowSorting]="false"></dxi-column>
```

> ❌ **Vietato** aggiungere o rimuovere colonne rispetto alla pagina legacy senza esplicita richiesta dell'utente.
