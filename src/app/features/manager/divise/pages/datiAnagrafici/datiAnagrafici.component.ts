import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule, DxValidatorModule, DxNumberBoxModule } from 'devextreme-angular';
import {
  SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,
} from '../../../../../components/General';
import notify from 'devextreme/ui/notify';
import { IDivisaAnagraficaResponse, IDivisaAnagraficaRequest, UpdateDivisaRequest } from '../../models/divisa.models';
import { DiviseService } from '../../services/divise.service';

@Component({
  selector: 'app-dati-anagrafici',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxValidatorModule, DxNumberBoxModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
  ],
  templateUrl: './datiAnagrafici.component.html',
  styleUrls: ['./datiAnagrafici.component.css'],
})
export class DatiAnagraficiComponent implements OnInit {
  private fb = inject(FormBuilder);
  private diviseService = inject(DiviseService);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'curId',      caption: 'ID',             type: 'currency',  width: 100 },
    { dataField: 'curCutId',   caption: 'Genere',          type: 'tipo-pill', width: 90  },
    { dataField: 'curShodes',  caption: 'Descrizione',     alignment: 'left'             },
    { dataField: 'curMinamn',  caption: 'Imp. Minimo',     alignment: 'right', width: 120, dataType: 'number', format: '#,##0.##' },
    { dataField: 'curModdat',  caption: 'Data modifica',   alignment: 'left',  width: 150 },
    { dataField: 'curHostcod', caption: 'Host code',       alignment: 'left',  width: 120 },
  ];

  private divise = signal<IDivisaAnagraficaResponse[]>([]);

  filterCodice      = signal<string>('');
  filterDescrizione = signal<string>('');

  popupMode = signal<'view' | 'edit'>('view');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  filteredDivise = computed(() => {
    const q    = this.filterCodice().toLowerCase().trim();
    const qDes = this.filterDescrizione().toLowerCase().trim();

    return this.divise().filter(d => {
      if (q && !d.curId.toLowerCase().includes(q)) return false;
      if (qDes && !d.curLondes.toLowerCase().includes(qDes) &&
                  !d.curShodes.toLowerCase().includes(qDes)) return false;
      return true;
    });
  });

  divisaForm: FormGroup = this.fb.group({
    curId:      [''],
    curCutId:   [''],
    curShodes:  [''],
    curLondes:  [''],
    curMinamn:  [null, [Validators.required, Validators.min(0), Validators.max(10000000)]],
    curTolrat:  [null],
    curFinezza: [''],
    curHostcod: [''],
    curModdat:  [''],
  });

  ngOnInit(): void {
    this.loadDivise();
  }

  private loadDivise(): void {
    this.diviseService.getAll({ curId: null, curLondes: null }).subscribe({
      next: data => this.divise.set(data),
      error: () => {}
    });
  }

  onCerca(): void {
    const request: IDivisaAnagraficaRequest = {
      curId: this.filterCodice().trim() || null,
      curLondes: this.filterDescrizione().trim() || null,
    };
    this.diviseService.getAll(request).subscribe({
      next: data => this.divise.set(data),
      error: () => {}
    });
  }

  onResetFiltri(): void {
    this.filterCodice.set('');
    this.filterDescrizione.set('');
  }

  openViewPopup(data: IDivisaAnagraficaResponse): void {
    this.selectedLabel.set(`${data.curId} — ${data.curShodes}`);
    this.divisaForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IDivisaAnagraficaResponse): void {
    this.selectedLabel.set(`${data.curId} — ${data.curShodes}`);
    this.divisaForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IDivisaAnagraficaResponse): void {
    switch (action) {
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
    }
  }

  onUpdate(): void {
    if (this.divisaForm.get('curMinamn')?.invalid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.divisaForm.getRawValue() as IDivisaAnagraficaResponse;
    const request: UpdateDivisaRequest = {
      curId:      val.curId,
      curCutId:   val.curCutId,
      curMinamn:  val.curMinamn,
      curFinezza: val.curFinezza ?? '',
      curTolrat:  val.curTolrat,
      traUser:    'SYSTEM',
      traStation: 'WEB',
    };
    this.diviseService.update(request).subscribe({
      next: (updated) => {
        this.divise.update(list => list.map(d =>
          d.curId === updated.curId && d.curCutId === updated.curCutId ? updated : d
        ));
        notify(`Divisa "${val.curId}" aggiornata con successo`, 'success', 3000);
        this.closePopup();
      },
      error: () => {
        notify('Errore durante l\'aggiornamento della divisa', 'error', 3000);
      }
    });
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.divisaForm.reset();
    this.selectedLabel.set('');
  }
}
