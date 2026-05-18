import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';

vi.mock('devextreme-angular', () => ({
  DxFormModule: class {},
  DxButtonModule: class {},
  DxLoadIndicatorModule: class {},
  DxTextBoxModule: class {},
  DxPopupModule: class {},
  DxTextBoxComponent: class {},
  DxButtonComponent: class {},
  DxLoadIndicatorComponent: class {},
  DxPopupComponent: class {},
}));
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../auth.store';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

const MOCK_USER_ID = 'TESTUSER';
const MOCK_PASSWORD = 'Test@1234!';
const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJURVNUVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJicmFuY2hfaWQiOiIwMDEiLCJsYW5ndWFnZSI6Iml0IiwiY2FuX3VzZV90ZWxsZXIiOnRydWUsInNlc3Npb25faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjk5OTk5OTk5OTl9.' +
  'signature';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: { login: ReturnType<typeof vi.fn>; forceLogin: ReturnType<typeof vi.fn> };
  let mockAuthStore: { set: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockErrorHandler: {
    showWarning: ReturnType<typeof vi.fn>;
    showBusinessError: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthService = { login: vi.fn(), forceLogin: vi.fn() };
    mockAuthStore = { set: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockErrorHandler = { showWarning: vi.fn(), showBusinessError: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: Router, useValue: mockRouter },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    })
      .overrideComponent(LoginComponent, {
        set: { template: '<div></div>', imports: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onLogin() — validation', () => {
    it('should show warning and not call API when both fields are empty', () => {
      component.onLogin();
      expect(mockErrorHandler.showWarning).toHaveBeenCalled();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should show warning and not call API when only userId is empty', () => {
      component.formData.set({ userId: '', password: MOCK_PASSWORD });
      component.onLogin();
      expect(mockErrorHandler.showWarning).toHaveBeenCalled();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should show warning and not call API when only password is empty', () => {
      component.formData.set({ userId: MOCK_USER_ID, password: '' });
      component.onLogin();
      expect(mockErrorHandler.showWarning).toHaveBeenCalled();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('onLogin() — ResultCode handling', () => {
    beforeEach(() => {
      component.formData.set({ userId: MOCK_USER_ID, password: MOCK_PASSWORD });
    });

    it('OK → authStore.set() called with token and navigate("/")', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'OK', token: MOCK_TOKEN }));
      component.onLogin();
      expect(mockAuthStore.set).toHaveBeenCalledWith(MOCK_TOKEN);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('USER_ALREADY_LOGGED → showForceLoginPopup signal becomes true', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'USER_ALREADY_LOGGED' }));
      component.onLogin();
      expect(component.showForceLoginPopup()).toBe(true);
    });

    it('MUST_CHANGE_PASSWORD → navigate("/auth/change-password")', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'MUST_CHANGE_PASSWORD' }));
      component.onLogin();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/change-password']);
    });

    it('PASSWORD_EXPIRED → navigate("/auth/change-password")', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'PASSWORD_EXPIRED' }));
      component.onLogin();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/change-password']);
    });

    it('INVALID_CREDENTIALS → errorHandler.showBusinessError called', () => {
      mockAuthService.login.mockReturnValue(
        of({ resultCode: 'INVALID_CREDENTIALS', message: 'Credenziali non valide' })
      );
      component.onLogin();
      expect(mockErrorHandler.showBusinessError).toHaveBeenCalled();
    });

    it('USER_BLOCKED → errorHandler.showBusinessError called', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'USER_BLOCKED', message: 'Utente bloccato' }));
      component.onLogin();
      expect(mockErrorHandler.showBusinessError).toHaveBeenCalled();
    });

    it('USER_DISABLED → errorHandler.showBusinessError called', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'USER_DISABLED', message: 'Utente disabilitato' }));
      component.onLogin();
      expect(mockErrorHandler.showBusinessError).toHaveBeenCalled();
    });

    it('CASH_DESK_BUSY → errorHandler.showBusinessError called', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'CASH_DESK_BUSY', message: 'Cassa occupata' }));
      component.onLogin();
      expect(mockErrorHandler.showBusinessError).toHaveBeenCalled();
    });

    it('ERROR → errorHandler.showBusinessError called', () => {
      mockAuthService.login.mockReturnValue(of({ resultCode: 'ERROR', message: 'Errore generico' }));
      component.onLogin();
      expect(mockErrorHandler.showBusinessError).toHaveBeenCalled();
    });
  });
});
