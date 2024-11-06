import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Stripe,
  StripeElements,
  StripePaymentElement,
} from '@stripe/stripe-js';
import { PaymentService } from 'src/app/services/payment.service';
import { AuthService } from 'src/app/services/auth.service';
import { lastValueFrom } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.css'],
})
export class ReserveComponent implements OnInit, OnDestroy {
  venueId: number | null = 2;
  venueName: string | null = 'Venue Name';
  eventName: string | null = 'Event Name';
  eventTime: string | null = 'Event Date & Time';
  performers: string[] | null = null;
  tickets: any | null = null;
  platformFee: number = 0;
  total: number = 0;

  minutes = 5;
  seconds = 0;
  timerActive = true;
  intervalId: any;

  paymentForm!: FormGroup;
  stripe!: Stripe;
  paymentElement!: StripePaymentElement;
  elements!: StripeElements;

  eventId: string | null = null;
  sourceId: string | null = null;
  isLoggedIn: boolean = false;
  sessionToken: string | null = null;
  paymentIntentId: string | null = null;
  clientSecret: string = '';
  guestEmail: string | null = null;
  isDirectAccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private authService: AuthService,
    private bookingService: BookingService
  ) {
    try {
      const data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
      this.tickets = data.tickets;
      this.venueId = data.event.venue.id;
      this.venueName = data.event.venue.name;
      this.eventName = data.event.name;
      this.eventTime = data.event.date;
      this.performers = data.event.performers.map((performer: any) => {
        return performer.name;
      });
      this.sourceId = 'o';
      this.eventId = data.event.id;
    } catch (error: any) {
      this.isDirectAccess = true;
      router.navigate(['/']);
    }
  }

  async ngOnInit() {
    this.checkLoginStatus();
    if (!this.isLoggedIn) {
      this.paymentForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        retypeEmail: ['', [Validators.required, Validators.email]],
      });
      try {
        await this.cancelGuestReservation();
        await this.startGuestSession();
        await this.setUpGuestCheckout();
        await this.setupStripe();
      } catch (error: any) {
        if (error.status === 401) this.startGuestSession();
        clearInterval(this.intervalId);
        sessionStorage.removeItem('bookingId');
        alert('An Error Occurred');
        this.router.navigate([`/event/${this.sourceId}/${this.eventId}`]);
      }
    } else {
      this.paymentForm = this.fb.group({});
      try {
        await this.cancelReservation();
        await this.setUpCheckout();
        await this.setupStripe();
      } catch (error: any) {
        clearInterval(this.intervalId);
        sessionStorage.removeItem('bookingId');
        alert('An Error Occurred');
        this.router.navigate([`/event/${this.sourceId}/${this.eventId}`]);
      }
    }
  }

  goToConfirmation(bookingId: number) {
    this.router.navigate(['/confirm'], {
      state: {
        data: {
          tickets: this.tickets,
          bookingId: bookingId,
          platformFee: this.platformFee,
          totalAmount: this.total,
        },
      },
    });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  async setupStripe() {
    const options = {
      clientSecret: this.clientSecret,
      appearance: {
        /*...*/
      },
    };
    await this.paymentService.initializeStripe();
    this.stripe = this.paymentService.getStripe()!;
    this.elements = this.stripe.elements(options);
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  async startGuestSession() {
    try {
      let token = localStorage.getItem('guestSessionToken');
      if (!token || this.authService.isTokenExpired(token)) {
        const response = await lastValueFrom(
          this.bookingService.startGuestCheckout()
        );
        this.sessionToken = response.guestCheckoutToken;
        if (this.sessionToken)
          localStorage.setItem('guestSessionToken', this.sessionToken);
      } else {
        this.sessionToken = token;
      }
    } catch (error) {
      console.log('there was an error starting your guest session');
    }
  }

  async setUpGuestCheckout() {
    let ticketIds: number[] = this.tickets.map((ticket: any) => ticket.id);
    this.paymentService;
    const { paymentIntentId, clientSecret } = await lastValueFrom(
      this.paymentService.createGuestPaymentIntent(
        ticketIds,
        this.venueId!,
        this.sessionToken!
      )
    );
    const { total, platformFee } = await lastValueFrom(
      this.paymentService.getStripeGuestTotalAndFee(
        ticketIds,
        this.sessionToken!
      )
    );
    const { id } = await lastValueFrom(
      this.bookingService.createGuestReservation(ticketIds, this.sessionToken!)
    );
    this.startTimer();
    sessionStorage.setItem('bookingId', String(id));
    this.total = total;
    this.platformFee = platformFee;
    this.paymentIntentId = paymentIntentId;
    this.clientSecret = clientSecret;
  }

  async cancelGuestReservation(): Promise<void> {
    const bookingId = sessionStorage.getItem('bookingId');
    const sessionToken = localStorage.getItem('guestSessionToken');
    if (bookingId && sessionToken) {
      try {
        await lastValueFrom(
          this.bookingService.releaseGuestReservation(
            Number(bookingId),
            sessionToken
          )
        );
      } catch (error: any) {
        if (error.status === 401) this.startGuestSession();
      }

      sessionStorage.removeItem('bookingId');
    }
  }

  async setUpCheckout() {
    let ticketIds: number[] = this.tickets.map((ticket: any) => ticket.id);
    this.paymentService;
    const { paymentIntentId, clientSecret } = await lastValueFrom(
      this.paymentService.createPaymentIntent(ticketIds, this.venueId!)
    );
    const { total, platformFee } = await lastValueFrom(
      this.paymentService.getStripeTotalAndFee(ticketIds)
    );
    const { id } = await lastValueFrom(
      this.bookingService.createReservation(ticketIds)
    );
    this.startTimer();
    sessionStorage.setItem('bookingId', String(id));
    this.total = total;
    this.platformFee = platformFee;
    this.paymentIntentId = paymentIntentId;
    this.clientSecret = clientSecret;
  }

  async cancelReservation(): Promise<void> {
    const bookingId = sessionStorage.getItem('bookingId');
    if (bookingId) {
      await lastValueFrom(
        this.bookingService.releaseReservation(Number(bookingId))
      );
      sessionStorage.removeItem('bookingId');
    }
  }

  startTimer() {
    this.intervalId = setInterval(async () => {
      if (this.seconds === 0) {
        if (this.minutes === 0) {
          this.timerActive = false;
          clearInterval(this.intervalId);
          if (!this.isLoggedIn) await this.cancelGuestReservation();
          else await this.cancelReservation();
        } else {
          this.minutes--;
          this.seconds = 59;
        }
      } else {
        this.seconds--;
      }
    }, 1000);
  }

  pay() {
    if (this.total === 0) {
      if (!this.isLoggedIn) this.confirmGuestPurchase(null);
      else this.confirmPurchase(null);
      return;
    }
    if (!this.isLoggedIn) {
      this.paymentService.confirmPayment(this.elements)?.then((result: any) => {
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
          this.confirmGuestPurchase(this.paymentIntentId);
          console.log('Payment successful! ', result);
        }
      });
    } else {
      this.paymentService.confirmPayment(this.elements)?.then((result: any) => {
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
          this.confirmPurchase(this.paymentIntentId);
          console.log('Payment successful! ', result);
        }
      });
    }
  }

  confirmPurchase(paymentIntentId: string | null): void {
    const bookingId = sessionStorage.getItem('bookingId');
    this.bookingService
      .confirmReservation(Number(bookingId), paymentIntentId)
      .subscribe({
        next: (response) => {
          sessionStorage.removeItem('bookingId');
          console.log('Tickets purchased:', response);
          this.goToConfirmation(Number(bookingId));
        },
        error: (error) => {
          console.error('Error confirming purchase:', error);
        },
      });
  }

  confirmGuestPurchase(paymentIntentId: string | null): void {
    const bookingId = sessionStorage.getItem('bookingId');
    this.bookingService
      .confirmGuestReservation(
        Number(bookingId),
        paymentIntentId,
        this.guestEmail!,
        this.sessionToken!
      )
      .subscribe({
        next: (response: any) => {
          sessionStorage.removeItem('bookingId');
          console.log('Tickets purchased:', response);
          this.goToConfirmation(Number(bookingId));
        },
        error: (error: any) => {
          console.error('Error confirming purchase:', error);
        },
      });
  }

  onSubmit() {
    if (this.paymentForm.valid && this.timerActive) {
      this.guestEmail = this.paymentForm.value.email;
      this.pay();
      console.log('Payment submitted');
    }
  }

  async ngOnDestroy() {
    if (this.isDirectAccess) return;
    clearInterval(this.intervalId);
    if (this.paymentElement) this.paymentElement.destroy();
    await this.cancelGuestReservation();
    await this.cancelReservation();
  }
}
