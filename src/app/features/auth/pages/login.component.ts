import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxFormModule,
  DxButtonModule,
  DxLoadIndicatorModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { AUTH_RESULT_CODE, ILoginRequest, ILoginResponse } from '../domain/auth.models';
import { AuthStore } from '../auth.store';
import { AuthService } from '../services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ForceLoginComponent } from './force-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DxFormModule, DxButtonModule, DxLoadIndicatorModule, DxTextBoxModule, ForceLoginComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly isLoading = signal(false);
  readonly showForceLoginPopup = signal(false);
  private pendingRequest: ILoginRequest | null = null;

  readonly formData = signal({ userId: '', password: '' });

  updateUserId(value: string): void {
    this.formData.update(f => ({ ...f, userId: value }));
  }

  updatePassword(value: string): void {
    this.formData.update(f => ({ ...f, password: value }));
  }

  onLogin(): void {
    const { userId, password } = this.formData();

    if (!userId.trim() || !password.trim()) {
      this.errorHandler.showWarning('Inserire userId e password');
      return;
    }

    const request: ILoginRequest = {
      userId: userId.trim(),
      password,
      traStation: window.location.hostname,
      forceLogin: false,
    };

    this.isLoading.set(true);
    this.authService.login(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.handleLoginResponse(response, request);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorHandler.showBusinessError('Errore di connessione al server');
      },
    });
  }

  onConfirmForceLogin(): void {
    if (!this.pendingRequest) return;
    const request = this.pendingRequest;
    this.showForceLoginPopup.set(false);
    this.isLoading.set(true);
    this.authService.forceLogin(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.pendingRequest = null;
        this.handleLoginResponse(response, request);
      },
      error: () => {
        this.isLoading.set(false);
        this.pendingRequest = null;
        this.errorHandler.showBusinessError('Errore durante il force login');
      },
    });
  }

  onCancelForceLogin(): void {
    this.showForceLoginPopup.set(false);
    this.pendingRequest = null;
  }

  private handleLoginResponse(response: ILoginResponse, request: ILoginRequest): void {
    switch (response.resultCode) {
      case AUTH_RESULT_CODE.OK:
        this.authStore.set(response.accessToken!);
        this.router.navigate(['/']);
        break;
      case AUTH_RESULT_CODE.USER_ALREADY_LOGGED:
        this.pendingRequest = request;
        this.showForceLoginPopup.set(true);
        break;
      case AUTH_RESULT_CODE.MUST_CHANGE_PASSWORD:
      case AUTH_RESULT_CODE.PASSWORD_EXPIRED:
        this.router.navigate(['/auth/change-password']);
        break;
      case AUTH_RESULT_CODE.INVALID_CREDENTIALS:
        this.errorHandler.showBusinessError(response.message ?? 'Credenziali non valide');
        break;
      default:
        this.errorHandler.showBusinessError(response.message ?? 'Errore di accesso');
        break;
    }
  }
}
