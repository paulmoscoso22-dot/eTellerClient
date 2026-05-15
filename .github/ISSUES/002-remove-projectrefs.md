## 📋 Descrizione
Rimuovere `ProjectReference` a `eTeller.Domain` e `eTeller.Application` dal progetto `eTeller.Auth` e sostituirle con un `PackageReference` a `eTeller.Auth.Contracts` (o ProjectReference separato) per consentire build indipendente.

## 🗂️ Layer ASP.NET coinvolto
- [ ] Controller / Endpoint API
- [ ] Command (CQRS)
- [ ] Query (CQRS)
- [ ] Handler (MediatR)
- [ ] Repository / Unit of Work
- [ ] Domain
- [x] Infrastructure (project references)
- [ ] Validator
- [ ] Test

## 📁 File / Percorsi rilevanti
- [eTellerServer/eTeller.Auth/eTeller.Auth.csproj](eTellerServer/eTeller.Auth/eTeller.Auth.csproj#L1)

## 🔌 Contratto API
- N/A

## 🪜 Passi operativi
1. Pubblicare `eTeller.Auth.Contracts` come package locale o aggiungerlo come progetto separato nella soluzione.
2. Modificare `eTeller.Auth.csproj`: rimuovere ProjectReference a `eTeller.Domain` e `eTeller.Application`; aggiungere PackageReference a `eTeller.Auth.Contracts` (o ProjectReference al progetto contracts).
3. Aggiornare `using`/namespace nel codice se cambiano i tipi importati.
4. Correggere mapping/AutoMapper profile per usare i DTO dal nuovo package.
5. Compilare e risolvere errori.
6. Aggiornare pipeline CI per restaurare il package contracts.

## ✅ Acceptance Criteria
- [ ] `eTeller.Auth.csproj` non contiene più ProjectReference a `eTeller.Domain`/`eTeller.Application`.
- [ ] Build CI verde con il nuovo riferimento.

## 📐 Note tecniche ASP.NET
- Preferire `PackageReference` per disaccoppiare versioning; usare feed NuGet interno se disponibile.

## ⏱️ Stima
S (2-4h)
