import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';
import { GetTransactionGiornaleCassaResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-giornale-cassa-grid',
  standalone: true,
  imports: [
    CommonModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneDataGridComponent,
  ],
  templateUrl: './giornale-cassa-grid.component.html',
  styleUrls: ['./giornale-cassa-grid.component.css']
})
export class GiornaleCassaGridComponent {
  @Input() transactions = signal<GetTransactionGiornaleCassaResponse[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'trxId',          caption: 'ID',              width: 80,  alignment: 'left' },
    { dataField: 'genere',         caption: 'Genere',          width: 90,  alignment: 'left' },
    { dataField: 'tipo',           caption: 'Tipo',            width: 90,  alignment: 'left' },
    { dataField: 'report',         caption: 'Report',          width: 100, alignment: 'left' },
    { dataField: 'nop',            caption: 'Nop',             width: 70,  alignment: 'center' },
    { dataField: 'trxDivope',      caption: 'Div. Ope.',       width: 70,  alignment: 'center' },
    { dataField: 'trxDivctp',      caption: 'Div. Ctp.',       width: 70,  alignment: 'center' },
    { dataField: 'trxImpope',      caption: 'Imp. Ope.',       width: 110, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'bigliettiBanca', caption: 'Biglietti Banca', width: 120, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'nonContanti',    caption: 'Non Contanti',    width: 120, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'contanti',       caption: 'Contanti',        width: 110, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'impCHF',         caption: 'Imp. CHF',        width: 110, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'stato',          caption: 'Stato',           width: 110, type: 'entity-status' },
  ];
}
