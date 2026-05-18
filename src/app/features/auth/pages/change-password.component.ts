import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DxTextBoxModule, DxButtonModule, DxLoadIndicatorModule } from 'devextreme-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AUTH_RESULT_CODE, IChangePasswordRequest } from '../domain/auth.models';
import { AuthStore } from '../auth.store';
import { AuthService } from '../services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [DxTextBoxModule, DxButtonModule, DxLoadIndicatorModule],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Leggi ?reason dal query param
  private readonly reason = toSignal(
    this.route.queryParamMap.pipe(map(p => p.get('reason') ?? '')),
    { initialValue: '' }
  );

  readonly title = computed(() => {
    const r = this.reason();
    if (r === 'expired') return 'Password scaduta';
    if (r === 'required') return 'Cambio password obbligatorio';
    return 'Cambia password';
  });

  readonly subtitle = computed(() => {
    const r = this.reason();
    if (r === 'expired') return 'La tua password è scaduta. Imposta una nuova password per continuare.';
    if (r === 'required') return 'È necessario cambiare la password prima di accedere.';
    return '';
  });

  readonly isLoading = signal(false);
  readonly formData = signal({ currentPassword: '', newPassword: '', confirmPassword: '' });
  readonly inlineError = signal('');

  updateCurrentPassword(value: string): void { this.formData.update(f => ({ ...f, currentPassword: value })); }
  updateNewPassword(value: string): void { this.formData.update(f => ({ ...f, newPassword: value })); }
  updateConfirmPassword(value: string): void { this.formData.update(f => ({ ...f, confirmPassword: value })); }

  onSubmit(): void {
    const { currentPassword, newPassword, confirmPassword } = this.formData();
    this.inlineError.set('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.errorHandler.showWarning('Compilare tutti i campi');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.inlineError.set('Le due password non coincidono.');
      return;
    }

    const userId = this.authStore.currentUser()?.userId;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const request: IChangePasswordRequest = {
      userId,
      currentPassword,
      newPassword,
      traStation: window.location.hostname,
    };

    this.isLoading.set(true);
    this.authService.changePassword(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        switch (response.resultCode) {
          case AUTH_RESULT_CODE.OK:
            notify('Password aggiornata con successo.', 'success', 3000);
            this.router.navigate(['/auth/login']);
            break;
          case AUTH_RESULT_CODE.INVALID_CURRENT_PASSWORD:
            this.inlineError.set('La password corrente non è corretta.');
            break;
          case AUTH_RESULT_CODE.HISTORY_VIOLATION:
            this.inlineError.set('La nuova password è già stata usata di recente.');
            break;
          default:
            notify('Errore del server. Riprovare.', 'error', 4000);
            break;
        }
      },
      error: () => {
        this.isLoading.set(false);
        notify('Errore di connessione.', 'error', 4000);
      },
    });
  }
}
