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
import { RicercaOperazioniFacade } from '../services/ricerca-operazioni.facade';
import { Service } from '../../../../core/services/service';
import { Currency } from '../../../../core/domain/currency.domain';
import { Branch } from '../../../../core/domain/branch.domain';
import { CurrencyType } from '../../../../core/domain/currencyType.domain';
import { StOperationType } from '../../../../core/domain/stOperationType.domain';
import { RicercaOperazioniResponse } from '../domain/ricerca-operazioni.models';

@Component({
  selector: 'app-ricerca-operazioni',
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
  templateUrl: './ricerca-operazioni.component.html',
  styleUrls: ['./ricerca-operazioni.component.css'],
})
export class RicercaOperazioniComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;
  
  operations = signal<RicercaOperazioniResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  currencies = signal<Currency[]>([]);
  branches = signal<Branch[]>([]);
  currencyTypes = signal<CurrencyType[]>([]);
  stOperationsTypes = signal<StOperationType[]>([]);
  searchForm: FormGroup;

  constructor(
    private ricercaOperazioniFacade: RicercaOperazioniFacade,
    private formBuilder: FormBuilder,
    private service: Service
  ) {
    this.searchForm = this.formBuilder.group({
      trxCassa: [''],
      trxLocalita: [''],
      trxDataDal: [null],
      trxDataAl: [null],
      trxReverse: [null],
      trxCutId: [''],
      trxOptId: [''],
      trxDivope: [''],
      trxImpopeDA: [null],
      trxImpopeA: [null],
      arcAppName: [''],
      arcForced: [null]
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

  /**
   * Execute search with current form values
   */
  search(): void {
    const formValue = this.searchForm.value;
    
    this.searchOperazioni(
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
   * Search operations with filters
   * 
   * @param trxCassa - Cash register ID
   * @param trxLocalita - Branch/Location ID
   * @param trxDataDal - Start date
   * @param trxDataAl - End date
   * @param trxReverse - Show only reversed transactions
   * @param trxCutId - Currency type ID
   * @param trxOptId - Operation type ID
   * @param trxDivope - Currency ID
   * @param trxImpopeDA - Minimum amount
   * @param trxImpopeA - Maximum amount
   * @param arcAppName - Appearer name
   * @param arcForced - Show only forced surveillance transactions
   */
  searchOperazioni(
    trxCassa: string,
    trxLocalita: string,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxReverse: boolean | null,
    trxCutId: string,
    trxOptId: string,
    trxDivope: string,
    trxImpopeDA: number | null,
    trxImpopeA: number | null,
    arcAppName: string,
    arcForced: boolean | null
  ): void {
    this.destroy(); // Clean up previous subscription
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription = this.ricercaOperazioniFacade.searchOperazioni(
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
        this.operations.set(data);
        this.isLoading.set(false);
        console.log('Operations found:', data);
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero delle operazioni');
        this.isLoading.set(false);
        console.error('Error searching operations:', error);
      }
    });
  }
}
