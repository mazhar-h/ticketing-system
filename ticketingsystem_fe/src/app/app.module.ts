import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TokenInterceptor } from './interceptor/auth.interceptor';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotUsernameComponent } from './components/forgot-username/forgot-username.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { WeatherService } from './services/weather.service';
import { UsernameModalComponent } from './components/username-modal/username-modal.component';
import { UserLinkModalComponent } from './components/user-link-modal/user-link-modal.component';
import { CookiePolicyComponent } from './components/cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { FooterComponent } from './components/footer/footer.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EmailConfirmationComponent } from './components/email-confirmation/email-confirmation.component';
import { DeleteAccountModalComponent } from './components/delete-account-modal/delete-account-modal.component';
import { DataDeletionPolicyComponent } from './components/data-deletion-policy/data-deletion-policy.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TicketSelectionModalComponent } from './components/ticket-selection-modal/ticket-selection-modal.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { BookingDetailsModalComponent } from './components/booking-details-modal/booking-details-modal.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { VenueEventListComponent } from './components/venue-event-list/venue-event-list.component';
import { VenueEventEditComponent } from './components/venue-event-edit/venue-event-edit.component';
import { ScannerComponent } from './components/scanner/scanner.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { StripeReauthComponent } from './components/stripe-reauth/stripe-reauth.component';
import { ReserveComponent } from './components/reserve/reserve.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { CuratedEventsComponent } from './components/curated-events/curated-events.component';
import { SearchResult2Component } from './components/search-result2/search-result2.component';

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        DashboardComponent,
        ForgotPasswordComponent,
        ForgotUsernameComponent,
        ResetPasswordComponent,
        VerifyEmailComponent,
        UsernameModalComponent,
        UserLinkModalComponent,
        CookiePolicyComponent,
        PrivacyPolicyComponent,
        FooterComponent,
        SettingsComponent,
        EmailConfirmationComponent,
        DeleteAccountModalComponent,
        DataDeletionPolicyComponent,
        HomepageComponent,
        EventDetailsComponent,
        TicketSelectionModalComponent,
        BookingsComponent,
        BookingDetailsModalComponent,
        CreateEventComponent,
        VenueEventListComponent,
        VenueEventEditComponent,
        ScannerComponent,
        PaymentsComponent,
        StripeReauthComponent,
        ReserveComponent,
        ConfirmComponent,
        CuratedEventsComponent,
        SearchResult2Component
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [
        AuthService,
        WeatherService,
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        JwtHelperService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor, 
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync()
    ]})
export class AppModule { }
