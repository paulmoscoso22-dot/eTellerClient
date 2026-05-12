import { ErrorHandler, Injectable, inject, isDevMode } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly errorHandlerService = inject(ErrorHandlerService);

  handleError(error: unknown): void {
    if (isDevMode()) {
      console.error('[GlobalErrorHandler]', error);
    }
    this.errorHandlerService.handleUnexpected(error);
  }
}
