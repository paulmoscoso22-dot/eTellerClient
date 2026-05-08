import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';

export interface TabellaIntItem {
  id: number;
  des: string;
}

@Injectable({ providedIn: 'root' })
export class TabellaIntService {
  private readonly apiService = inject(ApiService);

  search(nomeTabella: string, id?: number, desLike?: string): Observable<TabellaIntItem[]> {
    return this.apiService.post<TabellaIntItem[]>('Tabella/GetTabellaServInt', { nomeTabella, id, desLike });
  }

  insert(nomeTabella: string, id: number, des: string): Observable<boolean> {
    return this.apiService.post<boolean>('Tabella/InsertTabellaServInt', { nomeTabella, id, des });
  }

  update(nomeTabella: string, id: number, des: string): Observable<boolean> {
    return this.apiService.post<boolean>('Tabella/UpdateTabellaServInt', { nomeTabella, id, des });
  }
}
