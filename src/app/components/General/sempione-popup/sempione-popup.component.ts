import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxPopupModule } from 'devextreme-angular';

@Component({
  selector: 'app-sempione-popup',
  standalone: true,
  imports: [CommonModule, DxPopupModule],
  templateUrl: './sempione-popup.component.html',
  styleUrls: ['./sempione-popup.component.css'],
})
export class SempionePopupComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input({ required: true }) title: string = '';
  @Input() maxWidth: number = 500;
  @Input() maxHeight: string = '92vh';
  @Input() dragEnabled: boolean = true;
  @Input() showCloseButton: boolean = true;

  @Output() hidden = new EventEmitter<void>();

  onHidden(): void {
    this.visibleChange.emit(false);
    this.hidden.emit();
  }
}
