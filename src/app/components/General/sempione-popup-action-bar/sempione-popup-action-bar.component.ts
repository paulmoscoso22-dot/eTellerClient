import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular';
import { SempioneButtonComponent } from '../sempione-button/sempione-button.component';

@Component({
  selector: 'app-sempione-popup-action-bar',
  standalone: true,
  imports: [CommonModule, DxButtonModule, SempioneButtonComponent],
  templateUrl: './sempione-popup-action-bar.component.html',
  styleUrls: ['./sempione-popup-action-bar.component.css'],
})
export class SempionePopupActionBarComponent {
  @Input() saveText: string = 'Salva';
  @Input() cancelText: string = 'Annulla';
  @Input() isSaving: boolean = false;
  @Input() showSave: boolean = true;
  @Input() showStorico: boolean = false;
  @Input() saveIcon: string = 'save';

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() storico = new EventEmitter<void>();
}
