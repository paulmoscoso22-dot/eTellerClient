/** Allineato ai valori di TransactionStatusConstants.cs nel backend */
export enum TransactionStatus {
  NonTrasmesso = 0,
  /** Valore provvisorio (1) — il backend non ha una costante specifica per Eseguito */
  Eseguito = 1,
  Annullato = 3,
  AttesaBEF = 4
}
