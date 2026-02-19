import { Component, OnInit, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxDataGridModule, DxTextBoxModule, DxDateBoxModule, DxNumberBoxModule, DxButtonModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTransactionWithFiltersResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-giornale-cassa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxButtonModule
  ],
  templateUrl: './giornale-cassa.component.html',
  styleUrls: ['./giornale-cassa.component.css'],
})
export class GiornaleCassaComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;
  
  transactions = signal<GetTransactionWithFiltersResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchForm: FormGroup;

  constructor(
    private reportFacade: ReportFacade,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      trxCassa: ['', Validators.required],
      trxDataDal: [null, Validators.required],
      trxDataAl: [null, Validators.required],
      trxStatus: [null, [Validators.required, Validators.min(0)]],
      trxBraId: ['', Validators.required]
    });
  }

  /**
   * Angular lifecycle hook - Initialize component
   */
  ngOnInit(): void {
    this.search();
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

  search(): void {
    if (this.searchForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = this.searchForm.value;
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

    const data$: Observable<GetTransactionWithFiltersResponse[]> = this.reportFacade.getTransactionWithFilters(
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    );

    this.subscription = data$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.transactions.set(data as GetTransactionWithFiltersResponse[]);
        this.isLoading.set(false);
        console.log('Transazioni con filtri:', data, this.isLoading());
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero transazioni');
        this.isLoading.set(false);
        console.error('Errore nel recupero transazioni:', error);
      }
    });
  }
}
