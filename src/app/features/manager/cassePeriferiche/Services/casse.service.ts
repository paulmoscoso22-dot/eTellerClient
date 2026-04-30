import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ClientResponse, DeleteClientRequest, InsertClientRequest, UpdateClientRequest } from '../../../../core/domain/client.domain';
import { DeviceResponse } from '../models/device.models';

@Injectable({
  providedIn: 'root'
})
export class CasseService {
  private api = inject(ApiService);

  getClients(): Observable<ClientResponse[]> {
    return this.api.post<ClientResponse[]>('/Client/GetClient', {});
  }

  insertClient(request: InsertClientRequest): Observable<ClientResponse> {
    return this.api.post<ClientResponse>('/Client/InsertClient', request);
  }

  updateClient(request: UpdateClientRequest): Observable<ClientResponse> {
    return this.api.put<ClientResponse>('/Client/UpdateClient', request);
  }

  deleteClient(request: DeleteClientRequest): Observable<boolean> {
    return this.api.deleteWithBody<boolean>('/Client/DeleteClient', request);
  }

  getDevicesByBranch(braId: string): Observable<DeviceResponse[]> {
    return this.api.get<DeviceResponse[]>(`/Device/GetDevicesByBranch?braId=${encodeURIComponent(braId)}`);
  }

  getClientDevices(cliId: string): Observable<number[]> {
    return this.api.get<number[]>(`/Device/GetClientDevices?cliId=${encodeURIComponent(cliId)}`);
  }
}
