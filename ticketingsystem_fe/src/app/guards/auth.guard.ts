import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const token = this.authService.getToken();

    if (token && this.authService.isTokenExpired(token)) {
      return this.authService.refreshToken().pipe(
        switchMap(() => this.checkAuthenticatedAndNavigate()),
        catchError(() => {
          this.router.navigate(['/forbidden']);
          return of(false);
        })
      );
    } else {
      return this.checkAuthenticatedAndNavigate();
    }
  }

  private checkAuthenticatedAndNavigate(): Observable<boolean> {
    const isAuthenticated =
      this.authService.isAuthenticated();
    if (!isAuthenticated) {
      this.router.navigate(['/forbidden']);
    }
    return of(isAuthenticated as boolean);
  }
}
