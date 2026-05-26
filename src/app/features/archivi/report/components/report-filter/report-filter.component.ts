import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxTextBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
} from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneButtonComponent } from '../../../../../components/General';

@Component({
  selector: 'app-report-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneButtonComponent,
  ],
  templateUrl: './report-filter.component.html',
  styleUrls: ['./report-filter.component.css']
})
export class ReportFilterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  @Input() isLoading = signal(false);
  @Input() showCassa: boolean = true;
  @Input() showBranch: boolean = true;
  @Input() showStatus: boolean = true;
  @Input() statusReadOnly: boolean = false;
  @Input() statusDefaultValue: number | null = null;

  private readonly statusLabels: Record<number, string> = {
    30: 'Non Trasmesso',
    50: 'Eseguito',
    70: 'Annullato',
    60: 'Attesa BEF',
  };

  get statusLabel(): string {
    if (this.statusDefaultValue === null) return '';
    return this.statusLabels[this.statusDefaultValue] ?? String(this.statusDefaultValue);
  }
  @Input() dataDalRequired: boolean = false;
  @Input() dataAlRequired: boolean = false;
  
  @Output() searchClick = new EventEmitter<any>();

  searchForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const dataDalValidators = this.dataDalRequired ? [Validators.required] : [];
    const dataAlValidators = this.dataAlRequired ? [Validators.required] : [];
    // ✅ MODIFICATO: Non forzare validazione su trxStatus se è read-only
    const statusValidators = this.statusDefaultValue !== null && !this.statusReadOnly ? [Validators.required, Validators.min(0)] : [];

    this.searchForm = this.formBuilder.group({
      trxCassa: [''],
      trxDataDal: [null, dataDalValidators],
      trxDataAl: [null, dataAlValidators],
      trxStatus: [this.statusDefaultValue, statusValidators],
      trxBraId: ['']
    });
  }

  search(): void {
    if (this.searchForm.invalid) {
      return;
    }

    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = this.searchForm.value;
    
    // Normalize dates: set trxDataDal to start of day (00:00:00) and trxDataAl to end of day (23:59:59)
    const normalizedDataDal = trxDataDal ? new Date(new Date(trxDataDal).setHours(0, 0, 0, 0)) : null;
    const normalizedDataAl = trxDataAl ? new Date(new Date(trxDataAl).setHours(23, 59, 59, 999)) : null;
    
    this.searchClick.emit({
      trxCassa,
      trxDataDal: normalizedDataDal,
      trxDataAl: normalizedDataAl,
      trxStatus,
      trxBraId
    });
  }

  onDateDalChanged(e: any): void {
    if (e.value) {
      const date = new Date(e.value);
      date.setHours(0, 0, 0, 0);
      this.searchForm.patchValue({ trxDataDal: date }, { emitEvent: false });
    }
  }

  onDateAlChanged(e: any): void {
    if (e.value) {
      const date = new Date(e.value);
      date.setHours(23, 59, 59, 999);
      this.searchForm.patchValue({ trxDataAl: date }, { emitEvent: false });
    }
  }

  reset(): void {
    this.searchForm.reset({
      trxCassa: '',
      trxDataDal: null,
      trxDataAl: null,
      trxStatus: this.statusDefaultValue,
      trxBraId: ''
    });
  }
}
