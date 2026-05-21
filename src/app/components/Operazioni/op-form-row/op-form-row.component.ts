import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'op-form-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './op-form-row.component.html',
  styleUrls: ['./op-form-row.component.css'],
})
export class OpFormRowComponent {
  @Input({ required: true }) label: string = '';
  @Input() alignTop: boolean = false;
}
