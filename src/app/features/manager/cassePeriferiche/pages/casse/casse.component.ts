import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxSelectBoxModule, DxTextAreaModule, DxCheckBoxModule
} from 'devextreme-angular';
import { ControlAssignComponent } from '../../../../../components/control-assign/control-assign.component';
import notify from 'devextreme/ui/notify';
import { Service as CoreService } from '../../../../../core/services/service';
import { CasseService } from '../../Services/casse.service';
import { DeviceResponse, IDevice } from '../../models/device.models';
import { ICassa } from '../../models/casa.models';

@Component({
  selector: 'app-casse',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxSelectBoxModule, DxTextAreaModule, DxCheckBoxModule
    , ControlAssignComponent
  ],
  templateUrl: './casse.component.html',
  styleUrls: ['./casse.component.css'],
})
export class CasseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private casse$ = inject(CasseService);
  private core = inject(CoreService);

  private casse = signal<ICassa[]>([]);

  filterSearch = signal<string>('');

  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  // Device dual-list state
  popupAssigned = signal<IDevice[]>([]);

  // Signals used by the reusable assign-control component
  assignedRolesForControl = signal<any[]>([]);
  possibleRolesForControl = signal<any[]>([]);

  // populated from backend
  branchesList = signal<{ braId: string; braDes: string }[]>([]);
  languagesList = signal<{ lanId: string; lanDes: string }[]>([]);
  statiList = signal<{ steId: string; steDes: string }[]>([]);
  allDevices = signal<IDevice[]>([]);

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
    this.loadBranches();
    this.loadLanguages();
    this.loadStati();
    this.loadClients();
  }

  private loadBranches(): void {
    this.core.getBranches().subscribe({
      next: (res: any[]) => this.branchesList.set((res || []).map(b => ({ braId: b.braId ?? b.id ?? '', braDes: b.braDes ?? b.des ?? b.descrizione ?? b.name ?? '' })) ),
      error: () => notify('Impossibile caricare le filiali', 'error', 3000)
    });
  }

  private loadLanguages(): void {
    this.core.GetLanguages().subscribe({
      next: (res: any[]) => this.languagesList.set((res || []).map(l => ({ lanId: l.lanId ?? l.id ?? '', lanDes: l.lanDes ?? l.des ?? l.name ?? '' })) ),
      error: () => notify('Impossibile caricare le lingue', 'error', 3000)
    });
  }

  private loadStati(): void {
    this.core.GetAllStatiEntita().subscribe({
      next: (res: any[]) => this.statiList.set((res || []).map(s => ({ steId: s.steId ?? s.id ?? s.code ?? '', steDes: s.steDes ?? s.des ?? s.name ?? '' })) ),
      error: () => notify('Impossibile caricare gli stati', 'error', 3000)
    });
  }

  private loadClients(): void {
    this.casse$.getClients().subscribe({
      next: (clients: any[]) => {
        this.casse.set((clients || []).map(c => ({
          cliId: c.cliId ?? '',
          cliIp: c.cliIp ?? '',
          cliMac: c.cliMac ?? '',
          cliBraId: c.cliBraId ?? '',
          cliLingua: c.cliLingua ?? '',
          cliStatus: c.cliStatus ?? '',
          cliOff: c.cliOff ?? '',
          cliDes: c.cliDes ?? '',
          cliCnt: c.cliCnt ?? 0,
          cliDatcounter: c.cliDatcounter ? String(c.cliDatcounter) : null,
          inUso: false,
          assignedDeviceIds: [] as number[],
        })));
      },
      error: () => notify('Impossibile caricare le casse', 'error', 3000)
    });
  }

  onSearchChanged(e: { value?: string }): void {
    this.filterSearch.set(e.value ?? '');
  }

  onSearch(): void { /* il filtro è già live via filterSearch */ }

  resetSearch(): void {
    this.filterSearch.set('');
  }

  getBraDes(braId: string): string {
    return this.branchesList().find(b => b.braId === braId)?.braDes ?? braId;
  }

  getStatusDes(steId: string): string {
    return this.statiList().find(s => s.steId === steId)?.steDes ?? steId;
  }

  getLinguaDes(lanId: string): string {
    return this.languagesList().find(l => l.lanId === lanId)?.lanDes ?? lanId;
  }

  getStatusClass(value: string): string {
    const des = (this.getStatusDes(value) ?? '').toLowerCase();
    if (value === 'A' || des.includes('attiv')) return 'status-pill--active';
    if (value === 'I' || des.includes('inattiv') || des.includes('non attiv')) return 'status-pill--inactive';
    if (value === 'S' || des.includes('sosp')) return 'status-pill--suspended';
    return '';
  }

  // ── Dual list device management ──────────────────────────────

  private initDeviceLists(assignedIds: number[]): void {
    const assigned = this.allDevices().filter(d => assignedIds.includes(d.devId));
    const available = this.allDevices().filter(d => !assignedIds.includes(d.devId));
    this.popupAssigned.set(assigned);
    this.assignedRolesForControl.set(assigned.map(d => ({ roleId: d.devId, roleName: d.devName })));
    this.possibleRolesForControl.set(available.map(d => ({ roleId: d.devId, roleName: d.devName })));
  }

  onRolesChanged(e: { assigned: any[] }): void {
    const findType = (id: number) => this.allDevices().find(d => d.devId === id)?.devType ?? '';
    this.popupAssigned.set((e.assigned || []).map(a => ({ devId: a.roleId, devName: a.roleName, devType: findType(a.roleId) } as IDevice)));
  }

  // ── Popup open/close ─────────────────────────────────────────

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
        const currentAssigned = this.popupAssigned().map(d => d.devId);
        this.initDeviceLists(currentAssigned);
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
    }
  }

  onSubmit(): void {
    if (!this.cassaForm.valid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.cassaForm.getRawValue();
    const assignedIds = this.popupAssigned().map(d => d.devId);

    const payload = this.buildInsertPayload(val, assignedIds);

    this.casse$.insertClient(payload).subscribe({
      next: (res) => this.handleInsertSuccess(res, assignedIds),
      error: (err) => notify(err?.error ?? 'Errore durante l\'inserimento della cassa', 'error', 4000)
    });
  }

  private buildInsertPayload(val: any, deviceIds: number[]) {
    return {
      cliId: val.cliId,
      cliIp: val.cliIp,
      cliMac: val.cliMac,
      cliAuthcode: '',
      cliBraId: val.cliBraId,
      cliStatus: val.cliStatus,
      cliLingua: val.cliLingua || null,
      cliDes: val.cliDes || null,
      cliOff: val.cliOff || null,
      deviceIds,
      traUser: 'SYSTEM',
      traStation: 'WEB',
    };
  }

  private handleInsertSuccess(res: any, assignedIds: number[]): void {
    const newCassa: ICassa = {
      cliId: res.cliId, cliIp: res.cliIp, cliMac: res.cliMac,
      cliBraId: res.cliBraId, cliLingua: res.cliLingua ?? '',
      cliStatus: res.cliStatus, cliOff: res.cliOff ?? '',
      cliDes: res.cliDes ?? '', cliCnt: res.cliCnt,
      cliDatcounter: res.cliDatcounter ? String(res.cliDatcounter) : null,
      inUso: false, assignedDeviceIds: assignedIds,
    };
    this.casse.update(list => [...list, newCassa]);
    notify(`Cassa "${res.cliId}" aggiunta con successo`, 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.cassaForm.valid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.cassaForm.getRawValue();
    const current = this.casse().find(c => c.cliId === val.cliId);
    const previousIds = current?.assignedDeviceIds ?? [];
    const currentIds  = this.popupAssigned().map(d => d.devId);
    const addIds = currentIds.filter(id => !previousIds.includes(id));
    const delIds = previousIds.filter(id => !currentIds.includes(id));

    const payload = this.buildUpdatePayload(val, addIds, delIds);

    this.casse$.updateClient(payload).subscribe({
      next: (res) => this.handleUpdateSuccess(res, val, currentIds),
      error: (err) => notify(err?.error ?? 'Errore durante l\'aggiornamento della cassa', 'error', 4000)
    });
  }

  private buildUpdatePayload(val: any, addDeviceIds: number[], delDeviceIds: number[]) {
    return {
      cliId: val.cliId,
      cliIp: val.cliIp,
      cliMac: val.cliMac,
      cliBraId: val.cliBraId,
      cliStatus: val.cliStatus,
      cliLingua: val.cliLingua || null,
      cliDes: val.cliDes || null,
      cliOff: val.cliOff || null,
      addDeviceIds,
      delDeviceIds,
      traUser: 'SYSTEM',
      traStation: 'WEB',
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

  onDelete(): void {
    const id = this.cassaForm.get('cliId')?.value;
    if (!id) return;
    this.casse$.deleteClient({ cliId: id, traUser: 'SYSTEM', traStation: 'WEB' }).subscribe({
      next: () => {
        this.casse.update(list => list.filter(c => c.cliId !== id));
        notify(`Cassa "${id}" eliminata`, 'success', 3000);
        this.closePopup();
      },
      error: (err) => notify(err?.error ?? 'Errore durante l\'eliminazione della cassa', 'error', 4000)
    });
  }

  onTrace(): void {
    const id = this.cassaForm.get('cliId')?.value;
    notify(`Storico: sys_CLIENT_${id}`, 'info', 3000);
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
