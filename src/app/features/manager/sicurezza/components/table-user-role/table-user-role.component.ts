import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';

@Component({
  selector: 'app-table-user-role',
  standalone: true,
  imports: [SempioneDataGridComponent],
  templateUrl: './table-user-role.component.html',
  styleUrls: ['./table-user-role.component.css']
})
export class TableUserRoleComponent {
  @Input() dataSource: any;
  @Input() pageSize = 9;
  @Output() selectionChanged = new EventEmitter<any>();
  @ViewChild(SempioneDataGridComponent) private grid?: SempioneDataGridComponent;

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'usrExtref', caption: 'Utente' },
    { dataField: 'usrId',     caption: 'ID', width: 70, alignment: 'center' },
  ];

  public clearSelection(): void {
    this.grid?.clearSelection();
  }
}
