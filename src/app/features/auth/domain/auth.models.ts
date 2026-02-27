/**
 * Login command request interface
 */
export interface LoginCommand {
  userId: string;
  password: string;
  ipAddress: string;
  isCashDesk: boolean;
  cashDeskId?: string | null;
  branchId?: string | null;
  macAddress?: string | null;
  forceLogin: boolean;
  isNewSession: boolean;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
