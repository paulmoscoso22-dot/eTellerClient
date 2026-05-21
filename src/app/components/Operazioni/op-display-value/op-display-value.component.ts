import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'op-display-value',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './op-display-value.component.html',
  styleUrls: ['./op-display-value.component.css'],
})
export class OpDisplayValueComponent {
  @Input() accent: boolean = false;
  @Input() resto: boolean = false;
}
