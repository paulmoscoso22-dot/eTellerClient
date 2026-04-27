import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface ICoppiaDivise {
  cucCur1: string;
  cucCur2: string;
  cucLondes: string;
  cucShodes: string;
  cucSize: number;
}

@Component({
  selector: 'app-coppie-divise',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
  ],
  templateUrl: './coppie-divise.component.html',
  styleUrls: ['./coppie-divise.component.css'],
})
export class CoppieDiviseComponent implements OnInit {
  private fb = inject(FormBuilder);

  private coppie = signal<ICoppiaDivise[]>([]);
  searchValue = signal<string>('');
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  readonly currencies = [
    'CHF', 'EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD',
    'SEK', 'NOK', 'DKK', 'SGD', 'HKD', 'CNY', 'PLN', 'CZK'
  ];

  readonly taglioOptions = [1, 100];

  filteredCoppie = computed(() => {
    const q = this.searchValue().toLowerCase().trim();
    const all = this.coppie();
    if (!q) return all;
    return all.filter(c =>
      c.cucCur1.toLowerCase().includes(q) ||
      c.cucCur2.toLowerCase().includes(q) ||
      c.cucLondes.toLowerCase().includes(q) ||
      c.cucShodes.toLowerCase().includes(q)
    );
  });

  coppiaForm: FormGroup = this.fb.group({
    cucCur1:   ['', Validators.required],
    cucCur2:   ['', Validators.required],
    cucLondes: ['', Validators.required],
    cucShodes: ['', Validators.required],
    cucSize:   [1,  Validators.required],
  });

  ngOnInit(): void {
    // TODO: load from backend service
    this.coppie.set([
      { cucCur1: 'CHF', cucCur2: 'EUR', cucLondes: 'Franco Svizzero / Euro',           cucShodes: 'CHF/EUR', cucSize: 1   },
      { cucCur1: 'CHF', cucCur2: 'USD', cucLondes: 'Franco Svizzero / Dollaro USA',    cucShodes: 'CHF/USD', cucSize: 1   },
      { cucCur1: 'CHF', cucCur2: 'GBP', cucLondes: 'Franco Svizzero / Sterlina',       cucShodes: 'CHF/GBP', cucSize: 1   },
      { cucCur1: 'EUR', cucCur2: 'USD', cucLondes: 'Euro / Dollaro USA',               cucShodes: 'EUR/USD', cucSize: 1   },
      { cucCur1: 'CHF', cucCur2: 'JPY', cucLondes: 'Franco Svizzero / Yen Giapponese', cucShodes: 'CHF/JPY', cucSize: 100 },
    ]);
  }

  openNewPopup(): void {
    this.coppiaForm.reset({ cucSize: 1 });
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  openViewPopup(data: ICoppiaDivise): void {
    this.selectedLabel.set(`${data.cucCur1} / ${data.cucCur2}`);
    this.coppiaForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: ICoppiaDivise): void {
    this.selectedLabel.set(`${data.cucCur1} / ${data.cucCur2}`);
    this.coppiaForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: ICoppiaDivise): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.onDelete(data);      break;
    }
  }

  onDelete(data: ICoppiaDivise): void {
    // TODO: call backend delete
    this.coppie.update(list =>
      list.filter(c => !(c.cucCur1 === data.cucCur1 && c.cucCur2 === data.cucCur2))
    );
    notify(`Coppia "${data.cucCur1}/${data.cucCur2}" eliminata`, 'success', 3000);
  }

  onSubmit(): void {
    if (!this.coppiaForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.coppiaForm.getRawValue() as ICoppiaDivise;
    const exists = this.coppie().some(
      c => c.cucCur1 === val.cucCur1 && c.cucCur2 === val.cucCur2
    );
    if (exists) {
      notify('La coppia di divise esiste già', 'error', 3000);
      return;
    }
    // TODO: call backend insert
    this.coppie.update(list => [...list, val]);
    notify('Coppia creata con successo', 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.coppiaForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.coppiaForm.getRawValue() as ICoppiaDivise;
    // TODO: call backend update
    this.coppie.update(list =>
      list.map(c =>
        c.cucCur1 === val.cucCur1 && c.cucCur2 === val.cucCur2 ? { ...c, ...val } : c
      )
    );
    notify('Coppia aggiornata con successo', 'success', 3000);
    this.closePopup();
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.coppiaForm.reset({ cucSize: 1 });
    this.selectedLabel.set('');
  }

  onSearchChanged(e: any): void {
    this.searchValue.set(e.value ?? '');
  }
}
