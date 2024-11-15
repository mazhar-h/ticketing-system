import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PerformerService } from 'src/app/services/performer.service';
import { UserService } from 'src/app/services/user.service';
import { VenueService } from 'src/app/services/venue.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  registrationType = 'User';
  passwordMatchError = false;
  emailMatchError = false;
  isCompany: boolean = false;
  isIndividual: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private venueService: VenueService,
    private performerService: PerformerService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      registrationType: ['User', Validators.required],
      username: ['', Validators.required],
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      retypeEmail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      retypePassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.registerForm
      .get('registrationType')
      ?.valueChanges.subscribe((value) => {
        this.registrationType = value;
        this.checkRegistrationType();
      });

    this.registerForm.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
      this.checkEmailMatch();
    });
  }

  checkRegistrationType(): void {
    if (
      this.registrationType === 'Performer' ||
      this.registrationType === 'Venue'
    ) {
      this.registerForm.get('displayName')?.setValidators(Validators.required);
    } else {
      this.registerForm.get('displayName')?.clearValidators();
    }

    this.registerForm.get('displayName')?.updateValueAndValidity();
    this.registerForm.get('businessType')?.updateValueAndValidity();
  }

  checkPasswordMatch(): void {
    const password = this.registerForm.get('password')?.value;
    const retypePassword = this.registerForm.get('retypePassword')?.value;
    this.passwordMatchError =
      password && retypePassword && password !== retypePassword;
  }

  checkEmailMatch(): void {
    const email = this.registerForm.get('email')?.value;
    const retypeEmail = this.registerForm.get('retypeEmail')?.value;
    this.emailMatchError = email && retypeEmail && email !== retypeEmail;
  }

  onRegistrationTypeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const type = selectElement.value;
    this.registrationType = type;

    // Clear values for fields not relevant to the selected type
    this.registerForm.patchValue({
      displayName: '',
      address: '',
      state: '',
      zipCode: '',
    });

    // Reset validators based on the selected registration type
    this.registerForm.get('displayName')?.clearValidators();
    this.registerForm.get('address')?.clearValidators();
    this.registerForm.get('state')?.clearValidators();
    this.registerForm.get('zipCode')?.clearValidators();

    if (type === 'Performer' || type === 'Venue') {
      this.registerForm
        .get('displayName')
        ?.setValidators([Validators.required]);
    }
    if (type === 'Venue') {
      this.registerForm.get('address')?.setValidators([]);
      this.registerForm.get('state')?.setValidators([]);
      this.registerForm.get('zipCode')?.setValidators([]);
    }

    // Update validity after modifying validators
    this.registerForm.get('displayName')?.updateValueAndValidity();
    this.registerForm.get('address')?.updateValueAndValidity();
    this.registerForm.get('state')?.updateValueAndValidity();
    this.registerForm.get('zipCode')?.updateValueAndValidity();
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (
      this.registerForm.value.password !==
      this.registerForm.value.retypePassword
    ) {
      this.passwordMatchError = true;
      return;
    } else {
      this.passwordMatchError = false;
    }

    console.log('Registration form submitted:', this.registerForm.value);
    let username = this.registerForm.value.username;
    let name = this.registerForm.value.displayName;
    let email = this.registerForm.value.email;
    let password = this.registerForm.value.password;
    switch (this.registrationType) {
      case 'User':
        this.userService.register({ username, email, password }).subscribe({
          next: (response: any) => {
            this.router.navigate(['/']);
          },
          error: (error: any) => {
            console.error('Registration failed:', error);
          },
        });
        break;
      case 'Performer':
        this.performerService
          .register({ name, username, email, password })
          .subscribe({
            next: (response: any) => {
              this.router.navigate(['/']);
            },
            error: (error: any) => {
              console.error('Registration failed:', error);
            },
          });
        break;
      case 'Venue':
        this.venueService
          .register({
            name,
            username,
            email,
            password,
          })
          .subscribe({
            next: (response: any) => {
              this.router.navigate(['/']);
            },
            error: (error: any) => {
              console.error('Registration failed:', error);
            },
          });
        break;
    }
  }
}
