import { Component, OnInit } from '@angular/core';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { lastValueFrom } from 'rxjs';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payment-settings',
  templateUrl: './payment-settings.component.html',
  styleUrls: ['./payment-settings.component.css'],
})
export class PaymentSettingsComponent implements OnInit {
  stripe!: Stripe | null;
  cardElement!: StripeCardElement | null;
  selectedPayoutMethod: 'bank' | 'card' | null = null;
  stripeLoaded = false;

  routingNumber: string = '';
  accountNumber: string = '';
  accountHolderName: string = '';
  isBusinessAccount: boolean = false;

  bankAccount: any = null;
  card: any = null;
  editingBank = false;
  editingCard = false;
  addingCard = false;
  addingBank = false;

  payoutInterval: string = 'MANUAL';
  weeklyAnchor: string | null = null;
  monthlyAnchor: number | null = null;

  constructor(private paymentService: PaymentService) {}

  async ngOnInit() {
    await this.paymentService.initializeStripe();
    this.stripe = this.paymentService.getStripe();
    this.stripeLoaded = true;
    this.loadExternalAccounts();
    this.loadPayoutSchedule();
  }

  ngOnDestroy() {
    this.unmountElements();
  }

  async setupCardElement(id: string) {
    if (this.stripe && !this.cardElement) {
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card');
      this.cardElement.mount(`#${id}`);
    }
  }

  unmountElements() {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement = null;
    }
  }

  openBankForm(editMode: boolean) {
    this.unmountElements();
    this.editingBank = editMode;
    this.addingBank = !editMode;
  }

  openCardForm(editMode: boolean) {
    this.unmountElements();
    this.editingCard = editMode;
    this.addingCard = !editMode;
    this.setupCardElement(editMode ? 'card-element-edit' : 'card-element-add');
  }

  cancelEditAdd(type: 'bank' | 'card') {
    if (type === 'bank') {
      this.editingBank = false;
      this.addingBank = false;
    } else if (type === 'card') {
      this.editingCard = false;
      this.addingCard = false;
    }
    this.unmountElements();
  }

  async loadPayoutSchedule() {
    this.paymentService.getPayoutSchedule().subscribe({
      next: (response: any) => {
        this.payoutInterval = response.interval.toUpperCase();
        this.weeklyAnchor = response.weeklyAnchor !== null ? response.weeklyAnchor.toUpperCase() : null;
        this.monthlyAnchor = response.monthlyAnchor;
      },
      error: (error: any) => {
        console.error('Error retrieving payout schedule:', error);
      },
    });
  }

  async updatePayoutSchedule() {
    try {
      await lastValueFrom(this.paymentService.setPayoutSchedule(
        this.payoutInterval,
        this.weeklyAnchor,
        this.monthlyAnchor
      ));

      alert('Payout schedule updated successfully.');
    } catch (error) {
      console.error('Failed to update payout schedule:', error);
      alert('Failed to update payout schedule. Please try again.');
    }
  }

  async loadExternalAccounts() {
    try {
      const externalAccounts = await lastValueFrom(this.paymentService.getExternalAccounts());
      this.bankAccount = externalAccounts?.find(
        (acc: any) => acc.object === 'bank_account'
      );
      this.card = externalAccounts?.find((acc: any) => acc.object === 'card');
    } catch (error) {
      console.error('Error loading external accounts:', error);
    }
  }

  async removeExternalAccount(accountId: string) {
    try {
      await lastValueFrom(this.paymentService.removeExternalAccount(accountId));
      this.loadExternalAccounts();
    } catch (error) {
      console.error('Error removing external account:', error);
      alert('Unable to remove account');
    }
  }

  async submitBankAccountForm() {
    const { token, error } = await this.paymentService
      .getStripe()!
      .createToken('bank_account', {
        country: 'US',
        currency: 'usd',
        routing_number: this.routingNumber,
        account_number: this.accountNumber,
        account_holder_name: this.accountHolderName,
        account_holder_type: this.isBusinessAccount ? 'company' : 'individual',
      });

    if (error) {
      console.error('Bank Account Error:', error.message);
    } else {
      await lastValueFrom(this.paymentService.addOrUpdateExternalAccount(
        this.bankAccount?.id,
        token?.id,
        'bank'
      ));
      this.loadExternalAccounts();
      this.cancelEditAdd('bank');
    }
  }

  async submitCardForm() {
    const { token, error } = await this.paymentService
      .getStripe()!
      .createToken(this.cardElement!, {
        currency: 'usd',
      });

    if (error) {
      console.error('Card Error:', error.message);
    } else {
      await lastValueFrom(this.paymentService.addOrUpdateExternalAccount(
        this.card?.id,
        token?.id,
        'card'
      ));
      this.loadExternalAccounts();
      this.cancelEditAdd('card');
    }
  }
}
