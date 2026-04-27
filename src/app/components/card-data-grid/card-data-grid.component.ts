import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';

export interface GridColumnDef {
  dataField: string;
  caption: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  allowSorting?: boolean;
  type?: 'text' | 'status';
}

@Component({
  selector: 'app-card-data-grid',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './card-data-grid.component.html',
  styleUrls: ['./card-data-grid.component.css']
})
export class CardDataGridComponent {
  @Input({ required: true }) dataSource: any[] = [];
  @Input({ required: true }) keyExpr: string = '';
  @Input({ required: true }) columns: GridColumnDef[] = [];
  @Input() pageSize: number = 8;
  @Input() paginationEnabled: boolean = true;
  @Input() showEditAction: boolean = true;
  @Input() showTraceAction: boolean = true;

  @Output() selectionChanged = new EventEmitter<{ selectedRowsData: any[] }>();
  @Output() rowEdit = new EventEmitter<any>();
  @Output() rowTrace = new EventEmitter<any>();
}
