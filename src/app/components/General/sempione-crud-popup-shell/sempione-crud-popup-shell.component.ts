import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SempionePopupComponent } from '../sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../sempione-popup-action-bar/sempione-popup-action-bar.component';

@Component({
  selector: 'app-sempione-crud-popup-shell',
  standalone: true,
  imports: [CommonModule, SempionePopupComponent, SempionePopupActionBarComponent],
  templateUrl: './sempione-crud-popup-shell.component.html',
  styleUrls: ['./sempione-crud-popup-shell.component.css'],
})
export class SempioneCrudPopupShellComponent {
  @Input({ required: true }) title: string = '';
  @Input() visible: boolean = false;
  @Input() maxWidth: number = 520;
  @Input() dragEnabled: boolean = true;
  @Input() mode: 'new' | 'edit' | 'view' = 'view';
  @Input() isSaving: boolean = false;
  @Input() showSave: boolean = true;
  @Input() showStorico: boolean = false;
  @Input() saveText: string = 'Salva';
  @Input() cancelText: string = 'Annulla';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() storico = new EventEmitter<void>();

  get computedShowSave(): boolean {
    return this.showSave && this.mode !== 'view';
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  onHidden(): void {
    this.visibleChange.emit(false);
  }
}
