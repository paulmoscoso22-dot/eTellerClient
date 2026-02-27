import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { 
  DxTextBoxModule, 
  DxDateBoxModule, 
  DxNumberBoxModule, 
  DxButtonModule,
  DxCheckBoxModule,
  DxAutocompleteModule
} from 'devextreme-angular';

import { Currency } from '../../../../../core/domain/currency.domain';
import { Branch } from '../../../../../core/domain/branch.domain';
import { CurrencyType } from '../../../../../core/domain/currencyType.domain';
import { StOperationType } from '../../../../../core/domain/stOperationType.domain';

@Component({
  selector: 'app-ricerca-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxAutocompleteModule
  ],
  templateUrl: './ricerca-filter.component.html',
  styleUrls: ['./ricerca-filter.component.css']
})
export class RicercaFilterComponent {
  private formBuilder = inject(FormBuilder);

  @Input() currencies = signal<Currency[]>([]);
  @Input() branches = signal<Branch[]>([]);
  @Input() currencyTypes = signal<CurrencyType[]>([]);
  @Input() stOperationsTypes = signal<StOperationType[]>([]);
  @Input() isLoading = signal(false);

  @Output() searchClick = new EventEmitter<any>();

  searchForm: FormGroup;

  constructor() {
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

  search(): void {
    const formValue = this.searchForm.value;
    
    // Log raw form values
    console.log('Raw form values:', formValue);
    
    // Convert empty date and number inputs to null (keep text fields as empty strings)
    const trxDataDal = !formValue.trxDataDal || formValue.trxDataDal === '' ? null : formValue.trxDataDal;
    const trxDataAl = !formValue.trxDataAl || formValue.trxDataAl === '' ? null : formValue.trxDataAl;
    const trxImpopeDA = !formValue.trxImpopeDA || formValue.trxImpopeDA === '' ? null : formValue.trxImpopeDA;
    const trxImpopeA = !formValue.trxImpopeA || formValue.trxImpopeA === '' ? null : formValue.trxImpopeA;
    
    // Ensure string fields are empty strings if null or undefined
    const trxCassa = formValue.trxCassa === null || formValue.trxCassa === undefined ? '' : formValue.trxCassa;
    const trxLocalita = formValue.trxLocalita === null || formValue.trxLocalita === undefined ? '' : formValue.trxLocalita;
    const trxCutId = formValue.trxCutId === null || formValue.trxCutId === undefined ? '' : formValue.trxCutId;
    const trxOptId = formValue.trxOptId === null || formValue.trxOptId === undefined ? '' : formValue.trxOptId;
    const trxDivope = formValue.trxDivope === null || formValue.trxDivope === undefined ? '' : formValue.trxDivope;
    const arcAppName = formValue.arcAppName === null || formValue.arcAppName === undefined ? '' : formValue.arcAppName;

    // Log all request properties
    const requestParams = {
      trxCassa: trxCassa,
      trxLocalita: trxLocalita,
      trxDataDal : trxDataDal,
      trxDataAl : trxDataAl,
      trxReverse: formValue.trxReverse,
      trxCutId: trxCutId,
      trxOptId: trxOptId,
      trxDivope: trxDivope,
      trxImpopeDA: trxImpopeDA,
      trxImpopeA: trxImpopeA,
      arcAppName: arcAppName,
      arcForced: formValue.arcForced
    };
    
    console.log('Search Request Parameters (Emitted):', requestParams);
    this.searchClick.emit(requestParams);
  }

  /**
   * Handle date from change - set time to start of day (00:00:00)
   */
  onDateDalChanged(e: any): void {
    if (e.value) {
      const date = new Date(e.value);
      date.setHours(0, 0, 0, 0);
      this.searchForm.patchValue({ trxDataDal: date }, { emitEvent: false });
    }
  }

  /**
   * Handle date to change - set time to end of day (23:59:59)
   */
  onDateAlChanged(e: any): void {
    if (e.value) {
      const date = new Date(e.value);
      date.setHours(23, 59, 59, 999);
      this.searchForm.patchValue({ trxDataAl: date }, { emitEvent: false });
    }
  }
}
