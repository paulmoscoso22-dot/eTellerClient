import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DxTextBoxModule, DxSelectBoxModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { BookingRcService } from '../../services/booking-rc.service';
import { IBookingRcItemResponse, IBookingRcUpsertRequest, IAccountTypeResponse } from '../../models/booking-rc.models';
import { Service } from '../../../../../core/services/service';
import { IStOperationType } from '../../../../../core/domain/stOperationType.domain';
import { ICurrencyType } from '../../../../../core/domain/currencyType.domain';
import {
  SempionePageHeaderComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempioneToolbarComponent,
  SempioneDataGridComponent,
  SempioneGridColumn,
  SempionePopupComponent,
  SempionePopupCardComponent,
  SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,
  SempioneButtonComponent,
  SempioneAlertComponent,
} from '../../../../../components/General';

const NOME_TABELLA = 'ST_BOOKING_RC';

@Component({
  selector: 'app-causale-movimenti',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    SempionePageHeaderComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempioneDataGridComponent,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
    SempioneButtonComponent,
    SempioneAlertComponent,
  ],
  templateUrl: './causale-movimenti.component.html',
  styleUrls: ['./causale-movimenti.component.css'],
})
export class CausaleMovimentiComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly bookingRcService = inject(BookingRcService);
  private readonly coreService = inject(Service);

  items = signal<IBookingRcItemResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  operationTypes = signal<IStOperationType[]>([]);
  currencyTypes = signal<ICurrencyType[]>([]);
  accountTypes = signal<IAccountTypeResponse[]>([]);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'brcCutId',     caption: 'Tipo divisa',     alignment: 'left', width: 110 },
    { dataField: 'brcOptId',     caption: 'Tipo operazione', alignment: 'left', width: 120 },
    { dataField: 'brcActId',     caption: 'Genere conto',    alignment: 'left', width: 115 },
    { dataField: 'brcCodcau',    caption: 'Causale dare',    alignment: 'left', width: 110 },
    { dataField: 'brcCodcausto', caption: 'Causale avere',   alignment: 'left', width: 115 },
    { dataField: 'brcText1',     caption: 'Testo 1',         alignment: 'left' },
    { dataField: 'brcText2',     caption: 'Testo 2',         alignment: 'left' },
  ];

  filterForm: FormGroup = this.fb.group({
    brcCutId: [null],
    brcOptId: [null],
    brcActId: [null],
  });

  isFormPopupVisible = false;
  isEditMode = signal(false);
  selectedKey = signal<{ cutId: string; optId: string; actId: string } | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    brcCutId:     [null],
    brcOptId:     [null],
    brcActId:     [null],
    brcCodcau:    [''],
    brcCodcausto: [''],
    brcText1:     [''],
    brcText2:     [''],
  });

  constructor() {}

  ngOnInit(): void {
    this.loadCurrencyTypes();
    this.loadOperationTypes();
    this.loadAccountTypes();
    this.showAll();
  }

  private loadCurrencyTypes(): void {
    this.coreService.getCurrencyTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.currencyTypes.set(data));
  }

  private loadOperationTypes(): void {
    this.coreService.getStOperationsType()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.operationTypes.set(data));
  }

  private loadAccountTypes(): void {
    this.bookingRcService.getAccountTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.accountTypes.set(data));
  }

  search(): void {
    const { brcCutId, brcOptId, brcActId } = this.filterForm.value;
    this.isLoading.set(true);
    this.error.set(null);
    this.bookingRcService.getAll(brcCutId ?? '', brcOptId ?? '', brcActId ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.items.set(data); this.isLoading.set(false); },
        error: (err: any) => { this.error.set(err.message || 'Errore nel recupero dei dati'); this.isLoading.set(false); },
      });
  }

  showAll(): void {
    this.filterForm.reset({ brcCutId: null, brcOptId: null, brcActId: null });
    this.search();
  }

  resetFilters(): void {
    this.filterForm.reset({ brcCutId: null, brcOptId: null, brcActId: null });
    this.items.set([]);
    this.error.set(null);
  }

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.selectedKey.set(null);
    this.saveError.set(null);
    this.editForm.reset({ brcCutId: null, brcOptId: null, brcActId: null, brcCodcau: '', brcCodcausto: '', brcText1: '', brcText2: '' });
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: IBookingRcItemResponse): void {
    this.isEditMode.set(true);
    this.selectedKey.set({ cutId: item.brcCutId, optId: item.brcOptId, actId: item.brcActId });
    this.saveError.set(null);
    this.editForm.reset({
      brcCutId: item.brcCutId, brcOptId: item.brcOptId, brcActId: item.brcActId,
      brcCodcau: item.brcCodcau, brcCodcausto: item.brcCodcausto,
      brcText1: item.brcText1 ?? '', brcText2: item.brcText2 ?? '',
    });
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  save(): void {
    if (!this.validateSaveForm()) return;
    const payload = this.buildPayload();
    const isEdit = this.isEditMode();
    const label = `${payload.brcCutId} / ${payload.brcOptId} / ${payload.brcActId}`;

    this.isSaving.set(true);
    this.saveError.set(null);

    const obs = isEdit
      ? this.bookingRcService.update(payload)
      : this.bookingRcService.insert(payload);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => this.handleSaveResult(result, isEdit, label),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  private validateSaveForm(): boolean {
    const v = this.editForm.value;
    if (!v.brcCutId || !v.brcOptId || !v.brcActId) {
      this.saveError.set('Selezionare Tipo divisa, Tipo operazione e Genere conto');
      return false;
    }
    if (!v.brcCodcau?.trim()) {
      this.saveError.set('Il campo Codice causale è obbligatorio');
      return false;
    }
    if (!v.brcCodcausto?.trim()) {
      this.saveError.set('Il campo Codice causale storno è obbligatorio');
      return false;
    }
    return true;
  }

  private buildPayload(): IBookingRcUpsertRequest {
    const v = this.editForm.value;
    return {
      brcCutId: v.brcCutId, brcOptId: v.brcOptId, brcActId: v.brcActId,
      brcCodcau: v.brcCodcau.trim(), brcCodcausto: v.brcCodcausto.trim(),
      brcText1: v.brcText1?.trim() ?? '', brcText2: v.brcText2?.trim() ?? '',
      traUser: '', traStation: '',
    };
  }

  private handleSaveResult(result: boolean, isEdit: boolean, label: string): void {
    this.isSaving.set(false);
    if (result) {
      this.isFormPopupVisible = false;
      notify(isEdit ? `Causale "${label}" aggiornata` : `Causale "${label}" inserita`, 'success', 3000);
      this.search();
    } else {
      const msg = 'Operazione non riuscita. La combinazione di chiavi potrebbe essere già presente.';
      notify(msg, 'error', 4000);
      this.saveError.set(msg);
    }
  }

  private handleSaveError(err: any): void {
    this.isSaving.set(false);
    const msg = err.message || 'Errore durante il salvataggio';
    notify(msg, 'error', 4000);
    this.saveError.set(msg);
  }

  selectedKeyLabel(): string {
    const k = this.selectedKey();
    if (!k) return '';
    return `${k.cutId} / ${k.optId} / ${k.actId}`;
  }

  openTrace(item: IBookingRcItemResponse): void {
    this.router.navigate(['/trace'], {
      queryParams: {
        traTabNam: NOME_TABELLA,
        traEntCode: `${item.brcCutId}_${item.brcOptId}_${item.brcActId}`,
      },
    });
  }

  openTraceSelected(): void {
    const k = this.selectedKey();
    if (!k) return;
    this.isFormPopupVisible = false;
    this.router.navigate(['/trace'], {
      queryParams: {
        traTabNam: NOME_TABELLA,
        traEntCode: `${k.cutId}_${k.optId}_${k.actId}`,
      },
    });
  }
}
