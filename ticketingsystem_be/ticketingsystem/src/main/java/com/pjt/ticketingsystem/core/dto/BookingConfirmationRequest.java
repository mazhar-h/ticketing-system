package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class BookingConfirmationRequest {
    private String to;
    private String subject;
    private String template;
    private Booking3Dto templateData;
}
