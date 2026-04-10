import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../../services/api.service';
import { GetAllUsersByUsrIdRequest, InfoAutorizzazioneUtenteResponse, SysFunctionsResponse, GetSysFunctionByFunIdRequest, GetSysRoleByFunIdRequest, SysRoleResponse, GetUsersRoleFunIdRequest, UsersRoleFunctionResponse, InsertSysFunctionRequest, UpdateSysFunctionRequest, DeleteSysFunctionRequest } from '../models/manager.models';
import { ISysRoleResonse, IGetUserByRoleRequest, IInsertRoleRequest, IUpdateRoleRequest, IDeleteRoleRequest, IGetRoleNotForUsrIdRquest, GetRoleByUsrIdRequest, IUserSelectRoleResponse } from '../models/ruoli.models';
import { IGetFunctionRoleByRoleIdRequest, IFunctionRoleResponse, IStFunAcctypResponse } from '../models/function.models';
import { PersonalisationResponse, UpdatePersonalisationRequest } from '../models/personalisation.models';
import { AuthTemp } from '../../../../features/auth/auth.facade';
import { ISysUsersActiveAndBlockedResponse, GetUsersByUserIdRequest, ISysUserByIdResponse } from '../models/utenti.models';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private readonly apiService = inject(ApiService);
  private readonly authTemp = new AuthTemp();

  private userAuthorizationsSubject = new BehaviorSubject<InfoAutorizzazioneUtenteResponse[]>([]);
  public userAuthorizations$ = this.userAuthorizationsSubject.asObservable();

  private sysFunctionsSubject = new BehaviorSubject<SysFunctionsResponse[]>([]);
  public sysFunctions$ = this.sysFunctionsSubject.asObservable();

  private sysFunctionSubject = new BehaviorSubject<SysFunctionsResponse | null>(null);
  public sysFunction$ = this.sysFunctionSubject.asObservable();

  private sysRoleSubject = new BehaviorSubject<SysRoleResponse[]>([]);
  public sysRole$ = this.sysRoleSubject.asObservable();
  private allRolesSubject = new BehaviorSubject<ISysRoleResonse[]>([]);
  public allRoles$ = this.allRolesSubject.asObservable();

  private usersByRoleSubject = new BehaviorSubject<IUserSelectRoleResponse[]>([]);
  public usersByRole$ = this.usersByRoleSubject.asObservable();

  private rolesByUserSubject = new BehaviorSubject<ISysRoleResonse[]>([]);
  public rolesByUser$ = this.rolesByUserSubject.asObservable();

  private rolesNotForUserSubject = new BehaviorSubject<ISysRoleResonse[]>([]);
  public rolesNotForUser$ = this.rolesNotForUserSubject.asObservable();

  private functionRoleByRoleIdSubject = new BehaviorSubject<IFunctionRoleResponse[]>([]);
  public functionRoleByRoleId$ = this.functionRoleByRoleIdSubject.asObservable();

  private funcAccTypSubject = new BehaviorSubject<IStFunAcctypResponse[]>([]);
  public funcAccTyp$ = this.funcAccTypSubject.asObservable();
  
  private usersRoleFunctionSubject = new BehaviorSubject<UsersRoleFunctionResponse[]>([]);
  public usersRoleFunction$ = this.usersRoleFunctionSubject.asObservable();

  private insertSysFunctionSubject = new BehaviorSubject<boolean>(false);
  public insertSysFunction$ = this.insertSysFunctionSubject.asObservable();

  private insertRoleSubject = new BehaviorSubject<SysRoleResponse | null>(null);
  public insertRole$ = this.insertRoleSubject.asObservable();

  private updateRoleSubject = new BehaviorSubject<SysRoleResponse | null>(null);
  public updateRole$ = this.updateRoleSubject.asObservable();

  private deleteRoleSubject = new BehaviorSubject<boolean>(false);
  public deleteRole$ = this.deleteRoleSubject.asObservable();

  private updateSysFunctionSubject = new BehaviorSubject<boolean>(false);
  public updateSysFunction$ = this.updateSysFunctionSubject.asObservable();

  private deleteSysFunctionSubject = new BehaviorSubject<boolean>(false);
  public deleteSysFunction$ = this.deleteSysFunctionSubject.asObservable();

  private personalisationSubject = new BehaviorSubject<PersonalisationResponse[]>([]);
  public personalisation$ = this.personalisationSubject.asObservable();

  private usersActiveBlockedSubject = new BehaviorSubject<ISysUsersActiveAndBlockedResponse[]>([]);
  public usersActiveBlocked$ = this.usersActiveBlockedSubject.asObservable();

  private userByIdSubject = new BehaviorSubject<ISysUserByIdResponse | null>(null);
  public userById$ = this.userByIdSubject.asObservable();

 //#Region user
  getAllUsersByUsrId(request: GetAllUsersByUsrIdRequest): Observable<InfoAutorizzazioneUtenteResponse[]> {
    return this.apiService.post<InfoAutorizzazioneUtenteResponse[]>(
      `/Manager/User/GetAllUsersByUsrId?tutti=${request.tutti}`,
      request
    ).pipe(
      tap(data => this.userAuthorizationsSubject.next(data))
    );
  }
  // #endregion user

  //#Region funzioni
  getSysFunctions(): Observable<SysFunctionsResponse[]> {
    return this.apiService.post<SysFunctionsResponse[]>(
      `/Manager/Function/GetSysFunctions`,
      {}
    ).pipe(
      tap(data => this.sysFunctionsSubject.next(data))
    );
  }

  getSysFunctionByFunId(request: GetSysFunctionByFunIdRequest): Observable<SysFunctionsResponse> {
    return this.apiService.post<SysFunctionsResponse>(
      `/Manager/Function/GetSysFunctionByFunId`,
      request
    ).pipe(
      tap(data => this.sysFunctionSubject.next(data))
    );
  }

    insertSysFunction(request: InsertSysFunctionRequest): Observable<boolean> {
    return this.apiService.post<boolean>(
      `/Manager/InsertSysFunction`,
      request
    ).pipe(
      tap(data => this.insertSysFunctionSubject.next(data))
    );
  }

  updateSysFunction(request: UpdateSysFunctionRequest): Observable<boolean> {
    return this.apiService.put<boolean>(
      `/Manager/UpdateSysFunction`,
      request
    ).pipe(
      tap(data => this.updateSysFunctionSubject.next(data))
    );
  }

  deleteSysFunction(request: DeleteSysFunctionRequest): Observable<boolean> {
    return this.apiService.deleteWithBody<boolean>(
      `/Manager/DeleteSysFunction`,
      request
    ).pipe(
      tap(data => this.deleteSysFunctionSubject.next(data))
    );
  }

  postGetFunctionRoleByRoleId(request: IGetFunctionRoleByRoleIdRequest): Observable<IFunctionRoleResponse[]> {
    return this.apiService.post<IFunctionRoleResponse[]>(
      `/Manager/Function/GetFunctionRoleByRoleId`,
      request
    ).pipe(
      tap(data => this.functionRoleByRoleIdSubject.next(data))
    );
  }

  getFuncAccTyp(): Observable<IStFunAcctypResponse[]> {
    return this.apiService.post<IStFunAcctypResponse[]>(
      `/Manager/Function/GetFuncAccType`,
      {}
    ).pipe(
      tap(data => this.funcAccTypSubject.next(data))
    );
  }

  //#endregion funzioni

  //#Region role
  getSysRoleByFunId(request: GetSysRoleByFunIdRequest): Observable<SysRoleResponse[]> {
    return this.apiService.post<SysRoleResponse[]>(
      `/Manager/Role/GetSysRoleByFunId`,
      request
    ).pipe(
      tap(data => this.sysRoleSubject.next(data))
    );
  }

  getUsersRoleFunId(request: GetUsersRoleFunIdRequest): Observable<UsersRoleFunctionResponse[]> {
    return this.apiService.post<UsersRoleFunctionResponse[]>(
      `/Manager/Role/GetUsersRoleFunId`,
      request
    ).pipe(
      tap(data => this.usersRoleFunctionSubject.next(data))
    );
  }
  //#endregion role


  //#Region personalisation
  getPersonalisation(): Observable<PersonalisationResponse[]> {
    return this.apiService.post<PersonalisationResponse[]>(
      `/Personalisation/GetPersonalisation`,
      {}
    ).pipe(
      tap(data => this.personalisationSubject.next(data))
    );
  }

  updatePersonalisation(request: UpdatePersonalisationRequest): Observable<PersonalisationResponse[]> {
    const url = `/Personalisation/UpdatePersonalisation`;
    return this.apiService.put<PersonalisationResponse[]>(
      url,
      request
    );
  }
  //#endregion personalisation

  //#region  roles

  postGetAllRole(): Observable<ISysRoleResonse[]> {
    return this.apiService.post<ISysRoleResonse[]>(
      `/Manager/Role/GetAllRole`,
      {}
    ).pipe(
      tap(data => this.allRolesSubject.next(data))
    );
  }

  postGetUserByRoleId(request: IGetUserByRoleRequest): Observable<IUserSelectRoleResponse[]> {
    return this.apiService.post<IUserSelectRoleResponse[]>(
      `/Manager/Role/GetUserByRole`,
      request
    ).pipe(
      tap(data => this.usersByRoleSubject.next(data))
    );
  }

  GetRoleByUsrId(request: GetRoleByUsrIdRequest): Observable<ISysRoleResonse[]> {
    return this.apiService.post<ISysRoleResonse[]>(
      `/manager/Role/GetRoleByUsrId`,
      request
    ).pipe(
      tap(data => this.rolesByUserSubject.next(data))
    );
  }

  GetRoleNotForUsrId(request: IGetRoleNotForUsrIdRquest): Observable<ISysRoleResonse[]> {
    return this.apiService.post<ISysRoleResonse[]>(
      `/manager/Role/GetRoleNotForUsrId`,
      request
    ).pipe(
      tap(data => this.rolesNotForUserSubject.next(data))
    );
  }

  insertRole(request: IInsertRoleRequest): Observable<SysRoleResponse> {
    return this.apiService.post<SysRoleResponse>(
      `/Manager/Role/InsertRole`,
      request
    ).pipe(
      tap(data => this.insertRoleSubject.next(data))
    );
  }

  updateRole(request: IUpdateRoleRequest): Observable<SysRoleResponse> {
    return this.apiService.put<SysRoleResponse>(
      `/Manager/Role/UpdateRole`,
      request
    ).pipe(
      tap(data => this.updateRoleSubject.next(data))
    );
  }

  deleteRole(request: IDeleteRoleRequest): Observable<boolean> {
    return this.apiService.deleteWithBody<boolean>(
      `/Manager/Role/DeleteRole`,
      request
    ).pipe(
      tap(data => this.deleteRoleSubject.next(data))
    );
  }

  // #endregion roles
  
  // #region user
  GetUserActiveBlocked(): Observable<ISysUsersActiveAndBlockedResponse[]> {
    return this.apiService.post<ISysUsersActiveAndBlockedResponse[]>(
      `/Manager/User/GetUsersActiveBlocked`,
      {}
    ).pipe(
      tap(data => this.usersActiveBlockedSubject.next(data))
    );
  }

  GetUserByUserId(request: GetUsersByUserIdRequest): Observable<ISysUserByIdResponse> {
    return this.apiService.post<ISysUserByIdResponse>(
      `/Manager/User/GetUsersByUserId`,
      request
    ).pipe(
      tap(data => this.userByIdSubject.next(data))
    );
  }
  // #endregion user
}
