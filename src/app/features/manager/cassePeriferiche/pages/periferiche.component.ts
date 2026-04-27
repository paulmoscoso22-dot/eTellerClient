import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxSelectBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface IPeriferica {
  devId: number;
  devName: string;
  devType: string;
  devIoAddress: string;
  devBraId: string;
  inUso: boolean;
  cassaIds: string[];
}

@Component({
  selector: 'app-periferiche',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxSelectBoxModule
  ],
  templateUrl: './periferiche.component.html',
  styleUrls: ['./periferiche.component.css'],
})
export class PerifericheComponent implements OnInit {
  private fb = inject(FormBuilder);

  private devices = signal<IPeriferica[]>([]);
  private nextId = 6;

  filterSearch = signal<string>('');

  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');
  selectedDevice = signal<IPeriferica | null>(null);

  readonly tipoList = [
    { dtyId: 'PRN', dtyDes: 'Stampante ricevute' },
    { dtyId: 'SCN', dtyDes: 'Scanner documenti' },
    { dtyId: 'BCR', dtyDes: 'Lettore banconote' },
    { dtyId: 'MON', dtyDes: 'Monitor cliente' },
    { dtyId: 'PIN', dtyDes: 'Tastiera PIN' },
    { dtyId: 'SCD', dtyDes: 'Lettore smart card' },
    { dtyId: 'CAM', dtyDes: 'Webcam' },
  ];

  readonly branchesList = [
    { braId: '001', braDes: 'Sede Principale' },
    { braId: '002', braDes: 'Filiale Lugano' },
    { braId: '003', braDes: 'Filiale Zurigo' },
  ];

  readonly cassaLabels: Partial<Record<string, string>> = {
    A01: 'Cassa principale sede',
    A02: 'Cassa secondaria sede',
    B01: 'Cassa Lugano 1',
    C01: 'Cassa Zurigo 1',
  };

  // In edit mode: Tipo and Località are locked when device is already in use
  typeLocaLocked = computed(() =>
    this.popupMode() === 'view' ||
    (this.popupMode() === 'edit' && (this.selectedDevice()?.inUso ?? false))
  );

  filteredPeriferiche = computed(() => {
    const q = this.filterSearch().toLowerCase().trim();
    if (!q) return this.devices();
    return this.devices().filter(d =>
      d.devName.toLowerCase().includes(q) ||
      d.devType.toLowerCase().includes(q) ||
      d.devBraId.toLowerCase().includes(q) ||
      d.devIoAddress.toLowerCase().includes(q)
    );
  });

  deviceForm: FormGroup = this.fb.group({
    devId:        [0],
    devName:      ['', [Validators.required, Validators.maxLength(50)]],
    devType:      ['', Validators.required],
    devIoAddress: ['', Validators.maxLength(50)],
    devBraId:     ['', Validators.required],
  });

  ngOnInit(): void {
    this.devices.set([
      { devId: 1, devName: 'Stampante ricevute - Sede',   devType: 'PRN', devIoAddress: 'COM1',         devBraId: '001', inUso: true,  cassaIds: ['A01', 'A02'] },
      { devId: 2, devName: 'Scanner documenti - Sede',    devType: 'SCN', devIoAddress: 'USB001',        devBraId: '001', inUso: true,  cassaIds: ['A01'] },
      { devId: 3, devName: 'Lettore banconote - Lugano',  devType: 'BCR', devIoAddress: 'COM2',         devBraId: '002', inUso: true,  cassaIds: ['B01'] },
      { devId: 4, devName: 'Monitor cliente - Zurigo',    devType: 'MON', devIoAddress: '192.168.3.20', devBraId: '003', inUso: false, cassaIds: [] },
      { devId: 5, devName: 'Tastiera PIN - Riserva',      devType: 'PIN', devIoAddress: 'USB002',        devBraId: '001', inUso: false, cassaIds: [] },
    ]);
  }

  getTipoDes(dtyId: string): string {
    return this.tipoList.find(t => t.dtyId === dtyId)?.dtyDes ?? dtyId;
  }

  getBraDes(braId: string): string {
    return this.branchesList.find(b => b.braId === braId)?.braDes ?? braId;
  }

  getCassaCount(cassaIds: string[]): number {
    return cassaIds.length;
  }

  onSearchChanged(e: { value?: string }): void {
    this.filterSearch.set(e.value ?? '');
  }

  openViewPopup(data: IPeriferica): void {
    this.selectedDevice.set(data);
    this.selectedLabel.set(data.devName);
    this.deviceForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IPeriferica): void {
    this.selectedDevice.set(data);
    this.selectedLabel.set(data.devName);
    this.deviceForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  openNewPopup(): void {
    this.selectedDevice.set(null);
    this.deviceForm.reset({ devId: 0 });
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IPeriferica): void {
    switch (action) {
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
    }
  }

  private nameExists(name: string, excludeId?: number): boolean {
    return this.devices().some(d =>
      d.devName.toLowerCase() === name.toLowerCase() &&
      (excludeId === undefined || d.devId !== excludeId)
    );
  }

  onSubmit(): void {
    if (!this.deviceForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.deviceForm.getRawValue();
    if (this.nameExists(val.devName)) {
      notify(`Il nome "${val.devName}" è già utilizzato da un altro device`, 'error', 3000);
      return;
    }
    const newDevice: IPeriferica = {
      ...val,
      devId: this.nextId++,
      inUso: false,
      cassaIds: [],
    };
    // TODO: call backend insert
    this.devices.update(list => [...list, newDevice]);
    notify(`Device "${val.devName}" aggiunto con successo`, 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.deviceForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.deviceForm.getRawValue();
    const original = this.selectedDevice();
    if (original && val.devName.toLowerCase() !== original.devName.toLowerCase()) {
      if (this.nameExists(val.devName, val.devId)) {
        notify(`Il nome "${val.devName}" è già utilizzato da un altro device`, 'error', 3000);
        return;
      }
    }
    // TODO: call backend update
    this.devices.update(list => list.map(d =>
      d.devId === val.devId
        ? {
            ...d,
            devName: val.devName,
            devIoAddress: val.devIoAddress,
            devType: d.inUso ? d.devType : val.devType,
            devBraId: d.inUso ? d.devBraId : val.devBraId,
          }
        : d
    ));
    notify(`Device "${val.devName}" aggiornato con successo`, 'success', 3000);
    this.closePopup();
  }

  onDelete(): void {
    const dev = this.selectedDevice();
    if (!dev || dev.inUso) {
      notify('Impossibile eliminare: il device è attualmente in uso', 'error', 3000);
      return;
    }
    // TODO: call backend delete
    this.devices.update(list => list.filter(d => d.devId !== dev.devId));
    notify(`Device "${dev.devName}" eliminato`, 'success', 3000);
    this.closePopup();
  }

  onTrace(): void {
    const id = this.deviceForm.get('devId')?.value;
    notify(`Storico: sys_DEVICE_${id}`, 'info', 3000);
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.deviceForm.reset();
    this.selectedLabel.set('');
    this.selectedDevice.set(null);
  }
}
