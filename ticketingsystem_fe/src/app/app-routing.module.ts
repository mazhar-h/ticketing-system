import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login-system/login/login/login.component';
import { RegisterComponent } from './components/login-system/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './components/login-system/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/login-system/reset-password/reset-password.component';
import { ForgotUsernameComponent } from './components/login-system/forgot-username/forgot-username.component';
import { VerifyEmailComponent } from './components/login-system/verify-email/verify-email.component';
import { CookiePolicyComponent } from './components/policy/cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './components/policy/privacy-policy/privacy-policy.component';
import { SettingsComponent } from './components/settings-page/settings/settings.component';
import { EmailConfirmationComponent } from './components/login-system/email-confirmation/email-confirmation.component';
import { DataDeletionPolicyComponent } from './components/policy/data-deletion-policy/data-deletion-policy.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { EventDetailsComponent } from './components/event/event-details/event-details.component';
import { BookingsComponent } from './components/user/bookings/bookings.component';
import { CreateEventComponent } from './components/venue/create-event/create-event.component';
import { VenueEventListComponent } from './components/venue/venue-event-list/venue-event-list.component';
import { VenueEventEditComponent } from './components/venue/venue-event-edit/venue-event-edit.component';
import { ScannerComponent } from './components/venue/scanner/scanner.component';
import { AuthGuard } from './guards/auth.guard';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { VenueGuard } from './guards/venue.guard';
import { UserGuard } from './guards/user.guard';
import { PaymentsComponent } from './components/venue/payments/payments.component';
import { StripeReauthComponent } from './components/venue/stripe-reauth/stripe-reauth.component';
import { ReserveComponent } from './components/user/reserve/reserve.component';
import { ConfirmComponent } from './components/user/confirm/confirm.component';
import { SearchResult2Component } from './components/search-result2/search-result2.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomepageComponent },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-username', component: ForgotUsernameComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'verify-email/:token', component: VerifyEmailComponent },
  { path: 'cookie-policy', component: CookiePolicyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'data-deletion-policy', component: DataDeletionPolicyComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'confirm-email/:token', component: EmailConfirmationComponent },
  { path: 'search', component: SearchResult2Component },
  { path: 'event/:sourceId/:id', component: EventDetailsComponent },
  { path: 'bookings', component: BookingsComponent, canActivate: [UserGuard] },
  { path: 'venue/events/create', component: CreateEventComponent, canActivate: [VenueGuard] },
  { path: 'venue/events', component: VenueEventListComponent, canActivate: [VenueGuard] },
  { path: 'venue/events/:eventId/edit', component: VenueEventEditComponent, canActivate: [VenueGuard] },
  { path: 'scanner', component: ScannerComponent, canActivate: [VenueGuard] },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: 'payments', component: PaymentsComponent, canActivate: [VenueGuard] },
  { path: 'stripe-reauth', component: StripeReauthComponent, canActivate: [VenueGuard] },
  { path: 'reserve', component: ReserveComponent },
  { path: 'confirm', component: ConfirmComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
