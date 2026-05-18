export interface IServiziResponse {
  serId: string;
  serDes: string;
  serRunning: boolean | null;
  serDeserr: string;
  serTrace: boolean | null;
  serEmail: boolean;
  serSyserrmail: string | null;
  serApperrmail: string | null;
  serEnable: boolean | null;
  serLastrun: string | null;
}

export interface IInsertServizioCommand {
  traUser: string;
  traStation: string;
  serId: string;
  serDes: string;
  serTrace: boolean;
  serEmail: boolean;
  serSyserrmail: string | null;
  serApperrmail: string | null;
  serEnable: boolean;
}

export interface IUpdateServizioCommand {
  traUser: string;
  traStation: string;
  serId: string;
  serDes: string;
  serTrace: boolean;
  serEmail: boolean;
  serSyserrmail: string | null;
  serApperrmail: string | null;
  serEnable: boolean;
}

export interface IDeleteServizioCommand {
  traUser: string;
  traStation: string;
  serId: string;
}
