package com.pjt.ticketingsystem.core.service;

import com.pjt.ticketingsystem.core.dto.*;
import com.pjt.ticketingsystem.core.enums.RefundStatus;
import com.pjt.ticketingsystem.core.exception.BookingNotFoundException;
import com.pjt.ticketingsystem.core.exception.ResourceNotFoundException;
import com.pjt.ticketingsystem.core.model.Booking;
import com.pjt.ticketingsystem.core.model.Ticket;
import com.pjt.ticketingsystem.core.model.Venue;
import com.pjt.ticketingsystem.core.repository.BookingRepository;
import com.pjt.ticketingsystem.core.repository.TicketRepository;
import com.pjt.ticketingsystem.core.repository.VenueRepository;
import com.pjt.ticketingsystem.login.model.User;
import com.pjt.ticketingsystem.login.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class StripeService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    public StripeService(TicketRepository ticketRepository, @Value("${stripe.secret.key}") String secretKey,
                         BookingRepository bookingRepository, VenueRepository venueRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        Stripe.apiKey = secretKey;
    }

    public StripePaymentIntentResponse createPaymentIntent(Set<Long> ticketIds, Long venueId, Long userId) throws StripeException {
        Venue venue = venueRepository.findById(venueId).orElseThrow(ResourceNotFoundException::new);
        User user = userRepository.findById(userId).orElseThrow(ResourceNotFoundException::new);
        PaymentIntentCreateParams.TransferData transferData =
                PaymentIntentCreateParams.TransferData.builder()
                        .setDestination(venue.getStripeAccountId())
                        .build();

        double baseTotal = calculateBaseTotal(ticketIds);
        Long buyerImpactTotal = calculateBuyerImpactTotal(baseTotal);
        Long buyerImpactPlatformFee = calculateBuyerImpactPlatformFee(buyerImpactTotal, baseTotal);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(buyerImpactTotal)
                .setCurrency("usd")
                .setTransferData(transferData)
                .setCustomer(user.getStripeCustomerId())
                .setApplicationFeeAmount(buyerImpactPlatformFee)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        CustomerSessionCreateParams csParams = CustomerSessionCreateParams.builder()
                .setCustomer(user.getStripeCustomerId()
                )
                .setComponents(CustomerSessionCreateParams.Components.builder().build())
                .putExtraParam("components[payment_element][enabled]", true)
                .putExtraParam(
                        "components[payment_element][features][payment_method_redisplay]",
                        "enabled"
                )
                .putExtraParam(
                        "components[payment_element][features][payment_method_save]",
                        "enabled"
                )
                .putExtraParam(
                        "components[payment_element][features][payment_method_save_usage]",
                        "on_session"
                )
                .putExtraParam(
                        "components[payment_element][features][payment_method_remove]",
                        "enabled"
                )
                .build();

        CustomerSession customerSession = CustomerSession.create(csParams);

        StripePaymentIntentResponse paymentIntentResponse = new StripePaymentIntentResponse();
        paymentIntentResponse.setPaymentIntentId(intent.getId());
        paymentIntentResponse.setClientSecret(intent.getClientSecret());
        paymentIntentResponse.setCustomerSessionClientSecret(customerSession.getClientSecret());

        return paymentIntentResponse;
    }

    public StripePaymentIntentResponse createGuestPaymentIntent(Set<Long> ticketIds, Long venueId) throws StripeException {
        Venue venue = venueRepository.findById(venueId).orElseThrow(ResourceNotFoundException::new);
        PaymentIntentCreateParams.TransferData transferData =
                PaymentIntentCreateParams.TransferData.builder()
                        .setDestination(venue.getStripeAccountId())
                        .build();

        double baseTotal = calculateBaseTotal(ticketIds);
        Long buyerImpactTotal = calculateBuyerImpactTotal(baseTotal);
        Long buyerImpactPlatformFee = calculateBuyerImpactPlatformFee(buyerImpactTotal, baseTotal);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(buyerImpactTotal)
                .setCurrency("usd")
                .setTransferData(transferData)
                .setApplicationFeeAmount(buyerImpactPlatformFee)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        StripePaymentIntentResponse paymentIntentResponse = new StripePaymentIntentResponse();
        paymentIntentResponse.setPaymentIntentId(intent.getId());
        paymentIntentResponse.setClientSecret(intent.getClientSecret());

        return paymentIntentResponse;
    }

    public void refundPayment(Long bookingId, String paymentIntentId) throws StripeException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(BookingNotFoundException::new);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        RefundCreateParams refundParams = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .build();
        Refund refund = Refund.create(refundParams);
        booking.setRefundStatus(RefundStatus.CONFIRMED);
        bookingRepository.save(booking);
    }

    public double calculateBaseTotal(Set<Long> ticketIds) {
        List<Ticket> tickets = ticketRepository.findAllById(ticketIds);
        AtomicReference<Double> totalAmount = new AtomicReference<>((double) 0);
        tickets.forEach(ticket -> totalAmount.updateAndGet(v -> (double) (v + ticket.getPrice())));

        return totalAmount.get();
    }

    public Long calculateBuyerImpactTotal(double baseTotal) {
        // Stripe processing fee: .029 + .30
        // Platform fee: .082 + .60
        double numerator = -(.9 + baseTotal);
        double denominator = -.889;

        double total = numerator/denominator;
        return (Long) (long) (total * 100);
    }

    public Long calculateBuyerImpactPlatformFee(Long amount, double baseTotal) {
        return  amount - (long) baseTotal * 100;
    }

    public StripeOnboardingLinkRepsonse getOnboardingLink(Long userId, String origin) throws StripeException {
        Venue venue = venueRepository.findById(userId).orElseThrow(ResourceNotFoundException::new);
        AccountLinkCreateParams params =
                AccountLinkCreateParams.builder()
                        .setAccount
                                (venue.getStripeAccountId())
                        .setRefreshUrl
                                (origin + "/stripe-reauth")
                        .setReturnUrl
                                (origin + "/payments")
                        .setType
                                (AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                        .build();
        AccountLink accountLink = AccountLink.create(params);
        StripeOnboardingLinkRepsonse response = new StripeOnboardingLinkRepsonse();
        response.setUrl(accountLink.getUrl());
        return response;
    }

    public StripeOnboardingStatus getOnboardingStatus(Long userId) throws StripeException {
        Venue venue = venueRepository.findById(userId).orElseThrow(ResourceNotFoundException::new);
        Account account = Account.retrieve(venue.getStripeAccountId());
        StripeOnboardingStatus status = new StripeOnboardingStatus();
        status.setOnboarded(account.getDetailsSubmitted());
        return status;
    }

    public StripeOnboardingLinkRepsonse getExpressDashboardLink(Long userId) throws StripeException {
        Venue venue = venueRepository.findById(userId).orElseThrow(ResourceNotFoundException::new);
        LoginLinkCreateOnAccountParams params = LoginLinkCreateOnAccountParams.builder().build();
        LoginLink loginLink = LoginLink.createOnAccount(venue.getStripeAccountId(), params);
        StripeOnboardingLinkRepsonse response = new StripeOnboardingLinkRepsonse();
        response.setUrl(loginLink.getUrl());
        return response;
    }

    public StripeConnectSessionResponse getConnectSession(Long userId) throws StripeException {
        Venue venue = venueRepository.findById(userId).orElseThrow(ResourceNotFoundException::new);

        AccountSessionCreateParams params =
                AccountSessionCreateParams.builder()
                        .setAccount(venue.getStripeAccountId())
                        .setComponents(
                                AccountSessionCreateParams.Components.builder()
                                        .setPayments(
                                                AccountSessionCreateParams.Components.Payments.builder()
                                                        .setEnabled(true)
                                                        .setFeatures(
                                                                AccountSessionCreateParams.Components.Payments.Features.builder()
                                                                        .setRefundManagement(true)
                                                                        .setDisputeManagement(true)
                                                                        .setCapturePayments(true)
                                                                        .setDestinationOnBehalfOfChargeManagement(false)
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .setPayouts(
                                                AccountSessionCreateParams.Components.Payouts.builder()
                                                        .setEnabled(true)
                                                        .setFeatures(
                                                                AccountSessionCreateParams.Components.Payouts.Features.builder()
                                                                        .setInstantPayouts(true)
                                                                        .setStandardPayouts(true)
                                                                        .setEditPayoutSchedule(true)
                                                                        .setExternalAccountCollection(true)
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .setNotificationBanner(
                                                AccountSessionCreateParams.Components.NotificationBanner.builder()
                                                        .setEnabled(true)
                                                        .setFeatures(
                                                                AccountSessionCreateParams.Components.NotificationBanner.Features.builder()
                                                                        .setExternalAccountCollection(true)
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .setAccountManagement(
                                                AccountSessionCreateParams.Components.AccountManagement.builder()
                                                        .setEnabled(true)
                                                        .setFeatures(
                                                                AccountSessionCreateParams.Components.AccountManagement.Features.builder()
                                                                        .setExternalAccountCollection(true)
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .build()
                        )
                        .build();

        AccountSession accountSession = AccountSession.create(params);
        StripeConnectSessionResponse response = new StripeConnectSessionResponse();
        response.setClientSecret(accountSession.getClientSecret());
        return response;
    }

    public StripeTotalAndFeeResponse getTotalAndFee(Set<Long> ticketIds) {
        StripeTotalAndFeeResponse response = new StripeTotalAndFeeResponse();
        double baseTotal = calculateBaseTotal(ticketIds);
        if (baseTotal == 0) {
            response.setPlatformFee(0);
            response.setTotal(0);
            return response;
        }
        Long total = calculateBuyerImpactTotal(baseTotal);
        Long platformFee = calculateBuyerImpactPlatformFee(total, baseTotal);

        response.setTotal((double) total / 100);
        response.setPlatformFee((double) platformFee / 100);
        return response;
    }
}