import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular';
import { ButtonStyle } from 'devextreme/common';

export type SempioneButtonVariant = 'primary' | 'secondary' | 'gold' | 'danger' | 'danger-filled';

@Component({
  selector: 'app-sempione-button',
  standalone: true,
  imports: [CommonModule, DxButtonModule],
  templateUrl: './sempione-button.component.html',
  styleUrls: ['./sempione-button.component.css'],
})
export class SempioneButtonComponent {
  @Input() variant: SempioneButtonVariant = 'secondary';
  @Input() text: string = '';
  @Input() icon: string = '';
  @Input() hint: string = '';
  @Input() disabled: boolean = false;
  /** Adds box-shadow elevation — recommended for the primary CTA in toolbars */
  @Input() shadow: boolean = false;

  @Output() clicked = new EventEmitter<any>();

  get cssClass(): string {
    const base = `btn-fin-${this.variant}`;
    return this.shadow ? `${base} btn-fin-shadow` : base;
  }

  get stylingMode(): ButtonStyle {
    return (this.variant === 'primary' || this.variant === 'danger' || this.variant === 'danger-filled') ? 'contained' : 'outlined';
  }
}
