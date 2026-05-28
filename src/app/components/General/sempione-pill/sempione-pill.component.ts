import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SempionePillColor = 'green' | 'red' | 'yellow' | 'blue' | 'neutral';
export type SempionePillSize  = 'sm' | 'md';

@Component({
  selector: 'app-sempione-pill',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="sempione-pill"
          [class]="'sempione-pill--' + color + ' sempione-pill--' + size">
      <ng-content></ng-content>
    </span>
  `,
  styleUrls: ['./sempione-pill.component.css'],
})
export class SempionePillComponent {
  @Input() color: SempionePillColor = 'neutral';
  @Input() size:  SempionePillSize  = 'sm';
}
