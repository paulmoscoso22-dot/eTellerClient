import { Component, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxButtonModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import {
  GestioneRegoleService,
  AntiRecRule,
  AntiRecRuleHistory,
  AntiRecRuleUpsert,
} from '../../services/gestione-regole.service';
import { Service } from '../../../../../core/services/service';
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
    DxNumberBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
  ],
  templateUrl: './gestione-regole.component.html',
  styleUrls: ['./gestione-regole.component.css'],
})
export class GestioneRegoleComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly regoleService = inject(GestioneRegoleService);
  private readonly coreService = inject(Service);

  private subscription: Subscription | null = null;

  rules = signal<AntiRecRule[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  operationTypes = signal<IStOperationType[]>([]);
  currencyTypes = signal<ICurrencyType[]>([]);

  filterForm: FormGroup = this.fb.group({
    arlOpTypeId: [''],
    arlCurTypeId: [''],
  });

  // ── Form popup ──
  isFormPopupVisible = false;
  isEditMode = signal(false);
  selectedRuleId = signal<number | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    arlOpTypeId: [''],
    arlCurTypeId: [''],
    arlValStart: [null],
    arlValEnd: [null],
    arlAcctId: [''],
    arlAcctType: [''],
    arlLimit: [null],
    arlIsinternal: [false],
    arlExclude: [false],
  });

  // ── History popup ──
  isHistoryPopupVisible = false;
  historyRules = signal<AntiRecRuleHistory[]>([]);
  isLoadingHistory = signal(false);
  historyRuleId = signal<number | null>(null);

  constructor() {
    this.coreService.getStOperationsType()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.operationTypes.set(data));

    this.coreService.getCurrencyTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.currencyTypes.set(data));
  }

  search(): void {
    const { arlOpTypeId, arlCurTypeId } = this.filterForm.value;
    this.destroy();
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription = this.regoleService.GetSpAntirecRulesParameters({
      arlOpTypeId: arlOpTypeId ?? '',
      arlCurTypeId: arlCurTypeId ?? '',
      arlAcctId: '',
      arlAcctType: '',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.rules.set(data); this.isLoading.set(false); },
      error: (err: any) => {
        this.error.set(err.message || 'Errore nel recupero delle regole');
        this.isLoading.set(false);
      }
    });
  }

  showAll(): void {
    this.filterForm.reset({ arlOpTypeId: '', arlCurTypeId: '' });
    this.search();
  }

  resetFilters(): void {
    this.filterForm.reset({ arlOpTypeId: '', arlCurTypeId: '' });
    this.rules.set([]);
    this.error.set(null);
  }

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.selectedRuleId.set(null);
    this.saveError.set(null);
    this.editForm.reset({
      arlOpTypeId: '',
      arlCurTypeId: '',
      arlValStart: null,
      arlValEnd: null,
      arlAcctId: '',
      arlAcctType: '',
      arlLimit: null,
      arlIsinternal: false,
      arlExclude: false,
    });
    this.isFormPopupVisible = true;
  }

  openEditPopup(rule: AntiRecRule): void {
    this.isEditMode.set(true);
    this.selectedRuleId.set(rule.arlId);
    this.saveError.set(null);
    this.editForm.reset({
      arlOpTypeId: rule.arlOpTypeId,
      arlCurTypeId: rule.arlCurTypeId,
      arlValStart: rule.arlValStart ? new Date(rule.arlValStart) : null,
      arlValEnd: rule.arlValEnd ? new Date(rule.arlValEnd) : null,
      arlAcctId: rule.arlAcctId ?? '',
      arlAcctType: rule.arlAcctType ?? '',
      arlLimit: rule.arlLimit,
      arlIsinternal: rule.arlIsinternal,
      arlExclude: rule.arlExclude,
    });
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  save(): void {
    const v = this.editForm.value;
    if (!v.arlOpTypeId || !v.arlCurTypeId || !v.arlValStart || !v.arlValEnd ||
        v.arlLimit === null || v.arlLimit === undefined) {
      this.saveError.set('Compilare i campi obbligatori: Tipo operazione, Tipo divisa, Date di validità e Limite');
      return;
    }

    const payload: AntiRecRuleUpsert = {
      ...(this.isEditMode() ? { arlId: this.selectedRuleId()! } : {}),
      arlOpTypeId: v.arlOpTypeId,
      arlCurTypeId: v.arlCurTypeId,
      arlValStart: v.arlValStart,
      arlValEnd: v.arlValEnd,
      arlAcctId: v.arlAcctId ?? '',
      arlAcctType: v.arlAcctType ?? '',
      arlLimit: v.arlLimit,
      arlIsinternal: v.arlIsinternal ?? false,
      arlExclude: v.arlExclude ?? false,
    };

    this.isSaving.set(true);
    this.saveError.set(null);

    const obs = this.isEditMode()
      ? this.regoleService.UpdateAntirecRule(payload)
      : this.regoleService.InsertAntirecRule(payload);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => {
        this.isSaving.set(false);
        if (result) {
          this.isFormPopupVisible = false;
          this.search();
        } else {
          this.saveError.set('Il periodo scelto si sovrappone ad un altro (per la stessa regola)');
        }
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err.message || 'Errore durante il salvataggio');
      }
    });
  }

  openHistoryPopup(rule: AntiRecRule): void {
    this.historyRuleId.set(rule.arlId);
    this.historyRules.set([]);
    this.isLoadingHistory.set(true);
    this.isHistoryPopupVisible = true;

    this.regoleService.GetAntirecRuleHistory(rule.arlId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.historyRules.set(data); this.isLoadingHistory.set(false); },
        error: () => { this.isLoadingHistory.set(false); }
      });
  }

  closeHistoryPopup(): void {
    this.isHistoryPopupVisible = false;
  }

  ngOnDestroy(): void { this.destroy(); }

  private destroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}
