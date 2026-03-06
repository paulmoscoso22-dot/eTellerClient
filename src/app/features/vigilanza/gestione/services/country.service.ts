import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CountryResponse } from '../domain/country.models';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly apiUrl = 'https://localhost:7094/api/StCountry';

  constructor(private http: HttpClient) {}

  getAllCountries(): Observable<CountryResponse[]> {
    return this.http.post<CountryResponse[]>(`${this.apiUrl}/GetAllCountry`, {});
  }
}
