import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';
import {
  ILoginRequest,
  ILoginResponse,
  IChangePasswordRequest,
  IChangePasswordResponse,
} from '../domain/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);

  login(request: ILoginRequest): Observable<ILoginResponse> {
    return this.apiService.post<ILoginResponse>(`${environment.authApiUrl}/auth/login`, request);
  }

  forceLogin(request: ILoginRequest): Observable<ILoginResponse> {
    const forceRequest: ILoginRequest = { ...request, forceLogin: true };
    return this.apiService.post<ILoginResponse>(`${environment.authApiUrl}/auth/force-login`, forceRequest);
  }

  logout(sessionId: string, userId: string, traStation: string): Observable<{ resultCode: string }> {
    return this.apiService.post<{ resultCode: string }>(`${environment.authApiUrl}/auth/logout`, {
      sessionId,
      userId,
      traStation,
    });
  }

  changePassword(request: IChangePasswordRequest): Observable<IChangePasswordResponse> {
    return this.apiService.post<IChangePasswordResponse>(`${environment.authApiUrl}/auth/change-password`, request);
  }
}
