export class GetAllUsersByUsrIdRequest {
  usrId: string = '';
  funlikeName?: string;
  funlikeDes?: string;
  tutti: boolean = false;
}

export class InfoAutorizzazioneUtenteResponse {
  funId: number = 0;
  funName: string = '';
  funDescription?: string;
  funHostcode?: number;
  offline: boolean = false;
  roleName: string = '';
  accessLevel: number = 0;
}

//funzioni

export class SysFunctionsResponse {
  funId: number = 0;
  funName: string = '';
  funDescription?: string;
  funHostcode?: number;
  offline: boolean = false;
}

//role

export class GetSysRoleByFunIdRequest {
  funId: number = 0;
}

export class SysRoleResponse {
  roleId: number = 0;
  roleName: string = '';
  roleDes?: string;
}

//user role function

export class GetUsersRoleFunIdRequest {
  funId: number = 0;
}

export class UsersRoleFunctionResponse {
  funName: string = '';
  usrId: string = '';
}



