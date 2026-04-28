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

export interface AntiRecRuleUpsert {
  arlId?: number;
  arlOpTypeId: string;
  arlCurTypeId: string;
  arlAcctId: string;
  arlAcctType: string;
  arlLimit: number;
  arlExclude: boolean;
  arlValStart: Date;
  arlValEnd: Date;
  arlIsinternal: boolean;
}

export interface AntiRecRuleHistory {
  hisDate: Date;
  arlId: number;
  optDes: string;
  cutDes: string;
  arlAcctId: string;
  arlAcctType: string;
  arlLimit: number;
  arlValStart: Date;
  arlValEnd: Date;
  arlIsinternal: boolean;
  arlExclude: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GestioneRegoleService {
  private readonly apiService = inject(ApiService);

  GetSpAntirecRulesParameters(params: AntiRecRuleSearchParams): Observable<AntiRecRule[]> {
    return this.apiService.post<AntiRecRule[]>('Vigilanza/GetSpAntirecRulesParameters', params);
  }

  InsertAntirecRule(params: AntiRecRuleUpsert): Observable<boolean> {
    return this.apiService.post<boolean>('Vigilanza/InsertAntirecRule', params);
  }

  UpdateAntirecRule(params: AntiRecRuleUpsert): Observable<boolean> {
    return this.apiService.post<boolean>('Vigilanza/UpdateAntirecRule', params);
  }

  GetAntirecRuleHistory(arlId: number): Observable<AntiRecRuleHistory[]> {
    return this.apiService.post<AntiRecRuleHistory[]>('Vigilanza/GetAntirecRuleHistory', { arlId });
  }
}
