# 📋 Indice Istruzioni Angular — Struttura Pagine

Questo file è stato suddiviso in file tematici. Fare riferimento ai file specifici:

| File | Argomento |
|---|---|
| [page-regole-generali.instructions.md](page-regole-generali.instructions.md) | Regole base pagine, folder structure, Angular 18+ |
| [page-migration-aspnet.instructions.md](page-migration-aspnet.instructions.md) | Migrazione da ASP.NET: pulsanti, Traccia, `ngOnInit`, colonne griglia |
| [page-typescript-style.instructions.md](page-typescript-style.instructions.md) | Style TypeScript: constructor, lunghezza metodi, notifiche |
| [page-naming-conventions.instructions.md](page-naming-conventions.instructions.md) | Naming interfacce: prefisso `I`, suffissi Request/Response, file dedicati |

---

## ⚠️ LETTURA OBBLIGATORIA — Ordine di lettura per ogni task

**Prima di scrivere qualsiasi codice**, leggere i file nell'ordine seguente:

### Per qualsiasi task Angular
1. `page-regole-generali.instructions.md`
2. `page-typescript-style.instructions.md`
3. `page-naming-conventions.instructions.md`

### In aggiunta, obbligatorio per task di migrazione da ASP.NET
4. `page-migration-aspnet.instructions.md` ← **NON SALTARE MAI**
   - Identificare tutti i pulsanti della pagina `.aspx` legacy
   - Produrre la mappa pulsanti legacy → Angular prima di scrivere codice
   - Verificare colonne griglia 1:1 con il `GridView` legacy
