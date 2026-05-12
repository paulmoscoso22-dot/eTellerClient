import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthStore } from './auth.store';

const MOCK_USER_ID = 'TESTUSER';
const MOCK_SESSION_ID = '00000000-0000-0000-0000-000000000000';
const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJURVNUVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJicmFuY2hfaWQiOiIwMDEiLCJsYW5ndWFnZSI6Iml0IiwiY2FuX3VzZV90ZWxsZXIiOnRydWUsInNlc3Npb25faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjk5OTk5OTk5OTl9.' +
  'signature';

describe('AuthStore', () => {
  let store: AuthStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('set()', () => {
    it('should decode JWT and update the token signal', () => {
      store.set(MOCK_TOKEN);
      expect(store.token()).toBe(MOCK_TOKEN);
    });

    it('should populate currentUser with decoded JWT claims', () => {
      store.set(MOCK_TOKEN);
      const user = store.currentUser();
      expect(user).not.toBeNull();
      expect(user?.userId).toBe(MOCK_USER_ID);
      expect(user?.sessionId).toBe(MOCK_SESSION_ID);
      expect(user?.branchId).toBe('001');
      expect(user?.language).toBe('it');
    });

    it('should set isAuthenticated computed to true', () => {
      store.set(MOCK_TOKEN);
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should extract canUseTeller true from JWT claim', () => {
      store.set(MOCK_TOKEN);
      expect(store.roles().canUseTeller).toBe(true);
    });
  });

  describe('reset()', () => {
    it('should clear token and currentUser', () => {
      store.set(MOCK_TOKEN);
      store.reset();
      expect(store.token()).toBeNull();
      expect(store.currentUser()).toBeNull();
    });

    it('should set isAuthenticated computed to false after reset', () => {
      store.set(MOCK_TOKEN);
      store.reset();
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe('isAuthenticated() computed', () => {
    it('should be false when no token is present', () => {
      expect(store.isAuthenticated()).toBe(false);
    });

    it('should be true after set() is called with a valid token', () => {
      store.set(MOCK_TOKEN);
      expect(store.isAuthenticated()).toBe(true);
    });
  });

  describe('roles() computed', () => {
    it('should return canUseTeller false when store is empty', () => {
      expect(store.roles().canUseTeller).toBe(false);
    });
  });
});
