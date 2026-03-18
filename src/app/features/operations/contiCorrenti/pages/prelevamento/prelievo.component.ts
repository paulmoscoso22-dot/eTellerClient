import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  DxFormModule, 
  DxButtonModule, 
  DxTextBoxModule, 
  DxNumberBoxModule, 
  DxSelectBoxModule, 
  DxCheckBoxModule, 
  DxDateBoxModule, 
  DxTextAreaModule,
  DxPopupModule
} from 'devextreme-angular';
import { ContiCorrenti } from '../../services/conti-correnti';
import { CustomerCriteriaRequest, GetCustomerAccountsRequest } from '../../domain/conti-correnti-domain';
import { RicercaContoTable } from '../../components/ricerca-conto-table/ricerca-conto-table';

@Component({
  selector: 'app-prelievo',
  standalone: true,
  imports: [
    CommonModule,
    DxFormModule,
    DxButtonModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxTextAreaModule,
    DxPopupModule,
    RicercaContoTable
  ],
  templateUrl: './prelievo.component.html',
  styleUrl: './prelievo.component.css',
})
export class PrelievoComponent {
  private readonly contiCorrentiService = inject(ContiCorrenti);

  formData: any = {
    operazione: '123456',
    stampaSaldo: false,
    stampaAvviso: false,
    nomeCognome: '',
    testo: '',
    commentoInterno: '',
    forzaVigilanza: false
  };

  ricercaContoVisible = signal(false);
  cambioVisible = signal(false);
  appearerVisible = signal(false);

  constructor() {}

  showRicercaConto(numeroConto: string) { 
    this.loadCustomerByCriteria(numeroConto);
    this.loadCustomerAccounts(numeroConto);
  }

  private loadCustomerByCriteria(numeroConto: string): void {
    const request: CustomerCriteriaRequest = {
      cliId: numeroConto,
      descrizione: ''
    };
    this.contiCorrentiService.getCustomerByCriteria(request).subscribe({
      next: () => {
        this.ricercaContoVisible.set(true);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  private loadCustomerAccounts(numeroConto: string): void {
    const accountRequest: GetCustomerAccountsRequest = {
      CliId: numeroConto
    };
    this.contiCorrentiService.getCustomerAccountsByCliId(accountRequest).subscribe({
      next: () => {
        console.log('Customer accounts loaded successfully');
      },
      error: (error) => {
        console.error('Error loading customer accounts:', error);
      }
    });
  }
  showCambio() { this.cambioVisible.set(true); }
  showAppearer() { this.appearerVisible.set(true); }
}

