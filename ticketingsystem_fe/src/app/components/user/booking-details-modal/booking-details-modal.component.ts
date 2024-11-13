import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-booking-details-modal',
  templateUrl: './booking-details-modal.component.html',
  styleUrls: ['./booking-details-modal.component.css']
})
export class BookingDetailsModalComponent implements OnInit {
  @Input() bookingId!: string | null;
  @Input() bookings: any[] = []
  @Output() close = new EventEmitter<void>();
  bookingDetails: any;

  constructor() {}

  ngOnInit(): void {
    this.loadBookingDetails();
  }

  ngAfterViewInit() {
    this.generateQRCode(this.bookingDetails.tickets);
  }

  generateQRCode(ticketData: any) {
    ticketData.forEach((ticket: any) => {
      const canvas = document.getElementById('ticket-' + ticket.id) as HTMLCanvasElement;
      QRCode.toCanvas(canvas, ticket.token, { width: 200 }, (error: any) => {
        if (error) console.error(error);
        console.log('QR code generated successfully');
      });
    });
  }

  getTimeFromDate(date: any): string {
    return new Date(date).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
  }

  loadBookingDetails() {
    this.bookingDetails = this.bookings.find(x => x.id === this.bookingId);
  }

  closeModal() {
    this.close.emit();
  }
}
