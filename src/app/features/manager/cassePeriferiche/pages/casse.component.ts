import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxSelectBoxModule, DxTextAreaModule, DxCheckBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface ICassa {
  cliId: string;
  cliIp: string;
  cliMac: string;
  cliBraId: string;
  cliLingua: string;
  cliStatus: string;
  cliOff: string;
  cliDes: string;
  cliCnt: number;
  cliDatcounter: string | null;
  inUso: boolean;
  assignedDeviceIds: string[];
}

export interface IDevice {
  devId: string;
  devName: string;
  devType: string;
}

@Component({
  selector: 'app-casse',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxSelectBoxModule, DxTextAreaModule, DxCheckBoxModule
  ],
  templateUrl: './casse.component.html',
  styleUrls: ['./casse.component.css'],
})
export class CasseComponent implements OnInit {
  private fb = inject(FormBuilder);

  private casse = signal<ICassa[]>([]);

  filterSearch = signal<string>('');

  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  // Device dual-list state
  popupAssigned  = signal<IDevice[]>([]);
  popupAvailable = signal<IDevice[]>([]);
  selectedAvailIds  = new Set<string>();
  selectedAssignIds = new Set<string>();

  readonly branchesList = [
    { braId: '001', braDes: 'Sede Principale' },
    { braId: '002', braDes: 'Filiale Lugano'  },
    { braId: '003', braDes: 'Filiale Zurigo'  },
  ];

  readonly languagesList = [
    { lanId: 'IT', lanDes: 'Italiano' },
    { lanId: 'DE', lanDes: 'Deutsch'  },
    { lanId: 'FR', lanDes: 'Français' },
    { lanId: 'EN', lanDes: 'English'  },
  ];

  readonly statiList = [
    { steId: 'A', steDes: 'Attivo'   },
    { steId: 'I', steDes: 'Inattivo' },
    { steId: 'S', steDes: 'Sospeso'  },
  ];

  readonly allDevices: IDevice[] = [
    { devId: '1', devName: 'Stampante ricevute',  devType: 'PRN' },
    { devId: '2', devName: 'Scanner documenti',   devType: 'SCN' },
    { devId: '3', devName: 'Lettore banconote',   devType: 'BCR' },
    { devId: '4', devName: 'Monitor cliente',     devType: 'MON' },
    { devId: '5', devName: 'Tastiera PIN',        devType: 'PIN' },
    { devId: '6', devName: 'Lettore smart card',  devType: 'SCD' },
  ];

  filteredCasse = computed(() => {
    const q = this.filterSearch().toLowerCase().trim();
    if (!q) return this.casse();
    return this.casse().filter(c =>
      c.cliId.toLowerCase().includes(q) ||
      c.cliIp.toLowerCase().includes(q) ||
      c.cliMac.toLowerCase().includes(q) ||
      c.cliDes.toLowerCase().includes(q)
    );
  });

  cassaForm: FormGroup = this.fb.group({
    cliId:     ['', [Validators.required, Validators.pattern(/^[0-9A-Z]{3}$/)]],
    cliIp:     ['', [Validators.required, Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]],
    cliMac:    ['', [Validators.required, Validators.pattern(/^[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}$/)]],
    cliBraId:  ['', Validators.required],
    cliLingua: ['', Validators.required],
    cliStatus: ['', Validators.required],
    cliOff:    [''],
    cliDes:    [''],
    cliCnt:        [0],
    cliDatcounter: [''],
    inUso:         [false],
  });

  ngOnInit(): void {
    this.casse.set([
      {
        cliId: 'A01', cliIp: '192.168.1.10', cliMac: 'AA-BB-CC-DD-EE-01',
        cliBraId: '001', cliLingua: 'IT', cliStatus: 'A',
        cliOff: 'UFF01', cliDes: 'Cassa principale sede',
        cliCnt: 1254, cliDatcounter: '2024-01-15 09:00:00', inUso: true,
        assignedDeviceIds: ['1', '3']
      },
      {
        cliId: 'A02', cliIp: '192.168.1.11', cliMac: 'AA-BB-CC-DD-EE-02',
        cliBraId: '001', cliLingua: 'IT', cliStatus: 'A',
        cliOff: 'UFF01', cliDes: 'Cassa secondaria sede',
        cliCnt: 876, cliDatcounter: '2024-01-15 08:45:00', inUso: false,
        assignedDeviceIds: ['1', '2']
      },
      {
        cliId: 'B01', cliIp: '192.168.2.10', cliMac: 'AA-BB-CC-DD-EE-03',
        cliBraId: '002', cliLingua: 'DE', cliStatus: 'A',
        cliOff: 'UFF02', cliDes: 'Cassa Lugano 1',
        cliCnt: 432, cliDatcounter: '2024-01-15 08:30:00', inUso: false,
        assignedDeviceIds: ['1', '4']
      },
      {
        cliId: 'C01', cliIp: '192.168.3.10', cliMac: 'AA-BB-CC-DD-EE-04',
        cliBraId: '003', cliLingua: 'DE', cliStatus: 'I',
        cliOff: 'UFF03', cliDes: 'Cassa Zurigo 1',
        cliCnt: 0, cliDatcounter: null, inUso: false,
        assignedDeviceIds: []
      },
    ]);
  }

