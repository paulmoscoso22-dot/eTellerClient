import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SempioneCardComponent, SempioneCardHeaderComponent, SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';
import { GetTransactionOperazioniAnnulateResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-operazioni-annullate-grid',
  standalone: true,
  imports: [
    CommonModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneDataGridComponent,
  ],
  templateUrl: './operazioni-annullate-grid.component.html',
  styleUrls: ['./operazioni-annullate-grid.component.css']
})
export class OperazioniAnnullateGridComponent {
  @Input() transactions = signal<GetTransactionOperazioniAnnulateResponse[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'trxId',     caption: 'ID',          width: 80,  alignment: 'left' },
    { dataField: 'genere',    caption: 'Genere',       width: 90,  alignment: 'left' },
    { dataField: 'tipo',      caption: 'Tipo',         width: 90,  alignment: 'left' },
    { dataField: 'report',    caption: 'Report',       width: 100, alignment: 'left' },
    { dataField: 'trxCassa',  caption: 'Cassa',        width: 90,  alignment: 'center' },
    { dataField: 'trxUsrId',  caption: 'Utente',       width: 100, alignment: 'left' },
    { dataField: 'hostTrace', caption: 'Host Trace',   width: 130, alignment: 'left' },
    { dataField: 'trxText1',  caption: 'Testo',                    alignment: 'left' },
    { dataField: 'stato',     caption: 'Stato',        width: 110, type: 'entity-status' },
  ];
}
