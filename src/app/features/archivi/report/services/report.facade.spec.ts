import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReportFacade } from './report.facade';
import { GetTransactionWaitingForBefResponse } from '../domain/transaction.models';
import { environment } from '../../../../../environments/environment';

describe('ReportFacade', () => {
  let service: ReportFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportFacade]
    });
    service = TestBed.inject(ReportFacade);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return Observable from getTransactionWaitingForBef', () => {
    const result = service.getTransactionWaitingForBef(null, null, null, null, null);
    expect(result).toBeDefined();
    expect(result.subscribe).toBeDefined();
    
    let completed = false;
    result.subscribe({
      next: () => { completed = true; },
      error: () => { completed = true; }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Report/WaitingForBEF`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
    expect(completed).toBe(true);
  });

  it('should normalize parameters before HTTP call', () => {
    const testDate = new Date('2026-05-27');
    let completed = false;
    service.getTransactionWaitingForBef('CASSA01', testDate, testDate, 60, 'BRA001').subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Report/WaitingForBEF`);
    expect(req.request.body).toBeDefined();
    expect(req.request.body.trxCassa).toBe('CASSA01');
    expect(req.request.body.trxStatus).toBe(60);
    expect(req.request.body.trxBraId).toBe('BRA001');
    req.flush([]);
    expect(completed).toBe(true);
  });

  it('should emit Observable stream with transaction data', () => {
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

    let data: any = null;
    service.getTransactionWaitingForBef(null, null, null, null, null).subscribe((result) => {
      data = result;
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Report/WaitingForBEF`);
    req.flush(mockData);
    expect(data).toEqual(mockData);
    expect(data.length).toBe(1);
  });

  it('should handle HTTP error in Observable', () => {
    let errorCaught = false;
    service.getTransactionWaitingForBef(null, null, null, null, null).subscribe({
      next: () => {
        throw new Error('should have failed');
      },
      error: (error) => {
        errorCaught = true;
        expect(error).toBeDefined();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Report/WaitingForBEF`);
    req.error(new ErrorEvent('Network error'), { status: 500 });
    expect(errorCaught).toBe(true);
  });

  it('should accept null parameters', () => {
    let completed = false;
    service.getTransactionWaitingForBef(null, null, null, null, null).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Report/WaitingForBEF`);
    expect(req.request.body.trxCassa).toBeNull();
    expect(req.request.body.trxDataDal).toBeNull();
    expect(req.request.body.trxDataAl).toBeNull();
    expect(req.request.body.trxStatus).toBeNull();
    expect(req.request.body.trxBraId).toBeNull();
    req.flush([]);
    expect(completed).toBe(true);
  });
});
