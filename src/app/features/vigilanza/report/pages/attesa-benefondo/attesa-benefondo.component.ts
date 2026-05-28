import { Component, signal, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxToastModule,
  DxTemplateModule,
} from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempionePageShellComponent } from '../../../../../components/General/sempione-page-shell/sempione-page-shell.component';
import { SempionePopupComponent } from '../../../../../components/General/sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../../../../../components/General/sempione-popup-action-bar/sempione-popup-action-bar.component';
import { SempioneSearchModeComponent } from '../../../../../components/General/sempione-search-mode/sempione-search-mode.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportFacade } from '../../../../archivi/report/services/report.facade';
import { GetTransactionWaitingForBefResponse, ReportUserContext } from '../../../../archivi/report/domain/transaction.models';
import { TransactionStatus } from '../../../../archivi/report/domain/transaction-status.enum';

@Component({
  selector: 'app-vigilanza-attesa-benefondo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxToastModule,
    DxTemplateModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempionePageShellComponent,
    SempionePopupComponent,
    SempionePopupActionBarComponent,
    SempioneSearchModeComponent,
  ],
  templateUrl: './attesa-benefondo.component.html',
  styleUrls: ['./attesa-benefondo.component.css'],
})
export class VigilanzaAttesaBenefondoComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  transactions = signal<GetTransactionWaitingForBefResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedOperation = signal<GetTransactionWaitingForBefResponse | null>(null);
  showDetailPopup = signal(false);
  toastVisible = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');

  userContext = signal<ReportUserContext | null>(null);
  canShowActions = computed(() => {
    const ctx = this.userContext();
    if (!ctx) return true;
    return ctx.canUseTeller || ctx.canOverrideCassa;
  });

  searchForm: FormGroup = this.fb.group({
    trxData:  [new Date(), [Validators.required]],
    trxCassa: [''],
  });

  constructor(private facade: ReportFacade) {}

  ngOnInit(): void {
    this.facade.getUserContext()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ctx) => {
          this.userContext.set(ctx);
          this.searchForm.patchValue({ trxCassa: ctx.cashDeskId ?? '' });
          if (!ctx.canOverrideCassa) {
            this.searchForm.get('trxCassa')?.disable();
          }
          this.search();
        },
        error: () => {
          this.searchForm.get('trxCassa')?.disable();
        }
      });
  }

  private normalizeSearchValue(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private normalizeSearchDate(value: unknown): Date | null {
    return value instanceof Date ? value : null;
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { trxData, trxCassa } = this.searchForm.getRawValue();
    const dal = this.normalizeSearchDate(trxData);
    const al  = dal ? new Date(new Date(dal).setHours(23, 59, 59, 999)) : null;

    this.isLoading.set(true);
    this.error.set(null);

    this.facade.getTransactionWaitingForBef(
      this.normalizeSearchValue(trxCassa),
      dal,
      al,
      TransactionStatus.AttesaBEF,
      null
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Errore nel recupero delle operazioni in attesa');
        this.isLoading.set(false);
      }
    });
  }

  print(): void {
    window.print();
  }

  resetFilters(): void {
    const cassa = this.userContext()?.cashDeskId ?? '';
    this.searchForm.reset({ trxData: new Date(), trxCassa: cassa });
    this.transactions.set([]);
    this.error.set(null);
  }

  openViewPopup(row: GetTransactionWaitingForBefResponse): void {
    this.selectedOperation.set(row);
    this.showDetailPopup.set(true);
  }

  closePopup(): void {
    this.showDetailPopup.set(false);
    this.selectedOperation.set(null);
  }

  getBefStatusLabel(status: number): string {
    switch (status) {
      case TransactionStatus.AttesaBEF: return 'Attesa BEF';
      case TransactionStatus.Eseguito:  return 'Eseguito';
      case TransactionStatus.Annullato: return 'Annullato';
      default: return String(status);
    }
  }

}
