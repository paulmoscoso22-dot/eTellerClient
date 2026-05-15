## 📋 Descrizione
Rifattorizzare i punti in `eTeller.Auth` che invocano servizi concreti di `eTeller.Application` spostando le chiamate dietro interfacce/adattatori o estraendo la logica necessaria nei contracts/adapters.

## 🗂️ Layer ASP.NET coinvolto
- [ ] Controller
- [x] Handler
- [x] Repository / Unit of Work
- [x] Domain
- [ ] Infrastructure
- [ ] Validator

## 📁 File / Percorsi rilevanti
- [eTellerServer/eTeller.Auth/eTeller.Auth.csproj](eTellerServer/eTeller.Auth/eTeller.Auth.csproj#L1)
- File handler/servizi in `eTeller.Auth` che consumano `eTeller.Application` (da identificare)

## 🔌 Contratto API
- N/A

## 🪜 Passi operativi
1. Scansionare i sorgenti `eTeller.Auth` per chiamate verso tipi/servizi di `eTeller.Application`.
2. Per ogni chiamata, definire un adattatore/interfaccia pubblica in `eTeller.Auth.Contracts`.
3. Implementare adattatori nel progetto consumer (o come wrapper) per mantenere il comportamento.
4. Aggiornare DI per risolvere interfacce; rimuovere dipendenze concrete.
5. Compilare e testare.

## ✅ Acceptance Criteria
- [ ] Nessuna chiamata diretta a servizi concreti di `eTeller.Application` rimanente in `eTeller.Auth`.
- [ ] Test modulo Auth eseguiti con successo.

## ⏱️ Stima
M (1gg)
