# User-Friendly Error Messages — ScheduledTasks Component

## Panoramica

Il componente `ScheduledTasksComponent` implementa un sistema avanzato di **messaggi di errore user-friendly** che converte i tecnicismi di validazione backend in messaggi chiari e comprensibili per gli utenti finali.

## Obiettivi

✅ **Chiarezza**: Niente tecnicismi — solo lingua naturale italiana  
✅ **Guidanza**: Ogni errore include un **hint pratico** su come ripararlo  
✅ **Visibilità**: Emoji (❌, 💡, 🔐, ⚠️) per distinguere i tipi di errore  
✅ **Completezza**: Tutti i campi della feature hanno messaggi dedicati  

## Struttura Implementativa

### 1. Dizionario `fieldLabelsAndHints`

Mappa ogni campo della form con:
- **Label**: Nome user-friendly del campo
- **Hint**: Spiegazione pratica + esempio

```typescript
private readonly fieldLabelsAndHints: Record<string, { label: string; hint: string }> = {
  'FutId': {
    label: 'ID del Task',
    hint: 'Identificativo univoco del task (max 20 caratteri, es: CMSG, UPLOAD, SYNC)'
  },
  'FutDes': {
    label: 'Descrizione',
    hint: 'Cosa fa questo task? (max 50 caratteri, es: "Carica elenco messaggi")'
  },
  'FutTimeout': {
    label: 'Timeout (ms)',
    hint: 'Tempo massimo di esecuzione in millisecondi (100-10.000.000, es: 5000 = 5 secondi)'
  },
  // ... tutti gli altri campi
};
```

### 2. Metodo `buildUserFriendlyError()`

Converte errori tecnici in messaggi user-friendly:

```typescript
private buildUserFriendlyError(fieldName: string, originalMessage: string): string {
  // Estrae il tipo di errore dal messaggio tecnico
  // - "non può superare" → "troppi caratteri (massimo X consentiti)"
  // - "obbligatorio" → "campo obbligatorio"
  // - "deve essere tra" → "valore non valido"
  // - "formato" → "formato non corretto"
  
  // Ritorna: "❌ [Label]: [Messaggio]\n💡 [Hint pratico]"
}
```

### 3. Metodo `getDetailedErrorMessage()`

Gestisce errori HTTP e forma composte:

```typescript
private getDetailedErrorMessage(error: HttpErrorResponse): string {
  // 400/422: Errori di validazione
  //   → Converte ogni errore di campo con buildUserFriendlyError()
  //   → Aggiunge sezione "**Verifica:**" con checklist
  
  // 401/403: Autorizzazione
  //   → "🔐 Non sei autorizzato. Verifica le tue credenziali..."
  
  // 500: Server error
  //   → "⚠️ Errore del server. Contatta l'amministratore..."
}
```

## Esempi di Messaggi User-Friendly

### Errore 1: Descrizione troppo lunga

**Prima (Tecnico):**
```
FutDes: FutDes non può superare 50 caratteri.
```

**Dopo (User-Friendly):**
```
❌ Descrizione: troppi caratteri (massimo 50 consentiti)
💡 Cosa fa questo task? (max 50 caratteri, es: "Carica elenco messaggi")
```

### Errore 2: Campo obbligatorio mancante

**Prima:**
```
FutId: FutId è obbligatorio.
```

**Dopo:**
```
❌ ID del Task: campo obbligatorio
💡 Identificativo univoco del task (max 20 caratteri, es: CMSG, UPLOAD, SYNC)
```

### Errore 3: Timeout non valido

**Prima:**
```
FutTimeout: FutTimeout deve essere tra 100 e 10.000.000 ms.
```

**Dopo:**
```
❌ Timeout (ms): valore non valido
💡 Tempo massimo di esecuzione in millisecondi (100-10.000.000, es: 5000 = 5 secondi)
```

### Errore 4: Orario in formato sbagliato

**Prima:**
```
FutStart: FutStart ha formato non valido.
```

**Dopo:**
```
❌ Orario di Inizio: formato non corretto
💡 A che ora iniziare? (formato: HH:MM:SS, es: 08:30:00)
```

## Notifiche Strutturate (DevExtreme)

Quando ci sono **più errori**, la notifica mostra:

```
❌ **Errori nel salvataggio:**

❌ Descrizione: troppi caratteri (massimo 50 consentiti)
💡 Cosa fa questo task? (max 50 caratteri, es: "Carica elenco messaggi")

❌ Timeout (ms): valore non valido
💡 Tempo massimo di esecuzione in millisecondi (100-10.000.000, es: 5000 = 5 secondi)

💡 **Verifica:**
- Tutti i campi obbligatori sono compilati?
- I valori rientrano nei limiti?
- Il formato è corretto?
```

