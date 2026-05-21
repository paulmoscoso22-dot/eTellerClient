import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';

import { GetTransactionOperazioniAnnulateResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-operazioni-annullate-grid',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
  ],
  templateUrl: './operazioni-annullate-grid.component.html',
  styleUrls: ['./operazioni-annullate-grid.component.css']
})
export class OperazioniAnnullateGridComponent {
  @Input() transactions = signal<GetTransactionOperazioniAnnulateResponse[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);
}
