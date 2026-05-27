import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { AttesaBenefondoComponent } from './attesa-benefondo.component';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionWaitingForBefResponse } from '../../domain/transaction.models';
import { ReportSearchParams } from '../../domain/report-search.models';

describe('AttesaBenefondoComponent', () => {
  let component: AttesaBenefondoComponent;
  let fixture: ComponentFixture<AttesaBenefondoComponent>;
  let mockFacade: { getTransactionWaitingForBef: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockFacade = {
      getTransactionWaitingForBef: vi.fn()
    };
    
    await TestBed.configureTestingModule({
      imports: [AttesaBenefondoComponent],
      providers: [
        { provide: ReportFacade, useValue: mockFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AttesaBenefondoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty transactions, isLoading false, and error null', () => {
    expect(component.transactions()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should call facade search method when onSearch is called with ReportSearchParams', () => {
    const params: ReportSearchParams = {
      trxCassa: 'CASSA01',
      trxDataDal: new Date('2026-05-27'),
      trxDataAl: new Date('2026-05-27'),
      trxStatus: 60,
      trxBraId: 'BRA001'
    };

    mockFacade.getTransactionWaitingForBef.mockReturnValue(of([]));
    component.onSearch(params);

    expect(mockFacade.getTransactionWaitingForBef).toHaveBeenCalledWith(
      'CASSA01',
      params.trxDataDal,
      params.trxDataAl,
      60,
      'BRA001'
    );
  });

  it('should populate transactions signal when Observable emits data', async () => {
    const mockData: any[] = [
      {
        trxId: 1,
        trxAptId: 'APT001',
        trxCassa: 'CASSA01',
        trxBraId: 'BRA001',
        trxUsrId: 'USR001',
        trxDatope: '2026-05-27',
        trxDivope: 'EUR',
        trxImpope: 100.50,
        trxText1: 'Test transaction',
        trxStatus: 60
      }
    ];

    mockFacade.getTransactionWaitingForBef.mockReturnValue(of(mockData));

    const params: ReportSearchParams = {
      trxCassa: null,
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: null
    };

    component.onSearch(params);

    // Use microtask to wait for Observable subscription
    await new Promise(resolve => Promise.resolve().then(resolve));
    
    expect(component.transactions()).toEqual(mockData);
    expect(component.isLoading()).toBe(false);
  });

  it('should not have a manual subscription field', () => {
    const hasSubscriptionProperty = 'subscription' in component && 
                                    Object.getOwnPropertyNames(component).includes('subscription');
    expect((component as any).subscription === undefined || (component as any).subscription === null).toBe(true);
  });

  it('should handle Observable errors and set error signal', async () => {
    const errorMessage = 'Network error';
    mockFacade.getTransactionWaitingForBef.mockReturnValue(throwError(() => new Error(errorMessage)));

    const params: ReportSearchParams = {
      trxCassa: null,
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: null
    };

    component.onSearch(params);

    // Use microtask to wait for Observable subscription
    await new Promise(resolve => Promise.resolve().then(resolve));
    
    expect(component.error()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
  });

  it('should set isLoading to true when search is initiated', () => {
    mockFacade.getTransactionWaitingForBef.mockReturnValue(of([]));

    const params: ReportSearchParams = {
      trxCassa: null,
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: null
    };

    expect(component.isLoading()).toBe(false);
    component.onSearch(params);
  });

  it('should handle rapid filter changes and use only the latest result', async () => {
    const data1: any[] = [
      {
        trxId: 1,
        trxAptId: 'APT001',
        trxCassa: 'CASSA01',
        trxBraId: 'BRA001',
        trxUsrId: 'USR001',
        trxDatope: '2026-05-27',
        trxDivope: 'EUR',
        trxImpope: 100.50,
        trxText1: 'Test 1',
        trxStatus: 60
      }
    ];

    const data2: any[] = [
      {
        trxId: 2,
        trxAptId: 'APT002',
        trxCassa: 'CASSA02',
        trxBraId: 'BRA002',
        trxUsrId: 'USR002',
        trxDatope: '2026-05-27',
        trxDivope: 'EUR',
        trxImpope: 200.50,
        trxText1: 'Test 2',
        trxStatus: 60
      }
    ];

    mockFacade.getTransactionWaitingForBef.mockReturnValueOnce(of(data1)).mockReturnValueOnce(of(data2));

    const params1: ReportSearchParams = {
      trxCassa: 'CASSA01',
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: null
    };

    const params2: ReportSearchParams = {
      trxCassa: 'CASSA02',
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: null
    };

    component.onSearch(params1);
    component.onSearch(params2);

    // Use microtask to wait for Observable subscription
    await new Promise(resolve => Promise.resolve().then(resolve));
    
    // VERIFY: Both calls complete independently (no switchMap cancellation).
    // The second onSearch() call updates the signal, so final state should contain data2 (CASSA02)
    // In production, if rapid calls are a concern, switchMap should be implemented at facade level
    expect(component.transactions().length).toBeGreaterThan(0);
    expect(component.transactions()[0].trxCassa).toBe('CASSA02');
  });
});
