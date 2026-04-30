export class ClientResponse {
	cliId: string = '';
	cliIp: string = '';
	cliMac: string = '';
	cliAuthcode: string = '';
	cliBraId: string = '';
	cliDes: string | null = null;
	cliOff: string | null = null;
	cliStatus: string = '';
	cliLingua: string | null = null;
	cliCnt: number = 0;
	cliDatcounter: Date | null = null;
}

export interface InsertClientRequest {
  cliId: string;
  cliIp: string;
  cliMac: string;
  cliAuthcode: string;
  cliBraId: string;
  cliStatus: string;
  cliLingua: string | null;
  cliDes: string | null;
  cliOff: string | null;
  deviceIds: number[];
  traUser: string;
  traStation: string;
}

export interface UpdateClientRequest {
  cliId: string;
  cliIp: string;
  cliMac: string;
  cliBraId: string;
  cliStatus: string;
  cliLingua: string | null;
  cliDes: string | null;
  cliOff: string | null;
  addDeviceIds: number[];
  delDeviceIds: number[];
  traUser: string;
  traStation: string;
}

export interface DeleteClientRequest {
  cliId: string;
  traUser: string;
  traStation: string;
}


