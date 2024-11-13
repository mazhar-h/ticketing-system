import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-venue-event-list',
  templateUrl: './venue-event-list.component.html',
  styleUrls: ['./venue-event-list.component.css']
})
export class VenueEventListComponent implements OnInit {
  venueId!: string;
  events: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.venueId = this.route.snapshot.paramMap.get('venueId') || '';
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.eventService.getEventsByVenue().subscribe(
      (data: any) => {
        this.events = data;
      },
      (error: any) => {
        console.error('Error fetching events: ', error);
      }
    );
  }

  editEvent(eventId: string): void {
    this.router.navigate(['/venue', 'events', eventId, 'edit']);
  }
}