export interface AppearerAllResponse {
  araId: number;
  araName: string;
  araRepresents?: string | null;
  araBirthdate?: Date | string | null;
  araBirthplace?: string | null;
  araNationality?: string | null;
  araAddress?: string | null;
  araIddocnum?: string | null;
  araDocexpdate?: Date | string | null;
  araRecComplete: boolean;
  araIsupdated: boolean;
  araIscanceled: boolean;
}

export interface AppearerHistoryItem {
  hisDate: Date | string;
  araId: number;
  araName: string;
  araRepresents?: string | null;
  araBirthdate?: Date | string | null;
  araNationality?: string | null;
  araAddress?: string | null;
  araIddocnum?: string | null;
  araDocexpdate?: Date | string | null;
  araRecComplete: boolean;
}

export interface GetAppearerByParametersRequest {
  AraName: string;
  AraBirthdate?: Date | string | null;
  AraRecComplete: boolean;
  ShowExpiredRecords: boolean;
  RecordValidityDays: number;
}

export interface InsertAraRequest {
  AraRecdate: Date | string;
  AraName: string;
  AraBirthdate?: Date | string | null;
  AraBirthplace?: string | null;
  AraNationality?: string | null;
  AraIddocnum?: string | null;
  AraDocexpdate?: Date | string | null;
  AraRepresents?: string | null;
  AraAddress?: string | null;
  AraRecComplete: boolean;
}

export interface UpdateAraRequest {
  AraId: number;
  AraName: string;
  AraBirthdate?: Date | string | null;
  AraBirthplace?: string | null;
  AraNationality?: string | null;
  AraIddocnum?: string | null;
  AraDocexpdate?: Date | string | null;
  AraRepresents?: string | null;
  AraAddress?: string | null;
  AraRecComplete: boolean;
  AraIsupdated: boolean;
}

export interface DeleteAraRequest {
  AraId: number;
}

// Legacy interfaces kept for backward compatibility with sub-components
export interface AppearerAllRequest {
  Nome1?: string | null;
  Nome2?: string | null;
  Nome3?: string | null;
  Nome4?: string | null;
  AraBirthdate?: Date | string | null;
  AraRecComplete?: boolean | null;
  MinRecdate?: Date | string | null;
}

export interface InsertSpAntirecAppearerRequest {
  hisDate: Date | string;
  araId: number;
  araRecdate: Date | string;
  araName: string;
  araBirthdate?: Date | string | null;
  araBirthplace?: string | null;
  araNationality?: string | null;
  araIddocnum?: string | null;
  araDocexpdate?: Date | string | null;
  araRecComplete: boolean;
  araRepresents?: string | null;
  araAddress?: string | null;
}

export interface UpdateSpAntirecAppearerRequest {
  AraId: number;
  AraRecdate: Date | string;
  AraName: string;
  AraBirthdate?: Date | string | null;
  AraBirthplace?: string | null;
  AraNationality?: string | null;
  AraIddocnum?: string | null;
  AraDocexpdate?: Date | string | null;
  AraRepresents?: string | null;
  AraAddress?: string | null;
  AraRecComplete: boolean;
  AraIsupdated: boolean;
}
