import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../../services/api.service';
import { GetTraceAllRequest, GetTraceByIdRequest, TraceResponse, TraceWithFunctionResponse, GetTraceWithFunctionRequest, StTracefunctionResponse, SysUsersActiveAndBlockedResponse, ClientResponse, GetTabellaServVarcharRequest, GetTabellaServVarcharByIdRequest, TabellaServVarcharResponse } from '../models/informazioni.models';

@Injectable({
  providedIn: 'root'
})
export class InformazioniService {
  private _traces = new BehaviorSubject<TraceResponse[]>([]);
  public traces$ = this._traces.asObservable();
  private _trace = new BehaviorSubject<TraceResponse | null>(null);
  public trace$ = this._trace.asObservable();
  private _traceFunctions = new BehaviorSubject<StTracefunctionResponse[]>([]);
  public traceFunctions$ = this._traceFunctions.asObservable();
  private _activeBlockedUsers = new BehaviorSubject<SysUsersActiveAndBlockedResponse[]>([]);
  public activeBlockedUsers$ = this._activeBlockedUsers.asObservable();
  private _clients = new BehaviorSubject<ClientResponse[]>([]);
  public clients$ = this._clients.asObservable();
  private _tabellaServVarchar = new BehaviorSubject<TabellaServVarcharResponse[]>([]);
  public tabellaServVarchar$ = this._tabellaServVarchar.asObservable();

  private _tabellaServVarcharsingle = new BehaviorSubject<TabellaServVarcharResponse | null>(null);
  public tabellaServVarcharsingle$ = this._tabellaServVarcharsingle.asObservable();

  constructor(private api: ApiService) {}

  //Trace
  postGetTraceAll(request: GetTraceAllRequest): Observable<TraceResponse[]> {
    const url = `/Trace/GetTraceAll`;
    return this.api.post<TraceResponse[]>(url, request).pipe(
      tap((res: TraceResponse[]) => this._traces.next(res))
    );
  }

  /**
   * Retrieve trace functions from the API and update internal observable.
   * No request body is required by the backend endpoint.
   */
  postGetTraceFunction(): Observable<StTracefunctionResponse[]> {
    const url = `/Trace/GetTraceFunction`;
    return this.api.post<StTracefunctionResponse[]>(url, {}).pipe(
      tap((res: StTracefunctionResponse[]) => this._traceFunctions.next(res))
    );
  }

  /**
   * Retrieve active and blocked users from the API and update internal observable.
   */
  postGetActiveAndBlockedUsers(): Observable<SysUsersActiveAndBlockedResponse[]> {
    const url = `/User/GetActiveAndBlockedUsers`;
    return this.api.post<SysUsersActiveAndBlockedResponse[]>(url, {}).pipe(
      tap((res: SysUsersActiveAndBlockedResponse[]) => this._activeBlockedUsers.next(res))
    );
  }

  /**
   * Retrieve clients from the API and update internal observable.
   */
  postGetClient(): Observable<ClientResponse[]> {
    const url = `/Client/GetClient`;
    return this.api.post<ClientResponse[]>(url, {}).pipe(
      tap((res: ClientResponse[]) => this._clients.next(res))
    );
  }

  /**
   * Retrieve TabellaServVarchar entries from the API and update internal observable.
   */
  postGetTabellaServVarchar(request: GetTabellaServVarcharRequest): Observable<TabellaServVarcharResponse[]> {
    const url = `/Tabella/GetTabellaServVarchar`;
    return this.api.post<TabellaServVarcharResponse[]>(url, request).pipe(
      tap((res: TabellaServVarcharResponse[]) => this._tabellaServVarchar.next(res))
    );
  }

  /**
   * Retrieve TabellaServVarchar entries by id from the API and update internal observable.
   */
  postGetTabellaServVarcharById(request: GetTabellaServVarcharByIdRequest): Observable<TabellaServVarcharResponse> {
    const url = `/Tabella/GetTabellaServVarcharById`;
    return this.api.post<TabellaServVarcharResponse>(url, request).pipe(
      tap((res: TabellaServVarcharResponse) => this._tabellaServVarcharsingle.next(res))
    );
  }

  getClientsValue(): ClientResponse[] {
    return this._clients.value;
  }
  getTabellaServVarcharValue(): TabellaServVarcharResponse[] {
    return this._tabellaServVarchar.value;
  }

  postGetTraceById(request: GetTraceByIdRequest): Observable<TraceResponse> {
    const url = `/Trace/TraceById`;
    return this.api.post<TraceResponse>(url, request).pipe(
      tap((res: TraceResponse) => this._trace.next(res))
    );
  }

}
