export interface ISysUsersActiveAndBlockedResponse {
  usrId: string;
  usrHostId?: string;
  usrBraId: string;
  usrStatus: string;
  usrExtref?: string;
  usrLingua: string;
}

export interface GetUsersByUserIdRequest {
  usrId: string;
}

export interface ISysUserByIdResponse {
  usrId: string;
  usrStatus: string;
  usrExtref?: string;
  usrHostId?: string;
  usrBraId: string;
  usrChgPas: boolean;
  usrLingua: string;
}

export interface InsertUserResponse {
  usrId: string;
  usrHostId: string;
  usrBraId: string;
  usrStatus: string;
  usrExtref?: string;
  usrLingua: string;
  traUser: string;
  traStation: string;
}

export interface IUpdateUserRequest {
  usrId: string;
  usrHostId: string;
  usrBraId: string
  usrStatus: string;
  usrExtref?: string;
  usrLingua: string;
  addIdRoles: number[];
  delIdRoles: number[];
}

export interface ResetPasswordRequest {
  usrId: string;
  chgPas: boolean;
  usrPass: string;
  usrPass2: string;
}

export interface SysUsersUseClientResponse {
  usrCliId: number;
  cliId: string;
  usrId: string;
  dataIn: string | Date;
  dataOut?: string | Date | null;
  forced: boolean;
}

export interface IUpdateUserClientExitRequest {
  usrCliId: number;
}
