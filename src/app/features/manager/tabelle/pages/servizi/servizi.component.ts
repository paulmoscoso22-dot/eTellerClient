import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule,
  DxPopupModule, DxTextAreaModule, DxValidatorModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface IServizio {
  serId: string;
  serDes: string;
  serRunning: boolean;
  serTrace: boolean;
  serEmail: boolean;
  serEnable: boolean;
  serLastRun: string | null;
  serDeserr: string;
  serSyserrmail: string;
  serApperrmail: string;
}

@Component({
  selector: 'app-servizi',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxCheckBoxModule,
    DxButtonModule, DxPopupModule, DxTextAreaModule, DxValidatorModule
  ],
  templateUrl: './servizi.component.html',
  styleUrls: ['./servizi.component.css'],
})
export class ServiziComponent implements OnInit {
  private fb = inject(FormBuilder);

  private servizi = signal<IServizio[]>([]);
  searchValue = signal<string>('');
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedSerId = signal<string | null>(null);

  filteredServizi = computed(() => {
    const q = this.searchValue().toLowerCase().trim();
    const all = this.servizi();
    if (!q) return all;
    return all.filter(s =>
      s.serId.toLowerCase().includes(q) || s.serDes.toLowerCase().includes(q)
    );
  });

  serviziForm: FormGroup = this.fb.group({
    serId: ['', Validators.required],
    serDes: [''],
    serDeserr: [''],
    serSyserrmail: [''],
    serApperrmail: [''],
    serEmail: [false],
    serEnable: [true],
    serTrace: [false],
  });

  ngOnInit(): void {
    // TODO: load from backend service
    this.servizi.set([
      {
        serId: 'SRV001', serDes: 'Servizio di reportistica',
        serRunning: false, serTrace: true, serEmail: true, serEnable: true,
        serLastRun: '2024-01-15 08:30', serDeserr: '',
        serSyserrmail: 'sys@sempione.ch', serApperrmail: 'app@sempione.ch'
      },
      {
        serId: 'SRV002', serDes: 'Aggiornamento tassi di cambio',
        serRunning: true, serTrace: false, serEmail: false, serEnable: true,
        serLastRun: '2024-01-15 09:00', serDeserr: '',
        serSyserrmail: '', serApperrmail: ''
      }
    ]);
  }

  openNewPopup(): void {
    this.serviziForm.reset({ serEmail: false, serEnable: true, serTrace: false });
    this.selectedSerId.set(null);
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  openViewPopup(data: IServizio): void {
    this.selectedSerId.set(data.serId);
    this.serviziForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IServizio): void {
    this.selectedSerId.set(data.serId);
    this.serviziForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IServizio): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.onDelete(data);      break;
    }
  }

  onDelete(data: IServizio): void {
    // TODO: call backend delete
    this.servizi.update(list => list.filter(s => s.serId !== data.serId));
    notify(`Servizio "${data.serId}" eliminato`, 'success', 3000);
  }

  onSubmit(): void {
    if (!this.serviziForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.serviziForm.getRawValue();
    const newServizio: IServizio = { ...val, serRunning: false, serLastRun: null };
    // TODO: call backend insert
    this.servizi.update(list => [...list, newServizio]);
    notify('Servizio creato con successo', 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.serviziForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.serviziForm.getRawValue();
    // TODO: call backend update
    this.servizi.update(list =>
      list.map(s => s.serId === val.serId ? { ...s, ...val } : s)
    );
    notify('Servizio aggiornato con successo', 'success', 3000);
    this.closePopup();
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.serviziForm.reset({ serEmail: false, serEnable: true, serTrace: false });
    this.selectedSerId.set(null);
  }

  onSearchChanged(e: any): void {
    this.searchValue.set(e.value ?? '');
  }
}
