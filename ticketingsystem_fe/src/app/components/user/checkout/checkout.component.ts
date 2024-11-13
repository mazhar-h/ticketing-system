import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  @Input() tickets: any[] = [];
  @Input() total: number = 0;
  @Input() platformFee: number = 0;
  
  ngOnInit(): void {
  }
}