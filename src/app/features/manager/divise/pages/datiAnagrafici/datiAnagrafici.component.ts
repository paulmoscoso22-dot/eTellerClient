import { Component, OnInit, inject, signal, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule, DxValidatorModule, DxNumberBoxModule } from 'devextreme-angular';
import {
  SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneSearchModeComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,
} from '../../../../../components/General';
import notify from 'devextreme/ui/notify';
import { IDivisaAnagraficaResponse, IDivisaAnagraficaRequest, UpdateDivisaRequest } from '../../models/divisa.models';
import { DiviseService } from '../../services/divise.service';
import { Service } from '../../../../../core/services/service';
import { ICurrencyType } from '../../../../../core/domain/currencyType.domain';

@Component({
  selector: 'app-dati-anagrafici',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxValidatorModule, DxNumberBoxModule,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneSearchModeComponent,
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
  private coreService = inject(Service);

  @ViewChild(SempioneDataGridComponent) private dataGrid?: SempioneDataGridComponent;

  private currencyTypes = signal<ICurrencyType[]>([]);

  readonly gridColumns = computed<SempioneGridColumn[]>(() => {
    const tipoHF = this.currencyTypes().map(t => ({ text: t.cutDes, value: t.cutId }));
    return [
      { dataField: 'curId',      caption: 'ID',           type: 'currency',  width: 100, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curCutId',   caption: 'Genere',        type: 'tipo-pill', width: 90,  allowHeaderFiltering: true, allowFiltering: false, headerFilterDataSource: tipoHF },
      { dataField: 'curShodes',  caption: 'Descrizione',   alignment: 'left',             allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curMinamn',  caption: 'Imp. Minimo',   alignment: 'right', width: 120, dataType: 'number', format: '#,##0.##', allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curModdat',  caption: 'Data modifica', alignment: 'left',  width: 150, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curHostcod', caption: 'Host code',     alignment: 'left',  width: 120, allowHeaderFiltering: true, allowFiltering: false },
    ];
  });

  divise = signal<IDivisaAnagraficaResponse[]>([]);

  popupMode = signal<'view' | 'edit'>('view');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

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
    this.coreService.getCurrencyTypes().subscribe({ next: data => this.currencyTypes.set(data ?? []) });
    this.loadDivise();
  }

  private loadDivise(): void {
    this.diviseService.getAll({ curId: null, curLondes: null }).subscribe({
      next: data => this.divise.set(data),
      error: () => {}
    });
  }

  clearGridFilters(): void {
    this.dataGrid?.clearFilters();
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
