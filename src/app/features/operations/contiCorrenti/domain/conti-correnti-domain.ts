export class ContiCorrentiDomain {
}

export class CustomerCriteriaRequest {
  cliId?: string;
  descrizione?: string;
}

export class GetCustomerAccountsRequest {
  CliId?: string;
}

export class CustomerAccountResponse {
  accDivisa?: string;
  accId?: string;
  accNea?: string;
  accCategoria?: string;
  accRubrica?: string;
  accSaldo?: number;
}

export class CustomersResponse {
  CusCliId?: string;
  CusName?: string;
  CusDomicilio?: string;
  CusNatura?: string;
}
