---
name: creating-gh-issues
description: >
  Crea issue GitHub per attività Angular nel repository eTellerClient.
  Usa questa skill quando l'utente vuole registrare una nuova funzionalità,
  un bug, un refactoring o un'ottimizzazione relativi esclusivamente al layer
  frontend Angular (eTellerClient). NON usare per task backend (ASP.NET / eTellerServer).
applyTo: "eTellerClient/**"
---

## Contesto del Progetto

- **Repository:** `paulmoscoso22-dot/eTellerClient`
- **URL:** https://github.com/paulmoscoso22-dot/eTellerClient.git
- **Stack frontend:** Angular 21, Signals, Standalone Components, DevExtreme

---

## Quando Usare questa Skill

Invoca questa skill quando l'utente chiede di:
- Creare un nuovo componente, servizio, pipe, direttiva o guard Angular
- Aggiungere / modificare una pagina o una feature UI
- Correggere un bug visivo o comportamentale nel frontend
- Refactoring di codice Angular (reattività, Signals, lazy loading, ecc.)
- Aggiungere test unitari o e2e per componenti Angular
- Ottimizzare performance della UI (change detection, bundle size, ecc.)

---

## Protocollo di Creazione Issue

### 1. Definizione Input

- Genera un **titolo conciso** in italiano (es. `[Angular] Aggiungere paginazione alla lista transazioni`).
- Se la richiesta è vaga, fai **al massimo due domande** prima di procedere.
- Prefissa sempre il titolo con `[Angular]` per distinguere dai task backend.

### 2. Struttura del Corpo Issue

Usa sempre questo template Markdown:

```markdown
## Descrizione
<!-- Cosa deve fare questa funzionalità / qual è il problema? -->

## Layer coinvolto
- [ ] Componente
- [ ] Servizio / HTTP Client
- [ ] State (Signals / Store)
- [ ] Routing
- [ ] UI / DevExtreme
- [ ] Test (unit / e2e)
- [ ] Altro: ___

## File / Percorsi Angular rilevanti
<!-- es. src/app/features/transactions/... -->

## Acceptance Criteria
- [ ] ...
- [ ] ...

## Note tecniche
<!-- Signals, standalone, lazy loading, DevExtreme widget specifico, ecc. -->

## Stima
<!-- XS (<2h) / S (2-4h) / M (1gg) / L (2-3gg) / XL (>3gg) -->
```

### 3. Etichette (Labels)

| Scenario | Labels da applicare |
|---|---|
| Nuova funzionalità UI | `enhancement`, `angular`, `frontend` |
| Bug visivo / comportamentale | `bug`, `angular`, `frontend` |
| Refactoring / clean code | `refactoring`, `angular` |
| Performance / bundle | `performance`, `angular` |
| Test Angular | `testing`, `angular` |
| DevExtreme specifico | `devextreme`, `angular`, `frontend` |

### 4. Creazione via MCP GitHub Tool

Chiama il tool MCP GitHub con:
- `owner`: `paulmoscoso22-dot`
- `repo`: `eTellerClient`
- `title`: il titolo generato
- `body`: il corpo compilato con il template sopra
- `labels`: array di label appropriate dalla tabella

### 5. Conferma e Tracciabilità

- Dopo la creazione, comunica all'utente l'**URL diretto** all'issue.
- Se l'utente sta lavorando su un file specifico, aggiungi un commento in cima al file con il link all'issue.
- Inserisci nel corpo dell'issue il percorso del file Angular rilevante (`src/app/...`).

---

## Esempi di Titoli per Tipo di Task

| Tipo | Esempio Titolo |
|---|---|
| Nuova pagina | `[Angular] Creare pagina lista ordini con DevExtreme DataGrid` |
| Bug componente | `[Angular] Fix: il componente currency-form non resetta i campi dopo il salvataggio` |
| Refactoring | `[Angular] Refactoring transactions-list con Signals e standalone component` |
| Performance | `[Angular] Ottimizzare change detection nella pagina dashboard` |
| Test | `[Angular] Aggiungere unit test per currency.service.ts` |