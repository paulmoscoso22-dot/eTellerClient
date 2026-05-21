import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { ApplyFilterMode } from 'devextreme/common/grids';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';

import { GetTransactionOperazioniAnnulateResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-operazioni-annullate-grid',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    HeaderCardComponent,
  ],
  templateUrl: './operazioni-annullate-grid.component.html',
  styleUrls: ['./operazioni-annullate-grid.component.css']
})
export class OperazioniAnnullateGridComponent {
  @Input() transactions = signal<GetTransactionOperazioniAnnulateResponse[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);
  showFilterRow = true;
  showHeaderFilter = true;
  currentFilter: ApplyFilterMode = 'auto';
}
