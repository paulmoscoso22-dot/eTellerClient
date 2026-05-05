import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { IDivisaAnagraficaResponse, IDivisaAnagraficaRequest, UpdateDivisaRequest } from '../models/divisa.models';

@Injectable({
  providedIn: 'root'
})
export class DiviseService {
  private api = inject(ApiService);

  getAll(request?: IDivisaAnagraficaRequest): Observable<IDivisaAnagraficaResponse[]> {
    const req: IDivisaAnagraficaRequest = request ?? { curId: null, curLondes: null };
    return this.api.post<IDivisaAnagraficaResponse[]>('/Currency/GetAllCurrencies', req);
  }

  getByKey(curId: string, curCutId: string): Observable<IDivisaAnagraficaResponse> {
    return this.api.get<IDivisaAnagraficaResponse>(
      `/Currency/GetByKey?curId=${encodeURIComponent(curId)}&curCutId=${encodeURIComponent(curCutId)}`
    );
  }

  update(request: UpdateDivisaRequest): Observable<IDivisaAnagraficaResponse> {
    return this.api.put<IDivisaAnagraficaResponse>('/Currency/UpdateCurrency', request);
  }
}
