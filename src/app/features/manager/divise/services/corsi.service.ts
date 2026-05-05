import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ICorso, CorsiRequest } from '../models/divisa.models';

@Injectable({ providedIn: 'root' })
export class CorsiService {
  private api = inject(ApiService);

  getAll(request: CorsiRequest): Observable<ICorso[]> {
    return this.api.post<ICorso[]>('/Corsi/GetAll', request);
  }
}
