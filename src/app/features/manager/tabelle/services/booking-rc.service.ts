import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { IAccountTypeResponse, IBookingRcGetAllRequest, IBookingRcItemResponse, IBookingRcUpsertRequest } from '../models/booking-rc.models';

@Injectable({ providedIn: 'root' })
export class BookingRcService {
  private readonly api = inject(ApiService);

  getAll(brcCutId: string, brcOptId: string, brcActId: string): Observable<IBookingRcItemResponse[]> {
    const body: IBookingRcGetAllRequest = { brcCutId, brcOptId, brcActId };
    return this.api.post<IBookingRcItemResponse[]>('manager/BookingRc/GetBookingRc', body);
  }

  getAccountTypes(): Observable<IAccountTypeResponse[]> {
    return this.api.post<IAccountTypeResponse[]>('manager/BookingRc/GetAccountTypes', {});
  }

  insert(item: IBookingRcUpsertRequest): Observable<boolean> {
    return this.api.post<boolean>('manager/BookingRc/InsertBookingRc', item);
  }

  update(item: IBookingRcUpsertRequest): Observable<boolean> {
    return this.api.post<boolean>('manager/BookingRc/UpdateBookingRc', item);
  }
}
