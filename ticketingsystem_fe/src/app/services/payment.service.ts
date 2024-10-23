import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';
import { loadStripe, Stripe, StripeCardElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private paymentUrl = environment.apiUrl + '/payments';
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async initializeStripe() {
    this.stripe = await loadStripe('pk_test_51QCCOIKH1UdL2G8klFomufbtt6Bb2wTBji1M7qML3lJ1afTtKYHDNXOxpHmeRm0CtNcnKuIOEtmSgJpob4T9FKXd00zL0H71ce');
    this.elements = this.stripe?.elements() ?? null;
  }

  getElements() {
    return this.elements;
  }

  createPaymentIntent(ticketIds: string[]) {
    return this.http.post(`${this.paymentUrl}/create-payment-intent`, { ticketIds: ticketIds }, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  confirmPayment(clientSecret: string, cardElement: any) {
    return this.stripe?.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    });
  }
}
