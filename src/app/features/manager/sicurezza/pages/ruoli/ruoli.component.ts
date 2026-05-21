import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTemplateModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { ManagerService } from '../../services/sicurezza.service';
import { ISysRoleResonse, IUserSelectRoleResponse, IInsertRoleRequest, IUpdateRoleRequest, IDeleteRoleRequest } from '../../models/ruoli.models';
import { IFunctionRoleResponse, IStFunAcctypResponse } from '../../models/function.models';
import { SempionePageHeaderComponent } from '../../../../../components/General/sempione-page-header/sempione-page-header.component';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneToolbarComponent } from '../../../../../components/General/sempione-toolbar/sempione-toolbar.component';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General/sempione-data-grid/sempione-data-grid.component';
import { SempionePopupComponent } from '../../../../../components/General/sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../../../../../components/General/sempione-popup-action-bar/sempione-popup-action-bar.component';
import { SempionePopupCardComponent } from '../../../../../components/General/sempione-popup-card/sempione-popup-card.component';
import { SempioneFieldGroupComponent } from '../../../../../components/General/sempione-field-group/sempione-field-group.component';

@Component({
  selector: 'app-ruoli',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxSelectBoxModule, DxButtonModule, DxTemplateModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupActionBarComponent,
    SempionePopupCardComponent, SempioneFieldGroupComponent,
  ],
  templateUrl: './ruoli.component.html',
  styleUrls: ['./ruoli.component.css'],
})
export class RuoliComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef     = inject(DestroyRef);
  private readonly router         = inject(Router);
  private readonly selectedRole$  = new Subject<ISysRoleResonse>();

  roles           = signal<ISysRoleResonse[]>([]);
  usersByRole     = signal<IUserSelectRoleResponse[]>([]);
  functionsByRole = signal<IFunctionRoleResponse[]>([]);
  funcAccTyp      = signal<IStFunAcctypResponse[]>([]);

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

  searchName = signal<string | null>(null);
  searchDes  = signal<string | null>(null);

  selectedRoleId   = signal<number>(0);
  selectedRoleName = signal<string>('');
  selectedRoleDes  = signal<string>('');

  showAddPopup    = signal<boolean>(false);
  showDetailPopup = signal<boolean>(false);
  popupMode       = signal<'view' | 'edit'>('view');
  isLoading       = signal<boolean>(false);

  readonly ruoliColumns: SempioneGridColumn[] = [
    { dataField: 'roleId',   caption: 'ID',         width: 60 },
    { dataField: 'roleName', caption: 'Nome Ruolo',  width: 180 },
    { dataField: 'roleDes',  caption: 'Descrizione' },
  ];

  readonly usersColumns: SempioneGridColumn[] = [
    { dataField: 'usrId',        caption: 'User ID',    width: 100 },
    { dataField: 'usrExtref',    caption: 'Riferimento' },
    { dataField: 'usrBraId',     caption: 'Filiale',    width: 80 },
    { dataField: 'usrStatusDes', caption: 'Stato',      width: 130, alignment: 'center', type: 'entity-status' },
  ];

  filteredUsersByRoleMapped = computed(() =>
    this.filteredUsersByRole().map(u => ({
      ...u,
      usrStatusDes:
        u.usrStatus === 'enabled'  ? 'Attivo'       :
        u.usrStatus === 'disabled' ? 'Disabilitato' :
        u.usrStatus === 'blocked'  ? 'Bloccato'     : u.usrStatus,
    }))
  );

  addForm = new FormGroup({
    roleName: new FormControl('', [Validators.required]),
    roleDes:  new FormControl(''),
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

  onRoleSelectionChanged(e: any): void {
    const selected = e?.selectedRowsData?.[0];
    if (!selected) return;
    this.setSelected(selected);
    this.selectedRole$.next(selected);
  }

  openEditPopup(data: ISysRoleResonse): void {
    this.setSelected(data);
    this.selectedRole$.next(data);
    this.popupMode.set('edit');
    this.showDetailPopup.set(true);
  }

  switchToEditMode(): void { this.popupMode.set('edit'); }

  onSaveDetail(): void {
    if (!this.selectedRoleId()) return;
    const req: IUpdateRoleRequest = {
      roleId:   this.selectedRoleId(),
      roleName: this.selectedRoleName(),
      roleDes:  this.selectedRoleDes(),
    };
    this.isLoading.set(true);
    this.managerService.updateRole(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showDetailPopup.set(false);
          this.loadAllRoles();
          notify('Ruolo modificato con successo', 'success', 2000);
        },
        error: (err) => {
          this.isLoading.set(false);
          notify('Errore durante la modifica del ruolo', 'error', 2000);
          console.error(err);
        }
      });
  }

  onAdd(): void { this.showAddPopup.set(true); }

  onSaveAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    const v = this.addForm.value;
    const req: IInsertRoleRequest = {
      roleName:   v.roleName   ?? '',
      roleDes:    v.roleDes    ?? '',
      traUser:    'Admin',
      traStation: 'Station1',
      info:       'Inserito da UI',
    };
    this.isLoading.set(true);
    this.managerService.insertRole(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showAddPopup.set(false);
          this.resetAddForm();
          this.loadAllRoles();
          notify('Ruolo inserito con successo', 'success', 2000);
        },
        error: (err) => {
          this.isLoading.set(false);
          notify("Errore durante l'inserimento del ruolo", 'error', 2000);
          console.error(err);
        }
      });
  }

  onCancelAdd(): void { this.showAddPopup.set(false); this.resetAddForm(); }

  onDeleteFromRow(data: ISysRoleResonse): void {
    this.setSelected(data);
    this.onDelete();
  }

  onDelete(): void {
    if (!this.selectedRoleId()) {
      notify('Selezionare un ruolo da eliminare', 'warning', 2000);
      return;
    }
    confirm(`Eliminare il ruolo "${this.selectedRoleName()}"?`, 'Conferma eliminazione')
      .then((confirmed) => {
        if (!confirmed) return;
        const req: IDeleteRoleRequest = { roleId: this.selectedRoleId() };
        this.managerService.deleteRole(req)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.clearSelected();
              this.usersByRole.set([]);
              this.functionsByRole.set([]);
              this.showDetailPopup.set(false);
              this.loadAllRoles();
              notify('Ruolo cancellato con successo', 'success', 2000);
            },
            error: (err) => {
              notify('Errore durante la cancellazione del ruolo', 'error', 2000);
              console.error(err);
            }
          });
      });
  }

  onTraceFromRow(data: ISysRoleResonse): void {
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'sys_ROLE', traEntCode: String(data.roleId) }
    });
  }

  onTrace(): void {
    if (!this.selectedRoleId()) {
      notify('Selezionare un ruolo da tracciare', 'warning', 2000);
      return;
    }
    this.showDetailPopup.set(false);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'sys_ROLE', traEntCode: String(this.selectedRoleId()) }
    });
  }

  onCerca(): void {
    this.managerService
      .postGetFunctionRoleByRoleId({
        roleId:      this.selectedRoleId(),
        funLikeName: this.searchName() || null,
        funLikeDes:  this.searchDes()  || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('onCerca failed', err) });
  }

  resetFilters(): void { this.searchRoles.set(''); }

  private setSelected(data: ISysRoleResonse): void {
    this.selectedRoleId.set(data.roleId);
    this.selectedRoleName.set(data.roleName ?? '');
    this.selectedRoleDes.set(data.roleDes ?? '');
  }

  private clearSelected(): void {
    this.selectedRoleId.set(0);
    this.selectedRoleName.set('');
    this.selectedRoleDes.set('');
  }

  private resetAddForm(): void {
    this.addForm.reset({ roleName: '', roleDes: '' });
  }
}
