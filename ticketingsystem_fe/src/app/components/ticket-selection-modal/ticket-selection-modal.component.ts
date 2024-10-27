import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-ticket-selection-modal',
  templateUrl: './ticket-selection-modal.component.html',
  styleUrl: './ticket-selection-modal.component.css'
})
export class TicketSelectionModalComponent implements OnInit {
  @Output() modalClosed: EventEmitter<void> = new EventEmitter();
  ticketsByPrice: any[] = [];
  selectedTicketIds: string[] = [];
  rawTickets: any[] = [];
  showReserveModal: boolean = false;
  @Input() showSelectionModal: boolean = false;
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

    fetchTickets(): void {
      this.eventService.getEvent(this.eventId).subscribe((event: any) => {
        this.rawTickets = event?.tickets;
        this.aggregateTicketsByPrice();
      });
    }
  
  aggregateTicketsByPrice(): void {
    const availableTickets = this.rawTickets.filter(ticket => ticket.status === 'AVAILABLE');

    const ticketMap: { [price: number]: any } = {};

    availableTickets.forEach(ticket => {
      if (!ticketMap[ticket.price]) {
        ticketMap[ticket.price] = {
          price: ticket.price,
          totalAvailable: 0,
          tickets: [],
          selectedCount: 0
        };
      }
      ticketMap[ticket.price].totalAvailable++;
      ticketMap[ticket.price].tickets.push(ticket);
    });

    this.ticketsByPrice = Object.values(ticketMap);
  }

  incrementTicket(price: number): void {
    const priceGroup = this.ticketsByPrice.find(group => group.price === price);
    if (priceGroup && priceGroup.selectedCount < priceGroup.totalAvailable) {
      const randomTicket = priceGroup.tickets[Math.floor(Math.random() * priceGroup.tickets.length)];
      this.selectedTicketIds.push(randomTicket.id);

      priceGroup.tickets = priceGroup.tickets.filter((ticket: any) => ticket.id !== randomTicket.id);
      priceGroup.selectedCount++;

      this.calculateTotalAmount();
      console.log('Selected ticket IDs:', this.selectedTicketIds);
    }
  }

  decrementTicket(price: number): void {
    const priceGroup = this.ticketsByPrice.find(group => group.price === price);
    if (priceGroup && priceGroup.selectedCount > 0) {
      const removedTicketId = this.selectedTicketIds.pop();
      priceGroup.selectedCount--;

      const ticketToReturn = this.rawTickets.find(ticket => ticket.id === removedTicketId);
      if (ticketToReturn) {
        priceGroup.tickets.push(ticketToReturn);
      }

      this.calculateTotalAmount();
      console.log('Selected ticket IDs:', this.selectedTicketIds);
    }
  }

  removeTicket(ticketId: string): void {
    this.selectedTicketIds = this.selectedTicketIds.filter(id => id !== ticketId);
    console.log('Updated selected ticket IDs:', this.selectedTicketIds);
  }

  close(): void {
    this.selectedTicketIds = [];
    this.modalClosed.emit();
  }

  openReserveModal(): void {
    this.showReserveModal = true;
    this.showSelectionModal = false;
  }

  async closeReserveModal(): Promise<void> {
    await new Promise(r => setTimeout(r, 100));
    this.selectedTicketIds = []
    this.fetchTickets();
    this.showReserveModal = false;
    this.showSelectionModal = true;
  }

  closeReserveModalAfterBooking() {
    this.selectedTicketIds = []
    this.showReserveModal = false;
    this.showSelectionModal = false; 
    this.close();
  }
}
