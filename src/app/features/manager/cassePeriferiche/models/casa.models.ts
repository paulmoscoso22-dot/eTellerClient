export interface ICassa {
  cliId: string;
  cliIp: string;
  cliMac: string;
  cliBraId: string;
  cliLingua: string;
  cliStatus: string;
  cliOff: string;
  cliDes: string;
  cliCnt: number;
  cliDatcounter: string | null;
  inUso: boolean;
  assignedDeviceIds: number[];
}