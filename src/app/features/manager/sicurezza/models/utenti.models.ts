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

