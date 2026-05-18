import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from '../../features/auth/auth.store';

const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJURVNUVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJicmFuY2hfaWQiOiIwMDEiLCJsYW5ndWFnZSI6Iml0IiwiY2FuX3VzZV90ZWxsZXIiOnRydWUsInNlc3Npb25faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjk5OTk5OTk5OTl9.' +
  'signature';

describe('authInterceptor', () => {
  let authStore: AuthStore;
  let mockNext: HttpHandlerFn;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStore],
    });
    authStore = TestBed.inject(AuthStore);
    mockNext = vi.fn(() => of(new HttpResponse({ status: 200 }))) as unknown as HttpHandlerFn;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add Authorization header when token is present and URL is not a skip URL', () => {
    authStore.set(MOCK_TOKEN);
    const req = new HttpRequest('GET', 'http://api.test/data');

    TestBed.runInInjectionContext(() => authInterceptor(req, mockNext)).subscribe();

    const calledReq = vi.mocked(mockNext).mock.calls[0][0] as HttpRequest<unknown>;
    expect(calledReq.headers.get('Authorization')).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('should NOT add Authorization header when no token is present', () => {
    const req = new HttpRequest('GET', 'http://api.test/data');

    TestBed.runInInjectionContext(() => authInterceptor(req, mockNext)).subscribe();

    const calledReq = vi.mocked(mockNext).mock.calls[0][0] as HttpRequest<unknown>;
    expect(calledReq.headers.has('Authorization')).toBe(false);
  });

  it('should bypass /auth/login URL even when token is present', () => {
    authStore.set(MOCK_TOKEN);
    const req = new HttpRequest('POST', 'http://api.test/auth/login', {});

    TestBed.runInInjectionContext(() => authInterceptor(req, mockNext)).subscribe();

    const calledReq = vi.mocked(mockNext).mock.calls[0][0] as HttpRequest<unknown>;
    expect(calledReq.headers.has('Authorization')).toBe(false);
  });

  it('should bypass /auth/force-login URL', () => {
    authStore.set(MOCK_TOKEN);
    const req = new HttpRequest('POST', 'http://api.test/auth/force-login', {});

    TestBed.runInInjectionContext(() => authInterceptor(req, mockNext)).subscribe();

    const calledReq = vi.mocked(mockNext).mock.calls[0][0] as HttpRequest<unknown>;
    expect(calledReq.headers.has('Authorization')).toBe(false);
  });

  it('should bypass /auth/change-password URL', () => {
    authStore.set(MOCK_TOKEN);
    const req = new HttpRequest('POST', 'http://api.test/auth/change-password', {});

    TestBed.runInInjectionContext(() => authInterceptor(req, mockNext)).subscribe();

    const calledReq = vi.mocked(mockNext).mock.calls[0][0] as HttpRequest<unknown>;
    expect(calledReq.headers.has('Authorization')).toBe(false);
  });
});
