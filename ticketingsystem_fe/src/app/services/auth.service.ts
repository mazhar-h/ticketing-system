import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../environments/enivornment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService, private router: Router) {}

  loginWithGoogle(googleToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google`, googleToken, { withCredentials: true })
  }

  registerWithGoogle(idToken: string, googleAuthRequest: { username: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google/register`, googleAuthRequest , {  headers: { Authorization: 'Bearer ' + idToken }, withCredentials: true })
  }

  getGoogleExistingUser(idToken: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/google/user`, { headers: { Authorization: 'Bearer ' + idToken } })
  }

  linkGoogleAccount(idToken: string, googleLinkRequest: {password: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google/link`, googleLinkRequest, {  headers: { Authorization: 'Bearer ' + idToken }, withCredentials: true })
  }
  
  loginWithFacebook(facebookToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/facebook`, facebookToken, { withCredentials: true })
  }

  registerWithFacebook(idToken: string, facebookAuthRequest: { username: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/facebook/register`, facebookAuthRequest , {  headers: { Authorization: 'Bearer ' + idToken }, withCredentials: true })
  }

  getFacebookExistingUser(idToken: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/facebook/user`, { headers: { Authorization: 'Bearer ' + idToken } })
  }

  linkFacebookAccount(idToken: string, facebookLinkRequest: {password: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/facebook/link`, facebookLinkRequest, {  headers: { Authorization: 'Bearer ' + idToken }, withCredentials: true })
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password }, { withCredentials: true });
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response && response.accessToken) {
          this.saveAccessToken(response.accessToken);
        }
      }),
      catchError(() => {
        //this.router.navigate(['/login']);
        return of(null);
      })
    );;
  }

  processLogout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers: {"Authorization": "Bearer " + localStorage.getItem('token')}, withCredentials: true });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token))
      return true;
    else
      return false;
  }

  isTokenExpired(token: string): boolean {
    try {
      if (this.jwtHelper.isTokenExpired(token))
        return true;
    } catch (error) {
      localStorage.removeItem('token');
    }
    return false;
  }

  saveRoles(roles: string[]) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  saveAccessToken(accessToken: string): void {
    localStorage.setItem('token', accessToken);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRoles(): string[] | null {
    let text = localStorage.getItem('roles');
    return JSON.parse(text as string);
  }

  logout() {
    this.processLogout().subscribe({});
    localStorage.removeItem('token');
  }
}