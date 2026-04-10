import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
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
  @Input() users$: Observable<ISysUsersActiveAndBlockedResponse[]> | null = null;
  @Output() userSelected = new EventEmitter<any>();

  onSelectionChanged(e: any): void {
    this.userSelected.emit(e);
  }
}
