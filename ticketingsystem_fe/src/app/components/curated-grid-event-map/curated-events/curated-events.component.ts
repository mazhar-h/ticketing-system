import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { EventSource } from 'src/app/enums/event-source.enum';
import { EventService } from 'src/app/services/event.service';
import { Event } from 'src/app/types/event.type';
import { EventMapService } from './event-map.service';

@Component({
  selector: 'app-curated-events',
  templateUrl: './curated-events.component.html',
  styleUrls: ['./curated-events.component.css'],
})
export class CuratedEventsComponent implements OnInit {
  @Input() events: Event[] = [];
  @Output() eventsLoaded = new EventEmitter<any[]>();
  currentPage = 0;
  loading = false;
  moreResultsAvailable = true;

  constructor(private eventService: EventService, private eventMapService: EventMapService) {}

  ngOnInit() {
    const curated = sessionStorage.getItem('curated');
    const page = sessionStorage.getItem('currentCuratedPage');
    if (curated && page) {
      this.events = JSON.parse(curated);
      this.currentPage = Number(page);
      this.eventsLoaded.emit(this.events);
    } else this.loadEvents();
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
        this.eventMapService.updateEvents(this.events);
        this.eventsLoaded.emit(this.events);
        try {
          this.events.sort((a: Event, b: Event) => a.date.getTime() - b.date.getTime());
        } catch (error) {
          this.events.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        this.currentPage++;
        this.moreResultsAvailable =
        newEvents?.ticketmaster.page.totalPages-1 - this.currentPage > 0;
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
    let genres = event?._embedded?.attractions?.map((attraction: any) => {
        let genres: any[] = [];
        attraction?.classifications?.forEach((classification: any) => {
          if (classification.genre)
            genres.push(classification.genre.name);
        });
        return genres;
    });
    let newEvent: Event = {
      id: event.id,
      name: event.name,
      date: new Date(event.dates.start.dateTime),
      venue: event._embedded.venues[0] || '',
      images: event.images,
      location: event._embedded.venues !== null ? event._embedded.venues[0].location : null,
      genres: genres?.flat() ?? [],
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
