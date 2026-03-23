import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-table-user-role',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './table-user-role.component.html',
  styleUrls: ['./table-user-role.component.css']
})
export class TableUserRoleComponent {
  @Input() dataSource: any;
  @Input() pageSize = 9;
  @Output() selectionChanged = new EventEmitter<any>();
}
