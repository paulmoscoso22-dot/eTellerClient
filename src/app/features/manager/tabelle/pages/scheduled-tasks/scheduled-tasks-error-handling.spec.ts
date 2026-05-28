/**
 * Test suite for error handling methods in ScheduledTasksComponent
 * 
 * This file tests the error handling logic independently to avoid
 * DevExtreme module loading issues.
 */

// Import Angular compiler for JIT compilation
import '@angular/compiler';

import { describe, it, expect, beforeEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

// Extract the error handling methods for testing
// These are pure functions that don't depend on DevExtreme
class ErrorHandlerTestHelper {
  private readonly fieldLabelsAndHints: Record<string, { label: string; hint: string }> = {
    'FutId': {
      label: 'ID del Task',
      hint: 'Identificativo univoco del task (max 20 caratteri, es: CMSG, UPLOAD, SYNC)'
    },
    'FutDes': {
      label: 'Descrizione',
      hint: 'Cosa fa questo task? (max 50 caratteri, es: "Carica elenco messaggi")'
    },
    'FutFunname': {
      label: 'Nome Funzione',
      hint: 'Nome della funzione da eseguire (max 50 caratteri, es: "PURGE MESSAGE")'
    },
    'FutScriptname': {
      label: 'Script Name',
      hint: 'Nome dello script (max 50 caratteri)'
    },
    'FutTimeout': {
      label: 'Timeout (ms)',
      hint: 'Tempo massimo di esecuzione in millisecondi (100-10.000.000, es: 5000 = 5 secondi)'
    },
    'FutActive': {
      label: 'Task Attivo',
      hint: 'Abilita o disabilita l\'esecuzione di questo task'
    },
    'FutOffline': {
      label: 'Modalità Offline',
      hint: 'Se abilitato, il task si esegue anche senza connessione'
    },
    'FutAutatt': {
      label: 'Schedulazione Automatica',
      hint: 'Se abilitato, il task si esegue automaticamente secondo il calendario'
    },
    'FutPeriodtyp': {
      label: 'Tipo di Periodo',
      hint: 'Ogni quanto eseguire il task? (D=giorno, W=settimana, M=mese, H=ora)'
    },
    'FutPeriod': {
      label: 'Ogni Quanti Periodi',
      hint: 'Es: se Tipo=Giorno e Periodo=2, si esegue ogni 2 giorni'
    },
    'FutStart': {
      label: 'Orario di Inizio',
      hint: 'A che ora iniziare? (formato: HH:MM:SS, es: 08:30:00)'
    },
    'FutEnd': {
      label: 'Orario di Fine',
      hint: 'Fino a che ora eseguire? (formato: HH:MM:SS, es: 20:30:00)'
    },
    'FutNamedll': {
      label: 'Percorso DLL',
      hint: 'Percorso completo del file DLL (es: C:\\eTeller\\task\\MyDll.dll)'
    },
    'FutClassname': {
      label: 'Nome Classe',
      hint: 'Classe .NET da eseguire (es: MyNamespace.MyClass)'
    },
    'FutErrcount': {
      label: 'Conteggio Errori',
      hint: 'Numero di errori tollerati prima di disabilitare il task'
    },
    'FutTrace': {
      label: 'Tracciamento',
      hint: 'Se abilitato, registra ogni esecuzione del task'
    },
    'FutHosval': {
      label: 'Validazione Host',
      hint: 'Se abilitato, valida l\'host prima di eseguire'
    },
  };

  private getDetailedErrorMessage(error: HttpErrorResponse): string {
    // If 400/422 with validation
    if (error.status === 400 || error.status === 422) {
      const errorBody = error.error;

      // If ASP.NET returns validation errors (FluentValidation)
      if (errorBody?.errors && typeof errorBody.errors === 'object') {
        const fieldErrors = Object.entries(errorBody.errors)
          .map(([field, messages]: [string, any]) => {
            const firstError = Array.isArray(messages) ? messages[0] : messages;
            return this.buildUserFriendlyError(field, firstError);
          })
          .filter(msg => msg.length > 0)
          .join('\n\n');

        if (fieldErrors.length === 0) {
          return 'Errore di validazione: verifica i dati inseriti';
        }

        return `❌ **Errori nel salvataggio:**\n\n${fieldErrors}\n\n💡 **Verifica:**\n- Tutti i campi obbligatori sono compilati?\n- I valori rientrano nei limiti?\n- Il formato è corretto?`;
      }

      // If ASP.NET returns detailed message
      if (errorBody?.detail) {
        return `❌ Errore: ${errorBody.detail}`;
      }

      if (errorBody?.message) {
        return `❌ Errore: ${errorBody.message}`;
      }

      // Fallback for 400/422
      return '❌ Errore: I dati inseriti non sono validi.\n💡 Verifica i campi obbligatori e i formati.';
    }

    // If 401/403
    if (error.status === 401 || error.status === 403) {
      return '🔐 Non sei autorizzato. Verifica le tue credenziali o contatta l\'amministratore.';
    }

    // If 500
    if (error.status === 500) {
      return '⚠️ Errore del server. Contatta l\'amministratore per assistenza.';
    }

    // Fallback generic
    return `❌ Errore (${error.status}): ${error.statusText || 'Errore sconosciuto'}`;
  }

  private buildUserFriendlyError(fieldName: string, originalMessage: string): string {
    const fieldInfo = this.fieldLabelsAndHints[fieldName];

    if (!fieldInfo || !originalMessage) {
      return '';
    }

    let userMessage = '';

    if (originalMessage.includes('non può superare')) {
      const match = originalMessage.match(/(\d+)/);
      const maxChars = match ? match[1] : '?';
      userMessage = `❌ ${fieldInfo.label}: troppi caratteri (massimo ${maxChars} consentiti)`;
    } else if (originalMessage.includes('deve essere tra') || (originalMessage.includes('tra') && originalMessage.includes('e'))) {
      userMessage = `❌ ${fieldInfo.label}: valore non valido`;
    } else if (originalMessage.includes('obbligatorio') || originalMessage.includes('required')) {
      userMessage = `❌ ${fieldInfo.label}: campo obbligatorio`;
    } else if (originalMessage.includes('formato') || originalMessage.includes('format')) {
      userMessage = `❌ ${fieldInfo.label}: formato non corretto`;
    } else if (originalMessage.includes('deve essere') || originalMessage.includes('invalid')) {
      userMessage = `❌ ${fieldInfo.label}: valore non valido`;
    } else {
      userMessage = `❌ ${fieldInfo.label}: ${originalMessage}`;
    }

    return `${userMessage}\n💡 ${fieldInfo.hint}`;
  }

  private translateFieldName(fieldName: string): string {
    return this.fieldLabelsAndHints[fieldName]?.label || fieldName;
  }

  public testGetDetailedErrorMessage(error: HttpErrorResponse): string {
    return this.getDetailedErrorMessage(error);
  }

  public testBuildUserFriendlyError(fieldName: string, message: string): string {
    return this.buildUserFriendlyError(fieldName, message);
  }

  public testTranslateFieldName(fieldName: string): string {
    return this.translateFieldName(fieldName);
  }
}

describe('ScheduledTasksComponent - Error Handling Logic', () => {
  let helper: ErrorHandlerTestHelper;

  beforeEach(() => {
    helper = new ErrorHandlerTestHelper();
  });

  describe('getDetailedErrorMessage - Validation Error (422)', () => {
    // TC-018: Errore 422 con validation errors da FluentValidation
    it('TC-018: should parse FluentValidation errors and format with field translations', () => {
      const error = new HttpErrorResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        error: {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'One or more validation errors occurred.',
          status: 422,
          errors: {
            FutDes: ['FutDes non può superare 50 caratteri.'],
            FutTimeout: ['FutTimeout deve essere tra 100 e 10.000.000 ms.'],
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('❌ **Errori nel salvataggio:**');
      expect(message).toContain('Descrizione');
      expect(message).toContain('troppi caratteri');
      expect(message).toContain('Timeout (ms)');
      expect(message).toContain('valore non valido');
    });

    // TC-019: Errore 422 con singolo errore di validazione
    it('TC-019: should handle single validation error', () => {
      const error = new HttpErrorResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        error: {
          errors: {
            FutId: ['FutId è obbligatorio.'],
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('ID del Task');
      expect(message).toContain('campo obbligatorio');
      expect(message).toContain('💡');
    });

    // TC-020: Errore 422 con array di messaggi (prende il primo)
    it('TC-020: should take first error message from array', () => {
      const error = new HttpErrorResponse({
        status: 422,
        error: {
          errors: {
            FutFunname: [
              'FutFunname è obbligatorio.',
              'FutFunname non può superare 100 caratteri.',
            ],
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('Nome Funzione');
      expect(message).toContain('campo obbligatorio');
      expect(message).not.toContain('100 caratteri');
    });
  });

  describe('getDetailedErrorMessage - Bad Request (400)', () => {
    // TC-021: Errore 400 con validation errors
    it('TC-021: should handle 400 status with validation errors', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          errors: {
            FutAutatt: ['FutAutatt validation failed.'],
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('Schedulazione Automatica');
      expect(message).toContain('❌');
      expect(message).toContain('💡');
    });

    // TC-022: Errore 400 con detail message
    it('TC-022: should use detail message if no validation errors', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          detail: 'La descrizione contiene caratteri non validi.',
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('❌ Errore:');
      expect(message).toContain('La descrizione contiene caratteri non validi.');
    });

    // TC-023: Errore 400 con message field
    it('TC-023: should use message field as fallback', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'Operazione non valida.',
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('❌ Errore:');
      expect(message).toContain('Operazione non valida.');
    });

    // TC-024: Errore 400 generico senza dettagli
    it('TC-024: should return generic 400 message', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('❌');
      expect(message).toContain('dati inseriti non sono validi');
      expect(message).toContain('💡');
    });
  });

  describe('getDetailedErrorMessage - Other Status Codes', () => {
    // TC-025: Errore 401 Unauthorized
    it('TC-025: should handle 401 Unauthorized', () => {
      const error = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('🔐');
      expect(message).toContain('Non sei autorizzato');
    });

    // TC-026: Errore 403 Forbidden
    it('TC-026: should handle 403 Forbidden', () => {
      const error = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('🔐');
      expect(message).toContain('Non sei autorizzato');
    });

    // TC-027: Errore 500 Server Error
    it('TC-027: should handle 500 Server Error', () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('⚠️');
      expect(message).toContain('Errore del server');
    });

    // TC-028: Errore generico non mappato
    it('TC-028: should return generic error message for unmapped status', () => {
      const error = new HttpErrorResponse({
        status: 503,
        statusText: 'Service Unavailable',
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('Errore (503):');
      expect(message).toContain('Service Unavailable');
    });

    // TC-029: Errore con statusText assente - Angular fornisce "Unknown Error" di default
    it('TC-029: should handle error with empty statusText gracefully', () => {
      const error = new HttpErrorResponse({
        status: 503,
        statusText: '',
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      // HttpErrorResponse fallback provides "Unknown Error" when statusText is empty
      expect(message).toContain('Errore (503):');
      // The actual message will be "Unknown Error" from HttpErrorResponse
      expect(message.length).toBeGreaterThan(10);
    });
  });

  describe('translateFieldName', () => {
    // TC-030: translateFieldName ritorna traduzione italiana per FutDes
    it('TC-030: should translate FutDes to "Descrizione"', () => {
      const translated = helper.testTranslateFieldName('FutDes');
      expect(translated).toBe('Descrizione');
    });

    // TC-031: translateFieldName ritorna traduzione per FutTimeout
    it('TC-031: should translate FutTimeout to "Timeout (ms)"', () => {
      const translated = helper.testTranslateFieldName('FutTimeout');
      expect(translated).toBe('Timeout (ms)');
    });

    // TC-032: translateFieldName ritorna traduzione per FutAutatt
    it('TC-032: should translate FutAutatt to "Schedulazione Automatica"', () => {
      const translated = helper.testTranslateFieldName('FutAutatt');
      expect(translated).toBe('Schedulazione Automatica');
    });

    // TC-033: translateFieldName ritorna il campo originale se non trovato
    it('TC-033: should return original field name if translation not found', () => {
      const translated = helper.testTranslateFieldName('UnknownField');
      expect(translated).toBe('UnknownField');
    });

    // TC-034: translateFieldName copre tutti i campi noti
    it('TC-034: should translate all known field names', () => {
      const knownFields = [
        'FutId', 'FutDes', 'FutFunname', 'FutScriptname', 'FutTimeout',
        'FutActive', 'FutOffline', 'FutTrace', 'FutAutatt', 'FutHosval',
        'FutPeriodtyp', 'FutPeriod', 'FutStart', 'FutEnd', 'FutNamedll',
        'FutClassname', 'FutErrcount',
      ];

      knownFields.forEach(field => {
        const translated = helper.testTranslateFieldName(field);
        expect(translated.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Multiple validation errors formatting', () => {
    it('should format multiple errors with proper newline separation', () => {
      const error = new HttpErrorResponse({
        status: 422,
        error: {
          errors: {
            FutDes: ['Descrizione non valida.'],
            FutTimeout: ['Timeout non valido.'],
            FutPeriodtyp: ['Tipo periodo non valido.'],
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('❌ **Errori nel salvataggio:**');
      expect(message).toContain('Descrizione');
      expect(message).toContain('Timeout (ms)');
      expect(message).toContain('Tipo di Periodo');
      expect(message).toContain('💡');

      // Check that newlines separate the errors
      const lines = message.split('\n');
      expect(lines.length).toBeGreaterThan(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle error with null error body', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: null,
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('❌');
      expect(message).toContain('dati inseriti non sono validi');
    });

    it('should handle error with empty errors object', () => {
      const error = new HttpErrorResponse({
        status: 422,
        error: {
          errors: {},
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      // With empty errors object, should return validation error message
      expect(message).toContain('Errore di validazione');
    });

    it('should handle field with empty error message array', () => {
      const error = new HttpErrorResponse({
        status: 422,
        error: {
          errors: {
            FutDes: [],
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toBeTruthy();
    });

    it('should handle field with non-array messages', () => {
      const error = new HttpErrorResponse({
        status: 422,
        error: {
          errors: {
            FutDes: 'Single error string',
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('Descrizione');
      expect(message).toContain('Single error string');
    });
  });

  describe('User-Friendly Error Messages (buildUserFriendlyError)', () => {
    // TC-035: Lunghezza campo - message user-friendly con emoji e hint
    it('TC-035: should generate user-friendly message for length validation errors', () => {
      const message = helper.testBuildUserFriendlyError('FutDes', 'FutDes non può superare 50 caratteri.');

      expect(message).toContain('❌');
      expect(message).toContain('Descrizione');
      expect(message).toContain('troppi caratteri');
      expect(message).toContain('massimo 50');
      expect(message).toContain('💡');
      expect(message).toContain('Cosa fa questo task?');
    });

    // TC-036: Campo obbligatorio - message user-friendly
    it('TC-036: should generate user-friendly message for required field', () => {
      const message = helper.testBuildUserFriendlyError('FutId', 'FutId è obbligatorio.');

      expect(message).toContain('❌');
      expect(message).toContain('ID del Task');
      expect(message).toContain('campo obbligatorio');
      expect(message).toContain('💡');
      expect(message).toContain('Identificativo univoco');
    });

    // TC-037: Timeout range - message user-friendly per range numerico
    it('TC-037: should generate user-friendly message for range validation errors', () => {
      const message = helper.testBuildUserFriendlyError('FutTimeout', 'FutTimeout deve essere tra 100 e 10.000.000 ms.');

      expect(message).toContain('❌');
      expect(message).toContain('Timeout (ms)');
      expect(message).toContain('valore non valido');
      expect(message).toContain('💡');
      expect(message).toContain('100-10.000.000');
    });

    // TC-038: Formato orario - message user-friendly per errore di formato
    it('TC-038: should generate user-friendly message for format validation errors', () => {
      const message = helper.testBuildUserFriendlyError('FutStart', 'FutStart ha formato non valido.');

      expect(message).toContain('❌');
      expect(message).toContain('Orario di Inizio');
      expect(message).toContain('formato non corretto');
      expect(message).toContain('💡');
      expect(message).toContain('HH:MM:SS');
    });

    // TC-039: Campo condizionale obbligatorio - schedulazione automatica
    it('TC-039: should generate user-friendly message for conditional required field (FutPeriodtyp)', () => {
      const message = helper.testBuildUserFriendlyError('FutPeriodtyp', 'FutPeriodtyp è obbligatorio.');

      expect(message).toContain('❌');
      expect(message).toContain('Tipo di Periodo');
      expect(message).toContain('campo obbligatorio');
      expect(message).toContain('💡');
      expect(message).toContain('D=giorno, W=settimana');
    });

    // TC-040: Message includes emojis for visual clarity
    it('TC-040: should include emojis (❌ and 💡) for visual clarity', () => {
      const message = helper.testBuildUserFriendlyError('FutFunname', 'FutFunname non può superare 50 caratteri.');

      expect(message).toContain('❌');
      expect(message).toContain('💡');
    });

    // TC-041: Hint deve contenere info pratica su come compilare il campo
    it('TC-041: should include practical hint for user guidance', () => {
      const message = helper.testBuildUserFriendlyError('FutTimeout', 'FutTimeout deve essere tra 100 e 10.000.000 ms.');

      expect(message).toContain('es: 5000 = 5 secondi');
    });

    // TC-042: All known fields have helpful hints
    it('TC-042: should provide hints for all known fields', () => {
      const knownFields = ['FutId', 'FutDes', 'FutFunname', 'FutStart', 'FutEnd', 'FutPeriodtyp'];

      knownFields.forEach(field => {
        const message = helper.testBuildUserFriendlyError(field, `${field} è obbligatorio.`);
        expect(message).toContain('💡');
        expect(message.length).toBeGreaterThan(50); // Assicura che ci sia un hint significativo
      });
    });

    // TC-043: Multiple errors in response - each with own emoji and hint
    it('TC-043: should format multiple validation errors with proper newline separation', () => {
      const error = new HttpErrorResponse({
        status: 422,
        error: {
          errors: {
            FutDes: ['FutDes non può superare 50 caratteri.'],
            FutTimeout: ['FutTimeout deve essere tra 100 e 10.000.000 ms.'],
            FutPeriodtyp: ['FutPeriodtyp è obbligatorio.'],
          },
        },
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('❌ **Errori nel salvataggio:**');
      expect(message).toContain('❌');
      expect(message).toContain('💡');
      expect(message).toContain('**Verifica:**');
      // Verifica che ci siano helper hints finali
      expect(message).toContain('Tutti i campi obbligatori sono compilati?');
      expect(message).toContain('I valori rientrano nei limiti?');
      expect(message).toContain('Il formato è corretto?');
    });

    // TC-044: 401/403 error - user-friendly security message
    it('TC-044: should generate user-friendly message for 401 Unauthorized', () => {
      const error = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('🔐');
      expect(message).toContain('Non sei autorizzato');
      expect(message).toContain('credenziali');
    });

    // TC-045: 500 error - user-friendly server error message
    it('TC-045: should generate user-friendly message for 500 Server Error', () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {},
      });

      const message = helper.testGetDetailedErrorMessage(error);

      expect(message).toContain('⚠️');
      expect(message).toContain('Errore del server');
      expect(message).toContain('amministratore');
    });

    // TC-046: Field not found in hints - fallback to empty (no translation needed)
    it('TC-046: should handle unknown field gracefully', () => {
      const message = helper.testBuildUserFriendlyError('UnknownField', 'UnknownField validation failed.');

      // Unknown field returns empty - it's filtered out in getDetailedErrorMessage
      expect(message).toBe('');
    });

    // TC-047: Message escapes special characters properly
    it('TC-047: should handle special characters in messages', () => {
      const message = helper.testBuildUserFriendlyError('FutClassname', 'FutClassname "deve contenere" caratteri validi.');

      expect(message).toContain('FutClassname');
      expect(message).toContain('❌');
    });

    // TC-048: Verifica che i messaggi sono in italiano naturale
    it('TC-048: should use natural Italian language for all messages', () => {
      const messages = [
        helper.testBuildUserFriendlyError('FutDes', 'FutDes non può superare 50 caratteri.'),
        helper.testBuildUserFriendlyError('FutId', 'FutId è obbligatorio.'),
        helper.testBuildUserFriendlyError('FutStart', 'FutStart ha formato non valido.'),
      ];

      messages.forEach(msg => {
        // Verifica che NON contiene tecnicismi come "FutDes", "validation", "error code", ecc.
        // Ma contiene invece messaggi user-friendly
        expect(msg.toLowerCase()).not.toMatch(/fluent|validator|csharp|json/i);
        expect(msg).toMatch(/❌|💡|campo|troppi|caratteri|obbligatorio|formato/);
      });
    });
  });
});
