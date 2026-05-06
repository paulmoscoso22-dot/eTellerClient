import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { IFunzioniTraccieItemResponse, IFunzioniTraccieUpsertRequest } from '../models/funzioni-traccie.models';

const NOME_TABELLA = 'ST_TRACE_FUNCTION';

@Injectable({ providedIn: 'root' })
export class FunzioniTraccieService {
  private readonly api = inject(ApiService);

  getAll(id?: string | null, desLike?: string | null): Observable<IFunzioniTraccieItemResponse[]> {
    return this.api.post<IFunzioniTraccieItemResponse[]>('Tabella/GetTabellaServVarchar', {
      nomeTabella: NOME_TABELLA,
      id: id ?? null,
      desLike: desLike ?? null,
    });
  }

  insert(item: IFunzioniTraccieUpsertRequest): Observable<boolean> {
    return this.api.post<boolean>('Tabella/InsertTabellaServVarchar', item);
  }

  update(item: IFunzioniTraccieUpsertRequest): Observable<boolean> {
    return this.api.post<boolean>('Tabella/UpdateTabellaServVarchar', item);
  }
}
