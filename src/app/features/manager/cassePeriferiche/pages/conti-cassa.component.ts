import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxSelectBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

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
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxSelectBoxModule
  ],
  templateUrl: './conti-cassa.component.html',
  styleUrls: ['./conti-cassa.component.css'],
})
export class ContiCassaComponent implements OnInit {
  private fb = inject(FormBuilder);

  private conti = signal<IContoCassa[]>([]);
  private nextId = 5;

  filterCassa  = signal<string>('');
  filterActId  = signal<string>('');
  filterBraId  = signal<string>('');
  filterCurId  = signal<string>('');
  filterAccId  = signal<string>('');
  filterCutId  = signal<string>('');
  filterDes    = signal<string>('');

  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  readonly cassaList = [
    { cliId: 'A01', cliDes: 'Cassa principale sede' },
    { cliId: 'A02', cliDes: 'Cassa secondaria sede' },
    { cliId: 'B01', cliDes: 'Cassa Lugano 1' },
    { cliId: 'C01', cliDes: 'Cassa Zurigo 1' },
  ];

  readonly cassaFilterList = [
    { cliId: '', cliDes: 'Tutte le casse' },
    ...this.cassaList,
  ];

  readonly branchesList = [
    { braId: '001', braDes: 'Sede Principale' },
    { braId: '002', braDes: 'Filiale Lugano' },
    { braId: '003', braDes: 'Filiale Zurigo' },
  ];

  readonly brancheFilterList = [
    { braId: '', braDes: 'Tutte le località' },
    ...this.branchesList,
  ];

  readonly actList = [
    { actId: 'CC', actDes: 'Conto Corrente' },
    { actId: 'GN', actDes: 'Conto Generale' },
    { actId: 'FX', actDes: 'Conto Forex' },
  ];

  readonly actFilterList = [
    { actId: '', actDes: 'Tutti i generi' },
    ...this.actList,
  ];

  readonly divisaList = [
    { curId: 'CHF', curLondes: 'Franco Svizzero (CHF)' },
    { curId: 'EUR', curLondes: 'Euro (EUR)' },
    { curId: 'USD', curLondes: 'Dollaro USA (USD)' },
    { curId: 'GBP', curLondes: 'Sterlina (GBP)' },
  ];

  readonly divisaFilterList = [
    { curId: '', curLondes: 'Tutte le divise' },
    ...this.divisaList,
  ];

  readonly divisaFormList = [
    { curId: '', curLondes: '— Qualsiasi divisa —' },
    ...this.divisaList,
  ];

  readonly gruppoList = [
    { cutId: 'STD', cutDes: 'Standard' },
    { cutId: 'CAM', cutDes: 'Cambi' },
    { cutId: 'MET', cutDes: 'Metalli' },
  ];

  readonly gruppoFilterList = [
    { cutId: '', cutDes: 'Tutti i gruppi' },
    ...this.gruppoList,
  ];

  private readonly cassaToBra: Record<string, string> = {
    A01: '001', A02: '001', B01: '002', C01: '003',
  };

  filteredConti = computed(() => {
    return this.conti().filter(c => {
      if (this.filterCassa() && c.iacCliCassa !== this.filterCassa()) return false;
      if (this.filterActId() && c.iacActId    !== this.filterActId()) return false;
      if (this.filterBraId() && c.iacBraId    !== this.filterBraId()) return false;
      if (this.filterCurId() && c.iacCurId    !== this.filterCurId()) return false;
      if (this.filterCutId() && c.iacCutId    !== this.filterCutId()) return false;
      if (this.filterAccId()) {
        if (!c.iacAccId.toLowerCase().includes(this.filterAccId().toLowerCase())) return false;
      }
      if (this.filterDes()) {
        if (!c.iacDes.toLowerCase().includes(this.filterDes().toLowerCase())) return false;
      }
      return true;
    });
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

  getCassaDes(cliId: string): string {
    return this.cassaList.find(c => c.cliId === cliId)?.cliDes ?? cliId;
  }

  getBraDes(braId: string): string {
    return this.branchesList.find(b => b.braId === braId)?.braDes ?? braId;
  }

  getActDes(actId: string): string {
    return this.actList.find(a => a.actId === actId)?.actDes ?? actId;
  }

  getCurDes(curId: string): string {
    if (!curId) return '—';
    return this.divisaList.find(d => d.curId === curId)?.curLondes ?? curId;
  }

  onCassaFormChanged(e: { value?: string | null }): void {
    const braId = this.cassaToBra[e.value ?? ''] ?? '';
    this.contoForm.patchValue({ iacBraId: braId });
  }

  onFilterCassaChanged(e: { value?: string | null }):  void { this.filterCassa.set(e.value  ?? ''); }
  onFilterActChanged(e: { value?: string | null }):    void { this.filterActId.set(e.value   ?? ''); }
  onFilterBraChanged(e: { value?: string | null }):    void { this.filterBraId.set(e.value   ?? ''); }
  onFilterCurChanged(e: { value?: string | null }):    void { this.filterCurId.set(e.value   ?? ''); }
  onFilterCutChanged(e: { value?: string | null }):    void { this.filterCutId.set(e.value   ?? ''); }
  onFilterAccIdChanged(e: { value?: string }):         void { this.filterAccId.set(e.value   ?? ''); }
  onFilterDesChanged(e: { value?: string }):           void { this.filterDes.set(e.value     ?? ''); }

  resetFilters(): void {
    this.filterCassa.set('');
    this.filterActId.set('');
    this.filterBraId.set('');
    this.filterCurId.set('');
    this.filterAccId.set('');
    this.filterCutId.set('');
    this.filterDes.set('');
  }

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
      c.iacActId    === val.iacActId    &&
      c.iacCutId    === val.iacCutId    &&
      c.iacCurId    === val.iacCurId    &&
      c.iacCliCassa === val.iacCliCassa
    );
  }

  onSubmit(): void {
    if (!this.contoForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.contoForm.getRawValue();
    if (this.isDuplicate(val)) {
      notify('Esiste già un conto con la stessa combinazione Tipo / Gruppo / Divisa / Cassa', 'error', 4000);
      return;
    }
    const newConto: IContoCassa = {
      ...val,
      iacId: this.nextId++,
      iacBraId: this.cassaToBra[val.iacCliCassa] ?? '',
    };
    // TODO: call backend insert
    this.conti.update(list => [...list, newConto]);
    notify(`Conto "${val.iacAccId}" aggiunto con successo`, 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.contoForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
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
    notify(`Storico: ACCOUNT_${id}`, 'info', 3000);
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.contoForm.reset();
    this.selectedLabel.set('');
  }
}
