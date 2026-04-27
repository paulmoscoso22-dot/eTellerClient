import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxToastModule } from 'devextreme-angular/ui/toast';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/sicurezza.service';
import { SysFunctionsResponse, SysRoleResponse, GetSysRoleByFunIdRequest, GetUsersRoleFunIdRequest, UsersRoleFunctionResponse, InsertSysFunctionRequest, UpdateSysFunctionRequest, DeleteSysFunctionRequest } from '../../models/manager.models';
import { TableFunzioniComponent } from '../../components/table-funzioni/table-funzioni.component';
import { TableRolesComponent } from '../../components/table-roles/table-roles.component';
import { TableUserRoleComponent } from '../../components/table-user-role/table-user-role.component';
import { ViewChild } from '@angular/core';
import { AuthFacade, AuthTemp } from '../../../../auth/auth.facade';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';

@Component({
  selector: 'app-funzioni',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DxDataGridModule, DxTextBoxModule, DxNumberBoxModule, DxTextAreaModule, DxButtonModule, DxPopupModule, DxFormModule, DxCheckBoxModule, DxToastModule, TableFunzioniComponent, TableRolesComponent, TableUserRoleComponent, HeaderCardComponent],
  templateUrl: './funzioni.component.html',
  styleUrls: ['./funzioni.component.css'],
})
export class FunzioniComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly authFacade = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authTemp = new AuthTemp();
  sysFunctions = signal<SysFunctionsResponse[]>([]);
  sysRoles = signal<SysRoleResponse[]>([]);
  usersRoleFunctions = signal<UsersRoleFunctionResponse[]>([]);
  selectedFunId = signal<number>(0);
  selectedFunName = signal<string>('');
  selectedFunDescription = signal<string>('');
  selectedFunHostcode = signal<number>(0);
  selectedOffline = signal<boolean>(false);
  showAddPopup = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  toastVisible = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('success');

  @ViewChild(TableFunzioniComponent) private funzioniTable?: TableFunzioniComponent;
  @ViewChild(TableRolesComponent) private rolesTable?: TableRolesComponent;
  @ViewChild(TableUserRoleComponent) private userRoleTable?: TableUserRoleComponent;

  addForm = new FormGroup({
    funName: new FormControl('', [Validators.required]),
    funDescription: new FormControl(''),
    funHostcode: new FormControl<number>(0, [Validators.required]),
    offline: new FormControl<boolean>(false)
  });

  ngOnInit(): void {
    this.initSubscriptions();
    this.loadFunctions();
  }

  private initSubscriptions(): void {
    this.subscribeSysFunctions();
    this.subscribeSysRoles();
    this.subscribeUsersRoleFunction();
  }

  private subscribeSysFunctions(): void {
    this.managerService.sysFunctions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.sysFunctions.set(data),
        error: (err) => console.error('Error loading sys functions:', err)
      });
  }

  private subscribeSysRoles(): void {
    this.managerService.sysRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.sysRoles.set(data),
        error: (err) => console.error('Error loading sys roles:', err)
      });
  }

  private subscribeUsersRoleFunction(): void {
    this.managerService.usersRoleFunction$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.usersRoleFunctions.set(data),
        error: (err) => console.error('Error loading users for role-function:', err)
      });
  }

  private loadFunctions(): void {
    this.managerService.getSysFunctions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching sys functions:', err) });
  }

  onFunctionSelect(e: any): void {
    const selected = e && e.selectedRowsData && e.selectedRowsData[0];
    if (!selected) {
      this.clearSelectedFunction();
      return;
    }
    this.selectedFunId.set(selected.funId ?? 0);
    this.selectedFunName.set(selected.funName ?? '');
    this.selectedFunDescription.set(selected.funDescription ?? '');
    this.selectedFunHostcode.set(selected.funHostcode ?? 0);
    this.selectedOffline.set(selected.offline ?? false);
    const req: GetSysRoleByFunIdRequest = { funId: selected.funId };
    this.managerService.getSysRoleByFunId(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching roles for function:', err) });

    const usersReq: GetUsersRoleFunIdRequest = { funId: selected.funId };
    this.managerService.getUsersRoleFunId(usersReq)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching users for function:', err) });
  }

  onRoleSelect(e: any): void {
    const selected = e && e.selectedRowsData && e.selectedRowsData[0];
    if (!selected) {
      return;
    }
    // placeholder: handle role selection if needed
    console.log('Role selected', selected);
  }

  onUserSelect(e: any): void {
    const selected = e && e.selectedRowsData && e.selectedRowsData[0];
    if (!selected) {
      return;
    }
    // placeholder: handle user selection if needed
    console.log('User selected', selected);
  }

  // Action button handlers
  onAdd(): void {
    this.showAddPopup.set(true);
  }

  onSaveAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const request: InsertSysFunctionRequest = {
      traUser: this.authTemp.User,
      traStation: this.authTemp.Cassa,
      funName: this.addForm.value.funName ?? '',
      funDescription: this.addForm.value.funDescription ?? '',
      funHostcode: this.addForm.value.funHostcode ?? 0,
      offline: this.addForm.value.offline ?? false
    };

    this.createSysFunction(request);
  }

  private createSysFunction(request: InsertSysFunctionRequest): void {
    this.isLoading.set(true);
    this.managerService.insertSysFunction(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.handleOperationSuccess(
          result,
          'Funzione inserita con successo',
          'Errore durante l\'inserimento della funzione',
          () => { this.showAddPopup.set(false); this.resetAddForm(); }
        ),
        error: (err) => this.handleOperationError(err, 'Errore durante l\'inserimento della funzione')
      });
  }

  onCancelAdd(): void {
    this.showAddPopup.set(false);
    this.resetAddForm();
  }

  private resetAddForm(): void {
    this.addForm.reset({
      funName: '',
      funDescription: '',
      funHostcode: 0,
      offline: false
    });
  }

  private handleOperationSuccess(result: unknown, successMsg: string, errorMsg: string, afterSuccess?: () => void): void {
    this.isLoading.set(false);
    if (result) {
      this.showNotification(successMsg, 'success');
      afterSuccess?.();
      this.loadFunctions();
    } else {
      this.showNotification(errorMsg, 'error');
      console.error(`${errorMsg}: No result returned`);
    }
  }

  private handleOperationError(err: unknown, errorMsg: string): void {
    this.isLoading.set(false);
    this.showNotification(errorMsg, 'error');
    console.error(errorMsg, err);
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    notify(message, type, 2000);
  }

  private requireSelection(message: string): boolean {
    if (!this.selectedFunId()) {
      this.showNotification(message, 'warning');
      return false;
    }
    return true;
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

  onEdit(): void {
    if (!this.requireSelection('Selezionare una funzione da modificare')) return;

    const request: UpdateSysFunctionRequest = {
      traUser: this.authTemp.User,
      traStation: this.authTemp.Cassa,
      funId: this.selectedFunId(),
      funName: this.selectedFunName(),
      funDescription: this.selectedFunDescription(),
      funHostcode: this.selectedFunHostcode(),
      offline: this.selectedOffline()
    };
    this.isLoading.set(true);
    this.modifySysFunction(request);
  }

  private modifySysFunction(request: UpdateSysFunctionRequest): void {
    this.isLoading.set(true);
    this.managerService.updateSysFunction(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.handleOperationSuccess(
          result,
          'Funzione modificata con successo',
          'Errore durante la modifica della funzione'
        ),
        error: (err) => this.handleOperationError(err, 'Errore durante la modifica della funzione')
      });
  }

  onDelete(): void {
    if (!this.requireSelection('Selezionare una funzione da eliminare')) return;

  confirm(`Sei sicuro di voler eliminare la funzione "${this.selectedFunName()}"?`, 'Conferma eliminazione')
    .then((confirmed) => {
      if (!confirmed) return;

      const request: DeleteSysFunctionRequest = {
        traUser: this.authTemp.User,
        traStation: this.authTemp.Cassa,
        funId: this.selectedFunId()
      };
      this.isLoading.set(true);
      this.deleteSysFunction(request);
    });
  }

  private deleteSysFunction(request: DeleteSysFunctionRequest): void {
    this.isLoading.set(true);
    this.managerService.deleteSysFunction(request) 
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.handleOperationSuccess(    
          result,
          'Funzione eliminata con successo',
          "Errore durante l'eliminazione della funzione",     
          () => this.clearSelectedFunction()
        ),
        error: (err) => this.handleOperationError(err, "Errore durante l'eliminazione della funzione")
      });
  }

  onTrace(): void {
    if (!this.requireSelection('Selezionare una funzione da tracciare')) return;
    // Navigate to trace page with query params to prefill filter
    this.router.navigate(['/trace'], {
      queryParams: {
        traTabNam: 'sys_FUNCTIONS',
        traEntCode: String(this.selectedFunId())
      }
    });
  }
  onReset(): void { 
    this.clearSelectedFunction();
    // also clear selections in child grids
    try { this.funzioniTable?.clearSelection(); } catch {}
    try { this.rolesTable?.clearSelection(); } catch {}
    try { this.userRoleTable?.clearSelection(); } catch {}
    console.log('Reset'); 
  }
  onPrintFunctions(): void { console.log('Stampa lista funzioni'); }
  onPrintUsers(): void { console.log('Stampa utenti con funzione'); }
}
