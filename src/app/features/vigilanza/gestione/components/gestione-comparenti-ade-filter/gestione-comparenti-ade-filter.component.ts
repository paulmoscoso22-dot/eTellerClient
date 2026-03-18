import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { 
  DxTextBoxModule, 
  DxDateBoxModule, 
  DxButtonModule,
  DxCheckBoxModule
} from 'devextreme-angular';
import { ButtonRicercaComponent } from '../../../../../components/buttons/search/button-ricerca.component';

@Component({
  selector: 'app-gestione-comparenti-ade-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxButtonModule,
    DxCheckBoxModule,
    ButtonRicercaComponent
  ],
  templateUrl: './gestione-comparenti-ade-filter.component.html',
  styleUrls: ['./gestione-comparenti-ade-filter.component.scss'],
})
export class GestioneComparentiAdeFilterComponent {
  @Input() isLoading = false;
  @Output() searchEvent = new EventEmitter<any>();
  @Output() resetEvent = new EventEmitter<void>();

  searchForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      Nome1: [''],
      Nome2: [''],
      Nome3: [''],
      Nome4: [''],
      AraBirthdate: [null],
      AraRecComplete: [true],
      MinRecdate: [null],
      ShowExpiredRecords: [true]
    });
  }

  onSearch(): void {
    this.searchEvent.emit(this.searchForm.value);
  }

  onReset(): void {
    this.searchForm.reset();
    this.resetEvent.emit();
  }
}
