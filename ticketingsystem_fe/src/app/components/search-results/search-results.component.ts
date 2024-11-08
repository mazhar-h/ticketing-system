import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventSource } from 'src/app/enums/event-source.enum';
import { EventService } from 'src/app/services/event.service';
import { Event, Performer } from 'src/app/types/event.type';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
})
export class SearchResultsComponent implements OnInit {
  events: Event[] = [];
  searchText: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchText = params['query'] || '';

      if (this.searchText) {
        this.eventService.searchEvents(this.searchText).subscribe({
          next: (events) => {
            events.original.forEach((event: any) => {
              if (event.status === 'OPEN') {
                this.events.push(this.createOriginalEvent(event));
              }
            });

            events.ticketmaster._embedded?.events.forEach((event: any) => {
              if (event.dates.status.code === 'onsale') {
                this.events.push(this.createTicketmasterEvent(event));
              }
            });
            this.events.sort((a, b) => a.date.getTime() - b.date.getTime());
          },
          error: (error) => {
            console.error('Error fetching events:', error);
          },
        });
      } else {
        this.eventService.getAllEvents().subscribe({
          next: (events) => {
            events.original.forEach((event: any) => {
              if (event.status === 'OPEN') {
                this.events.push(this.createOriginalEvent(event));
              }
            });

            events.ticketmaster._embedded?.events.forEach((event: any) => {
              if (event.dates.status.code === 'onsale') {
                this.events.push(this.createTicketmasterEvent(event));
              }
            });
            this.events.sort((a, b) => a.date.getTime() - b.date.getTime());
          },
          error: (error) => {
            console.error('Error fetching events:', error);
          },
        });
      }
    });
  }

  createOriginalEvent(event: any): Event {
    let newEvent: Event = {
      id: event.id,
      name: event.name,
      status: event.status,
      date: new Date(event.date),
      venue: event.venue,
      performers: event.performers,
      description: '',
      url: '',
      type: EventSource.o,
      tickets: event.tickets,
      images: []
    };
    return newEvent;
  }

  createTicketmasterEvent(event: any): Event {
    let performers: Performer[] = [];
    event._embedded.attractions?.forEach((attraction: Performer) => {
      performers.push(attraction);
    });
    let newEvent: Event = {
      id: event.id,
      name: event.name,
      status: event.dates.status.code,
      date: new Date(event.dates.start.dateTime),
      venue: event._embedded.venues[0] || '',
      performers: performers || [],
      description: '',
      url: event.url,
      type: EventSource.tm,
      tickets: [],
      images: []
    };
    return newEvent;
  }

  goToEventDetails(eventId: string): void {
    let event = this.events.filter((event) => event.id === eventId)[0];
    let sourceId = event.type;
    this.router.navigate(['/event', sourceId, eventId], {
      state: {
        data: event,
      },
    });
  }
}
