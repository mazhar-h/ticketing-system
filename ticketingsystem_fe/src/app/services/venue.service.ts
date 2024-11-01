import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private venueUrl = environment.apiUrl + '/ticketing/venues';

  constructor(private http: HttpClient, private authService: AuthService) {}

  register(registerData: {
    username: string;
    name: string;
    email: string;
    password: string;
    address: string;
    state: string;
    zipcode: string;
  }): Observable<any> {
    return this.http.post(`${this.venueUrl}/register`, registerData, { responseType: 'text' });
  }
}
