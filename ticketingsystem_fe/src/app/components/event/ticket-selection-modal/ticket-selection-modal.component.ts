import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';
import { Event } from 'src/app/types/event.type';

@Component({
  selector: 'app-ticket-selection-modal',
  templateUrl: './ticket-selection-modal.component.html',
  styleUrl: './ticket-selection-modal.component.css',
})
export class TicketSelectionModalComponent implements OnInit {
  @Output() modalClosed: EventEmitter<void> = new EventEmitter();
  ticketsByPrice: any[] = [];
  selectedTicketIds: string[] = [];
  rawTickets: any[] = [];
  showReserveModal: boolean = false;
  @Input() venueId: number | null = null;
  @Input() showSelectionModal: boolean = false;
  @Input() event: Event | null = null;
  eventId!: string;
  totalAmount: number = 0;

  constructor(private eventService: EventService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
  }

  getSelectedTickets(): any[] {
    const selectedTikets = this.rawTickets.filter((x) =>
      this.selectedTicketIds.includes(x.id)
    );
    return selectedTikets;
  }

  calculateTotalAmount(): void {
    this.totalAmount = this.ticketsByPrice.reduce((total, group) => {
      return total + group.price * group.selectedCount;
    }, 0);

    console.log('Total amount for selected tickets:', this.totalAmount);
  }

  fetchTickets(): void {
    this.eventService.getEvent(this.eventId).subscribe((event: any) => {
      this.venueId = event.venue.id;
      this.rawTickets = event?.tickets;
      this.aggregateTicketsByPrice();
    });
  }

  aggregateTicketsByPrice(): void {
    const availableTickets = this.rawTickets.filter(
      (ticket) => ticket.status === 'AVAILABLE'
    );

    const ticketMap: { [price: number]: any } = {};

    availableTickets.forEach((ticket) => {
      if (!ticketMap[ticket.price]) {
        ticketMap[ticket.price] = {
          price: ticket.price,
          totalAvailable: 0,
          tickets: [],
          selectedCount: 0,
        };
      }
      ticketMap[ticket.price].totalAvailable++;
      ticketMap[ticket.price].tickets.push(ticket);
    });

    this.ticketsByPrice = Object.values(ticketMap);
  }

  incrementTicket(price: number): void {
    const priceGroup = this.ticketsByPrice.find(
      (group) => group.price === price
    );
    if (priceGroup && priceGroup.selectedCount < priceGroup.totalAvailable) {
      const randomTicket =
        priceGroup.tickets[
          Math.floor(Math.random() * priceGroup.tickets.length)
        ];
      this.selectedTicketIds.push(randomTicket.id);

      priceGroup.tickets = priceGroup.tickets.filter(
        (ticket: any) => ticket.id !== randomTicket.id
      );
      priceGroup.selectedCount++;

      this.calculateTotalAmount();
      console.log('Selected ticket IDs:', this.selectedTicketIds);
    }
  }

  decrementTicket(price: number): void {
    const priceGroup = this.ticketsByPrice.find(
      (group) => group.price === price
    );
    if (priceGroup && priceGroup.selectedCount > 0) {
      const removedTicketId = this.selectedTicketIds.pop();
      priceGroup.selectedCount--;

      const ticketToReturn = this.rawTickets.find(
        (ticket) => ticket.id === removedTicketId
      );
      if (ticketToReturn) {
        priceGroup.tickets.push(ticketToReturn);
      }

      this.calculateTotalAmount();
      console.log('Selected ticket IDs:', this.selectedTicketIds);
    }
  }

  removeTicket(ticketId: string): void {
    this.selectedTicketIds = this.selectedTicketIds.filter(
      (id) => id !== ticketId
    );
    console.log('Updated selected ticket IDs:', this.selectedTicketIds);
  }

  close(): void {
    this.selectedTicketIds = [];
    this.modalClosed.emit();
  }

  openReserveModal(): void {
    this.goToReserveTickets();
  }

  goToReserveTickets(): void {
    const tickets = this.rawTickets.filter((ticket: any) => this.selectedTicketIds.includes(ticket.id))
    this.router.navigate(['/reserve'], {
      state: {
        data: {
          tickets: tickets,
          event: this.event
        },
      },
    });
  }
}
