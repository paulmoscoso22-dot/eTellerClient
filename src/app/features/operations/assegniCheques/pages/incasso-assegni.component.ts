import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  DxTextBoxModule, DxNumberBoxModule, DxSelectBoxModule, DxCheckBoxModule,
  DxDateBoxModule, DxTextAreaModule, DxButtonModule, DxRadioGroupModule,
  DxPopupModule, DxDropDownButtonModule
} from 'devextreme-angular';
import { HeaderCardComponent } from '../../../../components/header-card/header-card.component';

const round05 = (v: number) => Math.round(v * 20) / 20;

@Component({
  selector: 'app-incasso-assegni',
  standalone: true,
  imports: [
    CommonModule, DatePipe, DecimalPipe,
    DxTextBoxModule, DxNumberBoxModule, DxSelectBoxModule, DxCheckBoxModule,
    DxDateBoxModule, DxTextAreaModule, DxButtonModule, DxRadioGroupModule,
    DxPopupModule, DxDropDownButtonModule,
    HeaderCardComponent
  ],
  templateUrl: './incasso-assegni.component.html',
  styleUrls: ['./incasso-assegni.component.css']
})
export class IncassoAssegniComponent {

  operazioneNr = signal<string | null>(null);
  ricercaContoVisible = signal(false);
  cambioVisible = signal(false);
  appearerVisible = signal(false);

  currencies: string[] = ['CHF', 'EUR', 'USD', 'GBP', 'JPY'];

  commissioniModeOptions = [
    { value: 0, text: '%' },
    { value: 1, text: 'Importo' }
  ];

  altreAzioniItems = [
    { id: 'carica',   text: 'Carica',   icon: 'upload'   },
    { id: 'stampa',   text: 'Stampa',   icon: 'print'    },
    { id: 'esporta',  text: 'Esporta',  icon: 'export'   }
  ];

  nrContoSearchBtn = {
    icon: 'search',
    onClick: () => this.ricercaContoVisible.set(true)
  };

  formData: any = {
    // Dati Conto
    nrConto: null,
    titolare: null,
    divisaConto: null,
    rubrica: null,
    saldo: null,
    importoOperazione: null,
    controvaloreChfOpe: null,
    stampaSaldo: false,

    // Assegno
    divisaBanca: 'CHF',
    cambioCtv: null,
    importoAssegno: null,
    controvaloreChfAssegno: null,
    commissioniMode: 0,
    tassoCommissioni: null,
    ivaPercent: null,
    ivaImporto: null,
    ivaCTV: null,
    cambio: null,
    cambioSistema: null,
    cbForceChange: false,
    nrAssegno: '',
    ckSBF: false,
    totale: null,
    totaleCTV: null,

    // Vigilanza
    forzaVigilanza: false,

    // Descrizione Operazione
    dataValuta: new Date(),
    dataOperazione: new Date(),
    nomeCognome: '',
    testo: '',
    commentoInterno: ''
  };

  calculate(): void {
    const impAss   = this.formData.importoAssegno   ?? 0;
    const ctvRate  = this.formData.cambioCtv         ?? 1;
    const tasso    = this.formData.tassoCommissioni  ?? 0;
    const ivaPct   = this.formData.ivaPercent        ?? 0;

    const ctvAss = round05(impAss * ctvRate);
    this.formData.controvaloreChfAssegno = ctvAss || null;

    const comm = this.formData.commissioniMode === 0
      ? round05(ctvAss * tasso / 100)
      : round05(tasso);

    const ivaAmt = round05(comm * ivaPct / 100);
    this.formData.ivaImporto = ivaAmt || null;
    this.formData.ivaCTV     = ivaAmt || null;

    const tot = round05(ctvAss - comm - ivaAmt);
    this.formData.totale    = tot || null;
    this.formData.totaleCTV = tot || null;

    const cambio = this.formData.cambio ?? ctvRate ?? 1;
    this.formData.importoOperazione   = cambio ? round05(tot / cambio) : null;
    this.formData.controvaloreChfOpe  = tot || null;
  }

  showCambio():    void { this.cambioVisible.set(true);    }
  showAppearer():  void { this.appearerVisible.set(true);  }

  indietro(): void { history.back(); }
  annulla():  void { /* reset form */ }
  modifica(): void { /* unlock readonly fields */ }
  conferma(): void { /* submit */ }

  onAltreAzioniClick(e: any): void { /* handle */ }
}
