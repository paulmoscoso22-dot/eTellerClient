import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { ContiCorrenti } from '../../services/conti-correnti';
import { CustomerCriteriaRequest, CustomersResponse, CustomerAccountResponse } from '../../domain/conti-correnti-domain';

@Component({
  selector: 'app-ricerca-conto-table',
  imports: [DxDataGridModule],
  templateUrl: './ricerca-conto-table.html',
  styleUrl: './ricerca-conto-table.css',
})
export class RicercaContoTable implements OnInit {
  private readonly contiCorrentiService = inject(ContiCorrenti);
  customers = signal<CustomersResponse[]>([]);
  customerAccounts = signal<CustomerAccountResponse[]>([]);
  ngOnInit(): void {
    this.loadCustomers();
    this.loadCustomerAccounts();
  }

  loadCustomers(): void {
    this.contiCorrentiService.customers$.subscribe({
      next: (data) => {
        this.customers.set(data);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      },
    });
  }

  loadCustomerAccounts(): void {
    this.contiCorrentiService.customerAccounts$.subscribe({
      next: (data) => {
        this.customerAccounts.set(data);
      },
      error: (error) => {
        console.error('Error loading customer accounts:', error);
      },
    });
  }
}
