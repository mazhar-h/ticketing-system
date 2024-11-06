import { Component } from '@angular/core';
import { StripeConnectInstance } from '@stripe/connect-js';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent {
  stripeExpressDashboardLink: string | null = null;
  stripeConnectInstance: StripeConnectInstance | null = null;
  showPayouts: boolean = false;
  showPayments: boolean = true;
  showAccountManagement: boolean = false;
  selectedTab: string = 'payments';
  isStripeOnboarded: boolean = false;

  constructor(private paymentService: PaymentService) {}

  async ngOnInit(): Promise<void> {
    this.stripeConnectInstance = this.paymentService.getStripeConnectInstance();
    this.buildPayoutComponent();
    this.buildPaymentsComponent();
    this.buildAccountManagement();
    this.getStripeExpressDashboard();
    this.checkStripeOnboarding();
  }

  selectTab(tab: string) {
    switch (tab) {
      case 'payments':
        this.showPayments = true;
        break;
      case 'payout':
        this.showPayouts = true;
        break;
      case 'settings':
        this.showAccountManagement = true;
        break;
    }
    this.selectedTab = tab;
  }

  enableStripe() {
    this.paymentService.getStripeOnboardingLink().subscribe({
      next: (response: any) => {
        let onboardingUrl = response.url;
        window.location.replace(onboardingUrl);
      },
    });
  }

  checkStripeOnboarding() {
    this.paymentService.getStripeOnboardingStatus().subscribe({
      next: (response: any) => {
        this.isStripeOnboarded = response.onboarded;
        if (!response.onboarded)
          this.selectTab('settings');
      },
      error: () => {
        this.isStripeOnboarded = false;
        this.selectTab('settings');
      },
    });
  }

  getStripeExpressDashboard() {
    this.paymentService.getStripeExpressDashboardLink().subscribe({
      next: (response: any) => {
        this.stripeExpressDashboardLink = response.url;
      },
    });
  }

  buildPayoutComponent() {
    const payoutComponent = this.stripeConnectInstance?.create('payouts');
    const container = document.getElementById('payout-container');
    container?.appendChild(payoutComponent as Node);
  }

  buildPaymentsComponent() {
    const paymentComponent = this.stripeConnectInstance?.create('payments');
    const container = document.getElementById('payments-container');
    container?.appendChild(paymentComponent as Node);
  }

  buildAccountManagement() {
    const accountManagement =
      this.stripeConnectInstance?.create('account-management');
    accountManagement?.setCollectionOptions({
      fields: 'eventually_due',
      futureRequirements: 'include',
    });
    const container = document.getElementById('accManagement-container');
    container?.appendChild(accountManagement as Node);
  }
}
