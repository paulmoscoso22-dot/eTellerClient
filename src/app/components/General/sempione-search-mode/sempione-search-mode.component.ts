import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SempioneToolbarComponent } from '../sempione-toolbar/sempione-toolbar.component';
import { SempioneCrudToolbarActionsComponent } from '../sempione-crud-toolbar-actions/sempione-crud-toolbar-actions.component';

/**
 * Host per la zona di ricerca della toolbar.
 *
 * mode="toolbar" — mostra i campi proiettati (ng-content) + bottone Cerca
 * mode="header"  — nasconde i campi; la ricerca avviene via header filter della griglia
 *
 * Le due modalità non sono mai visibili contemporaneamente.
 */
@Component({
  selector: 'app-sempione-search-mode',
  standalone: true,
  imports: [SempioneToolbarComponent, SempioneCrudToolbarActionsComponent],
  templateUrl: './sempione-search-mode.component.html',
})
export class SempioneSearchModeComponent {
  @Input() mode: 'toolbar' | 'header' = 'toolbar';
  @Input() isLoading = false;
  @Input() showAdd   = true;
  @Input() showReset = true;
  @Input() newText   = 'Nuovo';

  @Output() search = new EventEmitter<void>();
  @Output() reset  = new EventEmitter<void>();
  @Output() add    = new EventEmitter<void>();
}
