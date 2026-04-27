import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { ApplyFilterMode } from 'devextreme/common/grids';

import { GiornaleAntiriciclaggioTransaction } from '../../../report/domain/transaction.models';

@Component({
  selector: 'app-ricerca-grid',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
  ],
  templateUrl: './ricerca-grid.component.html',
  styleUrls: ['./ricerca-grid.component.css']
})
export class RicercaGridComponent {
  @Input() transactions = signal<GiornaleAntiriciclaggioTransaction[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);
  showFilterRow = true;
  showHeaderFilter = true;
  currentFilter: ApplyFilterMode = 'auto';
}