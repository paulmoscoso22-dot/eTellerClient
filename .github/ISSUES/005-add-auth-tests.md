## 📋 Descrizione
Creare coverage di test per i componenti critici di Auth (TokenService, Handlers, Validators) per garantire regressioni minime durante l’isolamento.

## 🗂️ Layer ASP.NET coinvolto
- [ ] Controller
- [ ] Command
- [ ] Query
- [x] Handler
- [ ] Repository
- [ ] Domain
- [ ] Infrastructure
- [x] Test (unit / integrazione)

## 📁 File / Percorsi rilevanti
- Progetto test proposto: `eTeller.Auth.UnitTests` o sotto `eTeller.Application.UnitTests`

## 🔌 Contratto API
- N/A

## 🪜 Passi operativi
1. Creare progetto test `eTeller.Auth.UnitTests`.
2. Implementare test per `ITokenService` (generate/validate), principali handlers di auth e validator FluentValidation.
3. Usare mocking (Moq) per dipendenze; testare mapping AutoMapper.
4. Integrare esecuzione test nella pipeline CI.

## ✅ Acceptance Criteria
- [ ] Test eseguibili localmente e su CI.
- [ ] Copertura minima sui moduli critici (obiettivo 80%).

## ⏱️ Stima
L (2-3gg)
