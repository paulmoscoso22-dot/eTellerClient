/**
 * Report Search Parameters
 * Typed contract for filter search parameters across all report pages.
 */

/**
 * Typed contract for report filter search parameters.
 * Emitted by ReportFilterComponent; consumed by page components.
 */
export interface ReportSearchParams {
  /** Cash register identifier (nullable, trimmed) */
  trxCassa: string | null;

  /** Start date for transaction range (normalized to 00:00:00, nullable) */
  trxDataDal: Date | null;

  /** End date for transaction range (normalized to 23:59:59, nullable) */
  trxDataAl: Date | null;

  /** Transaction status filter (nullable) */
  trxStatus: number | null;

  /** Branch identifier (nullable, trimmed) */
  trxBraId: string | null;
}
