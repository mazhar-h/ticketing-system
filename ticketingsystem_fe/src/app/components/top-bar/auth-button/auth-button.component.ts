import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth-button',
  templateUrl: './auth-button.component.html',
  styleUrls: ['./auth-button.component.css']
})
export class AuthButtonComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string = '';
  roles: string[] | null = []
  isDropdownOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.authService.isLoggedIn.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });

    this.authService.user.subscribe(username => {
      this.username = username;
    });

    this.authService.roles.subscribe(roles => {
      this.roles = roles;
    });
  }

  goToCreateEvent() {
    this.router.navigate(['/venue/events/create']);
  }

  goToBookings() {
    this.router.navigate(['/bookings']);
  }

  goToScanner() {
    this.router.navigate(['/scanner']);
  }

  goToPayments() {
    this.router.navigate(['/payments']);
  }

  goToVenueEvents() {
    this.router.navigate(['/venue/events']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  signUp() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }
}