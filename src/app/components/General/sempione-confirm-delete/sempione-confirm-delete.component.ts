import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DxPopupModule } from 'devextreme-angular';
import { SempioneButtonComponent } from '../sempione-button/sempione-button.component';

@Component({
  selector: 'app-sempione-confirm-delete',
  standalone: true,
  imports: [DxPopupModule, SempioneButtonComponent],
  templateUrl: './sempione-confirm-delete.component.html',
  styleUrls: ['./sempione-confirm-delete.component.css'],
})
export class SempioneConfirmDeleteComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() entityLabel = 'elemento';
  @Input() entityName: string | number | null | undefined = null;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.confirmed.emit();
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancelled.emit();
  }
}
