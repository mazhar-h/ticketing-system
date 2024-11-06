import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';
import { loadStripe, PaymentIntentResult, Stripe } from '@stripe/stripe-js';
import {
  loadConnectAndInitialize,
  StripeConnectInstance,
} from '@stripe/connect-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private paymentUrl = environment.apiUrl + '/payments';
  private stripe: Stripe | null = null;
  private stripeConnectInstance: StripeConnectInstance | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async initializeStripe() {
    this.stripe = await loadStripe(environment.stripePublishableKey);
  }

  async initializeStripeConnect() {
    this.stripeConnectInstance = loadConnectAndInitialize({
      publishableKey: environment.stripePublishableKey,
      fetchClientSecret: this.fetchClientSecret.bind(this),
    });
  }

  getStripe() {
    return this.stripe;
  }

  getStripeConnectInstance() {
    return this.stripeConnectInstance;
  }

  async fetchClientSecret() {
    try {
      const response = await lastValueFrom(this.getStripeConnectSession());
      return response.clientSecret;
    } catch (error) {
      return '';
    }
  }

  getStripeConnectSession() {
    return this.http.get<{ clientSecret: string }>(
      `${this.paymentUrl}/stripe/session`
    );
  }

  getStripeExpressDashboardLink() {
    return this.http.get(`${this.paymentUrl}/stripe/express-dashboard`);
  }

  getStripeOnboardingLink() {
    return this.http.get(`${this.paymentUrl}/stripe/onboarding`);
  }

  getStripeOnboardingStatus() {
    return this.http.get(`${this.paymentUrl}/stripe/onboarding/status`);
  }

  getStripeTotalAndFee(ticketIds: number[]): Observable<any> {
    return this.http.post(`${this.paymentUrl}/stripe/total-and-fee`, {
      ticketIds: ticketIds,
    });
  }

  getStripeGuestTotalAndFee(
    ticketIds: number[],
    sessionToken: string
  ): Observable<any> {
    return this.http.post(
      `${this.paymentUrl}/stripe/guest/total-and-fee`,
      { ticketIds },
      { headers: { Authorization: 'Bearer ' + sessionToken } }
    );
  }
  createPaymentIntent(ticketIds: number[], venueId: number): Observable<any> {
    return this.http.post(
      `${this.paymentUrl}/stripe/create-payment-intent`,
      { ticketIds: ticketIds, venueId: venueId },
      { headers: { Authorization: 'Bearer ' + this.authService.getToken() } }
    );
  }

  createGuestPaymentIntent(
    ticketIds: number[],
    venueId: number,
    sessionToken: string
  ): Observable<any> {
    return this.http.post(
      `${this.paymentUrl}/stripe/guest/create-payment-intent`,
      { ticketIds: ticketIds, venueId: venueId },
      { headers: { Authorization: 'Bearer ' + sessionToken } }
    );
  }

  confirmPayment(elements: any): Promise<PaymentIntentResult> | undefined {
    return this.stripe?.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });
  }
}
