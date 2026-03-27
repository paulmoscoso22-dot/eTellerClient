export class GetTraceAllRequest {
	traUser: string | null = null;
	traFunCode: string | null = null;
	traStation: string | null = null;
	traTabNam: string | null = null;
	traEntCode: string | null = null;
	traError: boolean | null = null;
	dataFrom: Date | null = null;
	dataTo: Date | null = null;
}

	export class GetTraceWithFunctionRequest {
		traUser: string | null = null;
		traFunCode: string | null = null;
		traStation: string | null = null;
		traTabNam: string | null = null;
		traEntCode: string | null = null;
		traError: boolean | null = null;
		dataFrom: Date | null = null;
		dataTo: Date | null = null;
	}

	//Trace

export class StTracefunctionResponse {
	tfcId: string = '';
	tfcDes: string = '';
}

export class GetTraceByIdRequest {
    traId: number = 0;
}

export class TraceResponse {
	traId: number = 0;
	traTime: Date = new Date();
	traUser: string = '';
	traFunCode: string = '';
	traSubFun: string | null = null;
	traStation: string = '';
	traTabNam: string = '';
	traEntCode: string = '';
	traRevTrxTrace: string | null = null;
	traDes: string | null = null;
	traExtRef: string | null = null;
	traError: boolean = false;
}

export class TraceWithFunctionResponse {
	traId: number = 0;
	traTime: Date = new Date();
	traUser: string = '';
	traFunCode: string = '';
	traSubFun: string | null = null;
	traStation: string = '';
	traTabNam: string = '';
	traEntCode: string = '';
	traRevTrxTrace: string | null = null;
	traDes: string | null = null;
	traExtRef: string | null = null;
	traError: boolean = false;
	tfcDes: string = '';
}

export class SysUsersActiveAndBlockedResponse {
	usrId: string = '';
	usrHostId: string | null = null;
	usrBraId: string = '';
	usrStatus: string = '';
	usrExtref: string | null = null;
	usrLingua: string = '';
}

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

export class GetTabellaServVarcharRequest {
	nomeTabella: string = '';
	id: string | null = null;
	desLike: string | null = null;
}

// This class is used for both request and response, but only id and des are used in response
export class GetTabellaServVarcharByIdRequest {
    id: string | null = null;
    nomeTabella: string = '';
}

export class TabellaServVarcharResponse {
	id: string | null = null;
	des: string | null = null;
}


