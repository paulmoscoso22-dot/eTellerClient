import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import notify from 'devextreme/ui/notify';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { ManagerService } from '../../services/sicurezza.service';
import { ISysRoleResonse, IUserSelectRoleResponse, IInsertRoleRequest, IUpdateRoleRequest, IDeleteRoleRequest } from '../../models/ruoli.models';
import { IFunctionRoleResponse, IStFunAcctypResponse } from '../../models/function.models';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';
import { CardDataGridComponent, GridColumnDef } from '../../../../../components/card-data-grid/card-data-grid.component';
import { CardToolbarComponent } from '../../../../../components/card-toolbar/card-toolbar.component';

@Component({
  selector: 'app-ruoli',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxTextBoxModule, DxSelectBoxModule, DxButtonModule, HeaderCardComponent, CardDataGridComponent, CardToolbarComponent],
  templateUrl: './ruoli.component.html',
  styleUrls: ['./ruoli.component.css'],
})
export class RuoliComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly selectedRole$ = new Subject<ISysRoleResonse>();

  readonly roleColumns: GridColumnDef[] = [
    { dataField: 'roleId',   caption: 'ID',          width: 60 },
    { dataField: 'roleName', caption: 'Nome Ruolo',  width: 160 },
    { dataField: 'roleDes',  caption: 'Descrizione' }
  ];

  readonly userColumns: GridColumnDef[] = [
    { dataField: 'usrId',     caption: 'User ID',     width: 100 },
    { dataField: 'usrExtref', caption: 'Riferimento' },
    { dataField: 'usrBraId',  caption: 'Filiale',     width: 80 },
    { dataField: 'usrStatus', caption: 'Stato',       width: 90, type: 'status' }
  ];

  roles = signal<ISysRoleResonse[]>([]);
  usersByRole = signal<IUserSelectRoleResponse[]>([]);
  functionsByRole = signal<IFunctionRoleResponse[]>([]);
  selectedRoleName = signal<string>('');
  selectedRoleDes = signal<string | null | undefined>(null);
  selectedRoleId = signal<number>(0);
  searchName = signal<string | null>(null);
  searchDes = signal<string | null>(null);
  funcAccTyp = signal<IStFunAcctypResponse[]>([]);
  searchRoles = signal<string>('');
  filteredRoles = computed(() => {
    const q = this.searchRoles().toLowerCase().trim();
    if (!q) return this.roles();
    return this.roles().filter(r =>
      r.roleName.toLowerCase().includes(q) ||
      (r.roleDes ?? '').toLowerCase().includes(q)
    );
  });

  searchUsers = signal<string>('');
  filteredUsersByRole = computed(() => {
    const q = this.searchUsers().toLowerCase().trim();
    if (!q) return this.usersByRole();
    return this.usersByRole().filter(u =>
      (u.usrId ?? '').toString().toLowerCase().includes(q) ||
      (u.usrExtref ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.bindAllRoles();
    this.bindUsersByRole();
    this.bindFunctionsByRole();
    this.bindFuncAccTyp();
    this.loadAllRoles();
    this.initFunctionsByRole();
    this.loadFuncAccTyp();
    this.listenToRoleSelection();
    this.listenToFunctionsByRoleSelection();
  }

  private bindAllRoles(): void {
    this.managerService.allRoles$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.roles.set(data));
  }

  private bindUsersByRole(): void {
    this.managerService.usersByRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.usersByRole.set(data));
  }

  private bindFunctionsByRole(): void {
    this.managerService.functionRoleByRoleId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.functionsByRole.set(data));
  }

  private bindFuncAccTyp(): void {
    this.managerService.funcAccTyp$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.funcAccTyp.set(data));
  }

  private initFunctionsByRole(): void {
    this.managerService
      .postGetFunctionRoleByRoleId({ roleId: 0, funLikeName: null, funLikeDes: null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('initFunctionsByRole failed', err) });
  }

  private listenToFunctionsByRoleSelection(): void {
    this.selectedRole$
      .pipe(
        switchMap((role) =>
          this.managerService.postGetFunctionRoleByRoleId({ roleId: role.roleId, funLikeName: null, funLikeDes: null })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({ error: (err) => console.error('postGetFunctionRoleByRoleId failed', err) });
  }

  private loadAllRoles(): void {
    this.managerService
      .postGetAllRole()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('postGetAllRole failed', err) });
  }

  private loadFuncAccTyp(): void {
    this.managerService
      .getFuncAccTyp()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('getFuncAccTyp failed', err) });
  }

  private listenToRoleSelection(): void {
    this.selectedRole$
      .pipe(
        switchMap((role) => this.managerService.postGetUserByRoleId({ roleId: role.roleId })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({ error: (err) => console.error('postGetUserByRoleId failed', err) });
  }

  onRoleSelectionChanged(e: { selectedRowsData: ISysRoleResonse[] }): void {
    const selected = e.selectedRowsData?.[0];
    if (!selected) return;
    this.selectedRoleName.set(selected.roleName);
    this.selectedRoleDes.set(selected.roleDes);
    this.selectedRoleId.set(selected.roleId);
    this.selectedRole$.next(selected);
  }

  onCerca(): void {
    this.managerService
      .postGetFunctionRoleByRoleId({
        roleId: this.selectedRoleId(),
        funLikeName: this.searchName() || null,
        funLikeDes: this.searchDes() || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('onCerca failed', err) });
  }

  onAggiungi(): void {
    const req: IInsertRoleRequest = {
      roleName: this.selectedRoleName(),
      roleDes: this.selectedRoleDes() ?? '',
      traUser: 'Admin', // Default/Placeholder
      traStation: 'Station1', // Default/Placeholder
      info: 'Inserito da UI' // Default/Placeholder
    };
    
    this.managerService
      .insertRole(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadAllRoles();
          notify('Ruolo inserito con successo', 'success', 3000);
        },
        error: (err) => {
          console.error('insertRole failed', err);
          notify('Errore durante l\'inserimento del ruolo', 'error', 3000);
        }
      });
  }

  onModifica(): void {
    if (!this.selectedRoleId()) {
      notify('Seleziona un ruolo dalla griglia da modificare', 'warning', 3000);
      return;
    }
    const req: IUpdateRoleRequest = {
      roleId: this.selectedRoleId(),
      roleName: this.selectedRoleName(),
      roleDes: this.selectedRoleDes() ?? ''
    };
    
    this.managerService
      .updateRole(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadAllRoles();
          notify('Ruolo modificato con successo', 'success', 3000);
        },
        error: (err) => {
          console.error('updateRole failed', err);
          notify('Errore durante la modifica del ruolo', 'error', 3000);
        }
      });
  }

  onCancella(): void {
    if (!this.selectedRoleId()) {
      notify('Seleziona un ruolo dalla griglia da cancellare', 'warning', 3000);
      return;
    }
    const req: IDeleteRoleRequest = {
      roleId: this.selectedRoleId()
    };

    this.managerService
      .deleteRole(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedRoleId.set(0);
          this.selectedRoleName.set('');
          this.selectedRoleDes.set('');
          this.loadAllRoles();
          notify('Ruolo cancellato con successo', 'success', 3000);
        },
        error: (err) => {
          console.error('deleteRole failed', err);
          notify('Errore durante la cancellazione del ruolo', 'error', 3000);
        }
    });
  }

  onReset(): void {
    this.selectedRoleId.set(0);
    this.selectedRoleName.set('');
    this.selectedRoleDes.set(null);
    this.usersByRole.set([]);
    this.functionsByRole.set([]);
    this.searchName.set(null);
    this.searchDes.set(null);
  }

  onRowEdit(role: ISysRoleResonse): void {
    this.selectedRoleName.set(role.roleName);
    this.selectedRoleDes.set(role.roleDes);
    this.selectedRoleId.set(role.roleId);
    this.selectedRole$.next(role);
  }

  onTraceRow(role: ISysRoleResonse): void {
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'sys_ROLE', traEntCode: String(role.roleId) }
    });
  }

  onStampaLista(): void { console.log('Stampa lista ruoli'); }
  onStampaUtenti(): void { console.log('Stampa utenti con ruolo'); }

  onTrace(): void {
    if (!this.selectedRoleId()) {
      notify('Selezionare un ruolo da tracciare', 'warning', 3000);
      return;
    }
    this.router.navigate(['/trace'], {
      queryParams: {
        traTabNam: 'sys_ROLE',
        traEntCode: String(this.selectedRoleId())
      }
    });
  }
}
