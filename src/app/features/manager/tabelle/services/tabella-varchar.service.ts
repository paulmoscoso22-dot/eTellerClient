import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';

export interface TabellaVarcharItem {
  id: string;
  des: string;
}

export interface TabellaVarcharSearchParams {
  nomeTabella: string;
  id: string;
  desLike: string;
}

export interface TabellaVarcharUpsert {
  nomeTabella: string;
  id: string;
  des: string;
}

@Injectable({ providedIn: 'root' })
export class TabellaVarcharService {
  private readonly apiService = inject(ApiService);

  search(nomeTabella: string, id: string, des: string): Observable<TabellaVarcharItem[]> {
    const params: TabellaVarcharSearchParams = { nomeTabella, id, desLike: des };
    return this.apiService.post<TabellaVarcharItem[]>('Tabella/GetTabellaServVarchar', params);
  }

  insert(nomeTabella: string, id: string, des: string): Observable<boolean> {
    const body: TabellaVarcharUpsert = { nomeTabella, id, des };
    return this.apiService.post<boolean>('Tabella/InsertTabellaServVarchar', body);
  }

  update(nomeTabella: string, id: string, des: string): Observable<boolean> {
    const body: TabellaVarcharUpsert = { nomeTabella, id, des };
    return this.apiService.post<boolean>('Tabella/UpdateTabellaServVarchar', body);
  }
}
