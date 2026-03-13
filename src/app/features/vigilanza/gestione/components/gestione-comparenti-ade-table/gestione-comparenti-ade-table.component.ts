import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { AppearerAllResponse } from '../../domain/gestione-comparenti-ade.models';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-gestione-comparenti-ade-table',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './gestione-comparenti-ade-table.component.html',
  styleUrls: ['./gestione-comparenti-ade-table.component.scss'],
})
export class GestioneComparentiAdeTableComponent {
  @Input() appearers: AppearerAllResponse[] = [];
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Input() searched = false;

  @Output() updateEvent = new EventEmitter<number>();
  @Output() deleteEvent = new EventEmitter<number>();

  showFilterRow = true;
  showHeaderFilter = true;
  currentFilter: any;

  onUpdateClick = (e: any): void => {
    if (e.row && e.row.data) {
      this.updateEvent.emit(e.row.data.araId);
    }
  };

  onDeleteClick = (e: any): void => {
    if (e.row && e.row.data) {
      const araId: number = e.row.data.araId;
      confirm('Sei sicuro di voler eliminare questo comparente?', 'Conferma eliminazione').then(
        (confirmed: boolean) => {
          if (confirmed) {
            this.deleteEvent.emit(araId);
          }
        }
      );
    }
  };
}
