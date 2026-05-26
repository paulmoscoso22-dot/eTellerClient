/**
 * Estrae il messaggio di errore da un oggetto errore HTTP o nativo.
 * Prova (in ordine):
 *  1. HttpErrorResponse.error.message  (backend restituisce { message: "..." })
 *  2. HttpErrorResponse.error.errors[0].message (formato FluentResults)
 *  3. HttpErrorResponse.message (HTTP status text)
 *  4. stringa diretta dell'errore
 *  5. fallback default
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;

  // HttpErrorResponse: err è un oggetto con proprietà 'error' (body) e 'message'
  if (typeof err === 'object') {
    const e = err as Record<string, unknown>;

    // Case 1: body con message diretto
    const body = e['error'];
    if (body && typeof body === 'object') {
      const b = body as Record<string, unknown>;
      const direct = b['message'];
      if (typeof direct === 'string' && direct.length > 0) return direct;

      // Case 2: FluentResults format { errors: [{ message: "..." }] }
      const errors = b['errors'];
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0] as Record<string, unknown>;
        const m = first?.['message'];
        if (typeof m === 'string' && m.length > 0) return m;
      }
    }

    // Case 3: HttpErrorResponse.message (es. "Http failure response for ... 400 ...")
    const httpMsg = e['message'];
    if (typeof httpMsg === 'string' && httpMsg.length > 0) return httpMsg;
  }

  // Case 4: errore nativo (Error, stringa, ecc.)
  if (typeof err === 'string') return err;
  const msgProp = (err as Record<string, unknown>)['message'];
  if (typeof msgProp === 'string' && msgProp.length > 0) return msgProp;

  return fallback;
}