import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-ticket-selection-modal',
  templateUrl: './ticket-selection-modal.component.html',
  styleUrl: './ticket-selection-modal.component.css'
})
export class TicketSelectionModalComponent {
  @Output() modalClosed: EventEmitter<void> = new EventEmitter(); // Emit event to close modal
  ticketsByPrice: any[] = []; // Grouped tickets by price
  selectedTicketIds: string[] = []; // Stores selected ticket ids
  rawTickets: any[] = []; // Raw tickets fetched from the API
  showReserveModal: boolean = false; // For controlling modal display
  @Input() showSelectionModal: boolean = false; // Control TicketPurchaseModal visibility
  eventId!: number;
  totalAmount: number = 0;

  constructor(private eventService: EventService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchTickets();
  }

  getSelectedTickets(): any[] {
    const selectedTikets = this.rawTickets.filter(x => this.selectedTicketIds.includes(x.id))
    return selectedTikets;
  }

  calculateTotalAmount(): void {
    this.totalAmount = this.ticketsByPrice.reduce((total, group) => {
      return total + (group.price * group.selectedCount);
    }, 0);

    console.log('Total amount for selected tickets:', this.totalAmount);
  }

    // Fetch tickets from the server
    fetchTickets(): void {
      this.eventService.getEvent(this.eventId).subscribe((event: any) => {
        this.rawTickets = event?.tickets;
        this.aggregateTicketsByPrice();
      });
    }
  
  // Aggregate tickets by price and filter only AVAILABLE tickets
  aggregateTicketsByPrice(): void {
    const availableTickets = this.rawTickets.filter(ticket => ticket.status === 'AVAILABLE');

    const ticketMap: { [price: number]: any } = {};

    availableTickets.forEach(ticket => {
      if (!ticketMap[ticket.price]) {
        ticketMap[ticket.price] = {
          price: ticket.price,
          totalAvailable: 0,
          tickets: [],
          selectedCount: 0 // Track how many tickets are selected
        };
      }
      ticketMap[ticket.price].totalAvailable++;
      ticketMap[ticket.price].tickets.push(ticket);
    });

    // Convert the ticketMap to an array to render in the view
    this.ticketsByPrice = Object.values(ticketMap);
  }

  // Increment ticket quantity
  incrementTicket(price: number): void {
    const priceGroup = this.ticketsByPrice.find(group => group.price === price);
    if (priceGroup && priceGroup.selectedCount < priceGroup.totalAvailable) {
      const randomTicket = priceGroup.tickets[Math.floor(Math.random() * priceGroup.tickets.length)];
      this.selectedTicketIds.push(randomTicket.id);

      // Remove the ticket from the list so it can't be selected again
      priceGroup.tickets = priceGroup.tickets.filter((ticket: any) => ticket.id !== randomTicket.id);
      priceGroup.selectedCount++;

      this.calculateTotalAmount();
      console.log('Selected ticket IDs:', this.selectedTicketIds);
    }
  }

  // Decrement ticket quantity
  decrementTicket(price: number): void {
    const priceGroup = this.ticketsByPrice.find(group => group.price === price);
    if (priceGroup && priceGroup.selectedCount > 0) {
      // Remove the last added ticket for this price
      const removedTicketId = this.selectedTicketIds.pop();
      priceGroup.selectedCount--;

      // Simulate returning the ticket back to available list
      const ticketToReturn = this.rawTickets.find(ticket => ticket.id === removedTicketId);
      if (ticketToReturn) {
        priceGroup.tickets.push(ticketToReturn);
      }

      this.calculateTotalAmount();
      console.log('Selected ticket IDs:', this.selectedTicketIds);
    }
  }

  // Remove a ticket from the selection
  removeTicket(ticketId: string): void {
    this.selectedTicketIds = this.selectedTicketIds.filter(id => id !== ticketId);
    console.log('Updated selected ticket IDs:', this.selectedTicketIds);
  }

  close(): void {
    this.modalClosed.emit(); // Emit the close event
  }

  openReserveModal(): void {
    this.showReserveModal = true;  // Show the reserve modal
    this.showSelectionModal = false; // Hide the purchase modal
  }

  async closeReserveModal(): Promise<void> {
    await new Promise(r => setTimeout(r, 100));
    this.selectedTicketIds = []
    this.fetchTickets();
    this.showReserveModal = false; // Hide the reserve modal
    this.showSelectionModal = true;  // Show the purchase modal again
  }

  closeReserveModalAfterBooking() {
    this.selectedTicketIds = []
    this.showReserveModal = false;
    this.showSelectionModal = false; 
    this.close();
  }
}
