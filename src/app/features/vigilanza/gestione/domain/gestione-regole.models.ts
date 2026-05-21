export interface IAntirecRuleResponse {
  arlId: number;
  arlOpTypeId: string;
  arlCurTypeId: string;
  optDes: string;
  cutDes: string;
  arlAcctId?: string | null;
  arlAcctType?: string | null;
  arlLimit: number;
  arlExclude: boolean;
  arlRecDate: Date | string;
  arlValStart: Date | string;
  arlValEnd: Date | string;
  arlIscanceled: boolean;
  arlIsinternal: boolean;
}

export interface IAntirecRulesSearchParams {
  arlOpTypeId?: string | null;
  arlCurTypeId?: string | null;
  arlAcctId?: string | null;
  arlAcctType?: string | null;
}

export interface IInsertAntirecRuleRequest {
  traUser: string;
  traStation: string;
  arlOpTypeId: string;
  arlCurTypeId: string;
  arlAcctId?: string | null;
  arlAcctType?: string | null;
  arlLimit: number;
  arlExclude: boolean;
  arlRecDate: Date | string;
  arlValStart: Date | string;
  arlValEnd: Date | string;
  arlIsinternal: boolean;
}

export interface IUpdateAntirecRuleRequest {
  traUser: string;
  traStation: string;
  arlId: number;
  arlOpTypeId: string;
  arlCurTypeId: string;
  arlAcctId?: string | null;
  arlAcctType?: string | null;
  arlLimit: number;
  arlExclude: boolean;
  arlRecDate: Date | string;
  arlValStart: Date | string;
  arlValEnd: Date | string;
  arlIsinternal: boolean;
}

export interface IDeleteAntirecRuleRequest {
  traUser: string;
  traStation: string;
  arlId: number;
}

export interface IHistoryItem {
  hisDate: Date | string;
  optDes: string;
  cutDes: string;
  arlAcctId?: string | null;
  arlAcctType?: string | null;
  arlLimit: number;
  arlValStart: Date | string;
  arlValEnd: Date | string;
  arlIsinternal: boolean;
  arlExclude: boolean;
}
