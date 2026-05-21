import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { OpCardSectionComponent } from '../op-card-section/op-card-section.component';
import { OpFormRowComponent } from '../op-form-row/op-form-row.component';
import { OpDisplayValueComponent } from '../op-display-value/op-display-value.component';

@Component({
  selector: 'op-descrizione-card',
  standalone: true,
  imports: [CommonModule, DxDateBoxModule, DxTextBoxModule, DxTextAreaModule, OpCardSectionComponent, OpFormRowComponent, OpDisplayValueComponent],
  templateUrl: './op-descrizione-card.component.html',
  styleUrls: ['./op-descrizione-card.component.css'],
})
export class OpDescrizioneCardComponent {
  @Input()  dataValuta: Date | null = null;
  @Input()  dataOperazione: Date | null = null;
  @Input()  nomeCognome: string = '';
  @Input()  testo: string = '';
  @Input()  commento: string = '';

  @Output() dataValutaChange   = new EventEmitter<Date | null>();
  @Output() nomeCognomeChange  = new EventEmitter<string>();
  @Output() testoChange        = new EventEmitter<string>();
  @Output() commentoChange     = new EventEmitter<string>();
}
