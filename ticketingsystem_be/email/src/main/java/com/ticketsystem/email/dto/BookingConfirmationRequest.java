package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class BookingConfirmationRequest {
    private String to;
    private String subject;
    private String template;
    private BookingConfirmationTemplateData templateData;
}
