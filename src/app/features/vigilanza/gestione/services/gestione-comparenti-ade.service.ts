import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppearerAllRequest, AppearerAllResponse, InsertSpAntirecAppearerRequest, UpdateSpAntirecAppearerRequest, InsertAraRequest, UpdateAraRequest, GetAppearerByParametersRequest, DeleteAraRequest } from '../domain/gestione-comparenti-ade.models';

@Injectable({
  providedIn: 'root'
})
export class GestioneComparentiAdeService {
  private readonly apiUrl = 'https://localhost:7094/api/Vigilanza';

  constructor(private http: HttpClient) {}

  getAppearers(query: AppearerAllRequest): Observable<AppearerAllResponse[]> {
    return this.http.post<AppearerAllResponse[]>(`${this.apiUrl}/GetSpAntirecAppearerByParameters`, query);
  }

  insertGestioneComparenti(request: InsertSpAntirecAppearerRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/InsertSpAntirecAppearer`, request);
  }

  updateGestioneComparenti(request: UpdateSpAntirecAppearerRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/UpdateSpAntirecAppearer`, request);
  }

  postGetAppearerAllByAraId(araId: number): Observable<UpdateSpAntirecAppearerRequest> {
    return this.http.post<UpdateSpAntirecAppearerRequest>(`${this.apiUrl}/GetByAraId`, { araId });
  }

  insertAra(request: InsertAraRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/InsertARA`, request);
  }

  updateAra(request: UpdateAraRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/UpdateARA`, request);
  }

  getByParameters(request: GetAppearerByParametersRequest): Observable<AppearerAllResponse[]> {
    return this.http.post<AppearerAllResponse[]>(`${this.apiUrl}/GetByParameters`, request);
  }

  deleteAra(request: DeleteAraRequest): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/DeleteARA`, { body: request });
  }
}
