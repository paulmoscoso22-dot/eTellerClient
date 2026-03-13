import { Component } from '@angular/core';
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
    DxPopupModule
  ],
  templateUrl: './prelievo.component.html',
  styleUrl: './prelievo.component.css',
})
export class PrelievoComponent {
  formData: any = {
    operazione: '123456',
    stampaSaldo: false,
    stampaAvviso: false,
    nomeCognome: '',
    testo: '',
    commentoInterno: '',
    forzaVigilanza: false
  };

  ricercaContoVisible = false;
  cambioVisible = false;
  appearerVisible = false;

  constructor() {}

  showRicercaConto() { this.ricercaContoVisible = true; }
  showCambio() { this.cambioVisible = true; }
  showAppearer() { this.appearerVisible = true; }
}

