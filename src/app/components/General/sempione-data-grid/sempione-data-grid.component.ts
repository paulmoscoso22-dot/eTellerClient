import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { SempioneRowActionsComponent } from '../sempione-row-actions/sempione-row-actions.component';

export interface SempioneGridColumn {
  dataField: string;
  caption: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  allowSorting?: boolean;
  type?: 'text' | 'status' | 'bool' | 'segno';
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'datetime';
  format?: string;
  wrap?: boolean;
}

@Component({
  selector: 'app-sempione-data-grid',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, SempioneRowActionsComponent],
  templateUrl: './sempione-data-grid.component.html',
  styleUrls: ['./sempione-data-grid.component.css'],
})
export class SempioneDataGridComponent {
  @Input() dataSource: any[] = [];
  @Input() columns: SempioneGridColumn[] = [];
  @Input() keyExpr: string = '';
  @Input() pageSize: number = 30;
  @Input() allowedPageSizes: number[] = [20, 30, 50, 100];
  @Input() noDataText: string = 'Nessun risultato trovato.';
  @Input() showViewAction: boolean = false;
  @Input() showEditAction: boolean = true;
  @Input() showTraceAction: boolean = false;
  @Input() showDeleteAction: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;

  @Output() rowView = new EventEmitter<any>();
  @Output() rowEdit = new EventEmitter<any>();
  @Output() rowTrace = new EventEmitter<any>();
  @Output() rowDelete = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<any>();

  get hasWrapColumn(): boolean {
    return this.columns.some(c => c.wrap);
  }

  get actionsColumnWidth(): number {
    const count = [this.showViewAction, this.showEditAction, this.showTraceAction, this.showDeleteAction].filter(Boolean).length;
    if (count >= 3) return 90;
    if (count === 2) return 70;
    return 50;
  }
}
