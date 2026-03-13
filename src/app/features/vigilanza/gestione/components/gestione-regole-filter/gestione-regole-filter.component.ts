import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { 
  DxTextBoxModule, 
  DxButtonModule
} from 'devextreme-angular';

@Component({
  selector: 'app-gestione-regole-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxButtonModule
  ],
  templateUrl: './gestione-regole-filter.component.html',
  styleUrl: './gestione-regole-filter.component.scss',
})
export class GestioneRegoleFilterComponent {
  @Input() isLoading = false;
  @Output() searchEvent = new EventEmitter<any>();
  @Output() resetEvent = new EventEmitter<void>();

  filterForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({
      arlOpTypeId: [''],
      arlCurTypeId: [''],
      arlAcctId: [''],
      arlAcctType: ['']
    });
  }

  onSearch(): void {
    this.searchEvent.emit(this.filterForm.value);
  }

  onReset(): void {
    this.filterForm.reset();
    this.resetEvent.emit();
  }
}
