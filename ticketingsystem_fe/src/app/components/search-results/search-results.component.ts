import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
})
export class SearchResultsComponent implements OnInit {
  events: any[] = [];
  searchText: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private eventService: EventService) {}

  ngOnInit(): void {
    // Get the search query from the route parameters
    this.route.queryParams.subscribe((params) => {
      this.searchText = params['query'] || '';

      // Make the GET request to fetch events based on the search query
      if (this.searchText) {
        this.eventService.searchEvents(this.searchText).subscribe(
          (events) => {
            this.events = events;
          },
          (error) => {
            console.error('Error fetching events:', error);
          }
        );
      } else {
        this.eventService.getAllEvents().subscribe(
          (events) => {
            this.events = events;
          },
          (error) => {
            console.error('Error fetching events:', error);
          }
        );
      }
    });
  }

  goToEventDetails(eventId: number): void {
    this.router.navigate(['/event', eventId]);
  }
}