**Timeout**: 8 secondi (per consentire la lettura dei dettagli)

## Campi Supportati

| Campo | Label | Hint Pratico |
|---|---|---|
| `FutId` | ID del Task | Identificativo univoco (max 20 caratteri) |
| `FutDes` | Descrizione | Cosa fa il task? (max 50 caratteri) |
| `FutFunname` | Nome Funzione | Nome da eseguire (max 50 caratteri) |
| `FutScriptname` | Script Name | Nome script (max 50 caratteri) |
| `FutTimeout` | Timeout (ms) | Tempo max esecuzione (100-10M millisecondi) |
| `FutStart` | Orario di Inizio | Formato HH:MM:SS (es: 08:30:00) |
| `FutEnd` | Orario di Fine | Formato HH:MM:SS (es: 20:30:00) |
| `FutPeriodtyp` | Tipo di Periodo | D=giorno, W=settimana, M=mese, H=ora |
| `FutPeriod` | Ogni Quanti Periodi | Es: 2 giorni, 3 settimane |
| `FutNamedll` | Percorso DLL | Percorso completo della DLL |
| `FutClassname` | Nome Classe | Classe .NET (es: MyNamespace.MyClass) |
| `FutErrcount` | Conteggio Errori | Numero di errori tollerati |
| `FutActive` | Task Attivo | Abilita/disabilita esecuzione |
| `FutOffline` | Modalità Offline | Esecuzione senza connessione |
| `FutAutatt` | Schedulazione Automatica | Esecuzione automatica |
| `FutTrace` | Tracciamento | Registra esecuzioni |
| `FutHosval` | Validazione Host | Valida host prima dell'esecuzione |

## Test Coverage

File: `scheduled-tasks-error-handling.spec.ts`

**36 test** coprendo:

✅ Errori di validazione (422, 400)  
✅ Errori di autorizzazione (401, 403)  
✅ Errori server (500)  
✅ Errori senza dettagli (fallback)  
✅ Messaggi user-friendly per ogni tipo di validazione  
✅ Emojis e hint pratici  
✅ Lingua naturale italiana  
✅ Casi edge (errori vuoti, campi non trovati, ecc.)  

## Utilizzo nel Component

### OnSubmit (Creazione)

```typescript
onSubmit(): void {
  if (!this.validateForm()) return;
  const command = this.buildCommand();
  this.isSaving.set(true);
  this.tabelleService.insertFunzioneSchedule(command)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.isSaving.set(false);
        notify(`✅ Task "${command.futId}" creato con successo`, 'success', 3000);
        this.closePopup();
        this.loadFunzioniSchedule();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        const errorMessage = this.getDetailedErrorMessage(err);  // ← Converte in user-friendly
        notify(errorMessage, 'error', 8000);  // ← 8 sec per leggere
      },
    });
}
```

### OnUpdate (Modifica)

Stesso flusso di `onSubmit()` con `updateFunzioneSchedule()`.

### OnDelete (Eliminazione)

```typescript
onDelete(data: FunzioniScheduleResponse): void {
  this.tabelleService.deleteFunzioneSchedule({...})
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        notify(`✅ Task "${data.futId}" eliminato`, 'success', 3000);
        this.loadFunzioniSchedule();
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage = this.getDetailedErrorMessage(err);
        notify(errorMessage, 'error', 8000);
      },
    });
}
```

## Best Practice

1. **Non aggiungere HTML/markdown** nella notifica — DevExtreme le renderizza come testo  
2. **Emoji unicode** sono supportati nativamente nel browser  
3. **Timeout 8000ms** è corretto per permettere la lettura di errori multipli  
4. **Hint sempre presente** — aumenta UX anche per utenti esperti  
5. **Lingua italiana naturale** — evita abbreviazioni e tecnicismi  

## Sviluppi Futuri

- [ ] Internazionalizzazione (IT, EN, FR, DE) usando Transloco
- [ ] Suggerimenti automatici ("Hai dimenticato il timeout?")
- [ ] Collegamento diretto ai campi con errore nel form (highlight in rosso)
- [ ] Salvataggio dei messaggi di errore nei log di traccia

## File Correlati

- **Component**: `scheduled-tasks.component.ts`
- **Template**: `scheduled-tasks.component.html`
- **Spec**: `scheduled-tasks-error-handling.spec.ts`
- **Service**: `../../services/tabelle.service.ts`
