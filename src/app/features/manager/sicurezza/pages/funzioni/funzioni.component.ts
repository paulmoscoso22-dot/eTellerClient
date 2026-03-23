import { Component, signal, inject, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/manager.service';
import { SysFunctionsResponse, SysRoleResponse, GetSysRoleByFunIdRequest, GetUsersRoleFunIdRequest, UsersRoleFunctionResponse } from '../../models/manager.models';
import { LabelSecondaryComponent } from '../../../../../components/labels/label-secondary/label-secondary.component';
import { TableFunzioniComponent } from '../../components/table-funzioni/table-funzioni.component';
import { TableRolesComponent } from '../../components/table-roles/table-roles.component';
import { TableUserRoleComponent } from '../../components/table-user-role/table-user-role.component';

@Component({
  selector: 'app-funzioni',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxTextBoxModule, DxTextAreaModule, DxButtonModule, LabelSecondaryComponent, TableFunzioniComponent, TableRolesComponent, TableUserRoleComponent],
  templateUrl: './funzioni.component.html',
  styleUrls: ['./funzioni.component.css'],
})
export class FunzioniComponent implements OnInit, OnDestroy {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef = inject(DestroyRef);
  sysFunctions = signal<SysFunctionsResponse[]>([]);
  sysRoles = signal<SysRoleResponse[]>([]);
  usersRoleFunctions = signal<UsersRoleFunctionResponse[]>([]);
  selectedFunName = signal<string>('');
  selectedFunDescription = signal<string>('');

  constructor() {}

  ngOnInit(): void {
    this.managerService.sysFunctions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.sysFunctions.set(data),
        error: (err) => console.error('Error loading sys functions:', err)
      });

    this.managerService.sysRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.sysRoles.set(data),
        error: (err) => console.error('Error loading sys roles:', err)
      });

    this.managerService.usersRoleFunction$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.usersRoleFunctions.set(data),
        error: (err) => console.error('Error loading users for role-function:', err)
      });

    // Trigger initial load
    this.managerService.getSysFunctions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching sys functions:', err) });
  }

  ngOnDestroy(): void {
    // takeUntilDestroyed handles cleanup
  }

  onFunctionSelect(e: any): void {
    const selected = e && e.selectedRowsData && e.selectedRowsData[0];
    if (!selected) {
      this.sysRoles.set([]);
      this.selectedFunName.set('');
      this.selectedFunDescription.set('');
      return;
    }
    this.selectedFunName.set(selected.funName ?? '');
    this.selectedFunDescription.set(selected.funDescription ?? '');
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
  onAdd(): void { console.log('Aggiungi'); }
  onEdit(): void { console.log('Modifica'); }
  onDelete(): void { console.log('Cancella'); }
  onTrace(): void { console.log('Traccia'); }
  onReset(): void { console.log('Reset'); }
  onPrintFunctions(): void { console.log('Stampa lista funzioni'); }
  onPrintUsers(): void { console.log('Stampa utenti con funzione'); }
}
