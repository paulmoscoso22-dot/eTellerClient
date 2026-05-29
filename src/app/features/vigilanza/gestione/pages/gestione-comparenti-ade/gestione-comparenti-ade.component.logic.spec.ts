import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GestioneComparentiAdeComponent } from './gestione-comparenti-ade.component';
import { GestioneComparentiAdeService } from '../../services/gestione-comparenti-ade.service';
import { CountryService } from '../../services/country.service';
import { AuthStore } from '../../../../auth/auth.store';
import { of, throwError } from 'rxjs';

// Initialize TestBed environment
TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

describe('GestioneComparentiAdeComponent - Logic', () => {
  let component: GestioneComparentiAdeComponent;
  let mockCountryService: any;
  let mockService: any;
  let mockAuthStore: any;

  beforeEach(() => {
    // Create mock services
    mockCountryService = {
      getAllCountries: vi.fn().mockReturnValue(of([
        { cutId: 1, cutDes: 'Italia' },
        { cutId: 2, cutDes: 'Francia' },
      ])),
    };

    mockService = {
      getByParameters: vi.fn().mockReturnValue(of([])),
      getByAraId: vi.fn().mockReturnValue(of({})),
      getHistory: vi.fn().mockReturnValue(of([])),
      insertAra: vi.fn().mockReturnValue(of({ success: true })),
      updateAra: vi.fn().mockReturnValue(of({ success: true })),
      deleteAra: vi.fn().mockReturnValue(of({ success: true })),
    };

    mockAuthStore = {
      currentUser: vi.fn().mockReturnValue({ userId: 'test-user' }),
    };

    // Provide mock services to TestBed
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: CountryService, useValue: mockCountryService },
        { provide: GestioneComparentiAdeService, useValue: mockService },
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    });
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
      expect(component).toBeTruthy();
    });

    it('should load countries on initialization', () => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
      expect(mockCountryService.getAllCountries).toHaveBeenCalled();
      expect(component.countries()).toHaveLength(2);
    });

    it('should load all appearers on initialization', () => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
      expect(mockService.getByParameters).toHaveBeenCalled();
      expect(component.appearers()).toEqual([]);
    });

    it('should initialize signals with correct default values', () => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.appearers()).toEqual([]);
    });
  });

  describe('loadAll() Method', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
    });

    it('should fetch all appearers with correct request parameters', () => {
      component.loadAll();
      expect(mockService.getByParameters).toHaveBeenCalledWith(expect.objectContaining({
        AraName: '',
        AraBirthdate: null,
        AraRecComplete: false,
        ShowExpiredRecords: true,
        RecordValidityDays: 365,
      }));
    });

    it('should set isLoading to true during fetch', (done) => {
      mockService.getByParameters.mockReturnValueOnce(of([]).pipe(
        // Simulate async operation
      ));
      component.loadAll();
      setTimeout(() => {
        expect(component.isLoading()).toBe(false); // Should be false after completion
        done();
      }, 100);
    });

    it('should set error message on service failure', (done) => {
      const errorMessage = 'Backend error';
      mockService.getByParameters.mockReturnValueOnce(throwError(() => ({ message: errorMessage })));
      component.loadAll();
      setTimeout(() => {
        expect(component.error()).toBe(errorMessage);
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should populate appearers signal with response data', (done) => {
      const mockData = [
        { araId: 1, araName: 'John Doe' },
        { araId: 2, araName: 'Jane Smith' },
      ];
      mockService.getByParameters.mockReturnValueOnce(of(mockData));
      component.loadAll();
      setTimeout(() => {
        expect(component.appearers()).toEqual(mockData);
        done();
      }, 100);
    });
  });

  describe('Form Popup - Add Mode', () => {
    beforeEach(() => {
      component = TestBed.createFactory(GestioneComparentiAdeComponent).componentInstance;
    });

    it('should open form popup in add mode', () => {
      component.openAddPopup();
      expect(component.isFormPopupVisible).toBe(true);
      expect(component.isEditMode()).toBe(false);
      expect(component.isViewMode()).toBe(false);
    });

    it('should reset form to initial state in add mode', () => {
      component.openAddPopup();
      expect(component.editForm.value.araName).toBe('');
      expect(component.editForm.value.araRecComplete).toBe(false);
    });

    it('should clear any previous error messages', () => {
      component.saveError.set('Previous error');
      component.openAddPopup();
      expect(component.saveError()).toBeNull();
    });
  });

  describe('Form Popup - Edit Mode', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
    });

    it('should open form popup in edit mode', () => {
      const mockRow = { araId: 1, araName: 'John Doe' };
      mockService.getByAraId.mockReturnValueOnce(of({
        araId: 1,
        araName: 'John Doe',
        araRepresents: 'Test',
      }));
      component.openEditPopup(mockRow);
      expect(component.isFormPopupVisible).toBe(true);
      expect(component.isEditMode()).toBe(true);
    });

    it('should load form data from service in edit mode', (done) => {
      const mockRow = { araId: 1, araName: 'John Doe' };
      const mockData = { araId: 1, araName: 'John Doe Updated', araRepresents: 'Rep' };
      mockService.getByAraId.mockReturnValueOnce(of(mockData));
      component.openEditPopup(mockRow);
      setTimeout(() => {
        expect(mockService.getByAraId).toHaveBeenCalledWith(1);
        expect(component.editForm.value.araName).toBe('John Doe Updated');
        done();
      }, 100);
    });
  });

  describe('Form Popup - View Mode', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
    });

    it('should open form popup in view-only mode', () => {
      const mockRow = { araId: 1, araName: 'John Doe' };
      mockService.getByAraId.mockReturnValueOnce(of({}));
      component.openViewPopup(mockRow);
      expect(component.isFormPopupVisible).toBe(true);
      expect(component.isViewMode()).toBe(true);
      expect(component.isEditMode()).toBe(false);
    });
  });

  describe('Save Form - Validation', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
      mockService.insertAra.mockReturnValueOnce(of({ success: true }));
    });

    it('should reject save with empty araName', () => {
      component.openAddPopup();
      component.editForm.patchValue({ araName: '' });
      component.save();
      expect(component.saveError()).toBe('Il campo "Nome e cognome" è obbligatorio');
    });

    it('should reject save with whitespace-only araName', () => {
      component.openAddPopup();
      component.editForm.patchValue({ araName: '   ' });
      component.save();
      expect(component.saveError()).toBe('Il campo "Nome e cognome" è obbligatorio');
    });

    it('should accept save with valid araName', (done) => {
      component.openAddPopup();
      component.editForm.patchValue({ araName: 'Valid Name' });
      mockService.insertAra.mockReturnValueOnce(of({ success: true }));
      component.save();
      setTimeout(() => {
        expect(component.saveError()).toBeNull();
        done();
      }, 100);
    });
  });

  describe('Date Handling', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
    });

    it('should correctly format dates in save request', (done) => {
      component.openAddPopup();
      component.editForm.patchValue({
        araName: 'Test User',
        araBirthdate: new Date(2000, 0, 15), // Jan 15, 2000
      });
      mockService.insertAra.mockReturnValueOnce(of({ success: true }));
      component.save();
      setTimeout(() => {
        expect(mockService.insertAra).toHaveBeenCalledWith(expect.objectContaining({
          AraBirthdate: '2000-01-15',
        }));
        done();
      }, 100);
    });
  });

  describe('History Popup', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
    });

    it('should open history popup and load history', (done) => {
      const mockRow = { araId: 1, araName: 'John Doe' };
      const mockHistory = [
        { hisDate: '2026-05-29', araName: 'John Doe' },
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
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
      // Mock window.confirm
      global.confirm = vi.fn(() => true);
    });

    it('should abort delete if user cancels confirmation', () => {
      global.confirm = vi.fn(() => false);
      const mockRow = { araId: 1, araName: 'John Doe' };
      component.openDeletePopup(mockRow);
      expect(mockService.deleteAra).not.toHaveBeenCalled();
    });

    it('should call deleteAra service with correct request when user confirms', () => {
      const mockRow = { araId: 1, araName: 'John Doe' };
      mockService.deleteAra.mockReturnValueOnce(of({ success: true }));
      component.openDeletePopup(mockRow);
      expect(mockService.deleteAra).toHaveBeenCalledWith(expect.objectContaining({
        AraId: 1,
      }));
    });
  });

  describe('Grid Filter Clearing', () => {
    beforeEach(() => {
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
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
      component = TestBed.createComponent(GestioneComparentiAdeComponent).componentInstance;
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
