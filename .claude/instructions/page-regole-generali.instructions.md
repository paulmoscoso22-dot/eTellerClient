---
description: Regole generali per la produzione di pagine Angular nel progetto eTeller (struttura, folder, Angular 18+)
---

## Quando produci pages

- I request e i response devono essere mappati nella cartella `models/`
- Non aggiungere mai direttive `*ngFor`, `*ngIf` — usare la sintassi `@for`, `@if` di Angular 17+
- Verifica se puoi riutilizzare componenti esistenti prima di crearne di nuovi
- Non creare interfacce direttamente nel file del componente o del service
- I service per i metodi POST/GET usano `BehaviorSubject`
- Il metodo `ngOnInit` chiama solo metodi, nessuna logica inline

---

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

---

## 🛠️ Regole di Implementazione Angular 18+

- **Signals**: Usa i Signals per la gestione dello stato reattivo nei componenti.
- **Standalone**: Tutti i componenti devono essere `standalone: true`.
- **Zoneless**: Scrivi codice compatibile con il futuro cambio a zoneless (evita logiche dipendenti da `zone.js`).
- **Styles**: Usa classi CSS predefinite del progetto nel file `.html` o classi SCSS locali nel file `.css` della pagina.
