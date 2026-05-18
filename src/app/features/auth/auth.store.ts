import { Injectable, computed, signal } from '@angular/core';
import { IUserSession } from './domain/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  // Stato interno
  private readonly _token = signal<string | null>(null);
  private readonly _currentUser = signal<IUserSession | null>(null);

  // Stato pubblico (read-only)
  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly roles = computed(() => ({
    canUseTeller: this._currentUser()?.canUseTeller ?? false,
  }));

  /**
   * Imposta il token e la sessione utente dopo un login riuscito.
   * Decodifica il JWT (solo payload base64) per estrarre i claim.
   */
  set(token: string): void {
    this._token.set(token);
    const session = this.decodeJwt(token);
    this._currentUser.set(session);
  }

  /**
   * Azzera tutto lo stato di autenticazione (logout, 401).
   */
  reset(): void {
    this._token.set(null);
    this._currentUser.set(null);
  }

  /**
   * Decodifica il payload JWT (base64) senza librerie esterne.
   * NOTA: NON verifica la firma — la validazione è responsabilità del backend.
   */
  private decodeJwt(token: string): IUserSession | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      return {
        userId: payload['sub'] ?? '',
        name: payload['name'] ?? '',
        branchId: payload['branch_id'] ?? '',
        language: payload['language'] ?? '',
        canUseTeller: payload['can_use_teller'] === true || payload['can_use_teller'] === 'true',
        cashDeskId: payload['cash_desk_id'],
        sessionId: payload['session_id'] ?? '',
        tokenExpiry: payload['exp'] ?? 0,
      };
    } catch {
      return null;
    }
  }
}
