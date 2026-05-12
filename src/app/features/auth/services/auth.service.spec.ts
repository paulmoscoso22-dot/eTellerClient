import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { ApiService } from '../../../services/api.service';
import { EnvironmentService } from '../../../services/environment.service';

const MOCK_USER_ID = 'TESTUSER';
const MOCK_PASSWORD = 'Test@1234!';
const MOCK_SESSION_ID = '00000000-0000-0000-0000-000000000000';
const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJURVNUVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJicmFuY2hfaWQiOiIwMDEiLCJsYW5ndWFnZSI6Iml0IiwiY2FuX3VzZV90ZWxsZXIiOnRydWUsInNlc3Npb25faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjk5OTk5OTk5OTl9.' +
  'signature';

const API_BASE = 'http://api.test';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        ApiService,
        {
          provide: EnvironmentService,
          useValue: { buildApiUrl: (ep: string) => `${API_BASE}/${ep}` },
        },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('login()', () => {
    it('should POST to auth/login with provided credentials', () => {
      const req = { userId: MOCK_USER_ID, password: MOCK_PASSWORD, traStation: 'localhost' };

      service.login(req).subscribe();

      const request = httpMock.expectOne(`${API_BASE}/auth/login`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(req);
      request.flush({ resultCode: 'OK', token: MOCK_TOKEN });
    });
  });

  describe('forceLogin()', () => {
    it('should POST to auth/force-login with forceLogin: true', () => {
      const req = { userId: MOCK_USER_ID, password: MOCK_PASSWORD, traStation: 'localhost' };

      service.forceLogin(req).subscribe();

      const request = httpMock.expectOne(`${API_BASE}/auth/force-login`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toMatchObject({ userId: MOCK_USER_ID, forceLogin: true });
      request.flush({ resultCode: 'OK', token: MOCK_TOKEN });
    });
  });

  describe('logout()', () => {
    it('should POST to auth/logout with sessionId, userId and traStation', () => {
      service.logout(MOCK_SESSION_ID, MOCK_USER_ID, 'localhost').subscribe();

      const request = httpMock.expectOne(`${API_BASE}/auth/logout`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toMatchObject({
        sessionId: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
      });
      request.flush({ resultCode: 'OK' });
    });
  });

  describe('changePassword()', () => {
    it('should POST to auth/change-password with the provided request', () => {
      const req = {
        userId: MOCK_USER_ID,
        currentPassword: MOCK_PASSWORD,
        newPassword: 'New@5678!',
        traStation: 'localhost',
      };

      service.changePassword(req).subscribe();

      const request = httpMock.expectOne(`${API_BASE}/auth/change-password`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(req);
      request.flush({ resultCode: 'OK' });
    });
  });
});
