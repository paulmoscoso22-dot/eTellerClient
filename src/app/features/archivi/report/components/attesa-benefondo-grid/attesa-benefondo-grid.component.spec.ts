import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AttesaBenefondoGridComponent } from './attesa-benefondo-grid.component';
import { GetTransactionWaitingForBefResponse } from '../../domain/transaction.models';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AttesaBenefondoGridComponent', () => {
  let component: AttesaBenefondoGridComponent;
  let fixture: ComponentFixture<AttesaBenefondoGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttesaBenefondoGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AttesaBenefondoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty state when transactions signal is empty', () => {
    component.transactions = signal<GetTransactionWaitingForBefResponse[]>([]);
    fixture.detectChanges();
    expect(component.transactions()).toEqual([]);
  });

  it('should render grid with data when transactions signal is populated', () => {
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
    
    component.transactions = signal(mockData);
    fixture.detectChanges();
    expect(component.transactions()).toEqual(mockData);
    expect(component.transactions().length).toBe(1);
  });

  it('should update grid when transactions signal is updated', () => {
    const initialData: any[] = [
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
    
    component.transactions = signal(initialData);
    fixture.detectChanges();
    expect(component.transactions().length).toBe(1);

    const updatedData: any[] = [
      ...initialData,
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
    
    component.transactions.set(updatedData);
    fixture.detectChanges();
    expect(component.transactions().length).toBe(2);
  });

  it('should show loading state when isLoading signal is true', () => {
    component.isLoading = signal(true);
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);
  });

  it('should show error message when error signal is set', () => {
    component.error = signal('Network error');
    fixture.detectChanges();
    expect(component.error()).toBe('Network error');
  });

  it('should define 10 column definitions', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBe(10);
    expect(component.columns[0].dataField).toBe('trxId');
    expect(component.columns[1].dataField).toBe('trxAptId');
    expect(component.columns[2].dataField).toBe('trxCassa');
    expect(component.columns[3].dataField).toBe('trxBraId');
    expect(component.columns[4].dataField).toBe('trxUsrId');
    expect(component.columns[5].dataField).toBe('trxDatope');
    expect(component.columns[6].dataField).toBe('trxDivope');
    expect(component.columns[7].dataField).toBe('trxImpope');
    expect(component.columns[8].dataField).toBe('trxText1');
    expect(component.columns[9].dataField).toBe('trxStatus');
  });
});
