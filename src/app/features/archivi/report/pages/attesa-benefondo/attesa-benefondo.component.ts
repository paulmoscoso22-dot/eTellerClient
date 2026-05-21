import { Component, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionWithFiltersResponse } from '../../domain/transaction.models';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { AttesaBenefondoGridComponent } from '../../components/attesa-benefondo-grid/attesa-benefondo-grid.component';
import { SempionePageHeaderComponent } from '../../../../../components/General/sempione-page-header/sempione-page-header.component';

@Component({
  selector: 'app-attesa-benefondo',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    AttesaBenefondoGridComponent,
    SempionePageHeaderComponent,
  ],
  templateUrl: './attesa-benefondo.component.html',
  styleUrls: ['./attesa-benefondo.component.css'],
})
export class AttesaBenefondoComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;

  transactions = signal<GetTransactionWithFiltersResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  statusDefaultValue = TransactionStatus.AttesaBEF;

  constructor(private reportFacade: ReportFacade) {}

  ngOnDestroy(): void {
    this.destroy();
  }

  private destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  onSearch(filterData: any): void {
    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = filterData;

    if (!trxDataDal || !trxDataAl) {
      this.error.set('Compila tutti i campi obbligatori');
      return;
    }

    this.getTransactionWithFilters(trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId);
  }

  getTransactionWithFilters(
    trxCassa: string,
    trxDataDal: Date,
    trxDataAl: Date,
    trxStatus: number,
    trxBraId: string
  ): void {
    this.destroy();
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription = this.reportFacade.getTransactionWithFilters(
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.transactions.set(data as GetTransactionWithFiltersResponse[]);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero transazioni');
        this.isLoading.set(false);
      }
    });
  }
}
