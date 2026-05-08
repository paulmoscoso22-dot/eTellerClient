import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import {
  GetFunzioniScheduleRequest,
  FunzioniScheduleResponse,
  InsertFunzioneScheduleCommand,
  UpdateFunzioneScheduleCommand,
  DeleteFunzioneScheduleCommand,
  ResetFunctionErrorCommand,
  ScheduleOneTimeTaskCommand,
  IPeriodTypeResponse,
} from '../models/FunzioneSchedule.models';

@Injectable({ providedIn: 'root' })
export class TabelleService {
  private readonly api = inject(ApiService);

  private readonly funzioniScheduleSubject = new BehaviorSubject<FunzioniScheduleResponse[]>([]);
  public readonly funzioniSchedule$ = this.funzioniScheduleSubject.asObservable();

  getFunzioniSchedule(request: GetFunzioniScheduleRequest): Observable<FunzioniScheduleResponse[]> {
    return this.api
      .post<FunzioniScheduleResponse[]>('Manager/Tabelle/GetFunzioniSchedule', request)
      .pipe(tap(data => this.funzioniScheduleSubject.next(data)));
  }

  insertFunzioneSchedule(command: InsertFunzioneScheduleCommand): Observable<boolean> {
    return this.api.post<boolean>('Manager/Tabelle/InsertFunzioneSchedule', command);
  }

  updateFunzioneSchedule(command: UpdateFunzioneScheduleCommand): Observable<boolean> {
    return this.api.put<boolean>('Manager/Tabelle/UpdateFunzioneSchedule', command);
  }

  deleteFunzioneSchedule(command: DeleteFunzioneScheduleCommand): Observable<boolean> {
    return this.api.deleteWithBody<boolean>('Manager/Tabelle/DeleteFunzioneSchedule', command);
  }

  resetFunctionError(command: ResetFunctionErrorCommand): Observable<boolean> {
    return this.api.post<boolean>('Manager/Tabelle/ResetFunctionError', command);
  }

  scheduleOneTimeTask(command: ScheduleOneTimeTaskCommand): Observable<boolean> {
    return this.api.post<boolean>('Manager/Tabelle/ScheduleOneTimeTask', command);
  }

  getPeriodTypes(): Observable<IPeriodTypeResponse[]> {
    return this.api.get<IPeriodTypeResponse[]>('Manager/Tabelle/GetPeriodTypes');
  }
}
