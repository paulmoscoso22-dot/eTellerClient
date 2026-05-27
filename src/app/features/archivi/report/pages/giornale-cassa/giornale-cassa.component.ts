import { Component, signal, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionGiornaleCassaResponse } from '../../domain/transaction.models';
import { ReportSearchParams } from '../../domain/report-search.models';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { GiornaleCassaGridComponent } from '../../components/giornale-cassa-grid/giornale-cassa-grid.component';
import { SempionePageShellComponent } from '../../../../../components/General/sempione-page-shell/sempione-page-shell.component';

@Component({
  selector: 'app-giornale-cassa',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    GiornaleCassaGridComponent,
    SempionePageShellComponent,
  ],
  templateUrl: './giornale-cassa.component.html',
  styleUrls: ['./giornale-cassa.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GiornaleCassaComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reportFacade = inject(ReportFacade);

  transactions = signal<GetTransactionGiornaleCassaResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  statusDefaultValue = TransactionStatus.Eseguito;

  onSearch(filterData: ReportSearchParams): void {
    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = filterData;

    // ✅ Dates are optional, no error if empty (interface allows null values)
    this.getTransactionWithFilters(trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId);
  }

  getTransactionWithFilters(
    trxCassa: string | null,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxStatus: number | null,
    trxBraId: string | null
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
      tap(data => {
        this.transactions.set(data as GetTransactionGiornaleCassaResponse[]);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set(error.message || 'Errore nel recupero transazioni');
        this.isLoading.set(false);
        throw error;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
