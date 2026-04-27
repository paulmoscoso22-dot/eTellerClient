export interface IClientResponse {
  cliId: string;
  cliIp: string;
  cliMac: string;
  cliAuthcode: string;
  cliBraId: string;
  cliDes: string | null;
  cliOff: string | null;
  cliStatus: string;
  cliLingua: string | null;
  cliCnt: number;
  cliDatcounter: Date | null;
}

export interface IGetClientByIdQuery {
  cliId: string;
}

