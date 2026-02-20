import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.env.buildApiUrl(endpoint), { params });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.env.buildApiUrl(endpoint), body);
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.env.buildApiUrl(endpoint), body);
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.env.buildApiUrl(endpoint));
  }
}
