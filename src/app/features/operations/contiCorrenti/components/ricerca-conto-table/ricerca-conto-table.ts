import { Component, inject, OnInit, signal } from '@angular/core';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';
import { ContiCorrenti } from '../../services/conti-correnti';
import { CustomerCriteriaRequest, CustomersResponse, CustomerAccountResponse } from '../../domain/conti-correnti-domain';

@Component({
  selector: 'app-ricerca-conto-table',
  imports: [SempioneDataGridComponent],
  templateUrl: './ricerca-conto-table.html',
  styleUrl: './ricerca-conto-table.css',
})
export class RicercaContoTable implements OnInit {
  private readonly contiCorrentiService = inject(ContiCorrenti);
  customers = signal<CustomersResponse[]>([]);
  customerAccounts = signal<CustomerAccountResponse[]>([]);

  readonly customerColumns: SempioneGridColumn[] = [
    { dataField: 'cusCliId',     caption: 'Client ID', width: 100 },
    { dataField: 'cusName',      caption: 'Name' },
    { dataField: 'cusDomicilio', caption: 'Address' },
    { dataField: 'cusNatura',    caption: 'Nature' },
  ];

  readonly accountColumns: SempioneGridColumn[] = [
    { dataField: 'accId',        caption: 'Account ID', width: 100 },
    { dataField: 'accDivisa',    caption: 'Currency' },
    { dataField: 'accNea',       caption: 'NEA' },
    { dataField: 'accCategoria', caption: 'Category' },
    { dataField: 'accRubrica',   caption: 'Description' },
    { dataField: 'accSaldo',     caption: 'Balance', dataType: 'number', alignment: 'right' },
  ];

  ngOnInit(): void {
    this.loadCustomers();
    this.loadCustomerAccounts();
  }

  loadCustomers(): void {
    this.contiCorrentiService.customers$.subscribe({
      next: (data) => this.customers.set(data),
      error: (error) => console.error('Error loading customers:', error),
    });
  }

  loadCustomerAccounts(): void {
    this.contiCorrentiService.customerAccounts$.subscribe({
      next: (data) => this.customerAccounts.set(data),
      error: (error) => console.error('Error loading customer accounts:', error),
    });
  }
}
