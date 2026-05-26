import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxTextBoxModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneButtonComponent } from '../../../../../components/General';

@Component({
  selector: 'app-totale-cassa-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneButtonComponent,
  ],
  templateUrl: './totale-cassa-filter.component.html',
  styleUrls: ['./totale-cassa-filter.component.css']
})
export class TotaleCassaFilterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  @Input() isLoading = signal(false);

  @Output() searchClick = new EventEmitter<any>();

  searchForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    // ✅ Tutti i campi sono opzionali — nessun validatore obbligatorio
    this.searchForm = this.formBuilder.group({
      tocCliId: [''],
      tocData: [null],
      tocCutId: [''],
      tocBraId: ['']
    });
  }

  search(): void {
    // ✅ Non controllare se invalido — emetti sempre
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
