import { Component, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxButtonModule,
  DxPopupModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingRcService, BookingRcItem, BookingRcUpsert, AccountType } from '../../services/booking-rc.service';
import { Service } from '../../../../../core/services/service';
import { StOperationType } from '../../../../../core/domain/stOperationType.domain';
import { CurrencyType } from '../../../../../core/domain/currencyType.domain';

@Component({
  selector: 'app-causale-movimenti',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxSelectBoxModule,
  ],
  templateUrl: './causale-movimenti.component.html',
  styleUrls: ['./causale-movimenti.component.css'],
})
export class CausaleMovimentiComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly bookingRcService = inject(BookingRcService);
  private readonly coreService = inject(Service);

  items = signal<BookingRcItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  operationTypes = signal<StOperationType[]>([]);
  currencyTypes = signal<CurrencyType[]>([]);
  accountTypes = signal<AccountType[]>([]);

  filterForm: FormGroup = this.fb.group({
    brcCutId: [null],
    brcOptId: [null],
    brcActId: [null],
  });

  // ── Form popup ──
  isFormPopupVisible = false;
  isEditMode = signal(false);
  selectedKey = signal<{ cutId: string; optId: string; actId: string } | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    brcCutId: [null],
    brcOptId: [null],
    brcActId: [null],
    brcCodcau: [''],
    brcCodcausto: [''],
    brcText1: [''],
    brcText2: [''],
  });

  constructor() {
    this.coreService.getCurrencyTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.currencyTypes.set(data));

    this.coreService.getStOperationsType()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.operationTypes.set(data));

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
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero dei dati');
          this.isLoading.set(false);
        }
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

  openEditPopup(item: BookingRcItem): void {
    this.isEditMode.set(true);
    this.selectedKey.set({ cutId: item.brcCutId, optId: item.brcOptId, actId: item.brcActId });
    this.saveError.set(null);
    this.editForm.reset({
      brcCutId: item.brcCutId,
      brcOptId: item.brcOptId,
      brcActId: item.brcActId,
      brcCodcau: item.brcCodcau,
      brcCodcausto: item.brcCodcausto,
      brcText1: item.brcText1 ?? '',
      brcText2: item.brcText2 ?? '',
    });
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  save(): void {
    const v = this.editForm.value;
    if (!v.brcCutId || !v.brcOptId || !v.brcActId) {
      this.saveError.set('Selezionare Tipo divisa, Tipo operazione e Genere conto');
      return;
    }
    if (!v.brcCodcau?.trim()) {
      this.saveError.set('Il campo Codice causale è obbligatorio');
      return;
    }
    if (!v.brcCodcausto?.trim()) {
      this.saveError.set('Il campo Codice causale storno è obbligatorio');
      return;
    }

    const payload: BookingRcUpsert = {
      brcCutId: v.brcCutId,
      brcOptId: v.brcOptId,
      brcActId: v.brcActId,
      brcCodcau: v.brcCodcau.trim(),
      brcCodcausto: v.brcCodcausto.trim(),
      brcText1: v.brcText1?.trim() ?? '',
      brcText2: v.brcText2?.trim() ?? '',
    };

    this.isSaving.set(true);
    this.saveError.set(null);

    const obs = this.isEditMode()
      ? this.bookingRcService.update(payload)
      : this.bookingRcService.insert(payload);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => {
        this.isSaving.set(false);
        if (result) {
          this.isFormPopupVisible = false;
          this.search();
        } else {
          this.saveError.set('Operazione non riuscita. La combinazione di chiavi potrebbe essere già presente.');
        }
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err.message || 'Errore durante il salvataggio');
      }
    });
  }

  selectedKeyLabel(): string {
    const k = this.selectedKey();
    if (!k) return '';
    return `${k.cutId} / ${k.optId} / ${k.actId}`;
  }
}
