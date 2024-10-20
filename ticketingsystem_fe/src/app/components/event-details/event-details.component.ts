import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EventService } from 'src/app/services/event.service';
import { TicketSelectionModalComponent } from '../ticket-selection-modal/ticket-selection-modal.component';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  eventId!: number;
  eventDetails: any;
  showTicketSelectionModal: boolean = false;
  @ViewChild(TicketSelectionModalComponent) ticketPurchaseModal!: TicketSelectionModalComponent;

  constructor(private route: ActivatedRoute, private router: Router, private eventService: EventService) {}

  ngOnInit(): void {
    // Get the event ID from the route parameters
    this.eventId = +this.route.snapshot.paramMap.get('id')!;

    // Fetch the event details from the API
    this.fetchEventDetails();
  }

  fetchEventDetails(): void {
    this.eventService.getEvent(this.eventId).subscribe(
      (event) => {
        this.eventDetails = event;
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }

  openTicketSelectionModal() {
    this.showTicketSelectionModal = true;
    setTimeout(() => {
      this.ticketPurchaseModal.fetchTickets();
    });
  }

  onModalClosed() {
    this.showTicketSelectionModal = false;
  }
}
