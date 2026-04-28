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

  search(nomeTabella: string, id: string, des: string): Observable<TabellaIntItem[]> {
    return this.apiService.post<TabellaIntItem[]>('Manager/GetTabellaInt', { nomeTabella, id, des });
  }

  insert(nomeTabella: string, id: number, des: string): Observable<boolean> {
    return this.apiService.post<boolean>('Manager/InsertTabellaInt', { nomeTabella, id, des });
  }

  update(nomeTabella: string, id: number, des: string): Observable<boolean> {
    return this.apiService.post<boolean>('Manager/UpdateTabellaInt', { nomeTabella, id, des });
  }
}
