import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule, DxDateBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface ICorso {
  cprCurId1: string;
  cprCurId2: string;
  cprCutId: string;
  curHostcod: string;
  cprRateBuy: number | null;
  cprRateSell: number | null;
  cprValdat: string;
  cprDatreg: string | null;
  curLondes: string;
  curModdat: string | null;
}

@Component({
  selector: 'app-corsi',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule, DxDateBoxModule
  ],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
})
export class CorsiComponent implements OnInit {
  private fb = inject(FormBuilder);

  private corsi = signal<ICorso[]>([]);

  // Filtri barra di ricerca
  filterCodice      = signal<string>('');
  filterDescrizione = signal<string>('');
  filterTipo        = signal<string>('BB');
  filterDateDal     = signal<Date | null>(null);
  filterDateAl      = signal<Date | null>(null);

  // Ultimo aggiornamento (dal backend)
  lastUpdate = signal<string>('15.01.2024 09:00:00');

  // Popup
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  readonly tipoOptions = [
    { id: '',   des: 'Tutti' },
    { id: 'BB', des: 'Biglietti Banca' },
    { id: 'MM', des: 'Monete e Metalli' },
    { id: 'TR', des: 'Travelers Cheques' },
  ];

  readonly currencies = ['CHF', 'EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'SEK', 'NOK'];

  filteredCorsi = computed(() => {
    const q    = this.filterCodice().toLowerCase().trim();
    const qDes = this.filterDescrizione().toLowerCase().trim();
    const tipo = this.filterTipo();
    const dal  = this.filterDateDal();
    const al   = this.filterDateAl();

    return this.corsi().filter(c => {
      if (q && !c.cprCurId1.toLowerCase().includes(q) &&
               !c.cprCurId2.toLowerCase().includes(q) &&
               !c.curHostcod.toLowerCase().includes(q)) return false;
      if (qDes && !c.curLondes.toLowerCase().includes(qDes)) return false;
      if (tipo && c.cprCutId !== tipo) return false;
      if (dal) {
        const rowDate = new Date(c.cprValdat);
        if (rowDate < dal) return false;
      }
      if (al) {
        const rowDate = new Date(c.cprValdat);
        if (rowDate > al) return false;
      }
      return true;
    });
  });

  corsoForm: FormGroup = this.fb.group({
    cprCurId1:   ['', Validators.required],
    cprCurId2:   ['', Validators.required],
    cprCutId:    ['', Validators.required],
    cprValdat:   ['', Validators.required],
    curHostcod:  [''],
    curLondes:   [''],
    cprRateBuy:  [null, Validators.required],
    cprRateSell: [null, Validators.required],
    cprDatreg:   [''],
    curModdat:   [''],
  });

  ngOnInit(): void {
    // TODO: load from backend service
    this.corsi.set([
      {
        cprCurId1: 'EUR', cprCurId2: 'CHF', cprCutId: 'BB', curHostcod: 'EURCHF',
        cprRateBuy: 0.9512, cprRateSell: 0.9648, cprValdat: '2024-01-15 09:00:00',
        cprDatreg: '2024-01-15 08:55:00', curLondes: 'Euro / Franco Svizzero',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        cprCurId1: 'USD', cprCurId2: 'CHF', cprCutId: 'BB', curHostcod: 'USDCHF',
        cprRateBuy: 0.8734, cprRateSell: 0.8856, cprValdat: '2024-01-15 09:00:00',
        cprDatreg: '2024-01-15 08:55:00', curLondes: 'Dollaro USA / Franco Svizzero',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        cprCurId1: 'GBP', cprCurId2: 'CHF', cprCutId: 'BB', curHostcod: 'GBPCHF',
        cprRateBuy: 1.1021, cprRateSell: 1.1187, cprValdat: '2024-01-15 09:00:00',
        cprDatreg: '2024-01-15 08:55:00', curLondes: 'Sterlina / Franco Svizzero',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        cprCurId1: 'EUR', cprCurId2: 'CHF', cprCutId: 'MM', curHostcod: 'EURCHFM',
        cprRateBuy: 0.9480, cprRateSell: 0.9620, cprValdat: '2024-01-15 09:00:00',
        cprDatreg: '2024-01-15 08:55:00', curLondes: 'Euro / Franco Svizzero (Monete)',
        curModdat: '2024-01-15 09:00:00'
      },
    ]);
  }

  onCerca(): void {
    // Con i computed signal il filtro è già reattivo; il bottone serve per UX
    notify('Ricerca applicata', 'info', 1500);
  }

  onResetFiltri(): void {
    this.filterCodice.set('');
    this.filterDescrizione.set('');
    this.filterTipo.set('BB');
    this.filterDateDal.set(null);
    this.filterDateAl.set(null);
  }

  openViewPopup(data: ICorso): void {
    this.selectedLabel.set(`${data.cprCurId1}/${data.cprCurId2} ${data.cprCutId} — ${data.cprValdat}`);
    this.corsoForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: ICorso): void {
    this.selectedLabel.set(`${data.cprCurId1}/${data.cprCurId2} ${data.cprCutId} — ${data.cprValdat}`);
    this.corsoForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  openNewPopup(): void {
    this.corsoForm.reset();
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: ICorso): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.onDelete(data);      break;
    }
  }

  onDelete(data: ICorso): void {
    // TODO: call backend delete
    this.corsi.update(list => list.filter(c =>
      !(c.cprCurId1 === data.cprCurId1 && c.cprCurId2 === data.cprCurId2 &&
        c.cprCutId  === data.cprCutId   && c.cprValdat === data.cprValdat)
    ));
    notify(`Corso "${data.cprCurId1}/${data.cprCurId2}" eliminato`, 'success', 3000);
  }

  onSubmit(): void {
    if (!this.corsoForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.corsoForm.getRawValue() as ICorso;
    // TODO: call backend insert
    this.corsi.update(list => [...list, { ...val, cprDatreg: new Date().toISOString(), curModdat: null }]);
    notify('Corso creato con successo', 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.corsoForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.corsoForm.getRawValue() as ICorso;
    // TODO: call backend update
    this.corsi.update(list => list.map(c =>
      c.cprCurId1 === val.cprCurId1 && c.cprCurId2 === val.cprCurId2 &&
      c.cprCutId  === val.cprCutId   && c.cprValdat === val.cprValdat
        ? { ...c, cprRateBuy: val.cprRateBuy, cprRateSell: val.cprRateSell, curHostcod: val.curHostcod }
        : c
    ));
    notify('Corso aggiornato con successo', 'success', 3000);
    this.closePopup();
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.corsoForm.reset();
    this.selectedLabel.set('');
  }
}
