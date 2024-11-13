import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent implements OnInit, OnDestroy  {
  bookingId: number | null = null;
  tickets: any[] = [];
  platformFee: number | null = null;
  totalAmount: number | null = null;

  constructor(private router: Router){
    try {
      const data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
      this.bookingId = data.bookingId;
      this.tickets = data.tickets;
      this.platformFee = data.platformFee;
      this.totalAmount = data.totalAmount;
    } catch (error: any) {
      router.navigate(['/']);
    }

  }

  goHome() {
    this.router.navigate(['/']); // Navigate to the homepage
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }

}
