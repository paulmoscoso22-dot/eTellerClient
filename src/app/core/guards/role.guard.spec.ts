import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { roleGuard } from './role.guard';
import { AuthStore } from '../../features/auth/auth.store';

vi.mock('devextreme/ui/notify', () => ({ default: vi.fn() }));
import notify from 'devextreme/ui/notify';

// MOCK_TOKEN has can_use_teller: true in JWT payload
const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJURVNUVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJicmFuY2hfaWQiOiIwMDEiLCJsYW5ndWFnZSI6Iml0IiwiY2FuX3VzZV90ZWxsZXIiOnRydWUsInNlc3Npb25faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjk5OTk5OTk5OTl9.' +
  'signature';

describe('roleGuard', () => {
  let authStore: AuthStore;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

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

  it('should return true when canUseTeller is true', () => {
    authStore.set(MOCK_TOKEN);
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should call notify warning, navigate to /unauthorized and return false when canUseTeller is false', () => {
    // Store is empty → authStore.roles().canUseTeller === false by default
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
    expect(notify).toHaveBeenCalledWith(expect.any(String), 'warning', expect.any(Number));
  });
});
