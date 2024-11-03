import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessType } from 'src/app/enums/business-type.enum';
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
      businessType: [''],
      businessName: [''],
      ein: [''],
      website: [''],
      firstName: [''],
      lastName: [''],
      phone: [''],
      dob: [''],
      address: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      ssnLast4: [''],
      acceptTerms: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.registerForm
      .get('registrationType')
      ?.valueChanges.subscribe((value) => {
        this.registrationType = value;
        this.checkRegistrationType();
      });

    this.registerForm.get('businessType')?.valueChanges.subscribe((value) => {
      this.isCompany = value === 'company';
      this.isIndividual = value === 'individual';
      this.toggleRepresentativeFields();
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

    if (this.registrationType === 'Venue') {
      this.registerForm.get('businessType')?.setValidators(Validators.required);
    } else {
      this.clearVenueFields();
    }

    this.registerForm.get('displayName')?.updateValueAndValidity();
    this.registerForm.get('businessType')?.updateValueAndValidity();
  }

  toggleCompanyFields(isCompany: boolean): void {
    const fields = ['businessName', 'ein', 'website'];
    fields.forEach((field) => {
      if (isCompany) {
        this.registerForm.get(field)?.setValidators(Validators.required);
      } else {
        this.registerForm.get(field)?.clearValidators();
      }
      this.registerForm.get(field)?.updateValueAndValidity();
    });
  }

  toggleRepresentativeFields(): void {
    const companyFields = ['businessName', 'ein', 'website'];
    const individualFields = [
      'firstName',
      'lastName',
      'phone',
      'dob',
      'address',
      'city',
      'state',
      'postalCode',
      'website',
      'ssnLast4',
    ];
    companyFields.forEach((field) => {
      this.registerForm
        .get(field)
        ?.setValidators(this.isCompany ? Validators.required : null);
      this.registerForm.get(field)?.updateValueAndValidity();
    });
    individualFields.forEach((field) => {
      this.registerForm
        .get(field)
        ?.setValidators(this.isIndividual ? Validators.required : null);
      this.registerForm.get(field)?.updateValueAndValidity();
    });
  }

  clearVenueFields(): void {
    const venueFields = [
      'businessType',
      'businessName',
      'ein',
      'website',
      'firstName',
      'lastName',
      'phone',
      'dob',
      'address',
      'city',
      'state',
      'postalCode',
      'ssnLast4',
    ];
    venueFields.forEach((field) => {
      this.registerForm.get(field)?.clearValidators();
      this.registerForm.get(field)?.setValue('');
      this.registerForm.get(field)?.updateValueAndValidity();
    });
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
    let businessType =
      this.registerForm.value.businessType === 'individual'
        ? BusinessType.INDIVIDUAL
        : BusinessType.COMPANY;
    let legalBusinessName = this.registerForm.value.businessName;
    let ein = this.registerForm.value.ein;
    let businessWebsite = this.registerForm.value.website;
    let representative = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      phone: this.registerForm.value.phone,
      dob: this.registerForm.value.dob,
      ssnLast4: this.registerForm.value.ssnLast4,
      address: this.registerForm.value.address,
      city: this.registerForm.value.city,
      state: this.registerForm.value.state,
      postalCode: this.registerForm.value.postalCode,
    };
    let acceptTerms = this.registerForm.value.acceptTerms;
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
            businessType,
            legalBusinessName,
            ein,
            businessWebsite,
            representative,
            acceptTerms,
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
