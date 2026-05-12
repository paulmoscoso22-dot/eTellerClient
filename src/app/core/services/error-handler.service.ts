import { Injectable, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import notify from 'devextreme/ui/notify';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {

  handleHttpError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      // Gestito da errorInterceptor con redirect — nessuna notify qui
      return;
    }

    if (error.status === 403) {
      this.showWarning('Non hai i permessi per eseguire questa operazione.');
      return;
    }

    if (error.status >= 500) {
      this.showError('Errore del server. Riprovare più tardi.');
      return;
    }

    if (error.status === 0) {
      this.showError('Impossibile raggiungere il server.');
      return;
    }
  }

  handleUnexpected(error: unknown): void {
    if (isDevMode()) {
      console.error('[ErrorHandlerService] Unexpected error:', error);
    }
    this.showError('Si è verificato un errore imprevisto.');
  }

  showBusinessError(message: string): void {
    this.showError(message);
  }

  showWarning(message: string): void {
    notify(message, 'warning', 4000);
  }

  showSuccess(message: string): void {
    notify(message, 'success', 3000);
  }

  showInfo(message: string): void {
    notify(message, 'info', 3000);
  }

  private showError(message: string): void {
    notify(message, 'error', 5000);
  }
}
