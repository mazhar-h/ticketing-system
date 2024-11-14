import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import * as ngeohash from 'ngeohash';
import 'leaflet.markercluster';
import { lastValueFrom } from 'rxjs';
import { EventSource } from 'src/app/enums/event-source.enum';
import { WeatherService } from 'src/app/services/weather.service';
import { EventMapService } from '../curated-events/event-map.service';
import { Event } from 'src/app/types/event.type';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.css'],
})
export class EventMapComponent implements OnInit {
  private map!: L.Map;
  @Input() events: any[] = [];
  markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false,
  });

  constructor(
    private eventMapService: EventMapService,
    private weatherService: WeatherService
  ) {}

  async ngOnInit(): Promise<void> {
    this.eventMapService.events$.subscribe((events) => {
      this.events = events;
      if (this.map)
        this.updateMarkers();
    });
  }

  async ngAfterViewInit() {
    await this.initMap();
    this.loadEventsFromSessionStorage();
  }

  private async initMap(): Promise<void> {
    const response = await lastValueFrom(this.weatherService.getLocation());
    let location = response.loc.split(',');
    this.map = L.map('map').setView([location[0], location[1]], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.map && changes['events']) {
      this.updateMarkers();
    }
  }

  loadEventsFromSessionStorage() {
    const curated = sessionStorage.getItem('curated');
    if (curated) {
      this.events = JSON.parse(curated);
      this.updateMarkers();
    }
  }

  private updateMarkers(): void {
    this.markers.clearLayers();
    this.addMarkers();
  }

  toDistinct(events: Event[]) {
    var seen: any = {};
    return events.filter(function (event: Event) {
      return seen.hasOwnProperty(event.id) ? false : (seen[event.id] = true);
    });
  }

  private addMarkers(): void {
    this.events = this.toDistinct(this.events);
    this.events.forEach((event) => {
      let marker = null;

      if (event.type === EventSource.tm) {
        marker = L.marker([
          event.venue.location.latitude,
          event.venue.location.longitude,
        ]);
      }
      if (event.type === EventSource.o) {
        const geoHash = event.venue.geoHash;
        const { latitude, longitude } = ngeohash.decode(geoHash);
        marker = L.marker([latitude, longitude]);
      }
      const options = {
        year: 'numeric' as any,
        month: 'long' as any,
        day: 'numeric' as any,
      };
      const date = new Date(event.date);
      let venue = '';
      if (event.venue.name)
        venue = `Venue: ${event.venue.name}<br>`;
      marker?.bindPopup(`
        <b>${event.name}</b><br>
        ${venue}
        Date: ${date.toLocaleString('en-US', options)}<br>
        <a href="/event/${event.type}/${
        event.id
      }" target="_blank">More details</a>
      `);
      this.markers.addLayer(marker!);
    });
    this.map.addLayer(this.markers);
  }
}
