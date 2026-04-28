export interface GetFunzioniScheduleRequest {
  nomeLike: string | null;
  desLike: string | null;
}

export interface FunzioniScheduleResponse {
  futId: string;
  futDes: string;
  futFunname: string;
  futScriptname: string;
  futTimeout: number;
  futAutatt: boolean | null;
  futOffline: boolean | null;
  futHosval: boolean | null;
  futOnetimerun: boolean | null;
  futPeriodtyp: string | null;
  futPeriod: number | null;
  futStart: string | null;
  futLastrun: string | null;
  futEnd: string | null;
  futLoop: boolean | null;
  futLastrunok: boolean | null;
  futDatmod: string | null;
  futActive: boolean;
  futDatins: string | null;
  futNamedll: string | null;
  futClassname: string | null;
  futErrcount: number | null;
  futTrace: boolean | null;
}

export interface InsertFunzioneScheduleCommand {
  traUser: string;
  traStation: string;
  futId: string;
  futDes: string;
  futFunname: string;
  futScriptname: string;
  futTimeout: number;
  futActive: boolean;
  futOffline: boolean;
  futTrace: boolean;
  futAutatt: boolean;
  futHosval: boolean | null;
  futPeriodtyp: string | null;
  futPeriod: number | null;
  futStart: string | null;
  futEnd: string | null;
  futNamedll: string | null;
  futClassname: string | null;
  futErrcount: number | null;
}

export interface UpdateFunzioneScheduleCommand {
  traUser: string;
  traStation: string;
  futId: string;
  futDes: string;
  futFunname: string;
  futScriptname: string;
  futTimeout: number;
  futActive: boolean;
  futOffline: boolean;
  futTrace: boolean;
  futAutatt: boolean;
  futHosval: boolean | null;
  futPeriodtyp: string | null;
  futPeriod: number | null;
  futStart: string | null;
  futEnd: string | null;
  futNamedll: string | null;
  futClassname: string | null;
  futErrcount: number | null;
}

export interface DeleteFunzioneScheduleCommand {
  traUser: string;
  traStation: string;
  futId: string;
}

export interface ResetFunctionErrorCommand {
  traUser: string;
  traStation: string;
  futId: string;
}

export interface ScheduleOneTimeTaskCommand {
  traUser: string;
  traStation: string;
  futId: string;
}
