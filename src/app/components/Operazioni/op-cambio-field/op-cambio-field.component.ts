import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';

@Component({
  selector: 'op-cambio-field',
  standalone: true,
  imports: [CommonModule, DxNumberBoxModule, DxButtonModule],
  templateUrl: './op-cambio-field.component.html',
  styleUrls: ['./op-cambio-field.component.css'],
})
export class OpCambioFieldComponent {
  @Input() label: string = 'Cambio / sistema';
  @Input()  cambio: number | null = null;
  @Input()  cambioSys: number | null = null;

  @Output() cambioChange   = new EventEmitter<number | null>();
  @Output() pannelloClick  = new EventEmitter<void>();
}
