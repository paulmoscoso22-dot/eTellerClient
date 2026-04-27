import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxTextBoxModule,
  DxDateBoxModule,
  DxButtonModule
} from 'devextreme-angular';

/**
 * Reusable Totale Cassa Filter Component
 * Provides a standardized filter interface for totali cassa page
 */
@Component({
  selector: 'app-totale-cassa-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxButtonModule
  ],
  templateUrl: './totale-cassa-filter.component.html',
  styleUrls: ['./totale-cassa-filter.component.css']
})
export class TotaleCassaFilterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  @Input() isLoading = signal(false);
  @Input() cassaRequired: boolean = true;
  @Input() dataRequired: boolean = true;
  @Input() tipContoRequired: boolean = true;
  @Input() localitaRequired: boolean = true;

  @Output() searchClick = new EventEmitter<any>();

  searchForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the form with appropriate validators
   */
  private initializeForm(): void {
    const cassaValidators = this.cassaRequired ? [Validators.required] : [];
    const dataValidators = this.dataRequired ? [Validators.required] : [];
    const tipContoValidators = this.tipContoRequired ? [Validators.required] : [];
    const localitaValidators = this.localitaRequired ? [Validators.required] : [];

    this.searchForm = this.formBuilder.group({
      tocCliId: ['', cassaValidators],
      tocData: [null, dataValidators],
      tocCutId: ['', tipContoValidators],
      tocBraId: ['', localitaValidators]
    });
  }

  /**
   * Handle search button click
   */
  search(): void {
    if (this.searchForm.invalid) {
      return;
    }

    const { tocCliId, tocData, tocCutId, tocBraId } = this.searchForm.value;

    this.searchClick.emit({
      tocCliId,
      tocData,
      tocCutId,
      tocBraId
    });
  }

  reset(): void {
    this.searchForm.reset({
      tocCliId: '',
      tocData: null,
      tocCutId: '',
      tocBraId: ''
    });
  }
}
