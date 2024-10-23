import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-booking-confirmation-modal',
  templateUrl: './booking-confirmation-modal.component.html',
  styleUrls: ['./booking-confirmation-modal.component.css']
})
export class BookingConfirmationModalComponent {
  @Input() bookingId!: number | undefined;
  @Input() tickets!: any[];
  @Input() totalAmount!: number;
  
  @Output() modalClosed = new EventEmitter<void>();

  closeModal() {
    this.modalClosed.emit();
  }
}