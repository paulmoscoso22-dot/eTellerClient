import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { CountryResponse } from '../domain/country.models';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly api = inject(ApiService);

  getAllCountries(): Observable<CountryResponse[]> {
    return this.api.post<CountryResponse[]>('StCountry/GetAllCountry', {});
  }
}
