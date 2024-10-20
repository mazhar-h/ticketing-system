import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-reserve-ticket-modal',
  templateUrl: './reserve-ticket-modal.component.html',
  styleUrls: ['./reserve-ticket-modal.component.css'],
})
export class ReserveTicketModalComponent implements OnInit {
  @Input() ticketIds: string[] = [];
  @Output() closeModal = new EventEmitter<void>();
  bookingId: number | undefined;
  isLoggedIn = false;
  timer: number = 300;
  interval: any;
  isTicketsAvailable = true;

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.createReservation();
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  createReservation(): void {
    if (this.isLoggedIn) {
      this.startTimer();
      const numberArray = [];
      for (let i = 0; i < this.ticketIds.length; i++) {
        numberArray.push(Number(this.ticketIds[i]));
      }
      this.bookingService.createReservation(numberArray).subscribe(
        (response) => {
          this.bookingId = response.id;
          console.log('Reservation created:', response);
        },
        (error) => {
          this.isTicketsAvailable = false;
          console.error('Error creating reservation:', error);
        }
      );
    }
  }

  confirmPurchase(): void {
    this.bookingService.confirmReservation(Number(this.bookingId)).subscribe(
      (response) => {
        console.log('Tickets purchased:', response);
        this.closeModal.emit(); // Close the modal after purchase
      },
      (error) => {
        console.error('Error confirming purchase:', error);
      }
    );
  }

  cancelReservation(): void {
    this.close();
    this.bookingService.releaseReservation(Number(this.bookingId)).subscribe(
      (response) => {
        console.log('Reservation released:', response);
      },
      (error) => {
        console.error('Error releasing reservation:', error);
      }
    );
  }

  startTimer(): void {
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--; // Decrement the timer
      } else {
        clearInterval(this.interval); // Stop the timer when it reaches 0
        this.cancelReservation(); // Optional: release any reservation
        this.close(); // Close the modal
      }
    }, 1000);
  }

  close(): void {
    clearInterval(this.interval); // Clear the interval when closing the modal
    this.closeModal.emit(); // Emit the close event
  }

  getFormattedTime(): string {
    const minutes: number = Math.floor(this.timer / 60);
    const seconds: number = this.timer % 60;
    return `${minutes}:${this.padZero(seconds)}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString(); // Pad single-digit numbers with a leading zero
  }
}
