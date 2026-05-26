import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SempioneCardComponent, SempioneCardHeaderComponent, SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';
import { GetTransactionWaitingForBefResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-attesa-benefondo-grid',
  standalone: true,
  imports: [
    CommonModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneDataGridComponent,
  ],
  templateUrl: './attesa-benefondo-grid.component.html',
  styleUrls: ['./attesa-benefondo-grid.component.css']
})
export class AttesaBenefondoGridComponent {
  @Input() transactions = signal<GetTransactionWaitingForBefResponse[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'trxId',      caption: 'ID',      width: 80,  alignment: 'left' },
    { dataField: 'trxAptId',   caption: 'APT ID',  width: 100, alignment: 'left' },
    { dataField: 'trxCassa',   caption: 'Cassa',   width: 90,  alignment: 'center' },
    { dataField: 'trxBraId',   caption: 'Filiale', width: 90,  alignment: 'left' },
    { dataField: 'trxUsrId',   caption: 'Utente',  width: 100, alignment: 'left' },
    { dataField: 'trxDatope',  caption: 'Data Op.', width: 110, alignment: 'center' },
    { dataField: 'trxDivope',  caption: 'Div.',    width: 70,  alignment: 'center' },
    { dataField: 'trxImpope',  caption: 'Importo', width: 120, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'trxText1',   caption: 'Testo',               alignment: 'left' },
    { dataField: 'trxStatus',  caption: 'Stato',   width: 110, type: 'entity-status' },
  ];
}
