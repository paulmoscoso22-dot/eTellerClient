import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxSelectBoxModule, DxCheckBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface ITipoOperazione {
  optId: string;
  optDes: string;
  optHoscod: string;
  optAptId: string;
  optIscredit: string;
  optPrtdv: boolean;
  optAdvId: string;
}

@Component({
  selector: 'app-tipo-operazione',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxSelectBoxModule, DxCheckBoxModule
  ],
  templateUrl: './tipo-operazione.component.html',
  styleUrls: ['./tipo-operazione.component.css'],
})
export class TipoOperazioneComponent implements OnInit {
  private fb = inject(FormBuilder);

  private operazioni = signal<ITipoOperazione[]>([]);

  filterSearch = signal<string>('');

  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  readonly segnoOptions = [
    { id: '1',  des: '1  — Credito' },
    { id: '-1', des: '-1 — Debito'  },
  ];

  filteredOperazioni = computed(() => {
    const q = this.filterSearch().toLowerCase().trim();
    if (!q) return this.operazioni();
    return this.operazioni().filter(o =>
      o.optId.toLowerCase().includes(q) ||
      o.optDes.toLowerCase().includes(q) ||
      o.optHoscod.toLowerCase().includes(q)
    );
  });

  operazioneForm: FormGroup = this.fb.group({
    optId:      ['', [Validators.required, Validators.maxLength(5)]],
    optDes:     ['', [Validators.required, Validators.maxLength(50)]],
    optHoscod:  ['', [Validators.required, Validators.maxLength(25)]],
    optAptId:   ['', [Validators.required, Validators.maxLength(5)]],
    optIscredit:['1', Validators.required],
    optPrtdv:   [false],
    optAdvId:   [''],
  });

  ngOnInit(): void {
    // TODO: load from backend service
    this.operazioni.set([
      { optId: 'CAMBI', optDes: 'Cambio valuta', optHoscod: 'CAMBI', optAptId: 'ETL', optIscredit: '1',  optPrtdv: true,  optAdvId: 'FICHE_CAMBI' },
      { optId: 'PREVC', optDes: 'Prelievo contanti', optHoscod: 'PREVC', optAptId: 'ETL', optIscredit: '-1', optPrtdv: true,  optAdvId: 'FICHE_PREVC' },
      { optId: 'VERSC', optDes: 'Versamento contanti', optHoscod: 'VERSC', optAptId: 'ETL', optIscredit: '1',  optPrtdv: false, optAdvId: '' },
      { optId: 'TCHEQ', optDes: 'Traveler Cheque', optHoscod: 'TCHEQ', optAptId: 'ETL', optIscredit: '1',  optPrtdv: true,  optAdvId: 'FICHE_TCHEQ' },
      { optId: 'METPR', optDes: 'Metalli preziosi', optHoscod: 'METPR', optAptId: 'ETL', optIscredit: '-1', optPrtdv: false, optAdvId: '' },
    ]);
  }

  onSearchChanged(e: { value?: string }): void {
    this.filterSearch.set(e.value ?? '');
  }

  openViewPopup(data: ITipoOperazione): void {
    this.selectedLabel.set(data.optId);
    this.operazioneForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: ITipoOperazione): void {
    this.selectedLabel.set(data.optId);
    this.operazioneForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  openNewPopup(): void {
    this.operazioneForm.reset({ optIscredit: '1', optPrtdv: false });
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: ITipoOperazione): void {
    switch (action) {
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
    }
  }

  onSubmit(): void {
    if (!this.operazioneForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.operazioneForm.getRawValue() as ITipoOperazione;
    const exists = this.operazioni().some(o => o.optId === val.optId);
    if (exists) {
      notify(`Il codice "${val.optId}" esiste già`, 'error', 3000);
      return;
    }
    // TODO: call backend insert
    this.operazioni.update(list => [...list, val]);
    notify(`Tipo operazione "${val.optId}" aggiunto con successo`, 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.operazioneForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.operazioneForm.getRawValue() as ITipoOperazione;
    // TODO: call backend update
    this.operazioni.update(list => list.map(o =>
      o.optId === val.optId ? { ...o, ...val } : o
    ));
    notify(`Tipo operazione "${val.optId}" aggiornato con successo`, 'success', 3000);
    this.closePopup();
  }

  onTrace(): void {
    const id = this.operazioneForm.get('optId')?.value;
    notify(`Storico: ST_OPERATIONTYPE_${id}`, 'info', 3000);
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.operazioneForm.reset({ optIscredit: '1', optPrtdv: false });
    this.selectedLabel.set('');
  }
}
