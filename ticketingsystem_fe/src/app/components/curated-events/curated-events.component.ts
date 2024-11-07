import { Component, HostListener, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';

interface Event {
  id: string;
  name: string;
  images: [
    {
      url: string;
      width: string;
      height: string;
    }
  ];
  _embedded: {
    venues: [
      {
        name: string;
      }
    ];
  };
  dates: {
    start: {
      dateTime: string;
    };
  };
}

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

  findGoodImage(event: any) {
    return event.images.find((image: any) => image.height > 300).url;
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getCuratedEvents(this.currentPage).subscribe({
      next: (newEvents: any) => {
        this.events = [
          ...this.events,
          ...newEvents.ticketmaster._embedded.events.filter(
            (event: any) => event.dates.status.code === 'onsale'
          ),
        ];
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
}
