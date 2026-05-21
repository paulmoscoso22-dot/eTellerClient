import { Component, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxButtonModule,
  DxToastModule,
  DxTemplateModule,
} from 'devextreme-angular';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';
import { SempionePopupComponent } from '../../../../../components/General/sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../../../../../components/General/sempione-popup-action-bar/sempione-popup-action-bar.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportFacade } from '../../../../archivi/report/services/report.facade';
import { GetTransactionWaitingForBefResponse } from '../../../../archivi/report/domain/transaction.models';
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
    DxButtonModule,
    DxToastModule,
    DxTemplateModule,
    HeaderCardComponent,
    SempionePopupComponent,
    SempionePopupActionBarComponent,
  ],
  templateUrl: './attesa-benefondo.component.html',
  styleUrls: ['./attesa-benefondo.component.css'],
})
export class VigilanzaAttesaBenefondoComponent {
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

  searchForm: FormGroup = this.fb.group({
    trxData: [new Date()],
    trxCassa: [''],
  });

  constructor(private facade: ReportFacade) {}

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
    const { trxData, trxCassa } = this.searchForm.value;
    const dal = this.normalizeSearchDate(trxData);

    this.isLoading.set(true);
    this.error.set(null);

    this.facade.getTransactionWaitingForBef(
      this.normalizeSearchValue(trxCassa),
      dal,
      dal,
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
    this.searchForm.reset({ trxData: null, trxCassa: '' });
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
