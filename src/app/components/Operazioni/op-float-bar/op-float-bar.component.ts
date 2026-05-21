import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDropDownButtonModule } from 'devextreme-angular/ui/drop-down-button';

@Component({
  selector: 'op-float-bar',
  standalone: true,
  imports: [CommonModule, DxButtonModule, DxDropDownButtonModule],
  templateUrl: './op-float-bar.component.html',
  styleUrls: ['./op-float-bar.component.css'],
})
export class OpFloatBarComponent {
  @Input() showIndietro: boolean = true;
  @Input() showAnnulla: boolean = true;
  @Input() showModifica: boolean = true;
  @Input() showAltreAzioni: boolean = true;
  @Input() altreAzioniItems: any[] = [];
  @Input() confirmLabel: string = 'Conferma';
  @Input() confirmDisabled: boolean = false;

  @Output() indietro      = new EventEmitter<void>();
  @Output() annulla       = new EventEmitter<void>();
  @Output() modifica      = new EventEmitter<void>();
  @Output() altreAzioniClick = new EventEmitter<any>();
  @Output() conferma      = new EventEmitter<void>();
}
