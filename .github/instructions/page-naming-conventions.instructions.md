---
description: Convenzioni di naming per interfacce TypeScript nel progetto Angular eTeller (prefisso I, suffissi Request/Response, file dedicati per feature)
---

## 📐 Convenzioni Naming Interfacce TypeScript

### Prefisso obbligatorio `I`

**Tutte** le interfacce TypeScript devono iniziare con la lettera `I` maiuscola.

| ❌ Vietato | ✅ Corretto |
|---|---|
| `CorsiRequest` | `ICorsiRequest` |
| `DivisaResponse` | `IDivisaResponse` |
| `CurrencyCouple` | `ICurrencyCouple` |

---

### Suffisso per tipo di interfaccia

- Interfacce che rappresentano **dati ricevuti dall'API** → suffisso `Response` → es. `ICorsoResponse`
- Interfacce che rappresentano **dati inviati all'API** → suffisso `Request` → es. `ICorsiRequest`

---

### File dedicato per feature

Ogni area funzionale deve avere il proprio file `<feature>.models.ts` nella cartella `models/`.
Non inserire mai interfacce di una feature in un file `models/` di un'altra feature.

| ❌ Vietato | ✅ Corretto |
|---|---|
| `ICorso`, `CorsiRequest` in `divisa.models.ts` | `ICorsoResponse`, `ICorsiRequest` in `corso.models.ts` |
| Interfacce miste di feature diverse nello stesso file | Un file per feature: `divisa.models.ts`, `corso.models.ts`, ... |

---

### Esempi completi

```typescript
// ✅ file: features/corsi/models/corso.models.ts
export interface ICorsoResponse {
  id: number;
  descrizione: string;
  dataInizio: string;
}

export interface ICorsiRequest {
  nomeTabella: string;
  id?: number;
  desLike?: string;
}

// ❌ SBAGLIATO — interfaccia senza prefisso I
export interface CorsoResponse { ... }

// ❌ SBAGLIATO — interfaccia definita inline nel componente
@Component({ ... })
export class CorsiComponent {
  interface CorsoItem { id: number; des: string; } // ← vietato
}
```
