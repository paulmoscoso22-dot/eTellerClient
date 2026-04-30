export interface DeviceResponse {
  devId: number;
  devName: string;
  devType: string;
  devIoaddress: string | null;
  devDriverAddress: string | null;
  devBraId: string;
}

export interface IDevice {
  devId: number;
  devName: string;
  devType: string;
}