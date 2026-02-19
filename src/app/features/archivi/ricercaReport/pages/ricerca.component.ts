import { Component, OnInit, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { 
  DxDataGridModule, 
  DxTextBoxModule, 
  DxDateBoxModule, 
  DxNumberBoxModule, 
  DxButtonModule,
  DxCheckBoxModule,
  DxAutocompleteModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { RicercaFacade } from '../services/ricerca.facade';
import { Service } from '../../../../core/services/service';
import { Currency } from '../../../../core/domain/currency.domain';
import { Branch } from '../../../../core/domain/branch.domain';
import { CurrencyType } from '../../../../core/domain/currencyType.domain';
import { StOperationType } from '../../../../core/domain/stOperationType.domain';
import { 
  GiornaleAntiriciclaggioTransaction,
  GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse
} from '../../report/domain/transaction.models';

@Component({
  selector: 'app-ricerca',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxAutocompleteModule
  ],
  templateUrl: './ricerca.component.html',
  styleUrls: ['./ricerca.component.css'],
})
export class RicercaComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;
  
  transactions = signal<GiornaleAntiriciclaggioTransaction[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  currencies = signal<Currency[]>([]);
  branches = signal<Branch[]>([]);
  currencyTypes = signal<CurrencyType[]>([]);
  stOperationsTypes = signal<StOperationType[]>([]);
  searchForm: FormGroup;

  constructor(
    private ricercaFacade: RicercaFacade,
    private formBuilder: FormBuilder,
    private service: Service
  ) {
    this.searchForm = this.formBuilder.group({
      trxCassa: [''],
      trxLocalita: [''],
      trxDataDal: [null],
      trxDataAl: [null],
      trxReverse: [false],
      trxCutId: [''],
      trxOptId: [''],
      trxDivope: [''],
      trxImpopeDA: [null],
      trxImpopeA: [null],
      arcAppName: [''],
      arcForced: [false]
    });
  }

  /**
   * Angular lifecycle hook - Initialize component
   */
  ngOnInit(): void {
    this.service.getAllCurrency().subscribe({
      next: (data) => this.currencies.set(data),
      error: (err) => console.error('Error loading currencies:', err)
    });

    this.service.getBranches().subscribe({
      next: (data) => this.branches.set(data),
      error: (err) => console.error('Error loading branches:', err)
    });

    this.service.getCurrencyTypes().subscribe({
      next: (data) => this.currencyTypes.set(data),
      error: (err) => console.error('Error loading currency types:', err)
    });

    this.service.getStOperationsType().subscribe({
      next: (data) => this.stOperationsTypes.set(data),
      error: (err) => console.error('Error loading operation types:', err)
    });
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
    const formValue = this.searchForm.value;
    
    this.getTransactionWithFiltersForGiornaleAntiriciclaggio(
      formValue.trxCassa,
      formValue.trxLocalita,
      formValue.trxDataDal,
      formValue.trxDataAl,
      formValue.trxReverse,
      formValue.trxCutId,
      formValue.trxOptId,
      formValue.trxDivope,
      formValue.trxImpopeDA,
      formValue.trxImpopeA,
      formValue.arcAppName,
      formValue.arcForced
    );
  }

  /**
   * Get transactions with filters for "Giornale Antiriciclaggio"
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxLocalita - Transaction location
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxReverse - Reverse transaction flag
   * @param trxCutId - Customer ID
   * @param trxOptId - Operator ID
   * @param trxDivope - Operation division
   * @param trxImpopeDA - Amount from
   * @param trxImpopeA - Amount to
   * @param arcAppName - Application name
   * @param arcForced - Forced flag
   */
  getTransactionWithFiltersForGiornaleAntiriciclaggio(
    trxCassa: string,
    trxLocalita: string,
    trxDataDal: Date,
    trxDataAl: Date,
    trxReverse: boolean,
    trxCutId: string,
    trxOptId: string,
    trxDivope: string,
    trxImpopeDA: number,
    trxImpopeA: number,
    arcAppName: string,
    arcForced: boolean
  ): void {
    this.destroy(); // Clean up previous subscription
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription = this.ricercaFacade.getTransactionWithFiltersForGiornaleAntiriciclaggio(
      trxCassa,
      trxLocalita,
      trxDataDal,
      trxDataAl,
      trxReverse,
      trxCutId,
      trxOptId,
      trxDivope,
      trxImpopeDA,
      trxImpopeA,
      arcAppName,
      arcForced
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.transactions.set(data as GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse[]);
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
