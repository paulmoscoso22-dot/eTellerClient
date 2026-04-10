import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Currency } from '../domain/currency.domain';
import { Branch, IGetBranchByIdRequest } from '../domain/branch.domain';
import { CurrencyType } from '../domain/currencyType.domain';
import { StOperationType } from '../domain/stOperationType.domain';
import { IGetLanguageByIdRequest, ISTLanguageResponse } from '../domain/laguage.domain';
import { environment } from '../../../environments/environment';
import { IGetStatoEntitaByIdRequest, ISTStatoEntitaResponse } from '../domain/stato-entita.domain';

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
  private branchesSubject = new BehaviorSubject<Branch[]>([]);
  public branches$ = this.branchesSubject.asObservable();

  private branchByIdSubject = new BehaviorSubject<Branch[]>([]);
  public branchById$ = this.branchByIdSubject.asObservable();

  private statoEntitaSubject = new BehaviorSubject<ISTStatoEntitaResponse[]>([]);
  public statoEntita$ = this.statoEntitaSubject.asObservable();

  private allStatiEntitaSubject = new BehaviorSubject<ISTStatoEntitaResponse[]>([]);
  public allStatiEntita$ = this.allStatiEntitaSubject.asObservable();

  private languagesSubject = new BehaviorSubject<ISTLanguageResponse[]>([]);
  public languages$ = this.languagesSubject.asObservable();

  private languagesByIdSubject = new BehaviorSubject<ISTLanguageResponse[]>([]);
  public languagesById$ = this.languagesByIdSubject.asObservable();

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
  
  getCurrencyTypes(): Observable<CurrencyType[]> {
    return this.http.post<CurrencyType[]>(`${environment.apiUrl}/CurrencyType/GetCurrencyTypes`, {});
  }
  
  getStOperationsType(): Observable<StOperationType[]> {
    return this.http.post<StOperationType[]>(`${environment.apiUrl}/StOperation/GetStOperations`, {});
  }
  
  // #region Branch
    getBranches(): Observable<Branch[]> {
      return this.http.post<Branch[]>(`${environment.apiUrl}/Branch/GetBranches`, {})
        .pipe(
          tap(data => this.branchesSubject.next(data))
        );
    }
  
    GetBranchById(request: IGetBranchByIdRequest): Observable<Branch[]> {
      return this.http.post<Branch[]>(`${environment.apiUrl}/Branch/GetBranchById`, request)
        .pipe(
          tap(data => this.branchByIdSubject.next(data))
        );
    }
    // #endregion Branch

  // #region Stato Entita
  GetAllStatiEntita(): Observable<ISTStatoEntitaResponse[]> {
    return this.http.post<ISTStatoEntitaResponse[]>(`${environment.apiUrl}/StatoEntita/GetAllStatiEntita`, {})
      .pipe(
        tap(data => this.allStatiEntitaSubject.next(data))
      );
  }

  GetStatoEntitaById(request: IGetStatoEntitaByIdRequest): Observable<ISTStatoEntitaResponse[]> {
    return this.http.post<ISTStatoEntitaResponse[]>(`${environment.apiUrl}/StatoEntita/GetStatoEntitaById`, request)
      .pipe(
        tap(data => this.statoEntitaSubject.next(data))
      );
  }
  // #endregion Stato Entita

  // #region Language
  GetLanguages(): Observable<ISTLanguageResponse[]> {
    return this.http.post<ISTLanguageResponse[]>(`${environment.apiUrl}/Language/GetLanguages`, {})
      .pipe(
        tap(data => this.languagesSubject.next(data))
      );
  }

  GetLanguagesById(request: IGetLanguageByIdRequest): Observable<ISTLanguageResponse[]> {
    return this.http.post<ISTLanguageResponse[]>(`${environment.apiUrl}/Language/GetLanguageById`, request)
      .pipe(
        tap(data => this.languagesByIdSubject.next(data))
      );
  }
  // #endregion Language
}