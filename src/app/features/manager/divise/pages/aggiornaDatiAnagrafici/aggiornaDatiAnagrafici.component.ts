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
import { DiviseService } from '../../services/divise.service';
import { Router } from '@angular/router';
import { IDivisaAnagrafica, UpdateDivisaRequest } from '../../models/divisa.models';
import { UserService } from '../../../../../services/user.service';
import { Service } from '../../../../../core/services/service';
import { ICurrencyType } from '../../../../../core/domain/currencyType.domain';

export type { IDivisaAnagrafica } from '../../models/divisa.models';

@Component({
  selector: 'app-aggiorna-dati-anagrafici',
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
  templateUrl: './aggiornaDatiAnagrafici.component.html',
  styleUrls: ['./aggiornaDatiAnagrafici.component.css'],
})
export class AggiornaDAtiAnagraficiComponent implements OnInit {
  private fb = inject(FormBuilder);
  private diviseService = inject(DiviseService);
  private router = inject(Router);
  private coreService = inject(Service);

  @ViewChild(SempioneDataGridComponent) private dataGrid?: SempioneDataGridComponent;

  private currencyTypes = signal<ICurrencyType[]>([]);

  readonly gridColumns = computed<SempioneGridColumn[]>(() => {
    const tipoHF = this.currencyTypes().map(t => ({ text: t.cutDes, value: t.cutId }));
    return [
      { dataField: 'curId',      caption: 'Divisa',         type: 'currency',  width: 100, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curCutId',   caption: 'Tipo',            type: 'tipo-pill', width: 90,  allowHeaderFiltering: true, allowFiltering: false, headerFilterDataSource: tipoHF },
      { dataField: 'curShodes',  caption: 'Des. Abbreviata', alignment: 'left', width: 140, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curLondes',  caption: 'Descrizione',     alignment: 'left',             allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curMinamn',  caption: 'Taglio min.',     alignment: 'right', width: 110, dataType: 'number', format: '#,##0.##',   allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curTolrat',  caption: 'Tolleranza %',    alignment: 'right', width: 110, dataType: 'number', format: '#,##0.0000', allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curFinezza', caption: 'Finezza',         alignment: 'center', width: 90, allowHeaderFiltering: true, allowFiltering: false },
      { dataField: 'curModdat',  caption: 'Data modifica',   alignment: 'left',  width: 140, allowHeaderFiltering: true, allowFiltering: false },
    ];
  });

  divise = signal<IDivisaAnagrafica[]>([]);

  popupMode = signal<'view' | 'edit'>('view');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');
  isLoading = signal<boolean>(false);


  divisaForm: FormGroup = this.fb.group({
    curId:      [''],
    curCutId:   [''],
    curShodes:  [''],
    curLondes:  [''],
    curMinamn:  [null, [Validators.required, Validators.min(0), Validators.max(10000000)]],
    curTolrat:  [null, [Validators.required, Validators.min(0), Validators.max(1000000)]],
    curFinezza: [''],
    curModdat:  [''],
  });

  ngOnInit(): void {
    this.coreService.getCurrencyTypes().subscribe({ next: data => this.currencyTypes.set(data ?? []) });
    this.loadDivise();
  }

  private loadDivise(): void {
    this.isLoading.set(true);
    this.diviseService.getAll().subscribe({
      next: (data) => {
        this.divise.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento divise:', err);
        notify('Errore nel caricamento delle divise', 'error', 3000);
        this.isLoading.set(false);
      }
    });
  }

  clearGridFilters(): void {
    this.dataGrid?.clearFilters();
  }

  openViewPopup(data: IDivisaAnagrafica): void {
    this.selectedLabel.set(`${data.curId} — ${data.curShodes}`);
    this.divisaForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IDivisaAnagrafica): void {
    this.selectedLabel.set(`${data.curId} — ${data.curShodes}`);
    this.divisaForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IDivisaAnagrafica): void {
    switch (action) {
      case 'view':  this.openViewPopup(data); break;
      case 'edit':  this.openEditPopup(data); break;
      case 'trace': this.router.navigate(['/trace'], {
        queryParams: { traTabNam: 'CURRENCY', traEntCode: `${data.curId}_${data.curCutId}` }
      }); break;
    }
  }

  onUpdate(): void {
    if (this.divisaForm.get('curMinamn')?.invalid ||
        this.divisaForm.get('curTolrat')?.invalid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.divisaForm.getRawValue() as IDivisaAnagrafica;

    const request: UpdateDivisaRequest = {
      curId:      val.curId,
      curCutId:   val.curCutId,
      curMinamn:  val.curMinamn,
      curFinezza: val.curFinezza ?? '',
      curTolrat:  val.curTolrat,
      traUser:    'SYSTEM',
      traStation: 'WEB'
    };

    this.isLoading.set(true);
    this.diviseService.update(request).subscribe({
      next: (updated) => {
        this.divise.update(list => list.map(d =>
          d.curId === updated.curId && d.curCutId === updated.curCutId ? updated : d
        ));
        notify(`Divisa "${val.curId}" aggiornata con successo`, 'success', 3000);
        this.isLoading.set(false);
        this.closePopup();
      },
      error: (err) => {
        console.error('Errore aggiornamento divisa:', err);
        notify('Errore durante l\'aggiornamento della divisa', 'error', 3000);
        this.isLoading.set(false);
      }
    });
  }

  onTrace(): void {
    const val = this.divisaForm.getRawValue();
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'CURRENCY', traEntCode: `${val.curId}_${val.curCutId}` }
    });
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.divisaForm.reset();
    this.selectedLabel.set('');
  }
}
