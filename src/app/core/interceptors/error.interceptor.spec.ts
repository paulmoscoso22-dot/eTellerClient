import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { AuthStore } from '../../features/auth/auth.store';

vi.mock('devextreme/ui/notify', () => ({ default: vi.fn() }));
import notify from 'devextreme/ui/notify';

const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJURVNUVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJicmFuY2hfaWQiOiIwMDEiLCJsYW5ndWFnZSI6Iml0IiwiY2FuX3VzZV90ZWxsZXIiOnRydWUsInNlc3Npb25faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjk5OTk5OTk5OTl9.' +
  'signature';

function makeErrorNext(status: number): HttpHandlerFn {
  return vi.fn(() =>
    throwError(() => new HttpErrorResponse({ status, url: 'http://api.test/data' }))
  ) as unknown as HttpHandlerFn;
}

describe('errorInterceptor', () => {
  let authStore: AuthStore;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  const req = new HttpRequest('GET', 'http://api.test/data');

  beforeEach(() => {
    mockRouter = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: Router, useValue: mockRouter },
      ],
    });
    authStore = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('401 → authStore.reset() called and navigate to /auth/login, error re-thrown', () => {
    authStore.set(MOCK_TOKEN);
    const errors: HttpErrorResponse[] = [];

    TestBed.runInInjectionContext(() => errorInterceptor(req, makeErrorNext(401))).subscribe({
      error: (err: HttpErrorResponse) => errors.push(err),
    });

    expect(authStore.isAuthenticated()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(errors[0].status).toBe(401);
  });

  it('403 → notify warning called, error re-thrown', () => {
    const errors: HttpErrorResponse[] = [];

    TestBed.runInInjectionContext(() => errorInterceptor(req, makeErrorNext(403))).subscribe({
      error: (err: HttpErrorResponse) => errors.push(err),
    });

    expect(notify).toHaveBeenCalledWith(expect.any(String), 'warning', expect.any(Number));
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(errors[0].status).toBe(403);
  });

  it('500 → notify error called, error re-thrown', () => {
    const errors: HttpErrorResponse[] = [];

    TestBed.runInInjectionContext(() => errorInterceptor(req, makeErrorNext(500))).subscribe({
      error: (err: HttpErrorResponse) => errors.push(err),
    });

    expect(notify).toHaveBeenCalledWith(expect.any(String), 'error', expect.any(Number));
    expect(errors[0].status).toBe(500);
  });

  it('status 0 (network error) → notify error called, error re-thrown', () => {
    const errors: HttpErrorResponse[] = [];

    TestBed.runInInjectionContext(() => errorInterceptor(req, makeErrorNext(0))).subscribe({
      error: (err: HttpErrorResponse) => errors.push(err),
    });

    expect(notify).toHaveBeenCalledWith(expect.any(String), 'error', expect.any(Number));
    expect(errors[0].status).toBe(0);
  });

  it('error is always re-thrown (throwError)', () => {
    let errorThrown = false;

    TestBed.runInInjectionContext(() => errorInterceptor(req, makeErrorNext(503))).subscribe({
      error: () => (errorThrown = true),
    });

    expect(errorThrown).toBe(true);
  });
});
