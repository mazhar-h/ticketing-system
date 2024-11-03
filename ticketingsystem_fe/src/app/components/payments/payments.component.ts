import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent {
  balance: { available: number; pending: number } | null = null;
  payoutAmount: number | null = null;
  isManual: boolean = false;

  constructor(private router: Router, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.getBalance();
    this.paymentService.getPayoutSchedule().subscribe({
      next: (response: any) => {
        this.isManual = response.interval === 'manual' ? true : false;
      }
    });
  }

  async getBalance() {
    try {
      const response = await lastValueFrom(this.paymentService.getBalance());
      this.balance = {
        available: response!.available,
        pending: response!.pending,
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }

  async requestPayout() {
    if (
      this.payoutAmount &&
      this.balance &&
      this.payoutAmount <= this.balance.available
    ) {
      try {
        await lastValueFrom(
          this.paymentService.createPayout(this.payoutAmount)
        );
        alert('Payout request submitted successfully.');
        this.payoutAmount = null;
        this.getBalance();
      } catch (error) {
        console.error('Error requesting payout:', error);
        alert('Failed to request payout. Please try again.');
      }
    } else {
      alert('Invalid payout amount.');
    }
  }

  navigateToPaymentSettings() {
    this.router.navigate(['/payment-settings']);
  }
}
