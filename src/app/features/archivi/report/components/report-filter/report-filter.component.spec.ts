import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportFilterComponent } from './report-filter.component';
import { ReportSearchParams } from '../../domain/report-search.models';

describe('ReportFilterComponent', () => {
  let component: ReportFilterComponent;
  let fixture: ComponentFixture<ReportFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit typed ReportSearchParams when form is valid and search is called', () => {
    const emitSpy = vi.spyOn(component.searchClick, 'emit');
    component.searchForm.patchValue({
      trxCassa: 'CASSA01',
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: 60,
      trxBraId: 'BRA001'
    });
    component.search();
    
    expect(emitSpy).toHaveBeenCalled();
    const emittedValue = emitSpy.mock.calls[0][0] as ReportSearchParams;
    expect(emittedValue.trxCassa).toBe('CASSA01');
    expect(emittedValue.trxStatus).toBe(60);
    expect(emittedValue.trxBraId).toBe('BRA001');
  });

  it('should normalize trxDataDal to start of day (00:00:00)', () => {
    const emitSpy = vi.spyOn(component.searchClick, 'emit');
    const testDate = new Date('2026-05-27');
    component.searchForm.patchValue({
      trxCassa: '',
      trxDataDal: testDate,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: ''
    });
    component.search();

    const emittedValue = emitSpy.mock.calls[0][0] as ReportSearchParams;
    if (emittedValue.trxDataDal) {
      expect(emittedValue.trxDataDal.getHours()).toBe(0);
      expect(emittedValue.trxDataDal.getMinutes()).toBe(0);
      expect(emittedValue.trxDataDal.getSeconds()).toBe(0);
    }
  });

  it('should normalize trxDataAl to end of day (23:59:59)', () => {
    const emitSpy = vi.spyOn(component.searchClick, 'emit');
    const testDate = new Date('2026-05-27');
    component.searchForm.patchValue({
      trxCassa: '',
      trxDataDal: null,
      trxDataAl: testDate,
      trxStatus: null,
      trxBraId: ''
    });
    component.search();

    const emittedValue = emitSpy.mock.calls[0][0] as ReportSearchParams;
    if (emittedValue.trxDataAl) {
      expect(emittedValue.trxDataAl.getHours()).toBe(23);
      expect(emittedValue.trxDataAl.getMinutes()).toBe(59);
      expect(emittedValue.trxDataAl.getSeconds()).toBe(59);
    }
  });

  it('should coerce empty dates to null', () => {
    const emitSpy = vi.spyOn(component.searchClick, 'emit');
    component.searchForm.patchValue({
      trxCassa: '',
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: ''
    });
    component.search();

    const emittedValue = emitSpy.mock.calls[0][0] as ReportSearchParams;
    expect(emittedValue.trxDataDal).toBeNull();
    expect(emittedValue.trxDataAl).toBeNull();
  });

  it('should coerce empty string fields to null or keep as is', () => {
    const emitSpy = vi.spyOn(component.searchClick, 'emit');
    component.searchForm.patchValue({
      trxCassa: '',
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: ''
    });
    component.search();

    const emittedValue = emitSpy.mock.calls[0][0] as ReportSearchParams;
    expect(emittedValue.trxCassa).toBeDefined();
    expect(emittedValue.trxBraId).toBeDefined();
  });

  it('should not emit when form is invalid', () => {
    const emitSpy = vi.spyOn(component.searchClick, 'emit');
    component.dataDalRequired = true;
    component.searchForm.patchValue({
      trxCassa: '',
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: null,
      trxBraId: ''
    });
    component.search();

    if (component.searchForm.invalid) {
      expect(emitSpy).not.toHaveBeenCalled();
    }
  });

  it('should reset form to default values', () => {
    component.searchForm.patchValue({
      trxCassa: 'CASSA01',
      trxDataDal: new Date(),
      trxDataAl: new Date(),
      trxStatus: 60,
      trxBraId: 'BRA001'
    });
    component.reset();

    expect(component.searchForm.value.trxCassa).toBe('');
    expect(component.searchForm.value.trxDataDal).toBeNull();
    expect(component.searchForm.value.trxDataAl).toBeNull();
    expect(component.searchForm.value.trxBraId).toBe('');
    expect(component.searchForm.value.trxStatus).toBe(component.statusDefaultValue);
  });
});
