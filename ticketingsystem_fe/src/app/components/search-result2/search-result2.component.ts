import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventSource } from 'src/app/enums/event-source.enum';
import { EventService } from 'src/app/services/event.service';
import { Event } from 'src/app/types/event.type';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result2.component.html',
  styleUrls: ['./search-result2.component.css'],
})
export class SearchResult2Component implements OnInit {
  searchText: string = '';
  events: Event[] = []; // Full list of events
  loading: boolean = false;
  currentPage = 0;
  moreResultsAvailable: boolean = true;

  constructor(private eventService: EventService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchText = params['query'] || '';});
    this.onSearch();
  }

  createOriginalEvent(event: any): Event {
    let newEvent: Event = {
      id: event.id,
      name: event.name,
      date: new Date(event.date),
      venue: event.venue,
      type: EventSource.o,
      description: '',
      status: '',
      performers: [],
      url: '',
      tickets: [],
      images: [],
    };
    return newEvent;
  }

  createTicketmasterEvent(event: any): Event {
    let newEvent: Event = {
      id: event.id,
      name: event.name,
      date: new Date(event.dates.start.dateTime),
      venue: event._embedded.venues[0] || '',
      url: event.url,
      type: EventSource.tm,
      description: '',
      status: '',
      performers: [],
      tickets: [],
      images: [],
    };
    return newEvent;
  }

  onSearch(): void {
    if (this.searchText.trim()) {
      this.currentPage = 0;
      this.moreResultsAvailable = true;
      this.events = [];
      this.loadEvents();
    } else {
      this.currentPage = 0;
      this.moreResultsAvailable = true;
      this.events = [];
      this.loadCurated();
    }
  }

  toDistinct(events: Event[]) {
    var seen: any = {};
    return events.filter(function (event: Event) {
      return seen.hasOwnProperty(event.id) ? false : (seen[event.id] = true);
    });
  }

  loadEvents() {
    this.loading = true;
    this.eventService
      .searchEvents(this.searchText, this.currentPage)
      .subscribe({
        next: (events: any) => {
          let originalEvents = events?.original
            .filter((event: any) => event.status === 'OPEN')
            .map((event: any) => {
              return this.createOriginalEvent(event);
            });
          let ticketmasterEvents = events?.ticketmaster._embedded?.events
            .filter((event: any) => event.dates.status.code === 'onsale')
            .map((event: any) => {
              return this.createTicketmasterEvent(event);
            });
          let newEvents = [
            ...(originalEvents ?? []),
            ...(ticketmasterEvents ?? []),
          ];
          newEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
          this.events = [...this.events, ...newEvents];
          this.events = this.toDistinct(this.events);
          this.moreResultsAvailable =
            events?.ticketmaster.page.totalPages-1 - this.currentPage > 0;
          this.currentPage++;
          this.loading = false;
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error loading events:', error);
        },
      });
  }

  loadCurated() {
    this.loading = true;
    this.eventService.getCuratedEvents(this.currentPage, 50).subscribe({
      next: (events: any) => {
        let originalEvents = events?.original
          .filter((event: any) => event.status === 'OPEN')
          .map((event: any) => {
            return this.createOriginalEvent(event);
          });
          console.log(events.original);
        let ticketmasterEvents = events?.ticketmaster._embedded?.events
          .filter((event: any) => event.dates.status.code === 'onsale')
          .map((event: any) => {
            return this.createTicketmasterEvent(event);
          });
        let newEvents = [
          ...(originalEvents ?? []),
          ...(ticketmasterEvents ?? []),
        ];
        newEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
        this.events = [...this.events, ...newEvents];
        this.events = this.toDistinct(this.events);
        this.moreResultsAvailable =
          events?.ticketmaster.page.totalPages-1 - this.currentPage > 0;
        this.currentPage++;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching events:', error);
      },
    });
  }

  loadMore(): void {
    if (this.searchText)
      this.loadEvents();
    else 
      this.loadCurated();
  }

  goToEventDetails(event: Event): void {
    window.open(`/event/${event.type}/${event.id}`, '_blank');
  }
}
