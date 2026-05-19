import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SempioneButtonComponent } from '../sempione-button/sempione-button.component';

@Component({
  selector: 'app-sempione-crud-toolbar-actions',
  standalone: true,
  imports: [SempioneButtonComponent],
  templateUrl: './sempione-crud-toolbar-actions.component.html',
  styleUrls: ['./sempione-crud-toolbar-actions.component.css'],
  host: { 'toolbar-actions': '' },
})
export class SempioneCrudToolbarActionsComponent {
  @Input() showSearch = true;
  @Input() showReset  = true;
  @Input() showAll    = false;
  @Input() newText    = 'Nuovo';
  @Input() isLoading  = false;

  @Output() search  = new EventEmitter<void>();
  @Output() reset   = new EventEmitter<void>();
  @Output() listAll = new EventEmitter<void>();
  @Output() add     = new EventEmitter<void>();
}
