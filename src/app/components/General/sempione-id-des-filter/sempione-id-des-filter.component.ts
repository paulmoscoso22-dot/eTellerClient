import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, ControlContainer, FormGroupDirective } from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular';

@Component({
  selector: 'app-sempione-id-des-filter',
  standalone: true,
  imports: [ReactiveFormsModule, DxTextBoxModule],
  templateUrl: './sempione-id-des-filter.component.html',
  styleUrls: ['./sempione-id-des-filter.component.css'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  host: { style: 'display: contents' },
})
export class SempioneIdDesFilterComponent {
  @Input() idControlName  = 'id';
  @Input() desControlName = 'des';
  @Input() idPlaceholder  = 'Codice...';
  @Input() desPlaceholder = 'Descrizione...';
  @Input() idSize: 'sm' | 'md' | 'lg' = 'sm';
  @Input() desSize: 'sm' | 'md' | 'lg' = 'lg';

  @Output() enterKey = new EventEmitter<void>();
}
