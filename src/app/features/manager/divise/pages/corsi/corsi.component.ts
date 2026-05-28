import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule, DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule, DxDateBoxModule } from 'devextreme-angular';
import {
  SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
  SempioneToolbarDateRangeComponent,
} from '../../../../../components/General';
import notify from 'devextreme/ui/notify';
import { CorsiService } from '../../services/corsi.service';
import { ICorsoResponse, ICorsiRequest } from '../../models/corso.models';
import { Service } from '../../../../../core/services/service';
import { ICurrencyType } from '../../../../../core/domain/currencyType.domain';

@Component({
  selector: 'app-corsi',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule, DxDateBoxModule,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
    SempioneToolbarDateRangeComponent,
  ],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
})
export class CorsiComponent implements OnInit {
  private fb = inject(FormBuilder);
  private corsiService = inject(CorsiService);
  private coreService = inject(Service);

  private currencyTypes = signal<ICurrencyType[]>([]);

  readonly gridColumns = computed<SempioneGridColumn[]>(() => {
    const tipoHF = this.currencyTypes().map(t => ({ text: t.cutDes, value: t.cutId }));
    return [
      { dataField: 'cprCurId1',   caption: 'Div. CTP',   type: 'currency',  width: 100, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'cprCurId2',   caption: 'Div. BASE',  type: 'currency',  width: 100, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'cprCutId',    caption: 'Tipo',        type: 'tipo-pill', width: 90,  allowHeaderFiltering: true, allowFiltering: false, headerFilterDataSource: tipoHF },
      { dataField: 'curHostcod',  caption: 'Cod. HOST',   alignment: 'left', width: 110, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'cprRateBuy',  caption: 'Cambio BUY',  alignment: 'right', width: 120, dataType: 'number', format: '#,##0.0000', allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'cprRateSell', caption: 'Cambio SELL', alignment: 'right', width: 120, dataType: 'number', format: '#,##0.0000', allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'cprValdat',   caption: 'Data Valuta', alignment: 'left', width: 140, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'cprDatreg',   caption: 'Data Reg.',   alignment: 'left', width: 140, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curLondes',   caption: 'Descrizione', alignment: 'left',             allowHeaderFiltering: true, allowFiltering: false },
    ];
  });

  corsi = signal<ICorsoResponse[]>([]);
  isLoading = signal<boolean>(false);

  filterDateDal     = signal<Date | null>(null);
  filterDateAl      = signal<Date | null>(null);

  lastUpdate = signal<string>('—');

  // Popup
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  isConfirmDeleteVisible = signal(false);
  pendingDeleteData = signal<ICorsoResponse | null>(null);
  selectedLabel = signal<string>('');

  get tipoOptions() {
    return this.currencyTypes().map(t => ({ id: t.cutId, des: t.cutDes }));
  }

  readonly currencies = ['CHF', 'EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'SEK', 'NOK'];

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
    this.coreService.getCurrencyTypes().subscribe({ next: data => this.currencyTypes.set(data ?? []) });
    this.loadCorsi();
  }

  private loadCorsi(): void {
    this.onCerca();
  }

  onCerca(): void {
    const dal = this.filterDateDal();
    const al  = this.filterDateAl();
    const request: ICorsiRequest = {
      curId:     null,
      curLondes: null,
      curCutId:  null,
      dateFrom:  dal ? dal.toISOString() : '1900-01-01',
      dateTo:    al  ? al.toISOString()  : '2500-01-01',
    };
    this.isLoading.set(true);
    this.corsiService.getAll(request).subscribe({
      next: data => {
        this.corsi.set(data);
        const dates = data.map(c => c.cprDatreg).filter(Boolean) as string[];
        if (dates.length) {
          const latest = new Date(dates.reduce((a, b) => a > b ? a : b));
          this.lastUpdate.set(latest.toLocaleString('it-IT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          }));
        }
        this.isLoading.set(false);
      },
      error: () => {
        notify('Errore nel caricamento dei corsi', 'error', 3000);
        this.isLoading.set(false);
      }
    });
  }

  onResetFiltri(): void {
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
