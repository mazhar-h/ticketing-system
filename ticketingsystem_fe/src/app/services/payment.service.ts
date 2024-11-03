import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';
import { AuthService } from './auth.service';
import { loadStripe, PaymentIntentResult, Stripe, StripeElements } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private paymentUrl = environment.apiUrl + '/payments';
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async initializeStripe() {
    this.stripe = await loadStripe(environment.stripePublishableKey);
    this.elements = this.stripe?.elements() ?? null;
  }

  getElements() {
    return this.elements;
  }

  getStripe() {
    return this.stripe;
  }

  getBalance() {
    return this.http.get<{ available: number; pending: number }>(`${this.paymentUrl}/balance`);
  }
  
  getPayoutSchedule() {
    return this.http.get(`${this.paymentUrl}/payout-schedule`);
  }

  setPayoutSchedule(interval: string, weeklyAnchor?: string | null, monthlyAnchor?: number | null) {
    return this.http.post(`${this.paymentUrl}/payout-schedule`, {
      interval,
      weeklyAnchor,
      monthlyAnchor
    }, {responseType: 'text'});
  }

  createPayout(amount: number) {
    return this.http.post(`${this.paymentUrl}/payout`, { amount });
  }

  getExternalAccounts() {
    return this.http.get<any[]>(`${this.paymentUrl}/external-account/all`);
  }

  addOrUpdateExternalAccount(accountId: string, token: string, type: 'bank' | 'card') {
    if (accountId)
      return this.http.put(`${this.paymentUrl}/external-account/${accountId}`, { token, type });
    else
      return this.http.post(`${this.paymentUrl}/external-account`, {token, type});
  }

  removeExternalAccount(accountId: string) {
    return this.http.delete(`${this.paymentUrl}/external-account/${accountId}`);
  }

  createPaymentIntent(ticketIds: string[], venueId: number): Observable<any> {
    return this.http.post(`${this.paymentUrl}/create-payment-intent`, { ticketIds: ticketIds, venueId: venueId }, { headers: { Authorization: 'Bearer ' + this.authService.getToken() } });
  }

  createGuestPaymentIntent(ticketIds: string[], venueId: number, sessionToken: string): Observable<any> {
    return this.http.post(`${this.paymentUrl}/guest/create-payment-intent`, { ticketIds: ticketIds, venueId: venueId }, { headers: { Authorization: 'Bearer ' + sessionToken } });
  }

  confirmPayment(clientSecret: string, cardElement: any): Promise<PaymentIntentResult> | undefined {
    return this.stripe?.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    });
  }
}
