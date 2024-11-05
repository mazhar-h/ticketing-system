import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { WeatherService } from 'src/app/services/weather.service';
import { StripeConnectInstance } from '@stripe/connect-js';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  message: string = 'Loading...';
  users: any[] = [];
  isTableVisible: boolean = false;
  deleteUsername: string = '';
  roles: string[] = [];
  searchText: string = '';
  stripeConnectInstance: StripeConnectInstance | null = null;
  weatherData: any;
  errorMessage: string | null = null;

  newUser = {
    username: '',
    email: '',
    role: '',
  };

  updateUserModel = {
    currentUsername: null,
    newUsername: null,
    newEmail: null,
    newRole: null,
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private weatherService: WeatherService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stripeConnectInstance = this.paymentService.getStripeConnectInstance();
    this.checkUserRoles();
    if (this.authService.getRoles()?.includes('ROLE_VENUE'))
      this.buildNotificationsComponent();
    this.getHelloMessage();
    this.getWeather();
  }

  buildNotificationsComponent() {
    const notificationComponent = this.stripeConnectInstance?.create(
      'notification-banner'
    );
    notificationComponent?.setCollectionOptions({
      fields: 'eventually_due',
      futureRequirements: 'include',
    });
    const container = document.getElementById('notification-container');
    container?.appendChild(notificationComponent as Node);
  }

  getHelloMessage(): void {
    this.userService.login().subscribe({
      next: (response: string) => {
        this.message = response;
      },
      error: (error: any) => {
        console.error('Error fetching hello message:', error);
      },
    });
  }

  toggleUsers(): void {
    if (!this.isTableVisible) {
      this.userService.getUsers().subscribe({
        next: (data: any[]) => {
          this.users = data;
          this.isTableVisible = true;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
        },
      });
    } else {
      this.isTableVisible = false;
    }
  }

  createUser(): void {
    this.userService.createUser(this.newUser).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        alert('User created successfully!');
        this.clearForm();
        this.toggleUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
      },
    });
  }

  updateUser(): void {
    this.userService.updateUser(this.updateUserModel).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);
        alert('User updated successfully!');
        this.clearForm();
        this.toggleUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
      },
    });
  }

  onDeleteUser() {
    if (this.deleteUsername) {
      this.userService.deleteUser(this.deleteUsername).subscribe({
        next: (response) => {
          console.log('User deleted successfully:', response);
          alert('User deleted successfully');
          this.deleteUsername = '';
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        },
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  checkUserRoles(): void {
    this.userService.getUser().subscribe({
      next: (response) => {
        response.roles.forEach((role: any) => {
          this.roles.push(role.name);
        });
        this.authService.saveRoles(this.roles);
      },
    });
  }

  getWeather(): void {
    this.weatherService.getWeather().subscribe({
      next: (data: any) => {
        this.weatherData = data;
        this.errorMessage = null;
      },
      error: () => {
        this.errorMessage =
          'Could not fetch weather data. Please try again later.';
        this.weatherData = null;
      },
    });
  }

  clearForm(): void {
    this.newUser = {
      username: '',
      email: '',
      role: '',
    };

    this.updateUserModel = {
      currentUsername: null,
      newUsername: null,
      newEmail: null,
      newRole: null,
    };
  }

  onSearchChange() {
    // Logic when search text changes (optional)
    console.log(this.searchText);
  }

  searchEvents() {
    this.router.navigate(['/search-results'], {
      queryParams: { query: this.searchText },
    });
    console.log('Searching events for:', this.searchText);
  }
}
