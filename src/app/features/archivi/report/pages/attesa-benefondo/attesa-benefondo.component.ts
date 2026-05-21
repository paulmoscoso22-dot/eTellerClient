import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionWaitingForBefResponse } from '../../domain/transaction.models';
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
export class AttesaBenefondoComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  transactions = signal<GetTransactionWaitingForBefResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  statusDefaultValue = TransactionStatus.AttesaBEF;

  constructor(private reportFacade: ReportFacade) {}

  /**
   * Angular lifecycle hook - Initialize component
   */
  ngOnInit(): void {
    // Component initialized - filter will trigger search when ready
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

  /**
   * Handle search event from filter component
   */
  onSearch(filterData: any): void {
    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = filterData;

    this.getTransactionWaitingForBef(
      this.normalizeSearchValue(trxCassa),
      this.normalizeSearchDate(trxDataDal),
      this.normalizeSearchDate(trxDataAl),
      trxStatus ?? null,
      this.normalizeSearchValue(trxBraId)
    );
  }

  /**
   * Get transactions waiting for BEF
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxStatus - Status filter for transactions
   * @param trxBraId - Branch identifier
   */
  getTransactionWaitingForBef(
    trxCassa: string | null,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxStatus: number | null,
    trxBraId: string | null
  ): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.reportFacade.getTransactionWaitingForBef(
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero transazioni');
        this.isLoading.set(false);
      }
    });
  }
}
