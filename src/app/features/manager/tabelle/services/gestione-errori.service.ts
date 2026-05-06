import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import {
  IGestioneErroriGetRequest,
  IGestioneErroriItemResponse,
  IGestioneErroriUpsertRequest,
  IForceCodeResponse,
} from '../models/gestione-errori.models';

@Injectable({ providedIn: 'root' })
export class GestioneErroriService {
  private readonly api = inject(ApiService);

  getAll(request: IGestioneErroriGetRequest): Observable<IGestioneErroriItemResponse[]> {
    return this.api.post<IGestioneErroriItemResponse[]>('GestioneErrori/GetGestioneErrori', request);
  }

  getById(errId: string): Observable<IGestioneErroriItemResponse> {
    return this.api.post<IGestioneErroriItemResponse>('GestioneErrori/GetGestioneErroriById', { errId });
  }

  insert(item: IGestioneErroriUpsertRequest): Observable<void> {
    return this.api.post<void>('GestioneErrori/InsertGestioneErrori', item);
  }

  update(item: IGestioneErroriUpsertRequest): Observable<boolean> {
    return this.api.post<boolean>('GestioneErrori/UpdateGestioneErrori', item);
  }

  delete(errId: string): Observable<boolean> {
    return this.api.post<boolean>('GestioneErrori/DeleteGestioneErrori', { errId });
  }

  getForceCodes(): Observable<IForceCodeResponse[]> {
    return this.api.get<IForceCodeResponse[]>('GestioneErrori/GetForceCodes');
  }
}
