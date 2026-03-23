import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-table-funzioni',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './table-funzioni.component.html',
  styleUrls: ['./table-funzioni.component.css']
})
export class TableFunzioniComponent {
  @Input() dataSource: any;
  @Input() pageSize = 15;
  @Output() selectionChanged = new EventEmitter<any>();
}
