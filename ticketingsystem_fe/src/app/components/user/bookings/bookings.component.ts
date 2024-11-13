import { Component, OnInit } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  bookings: any[] = [];
  selectedBookingId: string | null = null;
  isModalOpen: boolean = false;

  constructor(private bookingsService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingsService.getBookingsForUser().subscribe(data => {
      this.bookings = data;
    });
  }

  openBookingDetails(bookingId: string) {
    this.selectedBookingId = bookingId;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}