## 📋 Descrizione
Estrarre le interfacce, DTO, ViewModel e contratti usati da eTeller.Auth in un nuovo progetto indipendente `eTeller.Auth.Contracts` per rimuovere riferimenti diretti a `eTeller.Domain`/`eTeller.Application`.

## 🗂️ Layer ASP.NET coinvolto
- [ ] Controller / Endpoint API
- [ ] Command (CQRS)
- [ ] Query (CQRS)
- [x] Handler (MediatR)
- [ ] Repository / Unit of Work
- [x] Domain (Entity, Value Object, Aggregate)
- [ ] Infrastructure (DbContext, EF Migrations)
- [x] Validator (FluentValidation)
- [ ] Test (unit / integrazione)
- [ ] Migrazione da eTeller2022 legacy

## 📁 File / Percorsi rilevanti
- [eTellerServer/eTeller.Auth/eTeller.Auth.csproj](eTellerServer/eTeller.Auth/eTeller.Auth.csproj#L1)
- DTO, ViewModel e validator usati da `eTeller.Auth` (es. DTO per login, register, token)

## 🔌 Contratto API (se applicabile)
- Non applicabile (interno)

## 🪜 Passi operativi
1. Creare progetto `eTeller.Auth.Contracts` (class library .NET 10).
2. Identificare e spostare DTO pubblici, interfacce (`ITokenService`, models pubblici) e validator necessari in `eTeller.Auth.Contracts`.
3. Aggiungere mapping/AutoMapper profiles minimi nei contracts se necessario.
4. Pubblicare il progetto come pacchetto locale/NuGet (versione pre-release).
5. Aggiornare `eTeller.Auth` per referenziare `eTeller.Auth.Contracts`.
6. Compilare e risolvere i break di compilazione.
7. Eseguire test manuali base.

## ✅ Acceptance Criteria
- [ ] Esiste `eTeller.Auth.Contracts`.
- [ ] `eTeller.Auth` compila senza riferimenti diretti a entità di `eTeller.Domain`.
- [ ] Tutti i DTO/contratti pubblici necessari sono esposti da `eTeller.Auth.Contracts`.

## 📐 Note tecniche ASP.NET
- Seguire convenzioni del repo e `important-rules.instructions.md`.
- Non spostare logica business; solo contratti e DTO.

## ⏱️ Stima
M (1gg)

## 🔗 Riferimenti
- [eTellerServer/eTeller.Auth/eTeller.Auth.csproj](eTellerServer/eTeller.Auth/eTeller.Auth.csproj#L1)