  onSearchChanged(e: { value?: string }): void {
    this.filterSearch.set(e.value ?? '');
  }

  getBraDes(braId: string): string {
    return this.branchesList.find(b => b.braId === braId)?.braDes ?? braId;
  }

  getStatusDes(steId: string): string {
    return this.statiList.find(s => s.steId === steId)?.steDes ?? steId;
  }

  getLinguaDes(lanId: string): string {
    return this.languagesList.find(l => l.lanId === lanId)?.lanDes ?? lanId;
  }

  // ── Dual list device management ──────────────────────────────

  private initDeviceLists(assignedIds: string[]): void {
    this.popupAssigned.set(this.allDevices.filter(d => assignedIds.includes(d.devId)));
    this.popupAvailable.set(this.allDevices.filter(d => !assignedIds.includes(d.devId)));
    this.selectedAvailIds.clear();
    this.selectedAssignIds.clear();
  }

  toggleAvailSelection(devId: string): void {
    if (this.selectedAvailIds.has(devId)) this.selectedAvailIds.delete(devId);
    else this.selectedAvailIds.add(devId);
  }

  toggleAssignSelection(devId: string): void {
    if (this.selectedAssignIds.has(devId)) this.selectedAssignIds.delete(devId);
    else this.selectedAssignIds.add(devId);
  }

  isAvailSelected(devId: string): boolean { return this.selectedAvailIds.has(devId); }
  isAssignSelected(devId: string): boolean { return this.selectedAssignIds.has(devId); }

  addDevices(): void {
    const toAdd = this.popupAvailable().filter(d => this.selectedAvailIds.has(d.devId));
    if (!toAdd.length) return;
    this.popupAssigned.update(list => [...list, ...toAdd]);
    this.popupAvailable.update(list => list.filter(d => !this.selectedAvailIds.has(d.devId)));
    this.selectedAvailIds.clear();
  }

  removeDevices(): void {
    const toRemove = this.popupAssigned().filter(d => this.selectedAssignIds.has(d.devId));
    if (!toRemove.length) return;
    this.popupAvailable.update(list => [...list, ...toRemove]);
    this.popupAssigned.update(list => list.filter(d => !this.selectedAssignIds.has(d.devId)));
    this.selectedAssignIds.clear();
  }

  // ── Popup open/close ─────────────────────────────────────────

  openViewPopup(data: ICassa): void {
    this.selectedLabel.set(data.cliId);
    this.cassaForm.patchValue(data);
    this.initDeviceLists(data.assignedDeviceIds);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: ICassa): void {
    this.selectedLabel.set(data.cliId);
    this.cassaForm.patchValue(data);
    this.initDeviceLists(data.assignedDeviceIds);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  openNewPopup(): void {
    this.cassaForm.reset({ cliCnt: 0, inUso: false, cliStatus: 'A', cliLingua: 'IT' });
    this.initDeviceLists([]);
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: ICassa): void {
    switch (action) {
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
    }
  }

  onSubmit(): void {
    if (!this.cassaForm.valid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.cassaForm.getRawValue();
    if (this.casse().some(c => c.cliId === val.cliId)) {
      notify(`La cassa "${val.cliId}" esiste già`, 'error', 3000);
      return;
    }
    const newCassa: ICassa = {
      ...val,
      assignedDeviceIds: this.popupAssigned().map(d => d.devId),
      cliCnt: 0, cliDatcounter: null, inUso: false,
    };
    // TODO: call backend insert
    this.casse.update(list => [...list, newCassa]);
    notify(`Cassa "${val.cliId}" aggiunta con successo`, 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.cassaForm.valid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.cassaForm.getRawValue();
    const assignedIds = this.popupAssigned().map(d => d.devId);
    // TODO: call backend update
    this.casse.update(list => list.map(c =>
      c.cliId === val.cliId
        ? { ...c, cliIp: val.cliIp, cliMac: val.cliMac, cliBraId: val.cliBraId,
            cliLingua: val.cliLingua, cliStatus: val.cliStatus, cliOff: val.cliOff,
            cliDes: val.cliDes, assignedDeviceIds: assignedIds }
        : c
    ));
    notify(`Cassa "${val.cliId}" aggiornata con successo`, 'success', 3000);
    this.closePopup();
  }

  onTrace(): void {
    const id = this.cassaForm.get('cliId')?.value;
    notify(`Storico: sys_CLIENT_${id}`, 'info', 3000);
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.cassaForm.reset();
    this.selectedLabel.set('');
    this.popupAssigned.set([]);
    this.popupAvailable.set([]);
    this.selectedAvailIds.clear();
    this.selectedAssignIds.clear();
  }
}
