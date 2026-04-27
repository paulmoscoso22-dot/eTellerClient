import { Component, Input, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  DxTextBoxModule, DxNumberBoxModule, DxSelectBoxModule, DxCheckBoxModule,
  DxDateBoxModule, DxTextAreaModule, DxButtonModule,
  DxPopupModule, DxDropDownButtonModule
} from 'devextreme-angular';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';

export type ContiGeneraliMode = 'versamento' | 'prelevamento';

const r05 = (v: number) => Math.round(v * 20) / 20;

@Component({
  selector: 'app-conti-generali-form',
  standalone: true,
  imports: [
    CommonModule, DatePipe, DecimalPipe,
    DxTextBoxModule, DxNumberBoxModule, DxSelectBoxModule, DxCheckBoxModule,
    DxDateBoxModule, DxTextAreaModule, DxButtonModule,
    DxPopupModule, DxDropDownButtonModule,
    HeaderCardComponent
  ],
  templateUrl: './conti-generali-form.component.html',
  styleUrls: ['./conti-generali-form.component.css']
})
export class ContiGeneraliFormComponent {

  @Input({ required: true }) mode: ContiGeneraliMode = 'versamento';

  operazioneNr  = signal<string | null>(null);
  cambioVisible = signal(false);

  currencies: string[] = ['CHF', 'EUR', 'USD', 'GBP', 'JPY'];

  altreAzioniItems = [
    { id: 'carica',  text: 'Carica',  icon: 'upload' },
    { id: 'stampa',  text: 'Stampa',  icon: 'print'  },
    { id: 'storna',  text: 'Storna',  icon: 'revert' }
  ];

  nrContoSearchBtn = {
    icon: 'search',
    onClick: () => { /* account lookup */ }
  };

  formData: any = {
    nrConto:          '',
    descrizioneConto: '',
    divisa:           'CHF',
    centroCosto:      '',
    amount:           null,
    cbArrotondaImporti: true,
    amountCHF:        null,
    excrat:           null,
    excratSys:        null,

    dataValuta:      new Date(),
    dataOperazione:  new Date(),
    nomeCognome:     '',
    testo:           '',
    commentoInterno: ''
  };

  get pageTitle(): string {
    return this.mode === 'versamento'
      ? 'Versamento Conto Generale'
      : 'Prelevamento Conto Generale';
  }

  calculate(): void {
    const amount = this.formData.amount ?? 0;
    const excrat = this.formData.excrat  ?? 1;

    if (!amount) { this.formData.amountCHF = null; return; }

    const isCHF = this.formData.divisa === 'CHF';
    let amountCHF = isCHF ? amount : r05(amount * excrat);
    if (this.formData.cbArrotondaImporti) {
      amountCHF = r05(amountCHF);
    }
    this.formData.amountCHF = amountCHF || null;
  }

  showCambio(): void { this.cambioVisible.set(true); }

  onNrContoChange(): void {
    if (!this.formData.nrConto) {
      this.formData.descrizioneConto = '';
    }
    /* real lookup would populate descrizioneConto from backend */
  }

  indietro(): void { history.back(); }
  annulla():  void { /* reset */ }
  modifica(): void { /* unlock */ }
  conferma(): void { /* submit */ }

  onAltreAzioniClick(_e: any): void { /* handle */ }
}
