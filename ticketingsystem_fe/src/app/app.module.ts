import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login-system/login/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { RegisterComponent } from './components/login-system/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TokenInterceptor } from './interceptor/auth.interceptor';
import { ForgotPasswordComponent } from './components/login-system/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/login-system/reset-password/reset-password.component';
import { ForgotUsernameComponent } from './components/login-system/forgot-username/forgot-username.component';
import { VerifyEmailComponent } from './components/login-system/verify-email/verify-email.component';
import { WeatherService } from './services/weather.service';
import { UsernameModalComponent } from './components/login-system/login/username-modal/username-modal.component';
import { UserLinkModalComponent } from './components/login-system/login/user-link-modal/user-link-modal.component';
import { CookiePolicyComponent } from './components/policy/cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './components/policy/privacy-policy/privacy-policy.component';
import { FooterComponent } from './components/footer/footer.component';
import { SettingsComponent } from './components/settings-page/settings/settings.component';
import { EmailConfirmationComponent } from './components/login-system/email-confirmation/email-confirmation.component';
import { DeleteAccountModalComponent } from './components/settings-page/delete-account-modal/delete-account-modal.component';
import { DataDeletionPolicyComponent } from './components/policy/data-deletion-policy/data-deletion-policy.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { EventDetailsComponent } from './components/event/event-details/event-details.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TicketSelectionModalComponent } from './components/event/ticket-selection-modal/ticket-selection-modal.component';
import { BookingsComponent } from './components/user/bookings/bookings.component';
import { BookingDetailsModalComponent } from './components/user/booking-details-modal/booking-details-modal.component';
import { CreateEventComponent } from './components/venue/create-event/create-event.component';
import { VenueEventListComponent } from './components/venue/venue-event-list/venue-event-list.component';
import { VenueEventEditComponent } from './components/venue/venue-event-edit/venue-event-edit.component';
import { ScannerComponent } from './components/venue/scanner/scanner.component';
import { PaymentsComponent } from './components/venue/payments/payments.component';
import { StripeReauthComponent } from './components/venue/stripe-reauth/stripe-reauth.component';
import { ReserveComponent } from './components/user/reserve/reserve.component';
import { ConfirmComponent } from './components/user/confirm/confirm.component';
import { CuratedEventsComponent } from './components/curated-events/curated-events.component';
import { SearchResult2Component } from './components/search-result2/search-result2.component';
import { TopBarComponent } from './components/top-bar/top-bar/top-bar.component';
import { SearchBarComponent } from './components/top-bar/search-bar/search-bar.component';
import { AuthButtonComponent } from './components/top-bar/auth-button/auth-button.component';
import { CheckoutComponent } from './components/user/checkout/checkout.component';

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
        SearchResult2Component,
        TopBarComponent,
        SearchBarComponent,
        AuthButtonComponent,
        CheckoutComponent
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
