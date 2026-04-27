import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../../services/api.service';
import { IClientResponse, IGetClientByIdQuery } from '../models/cliente.models';
import { IDeviceResponse, IGetDeviceByBraIdNotCliIdRequest, IGetDeviceByCliIdRequest } from '../models/device.models';

@Injectable({
  providedIn: 'root',
})
export class CassePeriferichService {
  private readonly apiService = inject(ApiService);

  private _clients = new BehaviorSubject<IClientResponse[]>([]);
  public clients$ = this._clients.asObservable();

  private _client = new BehaviorSubject<IClientResponse | null>(null);
  public client$ = this._client.asObservable();

  //metodo client region
  postGetClient(): Observable<IClientResponse[]> {
    return this.apiService.post<IClientResponse[]>('/Client/GetClient', {}).pipe(
      tap((res: IClientResponse[]) => this._clients.next(res))
    );
  }

  postGetClientById(request: IGetClientByIdQuery): Observable<IClientResponse> {
    return this.apiService.post<IClientResponse>('/Client/GetClientById', request).pipe(
      tap((res: IClientResponse) => this._client.next(res))
    );
  }

  //fine metodo client region

  //metodo device region
  private _devices = new BehaviorSubject<IDeviceResponse[]>([]);
  public devices$ = this._devices.asObservable();

  postGetDeviceByBraIdNotCliId(request: IGetDeviceByBraIdNotCliIdRequest): Observable<IDeviceResponse[]> {
    return this.apiService.post<IDeviceResponse[]>('/Device/GetDeviceByBraIdNotCliId', request).pipe(
      tap((res: IDeviceResponse[]) => this._devices.next(res))
    );
  }

  private _devicesByCliId = new BehaviorSubject<IDeviceResponse[]>([]);
  public devicesByCliId$ = this._devicesByCliId.asObservable();

  postGetDeviceByCliId(request: IGetDeviceByCliIdRequest): Observable<IDeviceResponse[]> {
    return this.apiService.post<IDeviceResponse[]>('/Device/GetDeviceByCliId', request).pipe(
      tap((res: IDeviceResponse[]) => this._devicesByCliId.next(res))
    );
  }
  //fine metodo device region
}
