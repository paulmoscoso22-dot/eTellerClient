import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';

import { GetTransactionGiornaleCassaResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-giornale-cassa-grid',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
  ],
  templateUrl: './giornale-cassa-grid.component.html',
  styleUrls: ['./giornale-cassa-grid.component.css']
})
export class GiornaleCassaGridComponent {
  @Input() transactions = signal<GetTransactionGiornaleCassaResponse[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);
}
