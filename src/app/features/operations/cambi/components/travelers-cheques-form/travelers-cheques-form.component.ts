import { Component, Input, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  DxTextBoxModule, DxNumberBoxModule, DxSelectBoxModule, DxCheckBoxModule,
  DxDateBoxModule, DxTextAreaModule, DxButtonModule, DxRadioGroupModule,
  DxPopupModule, DxDropDownButtonModule
} from 'devextreme-angular';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';

export type TravelersChequesMode = 'acquisto' | 'vendita';

const r05 = (v: number) => Math.round(v * 20) / 20;

@Component({
  selector: 'app-travelers-cheques-form',
  standalone: true,
  imports: [
    CommonModule, DatePipe, DecimalPipe,
    DxTextBoxModule, DxNumberBoxModule, DxSelectBoxModule, DxCheckBoxModule,
    DxDateBoxModule, DxTextAreaModule, DxButtonModule, DxRadioGroupModule,
    DxPopupModule, DxDropDownButtonModule,
    HeaderCardComponent
  ],
  templateUrl: './travelers-cheques-form.component.html',
  styleUrls: ['./travelers-cheques-form.component.css']
})
export class TravelersChequesFormComponent {

  @Input({ required: true }) mode: TravelersChequesMode = 'acquisto';

  operazioneNr = signal<string | null>(null);
  cambioVisible  = signal(false);
  appearerVisible = signal(false);

  currencies: string[] = ['CHF', 'EUR', 'USD', 'GBP', 'JPY'];

  commModeOptions = [
    { value: 0, text: '%'       },
    { value: 1, text: 'Importo' }
  ];

  altreAzioniItems = [
    { id: 'carica',  text: 'Carica',  icon: 'upload' },
    { id: 'stampa',  text: 'Stampa',  icon: 'print'  },
    { id: 'storna',  text: 'Storna',  icon: 'revert' }
  ];

  formData: any = {
    // Traveler's Cheque (operazione)
    divOpe:       'EUR',
    amount:       null,
    amountCHF:    null,
    commMode:     0,
    commRate:     null,
    commAmt:      null,
    commCHF:      null,
    totale:       null,
    totaleCHF:    null,

    // Controparte
    divCtp:       'CHF',
    excrat:       null,
    excratSys:    null,
    impCtp:       null,
    impCtv:       null,
    resto:        null,
    cambioCHF:    null,
    cbArrotondaImporti: true,
    cbForceChange: false,

    // Vigilanza
    forzaVigilanza: false,

    // Descrizione Operazione
    dataValuta:      new Date(),
    dataOperazione:  new Date(),
    nomeCognome:     '',
    testo:           '',
    commentoInterno: ''
  };

  get pageTitle(): string {
    return this.mode === 'acquisto'
      ? "Acquisto Traveler's Cheques"
      : "Vendita Traveler's Cheques";
  }

  calculate(): void {
    const amount  = this.formData.amount   ?? 0;
    const excrat  = this.formData.excrat   ?? 1;
    const commRate = this.formData.commRate ?? 0;

    if (!amount) { this.clearAll(); return; }

    // CHF value of cheque
    const isCHFope = this.formData.divOpe === 'CHF';
    const amountCHF = isCHFope ? amount : r05(amount * excrat);
    this.formData.amountCHF = amountCHF || null;

    // Commission
    let commAmt = 0;
    if (this.formData.commMode === 0) {
      commAmt = r05(amountCHF * commRate / 100);
    } else {
      commAmt = r05(commRate);
    }
    this.formData.commAmt = commAmt || null;
    this.formData.commCHF = commAmt || null;

    // Totale
    const totaleCHF = this.mode === 'acquisto'
      ? r05(amountCHF - commAmt)
      : r05(amountCHF + commAmt);
    this.formData.totale    = totaleCHF || null;
    this.formData.totaleCHF = totaleCHF || null;

    if (!excrat) { this.clearControparte(); return; }

    // Controparte
    const isCHFctp = this.formData.divCtp === 'CHF';
    let impCtp = isCHFctp ? totaleCHF : r05(totaleCHF / excrat);
    if (this.formData.cbArrotondaImporti) {
      impCtp = this.mode === 'acquisto'
        ? Math.floor(impCtp * 20) / 20
        : Math.ceil(impCtp  * 20) / 20;
    }
    const impCtv = isCHFctp ? impCtp : r05(impCtp * excrat);
    this.formData.impCtp   = impCtp   || null;
    this.formData.impCtv   = impCtv   || null;
    this.formData.resto    = r05(Math.abs(totaleCHF - impCtv)) || null;
    this.formData.cambioCHF = excrat;
    this.formData.excratSys  = this.formData.excratSys ?? excrat;
  }

  private clearAll(): void {
    this.formData.amountCHF = this.formData.commAmt = this.formData.commCHF =
    this.formData.totale = this.formData.totaleCHF = null;
    this.clearControparte();
  }

  private clearControparte(): void {
    this.formData.impCtp = this.formData.impCtv =
    this.formData.resto  = this.formData.cambioCHF = null;
  }

  showCambio():   void { this.cambioVisible.set(true);   }
  showAppearer(): void { this.appearerVisible.set(true); }

  indietro(): void { history.back(); }
  annulla():  void { /* reset */ }
  modifica(): void { /* unlock */ }
  conferma(): void { /* submit */ }

  onAltreAzioniClick(_e: any): void { /* handle */ }
}
