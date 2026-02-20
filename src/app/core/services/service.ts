import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Currency } from '../domain/currency.domain';
import { Branch } from '../domain/branch.domain';
import { CurrencyType } from '../domain/currencyType.domain';
import { StOperationType } from '../domain/stOperationType.domain';
import { environment } from '../../../environments/environment';

export class List {
  id: number | undefined;
  text: string | undefined;
  icon: string | undefined;
}

const navigation: List[] = [
  { id: 1, text: 'Operazioni', icon: 'operation' },
  { id: 2, text: 'Archivi', icon: 'archive' },
  { id: 3, text: 'Vigilanza', icon: 'vigilans' },
  { id: 4, text: 'Help', icon: 'help' },
  { id: 5, text: 'Admin', icon: 'admin' }
];

const text = `

`;

@Injectable({
  providedIn: 'root'
})
export class Service {
  constructor(private http: HttpClient) {}

  getNavigationList(): List[] {
    return navigation;
  }

  getContent(): string {
    return text;
  }

  getAllCurrency(): Observable<Currency[]> {
    return this.http.post<Currency[]>(`${environment.apiUrl}/Currency`, {});
  }

  getBranches(): Observable<Branch[]> {
    return this.http.post<Branch[]>(`${environment.apiUrl}/Branch`, {});
  }

  getCurrencyTypes(): Observable<CurrencyType[]> {
    return this.http.post<CurrencyType[]>(`${environment.apiUrl}/CurrencyType`, {});
  }

  getStOperationsType(): Observable<StOperationType[]> {
    return this.http.post<StOperationType[]>(`${environment.apiUrl}/StOperationType`, {});
  }
}