import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
})
export class ScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  qrCodeScanner: Html5Qrcode | undefined;
  scannerId = 'reader';
  isScanning = false;
  isDetermined = false;
  isValid = false;
  invalidMessage = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.qrCodeScanner = new Html5Qrcode(this.scannerId);
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  toggleScanner() {
    if (this.isScanning) {
      this.stopScanner();
    } else {
      this.startScanner();
    }
  }

  startScanner() {
    this.isDetermined = false;

    if (!this.qrCodeScanner) return;
    
    const isMobile = window.innerWidth < 600;
    const qrBoxSize = isMobile ? 300 : 500;

    this.qrCodeScanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
        },
        (decodedText) => this.handleQrCodeSuccess(decodedText),
        (errorMessage) => console.log('QR Code scan error:', errorMessage)
      )
      .then(() => {
        this.isScanning = true;
        console.log('QR Code scanning started.');
      })
      .catch((err) => {
        console.log('QR Code start error:', err);
        this.isScanning = false;
      });
  }

  stopScanner() {
    if (!this.qrCodeScanner || !this.isScanning) return;

    this.qrCodeScanner
      .stop()
      .then(() => {
        this.isScanning = false;
        console.log('QR Code scanning stopped.');
      })
      .catch((err) => {
        console.log('Error stopping the scanner:', err);
        this.isScanning = false;
      });
  }

  handleQrCodeSuccess(decodedText: string) {
    console.log('QR code detected:', decodedText);
    this.validateTicket(decodedText);
    this.stopScanner();
  }

  validateTicket(qrCodeData: string) {
    this.ticketService.validateTicket(qrCodeData).subscribe({
      next: (response: any) => {
        this.isValid = true;
        this.isDetermined = true;
       },
      error: (error: any) => {
        console.log(error)
        this.isValid = false;
        this.isDetermined = true;
        if (error.status === 403) {
          this.invalidMessage = 'Unauthorized scanning';
          return;
        }
        this.invalidMessage = error.error;
      }
    })
  }
}
