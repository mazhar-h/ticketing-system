import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, Performer } from 'src/app/types/event.type';
import { EventService } from 'src/app/services/event.service';
import { TicketSelectionModalComponent } from '../ticket-selection-modal/ticket-selection-modal.component';
import { EventSource } from 'src/app/enums/event-source.enum';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
})
export class EventDetailsComponent implements OnInit {
  eventId!: string;
  sourceId!: string;
  eventDetails: Event;
  showTicketSelectionModal: boolean = false;
  @ViewChild(TicketSelectionModalComponent) ticketSelectionModal!: TicketSelectionModalComponent;

  constructor(private eventService: EventService, private route: ActivatedRoute, private router: Router) {
    const data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    this.eventDetails = data;
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.sourceId = this.route.snapshot.paramMap.get('sourceId')!;
    this.fetchEventDetails(this.sourceId);
  }

  fetchEventDetails(sourceId: string): void {
    this.eventService.getEvent(this.eventId, sourceId).subscribe(
      (event) => {
        switch(sourceId) {
          case EventSource.o:
            this.eventDetails = event;
            break;
          case EventSource.tm:
            this.eventDetails = {} as Event;
            let performers: Performer[] = [];
            event._embedded.attractions?.forEach(
              (attraction: Performer) => {
                performers.push(attraction);
              });
            this.eventDetails.id = event.id;
            this.eventDetails.name = event.name;
            this.eventDetails.status = event.dates.status.code;
            this.eventDetails.date = new Date(event.dates.start.dateTime);
            this.eventDetails.venue = event._embedded.venues[0];
            this.eventDetails.performers = performers;
            this.eventDetails.description = '';
            this.eventDetails.url = event.url;
            this.eventDetails.type = 'ticketmaster';
            this.eventDetails.tickets = [];
            break;
        }
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }

  openTicketSelectionModal() {
    if (this.sourceId !== 'o') {
      window.location.href = this.eventDetails.url;
      return;
    }
    setTimeout(() => {
      this.ticketSelectionModal.fetchTickets();
    });
    this.showTicketSelectionModal = true;
  }

  onModalClosed() {
    this.showTicketSelectionModal = false;
  }
}
