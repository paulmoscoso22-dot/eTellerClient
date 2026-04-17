import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule, DxSelectBoxModule, DxValidatorModule, DxPopupModule } from 'devextreme-angular';
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
import { it } from 'node:test';
import { Router } from '@angular/router';

@Component({
  selector: 'app-utenti',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, ReactiveFormsModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule, DxSelectBoxModule, DxValidatorModule, DxPopupModule, TableUtentiComponent, ControlAssignComponent],
  templateUrl: './utenti.component.html',
  styleUrls: ['./utenti.component.css'],
})
export class UtentiComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly coreService = inject(Service);
  private fb = inject(FormBuilder);
  private readonly router = inject(Router);
  
  public users$: Observable<ISysUsersActiveAndBlockedResponse[]> = this.managerService.usersActiveBlocked$;
  public languages$: Observable<ISTLanguageResponse[]> = this.coreService.languages$;
  public branches$: Observable<Branch[]> = this.coreService.branches$;
  public statiEntita$: Observable<ISTStatoEntitaResponse[]> = this.coreService.allStatiEntita$;
  public rolesByUser$: Observable<ISysRoleResonse[]> = this.managerService.rolesByUser$;
  public rolesNotForUser$: Observable<ISysRoleResonse[]> = this.managerService.rolesNotForUser$;

  public assignedRoles = signal<ISysRoleResonse[]>([]);
  public possibleRoles = signal<ISysRoleResonse[]>([]);
  public selectedAssignedRoleKeys: number[] = [];
  public selectedPossibleRoleKeys: number[] = [];


  public movedToLeft: number[] = [];
  public movedToRight: number[] = [];

  public selectedUserId = signal<string | null>(null);
  
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

  ngOnInit(): void {
    this.managerService.GetUserActiveBlocked().subscribe();
    this.coreService.GetLanguages().subscribe();
    this.coreService.getBranches().subscribe();
    this.coreService.GetAllStatiEntita().subscribe();

    this.managerService.rolesByUser$.subscribe((roles) => {
      this.assignedRoles.set(roles ? [...roles] : []);
      this.selectedAssignedRoleKeys = [];
    });

    this.managerService.rolesNotForUser$.subscribe((roles) => {
      this.possibleRoles.set(roles ? [...roles] : []);
      this.selectedPossibleRoleKeys = [];
    });
  }

  onSelectionChanged(e: any): void {
    const selectedItem = e.selectedRowsData[0];
    if (selectedItem && (selectedItem.usrId || selectedItem.UsrId)) {
      const userId = selectedItem.usrId || selectedItem.UsrId;
      this.selectedUserId.set(userId);
      this.loadUserData(userId);
      this.loadUserRoles(userId);
      this.loadRolesNotForUser(userId);
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
    // Clear selections in the user table component
    if (this.tableUtenti) {
      this.tableUtenti.clearSelection();
    }
    this.selectedUserId.set(null);
    // Reset the roles data and tables
    this.assignedRoles.set([]);
    this.possibleRoles.set([]);
    this.selectedAssignedRoleKeys = [];
    this.selectedPossibleRoleKeys = [];
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
      const password = this.resetPasswordForm.get('password')?.value;
      const userId = this.selectedUserId();
      // Implement password reset logic with the ManagerService
      // this.managerService.resetPassword(userId, password).subscribe(...)
      notify(`Password cambiata con successo per ${userId}`, 'success', 3000);
      this.isResetPasswordPopupVisible = false;
      this.resetPasswordForm.reset();
    } else {
      notify('Controlla che le password coincidano e non siano vuote', 'error', 3000);
    }
  }

}
