package com.pjt.ticketingsystem.core.controller;

import com.pjt.ticketingsystem.core.dto.Booking2Dto;
import com.pjt.ticketingsystem.core.dto.Booking3Dto;
import com.pjt.ticketingsystem.core.dto.Booking4Dto;
import com.pjt.ticketingsystem.core.dto.BookingDto;
import com.pjt.ticketingsystem.core.exception.*;
import com.pjt.ticketingsystem.core.service.BookingService;
import com.pjt.ticketingsystem.core.service.StripeService;
import com.pjt.ticketingsystem.util.JwtUtil;
import com.stripe.exception.StripeException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ticketing")
public class BookingController {
    private final BookingService bookingService;
    private final JwtUtil jwtUtil;
    private final StripeService stripeService;

    public BookingController(BookingService bookingService, JwtUtil jwtUtil, StripeService stripeService) {
        this.bookingService = bookingService;
        this.jwtUtil = jwtUtil;
        this.stripeService = stripeService;
    }

    @GetMapping("/bookings/guest/start")
    public ResponseEntity<?> startGuestCheckout() {
        String token = jwtUtil.generateGuestCheckoutToken();
        return ResponseEntity.ok(Map.of("guestCheckoutToken", token));
    }

    @PostMapping("/bookings/guest/reserve")
    public ResponseEntity<?> reserveGuestTickets(@RequestBody BookingDto bookingDto, HttpServletRequest request) {
        try {
            String authorizationHeader = request.getHeader("Authorization");
            String token = authorizationHeader.substring(7);
            String guestTokenId = jwtUtil.getTokenId(token);
            if (!jwtUtil.validateGuestCheckoutToken(token, "GUEST_CHECKOUT")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            Booking2Dto booking2Dto = bookingService.reserveGuestTickets(guestTokenId, bookingDto.getTicketIds());
            return ResponseEntity.ok(booking2Dto);
        } catch (IllegalBookingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (SignatureException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/bookings/guest/confirm")
    public ResponseEntity<?> confirmGuestTickets(@RequestBody Booking4Dto booking4Dto, HttpServletRequest request) {
        try {
            String authorizationHeader = request.getHeader("Authorization");
            String token = authorizationHeader.substring(7);
            String guestTokenId = jwtUtil.getTokenId(token);
            if (!jwtUtil.validateGuestCheckoutToken(token, "GUEST_CHECKOUT")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            Booking3Dto booking = bookingService.validateAndCompleteGuestBooking(booking4Dto.getId(),
                    booking4Dto.getPaymentIntentId(), guestTokenId, booking4Dto.getGuestEmail());
            return ResponseEntity.ok(booking);
        } catch (BookingNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (UnauthorizedBookingException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            String paymentIntentId = booking4Dto.getPaymentIntentId();
            if (paymentIntentId != null) {
                try {
                    stripeService.refundPayment(booking4Dto.getId(), paymentIntentId);
                    bookingService.releaseBooking(booking4Dto.getId());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Booking failed. Payment refunded.");
                } catch (StripeException stripeException) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Booking failed, refund failed: "
                            + stripeException.getMessage());
                }
            }
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/bookings/guest/release")
    public ResponseEntity<?> releaseGuestTickets(@RequestBody Booking2Dto booking2Dto, HttpServletRequest request) {
        try {
            String authorizationHeader = request.getHeader("Authorization");
            String token = authorizationHeader.substring(7);
            if (!jwtUtil.validateGuestCheckoutToken(token, "GUEST_CHECKOUT")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            bookingService.releaseBooking(booking2Dto.getId());
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/bookings/user")
    public ResponseEntity<?> getBookingsForUser(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        List<Booking3Dto> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/bookings/reserve")
    public ResponseEntity<?> reserveTickets(@RequestBody BookingDto bookingDto, HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        try {
            Booking2Dto booking2Dto = bookingService.reserveTickets(userId, bookingDto.getTicketIds());
            return ResponseEntity.ok(booking2Dto);
        } catch (IllegalBookingException e) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/bookings/release")
    public ResponseEntity<?> releaseTickets(@RequestBody Booking2Dto booking2Dto) {
        try {
            bookingService.releaseBooking(booking2Dto.getId());
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/bookings/confirm")
    public ResponseEntity<?> confirmTickets(@RequestBody Booking4Dto booking4Dto, HttpServletRequest request) {
        try {
            String authorizationHeader = request.getHeader("Authorization");
            String token = authorizationHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
           Booking3Dto booking = bookingService.validateAndCompleteBooking(booking4Dto.getId(),
                   booking4Dto.getPaymentIntentId(), userId);
            return ResponseEntity.ok(booking);
        } catch (BookingNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (UnauthorizedBookingException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            String paymentIntentId = booking4Dto.getPaymentIntentId();
            if (paymentIntentId != null) {
                try {
                    stripeService.refundPayment(booking4Dto.getId(), paymentIntentId);
                    bookingService.releaseBooking(booking4Dto.getId());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Booking failed. Payment refunded.");
                } catch (StripeException stripeException) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Booking failed, refund failed: "
                            + stripeException.getMessage());
                }
            }
            return ResponseEntity.noContent().build();
        }
    }
}
