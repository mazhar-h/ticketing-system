import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PerformerService {
  private performerUrl = environment.apiUrl + '/ticketing/performers';

  constructor(private http: HttpClient, private authService: AuthService) {}

  searchPerformers(keyword: any): Observable<any> {
    return this.http.get(`${this.performerUrl}/search?keyword=${keyword}`);
  }

  register(registerData: { username: string; name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.performerUrl}/register`, registerData, { responseType: 'text' });
  }

}