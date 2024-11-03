import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotUsernameComponent } from './components/forgot-username/forgot-username.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { CookiePolicyComponent } from './components/cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EmailConfirmationComponent } from './components/email-confirmation/email-confirmation.component';
import { DataDeletionPolicyComponent } from './components/data-deletion-policy/data-deletion-policy.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { VenueEventListComponent } from './components/venue-event-list/venue-event-list.component';
import { VenueEventEditComponent } from './components/venue-event-edit/venue-event-edit.component';
import { ScannerComponent } from './components/scanner/scanner.component';
import { AuthGuard } from './guards/auth.guard';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { VenueGuard } from './guards/venue.guard';
import { UserGuard } from './guards/user.guard';
import { PaymentsComponent } from './components/payments/payments.component';
import { PaymentSettingsComponent } from './components/payment-settings/payment-settings.component';

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
  { path: 'search-results', component: SearchResultsComponent },
  { path: 'event/:sourceId/:id', component: EventDetailsComponent },
  { path: 'bookings', component: BookingsComponent, canActivate: [UserGuard] },
  { path: 'venue/events/create', component: CreateEventComponent, canActivate: [VenueGuard] },
  { path: 'venue/events', component: VenueEventListComponent, canActivate: [VenueGuard] },
  { path: 'venue/events/:eventId/edit', component: VenueEventEditComponent, canActivate: [VenueGuard] },
  { path: 'scanner', component: ScannerComponent, canActivate: [VenueGuard] },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: 'payments', component: PaymentsComponent, canActivate: [VenueGuard] },
  { path: 'payment-settings', component: PaymentSettingsComponent, canActivate: [VenueGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
