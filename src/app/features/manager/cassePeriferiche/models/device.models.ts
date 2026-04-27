export interface IGetDeviceByBraIdNotCliIdRequest {
  cliId: string;
  braId: string;
}

export interface IDeviceResponse {
  devId: number;
  devType: string;
  devName: string;
  devIoaddress: string | null;
  devDriverAddress: string | null;
  devBraId: string;
}

export interface IGetDeviceByCliIdRequest {
  cliId: string;
}
