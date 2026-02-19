import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
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

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
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
  private registeredCredentials: LoginRequest | null = null;

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
    // TODO: Uncomment when server is available
    // return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
    
    // Mock response for development
    return of({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        username: credentials.username,
        email: credentials.username + '@example.com',
      },
    });
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    // TODO: Uncomment when server is available
    // return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
    
    // Mock response for development
    return of({
      message: 'User registered successfully',
      user: {
        id: '1',
        username: data.username,
        email: data.email,
      },
    });
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
    
    // TODO: Uncomment when server is available
    // return this.http.post<void>(`${this.apiUrl}/logout`, {});
    
    // Mock response for development
    return of(void 0);
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

  /**
   * Save registered credentials for automatic login
   */
  saveRegisteredCredentials(credentials: LoginRequest): void {
    this.registeredCredentials = { ...credentials };
  }

  /**
   * Get registered credentials
   */
  getRegisteredCredentials(): LoginRequest | null {
    return this.registeredCredentials ? { ...this.registeredCredentials } : null;
  }

  /**
   * Clear registered credentials
   */
  clearRegisteredCredentials(): void {
    this.registeredCredentials = null;
  }
}
