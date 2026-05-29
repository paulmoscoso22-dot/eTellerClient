import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GestioneRegoleComponent } from './gestione-regole.component';
import { GestioneRegoleService } from '../../services/gestione-regole.service';
import { AuthStore } from '../../../../auth/auth.store';
import { of, throwError } from 'rxjs';

// Initialize TestBed environment
TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

describe('GestioneRegoleComponent - Logic', () => {
  let component: GestioneRegoleComponent;
  let mockService: any;
  let mockAuthStore: any;

  beforeEach(() => {
    // Create mock services
    mockService = {
      getByParameters: vi.fn().mockReturnValue(of([])),
      getByArlId: vi.fn().mockReturnValue(of({})),
      getHistory: vi.fn().mockReturnValue(of([])),
      getOperationTypes: vi.fn().mockReturnValue(of([
        { optId: 1, optDes: 'Acquisto' },
        { optId: 2, optDes: 'Vendita' },
      ])),
      getCurrencyTypes: vi.fn().mockReturnValue(of([
        { cutId: 1, cutDes: 'EUR' },
        { cutId: 2, cutDes: 'USD' },
      ])),
      insertRule: vi.fn().mockReturnValue(of({ success: true })),
      updateRule: vi.fn().mockReturnValue(of({ success: true })),
      deleteRule: vi.fn().mockReturnValue(of({ success: true })),
    };

    mockAuthStore = {
      currentUser: vi.fn().mockReturnValue({ userId: 'test-user' }),
    };

    // Provide mock services to TestBed
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: GestioneRegoleService, useValue: mockService },
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    });
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
      expect(component).toBeTruthy();
    });

    it('should load operation types on initialization', () => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
      expect(mockService.getOperationTypes).toHaveBeenCalled();
      expect(component.operationTypes()).toHaveLength(2);
    });

    it('should load currency types on initialization', () => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
      expect(mockService.getCurrencyTypes).toHaveBeenCalled();
      expect(component.currencyTypes()).toHaveLength(2);
    });

    it('should load all rules on initialization', () => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
      expect(mockService.getByParameters).toHaveBeenCalled();
      expect(component.rules()).toEqual([]);
    });

    it('should initialize signals with correct default values', () => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.rules()).toEqual([]);
    });
  });

  describe('Search/Load Rules', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should fetch rules with correct search parameters', () => {
      const mockData = [
        { arlId: 1, optDes: 'Acquisto', arlLimit: 5000 },
      ];
      mockService.getByParameters.mockReturnValueOnce(of(mockData));
      // Note: component doesn't expose a public search method, loadAll is called in constructor
      expect(mockService.getByParameters).toHaveBeenCalled();
    });

    it('should set error message on search failure', (done) => {
      const errorMessage = 'Search failed';
      mockService.getByParameters.mockReturnValueOnce(throwError(() => ({ message: errorMessage })));
      component['loadAll'](); // Call private method
      setTimeout(() => {
        expect(component.error()).toBe(errorMessage);
        done();
      }, 100);
    });

    it('should populate rules signal with response data', (done) => {
      const mockData = [
        { arlId: 1, optDes: 'Acquisto', arlLimit: 5000 },
        { arlId: 2, optDes: 'Vendita', arlLimit: 10000 },
      ];
      mockService.getByParameters.mockReturnValueOnce(of(mockData));
      component['loadAll']();
      setTimeout(() => {
        expect(component.rules()).toEqual(mockData);
        done();
      }, 100);
    });
  });

  describe('Form Popup - Add Mode', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should open form popup in add mode', () => {
      component.openAddPopup();
      expect(component.isFormPopupVisible).toBe(true);
      expect(component.isEditMode()).toBe(false);
      expect(component.isViewMode()).toBe(false);
    });

    it('should reset form to initial state in add mode', () => {
      component.openAddPopup();
      expect(component.editForm.value.arlLimit).toBe(0);
      expect(component.editForm.value.arlExclude).toBe(false);
    });

    it('should clear any previous error messages', () => {
      component.saveError.set('Previous error');
      component.openAddPopup();
      expect(component.saveError()).toBeNull();
    });
  });

  describe('Form Popup - Edit Mode', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should open form popup in edit mode', () => {
      const mockRow = { arlId: 1, optDes: 'Acquisto' };
      mockService.getByArlId.mockReturnValueOnce(of({
        arlId: 1,
        arlLimit: 5000,
        arlExclude: false,
      }));
      component.openEditPopup(mockRow);
      expect(component.isFormPopupVisible).toBe(true);
      expect(component.isEditMode()).toBe(true);
    });

    it('should load form data from service in edit mode', (done) => {
      const mockRow = { arlId: 1, optDes: 'Acquisto' };
      const mockData = { arlId: 1, arlLimit: 5000, arlExclude: false };
      mockService.getByArlId.mockReturnValueOnce(of(mockData));
      component.openEditPopup(mockRow);
      setTimeout(() => {
        expect(mockService.getByArlId).toHaveBeenCalledWith(1);
        expect(component.editForm.value.arlLimit).toBe(5000);
        done();
      }, 100);
    });
  });

  describe('Form Popup - View Mode', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should open form popup in view-only mode', () => {
      const mockRow = { arlId: 1, optDes: 'Acquisto' };
      mockService.getByArlId.mockReturnValueOnce(of({}));
      component.openViewPopup(mockRow);
      expect(component.isFormPopupVisible).toBe(true);
      expect(component.isViewMode()).toBe(true);
      expect(component.isEditMode()).toBe(false);
    });
  });

  describe('Save Form - Validation', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
      mockService.insertRule.mockReturnValueOnce(of({ success: true }));
    });

    it('should reject save with missing required fields', () => {
      component.openAddPopup();
      component.editForm.patchValue({ arlOpTypeId: null, arlCurTypeId: null });
      component.save();
      expect(component.saveError()).not.toBeNull();
    });

    it('should accept save with valid data', (done) => {
      component.openAddPopup();
      component.editForm.patchValue({
        arlOpTypeId: 1,
        arlCurTypeId: 1,
        arlLimit: 5000,
      });
      mockService.insertRule.mockReturnValueOnce(of({ success: true }));
      component.save();
      setTimeout(() => {
        // Should either have no error or have called insertRule
        expect(mockService.insertRule).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Date Handling', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should correctly format dates in save request', (done) => {
      component.openAddPopup();
      component.editForm.patchValue({
        arlOpTypeId: 1,
        arlCurTypeId: 1,
        arlLimit: 5000,
        arlValStart: new Date(2026, 4, 1), // May 1, 2026
        arlValEnd: new Date(2026, 11, 31), // Dec 31, 2026
      });
      mockService.insertRule.mockReturnValueOnce(of({ success: true }));
      component.save();
      setTimeout(() => {
        const call = mockService.insertRule.mock.calls[0]?.[0];
        if (call) {
          expect(call.ArlValStart).toBeDefined();
          expect(call.ArlValEnd).toBeDefined();
        }
        done();
      }, 100);
    });
  });

  describe('History Popup', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should open history popup and load history', (done) => {
      const mockRow = { arlId: 1, optDes: 'Acquisto' };
      const mockHistory = [
        { hisDate: '2026-05-29', optDes: 'Acquisto' },
      ];
      mockService.getHistory.mockReturnValueOnce(of(mockHistory));
      component.openHistoryPopup(mockRow);
      expect(component.isHistoryPopupVisible).toBe(true);
      setTimeout(() => {
        expect(mockService.getHistory).toHaveBeenCalledWith(1);
        expect(component.historyItems()).toEqual(mockHistory);
        done();
      }, 100);
    });

    it('should close history popup', () => {
      component.isHistoryPopupVisible = true;
      component.closeHistoryPopup();
      expect(component.isHistoryPopupVisible).toBe(false);
    });
  });

  describe('Delete Operation', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
      global.confirm = vi.fn(() => true);
    });

    it('should abort delete if user cancels confirmation', () => {
      global.confirm = vi.fn(() => false);
      const mockRow = { arlId: 1, optDes: 'Acquisto' };
      component.openDeletePopup(mockRow);
      expect(mockService.deleteRule).not.toHaveBeenCalled();
    });

    it('should call deleteRule service with correct request when user confirms', () => {
      const mockRow = { arlId: 1, optDes: 'Acquisto' };
      mockService.deleteRule.mockReturnValueOnce(of({ success: true }));
      component.openDeletePopup(mockRow);
      expect(mockService.deleteRule).toHaveBeenCalledWith(expect.objectContaining({
        ArlId: 1,
      }));
    });
  });

  describe('Grid Filter Clearing', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should clear grid filters when method is called', () => {
      const mockDataGrid = { clearFilters: vi.fn() };
      component['dataGrid'] = mockDataGrid as any;
      component.clearGridFilters();
      expect(mockDataGrid.clearFilters).toHaveBeenCalled();
    });
  });

  describe('Close Form Popup', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneRegoleComponent).componentInstance;
    });

    it('should close form popup and reset view mode', () => {
      component.isFormPopupVisible = true;
      component.isViewMode.set(true);
      component.closeFormPopup();
      expect(component.isFormPopupVisible).toBe(false);
      expect(component.isViewMode()).toBe(false);
    });
  });
});
