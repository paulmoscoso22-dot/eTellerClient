import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { IForceTrxGetAllRequest, IForceTrxGetByIdRequest, IForceTrxItemResponse } from '../models/force-trx.models';

@Injectable({ providedIn: 'root' })
export class ForceTrxService {
  private readonly api = inject(ApiService);

  getAll(lanCode: string): Observable<IForceTrxItemResponse[]> {
    const body: IForceTrxGetAllRequest = { lanCode };
    return this.api.post<IForceTrxItemResponse[]>('manager/ForceTrx/GetAllForceTrx', body);
  }

  getById(lanCode: string, trfId: number): Observable<IForceTrxItemResponse[]> {
    const body: IForceTrxGetByIdRequest = { lanCode, trfId };
    return this.api.post<IForceTrxItemResponse[]>('manager/ForceTrx/GetForceTrxById', body);
  }
}
