## 📋 Descrizione
Isolare la configurazione di `eTeller.Auth` (appsettings, secrets, JWT keys) in un template/contract chiaro, evitando dipendenze con config globali degli altri progetti.

## 🗂️ Layer ASP.NET coinvolto
- [ ] Controller
- [ ] Command
- [ ] Query
- [ ] Handler
- [x] Infrastructure
- [ ] Domain
- [ ] Validator

## 📁 File / Percorsi rilevanti
- [eTellerServer/eTeller.Auth/eTeller.Auth.csproj](eTellerServer/eTeller.Auth/eTeller.Auth.csproj#L1)
- File `appsettings*.json` presenti in `eTeller.Auth` (da verificare)

## 🔌 Contratto API
- Specificare i nomi delle chiavi di configurazione richieste (es. `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`)

## 🪜 Passi operativi
1. Documentare le chiavi di configurazione richieste in `eTeller.Auth.Contracts` (es. POCO `AuthSettings`).
2. Aggiornare `eTeller.Auth` per leggere `IOptions<AuthSettings>` dal proprio scope di configurazione.
3. Separare i secrets in Secret Manager / KeyVault o variabili d’ambiente per pipeline CI.
4. Aggiornare README per deployment e configurazione.

## ✅ Acceptance Criteria
- [ ] `eTeller.Auth` legge tutta la sua configurazione da un `AuthSettings` definito nei contracts.
- [ ] Nessuna dipendenza a config globali di altri progetti.

## ⏱️ Stima
S (2-4h)
