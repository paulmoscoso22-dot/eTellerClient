import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  DxTextBoxModule, 
  DxDateBoxModule, 
  DxNumberBoxModule, 
  DxButtonModule
} from 'devextreme-angular';

/**
 * Reusable Report Filter Component
 * Provides a standardized filter interface for report pages
 */
@Component({
  selector: 'app-report-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxButtonModule
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
  @Input() dataDalRequired: boolean = false;
  @Input() dataAlRequired: boolean = false;
  
  @Output() searchClick = new EventEmitter<any>();

  searchForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the form with appropriate validators
   */
  private initializeForm(): void {
    const dataDalValidators = this.dataDalRequired ? [Validators.required] : [];
    const dataAlValidators = this.dataAlRequired ? [Validators.required] : [];
    const statusValidators = this.statusDefaultValue !== null ? [Validators.required, Validators.min(0)] : [];

    this.searchForm = this.formBuilder.group({
      trxCassa: [''],
      trxDataDal: [null, dataDalValidators],
      trxDataAl: [null, dataAlValidators],
      trxStatus: [this.statusDefaultValue, statusValidators],
      trxBraId: ['']
    });
  }

  /**
   * Handle search button click
   */
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
