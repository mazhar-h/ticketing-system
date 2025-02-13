package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class Booking4Dto {
    private Long id;
    private String paymentIntentId;
    private String guestEmail;
}
