import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventMapService {
  private eventsSource = new BehaviorSubject<any[]>([]);
  events$ = this.eventsSource.asObservable();

  updateEvents(events: any[]) {
    this.eventsSource.next(events);
  }
}