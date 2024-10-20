import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private eventUrl = environment.apiUrl + '/ticketing/bookings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createReservation(ticketIds: number[]): Observable<any> {
    return this.http.post(`${this.eventUrl}/reserve`, { ticketIds }, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  confirmReservation(bookingId: number): Observable<any> {
    return this.http.post(`${this.eventUrl}/confirm`, { id: bookingId }, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  releaseReservation(bookingId: number) {
    return this.http.post(`${this.eventUrl}/release`, { id: bookingId }, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }
}