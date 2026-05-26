import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';

@Component({
  selector: 'app-table-roles',
  standalone: true,
  imports: [SempioneDataGridComponent],
  templateUrl: './table-roles.component.html',
  styleUrls: ['./table-roles.component.css']
})
export class TableRolesComponent {
  @Input() dataSource: any;
  @Input() pageSize = 3;
  @Output() selectionChanged = new EventEmitter<any>();
  @ViewChild(SempioneDataGridComponent) private grid?: SempioneDataGridComponent;

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'roleId',   caption: 'Role ID', width: 80, dataType: 'number', alignment: 'center' },
    { dataField: 'roleName', caption: 'Ruolo' },
  ];

  public clearSelection(): void {
    this.grid?.clearSelection();
  }
}
