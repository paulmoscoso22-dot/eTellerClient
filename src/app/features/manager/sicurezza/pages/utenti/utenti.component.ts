import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule, DxSelectBoxModule, DxValidatorModule, DxPopupModule, DxRadioGroupModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ManagerService } from '../../services/sicurezza.service';
import { ISysUsersActiveAndBlockedResponse, GetUsersByUserIdRequest, InsertUserResponse, IUpdateUserRequest } from '../../models/utenti.models';
import { ISysRoleResonse, GetRoleByUsrIdRequest, IGetRoleNotForUsrIdRquest } from '../../models/ruoli.models';
import { Observable } from 'rxjs';
import { TableUtentiComponent } from '../../components/table-utenti/table-utenti.component';
import { ControlAssignComponent } from '../../../../../components/control-assign/control-assign.component';
import { Service } from '../../../../../core/services/service';
import { ISTLanguageResponse } from '../../../../../core/domain/laguage.domain';
import { Branch } from '../../../../../core/domain/branch.domain';
import { ISTStatoEntitaResponse } from '../../../../../core/domain/stato-entita.domain';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-utenti',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, ReactiveFormsModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule, DxSelectBoxModule, DxValidatorModule, DxPopupModule, DxRadioGroupModule, TableUtentiComponent, ControlAssignComponent, TranslocoPipe],
  templateUrl: './utenti.component.html',
  styleUrls: ['./utenti.component.css'],
})
export class UtentiComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly coreService = inject(Service);
  private fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly filterItems = [
    { value: 'activeBlocked', labelKey: 'utenti.filterActiveBlocked' },
    { value: 'all',           labelKey: 'utenti.filterAll' },
  ];
  selectedFilter = signal<string>('activeBlocked');

  // Status codes returned by GetUserActiveBlocked — used to rebuild the grid filter
  private activeblockedStatusIds: string[] = [];
  gridFilterValue = signal<any>(null);

  public users$: Observable<ISysUsersActiveAndBlockedResponse[]> = this.managerService.usersActiveBlocked$;
  public rolesByUser$: Observable<ISysRoleResonse[]> = this.managerService.rolesByUser$;
  public rolesNotForUser$: Observable<ISysRoleResonse[]> = this.managerService.rolesNotForUser$;

  // Array locali per i select box: evitano il problema di timing con l'async pipe
  statiEntitaList: ISTStatoEntitaResponse[] = [];
  branchesList: Branch[] = [];
  languagesList: ISTLanguageResponse[] = [];

  public assignedRoles = signal<ISysRoleResonse[]>([]);
  public possibleRoles = signal<ISysRoleResonse[]>([]);
  public selectedAssignedRoleKeys: number[] = [];
  public selectedPossibleRoleKeys: number[] = [];


  public movedToLeft: number[] = [];
  public movedToRight: number[] = [];

  public selectedUserId = signal<string | null>(null);
  popupMode   = signal<'new' | 'view' | 'edit'>('new');
  searchValue = signal<string>('');

  isDetailPopupVisible = false;
  public isResetPasswordPopupVisible = false;

  @ViewChild(TableUtentiComponent) tableUtenti!: TableUtentiComponent;

  userForm: FormGroup = this.fb.group({
    usrId: ['', Validators.required],
    usrStatus: ['', Validators.required],
    usrExtref: [''],
    usrHostId: ['', Validators.required],
    usrBraId: ['', Validators.required],
    usrChgPas: [false],
    usrLingua: ['', Validators.required]
  });

  resetPasswordForm: FormGroup = this.fb.group({
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onFilterChanged(e: any): void {
    const value = e.value as string;
    this.selectedFilter.set(value);
    if (value === 'all') {
      this.gridFilterValue.set(null);
    } else {
      this.gridFilterValue.set(this.buildActiveblockedFilter());
    }
    this.onClear();
  }

  onSearchChanged(e: any): void {
    this.searchValue.set(e.value ?? '');
  }

  private buildActiveblockedFilter(): any {
    if (this.activeblockedStatusIds.length === 0) return null;
    if (this.activeblockedStatusIds.length === 1) {
      return ['usrStatus', '=', this.activeblockedStatusIds[0]];
    }
    return this.activeblockedStatusIds
      .map(id => ['usrStatus', '=', id] as any[])
      .reduce((acc: any, curr: any) => [acc, 'or', curr]);
  }

  ngOnInit(): void {
    this.managerService.GetUserActiveBlocked().subscribe();
    this.managerService.usersActiveBlocked$.subscribe(data => {
      this.activeblockedStatusIds = [...new Set(data.map(u => u.usrStatus))];
      if (this.selectedFilter() === 'activeBlocked') {
        this.gridFilterValue.set(this.buildActiveblockedFilter());
      }
    });
    this.coreService.GetLanguages().subscribe();
    this.coreService.getBranches().subscribe();
    this.coreService.GetAllStatiEntita().subscribe();

    this.coreService.languages$.subscribe(data => { if (data?.length) this.languagesList = data; });
    this.coreService.branches$.subscribe(data => { if (data?.length) this.branchesList = data; });
    this.coreService.allStatiEntita$.subscribe(data => { if (data?.length) this.statiEntitaList = data; });

    this.managerService.rolesByUser$.subscribe((roles) => {
      this.assignedRoles.set(roles ? [...roles] : []);
      this.selectedAssignedRoleKeys = [];
    });

    this.managerService.rolesNotForUser$.subscribe((roles) => {
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
    this.isDetailPopupVisible = true;
  }

  openViewPopup(data: any): void {
    const userId = data.usrId || data.UsrId;
    this.selectedUserId.set(userId);
    this.loadUserData(userId);
    this.loadUserRoles(userId);
    this.loadRolesNotForUser(userId);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: any): void {
    const userId = data.usrId || data.UsrId;
    this.selectedUserId.set(userId);
    this.loadUserData(userId);
    this.loadUserRoles(userId);
    this.loadRolesNotForUser(userId);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

   onTableAction(event: { action: string; data: any }): void {
     switch (event.action) {
       case 'view':
         this.openViewPopup(event.data);
         break;
       case 'edit':
         this.openEditPopup(event.data);
         break;
       case 'resetPwd':
         this.selectedUserId.set(event.data.usrId || event.data.UsrId);
         this.openResetPasswordPopup();
         break;
       case 'storico':
         this.selectedUserId.set(event.data.usrId || event.data.UsrId);
         this.onTrace();
         break;
       case 'print':
         break;
     }
   }

  onStampaLista(): void {
    if (typeof window !== 'undefined' && (window as any).print) {
      (window as any).print();
    } else {
      console.log('Stampa lista utenti richiesta');
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

  loadRolesNotForUser(userId: string): void {
    const request: IGetRoleNotForUsrIdRquest = { usrId: userId };
    this.managerService.GetRoleNotForUsrId(request).subscribe({
      error: (err) => console.error('Error fetching unassigned roles', err)
    });
  }

  loadUserRoles(userId: string): void {
    const request: GetRoleByUsrIdRequest = { usrId: userId };
    this.managerService.GetRoleByUsrId(request).subscribe({
      error: (err) => console.error('Error fetching user roles', err)
    });
  }

  loadUserData(userId: string): void {
    const request: GetUsersByUserIdRequest = { usrId: userId };
    
    this.managerService.GetUserByUserId(request).subscribe({
      next: (response: any) => {
        // Handles case where response might be wrapped in an array or 'data' property
        const data = Array.isArray(response) ? response[0] : (response?.data || response);
        
        if (data) {
          this.userForm.patchValue({
            usrId: data.usrId || data.UsrId,
            usrStatus: data.usrStatus || data.UsrStatus,
            usrExtref: data.usrExtref || data.UsrExtref,
            usrHostId: data.usrHostId || data.UsrHostId,
            usrBraId: data.usrBraId || data.UsrBraId,
            usrChgPas: data.usrChgPas || data.UsrChgPas || false,
            usrLingua: data.usrLingua || data.UsrLingua
          });
        }
      },
      error: (err) => console.error('Error fetching user', err)
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const request: InsertUserResponse = {
        usrId: formValue.usrId || '',
        usrHostId: formValue.usrHostId || '',
        usrBraId: formValue.usrBraId || '',
        usrStatus: formValue.usrStatus || '',
        usrExtref: formValue.usrExtref || '',
        usrLingua: formValue.usrLingua || '',
        traUser: formValue.usrId || '',
        traStation: formValue.usrHostId || ''
      };
      //console.log('Submitting user data:', request);
      this.managerService.insertUser(request).subscribe({
        next: (success) => {
          if (success) {
            notify('User inserted successfully', 'success', 3000);
            // Optionally, refresh list or reset form
            this.managerService.GetUserActiveBlocked().subscribe();
          } else {
            notify('Failed to insert user', 'error', 3000);
          }
        },
        error: (err) => {
          console.error('Error inserting user', err);
          notify('Error inserting user', 'error', 3000);
        }
      });
    }
  }

  onUpdate(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const request: IUpdateUserRequest = {
        usrId: formValue.usrId || '',
        usrHostId: formValue.usrHostId || '',
        usrBraId: formValue.usrBraId || '',
        usrStatus: formValue.usrStatus || '',
        usrExtref: formValue.usrExtref || '',
        usrLingua: formValue.usrLingua || '',
        addIdRoles: this.movedToLeft || [],
        delIdRoles: this.movedToRight || []
      };

      
      console.log('Updating user data:', request);
      this.managerService.UpdateUser(request).subscribe({
        next: (response) => {
          if (response) {
            notify('User updated successfully', 'success', 3000);
            this.movedToLeft = [];
            this.movedToRight = [];
            this.managerService.GetUserActiveBlocked().subscribe();
          } else {
            notify('Failed to update user', 'error', 3000);
          }
        },
        error: (err) => {
          console.error('Error updating user', err);
          notify('Error updating user', 'error', 3000);
        }
      });
    }
  }

  onClear(): void {
    this.userForm.reset();
    if (this.tableUtenti) {
      this.tableUtenti.clearSelection();
    }
    this.selectedUserId.set(null);
    this.assignedRoles.set([]);
    this.possibleRoles.set([]);
    this.selectedAssignedRoleKeys = [];
    this.selectedPossibleRoleKeys = [];
    this.isDetailPopupVisible = false;
  }

  onRolesChanged(event: any): void {
    this.movedToLeft = event.movedToLeft;
    this.movedToRight = event.movedToRight;
  }

   onTrace(): void {
    const userId = this.selectedUserId();
    if (!userId) {
      notify('Selezionare un utente da tracciare', 'warning', 3000);
      return;
    }
    this.router.navigate(['/trace'], {
      queryParams: {
        ENTNAME: 'sys_USERS',
        traEntCode: userId
      }
    });
  }

  openResetPasswordPopup(): void {
    if (this.selectedUserId()) {
      this.resetPasswordForm.reset();
      this.isResetPasswordPopupVisible = true;
    }
  }

  cancelResetPassword(): void {
    this.isResetPasswordPopupVisible = false;
    this.resetPasswordForm.reset();
  }

  changePassword(): void {
    if (this.resetPasswordForm.valid) {
      const userId = this.selectedUserId();
      // TODO: this.managerService.resetPassword(userId, this.resetPasswordForm.get('password')?.value).subscribe(...)
      notify(`Password cambiata con successo per ${userId}`, 'success', 3000);
      this.isResetPasswordPopupVisible = false;
      this.resetPasswordForm.reset();
    } else {
      notify('Controlla che le password coincidano e non siano vuote', 'error', 3000);
    }
  }

}
