import { Component, OnInit } from '@angular/core';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-stripe-reauth',
  templateUrl: './stripe-reauth.component.html',
  styleUrl: './stripe-reauth.component.css'
})
export class StripeReauthComponent implements OnInit {

  constructor(private paymentService: PaymentService){}

  ngOnInit(): void {
    this.paymentService.getStripeOnboardingLink().subscribe({
      next: (response: any) => {
        let onboardingUrl = response.url;
        window.location.replace(onboardingUrl);
      }
    })
  }

}
