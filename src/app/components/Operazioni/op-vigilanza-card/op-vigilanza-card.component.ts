import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { OpCardSectionComponent } from '../op-card-section/op-card-section.component';
import { OpFormRowComponent } from '../op-form-row/op-form-row.component';

@Component({
  selector: 'op-vigilanza-card',
  standalone: true,
  imports: [CommonModule, DxCheckBoxModule, DxButtonModule, OpCardSectionComponent, OpFormRowComponent],
  templateUrl: './op-vigilanza-card.component.html',
  styleUrls: ['./op-vigilanza-card.component.css'],
})
export class OpVigilanzaCardComponent {
  @Input()  forzaVigilanza: boolean = false;
  @Output() forzaVigilanzaChange = new EventEmitter<boolean>();
  @Output() showAml = new EventEmitter<void>();
}
