import { Component, signal, inject, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/manager.service';
import { SysFunctionsResponse, SysRoleResponse, GetSysRoleByFunIdRequest, GetUsersRoleFunIdRequest, UsersRoleFunctionResponse } from '../../models/manager.models';

@Component({
  selector: 'app-funzioni',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './funzioni.component.html',
  styleUrls: ['./funzioni.component.css'],
})
export class FunzioniComponent implements OnInit, OnDestroy {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef = inject(DestroyRef);
  sysFunctions = signal<SysFunctionsResponse[]>([]);
  sysRoles = signal<SysRoleResponse[]>([]);
  usersRoleFunctions = signal<UsersRoleFunctionResponse[]>([]);

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
      return;
    }
    const req: GetSysRoleByFunIdRequest = { funId: selected.funId };
    this.managerService.getSysRoleByFunId(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching roles for function:', err) });

    const usersReq: GetUsersRoleFunIdRequest = { funId: selected.funId };
    this.managerService.getUsersRoleFunId(usersReq)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error fetching users for function:', err) });
  }
}
