import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  searchText: string = '';

  constructor(private router: Router) {}

  onSearchChange() {
    // Logic when search text changes (optional)
    console.log(this.searchText);
  }

  searchEvents() {
    this.router.navigate(['/search'], { queryParams: { query: this.searchText } });
    console.log('Searching events for:', this.searchText);
  }

  goToLogin() {
    // Navigate to the login page
    this.router.navigate(['/login']);
  }
}
