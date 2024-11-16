import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { EventSource } from 'src/app/enums/event-source.enum';
import { EventService } from 'src/app/services/event.service';
import { Event } from 'src/app/types/event.type';
import { AudioService } from 'src/app/services/audio.service';
import { lastValueFrom } from 'rxjs';

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
  isPlaying = false;
  playingEventId: string | null = null;

  constructor(
    private eventService: EventService,
    private audioService: AudioService
  ) {}

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

  togglePlay(event: any) {
    const audio = document.querySelector(
      `audio[src="${event.preview_url}"]`
    ) as HTMLAudioElement;

    if (this.playingEventId === event.id) {
      audio.pause();
      this.playingEventId = null;
    } else {
      if (this.playingEventId !== null) {
        const previousAudio = document.querySelector(
          `audio[src="${
            this.events.find((e) => e.id === this.playingEventId)?.preview_url
          }"]`
        ) as HTMLAudioElement;
        previousAudio?.pause();
      }

      audio.play();
      this.playingEventId = event.id;

      audio.onended = () => {
        this.playingEventId = null;
        audio.onended = null; // Clean up listener
      };
    }
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

  async loadEvents() {
    this.loading = true;
    try {
      const newEvents = await lastValueFrom(
        this.eventService.getCuratedEvents(this.currentPage)
      );

      const originalEventsPromises = newEvents?.original
        .filter((event: any) => event.status === 'OPEN')
        .map((event: any) => this.createOriginalEvent(event));

      const ticketmasterEventsPromises =
        newEvents?.ticketmaster?._embedded?.events
          .filter((event: any) => event.dates.status.code === 'onsale')
          .map((event: any) => this.createTicketmasterEvent(event));

      const originalEvents = await Promise.all(originalEventsPromises);
      const ticketmasterEvents = await Promise.all(ticketmasterEventsPromises);

      this.events = [
        ...this.events,
        ...(originalEvents ?? []),
        ...(ticketmasterEvents ?? []),
      ];

      this.events = this.toDistinct(this.events);
      this.eventsLoaded.emit(this.events);
      this.currentPage++;
      this.moreResultsAvailable =
        newEvents?.ticketmaster.page.totalPages - 1 - this.currentPage > 0;
      this.loading = false;
      sessionStorage.setItem('curated', JSON.stringify(this.events));
      sessionStorage.setItem('currentCuratedPage', String(this.currentPage));
    } catch (error) {
      console.error('Error loading events:', error);
      this.loading = false;
    }
  }

  async createOriginalEvent(event: any): Promise<Event> {
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

    if (
      event?.performers &&
      event.performers.length > 0
    ) {
      try {
        const topTracks = await lastValueFrom(
          this.audioService.getTopTracks(event.performers[0].name)
        );
        if (topTracks && topTracks.tracks.length > 0) {
          newEvent.preview_url = topTracks.tracks[0].preview_url;
          newEvent.spotify_link = topTracks.tracks[0].external_urls.spotify;
        }
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    }
    return newEvent;
  }

  async createTicketmasterEvent(event: any): Promise<Event> {
    let genres = event?._embedded?.attractions?.map((attraction: any) => {
      let genres: any[] = [];
      attraction?.classifications?.forEach((classification: any) => {
        if (classification.genre) genres.push(classification.genre.name);
      });
      return genres;
    });

    let venue = event._embedded.venues
      ? event._embedded.venues[0]
      : { name: '' };

    let newEvent: Event = {
      id: event.id,
      name: event.name,
      date: new Date(event.dates.start.dateTime),
      venue: venue,
      images: event.images,
      location: venue.location ?? null,
      genres: genres?.flat() ?? [],
      preview_url: '',
      spotify_link: '',
      type: EventSource.tm,
      description: '',
      status: '',
      performers: [],
      url: '',
      tickets: [],
    };

    if (
      event?._embedded?.attractions &&
      event._embedded.attractions.length > 0
    ) {
      try {
        const topTracks = await lastValueFrom(
          this.audioService.getTopTracks(event._embedded.attractions[0].name)
        );
        if (topTracks && topTracks.tracks.length > 0) {
          newEvent.preview_url = topTracks.tracks[0].preview_url;
          newEvent.spotify_link = topTracks.tracks[0].external_urls.spotify;
        }
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    }

    return newEvent;
  }
}
