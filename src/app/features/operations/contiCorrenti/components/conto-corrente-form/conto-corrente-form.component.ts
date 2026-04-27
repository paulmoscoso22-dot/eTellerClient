import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxTextAreaModule,
  DxPopupModule,
  DxDropDownButtonModule,
  DxRadioGroupModule
} from 'devextreme-angular';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';
import { RicercaContoTable } from '../ricerca-conto-table/ricerca-conto-table';

export type ContoCorrenteMode = 'versamento' | 'prelevamento';

@Component({
  selector: 'app-conto-corrente-form',
  standalone: true,
  imports: [
    CommonModule,
    DxButtonModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxTextAreaModule,
    DxPopupModule,
    DxDropDownButtonModule,
    DxRadioGroupModule,
    HeaderCardComponent,
    RicercaContoTable
  ],
  templateUrl: './conto-corrente-form.component.html',
  styleUrls: ['./conto-corrente-form.component.css']
})
export class ContoCorrenteFormComponent {
  @Input({ required: true }) mode: ContoCorrenteMode = 'versamento';

  operazioneNr = signal<string | null>(null);
  ricercaContoVisible = signal(false);
  cambioVisible       = signal(false);
  appearerVisible     = signal(false);

  currencies: string[] = ['CHF', 'EUR', 'USD', 'GBP', 'JPY'];

  aggioModeOptions = [
    { value: 0, text: '%' },
    { value: 1, text: 'Importo' }
  ];

  aggioTipoOptions = [
    { value: 0, text: 'Aggio' },
    { value: 1, text: 'Disaggio' }
  ];

  altreAzioniItems = [
    { id: 'carica',      text: 'Carica',        icon: 'upload' },
    { id: 'cancellaBef', text: 'Cancella Bef',  icon: 'trash'  },
    { id: 'storna',      text: 'Storna',         icon: 'revert' },
    { id: 'stampa',      text: 'Stampa',         icon: 'print'  },
    { id: 'dettagli',    text: 'Dettagli',       icon: 'info'   },
    { id: 'benefondo',   text: 'Crea benefondo', icon: 'add'    },
    { id: 'sospendi',    text: 'Sospendi',       icon: 'clock'  },
    { id: 'traccia',     text: 'Traccia',        icon: 'chart'  }
  ];

  formData: any = {
    nrConto:              null,
    titolare:             null,
    divisaConto:          null,
    rubrica:              null,
    saldo:                null,
    importoConto:         null,
    controvaloreChfConto: null,
    stampaSaldo:          false,
    divisaBanca:          'CHF',
    cambioCtv:            null,
    importoBanca:         null,
    cbArrotondaImporti:   true,
    controvaloreChfBanca: null,
    cambio:               null,
    cbForceChange:        false,
    cambioSistema:        null,
    aggioMode:            0,
    aggio:                null,
    aggioTipo:            0,
    stampaAvviso:         false,
    forzaVigilanza:       false,
    dataValuta:           new Date(),
    dataOperazione:       new Date(),
    nomeCognome:          '',
    testo:                '',
    commentoInterno:      ''
  };

  nrContoSearchBtn = {
    icon: 'search',
    onClick: () => this.ricercaContoVisible.set(true)
  };

  get pageTitle(): string {
    return this.mode === 'versamento' ? 'Versamento' : 'Prelevamento';
  }

  showCambio():   void { this.cambioVisible.set(true);   }
  showAppearer(): void { this.appearerVisible.set(true); }

  // Calcolo da importo banca (biglietti) → importo conto + controvalori
  recalculate(): void {
    const impBanca  = this.formData.importoBanca ?? 0;
    const cambio    = this.formData.cambio       ?? 1;
    const cambioCtv = this.formData.cambioCtv    ?? 1;
    const aggio     = this.formData.aggio        ?? 0;

    if (!impBanca) {
      this.formData.controvaloreChfBanca = null;
      this.formData.importoConto         = null;
      this.formData.controvaloreChfConto = null;
      return;
    }

    const round05 = (v: number) => Math.round(v * 20) / 20;

    const isDivisaBancaCHF = this.formData.divisaBanca === 'CHF';
    let ctvBanca = isDivisaBancaCHF ? impBanca : impBanca * cambioCtv;
    if (this.formData.cbArrotondaImporti) ctvBanca = round05(ctvBanca);
    this.formData.controvaloreChfBanca = ctvBanca;

    let aggioAmt = this.formData.aggioMode === 0 ? impBanca * aggio / 100 : aggio;
    if (this.formData.cbArrotondaImporti) aggioAmt = round05(aggioAmt);

    const rate = cambio > 0 ? cambio : 1;
    let impConto = ctvBanca / rate;
    const aggioCtv = aggioAmt / rate;
    impConto = this.formData.aggioTipo === 0 ? impConto + aggioCtv : impConto - aggioCtv;
    if (this.formData.cbArrotondaImporti) impConto = round05(impConto);
    this.formData.importoConto = impConto;

    const isDivisaContoCHF = this.formData.divisaConto === 'CHF';
    let ctvConto = isDivisaContoCHF ? impConto : impConto * rate;
    if (this.formData.cbArrotondaImporti) ctvConto = round05(ctvConto);
    this.formData.controvaloreChfConto = ctvConto;
  }

  // Calcolo inverso: importo conto → importo banca (biglietti)
  onImpopeChange(): void {
    const impConto  = this.formData.importoConto ?? 0;
    const cambio    = this.formData.cambio       ?? 1;
    const cambioCtv = this.formData.cambioCtv    ?? 1;

    if (!impConto) {
      this.formData.importoBanca         = null;
      this.formData.controvaloreChfBanca = null;
      this.formData.controvaloreChfConto = null;
      return;
    }

    const round05 = (v: number) => Math.round(v * 20) / 20;
    const rate = cambio > 0 ? cambio : 1;

    const isDivisaContoCHF = this.formData.divisaConto === 'CHF';
    let ctvConto = isDivisaContoCHF ? impConto : impConto * rate;
    if (this.formData.cbArrotondaImporti) ctvConto = round05(ctvConto);
    this.formData.controvaloreChfConto = ctvConto;

    let impBanca = impConto * rate;
    if (this.formData.cbArrotondaImporti) impBanca = round05(impBanca);
    this.formData.importoBanca = impBanca;

    const isDivisaBancaCHF = this.formData.divisaBanca === 'CHF';
    let ctvBanca = isDivisaBancaCHF ? impBanca : impBanca * cambioCtv;
    if (this.formData.cbArrotondaImporti) ctvBanca = round05(ctvBanca);
    this.formData.controvaloreChfBanca = ctvBanca;
  }

  onAltreAzioniClick(_e: any): void {}
  conferma(): void { console.log('[ContoCorrente] Conferma:', this.formData); }
  annulla():  void { this.resetForm(); }
  modifica(): void {}
  indietro(): void {}

  private resetForm(): void {
    this.formData = {
      nrConto: null, titolare: null, divisaConto: null, rubrica: null, saldo: null,
      importoConto: null, controvaloreChfConto: null, stampaSaldo: false,
      divisaBanca: 'CHF', cambioCtv: null, importoBanca: null,
      cbArrotondaImporti: true, controvaloreChfBanca: null,
      cambio: null, cbForceChange: false, cambioSistema: null,
      aggioMode: 0, aggio: null, aggioTipo: 0, stampaAvviso: false,
      forzaVigilanza: false,
      dataValuta: new Date(), dataOperazione: new Date(),
      nomeCognome: '', testo: '', commentoInterno: ''
    };
  }
}
