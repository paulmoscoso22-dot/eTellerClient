import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule, DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule, DxDateBoxModule } from 'devextreme-angular';
import {
  SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
} from '../../../../../components/General';
import notify from 'devextreme/ui/notify';
import { CorsiService } from '../../services/corsi.service';
import { ICorsoResponse, ICorsiRequest } from '../../models/corso.models';

@Component({
  selector: 'app-corsi',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule, DxDateBoxModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
  ],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
})
export class CorsiComponent implements OnInit {
  private fb = inject(FormBuilder);
  private corsiService = inject(CorsiService);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'cprCurId1',   caption: 'Div. CTP',    type: 'currency',  width: 100 },
    { dataField: 'cprCurId2',   caption: 'Div. BASE',   type: 'currency',  width: 100 },
    { dataField: 'cprCutId',    caption: 'Tipo',         type: 'tipo-pill', width: 90  },
    { dataField: 'curHostcod',  caption: 'Cod. HOST',    alignment: 'left', width: 110 },
    { dataField: 'cprRateBuy',  caption: 'Cambio BUY',   alignment: 'right', width: 120, dataType: 'number', format: '#,##0.0000' },
    { dataField: 'cprRateSell', caption: 'Cambio SELL',  alignment: 'right', width: 120, dataType: 'number', format: '#,##0.0000' },
    { dataField: 'cprValdat',   caption: 'Data Valuta',  alignment: 'left', width: 140 },
    { dataField: 'cprDatreg',   caption: 'Data Reg.',    alignment: 'left', width: 140 },
    { dataField: 'curLondes',   caption: 'Descrizione',  alignment: 'left'             },
  ];

  private corsi = signal<ICorsoResponse[]>([]);
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
  isConfirmDeleteVisible = signal(false);
  pendingDeleteData = signal<ICorsoResponse | null>(null);
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
    const request: ICorsiRequest = {
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

  openViewPopup(data: ICorsoResponse): void {
    this.selectedLabel.set(`${data.cprCurId1}/${data.cprCurId2} ${data.cprCutId} — ${data.cprValdat}`);
    this.corsoForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: ICorsoResponse): void {
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

  onTableAction(action: string, data: ICorsoResponse): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.requestDelete(data);  break;
    }
  }

  requestDelete(data: ICorsoResponse): void {
    this.pendingDeleteData.set(data);
    this.isConfirmDeleteVisible.set(true);
  }

  confirmDelete(): void {
    const data = this.pendingDeleteData();
    if (!data) return;
    this.corsi.update(list => list.filter(c =>
      !(c.cprCurId1 === data.cprCurId1 && c.cprCurId2 === data.cprCurId2 &&
        c.cprCutId  === data.cprCutId   && c.cprValdat === data.cprValdat)
    ));
    notify(`Corso "${data.cprCurId1}/${data.cprCurId2}" eliminato`, 'success', 3000);
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.isConfirmDeleteVisible.set(false);
    this.pendingDeleteData.set(null);
  }

  onSubmit(): void {
    if (!this.corsoForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.corsoForm.getRawValue() as ICorsoResponse;
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
    const val = this.corsoForm.getRawValue() as ICorsoResponse;
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
