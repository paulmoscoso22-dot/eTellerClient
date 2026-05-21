import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionGiornaleCassaResponse } from '../../domain/transaction.models';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { GiornaleCassaGridComponent } from '../../components/giornale-cassa-grid/giornale-cassa-grid.component';

@Component({
  selector: 'app-giornale-cassa',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    GiornaleCassaGridComponent
  ],
  templateUrl: './giornale-cassa.component.html',
  styleUrls: ['./giornale-cassa.component.css'],
})
export class GiornaleCassaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  transactions = signal<GetTransactionGiornaleCassaResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  statusDefaultValue = TransactionStatus.Eseguito;

  constructor(private reportFacade: ReportFacade) {}

  /**
   * Angular lifecycle hook - Initialize component
   */
  ngOnInit(): void {
    // Component initialized - filter will trigger search when ready
  }

  /**
   * Handle search event from filter component
   */
  onSearch(filterData: any): void {
    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = filterData;
    
    if (!trxDataDal || !trxDataAl) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }
    
    this.getTransactionWithFilters(trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId);
  }

  /**
   * Get transactions with filters
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxStatus - Status filter for transactions
   * @param trxBraId - Branch identifier
   */
  getTransactionWithFilters(
    trxCassa: string,
    trxDataDal: Date,
    trxDataAl: Date,
    trxStatus: number,
    trxBraId: string
  ): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.reportFacade.getTransactionGiornaleCassa(
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.transactions.set(data as GetTransactionGiornaleCassaResponse[]);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero transazioni');
        this.isLoading.set(false);
      }
    });
  }
}
