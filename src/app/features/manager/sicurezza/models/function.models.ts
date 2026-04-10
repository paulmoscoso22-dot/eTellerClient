export interface IGetFunctionRoleByRoleIdRequest {
  roleId: number;
  funLikeName?: string | null;
  funLikeDes?: string | null;
}

export interface IFunctionRoleResponse {
  funId: number;
  funName: string;
  funDescription?: string | null;
  accessLevel: number;
}

export interface IStFunAcctypResponse {
  fatId: number;
  fatDes: string;
}
