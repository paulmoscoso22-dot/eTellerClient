import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { UserInfo } from '../domain/user-info';
import { environment } from '../../environments/environment';
import { EnvironmentService } from './environment.service';

export interface UserInfoResponse {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private env: EnvironmentService
  ) {
    this.apiUrl = this.env.buildApiUrl('/user');
  }

  /**
   * Ottiene le informazioni dell'utente corrente
   */
  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfoResponse>(`${this.apiUrl}/current`).pipe(
      map(response => this.mapToUserInfo(response)),
      catchError(error => {
        console.error('Error fetching user info:', error);
        // Fallback a dati di esempio in caso di errore
        return of(this.getDefaultUser());
      })
    );
  }

  private mapToUserInfo(response: UserInfoResponse): UserInfo {
    return {
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      avatarUrl: response.avatarUrl
    };
  }

  private getDefaultUser(): UserInfo {
    return {
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com'
    };
  }

  /**
   * Calcola le iniziali dal nome e cognome
   */
  calculateInitials(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) {
      return '?';
    }

    const firstInitial = firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.charAt(0).toUpperCase() || '';
    
    return `${firstInitial}${lastInitial}`;
  }
}
