import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxTextBoxModule, DxButtonModule, DxValidatorModule,
  DxSelectBoxModule, DxTextAreaModule, DxCheckBoxModule
} from 'devextreme-angular';
import { ControlAssignComponent } from '../../../../../components/control-assign/control-assign.component';
import notify from 'devextreme/ui/notify';
import { Service as CoreService } from '../../../../../core/services/service';
import { CasseService } from '../../Services/casse.service';
import { DeviceResponse, IDevice } from '../../models/device.models';
import { ICassa } from '../../models/casa.models';
import {
  SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
  SempioneCrudToolbarActionsComponent,
} from '../../../../../components/General';

@Component({
  selector: 'app-casse',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxButtonModule, DxValidatorModule,
    DxSelectBoxModule, DxTextAreaModule, DxCheckBoxModule,
    ControlAssignComponent,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
    SempioneCrudToolbarActionsComponent,
  ],
  templateUrl: './casse.component.html',
  styleUrls: ['./casse.component.css'],
})
export class CasseComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private casse$   = inject(CasseService);
  private core     = inject(CoreService);
  private router   = inject(Router);

  private casse = signal<ICassa[]>([]);

  filterSearch  = signal<string>('');
  isLoading     = signal(false);
  error         = signal<string | null>(null);

  popupMode           = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel       = signal<string>('');

  isConfirmDeleteVisible = signal(false);
  pendingDeleteId        = signal<string | null>(null);

  popupAssigned           = signal<IDevice[]>([]);
  assignedRolesForControl = signal<any[]>([]);
  possibleRolesForControl = signal<any[]>([]);

  branchesList  = signal<{ braId: string; braDes: string }[]>([]);
  languagesList = signal<{ lanId: string; lanDes: string }[]>([]);
  statiList     = signal<{ steId: string; steDes: string }[]>([]);
  allDevices    = signal<IDevice[]>([]);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'cliId',    caption: 'ID',           alignment: 'left',   width: 80  },
    { dataField: 'cliIp',    caption: 'Indirizzo IP',  alignment: 'left',   width: 140 },
    { dataField: 'braDes',   caption: 'Filiale',       alignment: 'left'               },
    { dataField: 'cliLingua',caption: 'Lingua',        alignment: 'center', width: 80  },
    { dataField: 'statusLabel', caption: 'Stato',       alignment: 'center', width: 120, type: 'entity-status' },
    { dataField: 'inUso',    caption: 'In Uso',        alignment: 'center', width: 80,  type: 'bool'      },
    { dataField: 'cliCnt',   caption: 'N° Oper.',      alignment: 'right',  width: 90  },
    { dataField: 'cliDes',   caption: 'Descrizione',   alignment: 'left'               },
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

  gridData = computed(() =>
    this.filteredCasse().map(c => ({
      ...c,
      braDes: this.getBraDes(c.cliBraId),
      statusLabel: this.getStatusDes(c.cliStatus),
    }))
  );

  popupTitle = computed(() => {
    if (this.popupMode() === 'edit') return 'Modifica Cassa — ' + this.selectedLabel();
    if (this.popupMode() === 'view') return 'Dettaglio Cassa — ' + this.selectedLabel();
    return 'Nuova Cassa';
  });

  cassaForm: FormGroup = this.fb.group({
    cliId:        ['', [Validators.required, Validators.pattern(/^[0-9A-Z]{3}$/)]],
    cliIp:        ['', [Validators.required, Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]],
    cliMac:       ['', [Validators.required, Validators.pattern(/^[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2}$/)]],
    cliBraId:     ['', Validators.required],
    cliLingua:    ['', Validators.required],
    cliStatus:    ['', Validators.required],
    cliOff:       [''],
    cliDes:       [''],
    cliCnt:       [0],
    cliDatcounter:[''],
    inUso:        [false],
  });

  ngOnInit(): void {
    this.loadBranches();
    this.loadLanguages();
    this.loadStati();
    this.loadClients();
  }

  private loadBranches(): void {
    this.core.getBranches().subscribe({
      next: (res: any[]) => this.branchesList.set((res || []).map(b => ({ braId: b.braId ?? b.id ?? '', braDes: b.braDes ?? b.des ?? '' }))),
      error: () => notify('Impossibile caricare le filiali', 'error', 3000)
    });
  }

  private loadLanguages(): void {
    this.core.GetLanguages().subscribe({
      next: (res: any[]) => this.languagesList.set((res || []).map(l => ({ lanId: l.lanId ?? l.id ?? '', lanDes: l.lanDes ?? l.des ?? '' }))),
      error: () => notify('Impossibile caricare le lingue', 'error', 3000)
    });
  }

  private loadStati(): void {
    this.core.GetAllStatiEntita().subscribe({
      next: (res: any[]) => this.statiList.set((res || []).map(s => ({ steId: s.steId ?? s.id ?? '', steDes: s.steDes ?? s.des ?? '' }))),
      error: () => notify('Impossibile caricare gli stati', 'error', 3000)
    });
  }

  private loadClients(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.casse$.getClients().subscribe({
      next: (clients: any[]) => {
        this.casse.set((clients || []).map(c => ({
          cliId: c.cliId ?? '', cliIp: c.cliIp ?? '', cliMac: c.cliMac ?? '',
          cliBraId: c.cliBraId ?? '', cliLingua: c.cliLingua ?? '',
          cliStatus: c.cliStatus ?? '', cliOff: c.cliOff ?? '',
          cliDes: c.cliDes ?? '', cliCnt: c.cliCnt ?? 0,
          cliDatcounter: c.cliDatcounter ? String(c.cliDatcounter) : null,
          inUso: false, assignedDeviceIds: [] as number[],
        })));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare le casse');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChanged(e: { value?: string }): void { this.filterSearch.set(e.value ?? ''); }
  resetSearch(): void { this.filterSearch.set(''); }

  getBraDes(braId: string): string {
    return this.branchesList().find(b => b.braId === braId)?.braDes ?? braId;
  }

  getStatusDes(steId: string): string {
    return this.statiList().find(s => s.steId === steId)?.steDes ?? steId;
  }

  getLinguaDes(lanId: string): string {
    return this.languagesList().find(l => l.lanId === lanId)?.lanDes ?? lanId;
  }

  private initDeviceLists(assignedIds: number[]): void {
    const assigned  = this.allDevices().filter(d =>  assignedIds.includes(d.devId));
    const available = this.allDevices().filter(d => !assignedIds.includes(d.devId));
    this.popupAssigned.set(assigned);
    this.assignedRolesForControl.set(assigned.map(d => ({ roleId: d.devId, roleName: d.devName })));
    this.possibleRolesForControl.set(available.map(d => ({ roleId: d.devId, roleName: d.devName })));
  }

  onRolesChanged(e: { assigned: any[] }): void {
    const findType = (id: number) => this.allDevices().find(d => d.devId === id)?.devType ?? '';
    this.popupAssigned.set((e.assigned || []).map(a => ({ devId: a.roleId, devName: a.roleName, devType: findType(a.roleId) } as IDevice)));
  }

  openViewPopup(data: ICassa): void {
    this.selectedLabel.set(data.cliId);
    this.cassaForm.patchValue(data);
    this._loadDevicesForBranch(data.cliBraId, data.assignedDeviceIds);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: ICassa): void {
    this.selectedLabel.set(data.cliId);
    this.cassaForm.patchValue(data);
    this._loadDevicesForBranch(data.cliBraId, data.assignedDeviceIds);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  openNewPopup(): void {
    this.cassaForm.reset({ cliCnt: 0, inUso: false, cliStatus: 'A', cliLingua: 'IT' });
    this.allDevices.set([]);
    this.initDeviceLists([]);
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  onBranchChanged(braId: string): void {
    if (!braId) { this.allDevices.set([]); this.initDeviceLists([]); return; }
    this.casse$.getDevicesByBranch(braId).subscribe({
      next: (devices: DeviceResponse[]) => {
        this.allDevices.set((devices || []).map(d => ({ devId: d.devId, devName: d.devName, devType: d.devType })));
        this.initDeviceLists(this.popupAssigned().map(d => d.devId));
      },
      error: () => notify('Impossibile caricare i dispositivi per la filiale', 'error', 3000)
    });
  }

  private _loadDevicesForBranch(braId: string, assignedIds: number[]): void {
    if (!braId) { this.initDeviceLists(assignedIds); return; }
    this.casse$.getDevicesByBranch(braId).subscribe({
      next: (devices: DeviceResponse[]) => {
        this.allDevices.set((devices || []).map(d => ({ devId: d.devId, devName: d.devName, devType: d.devType })));
        this.initDeviceLists(assignedIds);
      },
      error: () => { this.initDeviceLists(assignedIds); notify('Impossibile caricare i dispositivi', 'error', 3000); }
    });
  }

  onTableAction(action: string, data: ICassa): void {
    switch (action) {
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
      case 'delete': this.onRowDelete(data); break;
    }
  }

  onSubmit(): void {
    if (!this.cassaForm.valid) { notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000); return; }
    const val = this.cassaForm.getRawValue();
    const assignedIds = this.popupAssigned().map(d => d.devId);
    this.casse$.insertClient(this.buildInsertPayload(val, assignedIds)).subscribe({
      next: (res) => this.handleInsertSuccess(res, assignedIds),
      error: (err) => notify(err?.error ?? 'Errore durante l\'inserimento della cassa', 'error', 4000)
    });
  }

  private buildInsertPayload(val: any, deviceIds: number[]) {
    return {
      cliId: val.cliId, cliIp: val.cliIp, cliMac: val.cliMac, cliAuthcode: '',
      cliBraId: val.cliBraId, cliStatus: val.cliStatus, cliLingua: val.cliLingua || null,
      cliDes: val.cliDes || null, cliOff: val.cliOff || null,
      deviceIds, traUser: 'SYSTEM', traStation: 'WEB',
    };
  }

  private handleInsertSuccess(res: any, assignedIds: number[]): void {
    const newCassa: ICassa = {
      cliId: res.cliId, cliIp: res.cliIp, cliMac: res.cliMac, cliBraId: res.cliBraId,
      cliLingua: res.cliLingua ?? '', cliStatus: res.cliStatus, cliOff: res.cliOff ?? '',
      cliDes: res.cliDes ?? '', cliCnt: res.cliCnt,
      cliDatcounter: res.cliDatcounter ? String(res.cliDatcounter) : null,
      inUso: false, assignedDeviceIds: assignedIds,
    };
    this.casse.update(list => [...list, newCassa]);
    notify(`Cassa "${res.cliId}" aggiunta con successo`, 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.cassaForm.valid) { notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000); return; }
    const val = this.cassaForm.getRawValue();
    const current    = this.casse().find(c => c.cliId === val.cliId);
    const previousIds = current?.assignedDeviceIds ?? [];
    const currentIds  = this.popupAssigned().map(d => d.devId);
    const addIds = currentIds.filter(id => !previousIds.includes(id));
    const delIds = previousIds.filter(id => !currentIds.includes(id));
    this.casse$.updateClient(this.buildUpdatePayload(val, addIds, delIds)).subscribe({
      next: (res) => this.handleUpdateSuccess(res, val, currentIds),
      error: (err) => notify(err?.error ?? 'Errore durante l\'aggiornamento della cassa', 'error', 4000)
    });
  }

  private buildUpdatePayload(val: any, addDeviceIds: number[], delDeviceIds: number[]) {
    return {
      cliId: val.cliId, cliIp: val.cliIp, cliMac: val.cliMac, cliBraId: val.cliBraId,
      cliStatus: val.cliStatus, cliLingua: val.cliLingua || null,
      cliDes: val.cliDes || null, cliOff: val.cliOff || null,
      addDeviceIds, delDeviceIds, traUser: 'SYSTEM', traStation: 'WEB',
    };
  }

  private handleUpdateSuccess(res: any, val: any, currentIds: number[]): void {
    this.casse.update(list => list.map(c =>
      c.cliId === val.cliId
        ? { ...c, cliIp: res.cliIp, cliMac: res.cliMac, cliBraId: res.cliBraId,
            cliLingua: res.cliLingua ?? '', cliStatus: res.cliStatus,
            cliOff: res.cliOff ?? '', cliDes: res.cliDes ?? '',
            assignedDeviceIds: currentIds }
        : c
    ));
    notify(`Cassa "${val.cliId}" aggiornata con successo`, 'success', 3000);
    this.closePopup();
  }

  requestDeleteFromPopup(): void {
    const id = this.cassaForm.get('cliId')?.value;
    if (!id) return;
    this.pendingDeleteId.set(id);
    this.isConfirmDeleteVisible.set(true);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.casse$.deleteClient({ cliId: id, traUser: 'SYSTEM', traStation: 'WEB' }).subscribe({
      next: () => {
        this.casse.update(list => list.filter(c => c.cliId !== id));
        notify(`Cassa "${id}" eliminata`, 'success', 3000);
        this.cancelDelete();
        this.closePopup();
      },
      error: (err) => notify(err?.error ?? 'Errore durante l\'eliminazione della cassa', 'error', 4000)
    });
  }

  cancelDelete(): void {
    this.isConfirmDeleteVisible.set(false);
    this.pendingDeleteId.set(null);
  }

  onTrace(): void {
    const id = this.cassaForm.get('cliId')?.value;
    this.router.navigate(['/trace'], { queryParams: { traTabNam: 'SYS_CLIENT', traEntCode: id } });
  }

  onRowTrace(data: ICassa): void {
    this.router.navigate(['/trace'], { queryParams: { traTabNam: 'SYS_CLIENT', traEntCode: data.cliId } });
  }

  onRowDelete(data: ICassa): void {
    this.pendingDeleteId.set(data.cliId);
    this.isConfirmDeleteVisible.set(true);
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.cassaForm.reset();
    this.cassaForm.markAsPristine();
    this.cassaForm.markAsUntouched();
    this.selectedLabel.set('');
    this.popupAssigned.set([]);
    this.assignedRolesForControl.set([]);
    this.possibleRolesForControl.set([]);
    this.allDevices.set([]);
  }
}
