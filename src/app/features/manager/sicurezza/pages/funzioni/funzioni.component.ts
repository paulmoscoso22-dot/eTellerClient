import { Component, signal, computed, inject, OnInit, DestroyRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import notify from 'devextreme/ui/notify';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/sicurezza.service';
import {
  SysFunctionsResponse, SysRoleResponse, GetSysRoleByFunIdRequest,
  GetUsersRoleFunIdRequest, UsersRoleFunctionResponse,
  InsertSysFunctionRequest, UpdateSysFunctionRequest, DeleteSysFunctionRequest
} from '../../models/manager.models';
import { AuthFacade, AuthTemp } from '../../../../auth/auth.facade';
import {
  SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent, SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupActionBarComponent, SempionePopupCardComponent,
  SempioneFieldGroupComponent, SempioneButtonComponent, SempioneConfirmDeleteComponent,
} from '../../../../../components/General';

@Component({
  selector: 'app-funzioni',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxNumberBoxModule, DxTextAreaModule, DxButtonModule, DxCheckBoxModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupActionBarComponent,
    SempionePopupCardComponent, SempioneFieldGroupComponent,
    SempioneButtonComponent, SempioneConfirmDeleteComponent,
  ],
  templateUrl: './funzioni.component.html',
  styleUrls: ['./funzioni.component.css'],
})
export class FunzioniComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly authFacade = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authTemp = new AuthTemp();

  sysFunctions       = signal<SysFunctionsResponse[]>([]);
  sysRoles           = signal<SysRoleResponse[]>([]);
  usersRoleFunctions = signal<UsersRoleFunctionResponse[]>([]);

  searchRoles = signal<string>('');
  filteredSysRoles = computed(() => {
    const q = this.searchRoles().toLowerCase().trim();
    if (!q) return this.sysRoles();
    return this.sysRoles().filter(r => r.roleName?.toLowerCase().includes(q));
  });

  searchUsers = signal<string>('');
  filteredUsersRoleFunctions = computed(() => {
    const q = this.searchUsers().toLowerCase().trim();
    if (!q) return this.usersRoleFunctions();
    return this.usersRoleFunctions().filter(u =>
      (u.usrId ?? '').toLowerCase().includes(q) ||
      (u.usrExtref ?? '').toLowerCase().includes(q)
    );
  });

  filterFunId          = signal<number | null>(null);
  filterFunName        = signal<string>('');
  filterFunDescription = signal<string>('');
  filterFunHostcode    = signal<number | null>(null);

  filteredFunctions = computed(() => {
    let data = this.sysFunctions();
    const id   = this.filterFunId();
    const name = this.filterFunName().trim().toLowerCase();
    const desc = this.filterFunDescription().trim().toLowerCase();
    const hc   = this.filterFunHostcode();
    if (id)   data = data.filter(f => f.funId === id);
    if (name) data = data.filter(f => f.funName?.toLowerCase().includes(name));
    if (desc) data = data.filter(f => f.funDescription?.toLowerCase().includes(desc));
    if (hc)   data = data.filter(f => f.funHostcode === hc);
    return data;
  });

  selectedFunId          = signal<number>(0);
  selectedFunName        = signal<string>('');
  selectedFunDescription = signal<string>('');
  selectedFunHostcode    = signal<number>(0);
  selectedOffline        = signal<boolean>(false);

  showAddPopup    = signal<boolean>(false);
  showDetailPopup = signal<boolean>(false);
  popupMode       = signal<'view' | 'edit'>('view');
  isLoading       = signal<boolean>(false);

  isConfirmDeleteVisible = signal(false);
  pendingDeleteFun       = signal<{ funId: number; funName: string } | null>(null);

  @ViewChild('rolesGrid')  private rolesGrid?: SempioneDataGridComponent;
  @ViewChild('usersGrid')  private usersGrid?: SempioneDataGridComponent;

  readonly rolesColumns: SempioneGridColumn[] = [
    { dataField: 'roleId',   caption: 'ID',    width: 65, alignment: 'center', dataType: 'number' },
    { dataField: 'roleName', caption: 'Ruolo' },
  ];

  readonly usersColumns: SempioneGridColumn[] = [
    { dataField: 'usrExtref', caption: 'Utente' },
    { dataField: 'usrId',     caption: 'ID', width: 70, alignment: 'center' },
  ];

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'funId',          caption: 'ID',          width: 65,  alignment: 'center', dataType: 'number' },
    { dataField: 'funDescription', caption: 'Descrizione' },
    { dataField: 'funName',        caption: 'Funzione',    width: 180 },
    { dataField: 'offline',        caption: 'Offline',     width: 80,  type: 'bool-text' },
    { dataField: 'funHostcode',    caption: 'Host Code',   width: 100, alignment: 'center', dataType: 'number' },
  ];

  addForm = new FormGroup({
    funName:        new FormControl('', [Validators.required]),
    funDescription: new FormControl(''),
    funHostcode:    new FormControl<number>(0, [Validators.required]),
    offline:        new FormControl<boolean>(false),
  });

  ngOnInit(): void {
    this.managerService.sysFunctions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.sysFunctions.set(data) });
    this.managerService.sysRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.sysRoles.set(data) });
    this.managerService.usersRoleFunction$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.usersRoleFunctions.set(data) });
    this.managerService.getSysFunctions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching sys functions:', err) });
  }

  onFunctionSelect(e: any): void {
    const selected = e?.selectedRowsData?.[0];
    if (!selected) { this.clearSelectedFunction(); return; }
    this.setSelectedFunction(selected);
    this.loadRelatedData(selected.funId);
  }

  openEditPopup(data: SysFunctionsResponse): void {
    this.setSelectedFunction(data);
    this.popupMode.set('edit');
    this.showDetailPopup.set(true);
    this.loadRelatedData(data.funId);
  }

  switchToEditMode(): void { this.popupMode.set('edit'); }

  onSaveDetail(): void {
    const request: UpdateSysFunctionRequest = {
      traUser:        this.authTemp.User,
      traStation:     this.authTemp.Cassa,
      funId:          this.selectedFunId(),
      funName:        this.selectedFunName(),
      funDescription: this.selectedFunDescription(),
      funHostcode:    this.selectedFunHostcode(),
      offline:        this.selectedOffline(),
    };
    this.isLoading.set(true);
    this.managerService.updateSysFunction(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.handleOperationSuccess(
          result, 'Funzione modificata con successo', 'Errore durante la modifica della funzione',
          () => this.showDetailPopup.set(false)
        ),
        error: (err) => this.handleOperationError(err, 'Errore durante la modifica della funzione'),
      });
  }

  onAdd(): void { this.showAddPopup.set(true); }

  onSaveAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    const request: InsertSysFunctionRequest = {
      traUser:        this.authTemp.User,
      traStation:     this.authTemp.Cassa,
      funName:        this.addForm.value.funName ?? '',
      funDescription: this.addForm.value.funDescription ?? '',
      funHostcode:    this.addForm.value.funHostcode ?? 0,
      offline:        this.addForm.value.offline ?? false,
    };
    this.isLoading.set(true);
    this.managerService.insertSysFunction(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.handleOperationSuccess(
          result, 'Funzione inserita con successo', "Errore durante l'inserimento della funzione",
          () => { this.showAddPopup.set(false); this.resetAddForm(); }
        ),
        error: (err) => this.handleOperationError(err, "Errore durante l'inserimento della funzione"),
      });
  }

  onCancelAdd(): void { this.showAddPopup.set(false); this.resetAddForm(); }

  onTraceFromRow(data: SysFunctionsResponse): void {
    this.setSelectedFunction(data);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'sys_FUNCTIONS', traEntCode: String(data.funId) }
    });
  }

  onDeleteFromRow(data: SysFunctionsResponse): void {
    this.setSelectedFunction(data);
    this.requestDelete();
  }

  requestDelete(): void {
    if (!this.requireSelection('Selezionare una funzione da eliminare')) return;
    this.pendingDeleteFun.set({ funId: this.selectedFunId(), funName: this.selectedFunName() });
    this.isConfirmDeleteVisible.set(true);
  }

  confirmDelete(): void {
    const fun = this.pendingDeleteFun();
    if (!fun) return;
    const request: DeleteSysFunctionRequest = {
      traUser:    this.authTemp.User,
      traStation: this.authTemp.Cassa,
      funId:      fun.funId,
    };
    this.cancelDelete();
    this.showDetailPopup.set(false);
    this.isLoading.set(true);
    this.managerService.deleteSysFunction(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.handleOperationSuccess(
          result, 'Funzione eliminata con successo', "Errore durante l'eliminazione della funzione",
          () => this.clearSelectedFunction()
        ),
        error: (err) => this.handleOperationError(err, "Errore durante l'eliminazione della funzione"),
      });
  }

  cancelDelete(): void {
    this.isConfirmDeleteVisible.set(false);
    this.pendingDeleteFun.set(null);
  }

  onTrace(): void {
    if (!this.requireSelection('Selezionare una funzione da tracciare')) return;
    this.showDetailPopup.set(false);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'sys_FUNCTIONS', traEntCode: String(this.selectedFunId()) }
    });
  }

  resetFilters(): void {
    this.filterFunId.set(null);
    this.filterFunName.set('');
    this.filterFunDescription.set('');
    this.filterFunHostcode.set(null);
  }

  onReset(): void {
    this.resetFilters();
    this.clearSelectedFunction();
    try { this.rolesGrid?.clearSelection(); } catch {}
    try { this.usersGrid?.clearSelection(); } catch {}
  }

  onRoleSelect(_e: any): void {}
  onUserSelect(_e: any): void {}

  private setSelectedFunction(data: SysFunctionsResponse): void {
    this.selectedFunId.set(data.funId ?? 0);
    this.selectedFunName.set(data.funName ?? '');
    this.selectedFunDescription.set(data.funDescription ?? '');
    this.selectedFunHostcode.set(data.funHostcode ?? 0);
    this.selectedOffline.set(data.offline ?? false);
  }

  private loadRelatedData(funId: number): void {
    this.managerService.getSysRoleByFunId({ funId } as GetSysRoleByFunIdRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching roles:', err) });
    this.managerService.getUsersRoleFunId({ funId } as GetUsersRoleFunIdRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching users:', err) });
  }

  private clearSelectedFunction(): void {
    this.selectedFunId.set(0);
    this.selectedFunName.set('');
    this.selectedFunDescription.set('');
    this.selectedFunHostcode.set(0);
    this.selectedOffline.set(false);
    this.sysRoles.set([]);
    this.usersRoleFunctions.set([]);
  }

  private resetAddForm(): void {
    this.addForm.reset({ funName: '', funDescription: '', funHostcode: 0, offline: false });
  }

  private requireSelection(message: string): boolean {
    if (!this.selectedFunId()) { notify(message, 'warning', 2000); return false; }
    return true;
  }

  private handleOperationSuccess(result: unknown, successMsg: string, errorMsg: string, afterSuccess?: () => void): void {
    this.isLoading.set(false);
    if (result) {
      notify(successMsg, 'success', 2000);
      afterSuccess?.();
      this.managerService.getSysFunctions()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: (err) => console.error('Error reloading functions:', err) });
    } else {
      notify(errorMsg, 'error', 2000);
    }
  }

  private handleOperationError(err: unknown, errorMsg: string): void {
    this.isLoading.set(false);
    notify(errorMsg, 'error', 2000);
    console.error(errorMsg, err);
  }
}
