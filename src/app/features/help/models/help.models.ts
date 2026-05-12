export interface IHelpInfoResponse {
  lastUser: string | null;
  lastLogoutDate: string | null;
  systemLanguage: string;
  fichesPrinter: string | null;
  isTwinSafeEnabled: boolean;
  isCassaOperationsEnabled: boolean;
  webApplicationVersion: string;
  hostUser: string | null;
  hostVersion: number | null;
  hostCompileDate: string | null;
}
