package com.pjt.ticketingsystem.core.controller;

import com.pjt.ticketingsystem.core.dto.*;
import com.pjt.ticketingsystem.core.exception.ResourceNotFoundException;
import com.pjt.ticketingsystem.core.service.StripeService;
import com.pjt.ticketingsystem.util.JwtUtil;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final StripeService stripeService;
    private final JwtUtil jwtUtil;

    public PaymentController(StripeService stripeService, JwtUtil jwtUtil) {
        this.stripeService = stripeService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/stripe/session")
    public ResponseEntity<?> getStripeConnectSession(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        try {
            StripeConnectSessionResponse response = stripeService.getConnectSession(userId);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stripe/express-dashboard")
    public ResponseEntity<?> getStripeExpressDashboardLink(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        try {
            StripeOnboardingLinkRepsonse response = stripeService.getExpressDashboardLink(userId);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stripe/onboarding/status")
    public ResponseEntity<?> getStripeOnboardingStatus(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        try {
            StripeOnboardingStatus response = stripeService.getOnboardingStatus(userId);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stripe/onboarding")
    public ResponseEntity<?> getStripeOnboardingLink(HttpServletRequest request, @RequestHeader("origin") String origin) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        try {
            StripeOnboardingLinkRepsonse response = stripeService.getOnboardingLink(userId, origin);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/stripe/total-and-fee")
    public ResponseEntity<?> getStripeTotalAndFee(@RequestBody StripeTotalAndFeeRequest totalAndFeeRequest) {
        try {
            StripeTotalAndFeeResponse response = stripeService.getTotalAndFee(totalAndFeeRequest.getTicketIds());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/stripe/guest/total-and-fee")
    public ResponseEntity<?> getGuestStripeTotalAndFee(@RequestBody StripeTotalAndFeeRequest totalAndFeeRequest,
                                                       HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        if (!jwtUtil.validateGuestCheckoutToken(token, "GUEST_CHECKOUT")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            StripeTotalAndFeeResponse response = stripeService.getTotalAndFee(totalAndFeeRequest.getTicketIds());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/stripe/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentRequest paymentRequest, HttpServletRequest request) {
        try {
            String authorizationHeader = request.getHeader("Authorization");
            String token = authorizationHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            StripePaymentIntentResponse responseData = stripeService.createPaymentIntent(paymentRequest.getTicketIds(),
                    paymentRequest.getVenueId(), userId);
            return ResponseEntity.ok(responseData);
        } catch(ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Error creating payment intent");
        }
    }

    @PostMapping("/stripe/guest/create-payment-intent")
    public ResponseEntity<?> createGuestPaymentIntent(@RequestBody PaymentRequest paymentRequest, HttpServletRequest request) {
        try {
            String authorizationHeader = request.getHeader("Authorization");
            String token = authorizationHeader.substring(7);
            if (!jwtUtil.validateGuestCheckoutToken(token, "GUEST_CHECKOUT")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            StripePaymentIntentResponse responseData = stripeService.createGuestPaymentIntent(paymentRequest.getTicketIds(),
                    paymentRequest.getVenueId());
            return ResponseEntity.ok(responseData);
        } catch(ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Error creating payment intent");
        }
    }
}
