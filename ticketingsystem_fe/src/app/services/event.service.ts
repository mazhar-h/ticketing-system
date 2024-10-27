import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private eventUrl = environment.apiUrl + '/ticketing/events';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getEventsByVenue() {
    return this.http.get(`${this.eventUrl}/venue`);
  }

  createEvent(data: any): Observable<any> {
    return this.http.post(`${this.eventUrl}`, data)
  }

  getEvent(id: number): Observable<any> {
    return this.http.get(`${this.eventUrl}/${id}`);

  }

  updateEvent(eventId: string, updatedEvent: { name: any; performerIds: any; date: any; }) {
    return this.http.post(`${this.eventUrl}/${eventId}`, updatedEvent)

  }

  getAllEvents(): Observable<any> {
    return this.http.get(`${this.eventUrl}`);
  }

  searchEvents(searchText: string): Observable<any> {
    return this.http.get(`${this.eventUrl}?keyword=${searchText}`);
  }
}