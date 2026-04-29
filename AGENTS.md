# AGENTS.md

## Stack
Angular 21, TypeScript, RxJS, DevExtreme

## UI
- Usa DevExtreme components per tutta la UI (DxGrid, DxForm, DxButton, ecc.)
- Non usare librerie UI esterne (no Angular Material, no PrimeNG, ecc.)
- Evita HTML custom quando esiste un componente DevExtreme equivalente

## Architecture
- Usa standalone components (Angular 21)
- Prefer signals per stato locale quando possibile
- Usa services per logica e API calls
- Mantieni componenti piccoli e riutilizzabili

## State & RxJS
- Prefer async pipe nei template
- Evita subscribe manuali quando possibile
- Usa operatori RxJS (switchMap, map, combineLatest) in modo semplice

## Rules for AI / Copilot
- Non introdurre nuove librerie o dipendenze
- Seguire sempre pattern già presenti nel progetto
- Preferire soluzioni Angular + DevExtreme native
- Mantieni le modifiche minime e coerenti

## Code style
- PascalCase per componenti e servizi
- camelCase per variabili e metodi
- file Angular in kebab-case