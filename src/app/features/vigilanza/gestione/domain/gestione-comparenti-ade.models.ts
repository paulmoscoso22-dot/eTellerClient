export interface AppearerAllRequest {
    Nome1?: string | null;
    Nome2?: string | null;
    Nome3?: string | null;
    Nome4?: string | null;
    AraBirthdate?: Date | string | null;
    AraRecComplete?: boolean | null;
    MinRecdate?: Date | string | null;
}

export interface AppearerAllResponse {
    araId: number;
    araBirthplace?: string | null;
    araIddocnum?: string | null;
    araDocexpdate?: Date | string | null;
    araIsupdated: boolean;
    araIscanceled: boolean;
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

export interface InsertAraRequest {
    TraUser: string;
    TraStation: string;
    AraRecdate: Date | string;
    AraName: string;
    AraBirthdate?: Date | string | null;
    AraBirthplace?: string | null;
    AraIddocnum?: string | null;
    AraNationality?: string | null;
    AraDocexpdate?: Date | string | null;
    AraRepresents?: string | null;
    AraAddress?: string | null;
    AraRecComplete: boolean;
}

export interface UpdateAraRequest {
    TraUser: string;
    TraStation: string;
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
}

export interface GetAppearerByParametersRequest {
    AraName: string;
    AraBirthdate?: Date | string | null;
    AraRecComplete: boolean;
    ShowExpiredRecords: boolean;
    RecordValidityDays: number;
}

export interface DeleteAraRequest {
    TraUser: string;
    TraStation: string;
    AraId: number;
}

