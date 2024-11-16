import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';
import { EventSource } from '../enums/event-source.enum';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private eventUrl = environment.apiUrl + '/ticketing/events';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCuratedEvents(page: number, size: number = 20): Observable<any> {
    return this.http.get(`${this.eventUrl}/search?keyword=&original=true&location=true&classificationId=&page=${page}&size=${size}&sort=date,asc&radius=30&unit=miles`);
  }

  getEventsByVenue() {
    return this.http.get(`${this.eventUrl}/venue`);
  }

  createEvent(data: any): Observable<any> {
    return this.http.post(`${this.eventUrl}`, data);
  }

  getEvent(id: string, source: string = EventSource.o): Observable<any> {
    return this.http.get(`${this.eventUrl}/${id}?&source=${source}`);

  }

  updateEvent(eventId: string, updatedEvent: { name: any; performerIds: any; date: any; }) {
    return this.http.put(`${this.eventUrl}/${eventId}`, updatedEvent);

  }

  getAllEvents(): Observable<any> {
    return this.http.get(`${this.eventUrl}`);
  }

  searchEvents(searchText: string, page: number): Observable<any> {
    return this.http.get(`${this.eventUrl}/search?keyword=${searchText}&original=true&location=false&classificationId=&page=${page}&size=50&sort=date,asc&radius=&unit=`);
  }
}