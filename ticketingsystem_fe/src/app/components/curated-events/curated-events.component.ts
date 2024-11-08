import { Component, HostListener, OnInit } from '@angular/core';
import { EventSource } from 'src/app/enums/event-source.enum';
import { EventService } from 'src/app/services/event.service';
import { Event } from 'src/app/types/event.type';

@Component({
  selector: 'app-curated-events',
  templateUrl: './curated-events.component.html',
  styleUrls: ['./curated-events.component.css'],
})
export class CuratedEventsComponent implements OnInit {
  events: Event[] = [];
  currentPage = 0;
  loading = false;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    const curated = sessionStorage.getItem('curated');
    const page = sessionStorage.getItem('currentCuratedPage');
    if (curated && page) {
      this.events = JSON.parse(curated);
      this.currentPage = Number(page);
    } else this.loadEvents();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
      !this.loading
    ) {
      this.loadEvents();
    }
  }

  findGoodImage(event: Event) {
    if (event.type === EventSource.tm)
      return event.images.find((image: any) => image.height > 300).url;
    if (event.type === EventSource.o) return '/assets/placeholder_concert.jpg';
  }

  routerLinkGenerator(event: Event) {
    if (event.type === EventSource.tm) {
      return ['/event', 'tm', event.id];
    }
    if (event.type === EventSource.o) {
      return ['/event', 'o', event.id];
    }
    return null;
  }

  toDistinct(events: Event[]) {
    var seen: any = {};
    return events.filter(function (event: Event) {
      return seen.hasOwnProperty(event.id) ? false : (seen[event.id] = true);
    });
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getCuratedEvents(this.currentPage).subscribe({
      next: (newEvents: any) => {
        let originalEvents = newEvents.original
        .filter((event: any) => event.status === 'OPEN')
        .map((event: any) => {
          return this.createOriginalEvent(event);
        });
        let ticketmasterEvents = newEvents.ticketmaster._embedded?.events
          .filter((event: any) => event.dates.status.code === 'onsale')
          .map((event: any) => {
            return this.createTicketmasterEvent(event);
          });
        if (!ticketmasterEvents)
          ticketmasterEvents = [];
        this.events = [
          ...this.events,
          ...originalEvents,
          ...ticketmasterEvents,
        ];
        this.events = this.toDistinct(this.events);
        try {
          this.events.sort((a: Event, b: Event) => a.date.getTime() - b.date.getTime());
        } catch (error) {
          this.events.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        this.currentPage++;
        this.loading = false;
        sessionStorage.setItem('curated', JSON.stringify(this.events));
        sessionStorage.setItem('currentCuratedPage', String(this.currentPage));
      },
      error: () => {
        console.error('Error loading events');
        this.loading = false;
      },
    });
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
      images: event.images,
      type: EventSource.tm,
      description: '',
      status: '',
      performers: [],
      url: '',
      tickets: [],
    };
    return newEvent;
  }
}
