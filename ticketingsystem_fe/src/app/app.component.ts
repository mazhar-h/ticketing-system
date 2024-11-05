import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PaymentService } from './services/payment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'ticketing-system';

  constructor(
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    if (this.authService.getRoles()?.includes('ROLE_VENUE'))
      this.paymentService.initializeStripeConnect();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const token = this.authService.getToken();
        if (token && this.authService.isTokenExpired(token)) {
          this.authService.refreshToken().subscribe();
        }
      }
    });
  }
}
