// Richiesta di login
export interface ILoginRequest {
  userId: string;
  password: string;
  traStation: string;    // IP client — assegnato automaticamente dal servizio
  forceLogin?: boolean;  // default false
}

// Risposta del backend al login
export interface ILoginResponse {
  resultCode: string;
  message?: string;
  accessToken?: string;
  requiresPasswordChange?: boolean;
  userAlreadyLogged?: boolean;
  sessionId?: string;
}

// Sessione utente estratta dal JWT per AuthStore
export interface IUserSession {
  userId: string;        // claim: sub
  name: string;          // claim: name
  branchId: string;      // claim: branch_id
  language: string;      // claim: language
  canUseTeller: boolean; // claim: can_use_teller
  cashDeskId?: string;   // claim: cash_desk_id (opzionale)
  sessionId: string;     // claim: session_id
  tokenExpiry: number;   // claim: exp (Unix timestamp)
}

// Richiesta cambio password
export interface IChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  traStation: string;
}

// Risposta cambio password
export interface IChangePasswordResponse {
  resultCode: string;    // OK | INVALID_CURRENT_PASSWORD | HISTORY_VIOLATION | ERROR
  message?: string;
}

// Costanti ResultCode (evitare magic string)
export const AUTH_RESULT_CODE = {
  OK: 'OK',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_BLOCKED: 'USER_BLOCKED',
  USER_DISABLED: 'USER_DISABLED',
  PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',
  MUST_CHANGE_PASSWORD: 'MUST_CHANGE_PASSWORD',
  USER_ALREADY_LOGGED: 'USER_ALREADY_LOGGED',
  CASH_DESK_BUSY: 'CASH_DESK_BUSY',
  ERROR: 'ERROR',
  INVALID_CURRENT_PASSWORD: 'INVALID_CURRENT_PASSWORD',
  HISTORY_VIOLATION: 'HISTORY_VIOLATION',
} as const;

export type AuthResultCode = typeof AUTH_RESULT_CODE[keyof typeof AUTH_RESULT_CODE];
