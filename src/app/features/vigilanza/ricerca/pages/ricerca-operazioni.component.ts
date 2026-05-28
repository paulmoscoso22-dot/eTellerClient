import { Component, DestroyRef, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxTextBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxCheckBoxModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneButtonComponent } from '../../../../components/General/sempione-button/sempione-button.component';
import { SempionePageHeaderComponent } from '../../../../components/General/sempione-page-header/sempione-page-header.component';
import { SempioneToolbarComponent } from '../../../../components/General/sempione-toolbar/sempione-toolbar.component';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../components/General/sempione-data-grid/sempione-data-grid.component';
import { SempionePopupComponent } from '../../../../components/General/sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../../../../components/General/sempione-popup-action-bar/sempione-popup-action-bar.component';
import { SempionePopupCardComponent } from '../../../../components/General/sempione-popup-card/sempione-popup-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { ValueChangedEvent as DateBoxValueChangedEvent } from 'devextreme/ui/date_box';
import { RicercaOperazioniFacade } from '../services/ricerca-operazioni.facade';
import { GestioneComparentiAdeService } from '../../gestione/services/gestione-comparenti-ade.service';
import { Service } from '../../../../core/services/service';
import { Currency } from '../../../../core/domain/currency.domain';
import { Branch } from '../../../../core/domain/branch.domain';
import { ICurrencyType } from '../../../../core/domain/currencyType.domain';
import { IStOperationType } from '../../../../core/domain/stOperationType.domain';
import {
  RicercaOperazioniFiltersState,
  RicercaOperazioniRequest,
  RicercaOperazioniResponse
} from '../domain/ricerca-operazioni.models';
import { AppearerAllResponse, GetAppearerByParametersRequest } from '../../gestione/domain/gestione-comparenti-ade.models';

const STORAGE_KEY = 'vigilanza.ricerca-operazioni.filters';
const DEFAULT_PAGE_SIZE = 30;

