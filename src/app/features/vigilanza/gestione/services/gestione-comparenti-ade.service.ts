import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import {
  AppearerAllResponse,
  AppearerHistoryItem,
  GetAppearerByParametersRequest,
  InsertAraRequest,
  UpdateAraRequest,
  DeleteAraRequest,
} from '../domain/gestione-comparenti-ade.models';

@Injectable({
  providedIn: 'root'
})
export class GestioneComparentiAdeService {
  private readonly api = inject(ApiService);

  getByParameters(request: GetAppearerByParametersRequest): Observable<AppearerAllResponse[]> {
    return this.api.post<AppearerAllResponse[]>('Vigilanza/GetByParameters', request);
  }

  getByAraId(araId: number): Observable<any> {
    return this.api.post<any>('Vigilanza/GetByAraId', { araId });
  }

  insertAra(request: InsertAraRequest): Observable<number> {
    return this.api.put<number>('Vigilanza/InsertARA', request);
  }

  updateAra(request: UpdateAraRequest): Observable<number> {
    return this.api.put<number>('Vigilanza/UpdateARA', request);
  }

  deleteAra(request: DeleteAraRequest): Observable<boolean> {
    return this.api.deleteWithBody<boolean>('Vigilanza/DeleteARA', request);
  }

  getHistory(araId: number): Observable<AppearerHistoryItem[]> {
    return this.api.post<AppearerHistoryItem[]>('Vigilanza/GetAntirecAppearerHistory', { araId });
  }
}
