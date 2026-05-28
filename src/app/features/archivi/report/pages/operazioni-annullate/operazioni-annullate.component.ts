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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneButtonComponent } from '../../../../../components/General/sempione-button/sempione-button.component';
import { SempionePageShellComponent } from '../../../../../components/General/sempione-page-shell/sempione-page-shell.component';
import { SempionePopupComponent } from '../../../../../components/General/sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../../../../../components/General/sempione-popup-action-bar/sempione-popup-action-bar.component';
import { SempioneSearchModeComponent } from '../../../../../components/General/sempione-search-mode/sempione-search-mode.component';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionOperazioniAnnulateResponse, ReportUserContext } from '../../domain/transaction.models';
import { TransactionStatus } from '../../domain/transaction-status.enum';

@Component({
  selector: 'app-operazioni-annullate',
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
    SempioneButtonComponent,
    SempioneSearchModeComponent,
  ],
  templateUrl: './operazioni-annullate.component.html',
  styleUrls: ['./operazioni-annullate.component.css'],
})
export class OperazioniAnnullateComponent implements OnInit {
  private readonly destroyRef    = inject(DestroyRef);
  private readonly reportFacade  = inject(ReportFacade);
  private readonly fb            = inject(FormBuilder);

  transactions     = signal<GetTransactionOperazioniAnnulateResponse[]>([]);
  isLoading        = signal(false);
  error            = signal<string | null>(null);
  userCtx          = signal<ReportUserContext | null>(null);
  selectedOp       = signal<GetTransactionOperazioniAnnulateResponse | null>(null);
  showDetailPopup  = signal(false);
  toastVisible     = signal(false);
  toastType        = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage     = signal('');

  canShowActions = computed(() => {
    const ctx = this.userCtx();
    if (!ctx) return false;
    return ctx.canUseTeller || ctx.canOverrideCassa;
  });

  searchForm: FormGroup = this.fb.group({
    trxData:  [new Date(), [Validators.required]],
    trxCassa: [''],
  });

  ngOnInit(): void {
    this.reportFacade.getUserContext()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ctx) => {
          this.userCtx.set(ctx);
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

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const raw   = this.searchForm.getRawValue();
    const dal   = raw.trxData instanceof Date ? raw.trxData : null;
    const al    = dal ? new Date(new Date(dal).setHours(23, 59, 59, 999)) : null;
    const cassa = typeof raw.trxCassa === 'string' && raw.trxCassa.trim() ? raw.trxCassa.trim() : null;

    this.isLoading.set(true);
    this.error.set(null);

    this.reportFacade.getTransactionOperazioniAnnullate(
      cassa, dal, al, TransactionStatus.Annullato, null
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  (data) => { this.transactions.set(data); this.isLoading.set(false); },
      error: (err)  => {
        this.error.set(err?.message || 'Errore nel recupero delle operazioni annullate.');
        this.isLoading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.searchForm.reset({
      trxData:  new Date(),
      trxCassa: this.userCtx()?.cashDeskId ?? '',
    });
    this.transactions.set([]);
    this.error.set(null);
  }

  print(): void {
    window.print();
  }

  openDetail(row: GetTransactionOperazioniAnnulateResponse): void {
    this.selectedOp.set(row);
    this.showDetailPopup.set(true);
  }

  closePopup(): void {
    this.showDetailPopup.set(false);
    this.selectedOp.set(null);
  }
}
