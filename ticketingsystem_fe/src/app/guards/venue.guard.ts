import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of, catchError, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VenueGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const token = this.authService.getToken();

    if (token && this.authService.isTokenExpired(token)) {
      return this.authService.refreshToken().pipe(
        switchMap(() => this.checkRoleAndNavigate()),
        catchError(() => {
          this.router.navigate(['/forbidden']);
          return of(false);
        })
      );
    } else {
      return this.checkRoleAndNavigate();
    }
  }

  private checkRoleAndNavigate(): Observable<boolean> {
    const hasRole =
      this.authService.isAuthenticated() &&
      this.authService.getRoles()?.includes('ROLE_VENUE');
    if (!hasRole) {
      this.router.navigate(['/forbidden']);
    }
    return of(hasRole as boolean);
  }
}
