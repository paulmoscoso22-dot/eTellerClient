import { Component, signal, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionWaitingForBefResponse } from '../../domain/transaction.models';
import { ReportSearchParams } from '../../domain/report-search.models';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { AttesaBenefondoGridComponent } from '../../components/attesa-benefondo-grid/attesa-benefondo-grid.component';
import { SempionePageShellComponent } from '../../../../../components/General/sempione-page-shell/sempione-page-shell.component';

@Component({
  selector: 'app-attesa-benefondo',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    AttesaBenefondoGridComponent,
    SempionePageShellComponent,
  ],
  templateUrl: './attesa-benefondo.component.html',
  styleUrls: ['./attesa-benefondo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttesaBenefondoComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reportFacade = inject(ReportFacade);

  transactions = signal<GetTransactionWaitingForBefResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  statusDefaultValue = TransactionStatus.AttesaBEF;

  onSearch(params: ReportSearchParams): void {
    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = params;

    this.isLoading.set(true);
    this.error.set(null);

    // Use tap to update signals when data arrives
    // takeUntilDestroyed handles cleanup on component destroy
    this.reportFacade.getTransactionWaitingForBef(
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    ).pipe(
      tap(data => {
        this.transactions.set(data);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set(error.message || 'Errore nel recupero transazioni');
        this.isLoading.set(false);
        throw error; // Re-throw to allow proper error handling
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
