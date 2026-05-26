import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';

@Component({
  selector: 'app-table-funzioni',
  standalone: true,
  imports: [SempioneDataGridComponent],
  templateUrl: './table-funzioni.component.html',
  styleUrls: ['./table-funzioni.component.css']
})
export class TableFunzioniComponent {
  @Input() dataSource: any;
  @Input() pageSize = 15;
  @Output() selectionChanged = new EventEmitter<any>();
  @ViewChild(SempioneDataGridComponent) private grid?: SempioneDataGridComponent;

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'funId',   caption: 'Id',       width: 60 },
    { dataField: 'funName', caption: 'Function' },
    { dataField: 'funCode', caption: 'Code',     width: 120 },
  ];

  public clearSelection(): void {
    this.grid?.clearSelection();
  }
}
