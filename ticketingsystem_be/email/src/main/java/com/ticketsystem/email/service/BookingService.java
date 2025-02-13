package com.ticketsystem.email.service;

import com.ticketsystem.email.dto.BookingConfirmationTemplateData;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {
    public Map<String, Object> mapBookingConfirmationRequest(BookingConfirmationTemplateData templateData) {
        Map<String, Object> model = new HashMap<>();

        model.put("bookingId", templateData.getId());
        model.put("user", templateData.getUser());
        model.put("venue", templateData.getVenue());
        model.put("event", templateData.getEvent());
        model.put("tickets", templateData.getTickets());
        model.put("platformFee", (double) calculateBuyerImpactPlatformFee(
                calculateBuyerImpactTotal(templateData.getTotalPrice()), templateData.getTotalPrice()) / 100
        );
        model.put("totalPrice", (double) calculateBuyerImpactTotal(templateData.getTotalPrice()) / 100);
        model.put("date", templateData.getDate().toLocalDate());

        return model;
    }

    public Map<String, Object> mapGuestBookingConfirmationRequest(BookingConfirmationTemplateData templateData) {
        Map<String, Object> model = new HashMap<>();

        model.put("bookingId", templateData.getId());
        model.put("venue", templateData.getVenue());
        model.put("event", templateData.getEvent());
        model.put("tickets", templateData.getTickets());
        model.put("platformFee", (double) calculateBuyerImpactPlatformFee(
                calculateBuyerImpactTotal(templateData.getTotalPrice()), templateData.getTotalPrice()) / 100
        );
        model.put("totalPrice", (double) calculateBuyerImpactTotal(templateData.getTotalPrice()) / 100);
        model.put("date", templateData.getDate().toLocalDate());

        return model;
    }

    public Long calculateBuyerImpactTotal(double baseTotal) {
        if (baseTotal == 0)
            return 0L;

        // Stripe processing fee: .029 + .30
        // Platform fee: .082 + .60
        double numerator = -(.9 + baseTotal);
        double denominator = -.889;

        double total = numerator/denominator;
        return (Long) (long) (total * 100);
    }

    public Long calculateBuyerImpactPlatformFee(Long amount, double baseTotal) {
        if (baseTotal == 0)
            return 0L;

        return  amount - (long) baseTotal * 100;
    }

    public List<Map<String, Object>> mapTickets(BookingConfirmationTemplateData templateData) {
        List<Map<String, Object>> tickets = new LinkedList<>();

        templateData.getTickets().forEach(ticket -> {
            Map<String, Object> model = new HashMap<>();
            model.put("bookingId", templateData.getId());
            model.put("ticketName", ticket.getName());
            model.put("ticketPrice", ticket.getPrice());
            model.put("ticketToken", ticket.getToken());
            model.put("venue", templateData.getVenue());
            model.put("event", templateData.getEvent());
            String homeURL = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();
            model.put("qrCodeUrl", homeURL + "/qr-code/?&token=" + ticket.getToken());
            tickets.add(model);
        });

        return tickets;
    }
}
