import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxTextAreaModule
} from 'devextreme-angular';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';

export type BigliettiBancaMode = 'acquisto' | 'vendita';

@Component({
  selector: 'app-biglietti-banca-form',
  standalone: true,
  imports: [
    CommonModule,
    DxButtonModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxTextAreaModule,
    HeaderCardComponent
  ],
  templateUrl: './biglietti-banca-form.component.html',
  styleUrls: ['./biglietti-banca-form.component.css']
})
export class BigliettiBancaFormComponent {
  @Input({ required: true }) mode: BigliettiBancaMode = 'acquisto';

  operazioneNr = signal<string | null>(null);

  currencies: string[] = ['CHF', 'EUR', 'USD', 'GBP', 'JPY', 'DKK', 'NOK', 'SEK', 'CAD', 'AUD'];

  formData: any = {
    trxDivope: null,
    trxDivctp: 'CHF',
    trxImpope: null,
    trxImpctp: null,
    trxExcrat: null,
    trxExrctpbas: null,
    trxImpctv: null,
    trxCtpctv: null,
    trxImprestoctv: null,
    trxDatval: new Date(),
    cbForceChange: false,
    cbArrotondaImporti: false,
    cbUseSpreadDip: false,
    note: ''
  };

  get pageTitle(): string {
    return this.mode === 'acquisto' ? 'Acquisto Biglietti Banca' : 'Vendita Biglietti Banca';
  }

  get labelImpope(): string {
    return this.mode === 'acquisto' ? 'Importo acquistato' : 'Importo venduto';
  }

  get cardDatiTitle(): string {
    return this.mode === 'acquisto' ? 'Dati Acquisto' : 'Dati Vendita';
  }

  recalculate(): void {
    const impope = this.formData.trxImpope ?? 0;
    const excrat = this.formData.trxExcrat ?? 0;

    if (!impope || !excrat) {
      this.formData.trxImpctp = null;
      this.formData.trxImpctv = null;
      this.formData.trxCtpctv = null;
      this.formData.trxImprestoctv = null;
      return;
    }

    let ctv: number;
    if (this.mode === 'acquisto') {
      // Customer gives foreign currency → gets CHF: ctv = impope / excrat
      ctv = impope / excrat;
    } else {
      // Customer gets foreign currency → gives CHF: ctv = impope * excrat
      ctv = impope * excrat;
    }

    if (this.formData.cbArrotondaImporti) {
      ctv = Math.round(ctv * 20) / 20; // round to nearest 0.05 CHF
    }

    this.formData.trxImpctp = ctv;
    this.formData.trxImpctv = ctv;
    this.formData.trxCtpctv = ctv;
    this.formData.trxImprestoctv = 0;
  }

  onImpopeChange(e: any): void {
    this.formData.trxImpope = e.value;
    this.recalculate();
  }

  onExcratChange(e: any): void {
    this.formData.trxExcrat = e.value;
    this.recalculate();
  }

  onArrotondaChange(): void {
    this.recalculate();
  }

  conferma(): void {
    console.log('[BigliettiBanca] Conferma:', this.formData);
  }

  annulla(): void {
    this.resetForm();
  }

  stampa(): void {
    console.log('[BigliettiBanca] Stampa:', this.formData);
  }

  private resetForm(): void {
    this.formData = {
      trxDivope: null,
      trxDivctp: 'CHF',
      trxImpope: null,
      trxImpctp: null,
      trxExcrat: null,
      trxExrctpbas: null,
      trxImpctv: null,
      trxCtpctv: null,
      trxImprestoctv: null,
      trxDatval: new Date(),
      cbForceChange: false,
      cbArrotondaImporti: false,
      cbUseSpreadDip: false,
      note: ''
    };
  }
}
