
## Quando produci pages

- i request e i response devono essere mappati nell cartella models
- no aggiungere mai direttive *ngFor #ngIf ...
- verifica se puoi riutilizzare i componenti
- not create an interface in the paghe of component or service
- service for the method post get use subject behaviour
- the mehtod ngOnInit only call a methods

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












