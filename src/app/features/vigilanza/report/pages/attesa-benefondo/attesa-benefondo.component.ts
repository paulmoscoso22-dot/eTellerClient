import { Component, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxButtonModule,
  DxPopupModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
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
    DxPopupModule,
  ],
  templateUrl: './attesa-benefondo.component.html',
  styleUrls: ['./attesa-benefondo.component.css'],
})
export class VigilanzaAttesaBenefondoComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private subscription: Subscription | null = null;

  transactions = signal<GetTransactionWaitingForBefResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedOperation = signal<GetTransactionWaitingForBefResponse | null>(null);
  isDetailPopupVisible = false;

  searchForm: FormGroup = this.fb.group({
    trxData: [new Date()],
    trxCassa: [''],
  });

  constructor(private facade: ReportFacade) {}

  search(): void {
    const { trxData, trxCassa } = this.searchForm.value;
    const base = trxData ? new Date(trxData) : new Date();
    const dal = new Date(base); dal.setHours(0, 0, 0, 0);
    const al  = new Date(base); al.setHours(23, 59, 59, 999);

    this.destroy();
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription = this.facade.getTransactionWaitingForBef(
      trxCassa ?? '',
      dal,
      al,
      TransactionStatus.AttesaBEF,
      ''
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
    this.searchForm.reset({ trxData: new Date(), trxCassa: '' });
    this.transactions.set([]);
    this.error.set(null);
  }

  openViewPopup(row: GetTransactionWaitingForBefResponse): void {
    this.selectedOperation.set(row);
    this.isDetailPopupVisible = true;
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
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

  ngOnDestroy(): void { this.destroy(); }

  private destroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}
