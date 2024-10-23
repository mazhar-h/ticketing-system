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
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReserveTicketModalComponent } from './components/reserve-ticket-modal/reserve-ticket-modal.component';
import { TicketSelectionModalComponent } from './components/ticket-selection-modal/ticket-selection-modal.component';
import { BookingConfirmationModalComponent } from './components/booking-confirmation-modal/booking-confirmation-modal.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { BookingDetailsModalComponent } from './components/booking-details-modal/booking-details-modal.component';
import { CreateEventComponent } from './components/create-event/create-event.component';

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
        SearchResultsComponent,
        EventDetailsComponent,
        ReserveTicketModalComponent,
        TicketSelectionModalComponent,
        BookingConfirmationModalComponent,
        BookingsComponent,
        BookingDetailsModalComponent,
        CreateEventComponent
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule], providers: [
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
