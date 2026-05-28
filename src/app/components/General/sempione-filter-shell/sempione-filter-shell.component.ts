import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SempioneCardComponent } from '../sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../sempione-card-header/sempione-card-header.component';
import { SempioneButtonComponent } from '../sempione-button/sempione-button.component';

@Component({
  selector: 'app-sempione-filter-shell',
  standalone: true,
  imports: [CommonModule, SempioneCardComponent, SempioneCardHeaderComponent, SempioneButtonComponent],
  templateUrl: './sempione-filter-shell.component.html',
  styleUrls: ['./sempione-filter-shell.component.css'],
})
export class SempioneFilterShellComponent {
  @Input({ required: true }) title: string = '';
  @Input() isLoading: boolean = false;
  @Input() resetText: string = 'Ripristina filtri';
  @Input() searchText: string = 'Cerca';

  @Output() searched = new EventEmitter<void>();
  @Output() resetted = new EventEmitter<void>();
}
