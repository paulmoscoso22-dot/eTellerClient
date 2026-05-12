import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
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

vi.mock('devextreme/ui/notify', () => ({ default: vi.fn() }));
import notify from 'devextreme/ui/notify';

import { ChangePasswordComponent } from './change-password.component';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../auth.store';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

const MOCK_USER_ID = 'TESTUSER';
const MOCK_PASSWORD = 'Test@1234!';
const MOCK_NEW_PASSWORD = 'New@5678!';
const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJURVNUVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJicmFuY2hfaWQiOiIwMDEiLCJsYW5ndWFnZSI6Iml0IiwiY2FuX3VzZV90ZWxsZXIiOnRydWUsInNlc3Npb25faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjk5OTk5OTk5OTl9.' +
  'signature';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let mockAuthService: { changePassword: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockErrorHandler: { showWarning: ReturnType<typeof vi.fn> };
  let authStore: AuthStore;

  beforeEach(async () => {
    mockAuthService = { changePassword: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockErrorHandler = { showWarning: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponent],
      providers: [
        AuthStore,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
      ],
    })
      .overrideComponent(ChangePasswordComponent, {
        set: { template: '<div></div>', imports: [] },
      })
      .compileComponents();

    authStore = TestBed.inject(AuthStore);
    authStore.set(MOCK_TOKEN); // populate currentUser so userId is available

    fixture = TestBed.createComponent(ChangePasswordComponent);
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

  describe('onSubmit() — validation', () => {
    it('should show warning when fields are empty', () => {
      component.onSubmit();
      expect(mockErrorHandler.showWarning).toHaveBeenCalled();
      expect(mockAuthService.changePassword).not.toHaveBeenCalled();
    });

    it('should set inlineError when passwords do not match', () => {
      component.formData.set({
        currentPassword: MOCK_PASSWORD,
        newPassword: MOCK_NEW_PASSWORD,
        confirmPassword: 'Mismatch@999!',
      });
      component.onSubmit();
      expect(component.inlineError()).toBeTruthy();
      expect(mockAuthService.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit() — ResultCode handling', () => {
    beforeEach(() => {
      component.formData.set({
        currentPassword: MOCK_PASSWORD,
        newPassword: MOCK_NEW_PASSWORD,
        confirmPassword: MOCK_NEW_PASSWORD,
      });
    });

    it('OK → notify success and navigate to /auth/login', () => {
      mockAuthService.changePassword.mockReturnValue(of({ resultCode: 'OK' }));
      component.onSubmit();
      expect(notify).toHaveBeenCalledWith(expect.any(String), 'success', expect.any(Number));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('INVALID_CURRENT_PASSWORD → inlineError is set', () => {
      mockAuthService.changePassword.mockReturnValue(
        of({ resultCode: 'INVALID_CURRENT_PASSWORD' })
      );
      component.onSubmit();
      expect(component.inlineError()).toBeTruthy();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('HISTORY_VIOLATION → inlineError is set', () => {
      mockAuthService.changePassword.mockReturnValue(of({ resultCode: 'HISTORY_VIOLATION' }));
      component.onSubmit();
      expect(component.inlineError()).toBeTruthy();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
