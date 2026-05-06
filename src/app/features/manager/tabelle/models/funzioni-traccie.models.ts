export interface IFunzioniTraccieGetRequest {
  nomeTabella: string;
  id?: string | null;
  desLike?: string | null;
}

export interface IFunzioniTraccieItemResponse {
  id: string;
  des: string | null;
}

export interface IFunzioniTraccieUpsertRequest {
  nomeTabella: string;
  id: string;
  des: string;
}
