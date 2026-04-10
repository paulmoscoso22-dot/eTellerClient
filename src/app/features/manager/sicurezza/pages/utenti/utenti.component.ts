import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule, DxSelectBoxModule } from 'devextreme-angular';
import { ManagerService } from '../../services/sicurezza.service';
import { ISysUsersActiveAndBlockedResponse, GetUsersByUserIdRequest } from '../../models/utenti.models';
import { ISysRoleResonse, GetRoleByUsrIdRequest, IGetRoleNotForUsrIdRquest } from '../../models/ruoli.models';
import { Observable } from 'rxjs';
import { TableUtentiComponent } from '../../components/table-utenti/table-utenti.component';
import { Service } from '../../../../../core/services/service';
import { ISTLanguageResponse } from '../../../../../core/domain/laguage.domain';
import { Branch } from '../../../../../core/domain/branch.domain';
import { ISTStatoEntitaResponse } from '../../../../../core/domain/stato-entita.domain';

@Component({
  selector: 'app-utenti',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, ReactiveFormsModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule, DxSelectBoxModule, TableUtentiComponent],
  templateUrl: './utenti.component.html',
  styleUrls: ['./utenti.component.css'],
})
export class UtentiComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly coreService = inject(Service);
  private fb = inject(FormBuilder);
  
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

  userForm: FormGroup = this.fb.group({
    usrId: [''],
    usrStatus: [''],
    usrExtref: [''],
    usrHostId: [''],
    usrBraId: [''],
    usrChgPas: [false],
    usrLingua: ['']
  });

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
      this.loadUserData(userId);
      this.loadUserRoles(userId);
      this.loadRolesNotForUser(userId);
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
    console.log(this.userForm.value);
  }

  addRole(): void {
    const rolesToAdd = this.possibleRoles().filter(r => this.selectedPossibleRoleKeys.includes(r.roleId));
    if (rolesToAdd.length > 0) {
      this.assignedRoles.update(roles => [...roles, ...rolesToAdd]);
      this.possibleRoles.update(roles => roles.filter(r => !this.selectedPossibleRoleKeys.includes(r.roleId)));
      this.selectedPossibleRoleKeys = [];
    }
  }

  removeRole(): void {
    const rolesToRemove = this.assignedRoles().filter(r => this.selectedAssignedRoleKeys.includes(r.roleId));
    if (rolesToRemove.length > 0) {
      this.possibleRoles.update(roles => [...roles, ...rolesToRemove]);
      this.assignedRoles.update(roles => roles.filter(r => !this.selectedAssignedRoleKeys.includes(r.roleId)));
      this.selectedAssignedRoleKeys = [];
    }
  }
}
