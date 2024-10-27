import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private ticketUrl = environment.apiUrl + '/ticketing/tickets';

  constructor(private http: HttpClient) {}

  validateTicket(qrCodeData: any): Observable<any> {
    return this.http.post(`${this.ticketUrl}/validate`, { encryptedTicketData: qrCodeData }, {responseType: 'text'});
  }
}