import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { ISysUsersActiveAndBlockedResponse } from '../../models/utenti.models';

@Component({
  selector: 'app-table-utenti',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './table-utenti.component.html',
  styleUrls: ['./table-utenti.component.css']
})
export class TableUtentiComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  @Input() users$: Observable<ISysUsersActiveAndBlockedResponse[]> | null = null;
  @Output() userSelected = new EventEmitter<any>();

  onSelectionChanged(e: any): void {
    this.userSelected.emit(e);
  }

  clearSelection(): void {
    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.clearSelection();
    }
  }
}
