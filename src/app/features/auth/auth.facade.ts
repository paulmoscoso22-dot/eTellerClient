import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Auth Facade - Centralized API for authentication feature
 * Coordinates between auth services, state management, and components
 */
@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.checkAuthStatus();
  }

  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    return this.isBrowser && typeof localStorage !== 'undefined';
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Logout user
   */
  logout(): Observable<void> {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.removeItem('auth_token');
      } catch (error) {
        console.warn('Failed to remove auth token from localStorage', error);
      }
    }
    this.isAuthenticatedSubject.next(false);
    return this.http.post<void>(`${this.apiUrl}/logout`, {});
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to retrieve auth token from localStorage', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Check current auth status
   */
  private checkAuthStatus(): void {
    this.isAuthenticatedSubject.next(this.isAuthenticated());
  }

  /**
   * Store auth token
   */
  setAuthToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem('auth_token', token);
      } catch (error) {
        console.warn('Failed to store auth token in localStorage', error);
      }
    }
    this.isAuthenticatedSubject.next(true);
  }
}