@Component({
  selector: 'app-ricerca-operazioni',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    SempionePageHeaderComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempioneDataGridComponent,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneButtonComponent,
  ],
  templateUrl: './ricerca-operazioni.component.html',
  styleUrls: ['./ricerca-operazioni.component.css'],
})
export class RicercaOperazioniComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly ricercaOperazioniFacade = inject(RicercaOperazioniFacade);
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(Service);
  private readonly appearerService = inject(GestioneComparentiAdeService);
  
  readonly operations = signal<RicercaOperazioniResponse[]>([]);
  readonly isLoading = signal(false);
  readonly currencies = signal<Currency[]>([]);
  readonly branches = signal<Branch[]>([]);
  readonly currencyTypes = signal<ICurrencyType[]>([]);
  readonly stOperationsTypes = signal<IStOperationType[]>([]);
  readonly selectedOperation = signal<RicercaOperazioniResponse | null>(null);
  readonly isDetailPopupVisible = signal(false);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  readonly appearers = signal<AppearerAllResponse[]>([]);
  readonly isAppearerPopupVisible = signal(false);
  readonly isAppearerLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'trxId',           caption: 'Nop / TrxId',  width: 90,  alignment: 'center' },
    { dataField: 'trxDate',         caption: 'Data',          width: 100, alignment: 'center', dataType: 'date', format: 'dd.MM.yy' },
    { dataField: 'cutDes',          caption: 'Utente/Cassa',  width: 140, alignment: 'left' },
    { dataField: 'optDes',          caption: 'Operazione',    minWidth: 160, alignment: 'left' },
    { dataField: 'trxReport',       caption: 'N. Rapporto',   width: 110, alignment: 'center' },
    { dataField: 'trxCurId',        caption: 'Divisa',        width: 70,  type: 'currency' },
    { dataField: 'trxAmount',       caption: 'Importo',       width: 110, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'trxRate',         caption: 'Cambio',        width: 100, alignment: 'right', dataType: 'number', format: '#,##0.0000' },
    { dataField: 'appearerName',    caption: 'Comparente',    width: 160, alignment: 'left' },
    { dataField: 'beneficiaryName', caption: 'Beneficiario',  minWidth: 160, alignment: 'left' },
    { dataField: 'staDes',          caption: 'Stato',         width: 100, type: 'stato-operazione' },
  ];

  readonly searchForm: FormGroup = this.formBuilder.group({
    trxCassa: [''],
    trxLocalita: [''],
    trxDataDal: [null],
    trxDataAl: [null],
    trxReverse: [false],
    trxCutId: [''],
    trxOptId: [''],
    trxDivope: [''],
    trxImpopeDA: [null],
    trxImpopeA: [null],
    arcAppName: [''],
    arcForced: [false]
  });

  ngOnInit(): void {
    this.loadLookups();
    this.restoreFilters();
  }

  openViewPopup(data: RicercaOperazioniResponse): void {
    this.selectedOperation.set(data);
    this.isDetailPopupVisible.set(true);
  }

  onDetailPopupHidden(): void {
    this.closePopup();
  }

  openAppearerPopup(): void {
    this.isAppearerPopupVisible.set(true);
    this.searchAppearers();
  }

  closeAppearerPopup(): void {
    this.isAppearerPopupVisible.set(false);
  }

  onAppearerPopupHidden(): void {
    this.closeAppearerPopup();
  }

  selectAppearer(appearer: AppearerAllResponse): void {
    this.searchForm.patchValue({ arcAppName: appearer.araName ?? '' }, { emitEvent: false });
    this.isAppearerPopupVisible.set(false);
    this.persistFilters();
  }

  printResults(): void {
    if (!this.isBrowser) return;

    window.print();
  }

  closePopup(): void {
    this.isDetailPopupVisible.set(false);
    this.selectedOperation.set(null);
  }

  resetFilters(): void {
    this.searchForm.reset({
      trxCassa: '',
      trxLocalita: '',
      trxDataDal: null,
      trxDataAl: null,
      trxReverse: false,
      trxCutId: '',
      trxOptId: '',
      trxDivope: '',
      trxImpopeDA: null,
      trxImpopeA: null,
      arcAppName: '',
      arcForced: false
    });
    this.pageSize.set(DEFAULT_PAGE_SIZE);
    this.clearPersistedFilters();
    this.operations.set([]);
    this.closePopup();
    this.appearers.set([]);
    this.closeAppearerPopup();
  }

  onDateDalChanged(e: DateBoxValueChangedEvent): void {
    if (e.value == null) return;

    const date = new Date(e.value);
    date.setHours(0, 0, 0, 0);
    this.searchForm.patchValue({ trxDataDal: date }, { emitEvent: false });
  }

  onDateAlChanged(e: DateBoxValueChangedEvent): void {
    if (e.value == null) return;

    const date = new Date(e.value);
    date.setHours(23, 59, 59, 999);
    this.searchForm.patchValue({ trxDataAl: date }, { emitEvent: false });
  }

  onGridPageSizeChanged(newSize: number): void {
    this.pageSize.set(this.isValidPageSize(newSize) ? newSize : DEFAULT_PAGE_SIZE);
    this.persistFilters();
  }

  searchAppearers(): void {
    if (!this.isBrowser) return;

    const request: GetAppearerByParametersRequest = {
      AraName: String(this.searchForm.value.arcAppName ?? ''),
      AraBirthdate: null,
      AraRecComplete: false,
      ShowExpiredRecords: true,
      RecordValidityDays: 365
    };

    this.isAppearerLoading.set(true);

    this.appearerService.getByParameters(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAppearerLoading.set(false))
      )
      .subscribe({
        next: (data) => this.appearers.set(data ?? [])
      });
  }

  getStatoPillClass(stato: string): string {
    if (!stato) return '';
    const s = stato.toLowerCase();
    if (s.includes('stor') || s.includes('revers')) return 'stato-pill--stornata';
    if (s.includes('forz') || s.includes('vigil')) return 'stato-pill--forzata';
    if (s.includes('ok') || s.includes('complet')) return 'stato-pill--ok';
    return '';
  }

  search(): void {
    const request = this.buildRequest();
    this.isLoading.set(true);
    this.error.set(null);

    this.ricercaOperazioniFacade.searchOperazioni(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => { this.operations.set(data ?? []); this.persistFilters(); },
        error: (err: any) => { this.error.set(err?.message ?? 'Errore nel recupero delle operazioni'); }
      });
  }

  private loadLookups(): void {
    if (!this.isBrowser) return;

    this.service.getAllCurrency().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => this.currencies.set(data ?? []) });
    this.service.getBranches().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => this.branches.set(data ?? []) });
    this.service.getCurrencyTypes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => this.currencyTypes.set(data ?? []) });
    this.service.getStOperationsType().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => this.stOperationsTypes.set(data ?? []) });
  }

  private restoreFilters(): void {
    const saved = this.readPersistedFilters();
    if (!saved) {
      this.pageSize.set(DEFAULT_PAGE_SIZE);
      return;
    }

    this.searchForm.patchValue({
      trxCassa: saved.trxCassa,
      trxLocalita: saved.trxLocalita,
      trxDataDal: saved.trxDataDal ? new Date(saved.trxDataDal) : null,
      trxDataAl: saved.trxDataAl ? new Date(saved.trxDataAl) : null,
      trxReverse: saved.trxReverse,
      trxCutId: saved.trxCutId,
      trxOptId: saved.trxOptId,
      trxDivope: saved.trxDivope,
      trxImpopeDA: saved.trxImpopeDA,
      trxImpopeA: saved.trxImpopeA,
      arcAppName: saved.arcAppName,
      arcForced: saved.arcForced
    }, { emitEvent: false });

    this.pageSize.set(this.isValidPageSize(saved.pageSize) ? saved.pageSize : DEFAULT_PAGE_SIZE);
  }

  private buildRequest(): RicercaOperazioniRequest {
    const value = this.searchForm.getRawValue();
    return {
      trxCassa: this.normalizeText(value.trxCassa),
      trxLocalita: this.normalizeText(value.trxLocalita),
      trxDataDal: value.trxDataDal ? this.normalizeStartOfDay(value.trxDataDal) : null,
      trxDataAl: value.trxDataAl ? this.normalizeEndOfDay(value.trxDataAl) : null,
      trxReverse: value.trxReverse ?? false,
      trxCutId: this.normalizeText(value.trxCutId),
      trxOptId: this.normalizeText(value.trxOptId),
      trxDivope: this.normalizeText(value.trxDivope),
      trxImpopeDA: value.trxImpopeDA ?? null,
      trxImpopeA: value.trxImpopeA ?? null,
      arcAppName: this.normalizeText(value.arcAppName),
      arcForced: value.arcForced ?? true
    };
  }

  private normalizeText(value: string | null | undefined): string | null {
    const normalized = String(value ?? '').trim();
    return normalized.length > 0 ? normalized : null;
  }

  private persistFilters(): void {
    if (!this.isBrowser) return;

    const value = this.searchForm.getRawValue();
    const state: RicercaOperazioniFiltersState = {
      trxCassa: value.trxCassa ?? '',
      trxLocalita: value.trxLocalita ?? '',
      trxDataDal: value.trxDataDal ? this.toStorageDate(value.trxDataDal) : null,
      trxDataAl: value.trxDataAl ? this.toStorageDate(value.trxDataAl) : null,
      trxReverse: value.trxReverse ?? false,
      trxCutId: value.trxCutId ?? '',
      trxOptId: value.trxOptId ?? '',
      trxDivope: value.trxDivope ?? '',
      trxImpopeDA: value.trxImpopeDA ?? null,
      trxImpopeA: value.trxImpopeA ?? null,
      arcAppName: value.arcAppName ?? '',
      arcForced: value.arcForced ?? true,
      pageSize: this.pageSize()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private readPersistedFilters(): RicercaOperazioniFiltersState | null {
    if (!this.isBrowser) return null;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as RicercaOperazioniFiltersState;
    } catch {
      return null;
    }
  }

  private clearPersistedFilters(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(STORAGE_KEY);
  }

  private toStorageDate(value: Date): string {
    return this.normalizeStartOfDay(value).toISOString();
  }

  private normalizeStartOfDay(value: Date): Date {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private normalizeEndOfDay(value: Date): Date {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  private isValidPageSize(value: number): boolean {
    return Number.isInteger(value) && value >= 1 && value <= 1000;
  }

}
