import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sempione-field-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sempione-field-group.component.html',
  styleUrls: ['./sempione-field-group.component.css'],
})
export class SempioneFieldGroupComponent {
  @Input({ required: true }) label: string = '';
  @Input() required: boolean = false;
  /** Applies the locked read-only style (key fields in edit mode) */
  @Input() locked: boolean = false;
  /** Renders label and content on the same row (for checkboxes/toggles) */
  @Input() inline: boolean = false;
}
