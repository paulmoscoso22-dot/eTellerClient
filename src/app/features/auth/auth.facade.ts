import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ILoginRequest, ILoginResponse } from './domain/auth.models';
import { AuthService } from './services/auth.service';
import { AuthStore } from './auth.store';

export class AuthTemp {
  User: string = '127';
  Cassa: string = 'AA4';
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
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.checkAuthStatus();
  }

  /**
   * Check if user is authenticated via AuthStore
   */
  isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  /**
   * Check current auth status
   */
  private checkAuthStatus(): void {
    this.isAuthenticatedSubject.next(this.isAuthenticated());
  }

  /**
   * Login with user credentials
   * @param command - Login command with credentials and session info
   * @returns Observable of LoginResponse
   */
  login(command: ILoginRequest): Observable<ILoginResponse> {
    return this.authService.login(command).pipe(
      tap((response) => {
        // Store token only in AuthStore (memory) - NOT in localStorage
        if (response.accessToken) {
          this.authStore.set(response.accessToken);
        }
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error) => {
        this.isAuthenticatedSubject.next(false);
        return throwError(() => error);
      })
    );
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
   * Logout user - calls backend to invalidate session and resets local state
   */
  logout(): Observable<void> {
    return new Observable<void>((observer) => {
      const token = this.authStore.token();
      const user = this.authStore.currentUser();

      if (token && user) {
        this.authService.logout(user.sessionId, user.userId, '').subscribe({
          next: () => {
            this.authStore.reset();
            this.isAuthenticatedSubject.next(false);
            observer.next();
            observer.complete();
          },
          error: (error) => {
            // Even if backend call fails, reset local state
            this.authStore.reset();
            this.isAuthenticatedSubject.next(false);
            observer.next();
            observer.complete();
          },
        });
      } else {
        this.authStore.reset();
        this.isAuthenticatedSubject.next(false);
        observer.next();
        observer.complete();
      }
    });
  }

  getAuthTemp(): AuthTemp {
    return {
      User: '127',
      Cassa: 'AA4',
    };
  }
}