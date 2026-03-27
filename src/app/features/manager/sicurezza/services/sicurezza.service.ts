import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../../services/api.service';
import { GetAllUsersByUsrIdRequest, InfoAutorizzazioneUtenteResponse, SysFunctionsResponse, GetSysFunctionByFunIdRequest, GetSysRoleByFunIdRequest, SysRoleResponse, GetUsersRoleFunIdRequest, UsersRoleFunctionResponse, InsertSysFunctionRequest, UpdateSysFunctionRequest, DeleteSysFunctionRequest } from '../models/manager.models';
import { environment } from '../../../../../environments/environment';
import { AuthTemp } from '../../../../features/auth/auth.facade';

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
  
  private usersRoleFunctionSubject = new BehaviorSubject<UsersRoleFunctionResponse[]>([]);
  public usersRoleFunction$ = this.usersRoleFunctionSubject.asObservable();

  private insertSysFunctionSubject = new BehaviorSubject<boolean>(false);
  public insertSysFunction$ = this.insertSysFunctionSubject.asObservable();

  private updateSysFunctionSubject = new BehaviorSubject<boolean>(false);
  public updateSysFunction$ = this.updateSysFunctionSubject.asObservable();

  private deleteSysFunctionSubject = new BehaviorSubject<boolean>(false);
  public deleteSysFunction$ = this.deleteSysFunctionSubject.asObservable();

  constructor() {
    // Optionally, you can load initial data here

  }


  getAllUsersByUsrId(request: GetAllUsersByUsrIdRequest): Observable<InfoAutorizzazioneUtenteResponse[]> {
    return this.apiService.post<InfoAutorizzazioneUtenteResponse[]>(
      `/Manager/GetAllUsersByUsrId?tutti=${request.tutti}`,
      request
    ).pipe(
      tap(data => this.userAuthorizationsSubject.next(data))
    );
  }
  //funzioni
  getSysFunctions(): Observable<SysFunctionsResponse[]> {
    return this.apiService.post<SysFunctionsResponse[]>(
      `/Manager/GetSysFunctions`,
      {}
    ).pipe(
      tap(data => this.sysFunctionsSubject.next(data))
    );
  }

  getSysFunctionByFunId(request: GetSysFunctionByFunIdRequest): Observable<SysFunctionsResponse> {
    return this.apiService.post<SysFunctionsResponse>(
      `/Manager/GetSysFunctionByFunId`,
      request
    ).pipe(
      tap(data => this.sysFunctionSubject.next(data))
    );
  }

  getSysRoleByFunId(request: GetSysRoleByFunIdRequest): Observable<SysRoleResponse[]> {
    return this.apiService.post<SysRoleResponse[]>(
      `/Manager/GetSysRoleByFunId`,
      request
    ).pipe(
      tap(data => this.sysRoleSubject.next(data))
    );
  }

  getUsersRoleFunId(request: GetUsersRoleFunIdRequest): Observable<UsersRoleFunctionResponse[]> {
    return this.apiService.post<UsersRoleFunctionResponse[]>(
      `/Manager/GetUsersRoleFunId`,
      request
    ).pipe(
      tap(data => this.usersRoleFunctionSubject.next(data))
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

}
