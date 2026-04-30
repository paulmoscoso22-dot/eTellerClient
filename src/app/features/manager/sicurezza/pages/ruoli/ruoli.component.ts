import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxToastModule } from 'devextreme-angular/ui/toast';
import { DxTemplateModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { ManagerService } from '../../services/sicurezza.service';
import { ISysRoleResonse, IUserSelectRoleResponse, IInsertRoleRequest, IUpdateRoleRequest, IDeleteRoleRequest } from '../../models/ruoli.models';
import { IFunctionRoleResponse, IStFunAcctypResponse } from '../../models/function.models';

@Component({
  selector: 'app-ruoli',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxSelectBoxModule,
    DxButtonModule, DxPopupModule, DxToastModule, DxTemplateModule,
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

  // ── Ruoli filter ──
  searchRoles = signal<string>('');
  filteredRoles = computed(() => {
    const q = this.searchRoles().toLowerCase().trim();
    if (!q) return this.roles();
    return this.roles().filter(r =>
      r.roleName.toLowerCase().includes(q) ||
      (r.roleDes ?? '').toLowerCase().includes(q)
    );
  });

  // ── Utenti filter ──
  searchUsers = signal<string>('');
  filteredUsersByRole = computed(() => {
    const q = this.searchUsers().toLowerCase().trim();
    if (!q) return this.usersByRole();
    return this.usersByRole().filter(u =>
      (u.usrId ?? '').toString().toLowerCase().includes(q) ||
      (u.usrExtref ?? '').toLowerCase().includes(q)
    );
  });

  // ── Funzioni per Ruolo filter ──
  searchName = signal<string | null>(null);
  searchDes  = signal<string | null>(null);

  // ── Selection state ──
  selectedRoleId   = signal<number>(0);
  selectedRoleName = signal<string>('');
  selectedRoleDes  = signal<string>('');

  // ── UI state ──
  showAddPopup    = signal<boolean>(false);
  showDetailPopup = signal<boolean>(false);
  popupMode       = signal<'view' | 'edit'>('view');
  isLoading       = signal<boolean>(false);
  toastVisible    = signal<boolean>(false);
  toastMessage    = signal<string>('');
  toastType       = signal<'success' | 'error' | 'warning' | 'info'>('success');

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

  // ── Row selection (aggiorna dati laterali, non apre popup) ──
  onRoleSelectionChanged(e: any): void {
    const selected = e?.selectedRowsData?.[0];
    if (!selected) return;
    this.setSelected(selected);
    this.selectedRole$.next(selected);
  }

  // ── Popup apertura da colonna Azioni ──
  openViewPopup(data: ISysRoleResonse): void {
    this.setSelected(data);
    this.selectedRole$.next(data);
    this.popupMode.set('view');
    this.showDetailPopup.set(true);
  }

  openEditPopup(data: ISysRoleResonse): void {
    this.setSelected(data);
    this.selectedRole$.next(data);
    this.popupMode.set('edit');
    this.showDetailPopup.set(true);
  }

  switchToEditMode(): void { this.popupMode.set('edit'); }

  // ── Salva modifica ──
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
          this.showNotification('Ruolo modificato con successo', 'success');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showNotification('Errore durante la modifica del ruolo', 'error');
          console.error(err);
        }
      });
  }

  // ── Aggiungi ──
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
          this.showNotification('Ruolo inserito con successo', 'success');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showNotification("Errore durante l'inserimento del ruolo", 'error');
          console.error(err);
        }
      });
  }

  onCancelAdd(): void { this.showAddPopup.set(false); this.resetAddForm(); }

  // ── Elimina da riga ──
  onDeleteFromRow(data: ISysRoleResonse): void {
    this.setSelected(data);
    this.onDelete();
  }

  onDelete(): void {
    if (!this.selectedRoleId()) {
      this.showNotification('Selezionare un ruolo da eliminare', 'warning');
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
              this.showNotification('Ruolo cancellato con successo', 'success');
            },
            error: (err) => {
              this.showNotification('Errore durante la cancellazione del ruolo', 'error');
              console.error(err);
            }
          });
      });
  }

  // ── Traccia da riga ──
  onTraceFromRow(data: ISysRoleResonse): void {
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'sys_ROLE', traEntCode: String(data.roleId) }
    });
  }

  // ── Traccia da popup ──
  onTrace(): void {
    if (!this.selectedRoleId()) {
      this.showNotification('Selezionare un ruolo da tracciare', 'warning');
      return;
    }
    this.showDetailPopup.set(false);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'sys_ROLE', traEntCode: String(this.selectedRoleId()) }
    });
  }

  // ── Ricerca Funzioni per Ruolo (server-side) ──
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

  onStampaLista(): void {}
  onStampaUtenti(): void {}

  // ── Helpers privati ──
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

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    notify(message, type, 2000);
  }
}
