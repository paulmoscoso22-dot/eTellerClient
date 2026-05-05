import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule, DxDateBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { CorsiService } from '../../services/corsi.service';
import { ICorso, CorsiRequest } from '../../models/divisa.models';

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
  private corsiService = inject(CorsiService);

  private corsi = signal<ICorso[]>([]);
  isLoading = signal<boolean>(false);

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
               !(c.curHostcod ?? '').toLowerCase().includes(q)) return false;
      if (qDes && !(c.curLondes ?? '').toLowerCase().includes(qDes)) return false;
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
    this.loadCorsi();
  }

  private loadCorsi(): void {
    this.onCerca();
  }

  onCerca(): void {
    const dal = this.filterDateDal();
    const al  = this.filterDateAl();
    const request: CorsiRequest = {
      curId:     this.filterCodice()      || null,
      curLondes: this.filterDescrizione() || null,
      curCutId:  this.filterTipo()        || null,
      dateFrom:  dal ? dal.toISOString()  : '1900-01-01',
      dateTo:    al  ? al.toISOString()   : '2500-01-01',
    };
    this.isLoading.set(true);
    this.corsiService.getAll(request).subscribe({
      next: data => {
        this.corsi.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        notify('Errore nel caricamento dei corsi', 'error', 3000);
        this.isLoading.set(false);
      }
    });
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
