
// Response model requested by trace.component.ts
export interface ISysRoleResonse {
  roleId: number;
  roleName: string;
  roleDes?: string | null;
}

export interface IGetUserByRoleRequest {
  roleId: number;
}

export interface IUserSelectRoleResponse {
  usrExtref?: string | null;
  usrStatus: string;
  usrBraId: string;
  usrHostId?: string | null;
  usrId: string;
}

export interface IInsertRoleRequest {
  roleName: string;
  roleDes: string;
  traUser: string;
  traStation: string;
  info: string;
}

export interface IUpdateRoleRequest {
  roleId: number;
  roleName: string;
  roleDes: string;
}

export interface IDeleteRoleRequest {
  roleId: number;
}

export interface IGetRoleNotForUsrIdRquest {
  usrId: string;
}

export interface GetRoleByUsrIdRequest {
  usrId: string;
}

