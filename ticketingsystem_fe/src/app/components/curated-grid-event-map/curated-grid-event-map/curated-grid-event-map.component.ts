import { Component } from '@angular/core';
import { Genre } from 'src/app/enums/genre.enum';

@Component({
  selector: 'app-curated-grid-event-map',
  templateUrl: './curated-grid-event-map.component.html',
  styleUrl: './curated-grid-event-map.component.css'
})
export class CuratedGridEventMapComponent {
  isGridView = true;
  isFilterMenuOpen = false;
  events: any[] = [];
  filteredEvents: any[] = [];
  startDate: string = '';
  endDate: string = '';
  genres = Object.keys(Genre);
  selectedGenre: Genre | null = null;

  constructor() {}

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  receiveEvents(events: any[]) {
    this.events = events;
    this.filteredEvents = events;
  }

  applyGenreFilter() {
    this.filteredEvents = this.events.filter(event => {
      return event.genres?.includes(this.selectedGenre);
    });
  }

  applyDateFilter() {
    if (this.startDate && this.endDate) {
      this.filteredEvents = this.events.filter(event => {
        const eventDate = new Date(event.date);
        const startDate = new Date(this.startDate);
        const utcStartDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
        const endDate = new Date(this.endDate);
        const utcEndDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
        utcEndDate.setHours(23, 59, 59, 999);
        return eventDate >= utcStartDate && eventDate <= utcEndDate;
      });
    } else {
      this.filteredEvents = this.events;
    }
  }

  clearAllFilters() {
    this.selectedGenre = null;
    this.startDate = '';
    this.endDate = '';
    this.filteredEvents = this.events;
  }
}
