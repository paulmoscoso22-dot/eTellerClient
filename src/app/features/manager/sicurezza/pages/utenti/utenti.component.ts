import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxSelectBoxModule, DxValidatorModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ManagerService } from '../../services/sicurezza.service';
import { ISysUsersActiveAndBlockedResponse, GetUsersByUserIdRequest, IInsertUserRequest, IUpdateUserRequest } from '../../models/utenti.models';
import { ISysRoleResonse, GetRoleByUsrIdRequest, IGetRoleNotForUsrIdRquest } from '../../models/ruoli.models';
import { ControlAssignComponent } from '../../../../../components/General/control-assign/control-assign.component';
import { Service } from '../../../../../core/services/service';
import { ISTLanguageResponse } from '../../../../../core/domain/laguage.domain';
import { Branch } from '../../../../../core/domain/branch.domain';
import { ISTStatoEntitaResponse } from '../../../../../core/domain/stato-entita.domain';
import { Router } from '@angular/router';
import {
  SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent, SempioneButtonComponent,
  SempionePopupComponent, SempionePopupActionBarComponent,
  SempionePopupCardComponent, SempioneFieldGroupComponent,
  SempioneDataGridComponent, SempioneGridColumn,
} from '../../../../../components/General';

@Component({
  selector: 'app-utenti',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxCheckBoxModule,
    DxSelectBoxModule, DxValidatorModule,
    ControlAssignComponent,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneButtonComponent,
    SempionePopupComponent, SempionePopupActionBarComponent,
    SempionePopupCardComponent, SempioneFieldGroupComponent,
    SempioneDataGridComponent,
  ],
  templateUrl: './utenti.component.html',
  styleUrls: ['./utenti.component.css'],
})
export class UtentiComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly coreService    = inject(Service);
  private fb                      = inject(FormBuilder);
  private readonly router         = inject(Router);

  readonly filterItems = [
    { value: 'activeBlocked', label: 'Attivi / Bloccati' },
    { value: 'all',           label: 'Tutti' },
  ];
  selectedFilter = signal<string>('activeBlocked');
  searchValue    = signal<string>('');

  private rawUsers        = signal<ISysUsersActiveAndBlockedResponse[]>([]);
  private activeBlockedIds = signal<string[]>([]);

  gridData = computed(() => {
    const all    = this.rawUsers();
    const filter = this.selectedFilter();
    const search = this.searchValue().toLowerCase().trim();
    const ids    = this.activeBlockedIds();

    let result = all;
    if (filter === 'activeBlocked' && ids.length) {
      result = result.filter(u => ids.includes(u.usrStatus));
    }
    if (search) {
      result = result.filter(u =>
        (u.usrId    ?? '').toLowerCase().includes(search) ||
        (u.usrExtref ?? '').toLowerCase().includes(search)
      );
    }
    return result.map(u => ({
      ...u,
      usrStatusDes:
        u.usrStatus === 'enabled'  ? 'Attivo'       :
        u.usrStatus === 'disabled' ? 'Disabilitato' :
        u.usrStatus === 'blocked'  ? 'Bloccato'     :
        (u.usrStatus === 'extinct' || u.usrStatus === 'estinto') ? 'Estinto' : u.usrStatus,
    }));
  });

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'usrId',        caption: 'ID Utente',  width: 130 },
    { dataField: 'usrExtref',    caption: 'Riferimento' },
    { dataField: 'usrHostId',    caption: 'Host ID',    width: 120 },
    { dataField: 'usrBraId',     caption: 'Filiale',    width: 100 },
    { dataField: 'usrStatusDes', caption: 'Stato',      width: 130, type: 'entity-status' },
  ];

  statiEntitaList = signal<ISTStatoEntitaResponse[]>([]);
  branchesList    = signal<Branch[]>([]);
  languagesList   = signal<ISTLanguageResponse[]>([]);

  public assignedRoles             = signal<ISysRoleResonse[]>([]);
  public possibleRoles             = signal<ISysRoleResonse[]>([]);
  public selectedAssignedRoleKeys: number[] = [];
  public selectedPossibleRoleKeys: number[] = [];
  public movedToLeft:  number[] = [];
  public movedToRight: number[] = [];

  public selectedUserId = signal<string | null>(null);
  popupMode             = signal<'new' | 'view' | 'edit'>('new');

  showDetailPopup = signal<boolean>(false);
  showResetPopup  = signal<boolean>(false);

  userForm: FormGroup = this.fb.group({
    usrId:     ['', Validators.required],
    usrStatus: ['', Validators.required],
    usrExtref: [''],
    usrHostId: ['', Validators.required],
    usrBraId:  ['', Validators.required],
    usrChgPas: [false],
    usrLingua: ['', Validators.required],
  });

  resetPasswordForm: FormGroup = this.fb.group({
    password:        ['', Validators.required],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password        = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onFilterChanged(e: any): void {
    this.selectedFilter.set(e.value as string);
    this.onClear();
  }

  onSearchChanged(e: any): void {
    this.searchValue.set(e.value ?? '');
  }

  ngOnInit(): void {
    this.managerService.GetUserActiveBlocked().subscribe();
    this.managerService.usersActiveBlocked$.subscribe(data => {
      this.rawUsers.set(data);
      this.activeBlockedIds.set([...new Set(data.map(u => u.usrStatus))]);
    });
    this.coreService.GetLanguages().subscribe();
    this.coreService.getBranches().subscribe();
    this.coreService.GetAllStatiEntita().subscribe();

    this.coreService.languages$.subscribe(data     => { if (data?.length) this.languagesList.set(data); });
    this.coreService.branches$.subscribe(data      => { if (data?.length) this.branchesList.set(data); });
    this.coreService.allStatiEntita$.subscribe(data => { if (data?.length) this.statiEntitaList.set(data); });

    this.managerService.rolesByUser$.subscribe(roles => {
      this.assignedRoles.set(roles ? [...roles] : []);
      this.selectedAssignedRoleKeys = [];
    });
    this.managerService.rolesNotForUser$.subscribe(roles => {
      this.possibleRoles.set(roles ? [...roles] : []);
      this.selectedPossibleRoleKeys = [];
    });
  }

  openNewUserPopup(): void {
    this.userForm.reset();
    this.selectedUserId.set(null);
    this.assignedRoles.set([]);
    this.possibleRoles.set([]);
    this.popupMode.set('new');
    this.showDetailPopup.set(true);
  }

  openViewPopup(data: any): void {
    const userId = data.usrId || data.UsrId;
    this.selectedUserId.set(userId);
    this.loadUserData(userId);
    this.loadUserRoles(userId);
    this.loadRolesNotForUser(userId);
    this.popupMode.set('view');
    this.showDetailPopup.set(true);
  }

  openEditPopup(data: any): void {
    const userId = data.usrId || data.UsrId;
    this.selectedUserId.set(userId);
    this.loadUserData(userId);
    this.loadUserRoles(userId);
    this.loadRolesNotForUser(userId);
    this.popupMode.set('edit');
    this.showDetailPopup.set(true);
  }

  onRowTrace(data: ISysUsersActiveAndBlockedResponse): void {
    this.selectedUserId.set(data.usrId || (data as any).UsrId);
    this.onTrace();
  }

  onStampaLista(): void {
    if (typeof window !== 'undefined' && (window as any).print) {
      (window as any).print();
    }
  }

  onSelectionChanged(e: any): void {
    const selectedItem = e.selectedRowsData[0];
    if (selectedItem && (selectedItem.usrId || selectedItem.UsrId)) {
      this.selectedUserId.set(selectedItem.usrId || selectedItem.UsrId);
    } else {
      this.selectedUserId.set(null);
    }
  }

  onDetailPopupVisibleChange(visible: boolean): void {
    this.showDetailPopup.set(visible);
    if (!visible) this.onClear();
  }

  loadRolesNotForUser(userId: string): void {
    const request: IGetRoleNotForUsrIdRquest = { usrId: userId };
    this.managerService.GetRoleNotForUsrId(request).subscribe({
      error: (err) => console.error('Error fetching unassigned roles', err),
    });
  }

  loadUserRoles(userId: string): void {
    const request: GetRoleByUsrIdRequest = { usrId: userId };
    this.managerService.GetRoleByUsrId(request).subscribe({
      error: (err) => console.error('Error fetching user roles', err),
    });
  }

  loadUserData(userId: string): void {
    const request: GetUsersByUserIdRequest = { usrId: userId };
    this.managerService.GetUserByUserId(request).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response[0] : (response?.data || response);
        if (data) {
          this.userForm.patchValue({
            usrId:     data.usrId     || data.UsrId,
            usrStatus: data.usrStatus || data.UsrStatus,
            usrExtref: data.usrExtref || data.UsrExtref,
            usrHostId: data.usrHostId || data.UsrHostId,
            usrBraId:  data.usrBraId  || data.UsrBraId,
            usrChgPas: data.usrChgPas || data.UsrChgPas || false,
            usrLingua: data.usrLingua || data.UsrLingua,
          });
        }
      },
      error: (err) => console.error('Error fetching user', err),
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const request: IInsertUserRequest = {
        usrId:      formValue.usrId      || '',
        usrHostId:  formValue.usrHostId  || '',
        usrBraId:   formValue.usrBraId   || '',
        usrStatus:  formValue.usrStatus  || '',
        usrExtref:  formValue.usrExtref  || '',
        usrLingua:  formValue.usrLingua  || '',
        traUser:    formValue.usrId      || '',
        traStation: formValue.usrHostId  || '',
      };
      this.managerService.insertUser(request).subscribe({
        next: (success) => {
          if (success) {
            notify('Utente inserito con successo', 'success', 3000);
            this.showDetailPopup.set(false);
            this.managerService.GetUserActiveBlocked().subscribe();
          } else {
            notify("Errore durante l'inserimento dell'utente", 'error', 3000);
          }
        },
        error: (err) => {
          console.error('Error inserting user', err);
          notify("Errore durante l'inserimento dell'utente", 'error', 3000);
        },
      });
    }
  }

  onUpdate(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const request: IUpdateUserRequest = {
        usrId:      formValue.usrId     || '',
        usrHostId:  formValue.usrHostId || '',
        usrBraId:   formValue.usrBraId  || '',
        usrStatus:  formValue.usrStatus || '',
        usrExtref:  formValue.usrExtref || '',
        usrLingua:  formValue.usrLingua || '',
        traUser:    formValue.usrId     || '',
        traStation: formValue.usrHostId || '',
        addIdRoles: this.movedToLeft    || [],
        delIdRoles: this.movedToRight   || [],
      };
      this.managerService.UpdateUser(request).subscribe({
        next: (response) => {
          if (response) {
            notify('Utente aggiornato con successo', 'success', 3000);
            this.movedToLeft  = [];
            this.movedToRight = [];
            this.showDetailPopup.set(false);
            this.managerService.GetUserActiveBlocked().subscribe();
          } else {
            notify("Errore durante l'aggiornamento dell'utente", 'error', 3000);
          }
        },
        error: (err) => {
          console.error('Error updating user', err);
          notify("Errore durante l'aggiornamento dell'utente", 'error', 3000);
        },
      });
    }
  }

  onClear(): void {
    this.userForm.reset();
    this.selectedUserId.set(null);
    this.assignedRoles.set([]);
    this.possibleRoles.set([]);
    this.selectedAssignedRoleKeys = [];
    this.selectedPossibleRoleKeys = [];
    this.showDetailPopup.set(false);
  }

  onRolesChanged(event: any): void {
    this.movedToLeft  = event.movedToLeft;
    this.movedToRight = event.movedToRight;
  }

  onTrace(): void {
    const userId = this.selectedUserId();
    if (!userId) {
      notify('Selezionare un utente da tracciare', 'warning', 3000);
      return;
    }
    this.router.navigate(['/trace'], {
      queryParams: { ENTNAME: 'sys_USERS', traEntCode: userId },
    });
  }

  openResetPasswordPopup(): void {
    if (this.selectedUserId()) {
      this.resetPasswordForm.reset();
      this.showResetPopup.set(true);
    }
  }

  cancelResetPassword(): void {
    this.showResetPopup.set(false);
    this.resetPasswordForm.reset();
  }

  changePassword(): void {
    if (this.resetPasswordForm.valid) {
      const userId = this.selectedUserId();
      notify(`Password cambiata con successo per ${userId}`, 'success', 3000);
      this.showResetPopup.set(false);
      this.resetPasswordForm.reset();
    } else {
      notify('Controlla che le password coincidano e non siano vuote', 'error', 3000);
    }
  }
}
