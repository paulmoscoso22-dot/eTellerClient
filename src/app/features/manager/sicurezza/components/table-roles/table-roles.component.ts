import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-table-roles',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './table-roles.component.html',
  styleUrls: ['./table-roles.component.css']
})
export class TableRolesComponent {
  @Input() dataSource: any;
  @Input() pageSize = 3;
  @Output() selectionChanged = new EventEmitter<any>();
}
