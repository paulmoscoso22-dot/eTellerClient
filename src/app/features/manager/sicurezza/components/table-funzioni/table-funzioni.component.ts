import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';

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
  @ViewChild(DxDataGridComponent) private grid?: DxDataGridComponent;

  public clearSelection(): void {
    try {
      this.grid?.instance?.clearSelection();
    } catch (e) {
      // ignore if grid not available yet
    }
  }
}
