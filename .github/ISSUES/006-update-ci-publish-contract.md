## 📋 Descrizione
Aggiornare la pipeline CI/CD per costruire `eTeller.Auth` indipendentemente, pubblicare `eTeller.Auth.Contracts` su feed interno/NuGet e assicurare che i consumer utilizzino la versione corretta.

## 🗂️ Layer ASP.NET coinvolto
- [ ] Controller
- [ ] Command
- [ ] Query
- [ ] Handler
- [x] Infrastructure
- [ ] Test

## 📁 File / Percorsi rilevanti
- Pipeline CI file (es. `.github/workflows/*` o Azure DevOps pipeline)

## 🪜 Passi operativi
1. Aggiungere job alla pipeline per buildare `eTeller.Auth.Contracts` e pubblicarlo su feed interno.
2. Aggiornare job per `eTeller.Auth` per consumare il package.
3. Aggiungere step di versione/pack e di testing.
4. Verificare rollback/compatibilità versione.

## ✅ Acceptance Criteria
- [ ] CI costruisce e pubblica `eTeller.Auth.Contracts`.
- [ ] `eTeller.Auth` e consumer costruiscono dal feed senza ProjectReference.

## ⏱️ Stima
M (1gg)
