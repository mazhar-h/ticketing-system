import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-reserve-ticket-modal',
  templateUrl: './reserve-ticket-modal.component.html',
  styleUrls: ['./reserve-ticket-modal.component.css'],
})
export class ReserveTicketModalComponent implements OnInit {
  @Input() ticketIds: string[] = [];
  @Input() tickets: any[] = [];
  @Input() totalAmount: number = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() closeModalAfterBooking = new EventEmitter<void>();
  bookingId!: number;
  isLoggedIn = false;
  timer: number = 300;
  interval: any;
  isTicketsAvailable = true;
  cardNumberElement: any;
  cardExpiryElement: any;
  cardCvcElement: any;
  clientSecret!: string;
  showConfirmation = false;
  showReserveModal = true;

  constructor(
    private bookingService: BookingService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkLoginStatus();
    if (this.totalAmount !== 0) {
      await this.paymentService.initializeStripe();
      this.setupCardElements();
    }
    this.createReservation();
  }

  setupCardElements() {
    if (this.isLoggedIn && this.isTicketsAvailable) {
      const elements = this.paymentService.getElements();

      this.cardNumberElement = elements?.create('cardNumber');
      this.cardNumberElement?.mount('#card-number-element');

      this.cardExpiryElement = elements?.create('cardExpiry');
      this.cardExpiryElement?.mount('#card-expiry-element');

      this.cardCvcElement = elements?.create('cardCvc');
      this.cardCvcElement?.mount('#card-cvc-element');
    }
  }

  pay() {
    if (this.totalAmount === 0) {
      this.confirmPurchase(null);
      return;
    }
    this.paymentService
      .createPaymentIntent(this.ticketIds)
      .subscribe((response: any) => {
        console.log(response);
        this.clientSecret = response.clientSecret;

        this.paymentService
          .confirmPayment(this.clientSecret, this.cardNumberElement)
          ?.then((result: any) => {
            if (result.error) {
              switch (result.error.code) {
                case 'expired_card':
                  console.log('your card is expired');
                  break;
                case 'incorrect_cvc':
                  console.log('incorrect cvc');
                  break;
                case 'processing_error':
                  console.log('there was an error processing your card');
                  break;
                case 'incorrect_number':
                  console.log('your card number is incorrect');
                  break;
                default:
                  console.log('your card was declined');
                  break;
              }
            } else {
              this.confirmPurchase(response.paymentIntentId);
              console.log('Payment successful! ', result);
            }
          });
      });
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
      this.bookingService.createReservation(numberArray).subscribe({
        next: (response) => {
          this.bookingId = response.id;
          console.log('Reservation created:', response);
        },
        error: (error) => {
          this.isTicketsAvailable = false;
          console.error('Error creating reservation:', error);
        },
      });
    }
  }

  confirmPurchase(paymentIntentId: string | null): void {
    this.bookingService
      .confirmReservation(this.bookingId, paymentIntentId)
      .subscribe({
        next: (response) => {
          console.log('Tickets purchased:', response);
          this.openBookingConfirmationModal();
        },
        error: (error) => {
          this.isTicketsAvailable = false;
          console.error('Error confirming purchase:', error);
        },
      });
  }

  cancelReservation(): void {
    this.bookingService.releaseReservation(this.bookingId).subscribe({
      next: (response) => {
        console.log('Reservation released:', response);
      },
      error: (error) => {
        console.error('Error releasing reservation:', error);
      },
    });
  }

  getSelectedTickets(): any[] {
    const selectedTikets = this.tickets.filter((x) =>
      this.ticketIds.includes(x.id)
    );
    return selectedTikets;
  }

  startTimer(): void {
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.interval);
        this.cancelReservation();
      }
    }, 1000);
  }

  close(): void {
    if (this.isLoggedIn && !this.showConfirmation && this.isTicketsAvailable)
      this.cancelReservation();
    clearInterval(this.interval);
    this.closeModal.emit();
  }

  closeReserveModalAfterBooking() {
    clearInterval(this.interval);
    this.closeModalAfterBooking.emit();
  }

  openBookingConfirmationModal() {
    clearInterval(this.interval);
    this.tickets = this.getSelectedTickets();
    this.showReserveModal = false;
    this.showConfirmation = true;
  }

  getFormattedTime(): string {
    const minutes: number = Math.floor(this.timer / 60);
    const seconds: number = this.timer % 60;
    return `${minutes}:${this.padZero(seconds)}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
