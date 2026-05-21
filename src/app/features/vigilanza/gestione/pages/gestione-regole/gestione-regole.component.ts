import { Component, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxButtonModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxNumberBoxModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { Subscription } from 'rxjs';
import { AuthStore } from '../../../../auth/auth.store';
import { GestioneRegoleService } from '../../services/gestione-regole.service';
import {
  IAntirecRuleResponse,
  IAntirecRulesSearchParams,
  IInsertAntirecRuleRequest,
  IUpdateAntirecRuleRequest,
  IDeleteAntirecRuleRequest,
  IHistoryItem,
} from '../../domain/gestione-regole.models';
import { IStOperationType } from '../../../../../core/domain/stOperationType.domain';
import { ICurrencyType } from '../../../../../core/domain/currencyType.domain';

@Component({
  selector: 'app-gestione-regole',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxNumberBoxModule,
  ],
  templateUrl: './gestione-regole.component.html',
  styleUrls: ['./gestione-regole.component.css'],
})
export class GestioneRegoleComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(GestioneRegoleService);
  private readonly authStore = inject(AuthStore);

  private subscription: Subscription | null = null;

  // ── Grid data ──
  rules = signal<IAntirecRuleResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ── Lookup data ──
  operationTypes = signal<IStOperationType[]>([]);
  currencyTypes = signal<ICurrencyType[]>([]);

  // ── Filter form ──
  filterForm: FormGroup = this.fb.group({
    arlOpTypeId: [null],
    arlCurTypeId: [null],
    arlAcctId: [''],
    arlAcctType: [''],
  });

  // ── Form popup (add / edit) ──
  isFormPopupVisible = false;
  isEditMode = signal(false);
  isViewMode = signal(false);
  selectedArlId = signal<number | null>(null);
  isSaving = signal(false);
  isLoadingForm = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    arlOpTypeId: [null],
    arlCurTypeId: [null],
    arlAcctId: [''],
    arlAcctType: [''],
    arlLimit: [0],
    arlExclude: [false],
    arlValStart: [null],
    arlValEnd: [null],
    arlIsinternal: [false],
  });

  // ── History popup ──
  isHistoryPopupVisible = false;
  historyItems = signal<IHistoryItem[]>([]);
  isLoadingHistory = signal(false);
  historyArlId = signal<number | null>(null);

  constructor() {
    this.service.getOperationTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.operationTypes.set(data ?? []));

    this.service.getCurrencyTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.currencyTypes.set(data ?? []));
  }

  // ── Filter actions ──

  search(): void {
    const v = this.filterForm.value;
    const request: IAntirecRulesSearchParams = {
      arlOpTypeId: v.arlOpTypeId ?? null,
      arlCurTypeId: v.arlCurTypeId ?? null,
      arlAcctId: v.arlAcctId || null,
      arlAcctType: v.arlAcctType || null,
    };
    this.destroy();
    this.isLoading.set(true);
    this.error.set(null);
    this.subscription = this.service.getByParameters(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.rules.set(data ?? []); this.isLoading.set(false); },
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero delle regole');
          this.isLoading.set(false);
        }
      });
  }

  resetFilters(): void {
    this.filterForm.reset({ arlOpTypeId: null, arlCurTypeId: null, arlAcctId: '', arlAcctType: '' });
    this.rules.set([]);
    this.error.set(null);
  }

  // ── Form popup ──

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.isViewMode.set(false);
    this.selectedArlId.set(null);
    this.saveError.set(null);
    this.editForm.reset({
      arlOpTypeId: null,
      arlCurTypeId: null,
      arlAcctId: '',
      arlAcctType: '',
      arlLimit: 0,
      arlExclude: false,
      arlValStart: null,
      arlValEnd: null,
      arlIsinternal: false,
    });
    this.isFormPopupVisible = true;
  }

  openEditPopup(row: IAntirecRuleResponse): void {
    this.isEditMode.set(true);
    this.isViewMode.set(false);
    this.selectedArlId.set(row.arlId);
    this.saveError.set(null);
    this.isLoadingForm.set(true);
    this.isFormPopupVisible = true;

    this.service.getById(row.arlId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: IAntirecRuleResponse) => {
          this.editForm.reset({
            arlOpTypeId: data.arlOpTypeId ?? null,
            arlCurTypeId: data.arlCurTypeId ?? null,
            arlAcctId: data.arlAcctId ?? '',
            arlAcctType: data.arlAcctType ?? '',
            arlLimit: data.arlLimit ?? 0,
            arlExclude: data.arlExclude ?? false,
            arlValStart: data.arlValStart ? new Date(data.arlValStart) : null,
            arlValEnd: data.arlValEnd ? new Date(data.arlValEnd) : null,
            arlIsinternal: data.arlIsinternal ?? false,
          });
          this.isLoadingForm.set(false);
        },
        error: () => {
          this.saveError.set('Errore nel caricamento dei dati');
          this.isLoadingForm.set(false);
        }
      });
  }

  openTracePopup(row: IAntirecRuleResponse): void {
    this.isEditMode.set(false);
    this.isViewMode.set(true);
    this.selectedArlId.set(row.arlId);
    this.saveError.set(null);
    this.isLoadingForm.set(true);
    this.isFormPopupVisible = true;

    this.service.getById(row.arlId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: IAntirecRuleResponse) => {
          this.editForm.reset({
            arlOpTypeId: data.arlOpTypeId ?? null,
            arlCurTypeId: data.arlCurTypeId ?? null,
            arlAcctId: data.arlAcctId ?? '',
            arlAcctType: data.arlAcctType ?? '',
            arlLimit: data.arlLimit ?? 0,
            arlExclude: data.arlExclude ?? false,
            arlValStart: data.arlValStart ? new Date(data.arlValStart) : null,
            arlValEnd: data.arlValEnd ? new Date(data.arlValEnd) : null,
            arlIsinternal: data.arlIsinternal ?? false,
          });
          this.isLoadingForm.set(false);
        },
        error: () => {
          this.saveError.set('Errore nel caricamento dei dati');
          this.isLoadingForm.set(false);
        }
      });
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  save(): void {
    const v = this.editForm.value;

    // Validazione campi obbligatori
    if (!v.arlOpTypeId) {
      this.saveError.set('Il campo "Tipo operazione" è obbligatorio');
      return;
    }
    if (!v.arlCurTypeId) {
      this.saveError.set('Il campo "Tipo divisa" è obbligatorio');
      return;
    }
    if (!v.arlValStart) {
      this.saveError.set('Il campo "Inizio validità" è obbligatorio');
      return;
    }
    if (!v.arlValEnd) {
      this.saveError.set('Il campo "Fine validità" è obbligatorio');
      return;
    }

    if (this.isEditMode()) {
      const confirmed = confirm('Confermi di voler modificare questa regola?');
      if (!confirmed) return;

      this.isSaving.set(true);
      this.saveError.set(null);

      const req: IUpdateAntirecRuleRequest = {
        traUser: this.authStore.currentUser()?.userId ?? '',
        traStation: window.location.hostname,
        arlId: this.selectedArlId()!,
        arlOpTypeId: v.arlOpTypeId,
        arlCurTypeId: v.arlCurTypeId,
        arlAcctId: v.arlAcctId || null,
        arlAcctType: v.arlAcctType || null,
        arlLimit: v.arlLimit ?? 0,
        arlExclude: v.arlExclude ?? false,
        arlRecDate: new Date(),
        arlValStart: this.toDateString(v.arlValStart),
        arlValEnd: this.toDateString(v.arlValEnd),
        arlIsinternal: v.arlIsinternal ?? false,
      };
      this.service.updateRule(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          notify('Regola aggiornata con successo', 'success', 3000);
          this.isSaving.set(false);
          this.isFormPopupVisible = false;
          this.search();
        },
        error: () => {
          this.isSaving.set(false);
          this.saveError.set('Errore durante l\'operazione');
          notify('Errore durante l\'operazione', 'error', 3000);
        }
      });
    } else {
      const confirmed = confirm('Confermi di voler aggiungere questa regola?');
      if (!confirmed) return;

      this.isSaving.set(true);
      this.saveError.set(null);

      const req: IInsertAntirecRuleRequest = {
        traUser: this.authStore.currentUser()?.userId ?? '',
        traStation: window.location.hostname,
        arlOpTypeId: v.arlOpTypeId,
        arlCurTypeId: v.arlCurTypeId,
        arlAcctId: v.arlAcctId || null,
        arlAcctType: v.arlAcctType || null,
        arlLimit: v.arlLimit ?? 0,
        arlExclude: v.arlExclude ?? false,
        arlRecDate: new Date(),
        arlValStart: this.toDateString(v.arlValStart),
        arlValEnd: this.toDateString(v.arlValEnd),
        arlIsinternal: v.arlIsinternal ?? false,
      };
      this.service.insertRule(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          notify('Regola inserita con successo', 'success', 3000);
          this.isSaving.set(false);
          this.isFormPopupVisible = false;
          this.search();
        },
        error: () => {
          this.isSaving.set(false);
          this.saveError.set('Errore durante l\'operazione');
          notify('Errore durante l\'operazione', 'error', 3000);
        }
      });
    }
  }

  // ── History popup ──

  openHistoryPopup(row: IAntirecRuleResponse): void {
    this.historyArlId.set(row.arlId);
    this.historyItems.set([]);
    this.isLoadingHistory.set(true);
    this.isHistoryPopupVisible = true;
    this.service.getHistory(row.arlId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.historyItems.set(data ?? []); this.isLoadingHistory.set(false); },
        error: () => { this.isLoadingHistory.set(false); }
      });
  }

  closeHistoryPopup(): void {
    this.isHistoryPopupVisible = false;
  }

  // ── Delete ──

  openDeletePopup(row: IAntirecRuleResponse): void {
    const confirmed = confirm('Eliminare la regola selezionata?');
    if (!confirmed) return;

    const req: IDeleteAntirecRuleRequest = {
      traUser: this.authStore.currentUser()?.userId ?? '',
      traStation: window.location.hostname,
      arlId: row.arlId,
    };

    this.service.deleteRule(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify('Regola eliminata con successo', 'success', 3000);
          this.search();
        },
        error: () => {
          notify('Errore durante l\'operazione', 'error', 3000);
        }
      });
  }

  // ── Utils ──

  private toDateString(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  ngOnDestroy(): void { this.destroy(); }

  private destroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}
