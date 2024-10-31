import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
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
  guestForm!: FormGroup;
  bookingId!: number;
  isLoggedIn = false;
  isGuestCheckout: boolean = false;
  guestEmail = '';
  sessionToken!: string;
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
    private paymentService: PaymentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.guestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
    }, { validators: this.emailsMatchValidator });
  }

  async ngOnInit(): Promise<void> {
    this.checkLoginStatus();
    if (this.totalAmount !== 0) {
      await this.paymentService.initializeStripe();
      if (this.isLoggedIn && this.isTicketsAvailable) this.setupCardElements();
    }
    this.createReservation();
  }

  setupCardElements() {
    const elements = this.paymentService.getElements();

    this.cardNumberElement = elements?.create('cardNumber');
    this.cardNumberElement?.mount('#card-number-element');

    this.cardExpiryElement = elements?.create('cardExpiry');
    this.cardExpiryElement?.mount('#card-expiry-element');

    this.cardCvcElement = elements?.create('cardCvc');
    this.cardCvcElement?.mount('#card-cvc-element');
  }

  pay() {
    if (this.totalAmount === 0) {
      if (this.isGuestCheckout) this.confirmGuestPurchase(null);
      else this.confirmPurchase(null);
      return;
    }
    if (this.isGuestCheckout) {
      this.paymentService
        .createGuestPaymentIntent(this.ticketIds, this.sessionToken)
        .subscribe((response: any) => {
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
                this.confirmGuestPurchase(response.paymentIntentId);
                console.log('Payment successful! ', result);
              }
            });
        });
    } else {
      this.paymentService
        .createPaymentIntent(this.ticketIds)
        .subscribe((response: any) => {
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
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
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

  login() {
    this.router.navigate(['/login']);
  }

  private emailsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.get('email')?.value;
    const confirmEmail = control.get('confirmEmail')?.value;
    if (email && confirmEmail && email !== confirmEmail) {
      return { emailsMismatch: true };
    }
    return null;
  }

  get emailMismatch(): boolean | undefined {
    return this.guestForm.hasError('emailsMismatch') && this.guestForm.get('confirmEmail')?.touched;
  }

  async continueAsGuest() {
    this.isGuestCheckout = true;

    let token = localStorage.getItem('guestSessionToken');

    try {
      if (!token || this.authService.isTokenExpired(token)) {
        this.bookingService.startGuestCheckout().subscribe({
          next: (response: any) => {
            this.sessionToken = response.guestCheckoutToken;
            localStorage.setItem('guestSessionToken', this.sessionToken);
          },
          error: (error: any) => {
            this.isGuestCheckout = false;
            this.isTicketsAvailable = false;
            console.error('Error starting guest session:', error);
          },
        });
      } else {
        this.sessionToken = token;
      }
    } catch (error) {
      this.isGuestCheckout = false;
      this.isTicketsAvailable = false;
    }

    if (this.totalAmount !== 0) {
      await this.paymentService.initializeStripe();
      const elements = this.paymentService.getElements();
      await new Promise((r) => setTimeout(r, 100));

      try {
        this.setupCardElements();
      } catch (error) {
        this.isGuestCheckout = false;
        this.isTicketsAvailable = false;
      }
    }
    const numberArray = [];
    for (let i = 0; i < this.ticketIds.length; i++) {
      numberArray.push(Number(this.ticketIds[i]));
    }
    this.startTimer();
    this.bookingService
      .createGuestReservation(numberArray, this.sessionToken)
      .subscribe({
        next: (response: any) => {
          this.bookingId = response.id;
        },
        error: (error: any) => {
          if (error.status === 401)
            localStorage.removeItem('guestSessionToken');
          clearInterval(this.interval);
          this.isGuestCheckout = false;
          this.isTicketsAvailable = false;
        },
      });
  }

  onGuestCheckout() {
    if (this.guestForm.invalid) return;
    this.guestEmail = this.guestForm.value.email;
    this.pay();
  }

  cancelGuestReservation(): void {
    this.bookingService
      .releaseGuestReservation(this.bookingId, this.sessionToken)
      .subscribe({
        next: (response) => {
          console.log('Reservation released:', response);
        },
        error: (error) => {
          console.error('Error releasing reservation:', error);
        },
      });
  }

  confirmGuestPurchase(paymentIntentId: string | null): void {
    this.bookingService
      .confirmGuestReservation(
        this.bookingId,
        paymentIntentId,
        this.guestEmail,
        this.sessionToken
      )
      .subscribe({
        next: (response: any) => {
          console.log('Tickets purchased:', response);
          this.openBookingConfirmationModal();
        },
        error: (error: any) => {
          this.isTicketsAvailable = false;
          console.error('Error confirming purchase:', error);
        },
      });
  }

  startTimer(): void {
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.interval);
        if (this.isGuestCheckout) this.cancelGuestReservation();
        else this.cancelReservation();
      }
    }, 1000);
  }

  close(): void {
    if (this.isLoggedIn && !this.showConfirmation && this.isTicketsAvailable)
      this.cancelReservation();
    if (
      this.isGuestCheckout &&
      !this.showConfirmation &&
      this.isTicketsAvailable
    )
      this.cancelGuestReservation();
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
