import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../../services/api.service';
import { GetAllUsersByUsrIdRequest, InfoAutorizzazioneUtenteResponse, SysFunctionsResponse, GetSysRoleByFunIdRequest, SysRoleResponse, GetUsersRoleFunIdRequest, UsersRoleFunctionResponse } from '../models/manager.models';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private readonly apiService = inject(ApiService);

  private userAuthorizationsSubject = new BehaviorSubject<InfoAutorizzazioneUtenteResponse[]>([]);
  public userAuthorizations$ = this.userAuthorizationsSubject.asObservable();

  private sysFunctionsSubject = new BehaviorSubject<SysFunctionsResponse[]>([]);
  public sysFunctions$ = this.sysFunctionsSubject.asObservable();

  private sysRoleSubject = new BehaviorSubject<SysRoleResponse[]>([]);
  public sysRole$ = this.sysRoleSubject.asObservable();
  
  private usersRoleFunctionSubject = new BehaviorSubject<UsersRoleFunctionResponse[]>([]);
  public usersRoleFunction$ = this.usersRoleFunctionSubject.asObservable();

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

}
