# Implementare paginazione e ordinamento per la lista transazioni

**Label:** enhancement, backend, frontend
**Assignee:** 

## Descrizione del problema
La vista che mostra la lista delle transazioni in `eTellerClient` attualmente carica tutti i record in una singola richiesta. Questo causa rallentamenti dell'interfaccia e problemi di usabilità quando il volume dei dati cresce. Non è presente un meccanismo stabile di ordinamento né la possibilità per l'utente di navigare per pagine.

## Obiettivo
Aggiungere una paginazione server-side supportata dal frontend con controllo dell'ordinamento (es. newest-first, oldest-first, ordinamento per colonne selezionabili). Garantire query efficienti e UX reattiva.

## Requisiti funzionali
- Paginazione server-side con parametri `page` e `pageSize` (es. 10, 25, 50, 100).
- Supporto per ordinamento tramite parametri `sortBy` e `sortDir` (`asc`/`desc`).
- Response che includa `items`, `page`, `pageSize`, `totalCount` (o next/prev links se si preferisce keyset pagination).
- Componenti UI per navigare pagine, scegliere dimensione pagina e cambiare ordinamento.
- Esperienza coerente con carico progressivo e messaggi di stato (loading, empty, error).

## Proposta API
Endpoint: `GET /api/transactions`
Query parameters:
- `page` (int, default 1)
- `pageSize` (int, default 25)
- `sortBy` (string, e.g. `timestamp`, `amount`, `accountId`)
- `sortDir` (string, `asc` or `desc`, default `desc`)

Esempio di response (JSON):
{
  "items": [ /* array di transazioni */ ],
  "page": 1,
  "pageSize": 25,
  "totalCount": 1245
}

Alternative: per dataset molto grande considerare keyset pagination (cursor-based) con `cursor` e `limit` per evitare OFFSET costosi.

## Modifiche Backend (high level)
- Aggiungere parametri di query e validazione nel controller API.
- Implementare paginazione a livello di service/repository:
  - Soluzione semplice: OFFSET / LIMIT con `totalCount` (facile da implementare, meno performante su tabelle grandi).
  - Soluzione performante: keyset pagination basata su cursori (richiede cambio del contratto API e supporto frontend).
- Aggiungere indici sui campi usati per ordinamento/filtri (es. `timestamp`, `accountId`).
- Gestire fallback e valori predefiniti; limitare `pageSize` massimo per evitare carichi eccessivi.

## Modifiche Frontend (high level)
- Aggiornare il servizio che chiama `GET /api/transactions` per passare `page`, `pageSize`, `sortBy`, `sortDir`.
- Aggiornare il componente lista transazioni:
  - Aggiungere controlli UI per paginazione (paginatore con prima/prev/next/ultima) e selettore `pageSize`.
  - Abilitare click sull'intestazione colonna per cambiare `sortBy`/`sortDir`.
  - Gestire stati: loading, empty, error.
- Memorizzare stato di paginazione e ordinamento nel routing query params (es. `?page=2&pageSize=25&sortBy=timestamp&sortDir=desc`) per deep-linking e back/forward browser.

## Test
- Unit tests per service backend (parametri, limiti, risposta corretta).
- Integration tests per endpoint (verifica `totalCount`, paging consistency).
- Frontend unit tests per componenti e servizi.
- E2E test che verifica navigazione pagine e ordinamento persistente.

## Rollout e retrocompatibilità
- Rendere il nuovo comportamento compatibile per default (se client non manda parametri, restituire page 1 con pageSize default).
- Se si introduce keyset pagination, considerare API versione (es. `/api/v2/transactions`) o supportare entrambi i meccanismi lato server.
- Possibile feature-flag per abilitare keyset gradualmente.

## Acceptance criteria
- Endpoint `GET /api/transactions` restituisce correttamente pagine con `totalCount`.
- UI mostra solo la pagina richiesta e permette navigazione e cambio ordinamento.
- Performance: richieste paginate non bloccano UI e non degradano significativamente il DB sotto carico normale.
- Test automatedes presenti e green.

## Stima e rischi
- Stima grezza: 3-5 giorni (1 backend, 1 frontend, 1 test/QA)
- Rischi: costi di prestazione su query con OFFSET su dataset molto grande; necessità di indici; impatto su API clients se si cambia il contratto (usare versioning/flag per mitigar).

---

Se vuoi, posso:
- creare direttamente la issue su GitHub (richiede token/permessi), oppure
- aprire una PR con la modifica proposta, oppure
- generare la versione in inglese per il tracker internazionale.
