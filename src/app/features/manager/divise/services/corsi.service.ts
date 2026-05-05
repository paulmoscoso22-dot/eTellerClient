import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ICorsoResponse, ICorsiRequest } from '../models/corso.models';

@Injectable({ providedIn: 'root' })
export class CorsiService {
  private api = inject(ApiService);

  getAll(request: ICorsiRequest): Observable<ICorsoResponse[]> {
    return this.api.post<ICorsoResponse[]>('/Corsi/GetAll', request);
  }
}
