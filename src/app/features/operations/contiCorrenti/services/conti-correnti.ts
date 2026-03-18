import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { CustomerCriteriaRequest, CustomersResponse, GetCustomerAccountsRequest, CustomerAccountResponse } from '../domain/conti-correnti-domain';

@Injectable({
  providedIn: 'root',
})
export class ContiCorrenti {
  private readonly apiService = inject(ApiService);

  private customersSubject = new BehaviorSubject<CustomersResponse[]>([]);
  public customers$ = this.customersSubject.asObservable();

  private customerAccountsSubject = new BehaviorSubject<CustomerAccountResponse[]>([]);
  public customerAccounts$ = this.customerAccountsSubject.asObservable();

  getCustomerByCriteria(request: CustomerCriteriaRequest): Observable<CustomersResponse[]> {
    return new Observable(observer => {
      this.apiService.post<CustomersResponse[]>('/Customer/GetCustomerByCriteria', request)
        .subscribe({
          next: (data) => {
            this.customersSubject.next(data);
            observer.next(data);
            console.log('Received customers data:', data);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
    });
  }

  getCustomerAccountsByCliId(request: GetCustomerAccountsRequest): Observable<CustomerAccountResponse[]> {
    return new Observable(observer => {
      this.apiService.post<CustomerAccountResponse[]>('/Customer/GetCustomerAccountsByCliId', request)
        .subscribe({
          next: (data) => {
            this.customerAccountsSubject.next(data);
            observer.next(data);
            console.log('Received customer accounts data:', data);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
    });
  }
}
