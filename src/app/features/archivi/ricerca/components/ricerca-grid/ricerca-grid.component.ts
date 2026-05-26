import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SempioneCardComponent, SempioneCardHeaderComponent, SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';

import { GiornaleAntiriciclaggioTransaction } from '../../../report/domain/transaction.models';

@Component({
  selector: 'app-ricerca-grid',
  standalone: true,
  imports: [
    CommonModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneDataGridComponent,
  ],
  templateUrl: './ricerca-grid.component.html',
  styleUrls: ['./ricerca-grid.component.css']
})
export class RicercaGridComponent {
  @Input() transactions = signal<GiornaleAntiriciclaggioTransaction[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'trxId',     caption: 'ID',              width: 80,  alignment: 'left' },
    { dataField: 'trxDatope', caption: 'Data Operazione', width: 120, alignment: 'center', dataType: 'datetime', format: 'dd.MM.yy' },
    { dataField: 'trxImpope', caption: 'Importo',         width: 120, alignment: 'right',  dataType: 'number',   format: '#,##0.00' },
    { dataField: 'trxDivope', caption: 'Divisa',          width: 70,  alignment: 'center' },
    { dataField: 'trxStatus', caption: 'Status',          width: 100, alignment: 'center' },
  ];
}
