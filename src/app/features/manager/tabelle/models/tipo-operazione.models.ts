// ViewModel risposta backend
export interface ITipoOperazioneVm {
  optId: string;
  optDes: string;
  optHoscod: string;
  optIscredit: string;  // "1" | "-1"
  optAptId: string;
  optPrtdv: boolean;
  optAdvId: string | null;
}

// Command insert / update (struttura identica — upsert)
export interface IUpsertOperationTypeCommand {
  optId: string;
  optDes: string;
  optHoscod: string;
  optIscredit: string;
  optAptId: string;
  optPrtdv: boolean;
  optAdvId: string | null;
  traUser: string;
  traStation: string;
}

// Query getById
export interface IGetOperationTypeByIdQuery {
  optId: string;
}
