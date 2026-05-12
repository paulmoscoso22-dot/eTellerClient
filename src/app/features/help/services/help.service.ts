import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { IHelpInfoResponse } from '../models/help.models';

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private _helpInfo = new BehaviorSubject<IHelpInfoResponse | null>(null);
  public helpInfo$ = this._helpInfo.asObservable();

  constructor(private api: ApiService) {}

  getInfoBase(): Observable<IHelpInfoResponse> {
    return this.api.get<IHelpInfoResponse>('/help/info-base').pipe(
      tap((res: IHelpInfoResponse) => this._helpInfo.next(res))
    );
  }
}
