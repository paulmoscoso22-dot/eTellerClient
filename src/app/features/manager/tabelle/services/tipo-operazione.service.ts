import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import {
  ITipoOperazioneVm,
  IUpsertOperationTypeCommand,
} from '../models/tipo-operazione.models';

@Injectable({ providedIn: 'root' })
export class TipoOperazioneService {
  private readonly api = inject(ApiService);

  getAll(): Observable<ITipoOperazioneVm[]> {
    return this.api.post<ITipoOperazioneVm[]>('Manager/Tabelle/GetOperationTypes', {});
  }

  getById(optId: string): Observable<ITipoOperazioneVm> {
    return this.api.post<ITipoOperazioneVm>('Manager/Tabelle/GetOperationTypeById', { optId });
  }

  insert(cmd: IUpsertOperationTypeCommand): Observable<boolean> {
    return this.api.post<boolean>('Manager/Tabelle/InsertOperationType', cmd);
  }

  update(cmd: IUpsertOperationTypeCommand): Observable<boolean> {
    return this.api.post<boolean>('Manager/Tabelle/UpdateOperationType', cmd);
  }
}
