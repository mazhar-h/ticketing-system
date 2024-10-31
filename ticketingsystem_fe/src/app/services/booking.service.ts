import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookingUrl = environment.apiUrl + '/ticketing/bookings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getBookingsForUser(): Observable<any> {
    return this.http.get(`${this.bookingUrl}/user`, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  createReservation(ticketIds: number[]): Observable<any> {
    return this.http.post(`${this.bookingUrl}/reserve`, { ticketIds }, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  confirmReservation(bookingId: number, paymentIntentId: string | null): Observable<any> {
    return this.http.post(`${this.bookingUrl}/confirm`, { id: bookingId, paymentIntentId: paymentIntentId}, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  releaseReservation(bookingId: number) {
    return this.http.post(`${this.bookingUrl}/release`, { id: bookingId }, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  startGuestCheckout(): Observable<any> {
    return this.http.get(`${this.bookingUrl}/guest/start`);
  }

  createGuestReservation(ticketIds: number[], sessionToken: string):Observable<any> {
    return this.http.post(`${this.bookingUrl}/guest/reserve`, { ticketIds },  { headers: { Authorization: 'Bearer ' + sessionToken } });
  }

  confirmGuestReservation(bookingId: number, paymentIntentId: string | null, guestEmail: string, sessionToken: string): Observable<any> {
    return this.http.post(`${this.bookingUrl}/guest/confirm`, { id: bookingId, paymentIntentId, guestEmail }, { headers: { Authorization: 'Bearer ' + sessionToken } });
  }

  releaseGuestReservation(bookingId: number, sessionToken: string): Observable<any> {
    return this.http.post(`${this.bookingUrl}/guest/release`, { id: bookingId }, { headers: { Authorization: 'Bearer ' + sessionToken } });
  }
}