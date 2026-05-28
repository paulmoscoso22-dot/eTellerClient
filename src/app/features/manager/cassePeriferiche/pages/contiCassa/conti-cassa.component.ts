import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxTextBoxModule, DxValidatorModule, DxSelectBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import {
  SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneSearchModeComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,
} from '../../../../../components/General';

export interface IContoCassa {
  iacId: number;
  iacAccId: string;
  iacActId: string;
  iacCutId: string;
  iacCurId: string;
  iacCliCassa: string;
  iacBraId: string;
  iacHostPrefix: string;
  iacDes: string;
}

@Component({
  selector: 'app-conti-cassa',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxValidatorModule, DxSelectBoxModule,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneSearchModeComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
  ],
  templateUrl: './conti-cassa.component.html',
  styleUrls: ['./conti-cassa.component.css'],
})
export class ContiCassaComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  @ViewChild(SempioneDataGridComponent) private dataGrid?: SempioneDataGridComponent;

  private conti = signal<IContoCassa[]>([]);
  private nextId = 5;

  isLoading = signal(false);
  error     = signal<string | null>(null);

  popupMode            = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel        = signal<string>('');

  readonly cassaList = [
    { cliId: 'A01', cliDes: 'Cassa principale sede' },
    { cliId: 'A02', cliDes: 'Cassa secondaria sede' },
    { cliId: 'B01', cliDes: 'Cassa Lugano 1'        },
    { cliId: 'C01', cliDes: 'Cassa Zurigo 1'        },
  ];

  readonly cassaFilterList = [{ cliId: '', cliDes: 'Tutte le casse' }, ...this.cassaList];

  readonly branchesList = [
    { braId: '001', braDes: 'Sede Principale' },
    { braId: '002', braDes: 'Filiale Lugano'  },
    { braId: '003', braDes: 'Filiale Zurigo'  },
  ];

  readonly brancheFilterList = [{ braId: '', braDes: 'Tutte le località' }, ...this.branchesList];

  readonly actList = [
    { actId: 'CC', actDes: 'Conto Corrente' },
    { actId: 'GN', actDes: 'Conto Generale' },
    { actId: 'FX', actDes: 'Conto Forex'    },
  ];

  readonly actFilterList = [{ actId: '', actDes: 'Tutti i generi' }, ...this.actList];

  readonly divisaList = [
    { curId: 'CHF', curLondes: 'Franco Svizzero (CHF)' },
    { curId: 'EUR', curLondes: 'Euro (EUR)'             },
    { curId: 'USD', curLondes: 'Dollaro USA (USD)'      },
    { curId: 'GBP', curLondes: 'Sterlina (GBP)'         },
  ];

  readonly divisaFilterList = [{ curId: '', curLondes: 'Tutte le divise' }, ...this.divisaList];
  readonly divisaFormList   = [{ curId: '', curLondes: '— Qualsiasi divisa —' }, ...this.divisaList];

  readonly gruppoList = [
    { cutId: 'STD', cutDes: 'Standard' },
    { cutId: 'CAM', cutDes: 'Cambi'    },
    { cutId: 'MET', cutDes: 'Metalli'  },
  ];

  readonly gruppoFilterList = [{ cutId: '', cutDes: 'Tutti i gruppi' }, ...this.gruppoList];

  private readonly cassaToBra: Record<string, string> = {
    A01: '001', A02: '001', B01: '002', C01: '003',
  };

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'iacHostPrefix', caption: 'Cod. Conto',  alignment: 'left',   width: 100, allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'actDes',        caption: 'Tipo',         alignment: 'center', width: 130, allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'iacCutId',      caption: 'Gruppo',       alignment: 'center', width: 80,  allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'iacCurId',      caption: 'Divisa',       alignment: 'center', width: 80,  allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'iacAccId',      caption: 'Numero Conto', alignment: 'left',   width: 130, allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'iacDes',        caption: 'Descrizione',  alignment: 'left',               allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'cassaDes',      caption: 'Cassa',        alignment: 'center', width: 120, allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'braDes',        caption: 'Località',     alignment: 'left',   width: 150, allowFiltering: false, allowHeaderFiltering: true },
  ];

  gridData = computed(() =>
    this.conti().map(c => ({
      ...c,
      actDes:   this.getActDes(c.iacActId),
      cassaDes: this.getCassaDes(c.iacCliCassa),
      braDes:   this.getBraDes(c.iacBraId),
    }))
  );

  popupTitle = computed(() => {
    if (this.popupMode() === 'edit') return 'Modifica Conto Cassa — ' + this.selectedLabel();
    if (this.popupMode() === 'view') return 'Dettaglio Conto Cassa — ' + this.selectedLabel();
    return 'Nuovo Conto Cassa';
  });

  contoForm: FormGroup = this.fb.group({
    iacId:         [0],
    iacAccId:      ['', [Validators.required, Validators.maxLength(50)]],
    iacHostPrefix: ['', [Validators.required, Validators.maxLength(25)]],
    iacDes:        ['', [Validators.required, Validators.maxLength(50)]],
    iacActId:      ['', Validators.required],
    iacCutId:      ['', Validators.required],
    iacCurId:      [''],
    iacCliCassa:   ['', Validators.required],
    iacBraId:      [''],
  });

  ngOnInit(): void {
    this.conti.set([
      { iacId: 1, iacAccId: '10001234', iacActId: 'CC', iacCutId: 'STD', iacCurId: 'CHF', iacCliCassa: 'A01', iacBraId: '001', iacHostPrefix: '10', iacDes: 'Conto corrente principale CHF' },
      { iacId: 2, iacAccId: '10001235', iacActId: 'CC', iacCutId: 'CAM', iacCurId: 'EUR', iacCliCassa: 'A01', iacBraId: '001', iacHostPrefix: '10', iacDes: 'Conto corrente EUR sede' },
      { iacId: 3, iacAccId: '95000001', iacActId: 'GN', iacCutId: 'STD', iacCurId: '',    iacCliCassa: 'A02', iacBraId: '001', iacHostPrefix: '95', iacDes: 'Conto generale tutte divise' },
      { iacId: 4, iacAccId: '10002001', iacActId: 'FX', iacCutId: 'CAM', iacCurId: 'USD', iacCliCassa: 'B01', iacBraId: '002', iacHostPrefix: '10', iacDes: 'Conto forex Lugano USD' },
    ]);
  }

  getCassaDes(cliId: string): string { return this.cassaList.find(c => c.cliId === cliId)?.cliDes ?? cliId; }
  getBraDes(braId: string): string   { return this.branchesList.find(b => b.braId === braId)?.braDes ?? braId; }
  getActDes(actId: string): string   { return this.actList.find(a => a.actId === actId)?.actDes ?? actId; }

  onCassaFormChanged(e: { value?: string | null }): void {
    const braId = this.cassaToBra[e.value ?? ''] ?? '';
    this.contoForm.patchValue({ iacBraId: braId });
  }

  clearGridFilters(): void { this.dataGrid?.clearFilters(); }

  openViewPopup(data: IContoCassa): void {
    this.selectedLabel.set(data.iacAccId);
    this.contoForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IContoCassa): void {
    this.selectedLabel.set(data.iacAccId);
    this.contoForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  openNewPopup(): void {
    this.contoForm.reset({ iacId: 0, iacCurId: '' });
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IContoCassa): void {
    switch (action) {
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
    }
  }

  private isDuplicate(val: any, excludeId?: number): boolean {
    return this.conti().some(c =>
      (excludeId === undefined || c.iacId !== excludeId) &&
      c.iacActId === val.iacActId && c.iacCutId === val.iacCutId &&
      c.iacCurId === val.iacCurId && c.iacCliCassa === val.iacCliCassa
    );
  }

  onSubmit(): void {
    if (!this.contoForm.valid) { notify('Compilare tutti i campi obbligatori', 'error', 3000); return; }
    const val = this.contoForm.getRawValue();
    if (this.isDuplicate(val)) { notify('Esiste già un conto con la stessa combinazione Tipo / Gruppo / Divisa / Cassa', 'error', 4000); return; }
    const newConto: IContoCassa = { ...val, iacId: this.nextId++, iacBraId: this.cassaToBra[val.iacCliCassa] ?? '' };
    // TODO: call backend insert
    this.conti.update(list => [...list, newConto]);
    notify(`Conto "${val.iacAccId}" aggiunto con successo`, 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.contoForm.valid) { notify('Compilare tutti i campi obbligatori', 'error', 3000); return; }
    const val = this.contoForm.getRawValue();
    // TODO: call backend update
    this.conti.update(list => list.map(c =>
      c.iacId === val.iacId
        ? { ...c, ...val, iacBraId: this.cassaToBra[val.iacCliCassa] ?? c.iacBraId }
        : c
    ));
    notify(`Conto "${val.iacAccId}" aggiornato con successo`, 'success', 3000);
    this.closePopup();
  }

  onTrace(): void {
    const id = this.contoForm.get('iacId')?.value;
    this.router.navigate(['/trace'], { queryParams: { traTabNam: 'ACCOUNT', traEntCode: String(id) } });
  }

  onRowTrace(data: IContoCassa): void {
    this.router.navigate(['/trace'], { queryParams: { traTabNam: 'ACCOUNT', traEntCode: String(data.iacId) } });
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.contoForm.reset();
    this.selectedLabel.set('');
  }
}
