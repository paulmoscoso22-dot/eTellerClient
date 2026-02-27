import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { LoginCommand, LoginResponse } from '../domain/auth.models';

/**
 * Authentication Service
 * Handles authentication-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);

  /**
   * Login with user credentials
   * @param command - Login command with user credentials and session info
   * @returns Observable of LoginResponse
   */
  login(command: LoginCommand): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('Authentication/login', command);
  }
}
