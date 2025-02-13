package com.ticketsystem.email.controller;

import com.ticketsystem.email.dto.*;
import com.ticketsystem.email.service.*;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

@RestController
public class EmailController {

    private final RegistrationService registrationService;
    private final EmailService emailService;
    private final BookingService bookingService;
    private final PdfGeneratorService pdfGeneratorService;
    private final UserService userService;

    public EmailController(RegistrationService registrationService, EmailService emailService,
                           BookingService bookingService, PdfGeneratorService pdfGeneratorService, UserService userService) {
        this.registrationService = registrationService;
        this.emailService = emailService;
        this.bookingService = bookingService;
        this.pdfGeneratorService = pdfGeneratorService;
        this.userService = userService;
    }

    @PostMapping("/email/registered")
    public ResponseEntity<?> sendRegisteredUserEmail(@RequestBody RegisteredUserRequest request) {
        Map<String, Object> model = registrationService.mapRegisteredUserRequest(request.getTemplateData());
        emailService.sendHtmlEmailWithTemplate(request.getTo(), request.getSubject(), request.getTemplate(), model);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/booking-confirmation")
    public ResponseEntity<?> sendBookingConfirmationEmail(@RequestBody BookingConfirmationRequest request) {
        Map<String, Object> model = bookingService.mapBookingConfirmationRequest(request.getTemplateData());
        List<Map<String, Object>> ticketModels = bookingService.mapTickets(request.getTemplateData());
        List<ByteArrayDataSource> ticketPdfs = new LinkedList<>();
        ticketModels.forEach(ticketModel -> {
            ticketPdfs.add(pdfGeneratorService.generatePdfFromHtml("ticket", ticketModel));
        });
        emailService.sendEmailWithAttachment(request.getTo(), request.getSubject(), request.getTemplate(), model,
                ticketPdfs);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/guest-booking-confirmation")
    public ResponseEntity<?> sendGuestBookingConfirmationEmail(@RequestBody BookingConfirmationRequest request) {
        Map<String, Object> model = bookingService.mapGuestBookingConfirmationRequest(request.getTemplateData());
        List<Map<String, Object>> ticketModels = bookingService.mapTickets(request.getTemplateData());
        List<ByteArrayDataSource> ticketPdfs = new LinkedList<>();
        ticketModels.forEach(ticketModel -> {
            ticketPdfs.add(pdfGeneratorService.generatePdfFromHtml("ticket", ticketModel));
        });
        emailService.sendEmailWithAttachment(request.getTo(), request.getSubject(), request.getTemplate(), model,
                ticketPdfs);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/confirm-email")
    public ResponseEntity<?> sendConfirmationEmail(@RequestBody ConfirmEmailRequest request) {
        Map<String, Object> model = userService.mapConfirmEmailRequest(request.getTemplateData());
        emailService.sendHtmlEmailWithTemplate(request.getTo(), request.getSubject(), request.getTemplate(), model);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/forgot-username")
    public ResponseEntity<?> sendForgotUsernameEmail(@RequestBody ForgotUsernameRequest request) {
        Map<String, Object> model = userService.mapForgotUsernameRequest(request.getTemplateData());
        emailService.sendHtmlEmailWithTemplate(request.getTo(), request.getSubject(), request.getTemplate(), model);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/reset-password")
    public ResponseEntity<?> sendForgotUsernameEmail(@RequestBody ForgotPasswordRequest request) {
        Map<String, Object> model = userService.mapResetPasswordRequest(request.getTemplateData());
        emailService.sendHtmlEmailWithTemplate(request.getTo(), request.getSubject(), request.getTemplate(), model);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/verify-email")
    public ResponseEntity<?> sendEmailVerificationEmail(@RequestBody EmailVerificationRequest request) {
        Map<String, Object> model = userService.mapEmailVerificationRequest(request.getTemplateData());
        emailService.sendHtmlEmailWithTemplate(request.getTo(), request.getSubject(), request.getTemplate(), model);
        return ResponseEntity.ok().build();
    }
}
