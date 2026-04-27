import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxTextAreaModule,
  DxRadioGroupModule
} from 'devextreme-angular';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';

export type MoneteMetalliMode = 'acquisto' | 'vendita';

export interface MetalOption {
  code: string;
  description: string;
  type: 'MM' | 'LL';
}

@Component({
  selector: 'app-monete-metalli-form',
  standalone: true,
  imports: [
    CommonModule,
    DxButtonModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxTextAreaModule,
    DxRadioGroupModule,
    HeaderCardComponent
  ],
  templateUrl: './monete-metalli-form.component.html',
  styleUrls: ['./monete-metalli-form.component.css']
})
export class MoneteMetalliFormComponent {
  @Input({ required: true }) mode: MoneteMetalliMode = 'acquisto';

  operazioneNr = signal<string | null>(null);
  showFinezza = signal(false);

  metals: MetalOption[] = [
    { code: 'XAU', description: 'XAU - Oro (Lingotto)',       type: 'LL' },
    { code: 'XAG', description: 'XAG - Argento (Lingotto)',   type: 'LL' },
    { code: 'XPT', description: 'XPT - Platino (Lingotto)',   type: 'LL' },
    { code: 'XPD', description: 'XPD - Palladio (Lingotto)',  type: 'LL' },
    { code: 'CHF-VRZ', description: 'CHF - Vreneli',          type: 'MM' },
    { code: 'CHF-MCO', description: 'CHF - Mon. commemorativa', type: 'MM' },
    { code: 'EUR-MM',  description: 'EUR - Moneta d\'oro',    type: 'MM' },
    { code: 'USD-MM',  description: 'USD - Moneta d\'oro',    type: 'MM' }
  ];

  currencies: string[] = ['CHF', 'EUR', 'USD', 'GBP', 'JPY'];

  ivaOptions = [
    { value: 0, text: 'IVA %' },
    { value: 1, text: 'IVA inclusa' }
  ];

  private readonly IVA_RATE = 7.7;

  formData: any = {
    trxDivope:        null,
    metalType:        null as 'MM' | 'LL' | null,
    ivaMode:          0,
    trxExciva:        null,
    trxIvaamt:        null,
    trxQuantity:      null,
    trxAmount:        null,
    trxExcprc:        null,
    finezza:          1,
    prezzoIvaEsclusa: null,
    trxImpope:        null,
    trxDivctp:        'CHF',
    trxPrccpt:        null,
    trxExcrat:        null,
    trxExcratSys:     null,
    trxImpctp:        null,
    trxImpctv:        null,
    trxImprestoctv:   null,
    cambioCHF:        null,
    cbArrotondaImporti: true,
    cbForceChange:    false,
    cbUseSpreadDip:   false,
    trxDatval:        new Date(),
    trxDatope:        new Date(),
    note:             ''
  };

  get pageTitle(): string {
    return this.mode === 'acquisto' ? 'Acquisto Monete e Metalli' : 'Vendita Monete e Metalli';
  }

  get cardTitle1(): string {
    return this.mode === 'acquisto' ? 'Dati Acquisto' : 'Dati Vendita';
  }

  onMetalChanged(e: any): void {
    if (!e.value) {
      this.showFinezza.set(false);
      this.formData.metalType = null;
      return;
    }
    const metal = this.metals.find(m => m.code === e.value);
    if (metal) {
      this.formData.metalType = metal.type;
      const isLingotto = metal.type === 'LL';
      this.showFinezza.set(isLingotto);
      if (!isLingotto) this.formData.finezza = 1;
    }
    this.calculate();
  }

  calculate(): void {
    const qty    = this.formData.trxQuantity ?? 0;
    const price  = this.formData.trxExcprc   ?? 0;
    const fin    = this.formData.finezza      ?? 1;
    const excrat = this.formData.trxExcrat    ?? 0;

    if (!qty || !price) { this.clearCalculated(); return; }

    // ── Step 1: importo grezzo ──
    let amount = qty * price * fin;
    amount = this.mode === 'vendita'
      ? Math.ceil(amount  * 20) / 20
      : Math.floor(amount * 20) / 20;
    this.formData.trxAmount = amount;

    // ── Step 2: IVA ──
    let iva = 0;
    let totale = amount;
    if (this.formData.ivaMode === 0) {
      const ivaPct = this.formData.trxExciva ?? 0;
      if (ivaPct > 0) {
        iva = Math.round(amount * ivaPct / 100 * 20) / 20;
        totale = amount + iva;
      }
    } else {
      iva = Math.round(amount / (100 + this.IVA_RATE) * this.IVA_RATE * 20) / 20;
      this.formData.prezzoIvaEsclusa = qty > 0 ? price - iva / qty : null;
    }
    this.formData.trxIvaamt = iva > 0 ? iva : null;
    this.formData.trxImpope = totale;

    // ── Step 3: controparte ──
    if (!excrat) {
      this.clearCounterpart(); return;
    }

    const isCHF = this.formData.trxDivctp === 'CHF';
    let impctp = isCHF ? totale : totale / excrat;
    if (this.formData.cbArrotondaImporti) {
      impctp = this.mode === 'vendita'
        ? Math.ceil(impctp  * 20) / 20
        : Math.floor(impctp * 20) / 20;
    }
    this.formData.trxImpctp = impctp;

    const impctv = isCHF ? impctp : Math.round(impctp * excrat * 20) / 20;
    this.formData.trxImpctv      = impctv;
    this.formData.trxPrccpt      = isCHF ? price : Math.round(price / excrat * 10000) / 10000;
    this.formData.trxImprestoctv = Math.round(Math.abs(totale - impctv) * 20) / 20;
    this.formData.cambioCHF      = excrat;
    this.formData.trxExcratSys   = excrat;
  }

  private clearCalculated(): void {
    this.formData.trxAmount = this.formData.trxIvaamt = this.formData.trxImpope =
    this.formData.prezzoIvaEsclusa = null;
    this.clearCounterpart();
  }

  private clearCounterpart(): void {
    this.formData.trxImpctp = this.formData.trxImpctv = this.formData.trxPrccpt =
    this.formData.trxImprestoctv = this.formData.cambioCHF = null;
  }

  conferma(): void { console.log('[MoneteMetalli] Conferma:', this.formData); }
  stampa():   void { console.log('[MoneteMetalli] Stampa:',   this.formData); }
  annulla():  void { this.resetForm(); }

  private resetForm(): void {
    this.formData = {
      trxDivope: null, metalType: null,
      ivaMode: 0, trxExciva: null, trxIvaamt: null,
      trxQuantity: null, trxAmount: null,
      trxExcprc: null, finezza: 1, prezzoIvaEsclusa: null, trxImpope: null,
      trxDivctp: 'CHF', trxPrccpt: null, trxExcrat: null,
      trxExcratSys: null, trxImpctp: null, trxImpctv: null,
      trxImprestoctv: null, cambioCHF: null,
      cbArrotondaImporti: true, cbForceChange: false, cbUseSpreadDip: false,
      trxDatval: new Date(), trxDatope: new Date(), note: ''
    };
    this.showFinezza.set(false);
  }
}
