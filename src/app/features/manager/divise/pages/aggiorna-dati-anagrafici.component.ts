import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface IDivisaAnagrafica {
  curId: string;
  curCutId: string;
  curShodes: string;
  curLondes: string;
  curMinamn: number;
  curTolrat: number;
  curFinezza: string;
  curModdat: string | null;
}

@Component({
  selector: 'app-aggiorna-dati-anagrafici',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
  ],
  templateUrl: './aggiorna-dati-anagrafici.component.html',
  styleUrls: ['./aggiorna-dati-anagrafici.component.css'],
})
export class AggiornaDAtiAnagraficiComponent implements OnInit {
  private fb = inject(FormBuilder);

  private divise = signal<IDivisaAnagrafica[]>([]);

  filterCodice      = signal<string>('');
  filterDescrizione = signal<string>('');

  popupMode = signal<'view' | 'edit'>('view');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  readonly tipoOptions = [
    { id: 'BB', des: 'Biglietti Banca' },
    { id: 'MM', des: 'Monete e Metalli' },
    { id: 'TR', des: 'Travelers Cheques' },
  ];

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
    curTolrat:  [null, [Validators.required, Validators.min(0), Validators.max(1000000)]],
    curFinezza: [''],
    curModdat:  [''],
  });

  ngOnInit(): void {
    // TODO: load from backend service
    this.divise.set([
      {
        curId: 'EUR', curCutId: 'BB', curShodes: 'EUR/BB',
        curLondes: 'Euro Biglietti Banca',
        curMinamn: 1, curTolrat: 0.5, curFinezza: '',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        curId: 'EUR', curCutId: 'MM', curShodes: 'EUR/MM',
        curLondes: 'Euro Monete e Metalli',
        curMinamn: 1, curTolrat: 1.0, curFinezza: '999',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        curId: 'USD', curCutId: 'BB', curShodes: 'USD/BB',
        curLondes: 'Dollaro USA Biglietti Banca',
        curMinamn: 1, curTolrat: 0.75, curFinezza: '',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        curId: 'GBP', curCutId: 'BB', curShodes: 'GBP/BB',
        curLondes: 'Sterlina Britannica Biglietti Banca',
        curMinamn: 1, curTolrat: 0.5, curFinezza: '',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        curId: 'CHF', curCutId: 'BB', curShodes: 'CHF/BB',
        curLondes: 'Franco Svizzero Biglietti Banca',
        curMinamn: 1, curTolrat: 0.5, curFinezza: '',
        curModdat: '2024-01-15 09:00:00'
      },
      {
        curId: 'XAU', curCutId: 'MM', curShodes: 'XAU/MM',
        curLondes: 'Oro - Metallo Prezioso',
        curMinamn: 1, curTolrat: 2.0, curFinezza: '999.9',
        curModdat: '2024-01-15 09:00:00'
      },
    ]);
  }

  onCerca(): void {
    notify('Ricerca applicata', 'info', 1500);
  }

  onResetFiltri(): void {
    this.filterCodice.set('');
    this.filterDescrizione.set('');
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
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
    }
  }

  onUpdate(): void {
    if (this.divisaForm.get('curMinamn')?.invalid ||
        this.divisaForm.get('curTolrat')?.invalid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.divisaForm.getRawValue() as IDivisaAnagrafica;
    // TODO: call backend update
    this.divise.update(list => list.map(d =>
      d.curId === val.curId && d.curCutId === val.curCutId
        ? { ...d, curMinamn: val.curMinamn, curTolrat: val.curTolrat, curFinezza: val.curFinezza, curModdat: new Date().toISOString() }
        : d
    ));
    notify(`Divisa "${val.curId}" aggiornata con successo`, 'success', 3000);
    this.closePopup();
  }

  onTrace(): void {
    const val = this.divisaForm.getRawValue();
    notify(`Storico: CURRENCY_${val.curId}_${val.curCutId}`, 'info', 3000);
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.divisaForm.reset();
    this.selectedLabel.set('');
  }
}
