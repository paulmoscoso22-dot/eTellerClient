import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';

export interface AccountType {
  actId: string;
  actDes: string;
}

export interface BookingRcItem {
  brcCutId: string;
  brcOptId: string;
  brcActId: string;
  brcCodcau: string;
  brcCodcausto: string;
  brcText1: string;
  brcText2: string;
}

export interface BookingRcUpsert {
  brcCutId: string;
  brcOptId: string;
  brcActId: string;
  brcCodcau: string;
  brcCodcausto: string;
  brcText1: string;
  brcText2: string;
}

@Injectable({ providedIn: 'root' })
export class BookingRcService {
  private readonly api = inject(ApiService);

  getAll(brcCutId: string, brcOptId: string, brcActId: string): Observable<BookingRcItem[]> {
    return this.api.post<BookingRcItem[]>('Manager/GetBookingRc', { brcCutId, brcOptId, brcActId });
  }

  getAccountTypes(): Observable<AccountType[]> {
    return this.api.post<AccountType[]>('Manager/GetAccountTypes', {});
  }

  insert(body: BookingRcUpsert): Observable<boolean> {
    return this.api.post<boolean>('Manager/InsertBookingRc', body);
  }

  update(body: BookingRcUpsert): Observable<boolean> {
    return this.api.post<boolean>('Manager/UpdateBookingRc', body);
  }
}
