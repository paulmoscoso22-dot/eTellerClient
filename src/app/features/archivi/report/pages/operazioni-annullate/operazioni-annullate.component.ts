import { Component, OnInit, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionOperazioniAnnulateResponse } from '../../domain/transaction.models';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { OperazioniAnnullateGridComponent } from '../../components/operazioni-annullate-grid/operazioni-annullate-grid.component';

@Component({
  selector: 'app-operazioni-annullate',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    OperazioniAnnullateGridComponent
  ],
  templateUrl: './operazioni-annullate.component.html',
  styleUrls: ['./operazioni-annullate.component.css'],
})
export class OperazioniAnnullateComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;
  
  transactions = signal<GetTransactionOperazioniAnnulateResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  statusDefaultValue = TransactionStatus.Annullato;

  constructor(private reportFacade: ReportFacade) {}

  /**
   * Angular lifecycle hook - Initialize component
   */
  ngOnInit(): void {
    // Component initialized - filter will trigger search when ready
  }

  /**
   * Angular lifecycle hook - Cleanup and manage memory leak
   */
  ngOnDestroy(): void {
    this.destroy();
  }

  /**
   * Manually destroy and cleanup subscriptions
   */
  private destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
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
    this.destroy(); // Clean up previous subscription
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription = this.reportFacade.getTransactionOperazioniAnnullate(
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.transactions.set(data as GetTransactionOperazioniAnnulateResponse[]);
        this.isLoading.set(false);
        console.log('Transazioni Operazioni Annullate:', data, this.isLoading());
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero transazioni');
        this.isLoading.set(false);
        console.error('Errore nel recupero transazioni:', error);
      }
    });
  }
}
