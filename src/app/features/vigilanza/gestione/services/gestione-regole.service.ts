import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';

export interface AntiRecRuleSearchParams {
  arlOpTypeId: string;
  arlCurTypeId: string;
  arlAcctId: string;
  arlAcctType: string;
}

export interface AntiRecRule {
  arlId: number;
  arlOpTypeId: string;
  arlCurTypeId: string;
  arlAcctId?: string;
  arlAcctType?: string;
  arlLimit: number;
  arlExclude: boolean;
  arlRecDate: Date;
  arlValStart: Date;
  arlValEnd: Date;
  arlIscanceled: boolean;
  arlIsinternal: boolean;
  optDes: string;
  cutDes: string;
}

@Injectable({
  providedIn: 'root'
})
export class GestioneRegoleService {
  private readonly apiService = inject(ApiService);

  GetSpAntirecRulesParameters(params: AntiRecRuleSearchParams): Observable<AntiRecRule[]> {
    return this.apiService.post<AntiRecRule[]>('Vigilanza/GetSpAntirecRulesParameters', params);
  }
}
