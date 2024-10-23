import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';

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

  constructor(private bookingsService: BookingService) {}

  ngOnInit(): void {
    this.loadBookingDetails();
  }

  loadBookingDetails() {
    this.bookingDetails = this.bookings.find(x => x.id === this.bookingId);
  }

  closeModal() {
    this.close.emit();
  }
}
