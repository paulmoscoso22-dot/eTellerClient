import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { IDivisaAnagrafica, UpdateDivisaRequest } from '../models/divisa.models';

@Injectable({
  providedIn: 'root'
})
export class DiviseService {
  private api = inject(ApiService);

  getAll(): Observable<IDivisaAnagrafica[]> {
    return this.api.post<IDivisaAnagrafica[]>('/Currency/GetAllCurrencies', {});
  }

  getByKey(curId: string, curCutId: string): Observable<IDivisaAnagrafica> {
    return this.api.get<IDivisaAnagrafica>(
      `/Currency/GetByKey?curId=${encodeURIComponent(curId)}&curCutId=${encodeURIComponent(curCutId)}`
    );
  }

  update(request: UpdateDivisaRequest): Observable<IDivisaAnagrafica> {
    return this.api.put<IDivisaAnagrafica>('/Currency/UpdateCurrency', request);
  }
}
