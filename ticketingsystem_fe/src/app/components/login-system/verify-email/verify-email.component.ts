import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  verificationStatus: string = '';
  errorMessage: string = '';
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    this.verifyEmail();
  }

  verifyEmail() {
    this.userService.verifyEmail(this.token).subscribe({
      next: () => {
        this.verificationStatus = 'Your email has been successfully verified!';
      },
      error: (error: any) => {
        this.verificationStatus = 'Verification failed. Your email could not be verified.';
        this.errorMessage = error.error?.message || 'An error occurred during verification.';
      }
    });
  }
}
